import axios from 'axios';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { createConsumer } from '@rails/actioncable';
import { jwtDecode } from 'jwt-decode';
import { getCable } from '../cable';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [cookies] = useCookies(['jwt']);

  useEffect(() => {
    if (!cookies.jwt) return;

   
    // const cable = createConsumer(`ws://localhost:3000/cable?token=${cookies.jwt}`);
    const cable = getCable(cookies.jwt)
    const decodedToken = jwtDecode(cookies.jwt);
    const userId = decodedToken.sub;
    console.log(cookies.jwt)

   
    const channel = cable.subscriptions.create(
      { channel: 'NotificationChannel', user_id: userId },
      {
        connected() {
          console.log("Connected to NotificationChannel for user:", userId);
        },
        disconnected() {
          console.log("Disconnected from NotificationChannel");
        },
        received(data) {
          console.log("Received Data:", data);
          if (data && data.notification) {
            setNotifications((prevNotifications) => [data.notification, ...prevNotifications]);
          }
        },
      }
    );

    const fetchNotifications = async () => {
      try {
        const headers = { Authorization: `${cookies.jwt}` };
        const response = await axios.get('/notifications', { headers });
        if (response.data) {
          setNotifications(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();

    // Cleanup function to unsubscribe from the channel when the component unmounts
    return () => {
      channel.unsubscribe();
    };
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
