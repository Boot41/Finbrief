import React from "react";
import { useLocation } from "react-router-dom";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const Compare = () => {
  const location = useLocation();
  const { analysisData, chartData, bestCompany } = location.state || {};

  // Validate data structure
  if (!analysisData || !chartData) {
    return (
      <div className="text-center p-8 text-red-500">
        No comparison data available. Please perform a new analysis.
      </div>
    );
  }

  // Chart configuration functions
  const createChart = (chartKey, chartConfig) => {
    const isTimeSeries = chartKey === "TimeSeriesComparison";
    
    return {
      labels: chartConfig.labels,
      datasets: chartConfig.datasets.map(dataset => ({
        ...dataset,
        borderColor: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        backgroundColor: `#${Math.floor(Math.random()*16777215).toString(16)}77`,
        tension: isTimeSeries ? 0.4 : 0,
        fill: isTimeSeries
      }))
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Financial Comparison Analysis
          </h1>
          {bestCompany && (
            <div className="bg-emerald-100 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-emerald-800">
                Best Performing Company:{" "}
                <span className="underline">{bestCompany}</span>
              </h2>
            </div>
          )}
        </div>

        {/* Key Insights Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Key Metrics
            </h2>
            <pre className="whitespace-pre-wrap font-sans text-gray-600">
              {analysisData.KeyMetrics}
            </pre>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Performance Ranking
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              {analysisData.PerformanceRanking.map((company, index) => (
                <li 
                  key={index}
                  className={`text-lg ${index === 0 ? "font-bold text-emerald-600" : "text-gray-600"}`}
                >
                  {company}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Charts Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Comparative Visualizations
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {Object.entries(chartData).map(([chartKey, chartConfig]) => (
              <div key={chartKey} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">
                  {chartKey.replace(/([A-Z])/g, " $1")}
                </h3>
                <div className="h-64">
                  {chartKey === "TimeSeriesComparison" ? (
                    <Line
                      data={createChart(chartKey, chartConfig)}
                      options={{ responsive: true, maintainAspectRatio: false }}
                    />
                  ) : chartKey === "Distribution" ? (
                    <Pie
                      data={createChart(chartKey, chartConfig)}
                      options={{ responsive: true, maintainAspectRatio: false }}
                    />
                  ) : (
                    <Bar
                      data={createChart(chartKey, chartConfig)}
                      options={{ responsive: true, maintainAspectRatio: false }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Analysis Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Trends & Patterns
            </h2>
            <pre className="whitespace-pre-wrap font-sans text-gray-600">
              {analysisData.Trends}
            </pre>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Recommendations
            </h2>
            <pre className="whitespace-pre-wrap font-sans text-gray-600">
              {analysisData.Recommendations}
            </pre>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Analysis Summary
            </h2>
            <div className="space-y-3">
              <p className="text-gray-600">
                <strong>Companies Compared:</strong>{" "}
                {analysisData.PerformanceRanking.join(", ")}
              </p>
              <p className="text-gray-600">
                <strong>Key Focus Areas:</strong> Revenue Growth, Profit Margins, 
                Expense Management
              </p>
              <p className="text-gray-600">
                <strong>Time Period:</strong> Last 3 Fiscal Years
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compare;