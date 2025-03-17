"use client";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react"; // Add useRef for managing speech recognition
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const projectId = new URLSearchParams(location.search).get("projectId");
  const [isListening, setIsListening] = useState(false); // Track speech recognition state
  const recognitionRef = useRef(null); // Ref for speech recognition instance

  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false; // Stop after one sentence
    recognitionRef.current.interimResults = false; // Only final results
    recognitionRef.current.lang = "en-US"; // Set language

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript); // Update search input with transcribed text
    };

    recognitionRef.current.onerror = (event) => {
      setError("Speech recognition error: " + event.error);
      setIsListening(false);
    };
  };

  // Start speech recognition
  const startListening = () => {
    if (!recognitionRef.current) {
      initializeSpeechRecognition();
    }
    recognitionRef.current.start();
  };

  // Stop speech recognition
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !projectId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/projects/search/${projectId}?query=${encodeURIComponent(
          searchQuery
        )}`,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      // Ensure the response data is properly structured
      const data = response.data;
      if (typeof data === "string") {
        try {
          setSearchResults(JSON.parse(data));
        } catch (e) {
          console.error("Failed to parse response data:", e);
          setError("Invalid response format");
        }
      } else {
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Error searching:", error);
      setError(error.response?.data?.message || "Failed to perform search");
    } finally {
      setIsLoading(false);
    }
  };

  const cleanUpText = (text) => {
    // Remove stars and other special characters
    return text.replace(/\*\*/g, "").replace(/\*/g, "").trim();
  };

  const formatRelevantData = (data) => {
    if (!data) return [];

    if (Array.isArray(data)) {
      return data.map((item) => {
        if (typeof item === "string") {
          return cleanUpText(item);
        }
        if (typeof item === "object") {
          return `${item.Month}: ${
            item.Total_Expenses || item["Total Expenses"]
          }`;
        }
        return String(item);
      });
    }

    // If it's an object with Month and Total Expenses
    if (typeof data === "object") {
      return Object.entries(data).map(([key, value]) => {
        if (key === "Month" && value && typeof value === "string") {
          return `${value}: ${data["Total Expenses"] || data.Total_Expenses}`;
        }
        return `${key}: ${value}`;
      });
    }

    return [];
  };

  const getChartColors = (count) => {
    const colors = [
      "rgba(75, 192, 192, 0.6)",
      "rgba(255, 99, 132, 0.6)",
      "rgba(54, 162, 235, 0.6)",
      "rgba(255, 206, 86, 0.6)",
      "rgba(153, 102, 255, 0.6)",
      "rgba(255, 159, 64, 0.6)",
      "rgba(199, 199, 199, 0.6)",
      "rgba(83, 102, 255, 0.6)",
      "rgba(40, 159, 64, 0.6)",
      "rgba(210, 199, 199, 0.6)",
    ];

    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  };

  const renderCharts = () => {
    if (!searchResults?.ChartData) return null;

    try {
      const charts = [];

      // Line Chart for Time Series Data
      if (searchResults.ChartData.TimeSeries) {
        const timeSeriesData = {
          labels: searchResults.ChartData.TimeSeries.labels,
          datasets: searchResults.ChartData.TimeSeries.datasets.map(
            (dataset) => ({
              ...dataset,
              borderColor: dataset.label.includes("Revenue")
                ? "#4CAF50"
                : "#F44336",
              backgroundColor: dataset.label.includes("Revenue")
                ? "rgba(76, 175, 80, 0.1)"
                : "rgba(244, 67, 54, 0.1)",
              tension: 0.4,
              fill: true,
            })
          ),
        };

        charts.push(
          <div
            key="timeseries"
            className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
          >
            <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
              <span className="inline-block w-2 h-6 bg-indigo-500 mr-2 rounded"></span>
              Trend Analysis
            </h3>
            <div className="h-[300px] md:h-[400px]">
              <Line
                data={timeSeriesData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "top" },
                    title: { display: false },
                    tooltip: {
                      backgroundColor: "rgba(17, 24, 39, 0.8)",
                      padding: 12,
                      titleFont: { size: 14 },
                      bodyFont: { size: 13 },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: "rgba(156, 163, 175, 0.1)" },
                    },
                    x: {
                      grid: { display: false },
                    },
                  },
                }}
              />
            </div>
          </div>
        );
      }

      // Bar Chart for Category Comparison
      if (searchResults.ChartData.Categories) {
        const categoryData = {
          labels: searchResults.ChartData.Categories.labels,
          datasets: searchResults.ChartData.Categories.datasets.map(
            (dataset) => ({
              ...dataset,
              backgroundColor: getChartColors(dataset.data.length),
            })
          ),
        };

        charts.push(
          <div
            key="categories"
            className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
          >
            <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
              <span className="inline-block w-2 h-6 bg-indigo-500 mr-2 rounded"></span>
              Category Analysis
            </h3>
            <div className="h-[300px] md:h-[400px]">
              <Bar
                data={categoryData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "top" },
                    title: { display: false },
                    tooltip: {
                      backgroundColor: "rgba(17, 24, 39, 0.8)",
                      padding: 12,
                      titleFont: { size: 14 },
                      bodyFont: { size: 13 },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: "rgba(156, 163, 175, 0.1)" },
                    },
                    x: {
                      grid: { display: false },
                    },
                  },
                }}
              />
            </div>
          </div>
        );
      }

      // Pie Chart for Distribution
      if (searchResults.ChartData.Distribution) {
        const distributionData = {
          labels: searchResults.ChartData.Distribution.labels,
          datasets: [
            {
              data: searchResults.ChartData.Distribution.data,
              backgroundColor: getChartColors(
                searchResults.ChartData.Distribution.labels.length
              ),
            },
          ],
        };

        charts.push(
          <div
            key="distribution"
            className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
          >
            <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
              <span className="inline-block w-2 h-6 bg-indigo-500 mr-2 rounded"></span>
              Distribution Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-[300px] flex items-center justify-center">
                <Pie
                  data={distributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "right",
                        labels: {
                          boxWidth: 12,
                          padding: 15,
                          font: { size: 12 },
                        },
                      },
                      title: { display: false },
                      tooltip: {
                        backgroundColor: "rgba(17, 24, 39, 0.8)",
                        padding: 12,
                        titleFont: { size: 14 },
                        bodyFont: { size: 13 },
                      },
                    },
                  }}
                />
              </div>
              <div className="h-[300px] flex items-center justify-center">
                <Doughnut
                  data={distributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "right",
                        labels: {
                          boxWidth: 12,
                          padding: 15,
                          font: { size: 12 },
                        },
                      },
                      title: { display: false },
                      tooltip: {
                        backgroundColor: "rgba(17, 24, 39, 0.8)",
                        padding: 12,
                        titleFont: { size: 14 },
                        bodyFont: { size: 13 },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        );
      }

      return charts.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-indigo-900 mb-4 border-b border-indigo-100 pb-2">
            Data Visualization
          </h2>
          {charts}
        </div>
      ) : null;
    } catch (error) {
      console.error("Error rendering charts:", error);
      return (
        <div className="bg-white p-6 rounded-xl shadow-lg text-red-500 border border-red-100">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Failed to render charts: Invalid data format
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-indigo-900 mb-8 flex items-center">
            {/* Back Arrow Icon */}
            <Link
              to="/dashboard"
              className="mr-3 text-indigo-600 hover:text-indigo-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
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
            </Link>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mr-3 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Search Financial Data
          </h1>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
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
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask any question about your financial data..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300 shadow-sm"
              />

              {/* Microphone Button */}
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {isListening ? (
                  // Stop (Square) Icon when listening
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 6h12v12H6z" />
                  </svg>
                ) : (
                  // Microphone Icon when not listening
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2a4 4 0 00-4 4v6a4 4 0 008 0V6a4 4 0 00-4-4zM5 10v2a7 7 0 0014 0v-2h-2v2a5 5 0 01-10 0v-2H5zm7 10a3 3 0 003-3h-6a3 3 0 003 3zm-3 1h6v2H9v-2z" />
                  </svg>
                )}
              </button>
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Searching...
                </span>
              ) : (
                <span className="flex items-center">
                  Search
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 shadow-sm">
            <div className="flex items-center">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
              <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                <div className="h-8 w-8 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults && !isLoading && (
          <div className="space-y-8">
            {/* Answer */}
            {searchResults.Answer && (
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-2xl font-bold text-indigo-900 mb-4 border-b border-indigo-100 pb-2 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2 text-indigo-600"
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
                  Answer
                </h2>
                <div className="text-gray-700 whitespace-pre-wrap bg-indigo-50 p-4 rounded-lg">
                  {typeof searchResults.Answer === "object"
                    ? Object.entries(searchResults.Answer).map(
                        ([month, value]) => (
                          <div
                            key={month}
                            className="flex justify-between py-1 border-b border-indigo-100 last:border-0"
                          >
                            <span className="font-medium">{month}:</span>
                            <span>{value}</span>
                          </div>
                        )
                      )
                    : cleanUpText(searchResults.Answer)}
                </div>
              </div>
            )}

            {/* Relevant Data */}
            {searchResults.RelevantData &&
              searchResults.RelevantData.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <h2 className="text-2xl font-bold text-indigo-900 mb-4 border-b border-indigo-100 pb-2 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-2 text-indigo-600"
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
                    Relevant Data Points
                  </h2>
                  <ul className="space-y-2 bg-indigo-50 p-4 rounded-lg">
                    {formatRelevantData(searchResults.RelevantData).map(
                      (point, index) => (
                        <li
                          key={index}
                          className="text-gray-700 flex items-start"
                        >
                          <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-2"></span>
                          {point}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {/* Charts */}
            {renderCharts()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
