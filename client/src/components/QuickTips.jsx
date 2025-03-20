import React from "react";

function QuickTips({ setModal, isLoading }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Welcome Card - Gradient Background */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-600 to-blue-500 text-white rounded-2xl p-6 lg:col-span-2 shadow-lg">
        <h2 className="text-3xl font-bold mb-3">Welcome to FinBrief</h2>
        <p className="mb-5 text-lg opacity-90">
          Analyze Excel files with the power of AI.
        </p>
        <button
          onClick={() => setModal(true)}
          className="bg-gradient-to-r from-gray-900 to-gray-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          + Add Excel File
        </button>
      </div>

      {/* Quick Start Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">🚀 Quick Start</h2>
        <ul className="list-disc list-inside space-y-2 text-md opacity-90">
          <li>Simply upload your Excel files.</li>
          <li>Our AI will analyze your financial data instantly.</li>
          <li>Get insights, predictions, and interactive charts.</li>
        </ul>
      </div>
    </div>
  );
}

export default QuickTips;
