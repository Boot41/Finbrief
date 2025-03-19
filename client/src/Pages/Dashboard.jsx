"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import QuickTips from "../components/QuickTips";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [modal, setModal] = useState(false);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [name, setname] = useState("");
  // Additional state to track selected projects for comparison
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);

  // for username
  useEffect(() => {
    const storedname = localStorage.getItem("name");
    if (storedname) {
      setname(storedname);
    }
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check if file is Excel
      const isExcel = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ].includes(selectedFile.type);

      if (!isExcel) {
        alert("Please upload only Excel files (.xls or .xlsx)");
        e.target.value = null; // Reset file input
        return;
      }
      setFile(selectedFile);
    }
  };

  // Fetch all projects
  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/projects", {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Handle file upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to upload");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:5000/api/projects", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: localStorage.getItem("token"),
        },
      });
      fetchProjects();
      alert("File uploaded successfully");
      setModal(false);
      setFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle project deletion
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/projects/${id}`, {
        headers: { token: localStorage.getItem("token") },
      });
      fetchProjects();
      alert("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project");
    }
  };

  // Handle file analysis
  const handleAnalyze = async (project) => {
    try {
      setIsLoading(true);
      setError(null);

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
          }
        );

        if (response.data) {
          // Update the project in the list with the analyzed data
          const updatedProjects = projects.map((p) =>
            p._id === project._id ? response.data : p
          );
          setProjects(updatedProjects);

          // Navigate to project summary
          navigate(`/project/${project._id}`);
        } else {
          throw new Error("No data received from analysis");
        }
      } else {
        // If already analyzed, just navigate
        navigate(`/project/${project._id}`);
      }
    } catch (error) {
      console.error("Analysis error:", error);
      let errorMessage = "Failed to analyze project. Please try again.";

      if (error.code === "ECONNABORTED") {
        errorMessage = "Analysis timed out. Please try again.";
      } else if (error.response) {
        // Server responded with error
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        // Request made but no response
        errorMessage =
          "Could not connect to server. Please check your connection.";
      }

      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze2 = async (project) => {
    try {
      setIsLoading(true);
      setError(null);

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
          }
        );

        if (response.data) {
          // Update the project in the list with the analyzed data
          const updatedProjects = projects.map((p) =>
            p._id === project._id ? response.data : p
          );
          setProjects(updatedProjects);

          // Navigate to forecast
          navigate(`/forecast/${project._id}`);
        } else {
          throw new Error("No data received from analysis");
        }
      } else {
        // If already analyzed, just navigate
        navigate(`/forecast/${project._id}`);
      }
    } catch (error) {
      console.error("Analysis error:", error);
      let errorMessage = "Failed to analyze project. Please try again.";

      if (error.code === "ECONNABORTED") {
        errorMessage = "Analysis timed out. Please try again.";
      } else if (error.response) {
        // Server responded with error
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        // Request made but no response
        errorMessage =
          "Could not connect to server. Please check your connection.";
      }

      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle project selection with max limit
  const handleSelectProject = (projectId) => {
    setSelectedProjects((prevSelected) => {
      if (prevSelected.includes(projectId)) {
        return prevSelected.filter((id) => id !== projectId);
      }
      return prevSelected.length < 5 // Limit to 5 projects for better comparison
        ? [...prevSelected, projectId]
        : prevSelected;
    });
  };

  // Handle comparison with proper error states
  const handleCompare = async () => {
    if (selectedProjects.length < 2 || selectedProjects.length > 5) {
      alert("Please select 2-5 projects to compare");
      return;
    }

    try {
      setIsComparing(true); // Start loading
      const response = await axios.get(
        `http://localhost:5000/api/compare?projectIds=${selectedProjects.join(
          ","
        )}`,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      if (response.data.success) {
        const { analysis, charts, bestPerformingCompany, id } =
          response.data.data;

        setComparisonResult({
          analysisId: id,
          insights: analysis,
          visualizations: charts,
          topPerformer: bestPerformingCompany,
        });

        navigate("/compare", {
          state: {
            analysisData: analysis,
            chartData: charts,
            bestCompany: bestPerformingCompany,
            analysisId: id,
          },
        });
      }
    } catch (error) {
      console.error("Comparison error:", error);

      const errorMessage =
        error.response?.data?.message ||
        (error.message.includes("AI analysis")
          ? "Analysis failed - please try different projects"
          : "Comparison service unavailable");

      alert(`Comparison failed: ${errorMessage}`);
    } finally {
      setIsComparing(false); // Stop loading regardless of success/error
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900">
      {/* Sidebar */}
      <Sidebar projects={projects}></Sidebar>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <TopBar name={name}></TopBar>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-auto px-4 py-6">
          {/* Dashboard Header */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 tracking-tight mb-6">
            Your Projects
          </h1>

          {/* Top Cards: Welcome & Quick Tips */}
          <QuickTips setModal={setModal} isLoading={isLoading}></QuickTips>

          {/* Recent Projects Header with Compare Button */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Recent Projects
              </h2>
              {/* Compare Selected Files Button - only shown if 2 or more projects are selected */}
              {selectedProjects.length >= 2 && (
                <button
                  onClick={handleCompare}
                  disabled={isComparing}
                  className={`px-4 py-2 rounded-lg font-medium text-white transition-colors duration-300 focus:outline-none flex items-center justify-center gap-2 ${
                    isComparing
                      ? "bg-gray-400 cursor-not-allowed"
                      : selectedProjects.length === 2
                      ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300"
                      : "bg-green-600 hover:bg-green-700 focus:ring-green-300"
                  }`}
                >
                  {isComparing ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Comparing...
                    </>
                  ) : (
                    "Compare Selected Files"
                  )}
                </button>
              )}
            </div>

            {/* Loading Spinner */}
            <Spinner isLoading={isLoading}></Spinner>

            {/* Empty State */}
            <EmptyState isLoading={isLoading} projects={projects}></EmptyState>

            {/* Project Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 
                  hover:shadow-lg hover:-translate-y-1 border border-gray-100 dark:border-slate-700"
                >
                  <div className="p-6">
                    {/* Additional: Checkbox for selecting project */}
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={selectedProjects.includes(project._id)}
                        onChange={() => handleSelectProject(project._id)}
                      />
                      <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {project.filename}
                      </span>
                    </div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1"></div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                            project.status === "analyzed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          }`}
                        >
                          {project.status === "analyzed"
                            ? "Analyzed"
                            : "Pending"}
                        </span>
                        <div className="relative">
                          <button
                            onClick={() =>
                              setMenuOpenId(
                                menuOpenId === project._id ? null : project._id
                              )
                            }
                            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {new Date(project.uploadedAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
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
                        Ask
                      </Link>

                      <button
                        onClick={() => handleAnalyze2(project)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white 
  rounded-lg font-medium transition-colors duration-300 focus:ring-4 focus:ring-emerald-300 focus:outline-none"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            x="3"
                            y="10"
                            width="4"
                            height="10"
                            fill="white"
                          />
                          <rect
                            x="9"
                            y="6"
                            width="4"
                            height="14"
                            fill="white"
                          />
                          <rect
                            x="15"
                            y="3"
                            width="4"
                            height="17"
                            fill="white"
                          />
                        </svg>
                        Prediction Analysis
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* Upload Modal */}
      <Modal
        modal={modal}
        setModal={setModal}
        file={file}
        setFile={setFile}
        isLoading={isLoading}
        handleUpload={handleUpload}
        handleFileChange={handleFileChange}
        formatFileSize={formatFileSize}
      ></Modal>
    </div>
  );
};

export default Dashboard;
