import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider} from "react-router-dom";
import Register from './components/Register';
import Login from './components/Login';
import { CookiesProvider} from 'react-cookie';
import NewProject from './components/NewProject';
import ProjectTasks from './components/ProjectTasks';
import MainLayout from './components/MainLayout'; 
import Label from './components/Label'
import TaskDetails from './components/TaskDetails';
import AllTasks from './components/AllTasks';
import Notifications from './components/Notifications';
import { NotificationProvider } from './components/NotificationContext';
import Profile from './components/Profile';
import Report from './components/Report';
import { ShowTaskDetailsProvider } from './components/ShowTaskDetailsContext';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import { ToastContainer } from 'react-toastify';
import People from './components/People';
import UserChat from './components/UserChat';
import { PeopleContextProvider } from './components/PeopleContext';


// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <App />
//   },
//   {
//     path: "/login",
//     element: <Login/>
//   },
//   {
//     path:"/register",
//     element: <Register/>
//   },
//   {
//     path:"/projects/new",
//     element: <NewProject/>
//   },
//   {
//     path:"/projects/:id/tasks",
//     element: <ProjectTasks/>
//   }
// ])

const router = createBrowserRouter([
  {
    path: "/", 
    element: <MainLayout />, 
    children: [
      {
        index: true, 
        element: <App />
      },
      {
        path: "projects/new",
        element: <NewProject />
      },
      {
        path: "projects/:id/tasks",
        element: <ProjectTasks />,
        children: [
          {
            path: ":taskId",
            element: <TaskDetails/>
          }
        ]
      },
      {
        path: "/projects/:id/labels",
        element: <Label />
      },
      // {
      //   path: "/projects/:projectId/tasks/:taskId",
      //   element: <TaskDetails />
      // },
      {
        path: "/all_task",
        element: <AllTasks/>
      },
      {
        path: "/notifications",
        element: <Notifications/>
      },
      {
        path: "/profile",
        element: <Profile/>
      },
      {
        path: "/projects_reports",
        element: <Report/>
      },
      {
        path: "/people",
        element: <People />
      },
      {
        path: "/user/:id/chat",
        element: <UserChat/>
      }
    ]
  },
  {
    path: "/login", 
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/projects/:id/accept_invite",
    element: <Register/>
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword/>
  },
  {
    path: "/reset-password",
    element: <ResetPassword/>
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    
    <ShowTaskDetailsProvider>
    <CookiesProvider defaultSetOptions={{ path: '/'}}>
    <PeopleContextProvider>
      <NotificationProvider>
      <ToastContainer position="top-right" autoClose={3000} />
        
        <RouterProvider router={router} />
        
      </NotificationProvider>
      </PeopleContextProvider>
    </CookiesProvider>
    </ShowTaskDetailsProvider>
    
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
