import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";

const Profile = () => {
  const [cookies] = useCookies(['jwt']);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [sureDialog, setSureDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {


      try {
        const decodedToken = jwtDecode(cookies.jwt);
              console.log('Decoded Token:', decodedToken);
              const userId = decodedToken.sub;
        const headers = { Authorization: `${cookies.jwt}` };
        const response = await axios.get(`/users/${userId}`, { headers });
        setName(response.data.name);
        setEmail(response.data.email);
      } catch (error) {
        setMessage('Failed to fetch profile. Please try again.');
      }
    };
    fetchProfile();
  }, [cookies.jwt]);

  const handleEdit = async () => {
    try {
        const decodedToken = jwtDecode(cookies.jwt);
              console.log('Decoded Token:', decodedToken);
              const userId = decodedToken.sub;
      const headers = { Authorization: `${cookies.jwt}` };
      const response = await axios.put(`/users/${userId}`, { name, email }, { headers });
      setMessage('Profile updated successfully.');
      setIsEditing(false);
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
    }
  };

  const handleDelete = async() => {
    try {
      const decodedToken = jwtDecode(cookies.jwt);
            console.log('Decoded Token:', decodedToken);
            const userId = decodedToken.sub;
    const headers = { Authorization: `${cookies.jwt}` };
    const response = await axios.delete(`/users`, { headers });
    Cookies.remove('jwt');
    navigate("/register")
    
  } catch (error) {
    setMessage('Failed to delete account. Please try again.');
  }
  }

  const handleSureDialog = () => {
    setSureDialog(!sureDialog)
  } 

  return (
    <div className="p-6 bg-white max-w-md mx-auto mt-10 rounded shadow-md">
      <h1 className="text-xl font-semibold mb-4">Your Profile</h1>
      {message && <div className="mb-4 text-green-500">{message}</div>}
      <div className="mb-4">
        <label className="block text-sm font-medium">Name</label>
        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded p-2 w-full"
          />
        ) : (
          <div className="p-2">{name}</div>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium">Email</label>
        {isEditing ? (
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded p-2 w-full"
          />
        ) : (
          <div className="p-2">{email}</div>
        )}
      </div>
      {isEditing ? (
        <button onClick={handleEdit} className="bg-blue-500 text-white px-4 py-2 rounded">
          Save
        </button>
      ) : (
        <div className='flex'>
        <button onClick={() => setIsEditing(true)} className="bg-indigo-500 text-white px-4 py-2 rounded">
          Edit Profile
        </button>
        <button onClick = {() => handleSureDialog()} className='bg-red-500 text-white px-4 py-2 rounded ml-4'>Delete Account</button>
        {sureDialog && (
  <div className="fixed inset-0 bg-black/50 z-10 flex justify-center items-center">
    <div className="bg-white rounded-lg shadow-lg  w-56 p-6 z-20">
      <h1 className="text-lg font-semibold mb-4 text-center">Are you sure?</h1>
      <div className="flex justify-center space-x-4">
        <button className="px-4 py-2 bg-red-500 text-white rounded cursor-pointer" onClick={handleDelete}>Yes</button>
        <button className="px-4 py-2 bg-gray-300 rounded cursor-pointer" onClick={() => handleSureDialog()}>No</button>
      </div>
    </div>
  </div>
)}

        </div>
      )}
    </div>
  );
};

export default Profile;


