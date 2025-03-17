import React from 'react'

function Spinner({isLoading}) {
  return (
    <div>
       {/* Loading Spinner */}
       {isLoading && (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            )}
    </div>
  )
}

export default Spinner
