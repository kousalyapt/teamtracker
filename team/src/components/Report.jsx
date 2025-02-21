import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import { useShowTaskDetails } from './ShowTaskDetailsContext';

const Report = () => {
  const [cookies] = useCookies(['jwt']);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState({});
  const [expandedProject, setExpandedProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); 
  const [currentPage, setCurrentPage] = useState(1);
  const { setShowTaskDetails } = useShowTaskDetails();
  const navigate = useNavigate()
  const itemsPerPage = 6;  


  const getStatusCount = (project, status) =>
    tasks.filter((task) => task.project_title === project.title && task.state === status).length;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const headers = { Authorization: `${cookies.jwt}` };
        const response = await axios.get('/users', { headers });
        const userMap = response.data.reduce((map, user) => ({ ...map, [user.id]: user.name }), {});
        setUsers(userMap);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [cookies.jwt]);

  useEffect(() => {
    const headers = { Authorization: `${cookies.jwt}` };
    axios.get('/projects', { headers }).then((response) => {
      const { projects_created = [], projects_as_member = [] } = response.data || {};
      const uniqueProjects = [...projects_created, ...projects_as_member].reduce((acc, project) => {
        if (!acc.some((p) => p.id === project.id)) acc.push(project);
        return acc;
      }, []);
      console.log("kou")
      console.log(uniqueProjects)
      console.log("salya")
      // setProjects(uniqueProjects.map((project) => project.title));
      setProjects(uniqueProjects);
    }).catch((error) => console.error('Error fetching projects:', error));
  }, [cookies.jwt]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const headers = { Authorization: `${cookies.jwt}` };
        const response = await axios.get('/all_tasks', { headers });
        setTasks(response.data.tasks);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTasks();
  }, [cookies.jwt]);

  const generatePDF = (project) => {
    const projectTasks = tasks.filter((task) => task.project_title === project.title);
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`${project.title} - Task Report`, 10, 10);
    doc.setFontSize(12);
    const tableData = projectTasks.map((task) => [
      task.title,
      users[task.assigned_to_id] || 'Unassigned',
      task.state,
      task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date',
    ]);
    doc.autoTable({ head: [['Title', 'Assigned To', 'State', 'Due Date']], body: tableData });
    doc.save(`${project.title}_task_report.pdf`);
  };

  const toggleProject = (project) => {
    setExpandedProject(expandedProject === project ? null : project);
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProjectClick = (project) => {
    setShowTaskDetails(null)
    navigate(`/projects/${project.id}/tasks`)
  }


  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastProject = currentPage * itemsPerPage;
  const indexOfFirstProject = indexOfLastProject - itemsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);

  const totalPages = Math.ceil(projects.length / itemsPerPage);


  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold pl-48 mb-6">Project Task Reports</h1>
      <div className="p-6 bg-white shadow-md rounded-lg max-w-4xl mx-auto">
      <div className="my-4 flex justify-center">
            <input
              type="text"
              placeholder="Search projects..."
              className="w-1/2 mx-auto border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-green-400 focus:outline-none "
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {currentProjects.length > 0 ? (
        currentProjects.map((project) => (
          <div key={project.id} className="border-b pb-4">
            <h2
              className="text-xl font-semibold cursor-pointer hover:text-blue-600"
              onClick={() => toggleProject(project)}
            >
              {project.title}
            </h2>
            {expandedProject === project && (
              <div className="ml-4 mt-2 cursor-pointer" onClick={()=> handleProjectClick(project)}>
                <p>Total Tasks: {tasks.filter((task) => task.project_title === project.title).length}</p>
                <p className="text-green-600">Resolved: {getStatusCount(project, 'resolved')}</p>
                <p className="text-yellow-500">Opened: {getStatusCount(project, 'opened')}</p>
                <p className="text-gray-600">Closed: {getStatusCount(project, 'closed')}</p>
                <button
                  onClick={() => generatePDF(project)}
                  className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  Download PDF Report
                </button>
              </div>
            )}
          </div>
        ))):(
          <div className="text-gray-500 text-center py-4">No projects found</div>
        )}
      
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
      </div>
    </div>
  );
};

export default Report;
