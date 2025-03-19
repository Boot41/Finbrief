import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import Signup from "./Pages/Signup";
import Dashboard from "./Pages/Dashboard";
import ProjectSummary from "./Pages/ProjectSummary";
import Search from "./Pages/Search";
import Login from "./Pages/Login";
import Forecast from "./Pages/Forecast";
import AuthContext from "./context/AuthContext";
import Compare from "./Pages/Compare";
import Form from "./Pages/Form";

function App() {
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext); // Fix: Use authentication context

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/login"
          element={<Login onLogin={() => setIsLoggedIn(true)} />}
        />

        {/* Fix: Ensure isLoggedIn is defined */}
        {isLoggedIn ? (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/project/:id" element={<ProjectSummary />} />
            <Route path="/search" element={<Search />} />
            <Route path="/forecast/:id" element={<Forecast />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/form" element={<Form></Form>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
