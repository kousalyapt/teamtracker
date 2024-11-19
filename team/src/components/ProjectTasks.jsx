// // // 

// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import { useParams } from 'react-router-dom';
// // import { useCookies } from 'react-cookie';

// // const ProjectTasks = () => {
// //   const { id } = useParams();
// //   const [project, setProject] = useState(null);
// //   const [tasks, setTasks] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [cookies] = useCookies(['jwt']); // Assuming you're using react-cookie for JWT

// //   useEffect(() => {
// //     const jwtToken = cookies.jwt;

// //     if (!jwtToken) {
// //       console.error('No JWT token found.');
// //       return;
// //     }

// //     const headers = { Authorization: `${jwtToken}` };

// //     // Fetch project details
// //     axios
// //       .get(`http://localhost:3000/projects/${id}`, { headers })
// //       .then((response) => {
// //         setProject(response.data);
// //       })
// //       .catch((error) => {
// //         console.error('Error fetching project:', error);
// //       })
// //       .finally(() => {
// //         setLoading(false);
// //       });

// //     // Fetch tasks
// //     axios
// //       .get(`http://localhost:3000/projects/${id}/tasks`, { headers })
// //       .then((response) => {
// //         setTasks(response.data);
// //       })
// //       .catch((error) => {
// //         console.error('Error fetching tasks:', error);
// //       });
// //   }, [id, cookies.jwt]);

// //   if (loading) {
// //     return <div className="text-center text-lg font-semibold text-gray-600 py-4">Loading...</div>;
// //   }

// //   return (
// //     <div className="max-w-7xl mx-auto space-y-6">

    
// //       <div className=" rounded-lg p-6 bg-gray-50">
// //         <h2 className="text-xl font-semibold text-gray-800">{project?.title || 'Project Title'}</h2>
// //         <p className="text-gray-600 mt-2">{project?.description || 'Project Description'}</p>
// //       </div>

      
// //       <div className="space-y-4 bg-white max-h-50 p-4">
// //         <div className="flex justify-between items-center">
// //           <h3 className="text-lg font-bold text-gray-800">Tasks</h3>
// //           <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md">
// //             New Task
// //           </button>
// //         </div>

// //         {tasks.length === 0 ? (
// //           <div className="text-center text-gray-600">
// //             <p className="font-semibold">Welcome to Tasks!</p>
// //             <p>
// //               Tasks are used to track todos, bugs, feature requests, and more. To get started, create a new task.
// //             </p>
// //           </div>
// //         ) : (
// //           <ul className="space-y-4">
// //             {tasks.map((task) => (
// //               <li
// //                 key={task.id}
// //                 className="p-4 bg-white shadow-md rounded-lg border border-gray-200"
// //               >
// //                 <h4 className="font-semibold text-gray-800">{task.title}</h4>
// //                 <p className="text-gray-600 mt-1">{task.description}</p>
// //               </li>
// //             ))}
// //           </ul>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default ProjectTasks;


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useParams } from 'react-router-dom';
// import { useCookies } from 'react-cookie';

// const ProjectTasks = () => {
//   const { id } = useParams();
//   const [project, setProject] = useState(null);
//   const [tasks, setTasks] = useState([]);
//   const [teamWall, setTeamWall] = useState([]); // Assuming you have a "team wall" data structure
//   const [loading, setLoading] = useState(true);
//   const [selectedTab, setSelectedTab] = useState('tasks'); // Track selected tab
//   const [cookies] = useCookies(['jwt']); // Assuming you're using react-cookie for JWT

//   useEffect(() => {
//     const jwtToken = cookies.jwt;

//     if (!jwtToken) {
//       console.error('No JWT token found.');
//       return;
//     }

//     const headers = { Authorization: `${jwtToken}` };

//     // Fetch project details
//     axios
//       .get(`http://localhost:3000/projects/${id}`, { headers })
//       .then((response) => {
//         setProject(response.data);
//       })
//       .catch((error) => {
//         console.error('Error fetching project:', error);
//       })
//       .finally(() => {
//         setLoading(false);
//       });

