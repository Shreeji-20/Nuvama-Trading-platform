import { useState, useEffect } from "react";
import "./App.css";
import Sidebar from "./components/SideBar";
import Users from "./pages/Users";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Stratergies from "./pages/Stratergies";
import OptionChains from "./pages/OptionChain";
import SpreadPage from "./pages/CustomOptionChain";
import MultiLegSpread from "./pages/MultiLegSpread";
import { PricePage } from "./services/websocket/PricePage";
import { SocketProvider } from "./services/websocket/SocketContext";
import AdvancedOptionsBuilder from "./pages/AdvancedOptionsBuilder";
import DeployedStrategies from "./pages/DeployedStrategies";
import StrategyTags from "./pages/StrategyTags";
import Dashboard from "./pages/Dashboard";
import OrdersTableNew from "./pages/OrdersTable_New";
import AutoLogin from "./pages/AutoLogin";
import ExecutionDetails from "./pages/ExecutionDetails";
// import ObservationMonitor from "./pages/ObservationMonitor";
import ObservationDashboard from "./pages/ObservationDashboard";
import ObservationTables from "./pages/ObservationTables";

function App() {
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
    <SocketProvider>
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
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/optionchain" element={<OptionChains />} />
                <Route path="/advanced-options-table" element={<PricePage />} />
                <Route
                  path="/advanced-options-builder"
                  element={<AdvancedOptionsBuilder />}
                />
                <Route
                  path="/deployed-strategies"
                  element={<DeployedStrategies />}
                />
                <Route path="/strategy-tags" element={<StrategyTags />} />
                <Route path="/orders-new" element={<OrdersTableNew />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </SocketProvider>
  );
}

export default App;
