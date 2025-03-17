import React from 'react'

function QuickTips({setModal ,isLoading}) {
  return (
    <div>
        {/* Top Cards: Welcome & Quick Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            {/* Welcome Card (2 columns wide on large screens) */}
            <div className="bg-blue-600 text-white rounded-lg p-6 lg:col-span-2">
              <h2 className="text-2xl font-semibold mb-2">
                Welcome to Finbrief
              </h2>
              <p className="mb-4">Analyze Excel file with the power of AI.</p>
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
                <li>
                  Our AI automatically processes and analyzes your financial
                  data
                </li>
                <li>
                  Get instant visualizations, insights, and answers to your
                  questions
                </li>
              </ul>
            </div>
          </div>
    </div>
  )
}

export default QuickTips