//     // Fetch tasks
//     axios
//       .get(`http://localhost:3000/projects/${id}/tasks`, { headers })
//       .then((response) => {
//         setTasks(response.data);
//       })
//       .catch((error) => {
//         console.error('Error fetching tasks:', error);
//       });

//     // Fetch team wall data (Assuming there's a team wall endpoint)
//     axios
//       .get(`http://localhost:3000/projects/${id}/team_wall`, { headers })
//       .then((response) => {
//         setTeamWall(response.data);
//       })
//       .catch((error) => {
//         console.error('Error fetching team wall:', error);
//       });
//   }, [id, cookies.jwt]);

//   if (loading) {
//     return <div className="text-center text-lg font-semibold text-gray-600 py-4">Loading...</div>;
//   }

//   return (
//     <div className=" ">
//       {/* Project Info */}
//       <div className="rounded-lg p-6 bg-gray-50">
//         <h2 className="text-xl font-semibold text-gray-800 ml-24">{project?.title || 'Project Title'}</h2>
//         <p className="text-gray-600 mt-2 ml-24">{project?.description || 'Project Description'}</p>
        
//       </div>

//       {/* Tab Links */}
//       <div className="flex bg-gray-50 border-b-1">
//         <button
//           className={`px-4 py-2 ml-32  ${selectedTab === 'tasks' ? 'bg-white border-t-2 border-red-500' : 'bg-gray-50'}`}
//           onClick={() => setSelectedTab('tasks')}
//         >
//           Tasks
//         </button>
//         <button
//           className={`px-4 py-2 ${selectedTab === 'team_wall' ? 'bg-white border-t-2 border-red-500' : 'bg-gray-50'}`}
//           onClick={() => setSelectedTab('team_wall')}
//         >
//           Team Wall
//         </button>
//       </div>

//       {/* Conditional Content Rendering */}
//       {selectedTab === 'tasks' && (
//         <div className="space-y-4 bg-white max-h-50 p-4">
//           <div className="flex justify-between items-center">
//             <h3 className="text-lg font-bold text-gray-800">Tasks</h3>
//             <button className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md mr-40">
//               New Task
//             </button>
//           </div>

//           {tasks.length === 0 ? (
//             <div className="text-center bg-gray-50  w-[1000px] h-[300px] mx-auto p-4 border-2 border-gray-40">
//               <p className="font-semibold">Welcome to Tasks!</p>
//               <p>Tasks are used to track todos, bugs, feature requests, and more. To get started, create a new task.</p>
//             </div>
//           ) : (
//             <ul className="space-y-4">
//               {tasks.map((task) => (
//                 <li key={task.id} className="p-4 bg-white shadow-md rounded-lg border border-gray-200">
//                   <h4 className="font-semibold text-gray-800">{task.title}</h4>
//                   <p className="text-gray-600 mt-1">{task.description}</p>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       )}

//       {selectedTab === 'team_wall' && (
//         <div className="space-y-4 bg-white max-h-50 p-4">
//           <h3 className="text-lg font-bold text-gray-800">Team Wall</h3>
//           {/* Assuming teamWall is an array of posts or updates */}
//           {teamWall.length === 0 ? (
//             <div className="text-center text-gray-600">
//               <p className="font-semibold">No posts on the Team Wall yet.</p>
//             </div>
//           ) : (
//             <ul className="space-y-4">
//               {teamWall.map((post) => (
//                 <li key={post.id} className="p-4 bg-white shadow-md rounded-lg border border-gray-200">
//                   <h4 className="font-semibold text-gray-800">{post.title}</h4>
//                   <p className="text-gray-600 mt-1">{post.content}</p>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProjectTasks;


// 

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useParams } from 'react-router-dom';
// import { useCookies } from 'react-cookie';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';
// import { useNavigate } from 'react-router-dom';

// const ProjectTasks = () => {
//   const { id } = useParams();
//   const [project, setProject] = useState(null);
//   const [tasks, setTasks] = useState([]);
//   const [teamWall, setTeamWall] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedTab, setSelectedTab] = useState('tasks');
//   const [showNewTaskForm, setShowNewTaskForm] = useState(false);
//   const [cookies] = useCookies(['jwt']);

