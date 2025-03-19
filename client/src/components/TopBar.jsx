import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function TopBar({ name }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    navigate("/");
  };

  const handleUserPersona = () => {
    // Navigate to user persona/profile page
    navigate("/form");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 relative">
      {/* Title with left margin */}
      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 ml-4">
        Dashboard
      </h1>

      {/* Right side: Name and Settings Icon */}
      <div className="flex items-center space-x-2">
        <span className="text-gray-700 dark:text-gray-300">{name}</span>

        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)} 
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none"
          >
            {/* Settings Icon */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-gray-600 dark:text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l.56 1.723a1.724 1.724 0 002.602 1.004l1.7-.91a1.724 1.724 0 012.095.61l1.332 2.31a1.724 1.724 0 01-.226 1.894l-1.07 1.58a1.724 1.724 0 000 1.713l1.07 1.58a1.724 1.724 0 01.226 1.894l-1.332 2.31a1.724 1.724 0 01-2.095.61l-1.7-.91a1.724 1.724 0 00-2.602 1.004l-.56 1.723c-.3.921-1.603.921-1.902 0l-.56-1.723a1.724 1.724 0 00-2.602-1.004l-1.7.91a1.724 1.724 0 01-2.095-.61l-1.332-2.31a1.724 1.724 0 01.226-1.894l1.07-1.58a1.724 1.724 0 000-1.713l-1.07-1.58a1.724 1.724 0 01-.226-1.894l1.332-2.31a1.724 1.724 0 012.095-.61l1.7.91a1.724 1.724 0 002.602-1.004l.56-1.723z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded shadow-lg z-10">
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-red-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </button>

              {/* User Persona Button */}
              <button
                onClick={handleUserPersona}
                className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5.121 17.804A10.966 10.966 0 0112 15c2.635 0 5.032.95 6.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
                <span>User Persona</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopBar;

