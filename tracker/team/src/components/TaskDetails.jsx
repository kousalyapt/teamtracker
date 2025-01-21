import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import { parseISO, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import NewTaskForm from './NewTaskForm';
import ProjectTasks from './ProjectTasks';
import { DateTime } from 'luxon';
import { useNotifications } from './NotificationContext';
import { useOutletContext } from "react-router-dom";

// { projectId, titleUpdate, setShowTaskDetails, fetchTasks, task }

const TaskDetails = () => {
    // const { id } = useParams();
    // const projectId = id
    // const {  titleUpdate, setShowTaskDetails, fetchTasks, task } = useTask();
    const [showTaskDetails,id,handleTitleUpdate,setShowTaskDetails,fetchTasks] = useOutletContext();
    const task = showTaskDetails
    const projectId = id
    const titleUpdate = handleTitleUpdate
    console.log("Task details received: ", task); 
    console.log("pidd",projectId)
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cookies, setCookies] = useCookies(['jwt']);
    const [taskState, setTaskState] = useState(task.state);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNewTaskForm, setShowNewTaskForm] = useState(false);
    const [assignedToName, setAssignedToName] = useState(null);
    const [taskId, setTaskId] = useState(JSON.stringify(task.id))
    const [taskCreatedAt, setTaskCreatedAt] = useState(JSON.stringify(task.created_at)?.replace(/^"|"$/g, ''))
    const { notifications, setNotifications } = useNotifications();
    console.log(`taskidis ${JSON.stringify(task.created_at)?.trim()}`)
    
    const navigate = useNavigate();
