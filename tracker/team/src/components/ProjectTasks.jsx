import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import NewTaskForm from './NewTaskForm';
import TaskDetails from './TaskDetails';
import NewProject from './NewProject';
import { Link, Outlet } from 'react-router-dom';
import { useShowTaskDetails } from './ShowTaskDetailsContext';




const ProjectTasks = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('tasks');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [cookies, setCookies] = useCookies(['jwt']);
  const navigate = useNavigate()
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showLabelDropdown, setShowLabelDropdown] = useState(false);
  const [availableLabels, setAvailableLabels] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [showDateRangeDropdown, setShowDateRangeDropdown] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  // const [showTaskDetails, setShowTaskDetails] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [editProjectMembers, setEditProjectMembers] = useState(null)
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { showTaskDetails, setShowTaskDetails } = useShowTaskDetails();


  console.log("projdetailsssssssssssssssss", project)

  // const handleTaskClick = (taskId) => {
  //   const taskDetails = tasks.find(task => task.id === taskId);
  //   setSelectedTaskDetails(taskDetails);
  // };


  //console.log("iiiiiiiiiiiiii",projectMembers)

  useEffect(() => {
    const fetchProjectMembers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/projects/${id}/members`, {
          headers: { Authorization: `${cookies.jwt}` },
        });
        console.log(response)
        setProjectMembers(response.data.members);
      } catch (error) {
        console.error('Error fetching project members:', error);
      } finally {
        setLoading(false);
      }
    };
    console.log(`projmem ${projectMembers.class}`)
    fetchProjectMembers();
  }, [id, cookies.jwt, isEditMode]);

  useEffect(() => {
    if (selectedTab === 'team_wall') {
      axios.get(`http://localhost:3000/projects/${id}/chat_messages`, {
        headers: { Authorization: `${cookies.jwt}` },
      })
        .then(response => setChatMessages(response.data))
        .catch(error => console.error('Error fetching chat messages:', error));
    }
  }, [selectedTab, id, cookies.jwt]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);


  useEffect(() => {
    const uniqueLabels = new Map();

    tasks.forEach(task => {
      task.labels?.forEach(label => {
        if (!uniqueLabels.has(label.id)) {
          uniqueLabels.set(label.id, label);
        }
      });
    });

    setAvailableLabels(Array.from(uniqueLabels.values()));
  }, [tasks]);


  const toggleLabelDropdown = () => {
    setShowLabelDropdown(!showLabelDropdown);
  };

  const handleLabelFilter = (label) => {
    setFilter(`label_${label.id}`);
    setShowLabelDropdown(false);
  };


  const fetchTasks = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `${cookies.jwt}` };
      const tasksResponse = await axios.get(`http://localhost:3000/projects/${id}/tasks`, { headers });
      setTasks(tasksResponse.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    const jwtToken = cookies.jwt;

    if (!jwtToken) {
      console.error('No JWT token found.');
      return;
    }

    try {
      const decodedToken = jwtDecode(jwtToken);
      console.log('Decoded Token:', decodedToken);
      const userId = decodedToken.sub;
      setCookies('userId', userId);
    } catch (error) {
      console.error('Error decoding JWT:', error);
    }



    const headers = { Authorization: `${jwtToken}` };

    const fetchData = async () => {
      try {
        setLoading(true);

        const projectResponse = await axios.get(`http://localhost:3000/projects/${id}`, { headers });
        setProject(projectResponse.data);

        const tasksResponse = await axios.get(`http://localhost:3000/projects/${id}/tasks`, { headers });
        setTasks(tasksResponse.data);
        await fetchTasks();

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, cookies.jwt]);
  useEffect(() => {
    console.log('Tasks:', tasks);
  }, [tasks]);

  useEffect(() => {
    let filtered = []
    filtered = tasks.filter((task) => {
      const dueDate = new Date(task.due_date);

      const today = new Date();

      const isToday = dueDate.toDateString() === today.toDateString();

      const userId = cookies.userId;


      if (filter.startsWith('label_')) {
        const labelId = parseInt(filter.split('_')[1], 10);
        return task.labels.some((label) => label.id === labelId);
      }

      if (filter.startsWith('assignee_')) {
        const assigneeId = parseInt(filter.split('_')[1], 10);
        return task.assigned_to_id === assigneeId;
      }
      if (filter == 'date_range') {
        console.log(`datarange ${task}`)

        const dueDate = new Date(task.due_date);
        return dueDate >= new Date(fromDate) && dueDate <= new Date(toDate);

      }

      if (filter === 'opened') {
        return task.state === 'opened';
      }

      if (filter === 'resolved') {
        return task.state === 'resolved';
      }

      if (filter === 'closed') {
        return task.state === 'closed';
      }

      if (filter === 'all') {
        return true;
      }
      if (filter === 'assigned_for_you') {
        return task.assigned_to_id === userId;
      }
      if (filter === 'your_tasks_for_today') {
        return task.assigned_to_id === userId && isToday;
      }
      return task;
    });

    setFilteredTasks(filtered);
  }, [filter, tasks, fromDate, toDate, cookies.userId]);

  const toggleDateRangeDropdown = () => {
    setShowDateRangeDropdown(!showDateRangeDropdown);
  };

  const handleTitleUpdate = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === updatedTask.id
          ? { ...task, title: updatedTask.title } 
          : task
      )
    );
  }
  const handleApplyDateFilter = () => {
    setShowDateRangeDropdown(false);
    setFilter('date_range');
  };


  const toggleFilterDropdown = () => {
    setShowFilterDropdown(!showFilterDropdown);
  };

  const handleTaskCreated = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
    setShowNewTaskForm(false);
  };

  const handleLabelClick = () => {

    navigate(`/projects/${id}/labels`);
  };

  const getStatusCount = (status) => {
    return tasks.filter(task => task.state === status).length;
  };

  const handletasktab = () => {
    setSelectedTab('tasks')
    fetchTasks()
    setShowNewTaskForm(false)
    setShowTaskDetails(null)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    axios.post(`http://localhost:3000/projects/${id}/chat_messages`,
      { content: newMessage },
      { headers: { Authorization: `${cookies.jwt}` } }
    )
      .then(response => setChatMessages([...chatMessages, response.data]))
      .catch(error => console.error('Error sending message:', error));

    setNewMessage('');
  };


  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev)
  }

  const handleEditProject = (proj) => {
    setProject(proj)
    setIsEditMode(true)
    setSelectedTab("editProject")


  }
  const handleEditedProject = (updatedProject) => {
    setProject(updatedProject)
    setIsEditMode(false)
    setSelectedTab("tasks")

  }

  const handleTaskClick = (task) => {
    setShowTaskDetails(task)
    navigate(`/projects/${id}/tasks/${task.id}`);
  }

  const handleDeleteProject = async () => {
    try {
      await axios.delete(`http://localhost:3000/projects/${id}`, {
        headers: { Authorization: `${cookies.jwt}` }
      })
    } catch (error) {
      console.error("Error deleting Project:", error);
    }
    navigate('/')

  }

  if (loading) {
    return <div className="text-center text-lg font-semibold text-gray-600 py-4">Loading...</div>;
  }

  if (selectedTab === 'editProject') {
    return (
      <NewProject
        projectData={project}
        projectMembers={projectMembers}
        setIsEditMode={setIsEditMode}
        setSelectedTab={setSelectedTab}
        handleEditedProject={handleEditedProject}
      />
    );
  }

  const contextValue = {

    titleUpdate: handleTitleUpdate,
    setShowTaskDetails,
    fetchTasks,
    task: showTaskDetails

  };

  return (
    <div>



      <div className="rounded-lg p-6 bg-gray-50 ">
        <div className='flex justify-between '>
          <h2 className="text-xl font-semibold text-gray-800 ml-24">{project?.title || 'Project Title'}</h2>
          <div className="relative pl-160">
            <button onClick={toggleDropdown} className="bg-gray-200 p-2 rounded ">
              More Options
            </button>
            {showDropdown && (
              <div className="absolute bg-white shadow-md rounded border mt-2 z-10">
                <button onClick={()=>handleEditProject(project)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  Edit
                </button>
                <button onClick={handleDeleteProject} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  Delete
                </button>
              </div>
            )}
          </div>

        </div>

        <p className="text-gray-600 mt-2 ml-24">{project?.description || 'Project Description'}</p>
      </div>


      <div className="flex bg-gray-50 border-b-1">
        <button
          className={`px-4 py-2 ml-32 ${selectedTab === 'tasks' ? 'bg-white border-t-2 border-red-500' : 'bg-gray-50'}`}
          onClick={() => handletasktab()}
        >
          Tasks
        </button>
        <button
          className={`px-4 py-2 ${selectedTab === 'team_wall' ? 'bg-white border-t-2 border-red-500' : 'bg-gray-50'}`}
          onClick={() => setSelectedTab('team_wall')}
        >
          Team Wall
        </button>
      </div>

      {/* {selectedTab === 'editProject' && (
  <NewProject
    projectData={project} 
    onSubmitSuccess={() => {
      setIsEditMode(false);
      setSelectedTab('tasks');  // Return to tasks view after successful edit
    }} 
  />
)} */}

      {selectedTab === 'tasks' && (

        <div className="space-y-4 bg-white p-4">

          <div className="flex  ">
            {!showNewTaskForm && !showTaskDetails &&
              <>
                <div className="flex justify-between">
                  <div className="relative">
                    <button
                      className="bg-gray-100 hover:bg-gray-200 text-black px-4 py-2 border-2 rounded-md ml-32"
                      onClick={toggleFilterDropdown}
                    >
                      Filter
                    </button>
                    <button onClick={() => setFilter('all')}>Clear Filters</button>

                    {showFilterDropdown && (
                      <div className="absolute right-0 w-48 mt-2 bg-white border-2 rounded-md shadow-lg">
                        <button
                          className="w-full px-4 py-2 text-left"
                          onClick={() => { setFilter('assigned_for_you'); setShowFilterDropdown(false); }}
                        >
                          Everything assigned for you
                        </button>
                        <button
                          className="w-full px-4 py-2 text-left"
                          onClick={() => { setFilter('your_tasks_for_today'); setShowFilterDropdown(false); }}
                        >
                          Your tasks for today
                        </button>
                        <button
                          className="w-full px-4 py-2 text-left"
                          onClick={() => { setFilter('all'); setShowFilterDropdown(false); }}
                        >
                          Show all tasks
                        </button>
                      </div>
                    )}
                  </div>

                </div>
                <button
                  onClick={handleLabelClick}
                  className="bg-gray-100 hover:bg-gray-200 text-black px-4 py-2 border-2 rounded-md ml-8"
                >
                  Manage Labels
                </button>

              </>

            }
            {showTaskDetails && !showNewTaskForm && <div >
              <input
                type="text"
                className="family-robota text-4xl p-0 m-0 ml-24 "
                placeholder="Title"
                value={showTaskDetails.title}

                required
              />

            </div>}
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md  ml-auto mr-40 max-h-10"
              onClick={() => setShowNewTaskForm(!showNewTaskForm)}
            >
              {!showNewTaskForm ? 'New Task' : 'Cancel'}

            </button>
          </div>

          {/* <TaskProvider value={{task: {showTaskDetails}, projectId:{id}, titleUpdate: handleTitleUpdate, setShowTaskDetails:{setShowTaskDetails}, fetchTasks:{fetchTasks}}}> */}
          {selectedTab === 'tasks' && (
            <div className=" bg-white p-4">
              {showNewTaskForm ? (
                <NewTaskForm
                  cookies={cookies}
                  projectId={id}
                  onTaskCreated={handleTaskCreated}
                />
              ) : showTaskDetails ? (
                // <TaskDetails task={showTaskDetails} projectId={id} titleUpdate={handleTitleUpdate} setShowTaskDetails={setShowTaskDetails} fetchTasks={fetchTasks} />
                <Outlet context={[showTaskDetails, id, handleTitleUpdate, setShowTaskDetails, fetchTasks]} />
              ) : filteredTasks.length === 0 ? (
                <div className="text-center bg-gray-50 w-[1000px] h-[300px] mx-auto p-4 border-2 border-gray-40">
                  <p className="font-semibold">No tasks found!</p>
                  <p>Try adjusting your filters or create a new task.</p>
                </div>
              ) : (
                <>
                  <div className="bg-gray-100 w-[1000px] mx-auto border-2 mb-0 flex justify-between items-center p-2">

                    <div className="flex space-x-4">
                      <button
                        className=" text-gray px-4 py-1 rounded-md"
                        onClick={() => setFilter('opened')}>Opened({getStatusCount('opened')})</button>
                      <button
                        className="text-gray px-4 py-1 rounded-md"
                        onClick={() => setFilter('resolved')}>Resolved({getStatusCount('resolved')})</button>
                      <button
                        className="text-gray px-4 py-1 rounded-md"
                        onClick={() => setFilter('closed')}>Closed({getStatusCount('closed')})</button>
                    </div>


                    <div className="flex space-x-4">
                      <div className="flex justify-between">
                        <button
                          className="bg-gray-100 hover:bg-gray-200 text-black px-4 py-2 border-2 rounded-md"
                          onClick={toggleDateRangeDropdown}
                        >
                          Filter by Date
                        </button>

                        {showDateRangeDropdown && (
                          <div className="absolute mt-2 bg-white border-2 rounded-md shadow-lg z-10">
                            <div className="p-4">
                              <label htmlFor="fromDate">From:</label>
                              <input
                                type="date"
                                id="fromDate"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="border px-2 py-1 rounded-md"
                              />
                              <label htmlFor="toDate" className="ml-4">To:</label>
                              <input
                                type="date"
                                id="toDate"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="border px-2 py-1 rounded-md"
                              />
                              <button
                                onClick={handleApplyDateFilter}
                                className="bg-green-500 text-white px-4 py-2 mt-2 rounded-md"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <button
                          className="text-gray-800 px-4 py-1 rounded-md"
                          onClick={toggleLabelDropdown}
                        >
                          Label
                        </button>
                        {showLabelDropdown && (
                          <div className="absolute right-0 w-48 mt-2 bg-white border-2 rounded-md shadow-lg z-10">
                            {availableLabels.map((label) => (
                              <button
                                key={label.id}
                                className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100"
                                onClick={() => handleLabelFilter(label)}
                              >
                                {label.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="assignee-filter">
                        <label htmlFor="assignee">Filter by Assignee:</label>
                        <select
                          id="assignee"
                          onChange={(e) => setFilter(`assignee_${e.target.value}`)}
                        >
                          <option value="">All Assignees</option>
                          {projectMembers.map(assignee => (
                            <option key={assignee.id} value={assignee.id}>
                              {assignee.name}
                            </option>
                          ))}
                        </select>
                      </div>

                    </div>
                  </div>

                  <ul className="space-y-4 mt-0">

                    <div className=" bg-gray-50 w-[1000px] mx-auto ">
                      {filteredTasks.map((task) => (
                        <li key={task.id} className="p-4 bg-white border-2 border-gray-40">
                          <div key={task.id} className="task-item">
                            <h3
                              className="task-title cursor-pointer"
                              onClick={() => handleTaskClick(task)}

                            >
                              {task.title}
                            </h3>
                            {/* {showTaskDetails === task.id && (
                      <TaskDetails task={task}/>
                    )} */}
                          </div>



                          <p className="text-gray-600 mt-1">{task.description}</p>
                          <p className="text-gray-600">Opened {formatDistanceToNow(new Date(task.created_at))} ago by {task.creator_name}</p>
                          <div className="mt-2">
                            {task.labels && task.labels.length > 0 ? (
                              <ul className="flex space-x-2">
                                {task.labels.map((label) => (
                                  <li key={label.id} className=" text-gray-700 px-2 py-1 rounded-md">
                                    <span
                                      className="text-lg font-semibold"
                                      style={{
                                        backgroundColor: label.color,
                                        padding: '5px',
                                        borderRadius: '5px',
                                      }}
                                    >
                                      {label.name}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-500">No labels</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </div>

                  </ul>
                </>
              )}
            </div>
          )}
          {/* </TaskProvider> */}
        </div>
      )}

      {selectedTab === 'team_wall' && (
        // <div className="space-y-4 bg-white p-4">
        //   <h3 className="text-lg font-bold text-gray-800">Team Wall</h3>
        //   <div className="text-center text-gray-600">
        //     <p className="font-semibold">No posts on the Team Wall yet.</p>
        //   </div>
        // </div>
        <div  >
          <div className="space-y-4 bg-white p-4 ">
            <div className="h-80 border rounded p-2 overflow-y-scroll">
              {chatMessages.map((message) => (
                <div key={message.id} className="mb-2">
                  <strong>{message.user.name}:</strong>
                  <span className="ml-2">{message.content}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="mt-2 flex ">
              <input
                type="text"
                className="flex-grow border rounded p-2"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                onClick={handleSendMessage}
                className="ml-2 bg-blue-500 text-white px-4 py-2 rounded "
              >
                Send
              </button>
            </div>
          </div>
        </div>

      )}
    </div>

  );
};


export default ProjectTasks;
