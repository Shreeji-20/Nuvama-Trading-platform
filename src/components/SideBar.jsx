import React from "react";

export default function Sidebar({ isOpen = true, onClose = () => {} }) {
  return (
    <>
      {/* Sidebar: always visible on desktop, togglable on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 bg-gray-800 dark:bg-gray-900 text-white p-6 sidebar-bg overflow-y-auto transform transition-transform duration-200 border-r border-gray-700 dark:border-gray-600 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ willChange: "transform" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl font-bold brand-accent">
              N
            </div>
            <div>
              <div className="text-lg font-semibold">Nuvama</div>
              <div className="text-xs text-gray-300">Options Dashboard</div>
            </div>
          </div>
          {/* Show close button only on mobile */}
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-1 ml-2 md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav className="space-y-4 text-sm">
          <a
            href="#dashboard"
            className="block px-3 py-2 rounded hover:bg-white/10 hover:text-white transition-colors duration-200"
          >
            Dashboard
          </a>
          <a
            href="/users"
            className="block px-3 py-2 rounded hover:bg-white/10 hover:text-white transition-colors duration-200"
          >
            Users
          </a>
          <a
            href="/stratergies"
            className="block px-3 py-2 rounded hover:bg-white/10 hover:text-white transition-colors duration-200"
          >
            Strategies
          </a>
          <a
            href="/optionchain"
            className="block px-3 py-2 rounded hover:bg-white/10 hover:text-white transition-colors duration-200"
          >
            OptionChain
          </a>
          <a
            href="/optionchaincustom"
            className="block px-3 py-2 rounded hover:bg-white/10 hover:text-white transition-colors duration-200"
          >
            OptionChain - Custom Strikes
          </a>
        </nav>
      </aside>
      {/* )} */}
    </>
  );
}
