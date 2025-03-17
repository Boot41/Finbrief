"use client";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
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

const Forecast = () => {
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

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
              <h1 className="text-2xl md:text-3xl font-bold">Forecasting</h1>
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
          <div className="p-6 md:p-8 bg-white dark:bg-slate-800">
            {project.forecast && (
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
                  Forecast
                </h3>
                <div className="bg-white dark:bg-slate-700 rounded-lg p-4 shadow-sm">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {project.forecast}
                  </p>
                </div>
              </section>
            )}

            {/* Insights Section */}
            {project?.improvementsuggestions && (
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
                  Improvement Suggestions
                </h3>
                <div className="bg-white dark:bg-slate-700 rounded-lg p-4 shadow-sm">
                  <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {project.improvementsuggestions}
                  </div>
                </div>
              </section>
            )}

            {/* Future Predictions Section */}
            {project?.futurePredictions && (
              <section className="mb-6 bg-slate-50 dark:bg-slate-700/30 rounded-xl p-6 shadow-sm">
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
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  Future Predictions
                </h3>
                <div className="bg-white dark:bg-slate-700 rounded-lg p-4 shadow-sm">
                  <Line
                    data={{
                      labels: project.futurePredictions.labels,
                      datasets: project.futurePredictions.datasets.map(
                        (dataset, index) => ({
                          ...dataset,
                          borderColor: index === 0 ? "#4CAF50" : "#F44336",
                          backgroundColor:
                            index === 0
                              ? "rgba(76, 175, 80, 0.2)"
                              : "rgba(244, 67, 54, 0.2)",
                        })
                      ),
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        title: {
                          display: true,
                          text: "Future Financial Predictions",
                          font: {
                            size: 16,
                            weight: "bold",
                          },
                          color: "#334155", // text-slate-700
                        },
                        legend: {
                          position: "top",
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
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: "Amount",
                            color: "#64748b",
                          },
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
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forecast;
