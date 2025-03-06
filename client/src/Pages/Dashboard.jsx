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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-800 dark:text-indigo-300 tracking-tight">
            Projects Dashboard
          </h1>
          <button
            onClick={() => setModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-6 py-3 
            flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5
            focus:ring-4 focus:ring-indigo-300 focus:outline-none"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Project
          </button>
        </div>

        {/* Loading State */}
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
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No projects yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Upload your first Excel file to get started</p>
            <button
              onClick={() => setModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-6 py-2 
              transition-colors duration-300 focus:ring-4 focus:ring-indigo-300 focus:outline-none"
            >
              Upload Excel File
            </button>
          </div>
        )}

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 
              hover:shadow-lg hover:-translate-y-1 border border-gray-100 dark:border-slate-700"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {project.filename}
                  </h3>
                  <span
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      project.status === "analyzed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                    }`}
                  >
                    {project.status === "analyzed" ? "Analyzed" : "Pending"}
                  </span>
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
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
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
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
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
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    Search
                  </Link>

                  <button
                    onClick={() => handleDelete(project._id)}
                    className="col-span-2 flex items-center justify-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white 
                    rounded-lg font-medium transition-colors duration-300 focus:ring-4 focus:ring-red-300 focus:outline-none"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
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
                            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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
    </div>
  )
}

export default Dashboard

