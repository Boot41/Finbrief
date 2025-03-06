import React, { useState  ,useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import Signup from './Pages/Signup';
import Dashboard from './Pages/Dashboard';
import ProjectSummary from './Pages/ProjectSummary';
import Search from './Pages/Search';
import axios from 'axios';
import Login from './Pages/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  console.log(isLoggedIn);
  
  const checkToken = async () => {
  
    if(localStorage.getItem('token')){
      const me = await axios.get('http://localhost:5000/api/auth/me', 
        {headers : {token: ` ${localStorage.getItem('token')}`}});
    
      if(me.status === 200){
        setIsLoggedIn(true);
      }
    }
  }

  useEffect(() => {
    checkToken();
  },[])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login onLogin={()=>setIsLoggedIn(true)}/>} />
        {isLoggedIn && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/project/:id" element={<ProjectSummary />} />
            <Route path="/search" element={<Search />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
