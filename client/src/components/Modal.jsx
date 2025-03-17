import React from 'react'

function Modal({modal ,setModal ,setFile ,handleUpload ,file ,isLoading ,handleFileChange ,formatFileSize}) {
  return (
    <div>
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

export default Modal