//   useEffect(() => {
//     const jwtToken = cookies.jwt;

//     if (!jwtToken) {
//       console.error('No JWT token found.');
//       return;
//     }

//     const headers = { Authorization: `${jwtToken}` };

//     // Fetch project details
//     axios
//       .get(`http://localhost:3000/projects/${id}`, { headers })
//       .then((response) => {
//         setProject(response.data);
//       })
//       .catch((error) => {
//         console.error('Error fetching project:', error);
//       })
//       .finally(() => {
//         setLoading(false);
//       });

//     // Fetch tasks
//     axios
//       .get(`http://localhost:3000/projects/${id}/tasks`, { headers })
//       .then((response) => {
//         setTasks(response.data);
//       })
//       .catch((error) => {
//         console.error('Error fetching tasks:', error);
//       });

//     // Fetch team wall data
//   //   axios
//   //     .get(`http://localhost:3000/projects/${id}/team_wall`, { headers })
//   //     .then((response) => {
//   //       setTeamWall(response.data);
//   //     })
//   //     .catch((error) => {
//   //       console.error('Error fetching team wall:', error);
//   //     });
//    }, [id, cookies.jwt]);

//   if (loading) {
//     return <div className="text-center text-lg font-semibold text-gray-600 py-4">Loading...</div>;
//   }

//   return (
//     <div>
//       {/* Project Info */}
//       <div className="rounded-lg p-6 bg-gray-50">
//         <h2 className="text-xl font-semibold text-gray-800 ml-24">{project?.title || 'Project Title'}</h2>
//         <p className="text-gray-600 mt-2 ml-24">{project?.description || 'Project Description'}</p>
//       </div>

//       {/* Tab Links */}
//       <div className="flex bg-gray-50 border-b-1">
//         <button
//           className={`px-4 py-2 ml-32 ${selectedTab === 'tasks' ? 'bg-white border-t-2 border-red-500' : 'bg-gray-50'}`}
//           onClick={() => setSelectedTab('tasks')}
//         >
//           Tasks
//         </button>
//         <button
//           className={`px-4 py-2 ${selectedTab === 'team_wall' ? 'bg-white border-t-2 border-red-500' : 'bg-gray-50'}`}
//           onClick={() => setSelectedTab('team_wall')}
//         >
//           Team Wall
//         </button>
//       </div>

//       {/* Conditional Content Rendering */}
//       {selectedTab === 'tasks' && (
//         <div className="space-y-4 bg-white p-4">
//           <div className="flex justify-between items-center">
//             <h3 className="text-lg font-bold text-gray-800">Tasks</h3>
//             <button
//               className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md"
//               onClick={() => setShowNewTaskForm(!showNewTaskForm)}
//             >
//               {showNewTaskForm ? 'Cancel' : 'New Task'}
//             </button>
//           </div>

//           {showNewTaskForm ? (
//             <NewTaskForm cookies={cookies} projectId={id}  />
//           ) : tasks.length === 0 ? (
//             <div className="text-center bg-gray-50 w-[1000px] h-[300px] mx-auto p-4 border-2 border-gray-40">
//               <p className="font-semibold">Welcome to Tasks!</p>
//               <p>Tasks are used to track todos, bugs, feature requests, and more. To get started, create a new task.</p>
//             </div>
//           ) : (
//             <ul className="space-y-4">
//               {tasks.map((task) => (
//                 <li key={task.id} className="p-4 bg-white shadow-md rounded-lg border border-gray-200">
//                   <h4 className="font-semibold text-gray-800">{task.title}</h4>
//                   <p className="text-gray-600 mt-1">{task.description}</p>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       )}

