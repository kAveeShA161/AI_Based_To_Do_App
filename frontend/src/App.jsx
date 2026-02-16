import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import Register from './pages/Register'
import { ToastContainer } from 'react-toastify';
import CreateTask from './pages/createTask'
import MyTasks from './pages/MyTasks'
import 'react-toastify/dist/ReactToastify.css';


const App = () => {
  return (
    <div className='text-4xl'>
      <ToastContainer toastClassName="text-2xl" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/password-reset" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-task" element={<CreateTask />} />
        <Route path="/my-tasks" element={<MyTasks />} />
      </Routes>

    </div>
  )
}

export default App