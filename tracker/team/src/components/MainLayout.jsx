import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, Outlet } from 'react-router-dom';
import Navbar from './Navbar'; 

function MainLayout() {

  const navigate = useNavigate();
  const [cookies] = useCookies(['jwt']); // Replace 'jwtToken' with your token's cookie name

  useEffect(() => {
    if (!cookies.jwt) {
      navigate('/login'); // Redirect to login if the cookie is not found
    }
  }, [cookies, navigate]);

  // const [showLoginAlert, setShowLoginAlert] = useState(false);
  // const [cookies, setCookies] = useCookies(['jwt']);

  // useEffect(() => {
  //   const jwtToken = cookies.jwt;

  //   if (!jwtToken) {
  //     console.error('No JWT token found.');
  //     return;
  //   }

  //   try {
  //     const decodedToken = jwtDecode(jwtToken);
  //     console.log('Decoded Token::::::::::::::', decodedToken);

  //     // Check if token is expired
  //     const currentTime = Date.now() / 1000; // current time in seconds
  //     console.log(currentTime)
  //     if (decodedToken.exp < currentTime) {
  //       setShowLoginAlert(true); // Token has expired, show alert
  //       setCookies('jwt', ''); // Optionally clear the JWT cookie
  //       return; // Exit the useEffect if the token is expired
  //     }
  //   } catch (error) {
  //     console.error('Error decoding JWT:', error);
  //   }
  // }, [cookies.jwt]);

  return (
    <div className="flex flex-col h-screen">
      {/* {showLoginAlert && (
        <div className="bg-red-500 text-white p-4 rounded mb-4">
          Your session has expired. Please log in again.
        </div>
      )} */}
      <Navbar />
      <div className="flex-grow overflow-auto bg-white-100 ">
        <Outlet />
      </div>


    </div>
  );
}

export default MainLayout;
