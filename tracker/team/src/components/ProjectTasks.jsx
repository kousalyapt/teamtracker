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
  const [activeFilters, setActiveFilters] = useState([]);
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
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [inviteEmails, setInviteEmails] = useState([]);


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
      let filtered = tasks;
  
      activeFilters.forEach((filter) => {
        if (filter.type === 'label') {
          filtered = filtered.filter((task) =>
            task.labels.some((label) => label.name === filter.value)
          );
        } else if (filter.type === 'state') {
          filtered = filtered.filter((task) => task.state === filter.value);
        } else if (filter.type === 'date_range') {
          filtered = filtered.filter(
            (task) =>
              new Date(task.due_date) >= new Date(filter.value.from) &&
              new Date(task.due_date) <= new Date(filter.value.to)
          );
        } else if (filter.type === 'today'){
          filtered = filtered.filter(
            (task) =>{
              console.log("sed")
              console.log(task.due_date)
              console.log(filter.value)
              console.log("in")
              const taskDate = new Date(task.due_date).toISOString().split('T')[0];
              return taskDate === filter.value;
  
              // new Date(task.due_date) == new Date(filter.value) 
            }
          );
        } else if(filter.type === 'assignee'){
          const assignee = projectMembers.find(
            (member) => member.name === filter.value
          );
          console.log("assignee",assignee)
        
          filtered = filtered.filter((task) => task.assigned_to_id === assignee.id);
        } else if (filter.type === 'assigned_to_you'){
          filtered = filtered.filter((task) => task.assigned_to_id === filter.value);
        }
      });
  
      setFilteredTasks(filtered);
    }, [activeFilters, tasks]);

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
  // const handleApplyDateFilter = () => {
  //   setShowDateRangeDropdown(false);
  //   setFilter('date_range');
  // };


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

  const handleAddFilter = (filter) => {
    setActiveFilters((prevFilters) => [...prevFilters, filter]);
  };

  const handleRemoveFilter = (filterToRemove) => {
    setActiveFilters((prevFilters) =>
      prevFilters.filter(
        (filter) =>
          filter.type !== filterToRemove.type ||
          JSON.stringify(filter.value) !== JSON.stringify(filterToRemove.value)
      )
    );
    console.log("ftr",filterToRemove)
    if (filterToRemove.type === 'assignee'){
      console.log("hd")
      setSelectedAssignee("")
    }
  };

  const handleClearFilters = () => {
    setActiveFilters([]);
    setFromDate('');
    setToDate('');
    setFilteredTasks(tasks); 
  };

  const handleApplyDateFilter = () => {
    handleAddFilter({ type: 'date_range', value: { from: fromDate, to: toDate } });
    setShowDateRangeDropdown(false);
  };

  const handleTaskForToday = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    handleAddFilter({ type: 'today', value: formattedDate});
  }

  const handleAssignee = (assignee_name) => {
    if (assignee_name == ""){
      setSelectedAssignee(assignee_name);
    }else{
    handleAddFilter({ type: 'assignee', value: assignee_name});
    setSelectedAssignee(assignee_name);
    }
  }

  const handleYourTasks = () => {
    const jwtToken = cookies.jwt
    const decodedToken = jwtDecode(jwtToken);
      console.log('Decoded Token:', decodedToken);
      const userId = decodedToken.sub;
    handleAddFilter({ type: 'assigned_for_you', value: userId});
    setFilter('assigned_for_you');
    setShowFilterDropdown(false);
  }

  const togglePopup = () => setIsOpen(!isOpen);

  const handleInviteEmailChange = (e) => {
    setInviteEmails(e.target.value.split(',').map(email => email.trim()));
  };

  const sendInvites = async () => {
    if (inviteEmails.length === 0) {
      alert('Please enter at least one email.');
      return;
    }

    const invalidEmails = inviteEmails.filter(email => !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email));
  if (invalidEmails.length > 0) {
    alert(`Invalid email(s): ${invalidEmails.join(', ')}`);
    return;
  }

  
    try {
      await axios.post(
        `/projects/${id}/invite_members`,
        { emails: inviteEmails },
        {
          headers: {
            Authorization: `${cookies.jwt}`,
          },
        }
      );
      alert('Invites sent successfully.');
      setInviteEmails([]); 
    } catch (error) {
      console.error('Error sending invites:', error);
      alert('Failed to send invites. Please try again.');
    }
  };
  


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
          <button className='font-medium mr-4' onClick={togglePopup}>Invite people</button>
          {isOpen && (
  <>
    
    <div className="fixed inset-0 bg-black opacity-50 z-10" ></div>
    

    
    <div className="fixed inset-0 flex justify-center items-center z-20">
      
      <div className="bg-white  rounded-lg shadow-lg max-w-md w-full">
      <h1 className='text-right cursor-pointer' onClick={togglePopup}>❎</h1>
      <div className='p-6'>
      
        <div className="mb-4">
          
          <label htmlFor="inviteEmails" className="block text-gray-700 font-medium mb-2">
            Invite Members
          </label>
          
          <input
            type="text"
            id="inviteEmails"
            placeholder="Enter emails separated by commas"
            value={inviteEmails.join(',')}
            onChange={handleInviteEmailChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={sendInvites}
            className="bg-blue-500 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-600 mt-4"
          >
            Send Invites
          </button>
        </div>
        </div>
      </div>
    </div>
  </>
)}

            <button onClick={toggleDropdown} className="bg-gray-200 p-2 rounded ">
              More Options
            </button>
            {showDropdown && (
              <div className="absolute bg-white shadow-md rounded border mt-2 z-10">
                <button onClick={() => handleEditProject(project)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
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

      {selectedTab === 'tasks' && (

        <div className="space-y-4 bg-white p-4">

          <div className="flex  ">
            {!showNewTaskForm && !showTaskDetails &&
              <>
                <div className="flex justify-between">
                  <div className="relative">
                   
                  </div>

                </div>
                <button
                  onClick={handleLabelClick}
                  className="bg-gray-100 hover:bg-gray-200 text-black px-4 py-2 border-2 rounded-md ml-40"
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
              ) :
              
              (
                <>
                 

<div className="flex flex-wrap items-center gap-2 mb-4 ml-32">
            {activeFilters.map((filter, index) => (
              <div
                key={index}
                className="flex items-center bg-gray-200 px-3 py-1 rounded-md text-sm text-gray-700"
              >
                <span>
                  {filter.type === 'label'
                    ? `Label: ${filter.value}`
                    : filter.type === 'state'
                      ? `State: ${filter.value}`
                      : filter.type === 'today'
                      ? `Your task for today`
                      : filter.type === 'date_range'
                      ?`Date: ${filter.value.from} to ${filter.value.to}`
                    : filter.type === 'assignee'
                    ?`Assignee: ${filter.value}`
                  : `Assigned to you`}
                </span>
                <button
                  className="ml-2 text-red-500"
                  onClick={() => handleRemoveFilter(filter)}
                >
                  &times;
                </button>
              </div>
            ))}
            <button 
                    // onClick={() => setFilter('all')}
                    className="ml-auto mr-40 bg-gray-100 text-black border-2 px-4 py-2 rounded-md text-sm hover:bg-gray-200 transition"
                    onClick={handleClearFilters}
                    >
                      Clear Filters</button>
          </div>
<div className="bg-gray-100 w-[1000px] mx-auto border-2 mb-0 flex justify-between items-center p-4 rounded-lg shadow-md">
  <div className="flex space-x-4">
    <button
      className="text-gray-800 hover:bg-gray-200 px-4 py-2"
      // onClick={() => setFilter('opened')}
      onClick={() => handleAddFilter({ type: 'state', value: 'opened' })}
    >
      Opened ({getStatusCount('opened')})
    </button>
    <button
      className="text-gray-800 hover:bg-gray-200 px-4 py-2"
      // onClick={() => setFilter('resolved')}
      onClick={() => handleAddFilter({ type: 'state', value: 'resolved' })}
    >
      Resolved ({getStatusCount('resolved')})
    </button>
    <button
      className="text-gray-800  hover:bg-gray-200  px-4 py-2"
      // onClick={() => setFilter('closed')}
      onClick={() => handleAddFilter({ type: 'state', value: 'closed' })}
    >
      Closed ({getStatusCount('closed')})
    </button>
  </div>

 
  <div className="flex items-center relative">
    
    <div >
      <button
        className="hover:bg-gray-200 text-black px-4 py-2 "
        onClick={toggleDateRangeDropdown}
      >
        Filter by Date
      </button>
     
      {showDateRangeDropdown && (
            <div className="absolute mt-2 bg-gray-50 border border-gray-300 rounded-lg shadow-md p-4 z-10">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <label htmlFor="fromDate" className="text-sm font-medium text-gray-600">From:</label>
                  <input
                    type="date"
                    id="fromDate"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full border border-gray-300 text-gray-700 rounded-md px-2 py-1 focus:ring focus:ring-blue-200"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label htmlFor="toDate" className="text-sm font-medium text-gray-600">To:</label>
                  <input
                    type="date"
                    id="toDate"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full border border-gray-300 text-gray-700 rounded-md px-2 py-1 focus:ring focus:ring-blue-200"
                  />
                </div>
                <button
                  onClick={handleApplyDateFilter}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 rounded-md mt-2"
                >
                  Apply Filter
                </button>

              </div>
            </div>
          )}

    </div>

    {/* Label Filter */}
    <div className="relative">
      <button
        className="text-gray-800 hover:bg-gray-200 px-4 py-2 "
        onClick={toggleLabelDropdown}
      >
        Label
      </button>
    
      {showLabelDropdown && (
            <div className="absolute bg-white border rounded shadow-lg z-10">
              {availableLabels.map((label) => (
                <button
                  key={label.id}
                  onClick={() => handleAddFilter({ type: 'label', value: label.name })}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  {label.name}
                </button>
              ))}
            </div>
          )}
    </div>

   
    <select
      id="assignee"
      // onChange={(e) => setFilter(`assignee_${e.target.value}`)}
      value = {selectedAssignee}
      onChange={(e) => handleAssignee(e.target.value)}
      className="border px-4 py-2 text-gray-800 bg-gray-100"
    >
      <option value="">Filter by Assignee</option>
      {projectMembers.map((assignee) => (
        <option key={assignee.id} value={assignee.name}>
          {assignee.name}
        </option>
      ))}
    </select>

    <div className="relative">
      <button
        className=" hover:bg-gray-200 text-black px-4 py-2 "
        onClick={toggleFilterDropdown}
      >
        More Filters
      </button>
      {showFilterDropdown && (
        <div className="absolute right-0 w-48 mt-2 bg-white border rounded-md shadow-lg">
          <button
            className="w-full px-4 py-2 text-left"
            onClick={() => {
              handleYourTasks()
              
            }}
          >
            Everything assigned to you
          </button>
          <button
            className="w-full px-4 py-2 text-left"
            // onClick={() => {
            //   setFilter('your_tasks_for_today');
              
            //   setShowFilterDropdown(false);
            // }}
            onClick={() => {
              handleTaskForToday()
              setShowFilterDropdown(false);}
            }
          >
            Your tasks for today
          </button>
          <button
            className="w-full px-4 py-2 text-left"
            onClick={() => {
              setFilter('all');
              handleClearFilters()
              setShowFilterDropdown(false);
            }}
          >
            Show all tasks
          </button>
        </div>
      )}
    </div>
  </div>
</div>



                  <ul className="space-y-4 mt-0">

                    <div className=" bg-gray-50 w-[1000px] mx-auto ">
                    {filteredTasks.length === 0 ? (
                <div className="text-center bg-gray-50 w-[1000px] h-[300px] mx-auto p-4 border-2 border-gray-40">
                  <p className="font-semibold">No tasks found!</p>
                  <p>Try adjusting your filters or create a new task.</p>
                </div>
              ) : 
                      filteredTasks.map((task) => (
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