//       {selectedTab === 'team_wall' && (
//         <div className="space-y-4 bg-white p-4">
//           <h3 className="text-lg font-bold text-gray-800">Team Wall</h3>
//           {teamWall.length === 0 ? (
//             <div className="text-center text-gray-600">
//               <p className="font-semibold">No posts on the Team Wall yet.</p>
//             </div>
//           ) : (
//             <ul className="space-y-4">
//               {teamWall.map((post) => (
//                 <li key={post.id} className="p-4 bg-white shadow-md rounded-lg border border-gray-200">
//                   <h4 className="font-semibold text-gray-800">{post.title}</h4>
//                   <p className="text-gray-600 mt-1">{post.content}</p>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };



// const NewTaskForm = ({cookies, projectId }) => {
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [labels, setLabels] = useState('');
//   const [assignee, setAssignee] = useState('');
//   const [estimatedHours, setEstimatedHours] = useState('');
//   const [dueDate, setDueDate] = useState('');
//   const [files, setFiles] = useState(null);
//   const navigate = useNavigate();

//   const handleFileChange = (e) => setFiles(e.target.files);

  
//   const handleSubmit = async (e) => {
//     e.preventDefault();
  
//     const newTaskData = {
//       title,
//       description,
//       assigned_to_id: assignee,
//       estimated_time: estimatedHours,
//       due_date: dueDate,
//       labels,
//     };
  
//     try {
//       const response = await axios.post(`/projects/${projectId}/tasks`, newTaskData, {
//         headers: {
//           Authorization: `${cookies.jwt}`,
//         },
//       });
//       // Handle successful task creation
//       console.log('Task created successfully:', response.data)
//       navigate(`/projects/${projectId}/tasks`);
//     } catch (error) {
//       console.error('Error creating task:', error);
//       // Display error message or handle errors
//     }
//   };
  

//   return (
//     <form className="space-y-6 grid grid-cols-2 gap-6" onSubmit={handleSubmit}>
//       {/* Left Section */}
//       <div className="space-y-4">
//         {/* Task Title */}
//         <div>
//           <input
//             type="text"
//             className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
//             placeholder="Task Title"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             required
//           />
//         </div>

//         {/* Task Description */}
//         <div>
//           <label className="block text-gray-700 mb-2">Task Description</label>
//           <ReactQuill
//             value={description}
//             onChange={setDescription}
//             className="bg-white rounded"
//           />
//         </div>

//         {/* Attach Files */}
//         <div>
//           <label className="block text-gray-700 mb-2">Attach Files</label>
//           <input
//             type="file"
//             multiple
//             onChange={handleFileChange}
//             className="w-full border rounded"
//           />
//         </div>

//         {/* Buttons */}
//         <div className="flex space-x-4">
//           <button
//             type="submit"
//             className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
//           >
//             Submit New Task
//           </button>
//           <button
//             type="button"
//             onClick={() => console.log('Cancel clicked')} // Replace with cancel logic
//             className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>

//       {/* Right Section */}
//       <div className="space-y-4">
//         {/* Labels */}
//         <div>
//           <input
//             type="text"
//             className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
//             placeholder="Labels"
//             value={labels}
//             onChange={(e) => setLabels(e.target.value)}
//           />
//         </div>

//         {/* Assignee */}
//         <div>
//           <input
//             type="text"
//             className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
//             placeholder="Assignee"
//             value={assignee}
//             onChange={(e) => setAssignee(e.target.value)}
//           />
//         </div>

//         {/* Estimated Hours */}
//         <div>
//           <input
//             type="number"
//             className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
//             placeholder="Estimated Hours"
//             value={estimatedHours}
//             onChange={(e) => setEstimatedHours(e.target.value)}
//           />
//         </div>

//         {/* Due Date */}
//         <div>
//           <label className="block text-gray-700 mb-2">Due Date</label>
//           <input
//             type="date"
//             className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
//             value={dueDate}
//             onChange={(e) => setDueDate(e.target.value)}
//           />
//         </div>
//       </div>
//     </form>
//   );
// };
// export default ProjectTasks;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';


