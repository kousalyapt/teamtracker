

import React, { useState , useEffect} from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';



const TaskDetails = ({ task , projectId}) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [cookies,setCookies] = useCookies(['jwt']);
console.log("taskssss" ,task)
  
  const taskStatus = task.state; 

  useEffect(() => {
    fetchComments();
  }, [task.id]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/projects/${projectId}/tasks/${task.id}/comments`,{
        headers: { Authorization: `${cookies.jwt}` },
      }); 
      setComments(response.data); 
      setLoading(false);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setLoading(false);
    }
  };

  
const handleCommentSubmit = async (e) => {
    e.preventDefault(); 
    const sanitizedComment = DOMPurify.sanitize(comment, { ALLOWED_TAGS: [] });
    if (comment.trim()) {
      try {
        const response = await axios.post(
          `http://localhost:3000/projects/${projectId}/tasks/${task.id}/comments`,
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
  
        setComments((prevComments) => [...prevComments, newComment]); 
        setComment(''); 
      } catch (error) {
        console.error('Error posting comment:', error);
      }
    }
  };
  
  
//   const renderActionButtons = () => {
//     if (taskStatus === 'open') {
//       return (
//         <>
//           <button
//             className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600"
//             onClick={() => console.log('Resolving task')}
//           >
//             Comment + Resolve
//           </button>
//         </>
//       );
//     } else if (taskStatus === 'resolved') {
//       return (
//         <>
//           <button
//             className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
//             onClick={() => console.log('Closing task')}
//           >
//             Close this task
//           </button>
//         </>
//       );
//     }
//   };

  return (
    <div className="m-0 p-0 ">
      
                 <div className='flex space-x-2 ml-16 m-0 p-0'>
                           
                        
                           <div className='p-1'></div>
                           <button className='bg-green-500 p-1 rounded '>{task.state}</button>
                           <p>Opened {formatDistanceToNow(new Date(task.created_at))} ago by {task.creator_name}</p>
                           
                           
                       </div>
                <form className="grid grid-cols-[3fr,1fr] gap-8 ml-40 mr-40 mt-8">
                    <div className="flex flex-col space-y-4 ">
                   
       <div className="flex flex-col space-y-4 ">
       <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Comments</h3>
            <div className="space-y-4">
  {loading ? (
    <p>Loading comments...</p>
  ) : comments.length > 0 ? (
    comments.map((comment) => {
      
      const createdAt = new Date(comment.created_at);
      const validCreatedAt = !isNaN(createdAt);
      const displayDate = validCreatedAt
        ? createdAt
        : new Date(comment.comment?.created_at || Date.now()); 

        const content = comment.content || comment.comment.content
      return (
        <div key={comment.id} className="p-4 border rounded bg-gray-50">
          <p>
            <strong>{comment.creator_name}</strong>: {content}
          </p>
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(displayDate)} ago
          </p>
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
  <div className="flex justify-end"> 
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
                                ) : (
                                "No labels available"
                                )}
            
              
                            />
            
                        </div>
      
                        <select
                            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            value={task.assignee}
                
                        >
               
                        </select>
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
          
        
    </div>
        );
    };

export default TaskDetails;
