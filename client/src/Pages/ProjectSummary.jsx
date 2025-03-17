"use client";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import jsPDF from "jspdf";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ProjectSummary = () => {
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();

  // Handle print functionality using jspdf
  const handlePrint = () => {
    const input = printRef.current;

    if (!input) {
      console.error("Nothing to print: printRef.current is null or undefined");
      return;
    }

    // Create a new PDF instance
    const pdf = new jsPDF("p", "mm", "a4"); // Portrait mode, A4 size

    // Add content to the PDF
    pdf.html(input, {
      callback: (pdf) => {
        pdf.save("project-summary.pdf"); // Save the PDF
      },
      margin: [20, 20, 20, 20], // Margins (top, right, bottom, left)
      autoPaging: "text", // Automatically paginate content
      x: 0, // X position
      y: 0, // Y position
      width: 190, // Width of the content in the PDF
      windowWidth: input.scrollWidth, // Width of the HTML content
      background: "#ffffff",
    });
  };

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/projects/${id}`,
          {
            headers: { token: localStorage.getItem("token") },
          }
        );

        if (!response.data) {
          setError("Project not found");
          return;
        }
        setProject(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load project details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${
      sizes[i]
    }`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            Loading project details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-5 rounded-lg shadow-md max-w-lg w-full">
          <div className="flex items-center mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2 text-red-500 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <strong className="font-semibold text-lg">Error</strong>
          </div>
          <p className="mb-4">{error}</p>
          <Link
            to="/dashboard"
            className="mr-3 text-indigo-600 hover:text-indigo-800 inline-flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 dark:bg-indigo-700 text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Left side: "<" button + Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-xl font-bold text-white hover:text-indigo-200 transition-colors duration-300"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
              </button>
              <h1 className="text-2xl md:text-3xl font-bold">
                Project Summary
              </h1>
            </div>

            {/* Right side: now goes to "/search" instead of "/dashboard" */}
            <button
              onClick={() => navigate(`/search/?projectId=${id}`)}
              className="inline-flex items-center px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-colors duration-300 focus:ring-4 focus:ring-pink-300 focus:outline-none"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Search Page
            </button>
          </div>

          {/* Content to be printed */}
          <div ref={printRef} className="p-6 md:p-8 bg-white dark:bg-slate-800">
            {/* File Details Section */}
            <section className="mb-10 bg-slate-50 dark:bg-slate-700/30 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-indigo-500 dark:text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                File Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1 p-4 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Filename
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {project.filename}
                  </span>
                </div>
                <div className="flex flex-col space-y-1 p-4 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    File Size
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {formatFileSize(project.size)}
                  </span>
                </div>
                <div className="flex flex-col space-y-1 p-4 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Uploaded At
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {new Date(project.uploadedAt).toLocaleString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex flex-col space-y-1 p-4 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Status
                  </span>
                  <span className="inline-flex items-center">
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${
                        project.status === "analyzed"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    ></span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">
                      {project.status}
                    </span>
                  </span>
                </div>
              </div>
            </section>

            {/* Summary Section */}
            {project.summary && (
              <section className="mb-10 bg-slate-50 dark:bg-slate-700/30 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2 text-indigo-500 dark:text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Summary
                </h3>
                <div className="bg-white dark:bg-slate-700 rounded-lg p-4 shadow-sm">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {project.summary}
                  </p>
                </div>
              </section>
            )}

            {/* Insights Section */}
            {project?.insights && (
              <section className="mb-10 bg-slate-50 dark:bg-slate-700/30 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-6 text-slate-800 dark:text-slate-200 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2 text-indigo-500 dark:text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Insights
                </h3>
                <div className="bg-white dark:bg-slate-700 rounded-lg p-4 shadow-sm">
                  <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {project.insights}
                  </div>
                </div>
              </section>
            )}

            {/* Financial Charts Section */}
            {project?.chartData && (
              <section className="mb-10 bg-slate-50 dark:bg-slate-700/30 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-6 text-slate-800 dark:text-slate-200 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2 text-indigo-500 dark:text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                  Financial Charts
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {project.chartData.ExpensesByCategory && (
                    <div className="bg-white dark:bg-slate-700 rounded-lg p-4 shadow-sm">
                      <h4 className="text-lg font-medium mb-4 text-slate-700 dark:text-slate-300">
                        Expenses by Category
                      </h4>
                      <div className="bg-white dark:bg-slate-800 p-2 rounded-lg">
                        <Line
                          data={{
                            labels: project.chartData.ExpensesByCategory.labels,
                            datasets:
                              project.chartData.ExpensesByCategory.datasets.map(
                                (dataset) => ({
                                  ...dataset,
                                  borderColor: "pink",
                                  backgroundColor: "rgba(255, 99, 132, 0.2)",
                                })
                              ),
                          }}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: {
                                labels: {
                                  color: "#64748b", // text-slate-500
                                },
                              },
                            },
                            scales: {
                              x: {
                                grid: {
                                  color: "rgba(203, 213, 225, 0.2)",
                                },
                                ticks: {
                                  color: "#64748b",
                                },
                              },
                              y: {
                                grid: {
                                  color: "rgba(203, 213, 225, 0.2)",
                                },
                                ticks: {
                                  color: "#64748b",
                                },
                              },
                            },
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {project.chartData.TotalExpenses && (
                    <div className="bg-white dark:bg-slate-700 rounded-lg p-4 shadow-sm">
                      <h4 className="text-lg font-medium mb-4 text-slate-700 dark:text-slate-300">
                        Total Expenses
                      </h4>
                      <div className="bg-white dark:bg-slate-800 p-2 rounded-lg">
                        <Line
                          data={{
                            labels: project.chartData.TotalExpenses.labels,
                            datasets:
                              project.chartData.TotalExpenses.datasets.map(
                                (dataset) => ({
                                  ...dataset,
                                  borderColor: "pink",
                                  backgroundColor: "rgba(255, 99, 132, 0.2)",
                                })
                              ),
                          }}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: {
                                labels: {
                                  color: "#64748b",
                                },
                              },
                            },
                            scales: {
                              x: {
                                grid: {
                                  color: "rgba(203, 213, 225, 0.2)",
                                },
                                ticks: {
                                  color: "#64748b",
                                },
                              },
                              y: {
                                grid: {
                                  color: "rgba(203, 213, 225, 0.2)",
                                },
                                ticks: {
                                  color: "#64748b",
                                },
                              },
                            },
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Footer with Download Button (commented out as example) */}
          {/* 
          <div className="bg-slate-50 dark:bg-slate-700/30 px-6 py-4 flex justify-end">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors duration-300 focus:ring-4 focus:ring-emerald-300 focus:outline-none shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download PDF
            </button>
          </div> 
          */}
        </div>
      </div>
    </div>
  );
};

export default ProjectSummary;
