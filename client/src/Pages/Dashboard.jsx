"use client"
import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"

const Dashboard = () => {
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [file, setFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [username, setUsername] = useState("");

  // for username
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);


  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Check if file is Excel
      const isExcel = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ].includes(selectedFile.type)

      if (!isExcel) {
        alert("Please upload only Excel files (.xls or .xlsx)")
        e.target.value = null // Reset file input
        return
      }
      setFile(selectedFile)
    }
  }

  // Fetch all projects
  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axios.get("http://localhost:5000/api/projects", {
        headers: {
          token: localStorage.getItem("token"),
        },
      })
      setProjects(response.data)
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Handle file upload
  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) {
      alert("Please select a file to upload")
      return
    }

    setIsLoading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      await axios.post("http://localhost:5000/api/projects", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: localStorage.getItem("token"),
        },
      })
      fetchProjects()
      alert("File uploaded successfully")
      setModal(false)
      setFile(null)
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Failed to upload file")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle project deletion
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/projects/${id}`, {
        headers: { token: localStorage.getItem("token") },
      })
      fetchProjects()
      alert("Project deleted successfully")
    } catch (error) {
      console.error("Error deleting project:", error)
      alert("Failed to delete project")
    }
  }

  // Handle file analysis
  const handleAnalyze = async (project) => {
    try {
      setIsLoading(true)
      setError(null)

      // If project hasn't been analyzed yet, trigger analysis
      if (project.status !== "analyzed") {
        const response = await axios.post(
          `http://localhost:5000/api/projects/analyze/${project._id}`,
          {},
          {
            headers: {
              token: localStorage.getItem("token"),
              "Content-Type": "application/json",
            },
            timeout: 30000, // 30 second timeout
          },
        )

        if (response.data) {
          // Update the project in the list with the analyzed data
          const updatedProjects = projects.map((p) => (p._id === project._id ? response.data : p))
          setProjects(updatedProjects)

          // Navigate to project summary
          navigate(`/project/${project._id}`)
        } else {
          throw new Error("No data received from analysis")
        }
      } else {
        // If already analyzed, just navigate
        navigate(`/project/${project._id}`)
      }
    } catch (error) {
      console.error("Analysis error:", error)
      let errorMessage = "Failed to analyze project. Please try again."

      if (error.code === "ECONNABORTED") {
        errorMessage = "Analysis timed out. Please try again."
      } else if (error.response) {
        // Server responded with error
        errorMessage = error.response.data.message || errorMessage
      } else if (error.request) {
        // Request made but no response
        errorMessage = "Could not connect to server. Please check your connection."
      }

      setError(errorMessage)
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <Link to="/"> <h1 className="text-2xl font-bold text-blue-600">Finbrief</h1></Link>
        </div>

        {/* Example Sidebar Navigation */}
    <nav className="flex-1 p-6 space-y-2 text-gray-600 dark:text-gray-400">
  <h2 className="text-sm uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">Projects</h2>
  <ul className="space-y-1">
    {projects.slice(0, 5).map((project) => ( // Show first 5 projects
      <li key={project._id}>
        <Link
          to={`/project/${project._id}`}
          className="block px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition truncate"
          title={project.filename}
        >
          {project.filename}
        </Link>
      </li>
    ))}
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
      onClick={() => navigate("/")} // Navigate to the signup page
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700"> 
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Dashboard</h1>
          <span className="text-gray-700 dark:text-gray-300">{username}</span>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-auto px-4 py-6">
          {/* Dashboard Header */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 tracking-tight mb-6">
            Your Projects
          </h1>

          {/* Top Cards: Welcome & Quick Tips */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            {/* Welcome Card (2 columns wide on large screens) */}
            <div className="bg-blue-600 text-white rounded-lg p-6 lg:col-span-2">
              <h2 className="text-2xl font-semibold mb-2">Welcome to Finbrief</h2>
              <p className="mb-4">
                Analyze Excel file with the power of AI.
              </p>
              <button
                onClick={() => setModal(true)}
                className="bg-white text-indigo-600 font-medium px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
                disabled={isLoading}
              >
                Add Excel File
              </button>
            </div>

            {/* Quick Start Card */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                Quick Start
              </h2>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <li>Simply upload your Excel files </li>
                <li>Our AI automatically processes and analyzes your financial data</li>
                <li>Get instant visualizations, insights, and answers to your questions</li>
              </ul>
            </div>
          </div>

          {/* Recent Projects */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Recent Projects
            </h2>

            {/* Loading Spinner */}
            {isLoading && (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && projects.length === 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-indigo-600 dark:text-indigo-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 13h6m-3-3v6m3 4v-6m2
                      10H7a2 2 0
                      01-2-2V5a2 2 0
                      012-2h5.586a1 1 0
                      01.707.293l5.414
                      5.414a1 1 0
                      01.293.707V19a2
                      2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  No projects yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Upload your first Excel file to get started
                </p>
                <button
                  onClick={() => setModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-6 py-2 
                  transition-colors duration-300 focus:ring-4 focus:ring-indigo-300 focus:outline-none"
                >
                  Upload Excel File
                </button>
              </div>
            )}

            {/* Project Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 
                  hover:shadow-lg hover:-translate-y-1 border border-gray-100 dark:border-slate-700"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {project.filename}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                            project.status === "analyzed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          }`}
                        >
                          {project.status === "analyzed" ? "Analyzed" : "Pending"}
                        </span>
                        <div className="relative">
                          <button
                            onClick={() => setMenuOpenId(menuOpenId === project._id ? null : project._id)}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          {menuOpenId === project._id && (
                            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    handleDelete(project._id);
                                    setMenuOpenId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                  Delete Project
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 17v-2m3 2v-4m3 4v-6m2
                            10H7a2 2 0
                            01-2-2V5a2 2 0
                            012-2h5.586a1 1 0
                            01.707.293l5.414
                            5.414a1 1 0
                            01.293.707V19a2
                            2 0 01-2 2z"
                          />
                        </svg>
                        {formatFileSize(project.size)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9
                            8h10M5 21h14a2 2 0
                            002-2V7a2 2 0
                            002-2H5a2 2 0
                            00-2 2v12a2 2 0
                            002 2z"
                          />
                        </svg>
                        {new Date(project.uploadedAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAnalyze(project)}
                        className={`flex items-center justify-center gap-1 px-4 py-2 rounded-lg font-medium text-white transition-colors duration-300 
                          ${
                            project.status === "analyzed"
                              ? "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300"
                              : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300"
                          } focus:ring-4 focus:outline-none`}
                        disabled={isLoading}
                      >
                        {project.status === "analyzed" ? (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 oklch(0.51 0.26 276.94)"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0
                                11-6 0 3 3 0
                                016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732
                                7.943 7.523 5 12
                                5c4.478 0 8.268
                                2.943 9.542
                                7-1.274 4.057-5.064
                                7-9.542 7-4.477
                                0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            View
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0
                                00-2 2v12a2 2 0
                                002 2h10a2 2 0
                                002-2V7a2 2 0
                                00-2-2h-2M9 5a2
                                2 0 002 2h2a2
                                2 0 002-2M9
                                5a2 2 0 012-2h2a2
                                2 0 012 2"
                              />
                            </svg>
                            Analyze
                          </>
                        )}
                      </button>

                      <Link
                        to={`/search?projectId=${project._id}`}
                        className="flex items-center justify-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white 
                        rounded-lg font-medium transition-colors duration-300 focus:ring-4 focus:ring-emerald-300 focus:outline-none"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7
                            7 0 11-14 0 7 7 0
                            0114 0z"
                          />
                        </svg>
                        Ask
                      </Link>

              
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* Upload Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 animate-fadeIn">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Upload Excel File</h2>
                <button
                  onClick={() => {
                    setModal(false)
                    setFile(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-6">
                <div
                  className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors
                  ${
                    file
                      ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
                      : "border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20"
                  }`}
                >
                  {!file ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-indigo-500 dark:text-indigo-400 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 17v-2m3 2v-4m3 4v-6m2
                          10H7a2 2 0
                          01-2-2V5a2 2 0
                          012-2h5.586a1 1 0
                          01.707.293l5.414
                          5.414a1 1 0
                          01.293.707V19a2
                          2 0 01-2 2z"
                        />
                      </svg>
                      <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
                        Upload an Excel file (.xls or .xlsx)
                      </p>
                      <label
                        htmlFor="file"
                        className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg
                        transition-colors duration-300 focus:ring-4 focus:ring-indigo-300 focus:outline-none"
                      >
                        Browse Files
                      </label>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-green-500 dark:text-green-400 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6
                          2a9 9 0
                          11-18 0 9 9 0
                          0118 0z"
                        />
                      </svg>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Size: {formatFileSize(file.size)}
                      </p>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg
                          transition-colors duration-300 focus:ring-4 focus:ring-green-300 focus:outline-none"
                          disabled={isLoading}
                        >
                          {isLoading ? "Uploading..." : "Upload File"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 
                          font-medium py-2 px-6 rounded-lg transition-colors duration-300 focus:ring-4 focus:ring-gray-300 focus:outline-none"
                        >
                          Change
                        </button>
                      </div>
                    </>
                  )}
                  <input id="file" type="file" accept=".xls,.xlsx" onChange={handleFileChange} className="hidden" />
                </div>

                {!file && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setModal(false)
                        setFile(null)
                      }}
                      className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 
                      font-medium transition-colors duration-300 focus:outline-none"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
