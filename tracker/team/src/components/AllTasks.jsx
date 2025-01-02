// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useCookies } from 'react-cookie';
// import { jwtDecode } from 'jwt-decode';


// const AllTasks = () => {
//   const [tasks, setTasks] = useState([]);
//   const [cookies, setCookies] = useCookies(['jwt']);
//   const [userId, setUserId] = useState(null);

//   useEffect(() => {
//     const jwtToken = cookies.jwt;

//     if (!jwtToken) {
//       console.error('No JWT token found.');
//       return;
//     }

//     try {
//       const decodedToken = jwtDecode(jwtToken);
//       console.log('Decoded Token:', decodedToken);
//       const id = decodedToken.sub;
//       setUserId(id)
//       setCookies('userId', userId);
//     } catch (error) {
//       console.error('Error decoding JWT:', error);
//     }
//     }, [cookies.jwt]); 


//     useEffect(() => {
//         if (userId) {
//             const jwtToken = cookies.jwt;
//     const headers = { Authorization: `${jwtToken}` };

//     const fetchData = async () => {
//       try {
       
//         const tasksResponse = await axios.get(`http://localhost:3000/users/${userId}/tasks`, { headers });
//         console.log("trrrrrrrrrrrrrrrrrrrrrrr",tasksResponse)
//         setTasks(tasksResponse.data.tasks);
//         //console.log(tasksResponse.data.tasks);
//         console.log("ttttttaaaaassskkkkkkkkkks",tasks)
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       } 
//     };

//     fetchData();
// }
//   }, [userId, cookies.jwt]);

// //   useEffect(() => {
// //     const headers = {
// //       Authorization: `${cookies.jwt}`,
// //     };

// //     axios
// //       .get('/tasks', { headers }) // Fetch all tasks
// //       .then((response) => {
// //         console.log(response);
// //         if (response.data) {
// //           setTasks(response.data.tasks); // Assuming the response has tasks
// //         } else {
// //           console.error('Invalid response format', response.data);
// //         }
// //       })
// //       .catch((error) => {
// //         console.error('Error fetching tasks:', error);
// //       });
// //   }, [cookies.jwt]);

//   return (
//     <div className="container mx-auto p-4">
//       {/* <div className="w-full px-4">
//         <div className="bg-gray-50 shadow-md p-6">
//           <div className="text-lg font-bold text-gray-800 mb-4">All Tasks</div>
//           <div>
//             {tasks.length > 0 ? (
//               tasks.map((task) => (
//                 <div
//                   key={task.id}
//                   className="py-1 border-b last:border-b-0 text-gray-800 hover:bg-gray-100 rounded-md"
//                 >
//                   {task.title}
//                 </div>
//               ))
//             ) : (
//               <div className="text-gray-500 text-center py-4">No tasks available</div>
//             )}
//           </div>
//         </div>
//       </div> */}
//     </div>
//   );
// };

// export default AllTasks;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';  // Make sure jwt-decode is imported correctly

const AllTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [cookies] = useCookies(['jwt']);

  useEffect(() => {
    const jwtToken = cookies.jwt;

    if (!jwtToken) {
      console.error('No JWT token found.');
      return;
    }

    try {
      const decodedToken = jwtDecode(jwtToken);
      console.log('Decoded Token:', decodedToken);
      const userId = decodedToken.sub; // Get userId from the decoded token

      const headers = { Authorization: `Bearer ${jwtToken}` };

      const fetchData = async () => {
        try {
          // Fetch tasks of the logged-in user
          const tasksResponse = await axios.get(`http://localhost:3000/users/${userId}/tasks`, { headers });
          console.log("Tasks Response:", tasksResponse);
          setTasks(tasksResponse.data.tasks); // Set tasks once data is fetched
        } catch (error) {
          console.error('Error fetching tasks:', error);
        }
      };

      fetchData(); // Fetch tasks once userId is available
    } catch (error) {
      console.error('Error decoding JWT:', error);
    }
  }, [cookies.jwt]); // This effect runs whenever cookies.jwt changes

  return (
    <div className="container mx-auto p-4">
      <div className="w-full px-4">
        <div className="bg-gray-50 shadow-md p-6">
          
          <div>
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="py-1 border-b last:border-b-0 text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  {task.title}
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">No tasks available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllTasks;
