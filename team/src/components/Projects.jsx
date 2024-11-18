import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const Projects = () => {
  const [projects, setProjects] = useState([]); // All projects fetched from the server
  const [searchQuery, setSearchQuery] = useState(''); // State for search input
  const [cookies] = useCookies(['jwt']); // Get the JWT cookie

  // Fetch projects from the server
  useEffect(() => {
    const headers = {
      Authorization: `${cookies.jwt}` // Send JWT as Bearer token
    };

    axios
      .get('/projects', { headers })
      .then((response) => {
        console.log(response)
        if (response.data) {
            const createdProjects = Array.isArray(response.data.projects_created)
              ? response.data.projects_created.map((project) => ({
                  id: project.id,
                  title: project.title,
                  type: 'created', // Optionally tag the project type
                }))
              : [];
          
            const memberProjects = Array.isArray(response.data.projects_as_member)
              ? response.data.projects_as_member.map((project) => ({
                  id: project.id,
                  title: project.title,
                  type: 'member', // Optionally tag the project type
                }))
              : [];
          
            // Combine both arrays (if needed)
            const allProjects = [...createdProjects, ...memberProjects];
          
            // Store the combined array or process separately as needed
            setProjects(allProjects);
                    
        } else {
          console.error('Invalid response format', response.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching projects:', error);
      });
  }, [cookies.jwt]); // The effect will rerun when the JWT cookie changes

  // Filter projects based on the search query
  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
    <div className="flex flex-col lg:flex-row">
      {/* Optional Sidebar for Activities */}
      <div className="hidden lg:block lg:w-1/4 px-4">
        <div className="bg-gray-50 shadow-md p-4">
          <div className="text-lg font-bold text-gray-800 mb-2">Activities</div>
          {/* Placeholder for activities */}
          <div className="text-gray-500">No recent activities</div>
        </div>
      </div>
      {/* Spacer to push projects section to the extreme right */}
      <div className="flex-1"></div>
      {/* Projects list section */}
      <div className="w-full lg:w-1/4 px-4">
        <div className="bg-gray-50 shadow-md p-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div className="text-lg font-bold text-gray-800">Your Projects</div>
            <Link to="/projects/new">
              <button
                type="button"
                className="bg-green-500 text-white text-sm py-1 px-3 rounded hover:bg-green-600"
                id="Newproject"
              >
                New Project
              </button>
            </Link>
          </div>
          {/* Search bar */}
          <div className="my-4">
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-green-400 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Project list */}
          <div className="mt-0">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="py-1 border-b last:border-b-0 text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  <Link
                    to={`/projects/${project.id}/tasks`}
                    className="text-blue-500 hover:underline"
                  >
                    {project.title}
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">No projects found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  
  );
};

export default Projects;
