import { useState, useEffect } from "react";
import "./App.css";
import { OrderBookTable } from "./components/OrderBookTable";
import Sidebar from "./components/SideBar";
import Users from "./pages/Users/Users";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NetPositionsTable } from "./components/NetPositionsTable";
import AdvancedOptionsBuilder from "./pages/AdvancedOptionsBuilder";
import DeployedStrategies from "./pages/DeployedStrategies/DeployedStrategies";
import StrategyTags from "./pages/StrategyTags";
import OptionsBuilder from "./pages/OptionsBuilder";
import Dashboard from "./pages/Dashboard";

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
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
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
              <Route
                path="/advanced-options-builder"
                element={<AdvancedOptionsBuilder />}
              />
              {/* <Route 
                path="/advanced-options-builder-new"
                element={<OptionsBuilder />}
              /> */}
              <Route
                path="/deployed-strategies"
                element={<DeployedStrategies />}
              />
              <Route path="/strategy-tags" element={<StrategyTags />} />

              <Route path="/OrderBook" element={<OrderBookTable />} />
              <Route path="/NetPosition" element={<NetPositionsTable />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
