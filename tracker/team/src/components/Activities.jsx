import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { useShowTaskDetails } from "./ShowTaskDetailsContext";
import { useNavigate } from "react-router-dom";
import { TiDeleteOutline } from "react-icons/ti";


const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [cookies] = useCookies(["jwt"]);
  const { setShowTaskDetails } = useShowTaskDetails();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const headers = { Authorization: `${cookies.jwt}` };
        const response = await axios.get("/activities", { headers });
        if (response.data) {
          setActivities(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch activities.");
      }
    };
    if (cookies.jwt) {
      fetchActivities();
    }
  }, [cookies.jwt]);

  const handleDeleteActivity = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/activities/${id}`, {
        headers: { Authorization: `${cookies.jwt}` },
      });
      setActivities(activities.filter((activity) => activity.id !== id));
    } catch (error) {
      console.error("Error deleting activity!", error);
    }
  };

  const handleClick = async (activity) => {
    if (activity.task_id) {
      try {
        const response = await axios.get(`http://localhost:3000/${activity.link}`, {
          headers: { Authorization: `${cookies.jwt}` },
        });
        setShowTaskDetails(response.data);
      } catch (error) {
        console.error(error);
      }
    } else {
      setShowTaskDetails(null);
    }
    navigate(activity.link);
  };

  const handleClearButton = async () => {
    try {
      await axios.delete("http://localhost:3000/activities/delete_all", {
        headers: { Authorization: `${cookies.jwt}` },
      });
      setActivities([]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Recent Activities</h2>
        {activities.length > 0 && (
          <button
            className="text-sm  text-red-500 px-4 py-2 rounded-md hover:text-red-800  transition-all duration-200"
            onClick={handleClearButton}
          >
            Clear All
          </button>
        )}
      </div>

      {activities.length === 0 ? (
        <p className="text-gray-500 ml-8 py-4">No recent activities</p>
      ) : (
        <ul className="space-y-3">
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="flex justify-between items-center bg-gray-50 p-3 rounded-md shadow-sm hover:bg-gray-100 transition-all duration-200"
            >
              <p
                className="cursor-pointer text-gray-700 hover:text-blue-600 transition"
                onClick={() => handleClick(activity)}
              >
                {activity.message} 
                <span className="text-sm text-gray-500 block mt-1">
                  {new Date(activity.created_at).toLocaleString()}
                </span>
              </p>
              <button
                className="text-black-100 hover:text-red-500 transition text-2xl"
                onClick={() => handleDeleteActivity(activity.id)}
              >
                <TiDeleteOutline/>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Activities;
