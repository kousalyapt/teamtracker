import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';

const Profile = () => {
  const [cookies] = useCookies(['jwt']);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

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
       
        <button onClick={() => setIsEditing(true)} className="bg-indigo-500 text-white px-4 py-2 rounded">
          Edit Profile
        </button>
       
      )}
    </div>
  );
};

export default Profile;
