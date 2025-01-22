import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';

const AllTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [cookies] = useCookies(['jwt']);
  const [filter, setFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showLabelDropdown, setShowLabelDropdown] = useState(false);
  const [availableLabels, setAvailableLabels] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showDateRangeDropdown, setShowDateRangeDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;  // Set the number of projects per page
    
  

  useEffect(() => {
    const jwtToken = cookies.jwt;

    if (!jwtToken) {
      console.error('No JWT token found.');
      return;
    }

    try {
      const decodedToken = jwtDecode(jwtToken);
      const userId = decodedToken.sub;

      const headers = { Authorization: `${jwtToken}` };

      const fetchData = async () => {
        try {
          const tasksResponse = await axios.get(`http://localhost:3000/users/${userId}/tasks`, { headers });
          setTasks(tasksResponse.data.tasks);
        } catch (error) {
          console.error('Error fetching tasks:', error);
        }
      };

      fetchData();
    } catch (error) {
      console.error('Error decoding JWT:', error);
    }
  }, [cookies.jwt]);

  useEffect(() => {
    let filtered = tasks.filter((task) => {
      const dueDate = new Date(task.due_date);
      const today = new Date();
      const isToday = dueDate.toDateString() === today.toDateString();
      const userId = cookies.userId;

      if (filter.startsWith('label_')) {
        const labelId = parseInt(filter.split('_')[1], 10);
        return task.labels.some((label) => label.id === labelId);
      }

      if (filter === 'date_range') {
        return dueDate >= new Date(fromDate) && dueDate <= new Date(toDate);
      }

      if (filter === 'opened') {
        return task.state === 'opened';
      }

      if (filter === 'resolved') {
        return task.state === 'resolved';
      }

      if (filter === 'closed') {
        return task.state === 'closed';
      }

      if (filter === 'all') {
        return true;
      }

      if (filter === 'your_tasks_for_today') {
        return task.assigned_to_id === userId && isToday;
      }
      return task;
    });

    setFilteredTasks(filtered);
  }, [filter, tasks, fromDate, toDate, cookies.userId]);

  useEffect(() => {
    const uniqueLabels = new Map();

    tasks.forEach((task) => {
      task.labels?.forEach((label) => {
        if (!uniqueLabels.has(label.id)) {
          uniqueLabels.set(label.id, label);
        }
      });
    });

    setAvailableLabels(Array.from(uniqueLabels.values()));
  }, [tasks]);

  const getStatusCount = (status) => {
    return tasks.filter((task) => task.state === status).length;
  };

  const handleLabelFilter = (label) => {
    setFilter(`label_${label.id}`);
    setShowLabelDropdown(false);
  };

  const handleClearFilter = () => {
    setFilter('all');
    setFromDate('');
    setToDate('');
  };

  const toggleDateRangeDropdown = () => {
    setShowDateRangeDropdown(!showDateRangeDropdown);
  };

  const handleApplyDateFilter = () => {
    setShowDateRangeDropdown(false);
    setFilter('date_range');
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastTask = currentPage * itemsPerPage;
  const indexOfFirstTask = indexOfLastTask - itemsPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);



  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-sm rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Tasks</h2>

        {/* Filter & Clear Buttons */}
        <div className="flex justify-between items-center mb-4">
          <div >
          <button
            className="text-gray-600 hover:text-black"
            onClick={() => setFilter('all')}
          >
            All Tasks
          </button>
          <button
                    className="text-gray-600 hover:text-black ml-4"
                    onClick={() => { setFilter('your_tasks_for_today')}}
                  >
                    Your tasks for today
                  </button>
                  </div>
                  <div>
          <button
            className="text-gray-600 hover:text-black"
            onClick={handleClearFilter}
          >
            Clear Filters
          </button>
          </div>
        </div>

        {/* Status & Filter */}
        <div className=''>
        <div className="flex space-x-4 mb-4">
          <button
            className="text-sm text-gray-500 hover:text-black"
            onClick={() => setFilter('opened')}
          >
            Opened ({getStatusCount('opened')})
          </button>
          <button
            className="text-sm text-gray-600 hover:text-black"
            onClick={() => setFilter('resolved')}
          >
            Resolved ({getStatusCount('resolved')})
          </button>
          <button
            className="text-sm text-gray-400 hover:text-black"
            onClick={() => setFilter('closed')}
          >
            Closed ({getStatusCount('closed')})
          </button>
          
          <button
            className="text-sm text-gray-500 hover:text-black"
            onClick={() => setShowLabelDropdown(!showLabelDropdown)}
          >
            Labels
          </button>
          {showLabelDropdown && (
            <div className="absolute mt-2 bg-white border border-gray-300 rounded-lg w-40">
              {availableLabels.map((label) => (
                <button
                  key={label.id}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-600"
                  onClick={() => handleLabelFilter(label)}
                >
                  {label.name}
                </button>
              ))}
            </div>
          )}
           
                        <button
                          className="text-sm text-gray-500 hover:text-black"
                          onClick={toggleDateRangeDropdown}
                        >
                          Filter by Date
                        </button>

                        {showDateRangeDropdown && (
  <div className="absolute mt-2 bg-gray-50 border border-gray-300 rounded-lg shadow-md p-4 z-10">
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <label htmlFor="fromDate" className="text-sm font-medium text-gray-600">From:</label>
        <input
          type="date"
          id="fromDate"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="w-full border border-gray-300 text-gray-700 rounded-md px-2 py-1 focus:ring focus:ring-blue-200"
        />
      </div>
      <div className="flex items-center space-x-2">
        <label htmlFor="toDate" className="text-sm font-medium text-gray-600">To:</label>
        <input
          type="date"
          id="toDate"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="w-full border border-gray-300 text-gray-700 rounded-md px-2 py-1 focus:ring focus:ring-blue-200"
        />
      </div>
      <button
        onClick={handleApplyDateFilter}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 rounded-md mt-2"
      >
        Apply Filter
      </button>
    </div>
  </div>
)}

        </div>
        </div>

        {/* Label Filter */}
        

        {/* Task List */}
        <div>
          {currentTasks.length > 0 ? (
            currentTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white shadow-sm rounded-lg p-4 mb-4 hover:shadow-md transition-all"
              >
                <div className="flex justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                  <span
                    className={`text-sm rounded-md px-3 py-1 ${task.state === 'opened' ? 'bg-yellow-300' : task.state === 'resolved' ? 'bg-green-300' : 'bg-gray-300'}`}
                  >
                    {task.state.charAt(0).toUpperCase() + task.state.slice(1)}
                  </span>
                </div>
               
                <p className="text-sm text-gray-400"> Due date: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}</p>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">No tasks available</div>
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
  );
};

export default AllTasks;
