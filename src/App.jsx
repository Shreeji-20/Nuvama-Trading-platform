import { useState, useEffect } from "react";
import "./App.css";
import Sidebar from "./components/SideBar";
import Users from "./pages/Users";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Stratergies from "./pages/Stratergies";
import OptionChains from "./pages/OptionChain";
import SpreadPage from "./pages/CustomOptionChain";
import MultiLegSpread from "./pages/MultiLegSpread";
// import AdvancedOptionsForm from "./pages/AdvancedOptionsForm";
import AdvancedOptionsTable from "./pages/AdvancedOptionsTable";
import AdvancedOptionsBuilder from "./pages/AdvancedOptionsBuilder";
import Dashboard from "./pages/Dashboard";
import OrdersTableNew from "./pages/OrdersTable_New";
import AutoLogin from "./pages/AutoLogin";
import ExecutionDetails from "./pages/ExecutionDetails";
// import ObservationMonitor from "./pages/ObservationMonitor";
import ObservationDashboard from "./pages/ObservationDashboard";
import ObservationTables from "./pages/ObservationTables";

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          theme={theme}
          setTheme={setTheme}
        />

        {/* backdrop for mobile when sidebar is open */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden ${
            sidebarOpen ? "block" : "hidden"
          }`}
          onClick={closeSidebar}
        />

        <div className="flex flex-col bg-gray-50 dark:bg-gray-900">
          <main className="pt-14 sm:pt-16">
            {/* Routes */}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/stratergies" element={<Stratergies />} />
              <Route path="/optionchain" element={<OptionChains />} />
              <Route path="/optionchaincustom" element={<SpreadPage />} />
              <Route path="/multilegspread" element={<MultiLegSpread />} />
              {/* <Route
                  path="/advanced-options"
                  element={<AdvancedOptionsForm />}
                /> */}
              <Route
                path="/advanced-options-table"
                element={<AdvancedOptionsTable />}
              />
              <Route
                path="/advanced-options-builder"
                element={<AdvancedOptionsBuilder />}
              />
              <Route path="/orders-new" element={<OrdersTableNew />} />
              <Route path="/auto-login" element={<AutoLogin />} />
              <Route path="/execution-details" element={<ExecutionDetails />} />
              {/* <Route
                  path="/observation-monitor"
                  element={<ObservationMonitor />}
                /> */}
              <Route
                path="/observation-dashboard"
                element={<ObservationDashboard />}
              />
              <Route
                path="/observation-tables"
                element={<ObservationTables />}
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
