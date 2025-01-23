import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useShowTaskDetails } from './ShowTaskDetailsContext';
import { useNavigate } from 'react-router-dom';


const Activities = () =>  {
  const [activities, setActivities] = useState([]);
  const [cookies] = useCookies(['jwt']); 
  const { setShowTaskDetails } = useShowTaskDetails();
  const navigate = useNavigate()
  console.log("act",activities)
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const headers = { Authorization: `${cookies.jwt}` };
        const response = await axios.get('/activities', { headers });
        if (response.data) {
          setActivities(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch activities.');
      }
    };
    if (cookies.jwt) {
      fetchActivities();
    }
  }, [cookies.jwt]);

  const handleDeleteActivity = async(id) =>{
    try{
      await axios.delete(`http://localhost:3000/activities/${id}`,{
        headers: {
          Authorization: `${cookies.jwt}`
        }
      })
      setActivities(activities.filter(activity => 
        activity.id !== id 
      )); 
    }catch(error){
      console.error('There was an error marking the notification as read!', error);
    }
  }

  const handleClick = async(activity) => {
    if (activity.task_id) {
      // Fetch task details by ID or pass notification.task if it's preloaded
      try{
        
        const response = await axios .get(`http://localhost:3000/${activity.link}`,{
          headers: {
            Authorization: `${cookies.jwt}`
          }
        })
        console.log("hello al")
        console.log(JSON.stringify(response.data))
        console.log("bye al")
        setShowTaskDetails(response.data);
      }catch(error){
        console.log(error)
      }
      
      console.log(JSON.stringify(activity))
      
      
      
    }else{
      setShowTaskDetails(null)
    }
    navigate(activity.link);
  }

  const handleClearButton = async() => {
    try{
      await axios.delete(`http://localhost:3000/activities/delete_all`,
      
    {
      headers: {
        Authorization: `${cookies.jwt}`
      }
    })
    setActivities([])
    }catch(error){
      console.log(error)
    }
  }

  return (
    <div>
      <div className='flex'>
      <div className="text-lg font-bold text-gray-800 mb-2">Activities</div>
      {activities.length > 0 &&
      <button className='mb-2 ml-64 cursor:pointer' onClick={()=> handleClearButton()}>Clear all</button>
      }
      
      </div>
        {activities.length === 0 ? (
        <p>No recent activities</p>
      ) : (
      <ul className="space-y-4 w-100">
        {activities.map(activity => (
          <li key={activity.id} className="bg-gray-100 p-4 rounded-lg shadow-sm hover:bg-gray-50 transition duration-200 flex gap-4" >
            <p className="cursor-pointer"onClick={() => handleClick(activity)}>{activity.message} at {new Date(activity.created_at).toLocaleString()}</p>
           
            <button onClick={() => handleDeleteActivity(activity.id)} >❎</button>
          </li>
        ))}
      </ul>)}
    </div>
  );
}

export default Activities;