console.log(`tasked ${JSON.stringify(task)}`)
    useEffect(() => {
        fetchComments();
    }, [task.id]);


    const { sub } = jwtDecode(cookies.jwt) || {};
    console.log(`sub${sub}`)

    const handleDeleteComment = async (commentId , e) => {
        e.preventDefault();
        try {
            console.log(`Deleting comment from URL: http://localhost:3000/projects/${projectId}/tasks/${taskId}/comments/${commentId}`);

            await axios.delete(`http://localhost:3000/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, {
                headers: { Authorization: `${cookies.jwt}` },
            });
            //fetchComments()
            setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));
            await fetchComments();
            setShowTaskDetails(true)
            
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    useEffect(() => {
        if (task.assigned_to_id ) {
            fetchAssignee(task.assigned_to_id);
        }
    }, [task.assigned_to_id]); // Only re-fetch if assigned_to_id changes

    const fetchAssignee = async (assignedToId) => {
        try {
            setLoading(true);
            // Fetch the user by assigned_to_id (adjust the API endpoint accordingly)
            const response = await axios.get(`http://localhost:3000/users/${assignedToId}`);
            console.log(`hieee ${JSON.stringify(response.data)}`)
            setAssignedToName(response.data.name); // Assuming the user's name is in response.data.name
            setLoading(false);
        } catch (error) {
            console.error("Error fetching assignee:", error);
            setLoading(false);
        }
    }

    
    const fetchComments = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3000/projects/${projectId}/tasks/${taskId}/comments`, {
                headers: { Authorization: `${cookies.jwt}` },
            });
            // setComments(response.data);
            setComments(response.data.map(comment => ({
    ...comment,
    created_at: new Date(comment.created_at),
})));
            setLoading(false);
        } catch (error) {
            console.error("Error fetching comments:", error);
            setLoading(false);
        }
    };


    const handleEditTask = () => {
        setShowNewTaskForm(true); // Show the form when Edit is clicked
    };

    const handleDeleteTask = async () => {
        try {
            await axios.delete(`http://localhost:3000/projects/${projectId}/tasks/${taskId}`, {
                headers: { Authorization: `${cookies.jwt}` },
            });
            setShowTaskDetails(null)
            fetchTasks();
        
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const handleTaskUpdate = (updatedTask) => {
        console.log(`taskous ${JSON.stringify(task)}`)
        console.log(`updated task ${JSON.stringify(updatedTask)}`)
        setShowNewTaskForm(false); // Hide the form after updating
        setTaskState(updatedTask.state); // Update state if needed
        titleUpdate(updatedTask);
        task.title = updatedTask.title;  // Example of updating task title
        task.description = updatedTask.description;  // Update other fields
        task.due_date = updatedTask.due_date;
        task.estimated_time = updatedTask.estimated_time;
        task.labels = updatedTask.labels.map(label => ({
            id: label.id,
            name: label.name,
            color: label.color,
            created_at: label.created_at,
            updated_at: label.updated_at
          }));
        task.assigned_to_id = updatedTask.assigned_to_id;
      };
      

    const toggleDropdown = () => {
        setShowDropdown((prev) => !prev);
    };


    const handleCommentSubmit = async (e) => {
        if (e) e.preventDefault();
        const sanitizedComment = DOMPurify.sanitize(comment, { ALLOWED_TAGS: [] });
        if (comment.trim()) {
            try {
                const response = await axios.post(`http://localhost:3000/projects/${projectId}/tasks/${taskId}/comments`,
                    {
                        comment: { content: sanitizedComment },
                    },
                    {
                        headers: { Authorization: `${cookies.jwt}` },
                    }
                );


                const newComment = {
                    ...response.data,
                    created_at: new Date(response.data.created_at),
                };
console.log("newcommenttttttttttttttt",newComment)
                setComments((prevComments) => [...prevComments, newComment]);
                setComment('');
                await fetchComments();
            } catch (error) {
                console.error('Error posting comment:', error);
            }
        }
    };

    const getActionButtonLabel = () => {
        const sanitizedComment = DOMPurify.sanitize(comment, { ALLOWED_TAGS: [] });

        if (taskState === "opened") {

            return sanitizedComment.trim() ? "Resolve and Comment" : "Resolve";
        } else if (taskState === "resolved") {
            return sanitizedComment.trim() ? "Comment and Close" : "Close";
        } else {
            return sanitizedComment.trim() ? "Re-Open and Comment" : "Re-Open";
        }
    };

    const handleResolve = async () => {
        try {
            const response = await axios.patch(`http://localhost:3000/projects/${projectId}/tasks/${taskId}/resolve`,{},
                {
                    headers: { Authorization: `${cookies.jwt}` },
                }
            );
            console.log(response)

            //setTaskState(response.data.state); 
            setTaskState(response.data.task.state);
            console.log(`Task successfully updated to: ${task.state}`);
        } catch (error) {
            console.error("Error updating task state:", error);
        }
    }

    const handleClose = async () => {
        try {
            const response = await axios.patch(`http://localhost:3000/projects/${projectId}/tasks/${taskId}/close`,{},
                {
                    headers: { Authorization: `${cookies.jwt}` },
                }
            );
            console.log(response)

            //setTaskState(response.data.state); 
            setTaskState(response.data.task.state);
            console.log(`Task successfully updated to: ${task.state}`);
        } catch (error) {
            console.error("Error updating task state:", error);
        }
    }

    const handleOpen = async () => {
        try {
            const response = await axios.patch(`http://localhost:3000/projects/${projectId}/tasks/${taskId}/open`,{},
                {
                    headers: { Authorization: `${cookies.jwt}` },
                }
            );
            console.log(response)

            //setTaskState(response.data.state); 
            setTaskState(response.data.task.state);
            console.log(`Task successfully updated to: ${task.state}`);
        } catch (error) {
            console.error("Error updating task state:", error);
        }
    }

    const handleActionButtonClick = () => {
        const sanitizedComment = DOMPurify.sanitize(comment, { ALLOWED_TAGS: [] });
        if (taskState === "opened") {
            if (sanitizedComment.trim()) {
                console.log("Resolving task and adding a comment");
                handleResolve();
                handleCommentSubmit();

            } else {
                console.log("Resolving task only");
                handleResolve();
            }
        } else if (taskState === "resolved") {
            if (sanitizedComment.trim()) {
                console.log("Closing task and adding a comment");
                handleClose();
                handleCommentSubmit();
            } else {
                console.log("Closing task only");
                handleClose();
            }
        } else {
            if (sanitizedComment.trim()) {
                console.log("Opening task and adding a comment");
                handleOpen();
                handleCommentSubmit();
            } else {
                console.log("Closing task only");
                handleOpen();
            }
        }
    };



    return (
        <div className="m-0 p-0 ">

            <div className='flex space-x-2 ml-16 m-0 p-0'>


                <div className='p-1'>
                </div>
                <button className='bg-green-500 p-1 rounded '>{taskState}</button>
                {console.log(`tskcrt ${task.created_at}`)}
                {/* <p>Opened {formatDistanceToNow(new Date(task.created_at))} ago by {task.creator_name}</p> */}
                <p>
                    {console.log("hiethisis",taskCreatedAt)}
                    {console.log("taskCreatedAt:", taskCreatedAt)}
{console.log("Parsed Date:", new Date(taskCreatedAt))}

{console.log("Timestamp:", new Date(taskCreatedAt).getTime())}

  {taskCreatedAt && !isNaN(new Date(taskCreatedAt)?.getTime())
    ? `Opened ${formatDistanceToNow(new Date(taskCreatedAt))} ago by ${task.creator_name}`
    : 'Invalid date'}  
   
{/* {console.log("Date object:", new Date(taskCreatedAt))}  // Check this output
{console.log("Formatted date:",new Date(taskCreatedAt).toISOString())} // Check conversion

{taskCreatedAt && new Date(taskCreatedAt).toString() !== 'Invalid Date'
  ? `Opened ${formatDistanceToNow(new Date(taskCreatedAt))} ago by ${task.creator_name}`
  : 'Invalid date'} */}
  {/* const dt = DateTime.fromISO(taskCreatedAt); */}
  {/* {console.log(DateTime.fromISO(taskCreatedAt))}
{DateTime.fromISO(taskCreatedAt).isValid
  ? `Opened ${DateTime.fromISO(taskCreatedAt).toRelative()} ago by ${task.creator_name}`
  : 'Invalid date'} */}

</p>

                <div className="relative pl-160">
                    <button onClick={toggleDropdown} className="bg-gray-200 p-2 rounded ">
                        More Options
                    </button>
                    {showDropdown && (
                        <div className="absolute bg-white shadow-md rounded border mt-2 z-10">
                            <button onClick={handleEditTask} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                Edit
                            </button>
                            <button onClick={handleDeleteTask} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                Delete
                            </button>
                        </div>
                    )}
                </div>

            </div>

            {showNewTaskForm ? (
                <NewTaskForm
                    cookies={cookies}
                    projectId={projectId}
                    taskDetails={task} 
                    // onCancel={() => setShowNewTaskForm(false)} 
                    //onTaskUpdate={() => setShowNewTaskForm(false)}
                    // onCancel={() => setShowNewTaskForm(false)}
                    onTaskUpdate={handleTaskUpdate}
                    taskId = {taskId}
                />
            ) : (

            <form className="grid grid-cols-[3fr,1fr] gap-8 ml-40 mr-40 mt-8">
                <div className="flex flex-col space-y-4 ">

                    <div className="flex flex-col space-y-4 ">
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Comments {comments.length}</h3>
                            <div className="space-y-4">
                                {loading ? (
                                    <p>Loading comments...</p>
                                ) : comments.length > 0 ? (
                                    comments.map((comment) => {
                                        console.log(`commentcreated at ${comment.created_at}`)
                                        const createdAt = new Date(comment.created_at);
                                        const validCreatedAt = !isNaN(createdAt);
                                        const displayDate = validCreatedAt ? createdAt : new Date(comment.comment?.created_at || Date.now());

                                        const content = comment.content || comment.comment.content
                                        return (
                                            <div key={comment.id} className="p-4 border rounded bg-gray-50">
                                                <p>
                                                    <strong>{comment.creator_name}</strong>: {content}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {formatDistanceToNow(displayDate)} ago
                                                </p>
                                                {console.log('Comment ID:', comment.id)}
                                                {console.log(`subid${sub}cretorid${comment.creator_id}`)}
                                                {comment.id && comment.creator_id == sub && (
                                            <button 
                                                onClick={(e) => handleDeleteComment(comment.id, e)}
                                                className="text-red-500 hover:text-red-700 mt-2"
                                            >
                                                Delete
                                            </button>
                                        )}
                                                
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p>No comments available.</p>
                                )}
                            </div>




                        </div>
                        <div className='border-2 p-2 '>
                            <ReactQuill
                                value={comment}
                                onChange={(value) => setComment(value)}
                                className="bg-white rounded h-40"
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={handleActionButtonClick}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-16"
                                >
                                    {getActionButtonLabel()}

                                </button>
                                <button
                                    type="button"
                                    onClick={handleCommentSubmit}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-16"
                                >
                                    Comment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>



                <div className="flex flex-col space-y-4 ">
                    <div className="relative">
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            placeholder="Labels"
                            value={Array.isArray(task.labels) && task.labels.length > 0 ? (
                                task.labels.map((label, index) => (

                                    label.name

                                ))
                            ) : ("No labels available")}
                        />

                    </div>

                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            placeholder="Assignee"
                            value={assignedToName ? assignedToName : "No Assignee"}  
                            readOnly
                        />

                    

                    <input
                        type="number"
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="Estimated Hours"
                        value={task.estimated_time}

                    />
                    <input
                        type="date"
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        value={task.due_date}

                    />
                </div>
            </form>

                        )}                   
        </div>
    );
};

export default TaskDetails;
