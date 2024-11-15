import React from 'react'
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-gray-600 text-black p-4 flex justify-between items-center">
      <ul>
        <li>Team Tracker</li>
        <li>All Tasks</li>
        <li>My Projects</li>
        <li>Report</li>
        <li>Team Wall</li>
      </ul>
    </nav>
  )
}

export default Navbar