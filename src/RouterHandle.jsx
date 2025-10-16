import React ,{ useState } from 'react'
import Login from './Login';
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout  from './Layouts/AdminLayout';
import ParentLayout from './Layouts/ParentLayout';


function RouterHandle() {
  const [count, setCount] = useState(0)

  return (
 <Router>
    <Routes>
      {/* Login page */}
      <Route path="/" element={<Login />} />
      {/* Admin routes */}
      <Route path="/admin/*" element={<AdminLayout />} />
      {/* Parent routes */}
      <Route path="/parent/*" element={<ParentLayout />} />
    </Routes>
  </Router>
  )
}
export default RouterHandle