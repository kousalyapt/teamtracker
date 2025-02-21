import React, { useState, useEffect } from 'react';
import { createConsumer } from '@rails/actioncable';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
export default function Notify() {
    const [notifications, setNotifications] = useState([]);
   const [cookies, setCookies] = useCookies(['jwt']);
    useEffect(() => {
        // Connect to the ActionCable server
        const cable = createConsumer('ws://localhost:3000/cable');  // Adjust URL if needed
        console.log("WebSocket connection established", cable);
        const decodedToken = jwtDecode(cookies.jwt);
        console.log('Decoded Token:', decodedToken);
        const userId = decodedToken.sub;
        const channel = cable.subscriptions.create(
            { channel: 'NotificationChannel', user_id: userId },
            {
                received(data) {
                    console.log("Received Data:", data);
                    if (data && data.message) {
                        setNotifications([...notifications, data.message]);
                    }
                },
            }
        );
        console.log("Notifications State: ", notifications);
         console.log("cookies",cookies.jwt)
        
        return () => {
            channel.unsubscribe();
        };
       
    }, [notifications]);
    return (
        <>
            
                <div className='notification-window'>
                    <div className="notification-header">
                        <h2>Notifications</h2>
                      
                    </div>
                    <div className="notifications-container">
                        {notifications.length > 0 ? (
                            notifications.map((notification, index) => (
                                <div className='notifications-list' key={index}>
                                    {notification}
                                </div>
                            ))
                        ) : (
                            <div> {notifications}</div>
                        )
                        }
                    </div>
                </div>
        
        </>
    )
}