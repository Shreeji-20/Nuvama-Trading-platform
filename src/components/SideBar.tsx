import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface NavbarProps {
  isOpen?: boolean;
  onClose?: () => void;
  theme?: "light" | "dark";
  setTheme?: (theme: "light" | "dark") => void;
}

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  icon?: string;
  onClick?: () => void;
  isMobile?: boolean;
}

export default function Navbar({
  isOpen = true,
  onClose = () => {},
  theme = "light",
  setTheme = () => {},
}: NavbarProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const toggleTheme = (): void => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isActive = (path: string): boolean => {
    if (path === "/" || path === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    return location.pathname === path;
  };

  const NavLink: React.FC<NavLinkProps> = ({
    to,
    children,
    icon,
    onClick,
    isMobile = false,
  }) => (
    <Link
      to={to}
      className={`flex items-center gap-1 px-2 py-1.5 rounded transition-colors duration-200 whitespace-nowrap text-xs ${
        isActive(to)
          ? "bg-blue-600 text-white"
          : "text-gray-300 hover:bg-white/10 hover:text-white"
      } ${isMobile ? "w-full justify-start" : ""}`}
      onClick={onClick}
      style={{ fontSize: "0.7rem" }}
    >
      {icon && (
        <span className="text-sm" style={{ fontSize: "0.8rem" }}>
          {icon}
        </span>
      )}
      <span className={`${isMobile ? "block" : "hidden md:inline xl:inline"}`}>
        {children}
      </span>
    </Link>
  );

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = (): void => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Horizontal Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-800 dark:bg-gray-900 text-white border-b border-gray-700 dark:border-gray-600 shadow-lg">
        <div className="px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-12 sm:h-14">
            {/* Brand/Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm sm:text-lg font-bold text-white brand-accent">
                N
              </div>
              <div className="hidden sm:block">
                <div
                  className="text-sm font-semibold text-white"
                  style={{ fontSize: "0.8rem" }}
                >
                  Nuvama
                </div>
                <div
                  className="text-xs text-gray-300 leading-none"
                  style={{ fontSize: "0.6rem" }}
                >
                  Options Dashboard
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block flex-1 mx-4">
              <div className="flex items-center justify-center space-x-0.5 overflow-x-auto scrollbar-hide">
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
                {/* <NavLink to="/optionchaincustom" icon="🎯">
                  Custom Option Chain
                </NavLink> */}
                <NavLink to="/multilegspread" icon="📈">
                  Multi-Leg Spread
                </NavLink>
                {/* <NavLink to="/advanced-options" icon="🚀">
                  Advanced Options
                </NavLink> */}
                <NavLink to="/advanced-options-table" icon="📋">
                  Advanced Options Table
                </NavLink>
                <NavLink to="/advanced-options-builder" icon="🔧">
                  Options Strategy Builder
                </NavLink>
                <NavLink to="/deployed-strategies" icon="📊">
                  Deployed Strategies
                </NavLink>
                <NavLink to="/strategy-tags" icon="🏷️">
                  Strategy Tags
                </NavLink>
                <NavLink to="/orders-new" icon="🔄">
                  Orders Management
                </NavLink>
                {/* <NavLink to="/execution-details" icon="📊">
                  Execution Details
                </NavLink> */}
                {/* <NavLink to="/observation-monitor" icon="📈">
                  Observation Monitor
                </NavLink> */}
                {/* <NavLink to="/observation-dashboard" icon="🎯">
                  Observation Dashboard
                </NavLink> */}
                <NavLink to="/observation-tables" icon="📊">
                  Observation Tables
                </NavLink>
              </div>
            </div>

            {/* Theme Toggle Button */}
            <div className="flex-shrink-0 mr-2">
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white transition-colors duration-200"
                aria-label="Toggle theme"
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex-shrink-0">
              <button
                onClick={toggleMobileMenu}
                className="p-1.5 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
                aria-expanded="false"
                aria-label="Main menu"
              >
                <svg
                  className="block h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={
                      isMobileMenuOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-800 dark:bg-gray-900 border-t border-gray-700 max-h-80 overflow-y-auto">
              {/* Theme Toggle in Mobile Menu */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors duration-200 text-xs text-gray-300 hover:bg-white/10 hover:text-white"
                style={{ fontSize: "0.7rem" }}
              >
                <span className="text-sm" style={{ fontSize: "0.8rem" }}>
                  {theme === "dark" ? "☀️" : "🌙"}
                </span>
                <span>
                  Switch to {theme === "dark" ? "Light" : "Dark"} Mode
                </span>
              </button>
              <NavLink
                to="/dashboard"
                icon="📊"
                onClick={closeMobileMenu}
                isMobile={true}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/users"
                icon="👥"
                onClick={closeMobileMenu}
                isMobile={true}
              >
                Users
              </NavLink>
              <NavLink
                to="/stratergies"
                icon="💼"
                onClick={closeMobileMenu}
                isMobile={true}
              >
                Strategies
              </NavLink>
              <NavLink
                to="/optionchain"
                icon="⛓️"
                onClick={closeMobileMenu}
                isMobile={true}
              >
                Option Chain
              </NavLink>
              <NavLink
                to="/optionchaincustom"
                icon="🎯"
                onClick={closeMobileMenu}
                isMobile={true}
              >
                Custom Option Chain
              </NavLink>
              <NavLink
                to="/multilegspread"
                icon="📈"
                onClick={closeMobileMenu}
                isMobile={true}
              >
                Multi-Leg Spread
              </NavLink>
              <NavLink
                to="/advanced-options"
                icon="🚀"
                onClick={closeMobileMenu}
                isMobile={true}
              >
                Advanced Options
              </NavLink>
              <NavLink
                to="/advanced-options-table"
                icon="📋"
                onClick={closeMobileMenu}
                isMobile={true}
              >
                Advanced Options Table
              </NavLink>
              <NavLink
                to="/advanced-options-builder"
                icon="🔧"
                onClick={closeMobileMenu}
                isMobile={true}
              >
                Options Strategy Builder
              </NavLink>
              <NavLink
                to="/deployed-strategies"
                icon="📊"
                onClick={closeMobileMenu}
                isMobile={true}
              >
                Deployed Strategies
              </NavLink>
              <NavLink
                to="/strategy-tags"
                icon="🏷️"
                onClick={closeMobileMenu}
                isMobile={true}
              >
                Strategy Tags
              </NavLink>
              <NavLink
                to="/orders-new"
                icon="🔄"
                onClick={closeMobileMenu}
                isMobile={true}
              >
                Orders Management
              </NavLink>
              <NavLink
                to="/execution-details"
                icon="📊"
                onClick={closeMobileMenu}
                isMobile={true}
              >
                Execution Details
              </NavLink>
              <NavLink
                to="/observation-monitor"
                icon="📈"
                onClick={closeMobileMenu}
                isMobile={true}
              >
                Observation Monitor
              </NavLink>
              <NavLink
                to="/observation-dashboard"
                icon="🎯"
                onClick={closeMobileMenu}
                isMobile={true}
              >
                Observation Dashboard
              </NavLink>
              <NavLink
                to="/observation-tables"
                icon="📊"
                onClick={closeMobileMenu}
                isMobile={true}
              >
                Observation Tables
              </NavLink>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
