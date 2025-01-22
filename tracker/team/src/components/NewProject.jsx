import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useShowTaskDetails } from './ShowTaskDetailsContext';
import axios from 'axios';

const NewProject = ({projectData, projectMembers, handleEditedProject}) => {
  const [cookies] = useCookies(['jwt']);
  const navigate = useNavigate();
const { setShowTaskDetails } = useShowTaskDetails();
  const [title, setTitle] = useState(projectData ? projectData.title : '');
  const [description, setDescription] = useState(projectData ? projectData.description : '');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState(projectMembers ? projectMembers.map((mem) => mem.email):[]); // Now an array
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
console.log("gggggggggggggg",projectData)
console.log("hhhhhhhhhh",projectMembers)
console.log("mmmmmmmmmmm",handleEditedProject)
  useEffect(() => {
    if (!cookies.jwt) {
      navigate('/login');
    }
  }, [cookies.jwt, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/users', {
          headers: {
            Authorization: `${cookies.jwt}`,
          },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [cookies.jwt]);

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDescriptionChange = (e) => setDescription(e.target.value);

  const handleMemberInputChange = (e) => {
    const value = e.target.value;
    setMemberInput(value);

    if (value.length > 0) {
      setFilteredUsers(users.filter(user => user.email.toLowerCase().startsWith(value.toLowerCase())));
      setIsDropdownVisible(true);
    } else {
      setFilteredUsers([]);
      setIsDropdownVisible(false);
    }
  };

  const handleMemberSelect = (email) => {
    if (!members.includes(email)) {
      setMembers([...members, email]); // Add the selected member to the list
    }
    setMemberInput('');
    setIsDropdownVisible(false);
  };

  const removeMember = (email) => {
    setMembers(members.filter(member => member !== email)); // Remove the selected member
  };

  const handleCancelButton = () => {
    console.log("jjug",projectData)
    
    if (projectData ) {
      handleEditedProject(projectData)
    }else{
      navigate('/')
    }
      
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || members.length === 0) {
      setError('Please fill in all fields');
      return;
    }

    const newProjectData = {
      project: {
        title,
        description,
        member_emails: members, // Use the members array directly
      },
    };
    console.log("xxxxxxxxxxxxx",newProjectData)

    try {
      
      const response = projectData ? await axios.patch(`/projects/${projectData.id}`, newProjectData, {
        headers: {
          Authorization: `${cookies.jwt}`,
        },
      })
      // navigate(`/projects/${response.data.id}/tasks`)
      :await axios.post('/projects', newProjectData, {
        headers: {
          Authorization: `${cookies.jwt}`,
        },
      });
      console.log("lllllllllll",response.data)
      if (!projectData){
        console.log("mee")
        setShowTaskDetails(null)
        navigate(`/projects/${response.data.id}/tasks`);
      }else{
        console.log("mmmemmmmeme",members)
        handleEditedProject(response.data)
      }
      
    } catch (error) {
      console.log("kkk",error)
      setError('Error creating project. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Create a New Project</h2>
        <p className="text-gray-600 mb-6">
          A repository contains all the files for your project, including the revision history.
        </p>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
              Project Name
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter project name"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Enter project description"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              rows="4"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="members" className="block text-gray-700 font-medium mb-2">
              Members
            </label>
            <input
              type="text"
              id="members"
              value={memberInput}
              onChange={handleMemberInputChange}
              placeholder="Enter member emails"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
            />
            {isDropdownVisible && filteredUsers.length > 0 && (
              <ul className="mt-2 border border-gray-300 rounded-md bg-white shadow-md max-h-48 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <li
                    key={user.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleMemberSelect(user.email)}
                  >
                    {user.email}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {members.length > 0 && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Selected Members</label>
              <ul className="list-disc list-inside">
                {members.map((member) => (
                  <li key={member} className="flex justify-between">
                    <span>{member}</span>
                    <button
                      type="button"
                      onClick={() => removeMember(member)}
                      className="text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              className="bg-green-500 text-white font-medium py-2 px-4 rounded-md hover:bg-green-600"
            >
              {projectData? "Update Project" : "Create Project" }
            </button>
            <button
              type="button"
              onClick={handleCancelButton}
              className="bg-gray-500 text-white font-medium py-2 px-4 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProject;
