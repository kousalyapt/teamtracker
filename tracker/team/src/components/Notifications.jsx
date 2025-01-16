import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useNotifications } from './NotificationContext';

const Notifications = () => {
 // const [notifications, setNotifications] = useState([]);
  const [cookies] = useCookies(['jwt']); 
  const { notifications, setNotifications } = useNotifications();

  // useEffect(() => {
  //   const fetchNotifications = async() => {
  //       try{
  //           console.log("Sending tokensss:", cookies.jwt);
  //           const response = await axios.get('http://localhost:3000/notifications',{
  //               headers: {Authorization: `${cookies.jwt}`}
  //           })
  //           //console.log(JSON.stringify(response))
  //           setNotifications(response.data)
  //       }catch(error){
  //           console.error('There was an error fetching notifications!', error);
  //       }
  //   }

  //   fetchNotifications();
  //   // const response = await axios.get('http://localhost:3000/notifications')
  //   // axios.get('http://localhost:3000/notifications')
  //   //   .then(response => {
  //   //     console.log(JSON.stringify(response))
  //   //     setNotifications(response.data);
  //   //   })
  //   //   .catch(error => {
  //   //     console.error('There was an error fetching notifications!', error);
  //   //   });
  // }, []);

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

  const markAsRead = async(id) => {
    console.log('Notification ID:', id);
    console.log("Sending token:", cookies.jwt);
    try{
        const response = await axios.patch(
            `http://localhost:3000/notifications/${id}/mark_as_read`, 
            {}, // Empty body
            {
                headers: {
                    Authorization: `${cookies.jwt}` // Correct Authorization format with Bearer token
                }
            }
        );
        // console.log(`http://localhost:3000/notifications/${id}/mark_as_read`)
        // await axios.patch(`http://localhost:3000/notifications/${id}/mark_as_read`,{},{
        //     headers: {Authorization: `Bearer ${cookies.jwt}`}
        // })
        console.log(JSON.stringify(response))
        setNotifications(notifications.map(notification => 
            notification.id === id ? { ...notification, read: true } : notification
          ));
    }catch(error){
        console.error('There was an error marking the notification as read!', error);
    }
    // axios.patch(`http://localhost:3000/notifications/${id}/mark_as_read`,{
    //     headers: {Authorization: `${cookies.jwt}`}
    // })
    //   .then(response => {
    //     setNotifications(notifications.map(notification => 
    //       notification.id === id ? { ...notification, read: true } : notification
    //     ));
    //   })
    //   .catch(error => {
    //     console.error('There was an error marking the notification as read!', error);
    //   });
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-4xl mx-auto">
    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Notifications</h3>
    <ul className="space-y-4">
      {notifications.map((notification) => (
        <li key={notification.id} className="bg-gray-100 p-4 rounded-lg shadow-sm hover:bg-gray-50 transition duration-200">
            <div className='flex justify-content gap-120'>
            <a href={notification.link}>
      <p>{notification.message}</p>
    </a>
            <button onClick={() => handleDelete(notification.id)}>X</button>
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
