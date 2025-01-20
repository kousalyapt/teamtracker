import React, { useState, useEffect } from 'react';
import { CSVLink } from 'react-csv';
import { useCookies } from 'react-cookie';
import axios from 'axios';

const Report = () => {
  const [cookies] = useCookies(['jwt']);
  const [tasks, setTasks] = useState([]);

  const getStatusCount = (status) => tasks.filter((task) => task.state === status).length;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const headers = { Authorization: `${cookies.jwt}` };
        const response = await axios.get('/all_tasks', { headers });
        
        setTasks(response.data.tasks); 
        
      } catch (error) {
        console.log(error); 
      }
    };
    fetchTasks();  
  }, [cookies.jwt]);  

  const headers = [
    { label: 'Task Title', key: 'title' },
    { label: 'Project', key: 'project_title' },
    { label: 'Assigned To', key: 'assigned_to' },
    { label: 'State', key: 'state' },
    { label: 'Due Date', key: 'due_date' },
  ];

  const csvData = tasks.map((task) => ({
    title: task.title,
    project_title: task.project_title || 'N/A',
    assigned_to: task.assigned_to || 'Unassigned',
    state: task.state,
    due_date: task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date',
  }));

  return (
    <div className="bg-white p-6 shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-4">Task Report</h2>
      <div className="mb-4">
        <p className="text-lg">Total Tasks: {tasks.length}</p>
        <p className="text-lg text-green-600">Resolved: {getStatusCount('resolved')}</p>
        <p className="text-lg text-yellow-500">Opened: {getStatusCount('opened')}</p>
        <p className="text-lg text-gray-600">Closed: {getStatusCount('closed')}</p>
      </div>
      <CSVLink 
        data={csvData} 
        headers={headers} 
        filename="tasks_report.csv" 
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Download Report
      </CSVLink>
    </div>
  );
};

export default Report;
