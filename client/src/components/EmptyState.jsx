import React from 'react'

function EmptyState({isLoading ,projects}) {
  return (
    <div>
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
    </div>
  )
}

export default EmptyState
