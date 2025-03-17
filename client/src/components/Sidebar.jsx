import React from 'react'
import { Link , useNavigate } from 'react-router-dom';

function Sidebar({projects }) {
    const navigate = useNavigate();
      // Handle logout
    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("name");
      navigate("/");
    };
  
  return (
    <div className='flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900'>
        <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700">
        <div className="p-3  border-b border-gray-200 dark:border-slate-700">
          <Link to="/">
            {" "}
            <h1 className="text-2xl font-bold text-blue-600">Finbrief</h1>
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-6 space-y-2 text-gray-600 dark:text-gray-400">
          <h2 className="text-sm uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
            Projects
          </h2>
          <ul className="space-y-1">
            {projects.slice(0, 5).map(
              (
                project // Show first 5 projects
              ) => (
                <li key={project._id}>
                  <Link
                    to={`/project/${project._id}`}
                    className="block px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition truncate"
                    title={project.filename}
                  >
                    {project.filename}
                  </Link>
                </li>
              )
            )}
            {projects.length === 0 && (
              <li className="text-sm text-gray-500 dark:text-gray-400 italic">
                No projects yet
              </li>
            )}
            {projects.length > 5 && (
              <li className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                <Link to="#" className="block px-2 py-2">
                  View all projects ({projects.length})
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="mt-auto p-6 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={handleLogout} // Navigate to the signup page
            className="flex items-center gap-2 text-red-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
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
        </div>
      </aside>
    </div>
  )
}

export default Sidebar;