const ProjectTasks = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('tasks');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [cookies] = useCookies(['jwt']);
  const navigate = useNavigate()

  useEffect(() => {
    const jwtToken = cookies.jwt;

    if (!jwtToken) {
      console.error('No JWT token found.');
      return;
    }

    const headers = { Authorization: `${jwtToken}` };

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch project details
        const projectResponse = await axios.get(`http://localhost:3000/projects/${id}`, { headers });
        setProject(projectResponse.data);

        // Fetch tasks
        const tasksResponse = await axios.get(`http://localhost:3000/projects/${id}/tasks`, { headers });
        setTasks(tasksResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, cookies.jwt]);

  const handleTaskCreated = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
    setShowNewTaskForm(false);
  };

  const handleLabelClick = () => {
    // Navigate to the label creation page using navigate
    navigate(`/projects/${id}/labels`);
  };

  if (loading) {
    return <div className="text-center text-lg font-semibold text-gray-600 py-4">Loading...</div>;
  }

  return (
    <div>
      {/* Project Info */}
      <div className="rounded-lg p-6 bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-800 ml-24">{project?.title || 'Project Title'}</h2>
        <p className="text-gray-600 mt-2 ml-24">{project?.description || 'Project Description'}</p>
      </div>

      {/* Tab Links */}
      <div className="flex bg-gray-50 border-b-1">
        <button
          className={`px-4 py-2 ml-32 ${selectedTab === 'tasks' ? 'bg-white border-t-2 border-red-500' : 'bg-gray-50'}`}
          onClick={() => setSelectedTab('tasks')}
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

      {/* Conditional Content Rendering */}
      {selectedTab === 'tasks' && (
        <div className="space-y-4 bg-white p-4">
          
          <div className="flex ">
          <button
            className="bg-gray-100 hover:bg-gray-200 text-black px-4 py-2 border-2 rounded-md ml-40"
          >
            Filter
          </button>
          <button
            onClick={handleLabelClick}
            className="bg-gray-100 hover:bg-gray-200 text-black px-4 py-2 border-2 rounded-md ml-8"
          >
            Manage Labels
          </button>
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md  ml-auto mr-40"
              onClick={() => setShowNewTaskForm(!showNewTaskForm)}
            >
              {showNewTaskForm ? 'Cancel' : 'New Task'}
            </button>
          </div>

          {showNewTaskForm ? (
            <NewTaskForm
              cookies={cookies}
              projectId={id}
              onTaskCreated={handleTaskCreated}
            />
          ) : tasks.length === 0 ? (
            <div className="text-center bg-gray-50 w-[1000px] h-[300px] mx-auto p-4 border-2 border-gray-40">
              <p className="font-semibold">Welcome to Tasks!</p>
              <p>Tasks are used to track todos, bugs, feature requests, and more. To get started, create a new task.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              <div className=" bg-gray-50 w-[1000px] mx-auto">
              {tasks.map((task) => (
                <li key={task.id} className="p-4 bg-white border-2 border-gray-40">
                  <h4 className="font-semibold text-gray-800">{task.title}</h4>
                  <p className="text-gray-600 mt-1">{task.description}</p>
                  <p className='text-gray-600'>Opened {formatDistanceToNow(new Date(task.created_at))} ago by {task.creator_name}</p>
                  {/* <p className='text-gray-600'>Created by {task.creator_name}</p>
                  <p>Created {formatDistanceToNow(new Date(task.created_at))} ago</p>
                  <p>{console.log("Task created at:", task.created_at)}</p> 
                  <p>{console.log("Parsed Date:", new Date(task.created_at))}</p> */}
                  <div className="mt-2">
          {task.labels && task.labels.length > 0 ? (
            <ul className="flex space-x-2">
              {task.labels.map((label) => (
                <li key={label.id} className=" text-gray-700 px-2 py-1 rounded-md">
                  <span
                className="text-lg font-semibold"
                style={{ backgroundColor: label.color, padding: '5px', borderRadius: '5px' }} // Apply color to label background
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
          )}
        </div>
      )}

      {selectedTab === 'team_wall' && (
        <div className="space-y-4 bg-white p-4">
          <h3 className="text-lg font-bold text-gray-800">Team Wall</h3>
          <div className="text-center text-gray-600">
            <p className="font-semibold">No posts on the Team Wall yet.</p>
          </div>
        </div>
      )}
    </div>
  );
};

const NewTaskForm = ({ cookies, projectId, onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [labels, setLabels] = useState('');
  const [assignee, setAssignee] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [availableLabels, setAvailableLabels] = useState([]);  // List of labels for the project
  const [filteredLabels, setFilteredLabels] = useState([]); 
  const [loading, setLoading] = useState(true);
  // const [isLabelInputFocused, setIsLabelInputFocused] = useState(false);

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/labels`, {
          headers: { Authorization: `${cookies.jwt}` },
        });
        setAvailableLabels(response.data);
        setFilteredLabels(response.data);  // Initialize filtered labels with all available labels
      } catch (error) {
        console.error('Error fetching labels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLabels();
  }, [projectId, cookies.jwt]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sanitizedDescription = DOMPurify.sanitize(description, { ALLOWED_TAGS: [] });
    const newTaskData = {
      title,
      description: sanitizedDescription,
      assigned_to_id: assignee,
      estimated_time: estimatedHours,
      due_date: dueDate,
      label_ids: [labels],
    };

    try {
      const response = await axios.post(
        `http://localhost:3000/projects/${projectId}/tasks`,
        newTaskData,
        {
          headers: {
            Authorization: `${cookies.jwt}`,
          },
        }
      );

      // Handle successful task creation
      onTaskCreated(response.data);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLabels(value);

    // Filter the available labels based on the input value
    const filtered = availableLabels.filter((label) =>
      label.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredLabels(filtered);
  };

  const handleLabelClick = (labelName) => {
    // When a label is clicked, set it as the value in the input
    setLabels(labelName);
    setFilteredLabels([]); 
    // setIsLabelInputFocused(false);
  };

  // const handleLabelInputFocus = () => {
  //   setIsLabelInputFocused(true); // Show dropdown on input focus
  // };

  // const handleLabelInputBlur = () => {
  //   // Delay hiding dropdown slightly to allow for label click
  //   setTimeout(() => setIsLabelInputFocused(false), 200);
  // };

  if (loading) {
    return <div>Loading labels...</div>;
  }

  return (
    <form className="grid grid-cols-[3fr,1fr] gap-8 ml-40 mr-40" onSubmit={handleSubmit}>
  <div className="flex flex-col space-y-4 ">
    <div className='border-2 p-2 '>
    <input
      type="text"
      className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 mb-2"
      placeholder="Task Title"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      required
    />
    <ReactQuill
      value={description}
      onChange={setDescription}
      className="bg-white rounded h-40"
    />
    <div className="flex justify-end"> {/* Make this a flex container */}
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-16"
        >
          Submit New Task
        </button>
      </div>
    </div>
    
  </div>
  
  {/* <div className="flex flex-col space-y-4 "> */}
    {/* <input
      type="text"
      className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
      placeholder="Labels"
      value={labels}
      onChange={(e) => setLabels(e.target.value)}
    /> */}

<div className="flex flex-col space-y-4 ">
        <div className="relative">
          {/* Label Input Field */}
          <input
            type="text"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Labels"
            value={labels}
            onChange={handleInputChange}
            // onFocus={handleLabelInputFocus}
            // onBlur={handleLabelInputBlur} 
          />
          {/* Label Dropdown */}
          { filteredLabels.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              {filteredLabels.map((label) => (
                <li
                  key={label.id}
                  className="px-3 py-2 cursor-pointer hover:bg-blue-100"
                  onClick={() => handleLabelClick(label.name)} // Set the label when clicked
                >
                  {label.name}
                </li>
              ))}
            </ul>
          )}
        </div>
    <input
      type="text"
      className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
      placeholder="Assignee"
      value={assignee}
      onChange={(e) => setAssignee(e.target.value)}
    />
    <input
      type="number"
      className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
      placeholder="Estimated Hours"
      value={estimatedHours}
      onChange={(e) => setEstimatedHours(e.target.value)}
    />
    <input
      type="date"
      className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
      value={dueDate}
      onChange={(e) => setDueDate(e.target.value)}
    />
  </div>
</form>

  );
};

export default ProjectTasks;
