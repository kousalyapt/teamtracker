import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode'; 
import { useShowTaskDetails } from './ShowTaskDetailsContext';
import { useNavigate } from 'react-router-dom';

const AllTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [cookies] = useCookies(['jwt']);
  // const [filter, setFilter] = useState('all');
  const [activeFilters, setActiveFilters] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showLabelDropdown, setShowLabelDropdown] = useState(false);
  const [availableLabels, setAvailableLabels] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showDateRangeDropdown, setShowDateRangeDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Number of tasks per page
  const { setShowTaskDetails } = useShowTaskDetails();
  const [currentTasks, setCurrentTasks] = useState([]);
  const navigate = useNavigate();

  // Fetch tasks on component mount
  useEffect(() => {
    const jwtToken = cookies.jwt;

    if (!jwtToken) {
      console.error('No JWT token found.');
      return;
    }

    try {
      const decodedToken = jwtDecode(jwtToken);
      const userId = decodedToken.sub;

      const fetchData = async () => {
        try {
          const headers = { Authorization: `${jwtToken}` };
          const response = await axios.get(
            `http://localhost:3000/users/${userId}/tasks`,
            { headers }
          );
          setTasks(response.data.tasks);
          setFilteredTasks(response.data.tasks); // Set initial filtered tasks
        } catch (error) {
          console.error('Error fetching tasks:', error);
        }
      };

      fetchData();
    } catch (error) {
      console.error('Error decoding JWT:', error);
    }
  }, [cookies.jwt]);

  // Update filtered tasks when filters or tasks change
  useEffect(() => {
    let filtered = tasks;

    activeFilters.forEach((filter) => {
      if (filter.type === 'label') {
        filtered = filtered.filter((task) =>
          task.labels.some((label) => label.name === filter.value)
        );
      } else if (filter.type === 'state') {
        filtered = filtered.filter((task) => task.state === filter.value);
      } else if (filter.type === 'date_range') {
        filtered = filtered.filter(
          (task) =>
            new Date(task.due_date) >= new Date(filter.value.from) &&
            new Date(task.due_date) <= new Date(filter.value.to)
        );
      } else if (filter.type === 'today'){
        filtered = filtered.filter(
          (task) =>{
            console.log("sed")
            console.log(task.due_date)
            console.log(filter.value)
            console.log("in")
            const taskDate = new Date(task.due_date).toISOString().split('T')[0];
            return taskDate === filter.value;

            // new Date(task.due_date) == new Date(filter.value) 
          }
        );
      }
    });

    setFilteredTasks(filtered);
  }, [activeFilters, tasks]);

  // Update available labels
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

  // Update current tasks based on pagination
  useEffect(() => {
    const indexOfLastTask = currentPage * itemsPerPage;
    const indexOfFirstTask = indexOfLastTask - itemsPerPage;
    setCurrentTasks(filteredTasks.slice(indexOfFirstTask, indexOfLastTask));
  }, [filteredTasks, currentPage, itemsPerPage]);

  const handleAddFilter = (filter) => {
    setActiveFilters((prevFilters) => [...prevFilters, filter]);
  };

  const handleRemoveFilter = (filterToRemove) => {
    setActiveFilters((prevFilters) =>
      prevFilters.filter(
        (filter) =>
          filter.type !== filterToRemove.type ||
          JSON.stringify(filter.value) !== JSON.stringify(filterToRemove.value)
      )
    );
  };

  const handleClearFilters = () => {
    setActiveFilters([]);
    setFromDate('');
    setToDate('');
    setFilteredTasks(tasks); // Reset to all tasks
  };

  const handleApplyDateFilter = () => {
    handleAddFilter({ type: 'date_range', value: { from: fromDate, to: toDate } });
    setShowDateRangeDropdown(false);
  };

  const handleTaskForToday = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    handleAddFilter({ type: 'today', value: formattedDate});
  }

  const handleTitleClick = (task) => {
    setShowTaskDetails(task);
    navigate(`/projects/${task.project_id}/tasks/${task.id}`);
  };

  const getStatusCount = (status) => {
    return tasks.filter((task) => task.state === status).length;
  };

  const toggleDateRangeDropdown = () => {
    setShowDateRangeDropdown(!showDateRangeDropdown);
  };

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-sm rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Tasks</h2>

        {/* Filter Buttons */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <button
              onClick={handleClearFilters}
              className="text-gray-600 hover:text-black"
            >
              All Tasks
            </button>
            <button

            onClick={handleTaskForToday}
              className="text-gray-600 hover:text-black ml-4 "
            >
              Your tasks for today
            </button>
          </div>
          <div>
            <button
              className="text-gray-600 hover:text-black"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Task Filters */}
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => handleAddFilter({ type: 'state', value: 'opened' })}
            className="text-sm text-gray-500 hover:text-black"
          >
            Opened ({getStatusCount('opened')})
          </button>
          <button
            onClick={() => handleAddFilter({ type: 'state', value: 'resolved' })}
            className="text-sm text-gray-500 hover:text-black"
          >
            Resolved ({getStatusCount('resolved')})
          </button>
          <button
            onClick={() => handleAddFilter({ type: 'state', value: 'closed' })}
            className="text-sm text-gray-500 hover:text-black"
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
            <div className="absolute bg-white border rounded shadow-lg z-10">
              {availableLabels.map((label) => (
                <button
                  key={label.id}
                  onClick={() => handleAddFilter({ type: 'label', value: label.name })}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
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

          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.map((filter, index) => (
              <div
                key={index}
                className="flex items-center bg-gray-200 px-3 py-1 rounded-md text-sm text-gray-700"
              >
                <span>
                  {filter.type === 'label'
                    ? `Label: ${filter.value}`
                    : filter.type === 'state'
                      ? `State: ${filter.value}`
                      : filter.type === 'today'
                      ? `Your task for today`
                      :`Date: ${filter.value.from} to ${filter.value.to}`}
                </span>
                <button
                  className="ml-2 text-red-500"
                  onClick={() => handleRemoveFilter(filter)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        <div>
          {currentTasks.map((task) => (

            <div
              key={task.id}
              className="p-2 border-b hover:bg-gray-100 cursor-pointer"
              onClick={() => handleTitleClick(task)}
            >
              <div className=' flex justify-between'>
                <h3 className="text-lg font-semibold text-gray-800 " >{task.title}</h3>

                <div className='flex justify-between mb-2'>
                  <span
                    className={`text-sm rounded-md px-3 py-1 ${task.state === 'opened' ? 'bg-yellow-300' : task.state === 'resolved' ? 'bg-green-300' : 'bg-gray-300'}`}
                  >

                    {task.state.charAt(0).toUpperCase() + task.state.slice(1)}
                  </span>
                  {task.labels && task.labels.length > 0 && (
                    <ul className="flex space-x-2">
                      {task.labels.map((label) => (
                        <li key={label.id} className=" text-gray-700 px-2 py-1 rounded-md">
                          <span
                            className="text-sm rounded-md px-3 py-1"
                            style={{
                              backgroundColor: label.color,

                            }}
                          >
                            {label.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
              </div>
              <p className="text-sm text-gray-400"> Due date: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}</p>

            </div>

          ))}
        </div>

        {/* Pagination */}
        {/* <div className="mt-4 flex justify-center space-x-2">
          {[...Array(totalPages).keys()].map((page) => (
            <button
              key={page + 1}
              onClick={() => setCurrentPage(page + 1)}
              className={`px-2 py-1 rounded ${currentPage === page + 1
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
                }`}
            >
              {page + 1}
            </button>
          ))}
        </div> */}
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
                className={`px-4 py-2 mx-1 text-gray-500 hover:text-black ${currentPage === index + 1 ? 'font-bold underline' : ''
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
