import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, Outlet } from 'react-router-dom';
import Navbar from './Navbar'; 
import Footer from './Footer';

function MainLayout() {

  const navigate = useNavigate();
  const [cookies] = useCookies(['jwt']); // Replace 'jwtToken' with your token's cookie name
 

  useEffect(() => {
    if (!cookies.jwt) {
      navigate('/login'); // Redirect to login if the cookie is not found
    }
  }, [cookies, navigate]);

 

  return (
    <div className="flex flex-col h-screen">
    
      <Navbar/>
      <div className="flex-grow overflow-auto bg-white-100 ">
        <Outlet/>
      </div>
<Footer/>

    </div>
  );
}

export default MainLayout;
