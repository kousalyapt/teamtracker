import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


const NewTaskForm = ({ cookies, projectId, onTaskCreated ,taskDetails, onTaskUpdate, taskId}) => {
    const [title, setTitle] = useState(taskDetails ? taskDetails.title : '');
    const [description, setDescription] = useState(taskDetails ? taskDetails.description : '');
    //const [labels, setLabels] = useState(taskDetails ? taskDetails.labels[0].name : '');
    const [labels, setLabels] = useState(taskDetails && taskDetails.labels && taskDetails.labels[0] ? taskDetails.labels[0].name : '');
    const [assignee, setAssignee] = useState(taskDetails ? taskDetails.assigned_to_id : '');
    const [estimatedHours, setEstimatedHours] = useState(taskDetails ? taskDetails.estimated_time : '');
    const [dueDate, setDueDate] = useState(taskDetails ? taskDetails.due_date : '');
    const [availableLabels, setAvailableLabels] = useState([]);  
    const [filteredLabels, setFilteredLabels] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [projectMembers, setProjectMembers] = useState([]); 
    const [isLabelInputFocused, setIsLabelInputFocused] = useState(false); 
    
    // const [isLabelInputFocused, setIsLabelInputFocused] = useState(false);
  console.log(`taskdetailssssssssssss is ${JSON.stringify(taskDetails)}`)

  const handleLabelInputFocus = () => {
    setIsLabelInputFocused(true);
  };

  const handleLabelInputBlur = () => {
    // Small delay to allow click on dropdown before hiding
    setTimeout(() => setIsLabelInputFocused(false), 150);
  };
  
    useEffect(() => {
      const fetchProjectMembers = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`http://localhost:3000/projects/${projectId}/members`, {
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
  
      fetchProjectMembers();
    }, [projectId, cookies.jwt]);
  
  
    useEffect(() => {
      const fetchLabels = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`http://localhost:3000/labels`, {
            headers: { Authorization: `${cookies.jwt}` },
          });
          setAvailableLabels(response.data);
          setFilteredLabels(response.data);  
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
      console.log(`newtaskdata ${JSON.stringify(newTaskData)}`)
      console.log(`label is ${JSON.stringify(labels)}`)
  
      try {
        // const response = await axios.post(
        //   `http://localhost:3000/projects/${projectId}/tasks`,
        //   newTaskData,
        //   {
        //     headers: {
        //       Authorization: `${cookies.jwt}`,
        //     },
        //   }
        // );
  
        // onTaskCreated(response.data);

        const response = taskDetails 
        ? await axios.patch(`http://localhost:3000/projects/${projectId}/tasks/${taskId}`, newTaskData, {
            headers: { Authorization: `${cookies.jwt}` },
        }) 
        : await axios.post(`http://localhost:3000/projects/${projectId}/tasks`, newTaskData, {
            headers: { Authorization: `${cookies.jwt}` },
        });

        console.log(`Response:`, JSON.stringify(response.data));

        if (onTaskCreated ) {
          onTaskCreated(response.data);
          
        }
        if (onTaskUpdate){
          onTaskUpdate(response.data);
        }
      } catch (error) {
        console.error('Error creating task:', error);
      }
    };
  
    
    const handleInputChange = (e) => {
      const value = e.target.value;
      setLabels(value);
  
      const filtered = availableLabels.filter((label) =>
        label.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLabels(filtered);
    };
  
    const handleLabelClick = (labelName) => {
      setLabels(labelName);
      setFilteredLabels([]); 
    };
  
  
    if (loading) {
      return <div>Loading...</div>;
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
      <div className="flex justify-end"> 
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-16"
          >
           {taskDetails ? 'Update Task' : 'Submit New Task'}
          </button>
        </div>
      </div>
      
    </div>
    
   
  
  <div className="flex flex-col space-y-4 ">
          
  <div className="relative">
    <input
      type="text"
      className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
      placeholder="Labels"
      value={labels}
      onChange={handleInputChange}
      onFocus={handleLabelInputFocus}
      onBlur={handleLabelInputBlur}
    />
    {filteredLabels.length > 0 && isLabelInputFocused && (
      <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
        {filteredLabels.map((label) => (
          <li
            key={label.id}
            className="px-3 py-2 cursor-pointer hover:bg-blue-100"
            onMouseDown={() => handleLabelClick(label.name)} // Use onMouseDown to avoid blur before click
          >
            {label.name}
          </li>
        ))}
      </ul>
    )}
  </div>
       <select
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              >
                <option value="">Select Assignee</option>
                {projectMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
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

  export default NewTaskForm;
  