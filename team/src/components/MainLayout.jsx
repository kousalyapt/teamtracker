// src/components/MainLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // Shared Navbar component

function MainLayout() {
  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <div className="flex-grow overflow-auto bg-white-100 ">
        <Outlet /> {/* Renders nested routes here */}
      </div>

      {/* Optional Footer */}
      {/* <footer className="bg-gray-800 text-white text-center py-4">
        © 2024 Team Tracker
      </footer> */}
    </div>
  );
}

export default MainLayout;
