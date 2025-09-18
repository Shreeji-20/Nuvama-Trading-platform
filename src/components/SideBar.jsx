import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ isOpen = true, onClose = () => {} }) {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/" || path === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    return location.pathname === path;
  };

  const NavLink = ({ to, children, icon }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded transition-colors duration-200 ${
        isActive(to)
          ? "bg-blue-600 text-white"
          : "text-gray-300 hover:bg-white/10 hover:text-white"
      }`}
      // onClick={onClose}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {children}
    </Link>
  );

  return (
    <>
      {/* Sidebar: always visible on desktop, togglable on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 bg-gray-800 dark:bg-gray-900 text-white p-6 sidebar-bg overflow-y-auto transform transition-transform duration-200 border-r border-gray-700 dark:border-gray-600 shadow-light-lg dark:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ willChange: "transform" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl font-bold text-white brand-accent">
              N
            </div>
            <div>
              <div className="text-lg font-semibold text-white">Nuvama</div>
              <div className="text-xs text-gray-300">Options Dashboard</div>
            </div>
          </div>
          {/* Show close button only on mobile */}
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-1 ml-2 md:hidden text-white hover:bg-white/10 rounded transition-colors"
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
        <nav className="space-y-2 text-sm">
          <NavLink to="/dashboard" icon="📊">
            Dashboard
          </NavLink>
          <NavLink to="/users" icon="👥">
            Users
          </NavLink>
          <NavLink to="/stratergies" icon="💼">
            Strategies
          </NavLink>
          <NavLink to="/optionchain" icon="⛓️">
            Option Chain
          </NavLink>
          <NavLink to="/optionchaincustom" icon="🎯">
            Custom Option Chain
          </NavLink>
          <NavLink to="/multilegspread" icon="📈">
            Multi-Leg Spread
          </NavLink>
          <NavLink to="/advanced-options" icon="🚀">
            Advanced Options
          </NavLink>
          <NavLink to="/advanced-options-table" icon="📋">
            Advanced Options Table
          </NavLink>
          <NavLink to="/orders-new" icon="🔄">
            Orders Management
          </NavLink>
          <NavLink to="/execution-details" icon="📊">
            Execution Details
          </NavLink>
          <NavLink to="/observation-monitor" icon="📈">
            Observation Monitor
          </NavLink>
          <NavLink to="/observation-dashboard" icon="🎯">
            Observation Dashboard
          </NavLink>
          <NavLink to="/observation-tables" icon="📊">
            Observation Tables
          </NavLink>
        </nav>
      </aside>
      {/* )} */}
    </>
  );
}
