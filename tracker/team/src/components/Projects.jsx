import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import Activities from './Activities';
import ReactPaginate from 'react-paginate';
import { useShowTaskDetails } from './ShowTaskDetailsContext';

const Projects = () => {
  const [projects, setProjects] = useState([]); 
  const [searchQuery, setSearchQuery] = useState(''); 
  const [cookies] = useCookies(['jwt']);
  const [currentPage, setCurrentPage] = useState(1);
  const { setShowTaskDetails } = useShowTaskDetails();
  const itemsPerPage = 6;  
  
  console.log("fin",projects)

  useEffect(() => {
    const headers = {
      Authorization: `${cookies.jwt}` 
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
                  type: 'created', 
                }))
              : [];
          
            const memberProjects = Array.isArray(response.data.projects_as_member)
              ? response.data.projects_as_member.map((project) => ({
                  id: project.id,
                  title: project.title,
                  type: 'member', 
                }))
              : [];
      
              const allProjects = [...createdProjects, ...memberProjects].reduce((uniqueProjects, project) => {
                if (!uniqueProjects.some(existingProject => existingProject.id === project.id)) {
                  uniqueProjects.push(project);
                }
                return uniqueProjects;
              }, []);
        
            setProjects(allProjects);
                    
        } else {
          console.error('Invalid response format', response.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching projects:', error);
      });
  }, [cookies.jwt]); 

  const handleTitleClick = () => {
    setShowTaskDetails(null)
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Calculate total pages
  

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastProject = currentPage * itemsPerPage;
  const indexOfFirstProject = indexOfLastProject - itemsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  return (
    <div className="container mx-auto p-4">
    <div className="flex flex-col lg:flex-row">
      <div className="hidden lg:block lg:w-1/2 px-4">
        <div>
          <div className="text-lg font-bold text-gray-800 mb-2">Activities</div>
          <Activities/>
        </div>
      </div>
      <div className="flex-1"></div>
      <div className="w-full lg:w-1/4 px-4">
        <div className="bg-gray-50 shadow-md p-6  ">
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
          <div className="my-4">
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-green-400 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="mt-0">
            {currentProjects.length > 0 ? (
              currentProjects.map((project) => (
                <div
                  key={project.id}
                  className="py-1 border-b last:border-b-0 text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  <Link
                    to={`/projects/${project.id}/tasks`}
                    className="text-blue-500 hover:underline"
                    onClick = {()=> {handleTitleClick()}}
                  >
                    {project.title}
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">No projects found</div>
            )}
          </div>
          {totalPages > 1 && (
  <div className="flex justify-center mt-4 ">
    {currentPage > 1 && (
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        className="px-4 py-2 mx-2 text-gray-500 hover:text-black"
      >
        &lt;
      </button>
    )}
    {[...Array(totalPages)].map((_, index) => (
      <button
        key={index}
        onClick={() => handlePageChange(index + 1)}
        className={`px-4 py-2 mx-1 text-gray-500 hover:text-black ${
          currentPage === index + 1 ? 'font-bold underline' : ''
        }`}
      >
        {index + 1}
      </button>
    ))}
    {currentPage < totalPages && (
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        className="px-4 py-2 mx-2 text-gray-500 hover:text-black"
      >
        &gt;
      </button>
    )}
  </div>
)}


        </div>
      </div>
    </div>
  </div>
  
  );
};

export default Projects;
