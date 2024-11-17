import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { logoutApi } from '../apis/logoutApi';
import { useNavigate } from 'react-router-dom';

function Navbar() {
    const [cookies, setCookie, removeCookie] = useCookies(['jwt']);
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
   
    const handleLogout = async () => {
        const [result, error] = await logoutApi(cookies.jwt);
        if (error !== '') {
            removeCookie('jwt');
            navigate('/login');
        } else {
            removeCookie('jwt');
            navigate('/login');
        }
    };

    const toggleProfileDropdown = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    

    return (
        <nav className="bg-gray-50 text-black p-2 border">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                
                <div className="flex space-x-6">
                <div className="text-xl font-semibold">
                    <Link to="/" >Team Tracker</Link>
                </div>
                    <Link to="/all_task" className="hover:text-indigo-400">All Tasks</Link>
                    <Link to="/projects" className="hover:text-indigo-400">My Projects</Link>
                    <Link to="/projects_reports" className="hover:text-indigo-400">Report</Link>
                    <Link to="/messages" className="hover:text-indigo-400">Team Wall</Link>
                </div>

                {/* Right Section: Notifications & Profile */}
                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <div className="relative">
                        <Link to="/notifications" className="hover:text-indigo-400">Notifications</Link>
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button onClick={toggleProfileDropdown} className="flex items-center">
                            
                            <span className="ml-2">{cookies.user?.name || 'User'}</span>
                        </button>
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-10">
                                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100">
                                    Your Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 text-left"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
