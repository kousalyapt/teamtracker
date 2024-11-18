import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';


const ProjectTasks = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cookies] = useCookies(['jwt']); // Assuming you're using react-cookie for JWT

  useEffect(() => {
    const jwtToken = cookies.jwt;

    if (!jwtToken) {
      console.error('No JWT token found.');
      return; // Exit early if there's no token
    }

    // Set up the Authorization header with the Bearer token
    const headers = {
      Authorization: `${jwtToken}`, // Use the JWT token as a Bearer token
    };

    // Fetch project details
    axios
      .get(`http://localhost:3000/projects/${id}`, { headers }) // Correct URL with projectId
      .then((response) => {
        console.log(response);
        setProject(response.data); // Set the project data
      })
      .catch((error) => {
        console.error('Error fetching project:', error);
      })
      .finally(() => {
        setLoading(false); // Set loading to false after the request
      });

    // Fetch tasks for the project
//     axios
//       .get(`http://localhost:3000/projects/${projectId}/tasks`, { headers }) // Correct URL for tasks
//       .then((response) => {
//         console.log(response);
//         setTasks(response.data); // Set the tasks data
//       })
//       .catch((error) => {
//         console.error('Error fetching tasks:', error);
//       });
   }, [id, cookies.jwt]); // Re-run effect when projectId or JWT changes

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{project?.title}</h2>
      <p>{project?.description}</p>

      <h3>Tasks</h3>
      {tasks.length === 0 ? (
        <p>No tasks available for this project.</p>
      ) : (
        tasks.map((task) => (
          <div key={task.id}>
            <h4>{task.title}</h4>
            <p>{task.description}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default ProjectTasks;
