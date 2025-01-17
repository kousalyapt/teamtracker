import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const Activities = () =>  {
  const [activities, setActivities] = useState([]);
  const [cookies] = useCookies(['jwt']); 
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

  return (
    <div>
        {activities.length === 0 ? (
        <p>No recent activities</p>
      ) : (
      <ul className="space-y-4 w-100">
        {activities.map(activity => (
          <li key={activity.id} className="bg-gray-100 p-4 rounded-lg shadow-sm hover:bg-gray-50 transition duration-200 flex gap-4">
            <p>{activity.message} at {new Date(activity.created_at).toLocaleString()}</p>
           
            <button onClick={() => handleDeleteActivity(activity.id)} >❎</button>
          </li>
        ))}
      </ul>)}
    </div>
  );
}

export default Activities;
