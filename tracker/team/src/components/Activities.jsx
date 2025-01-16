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

  return (
    <div>
        {activities.length === 0 ? (
        <p>No recent activities</p>
      ) : (
      <ul className="space-y-4">
        {activities.map(activity => (
          <li key={activity.id} className="bg-gray-100 p-4 rounded-lg shadow-sm hover:bg-gray-50 transition duration-200">
            {activity.message} at {new Date(activity.created_at).toLocaleString()}
          </li>
        ))}
      </ul>)}
    </div>
  );
}

export default Activities;
