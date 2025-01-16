import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [cookies] = useCookies(['jwt']);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const headers = { Authorization: `${cookies.jwt}` };
        const response = await axios.get('/notifications', { headers });
        if (response.data) {
          setNotifications(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch notifications.');
      }
    };
    if (cookies.jwt) {
      fetchNotifications();
    }
  }, [cookies.jwt]);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}


export function useNotifications() {
  return useContext(NotificationContext);
}
