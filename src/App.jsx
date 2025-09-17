import { useState, useEffect } from "react";
import "./App.css";
import Sidebar from "./components/SideBar";
import Users from "./pages/Users";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Stratergies from "./pages/Stratergies";
import OptionChains from "./pages/OptionChain";
import SpreadPage from "./pages/CustomOptionChain";
import MultiLegSpread from "./pages/MultiLegSpread";
import AdvancedOptionsForm from "./pages/AdvancedOptionsForm";
import AdvancedOptionsTable from "./pages/AdvancedOptionsTable";
import Dashboard from "./pages/Dashboard";
import OrdersTableNew from "./pages/OrdersTable_New";
import AutoLogin from "./pages/AutoLogin";
import ExecutionDetails from "./pages/ExecutionDetails";
import ObservationMonitor from "./pages/ObservationMonitor";

function App() {
  const [count, setCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("darkMode");
      if (savedTheme !== null) {
        return savedTheme === "true" ? "dark" : "light";
      }
      // Check system preference if no saved theme
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } catch (e) {
      return "light";
    }
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("darkMode", (theme === "dark").toString());
    } catch (e) {}
  }, [theme]);
  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <Router>
      <div className="min-h-screen flex bg-light-primary dark:bg-gray-900">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* backdrop for mobile when sidebar is open */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden ${
            sidebarOpen ? "block" : "hidden"
          }`}
          onClick={closeSidebar}
        />

        <div
          className={`flex-1 flex flex-col bg-light-primary dark:bg-gray-900 transition-all duration-200 overflow-hidden ${
            sidebarOpen ? "md:ml-64" : "ml-0"
          }`}
        >
          {/* Header always visible */}
          <header className="mobile-header p-2 flex items-center justify-between bg-light-surface dark:bg-gray-800 border-b border-light-border dark:border-gray-700">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSidebar}
                aria-label="Open menu"
                className="p-2 rounded hover:bg-light-card-hover dark:hover:bg-gray-700 text-light-text-primary dark:text-white"
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div className="font-bold text-light-text-primary dark:text-white">
                Nuvama
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setTheme((t) => (t === "light" ? "dark" : "light"))
                }
                className="p-2 rounded-lg bg-light-elevated dark:bg-gray-700 hover:bg-light-card-hover dark:hover:bg-gray-600 transition-colors duration-200 text-light-text-primary dark:text-white"
                aria-label="Toggle theme"
                title={
                  theme === "light"
                    ? "Switch to Dark Mode"
                    : "Switch to Light Mode"
                }
              >
                {theme === "light" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                )}
              </button>
              <div className="w-2" />
            </div>
          </header>

          <main className="flex-1 p-0 overflow-hidden ">
            <div className="flex flex-col w-full h-full max-w-none px-0 md:px-0 overflow-hidden">
              {/* Routes */}
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/stratergies" element={<Stratergies />} />
                <Route path="/optionchain" element={<OptionChains />} />
                <Route path="/optionchaincustom" element={<SpreadPage />} />
                <Route path="/multilegspread" element={<MultiLegSpread />} />
                <Route
                  path="/advanced-options"
                  element={<AdvancedOptionsForm />}
                />
                <Route
                  path="/advanced-options-table"
                  element={<AdvancedOptionsTable />}
                />
                <Route path="/orders-new" element={<OrdersTableNew />} />
                <Route path="/auto-login" element={<AutoLogin />} />
                <Route
                  path="/execution-details"
                  element={<ExecutionDetails />}
                />
                <Route
                  path="/observation-monitor"
                  element={<ObservationMonitor />}
                />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
