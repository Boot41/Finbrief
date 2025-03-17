import React from 'react'

function TopBar({name}) {
  return (
    <div>
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Dashboard
          </h1>
          <span className="text-gray-700 dark:text-gray-300">{name}</span>
        </header>
    </div>
  )
}

export default TopBar
