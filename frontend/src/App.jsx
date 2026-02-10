import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import Register from './pages/Register'


const App = () => {
  return (
    <div className='text-4xl'>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/email-verify" element={<EmailVerify/>}/> 
        <Route path="/password-reset" element={<ResetPassword/>}/>
        <Route path="/register" element={<Register/>}/>    
      </Routes>
      
    </div>
  )
}

export default App