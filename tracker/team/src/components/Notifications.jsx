import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useNotifications } from './NotificationContext';
import { useShowTaskDetails } from './ShowTaskDetailsContext';
import { useNavigate } from 'react-router-dom';
import { TiDeleteOutline } from "react-icons/ti";



const Notifications = () => {
  const [cookies] = useCookies(['jwt']); 
  const { notifications, setNotifications } = useNotifications();
  const { setShowTaskDetails } = useShowTaskDetails();
  const navigate = useNavigate()
  const handleDelete = async(id) => {
    try{
      await axios .delete(`http://localhost:3000/notifications/${id}`,{
        headers: {
          Authorization: `${cookies.jwt}`
        }
      })
      setNotifications(notifications.filter(notification => 
        notification.id !== id 
      ));
    }catch(error){
      console.error('There was an error marking the notification as read!', error);
    }
  }

  const handleClick = async(notification) => {
    if (notification.task_id) {
      try{
        
        const response = await axios .get(`http://localhost:3000/${notification.link}`,{
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
      
      console.log(JSON.stringify(notification))
      
      
      
    }else{
      setShowTaskDetails(null);
    }
    navigate(notification.link);
  }

  const markAsRead = async(id) => {
    console.log('Notification ID:', id);
    console.log("Sending token:", cookies.jwt);
    try{
        const response = await axios.patch(
            `http://localhost:3000/notifications/${id}/mark_as_read`, 
            {}, 
            {
                headers: {
                    Authorization: `${cookies.jwt}` 
                }
            }
        );
       
        console.log(JSON.stringify(response))
        setNotifications(notifications.map(notification => 
            notification.id === id ? { ...notification, read: true } : notification
          ));
    }catch(error){
        console.error('There was an error marking the notification as read!', error);
    }
   
  };

  const handleMarkAllAsRead = async() => {
    try{
      await axios.patch(`http://localhost:3000/notifications/mark_all_as_read`,
        {},
        {
          headers: {
            Authorization: `${cookies.jwt}`
          }
    }
      )
      setNotifications(notifications.map(notification => 
        ({...notification, read: true})
      ));
    }catch(error){
      console.log(error)
    }
  }

  const handleDeleteAll = async() => {
    try{
      await axios.delete(`http://localhost:3000/notifications/delete_all`,
        
        {
          headers: {
            Authorization: `${cookies.jwt}`
          }
        }
      )
      setNotifications([])
    }catch(error){
      console.log(error)
    }
  }

  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-4xl mx-auto">
      <div className='flex justify-between'>
        
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Notifications</h3>
        {notifications.length>0 && 
        <div>
        <button className='mr-4 text-green-800' onClick={()=>handleMarkAllAsRead()}>Mark all as read</button>
        <button onClick={()=> handleDeleteAll()} className='text-red-500'>Clear all</button>
        </div>
        }
        
      </div>
      {notifications.length == 0 && 
      <p>No notifications yet</p>}
    <ul className="space-y-4">
      {notifications.map((notification) => (
        <li key={notification.id} className="bg-gray-100 p-4 rounded-lg shadow-sm hover:bg-gray-50 transition duration-200">
            <div className='flex justify-between items-center'>
            <a onClick={() => handleClick(notification)}>
      <p className='cursor-pointer'>{notification.message}</p>
    </a>
            <button onClick={() => handleDelete(notification.id)} className='text-2xl hover:text-red-500'><TiDeleteOutline/></button>
            </div>
          
          <p className="text-sm text-gray-500">Status: {notification.read ? 'Read' : 'Unread'}</p>
          {!notification.read && (
            <button
              onClick={() => markAsRead(notification.id)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Mark as Read
            </button>
          )}
        </li>
      ))}
    </ul>
  </div>
  
  );
};

export default Notifications;
