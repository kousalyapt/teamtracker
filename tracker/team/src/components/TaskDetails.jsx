import React, { useState, useEffect, useRef } from 'react';
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
import { MdMoreVert } from "react-icons/md";
import { MdMoreHoriz } from "react-icons/md";
import { getCable } from '../cable';


// { projectId, titleUpdate, setShowTaskDetails, fetchTasks, task }

const TaskDetails = () => {
    // const { id } = useParams();
    // const projectId = id
    // const {  titleUpdate, setShowTaskDetails, fetchTasks, task } = useTask();
    const [showTaskDetails, id, handleTitleUpdate, setShowTaskDetails, fetchTasks] = useOutletContext();
    const task = showTaskDetails
    const projectId = id
    const titleUpdate = handleTitleUpdate
    console.log("Task details received: ", task);
    console.log("pidd", projectId)
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
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [commentDropdown, setCommentDropdown] = useState(null)
    const [editingCommentId, setEditingCommentId] = useState(null);
const [editedCommentContent, setEditedCommentContent] = useState("");
const [newCommentAdded, setNewCommentAdded] = useState(true);
const commentsEndRef = useRef(null);


const scrollToBottom = () => {
    if (newCommentAdded && commentsEndRef.current) {
        commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        setNewCommentAdded(false); 
    }
};

useEffect(() => {
    scrollToBottom();
}, [newCommentAdded]);
  

    const navigate = useNavigate();
    console.log(`tasked ${JSON.stringify(task)}`)
    useEffect(() => {
        fetchComments();
    }, [task.id]);


    const { sub } = jwtDecode(cookies.jwt) || {};
    console.log(`sub${sub}`)

    const handleDeleteComment = async (commentId, e) => {
        e.preventDefault();
        try {
            console.log(`Deleting comment from URL: http://localhost:3000/projects/${projectId}/tasks/${taskId}/comments/${commentId}`);

            await axios.delete(`http://localhost:3000/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, {
                headers: { Authorization: `${cookies.jwt}` },
            });
            //fetchComments()
            setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));
            // await fetchComments();
            setShowTaskDetails(true)
            setCommentDropdown(false)
            setNewCommentAdded(false); 

        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    const handleEditComment = (commentId, content) => {
        
        setEditingCommentId(commentId);
        setEditedCommentContent(content);
        setCommentDropdown(null); 
    };

    const handleSaveEditedComment = async ( commentId, e) => {
        
        if (e) e.preventDefault();
        
        const sanitizedComment = DOMPurify.sanitize(editedCommentContent, { ALLOWED_TAGS: [] });
        if (sanitizedComment.trim()) {
            try {
                const response = await axios.patch(
                    `http://localhost:3000/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
                    {
                        comment: { content: sanitizedComment },
                    },
                    {
                        headers: { Authorization: `${cookies.jwt}` },
                    }
                );
    
                setComments(prevComments => 
                    prevComments.map(comment => 
                        comment.id === commentId ? { ...comment, content: sanitizedComment } : comment
                    )
                );
                setEditingCommentId(null);
                setEditedCommentContent("");
                setNewCommentAdded(false); 
            } catch (error) {
                console.error("Error updating comment:", error);
            }
        }
    };


    
    useEffect(() => {
        if (task.assigned_to_id) {
            fetchAssignee(task.assigned_to_id);
        }
    }, [task.assigned_to_id]);

    const fetchAssignee = async (assignedToId) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3000/users/${assignedToId}`);
            console.log(`hieee ${JSON.stringify(response.data)}`)
            setAssignedToName(response.data.name); 
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

    useEffect(() => {
        if (!cookies.jwt || !taskId) return; // Ensure JWT and task ID are available
    
        const cable = getCable(cookies.jwt); // Get WebSocket connection
        const channel = cable.subscriptions.create(
            { channel: 'CommentsChannel', task_id: taskId },
            {
                connected() {
                    console.log("Connected to nnel for user:", taskId);
                  },
                  disconnected() {
                    console.log("Disconnected from tionChannel");
                  },
                received: (data) => {
                    console.log("New Comment via WebSocket:", data.comment);
                    setComments((prev) => [...prev, data.comment]); // Update comments in real-time
                    setComment('')
                    setNewCommentAdded(true); 
                },
            }
        );
    
        return () => {
            channel.unsubscribe(); // Cleanup WebSocket subscription when component unmounts
        };
    }, [cookies.jwt, taskId]); 

    const handleEditTask = () => {
        setShowNewTaskForm(true); 
        toggleDropdown()
    };

    const handleDeleteTask = async () => {
        try {
            await axios.delete(`http://localhost:3000/projects/${projectId}/tasks/${taskId}`, {
                headers: { Authorization: `${cookies.jwt}` },
            });
            setShowTaskDetails(null)
            fetchTasks();
            toggleDropdown();

        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const handleTaskUpdate = (updatedTask) => {
       
        console.log(`taskous ${JSON.stringify(task)}`)
        console.log(`updated task ${JSON.stringify(updatedTask)}`)
        setShowNewTaskForm(false);
        setTaskState(updatedTask.state); 
        titleUpdate(updatedTask);
        task.title = updatedTask.title; 
        task.description = updatedTask.description;  
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


                // const newComment = {
                //     ...response.data,
                //     created_at: new Date(response.data.created_at),
                // };
                // console.log("newcommenttttttttttttttt", newComment)
                // setComments((prevComments) => [...prevComments, newComment]);
                // setComment('');
                // await fetchComments();
                setNewCommentAdded(true); 
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
            const response = await axios.patch(`http://localhost:3000/projects/${projectId}/tasks/${taskId}/resolve`, {},
                {
                    headers: { Authorization: `${cookies.jwt}` },
                }
            );
            console.log(response)
 
            setTaskState(response.data.task.state);
            console.log(`Task successfully updated to: ${task.state}`);
        } catch (error) {
            console.error("Error updating task state:", error);
        }
    }

    const handleClose = async () => {
        try {
            const response = await axios.patch(`http://localhost:3000/projects/${projectId}/tasks/${taskId}/close`, {},
                {
                    headers: { Authorization: `${cookies.jwt}` },
                }
            );
            console.log(response)

            setTaskState(response.data.task.state);
            console.log(`Task successfully updated to: ${task.state}`);
        } catch (error) {
            console.error("Error updating task state:", error);
        }
    }

    const handleOpen = async () => {
        try {
            const response = await axios.patch(`http://localhost:3000/projects/${projectId}/tasks/${taskId}/open`, {},
                {
                    headers: { Authorization: `${cookies.jwt}` },
                }
            );
            console.log(response)

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


                <div className='px-1'>
                </div>
                <span className={`px-3 py-2 rounded-full text-sm font-medium ${taskState === 'opened' ? 'bg-green-100 text-green-800' : taskState === 'resolved' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {taskState}
                </span>
                <p className="text-gray-600">
                    {/* Opened {formatDistanceToNow(new Date(taskCreatedAt))} ago by {task.creator_name} */}
                    <p className="text-gray-600">
    Opened{" "}
    {isNaN(new Date(taskCreatedAt)) || !taskCreatedAt
        ? "Invalid date"
        : formatDistanceToNow(new Date(taskCreatedAt))}{" "}
    ago by {task.creator_name}
</p>

                </p>

                <div className="relative pl-160">
                    <button onClick={toggleDropdown} className=" p-2 rounded text-2xl pl-24">
                    <MdMoreHoriz />
                    </button>
                    {showDropdown && (
                        <div className='pl-16'>
                        <div className="absolute bg-white shadow-md rounded border z-10">
                            <button onClick={handleEditTask} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                Edit
                            </button>
                            <button onClick={handleDeleteTask} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                Delete
                            </button>
                        </div>
                        </div>
                    )}
                </div>


            </div>
            {!showNewTaskForm && (
                <div className="pt-0 mb-0 ml-24 mt-4">
                    <p className="text-gray-700 font-medium cursor-pointer" onClick={() => setIsDialogOpen(true)}>Description</p>
                    {task.description ?
                        <p className="text-gray-600 truncate cursor-pointer" onClick={() => setIsDialogOpen(true)} title={task.description}>
                             {task.description?.split(" ").slice(0, 5).join(" ")}
                             {task.description?.split(" ").length > 5 && "....."}
                        </p> : <p className='text-gray-600 '>No description</p>}



                    {isDialogOpen && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                                <h2 className="text-lg font-semibold mb-4">Full Description</h2>
                                {task?.description ?
                                    <p className="text-gray-700">{task.description}</p>
                                    : <p className='text-gray-700'>No description</p>
                                }

                                <div className="flex justify-end mt-4">
                                    <button
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                                        onClick={() => setIsDialogOpen(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {showNewTaskForm ? (
                <NewTaskForm
                    cookies={cookies}
                    projectId={projectId}
                    taskDetails={task}
                    onTaskUpdate={handleTaskUpdate}
                    taskId={taskId}
                />
            ) : (

                <form className="grid grid-cols-[3fr,1fr] gap-8 ml-28 mr-40">
                    <div className="flex flex-col space-y-6">
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Comments ({comments.length})</h3>
                            <div className="space-y-4 h-80 border rounded p-2 overflow-y-scroll">
                                {console.log("hello")}
                                {loading ? (
                                    <p className="text-gray-500">Loading comments...</p>
                                ) : comments.length > 0 ? (
                                    comments.map((comment) => {
                                        const createdAt = new Date(comment.created_at);
                                        const validCreatedAt = !isNaN(createdAt);
                                        const displayDate = validCreatedAt ? createdAt : new Date(comment.comment?.created_at || Date.now());
                                        const content = comment.content || comment.comment.content;
                                        const isSender = comment.creator_id == sub || comment.user_id == sub;
                                    
                                        return (
                                            <div key={comment.id} className="flex items-start justify-start">
                                                <div>
                                                    <p className="font-medium">{comment.creator_name ? comment.creator_name : comment.user.name}</p>
                                                    {editingCommentId === comment.id ? (
                                                        <div className="flex flex-col space-y-2">
                                                            <ReactQuill
                                                                value={editedCommentContent}
                                                                onChange={(value) => setEditedCommentContent(value)}
                                                                className="bg-white rounded-lg"
                                                                modules={{
                                                                    toolbar: [
                                                                        [{ header: [1, 2, false] }],
                                                                        ["bold", "italic", "underline", "strike"],
                                                                        [{ list: "ordered" }, { list: "bullet" }],
                                                                        ["link"],
                                                                        ["clean"],
                                                                    ],
                                                                }}
                                                                formats={[
                                                                    "header",
                                                                    "bold",
                                                                    "italic",
                                                                    "underline",
                                                                    "strike",
                                                                    "list",
                                                                    "bullet",
                                                                    "link",
                                                                ]}
                                                            />
                                                            <div className="flex justify-end space-x-2">
                                                                <button
                                                                    onClick={(e) => handleSaveEditedComment(comment.id, e)}
                                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-sm"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingCommentId(null)}
                                                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded-md text-sm"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-between mt-0 max-w-xs p-1 rounded-lg shadow-md bg-gray-200 text-black">
                                                            <div className='mt-2 px-1'>
                                                                <p>{content}</p>
                                                            </div>
                                                            {isSender && (
                                                                <div className='relative'>
                                                                    <MdMoreVert className="ml-4 text-gray-600 text-xl cursor-pointer hover:text-gray-800" onClick={() => setCommentDropdown(commentDropdown === comment.id ? null : comment.id)} />
                                                                    {commentDropdown === comment.id && (
                                                                        <div className="absolute bg-white shadow-md rounded border mt-2 z-10">
                                                                            <button onClick={() => handleEditComment(comment.id, content)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                                                                Edit
                                                                            </button>
                                                                            <button onClick={(e) => handleDeleteComment(comment.id, e)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                                                                Delete
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                   
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        {formatDistanceToNow(displayDate)} ago
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                    
                                ) : (
                                    <p className="text-gray-500">No comments available.</p>
                                )}
                                <div ref={commentsEndRef} />
                            </div>
                        </div>

                        {/* Comment Input Section */}
                        <div className="border rounded-lg p-4 bg-white shadow-sm">
                            <ReactQuill
                                value={comment}
                                onChange={(value) => setComment(value)}
                                className="bg-white rounded-lg"
                                placeholder="Add a comment..."
                                modules={{
                                    toolbar: [
                                        [{ header: [1, 2, false] }],
                                        ["bold", "italic", "underline", "strike"],
                                        [{ list: "ordered" }, { list: "bullet" }],
                                        ["link"],
                                        ["clean"],
                                    ],
                                }}
                                formats={[
                                    "header",
                                    "bold",
                                    "italic",
                                    "underline",
                                    "strike",
                                    "list",
                                    "bullet",
                                    "link",
                                ]}
                            />
                            <div className="flex justify-end space-x-3 mt-4">
                                <button
                                    type="button"
                                    onClick={handleActionButtonClick}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
                                >
                                    {getActionButtonLabel()}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCommentSubmit}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition duration-200"
                                >
                                    Comment
                                </button>
                            </div>
                        </div>
                    </div>


                    <div className="flex flex-col space-y-4 pt-0 mt-0 ml-4">
                        <div >
                            <label className="text-gray-700 font-medium">Labels</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Labels"
                                value={Array.isArray(task.labels) && task.labels.length > 0 ?
                                    task.labels.map(label => label.name).join(", ")
                                    : "No labels available"}
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="text-gray-700 font-medium">Assigned To</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Assignee"
                                value={assignedToName || "No Assignee"}
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="text-gray-700 font-medium">Estimated Time (Hours)</label>
                            <input
                                type="number"
                                className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Estimated Hours"
                                value={task.estimated_time || ""}
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="text-gray-700 font-medium">Due Date</label>
                            <input
                                type="date"
                                className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={task.due_date || ""}
                                readOnly
                            />
                        </div>
                    </div>

                </form>

            )}
        </div>
    );
};

export default TaskDetails;
