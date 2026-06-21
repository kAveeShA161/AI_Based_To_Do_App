import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import Register from './pages/Register'
import { Slide, ToastContainer } from 'react-toastify';
import CreateTask from './pages/createTask'
import MyTasks from './pages/MyTasks'
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/dashboard';
import AIPlanner from './pages/AIPlanner';


const App = () => {
  return (
    <div className='text-4xl'>
      <ToastContainer
        position="bottom-right"
        autoClose={3200}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Slide}
        toastClassName="taskflow-toast"
        bodyClassName="taskflow-toast-body"
        progressClassName="taskflow-toast-progress"
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/password-reset" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-task" element={<CreateTask />} />
        <Route path="/my-tasks" element={<MyTasks />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/ai-planner' element={<AIPlanner />} />
      </Routes>

    </div>
  )
}

export default App
