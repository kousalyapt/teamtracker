import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Report = () => {
  const [cookies] = useCookies(['jwt']);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState({});
  const [expandedProject, setExpandedProject] = useState(null); 

  const getStatusCount = (project, status) =>
    tasks.filter((task) => task.project_title === project && task.state === status).length;

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
      setProjects(uniqueProjects.map((project) => project.title));
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
    const projectTasks = tasks.filter((task) => task.project_title === project);
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`${project} - Task Report`, 10, 10);
    doc.setFontSize(12);
    const tableData = projectTasks.map((task) => [
      task.title,
      users[task.assigned_to_id] || 'Unassigned',
      task.state,
      task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date',
    ]);
    doc.autoTable({ head: [['Title', 'Assigned To', 'State', 'Due Date']], body: tableData });
    doc.save(`${project}_task_report.pdf`);
  };

  const toggleProject = (project) => {
    setExpandedProject(expandedProject === project ? null : project);
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold pl-48 mb-6">Project Task Reports</h1>
      <div className="p-6 bg-white shadow-md rounded-lg max-w-4xl mx-auto">
      {projects.map((project) => (
        <div key={project} className="border-b pb-4">
          <h2
            className="text-xl font-semibold cursor-pointer hover:text-blue-600"
            onClick={() => toggleProject(project)}
          >
            {project}
          </h2>
          {expandedProject === project && (
            <div className="ml-4 mt-2">
              <p>Total Tasks: {tasks.filter((task) => task.project_title === project).length}</p>
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
      ))}
      </div>
    </div>
  );
};

export default Report;
