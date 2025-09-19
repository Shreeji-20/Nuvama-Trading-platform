import React, { useState, useEffect, useCallback } from "react";
import config from "../config/api";

const ObservationTables = () => {
  // State management
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [instances, setInstances] = useState([]);
  const [globalObservation, setGlobalObservation] = useState(null);
  const [globalLegDetails, setGlobalLegDetails] = useState(null);
  const [liveMetrics, setLiveMetrics] = useState(null);
  const [latestCaseDecision, setLatestCaseDecision] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState("case-decisions");

  // Fetch all strategy instances
  const fetchInstances = useCallback(async () => {
    try {
      const url = config.buildObservationUrl(
        config.ENDPOINTS.OBSERVATIONS.INSTANCES
      );
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch instances");
      const data = await response.json();
      setInstances(data.instances || []);

      // Auto-select first instance if none selected
      if (!selectedInstance && data.instances?.length > 0) {
        setSelectedInstance(data.instances[0].instance_id);
      }
    } catch (err) {
      console.error("Error fetching instances:", err);
      setError("Failed to fetch strategy instances");
      setInstances([]);
    }
  }, [selectedInstance]);

  // Fetch global observation data for selected instance
  const fetchGlobalObservation = useCallback(async () => {
    if (!selectedInstance) return;

    try {
      const url = config.buildObservationUrl(
        config.ENDPOINTS.OBSERVATIONS.GLOBAL_OBSERVATION,
        { instance_id: selectedInstance }
      );
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch global observation");
      const data = await response.json();
      setGlobalObservation(data);
    } catch (err) {
      console.error("Error fetching global observation:", err);
      setGlobalObservation(null);
    }
  }, [selectedInstance]);

  // Fetch global leg details for selected instance
  const fetchGlobalLegDetails = useCallback(async () => {
    if (!selectedInstance) return;

    try {
      const url = config.buildObservationUrl(
        config.ENDPOINTS.OBSERVATIONS.GLOBAL_LEG_DETAILS,
        { instance_id: selectedInstance }
      );
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch global leg details");
      const data = await response.json();
      setGlobalLegDetails(data);
    } catch (err) {
      console.error("Error fetching global leg details:", err);
      setGlobalLegDetails(null);
    }
  }, [selectedInstance]);

  // Fetch live metrics for selected instance
  const fetchLiveMetrics = useCallback(async () => {
    if (!selectedInstance) return;

    try {
      const url = config.buildObservationUrl(
        config.ENDPOINTS.OBSERVATIONS.LIVE_METRICS,
        { instance_id: selectedInstance }
      );
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch live metrics");
      const data = await response.json();
      setLiveMetrics(data);
    } catch (err) {
      console.error("Error fetching live metrics:", err);
      setLiveMetrics(null);
    }
  }, [selectedInstance]);

  // Fetch latest case decision observation for selected instance
  const fetchLatestCaseDecision = useCallback(async () => {
    if (!selectedInstance) return;

    try {
      const url = config.buildObservationUrl(
        config.ENDPOINTS.OBSERVATIONS.CASE_DECISION_OBSERVATION,
        { instance_id: selectedInstance }
      );
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch latest case decision");
      const data = await response.json();
      setLatestCaseDecision(data);
    } catch (err) {
      console.error("Error fetching latest case decision:", err);
      setLatestCaseDecision(null);
    }
  }, [selectedInstance]);

  // Handle instance selection change
  const handleInstanceChange = (instanceId) => {
    setSelectedInstance(instanceId);
    setGlobalObservation(null);
    setGlobalLegDetails(null);
    setLiveMetrics(null);
    setLatestCaseDecision(null);
  };

  // Auto-refresh data
  useEffect(() => {
    let interval;

    const refreshData = async () => {
      if (selectedInstance) {
        if (activeTab === "case-decisions") {
          await fetchLatestCaseDecision();
        } else if (activeTab === "global-observations") {
          await Promise.all([
            fetchGlobalObservation(),
            fetchGlobalLegDetails(),
            fetchLiveMetrics(),
          ]);
        }
      }
    };

    // Initial load
    refreshData();

    // Set up auto-refresh
    if (autoRefresh) {
      interval = setInterval(refreshData, 2000); // Refresh every 2 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    selectedInstance,
    activeTab,
    autoRefresh,
    fetchGlobalObservation,
    fetchGlobalLegDetails,
    fetchLiveMetrics,
    fetchLatestCaseDecision,
  ]);

  // Initial load of instances
  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  // Format price with currency
  const formatPrice = (price) => {
    if (price === null || price === undefined) return "N/A";
    return `₹${Number(price).toFixed(2)}`;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      return new Date(timestamp).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "INACTIVE":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  // Get decision color
  const getDecisionColor = (decision) => {
    switch (decision) {
      case "CASE A":
        return "text-green-600 dark:text-green-400 font-semibold";
      case "CASE B":
        return "text-blue-600 dark:text-blue-400 font-semibold";
      default:
        return "text-orange-600 dark:text-orange-400 font-semibold";
    }
  };

  return (
    <div className="min-h-screen bg-light-gradient dark:bg-dark-900 p-2 md:p-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Header */}
        <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-lg shadow-light-lg dark:shadow-dark-xl p-3 border border-light-border dark:border-dark-border">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 dark:bg-indigo-500 rounded-lg p-2">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 dark:text-dark-text-primary">
                Strategy Observation Tables
              </h1>
              <p className="text-xs text-gray-600 dark:text-dark-text-secondary mt-0.5">
                Professional data tables for real-time strategy monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-dark-card-gradient rounded-lg shadow-lg dark:shadow-dark-xl p-3 border border-gray-200 dark:border-dark-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Instance Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                Strategy Instance
              </label>
              <select
                value={selectedInstance || ""}
                onChange={(e) => handleInstanceChange(e.target.value)}
                className="w-full border border-gray-300 dark:border-dark-border rounded-md p-2 focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors duration-200 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary text-xs"
              >
                <option value="">Select Instance</option>
                {instances.map((instance) => (
                  <option
                    key={instance.instance_id}
                    value={instance.instance_id}
                  >
                    {instance.instance_id} - {instance.status || "Unknown"}
                  </option>
                ))}
              </select>
            </div>

            {/* Auto Refresh Toggle */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                Auto Refresh (2s)
              </label>
              <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-dark-surface rounded-md border border-gray-200 dark:border-dark-border">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${
                      autoRefresh
                        ? "bg-indigo-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-200 ${
                        autoRefresh ? "transform translate-x-4" : ""
                      }`}
                    ></div>
                  </div>
                  <span className="ml-2 text-xs text-gray-700 dark:text-dark-text-secondary">
                    {autoRefresh ? "On" : "Off"}
                  </span>
                </label>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                Instance Status
              </label>
              <div className="p-2 bg-gray-50 dark:bg-dark-surface rounded-md border border-gray-200 dark:border-dark-border">
                {selectedInstance ? (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      instances.find((i) => i.instance_id === selectedInstance)
                        ?.status
                    )}`}
                  >
                    {instances.find((i) => i.instance_id === selectedInstance)
                      ?.status || "Unknown"}
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 dark:text-dark-text-muted">
                    No instance selected
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        {selectedInstance && (
          <div className="bg-white dark:bg-dark-card-gradient rounded-lg shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border">
            <div className="border-b border-gray-200 dark:border-dark-border">
              <nav className="flex space-x-6 px-4">
                <button
                  onClick={() => setActiveTab("case-decisions")}
                  className={`py-3 px-1 border-b-2 font-medium text-xs transition-colors duration-200 ${
                    activeTab === "case-decisions"
                      ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary hover:border-gray-300"
                  }`}
                >
                  Case Decisions
                </button>
                <button
                  onClick={() => setActiveTab("global-observations")}
                  className={`py-3 px-1 border-b-2 font-medium text-xs transition-colors duration-200 ${
                    activeTab === "global-observations"
                      ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary hover:border-gray-300"
                  }`}
                >
                  Global Observations
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Case Decisions Tab */}
        {selectedInstance && activeTab === "case-decisions" && (
          <div className="space-y-3">
            {/* Case Decision Summary Table */}
            {latestCaseDecision && (
              <div className="bg-white dark:bg-dark-card-gradient rounded-lg shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-b border-gray-200 dark:border-dark-border">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-dark-text-primary flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Case Decision Summary
                  </h3>
                </div>
                <div className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 dark:bg-dark-surface">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Decision
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Status
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Reason
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Moving Legs
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Symbol
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            ATM Strike
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Action
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Duration
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Samples
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Timestamp
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                        <tr className="hover:bg-gray-50 dark:hover:bg-dark-surface">
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={getDecisionColor(
                                latestCaseDecision.case_decision
                              )}
                            >
                              {latestCaseDecision.case_decision || "N/A"}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                latestCaseDecision.status === "moving_market"
                                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                                  : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              }`}
                            >
                              {latestCaseDecision.status || "N/A"}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary">
                            {latestCaseDecision.reason || "N/A"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary">
                            {latestCaseDecision.moving_legs?.join(", ") ||
                              "None"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary font-semibold">
                            {latestCaseDecision.symbol || "N/A"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary">
                            {latestCaseDecision.atm_strike || "N/A"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                latestCaseDecision.action === "BUY"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              }`}
                            >
                              {latestCaseDecision.action || "N/A"}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary">
                            {latestCaseDecision.observation_duration || "N/A"}s
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary">
                            {latestCaseDecision.valid_samples ||
                              latestCaseDecision.sample_count ||
                              "N/A"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary">
                            {formatTimestamp(latestCaseDecision.timestamp)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Case Decision Legs Analysis */}
            {latestCaseDecision && latestCaseDecision.trends && (
              <div className="bg-white dark:bg-dark-card-gradient rounded-lg shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-b border-gray-200 dark:border-dark-border">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-dark-text-primary flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    Legs Trend Analysis
                  </h3>
                </div>
                <div className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 dark:bg-dark-surface">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Leg
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Trend
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Change
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Volatility
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Direction
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Start Price
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            End Price
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Min Price
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Max Price
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                        {Object.entries(latestCaseDecision.trends).map(
                          ([legName, trend]) => (
                            <tr
                              key={legName}
                              className="hover:bg-gray-50 dark:hover:bg-dark-surface"
                            >
                              <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900 dark:text-dark-text-primary">
                                {legName}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    trend.trend === "INCREASING"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                      : trend.trend === "DECREASING"
                                      ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                  }`}
                                >
                                  {trend.trend}
                                </span>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span
                                  className={`font-semibold ${
                                    trend.change > 0
                                      ? "text-green-600 dark:text-green-400"
                                      : trend.change < 0
                                      ? "text-red-600 dark:text-red-400"
                                      : "text-gray-600 dark:text-gray-400"
                                  }`}
                                >
                                  {trend.change > 0 ? "+" : ""}
                                  {trend.change}
                                </span>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary">
                                {trend.volatility?.toFixed(2) || "N/A"}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    trend.direction === "UP"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                  }`}
                                >
                                  {trend.direction}
                                </span>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary">
                                ₹{trend.price_range?.start?.toFixed(2) || "N/A"}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary">
                                ₹{trend.price_range?.end?.toFixed(2) || "N/A"}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-red-600 dark:text-red-400 font-medium">
                                ₹{trend.price_range?.min?.toFixed(2) || "N/A"}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-green-600 dark:text-green-400 font-medium">
                                ₹{trend.price_range?.max?.toFixed(2) || "N/A"}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Execution Order Details */}
            {latestCaseDecision && latestCaseDecision.execution_order && (
              <div className="bg-white dark:bg-dark-card-gradient rounded-lg shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-b border-gray-200 dark:border-dark-border">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-dark-text-primary flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Execution Order
                  </h3>
                </div>
                <div className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 dark:bg-dark-surface">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Primary Leg
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Secondary Leg
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Primary Change
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Secondary Change
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                        <tr className="hover:bg-gray-50 dark:hover:bg-dark-surface">
                          <td className="px-3 py-2 whitespace-nowrap font-semibold text-blue-600 dark:text-blue-400">
                            {latestCaseDecision.execution_order.primary_leg}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap font-semibold text-purple-600 dark:text-purple-400">
                            {latestCaseDecision.execution_order.secondary_leg}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={`font-semibold ${
                                latestCaseDecision.execution_order
                                  .primary_change > 0
                                  ? "text-green-600 dark:text-green-400"
                                  : latestCaseDecision.execution_order
                                      .primary_change < 0
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {latestCaseDecision.execution_order
                                .primary_change > 0
                                ? "+"
                                : ""}
                              {
                                latestCaseDecision.execution_order
                                  .primary_change
                              }
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={`font-semibold ${
                                latestCaseDecision.execution_order
                                  .secondary_change > 0
                                  ? "text-green-600 dark:text-green-400"
                                  : latestCaseDecision.execution_order
                                      .secondary_change < 0
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {latestCaseDecision.execution_order
                                .secondary_change > 0
                                ? "+"
                                : ""}
                              {
                                latestCaseDecision.execution_order
                                  .secondary_change
                              }
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* No Data State */}
            {!latestCaseDecision && (
              <div className="bg-white dark:bg-dark-card-gradient rounded-lg shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                <div className="text-center py-8">
                  <svg
                    className="mx-auto h-8 w-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                    No case decision data
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-muted">
                    Case decision data will appear here when available.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Global Observations Tab */}
        {selectedInstance && activeTab === "global-observations" && (
          <div className="space-y-3">
            {/* Live Metrics Table */}
            {liveMetrics && (
              <div className="bg-white dark:bg-dark-card-gradient rounded-lg shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-b border-gray-200 dark:border-dark-border">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-dark-text-primary flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    Live Metrics
                  </h3>
                </div>
                <div className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 dark:bg-dark-surface">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Current P&L
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Max P&L
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Min P&L
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Total Premium
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Timestamp
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                        <tr className="hover:bg-gray-50 dark:hover:bg-dark-surface">
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={`font-semibold ${
                                liveMetrics.current_pnl >= 0
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {formatPrice(liveMetrics.current_pnl)}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-green-600 dark:text-green-400 font-semibold">
                            {formatPrice(liveMetrics.max_pnl)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-red-600 dark:text-red-400 font-semibold">
                            {formatPrice(liveMetrics.min_pnl)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary">
                            {formatPrice(liveMetrics.total_premium)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary">
                            {formatTimestamp(liveMetrics.timestamp)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Global Observation Summary */}
            {globalObservation && (
              <div className="bg-white dark:bg-dark-card-gradient rounded-lg shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-b border-gray-200 dark:border-dark-border">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-dark-text-primary flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Global Observation Summary
                  </h3>
                </div>
                <div className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 dark:bg-dark-surface">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Instance ID
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Buy Pair Status
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Sell Pair Status
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Buy Action
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Sell Action
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Timestamp
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                        <tr className="hover:bg-gray-50 dark:hover:bg-dark-surface">
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary font-mono text-xs">
                            {globalObservation.instance_id?.slice(-12) || "N/A"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                globalObservation.buy_pair_pair?.first_leg &&
                                globalObservation.buy_pair_pair?.second_leg
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                              }`}
                            >
                              {globalObservation.buy_pair_pair?.first_leg &&
                              globalObservation.buy_pair_pair?.second_leg
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                globalObservation.sell_pair_pair?.first_leg &&
                                globalObservation.sell_pair_pair?.second_leg
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                              }`}
                            >
                              {globalObservation.sell_pair_pair?.first_leg &&
                              globalObservation.sell_pair_pair?.second_leg
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                globalObservation.buy_pair_pair
                                  ?.execution_strategy?.action === "EXECUTE"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              }`}
                            >
                              {globalObservation.buy_pair_pair
                                ?.execution_strategy?.action || "N/A"}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                globalObservation.sell_pair_pair
                                  ?.execution_strategy?.action === "EXECUTE"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              }`}
                            >
                              {globalObservation.sell_pair_pair
                                ?.execution_strategy?.action || "N/A"}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary">
                            {formatTimestamp(globalObservation.timestamp)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Buy Pair Analysis */}
            {globalObservation && globalObservation.buy_pair_pair && (
              <div className="bg-white dark:bg-dark-card-gradient rounded-lg shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-b border-gray-200 dark:border-dark-border">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-dark-text-primary flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                      />
                    </svg>
                    Buy Pair Strategy
                  </h3>
                </div>
                <div className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 dark:bg-dark-surface">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Action
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Strategy
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Leg1 Trend
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Leg2 Trend
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Leg1 Price
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Leg2 Price
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Exit Strategy
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Reason
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                        <tr className="hover:bg-gray-50 dark:hover:bg-dark-surface">
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                globalObservation.buy_pair_pair
                                  .execution_strategy?.action === "EXECUTE"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              }`}
                            >
                              {globalObservation.buy_pair_pair
                                .execution_strategy?.action || "N/A"}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary font-semibold">
                            {globalObservation.buy_pair_pair.execution_strategy
                              ?.strategy || "N/A"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                globalObservation.buy_pair_pair.trends?.leg1
                                  ?.trend === "STABLE"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                  : globalObservation.buy_pair_pair.trends?.leg1
                                      ?.trend === "INCREASING"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              }`}
                            >
                              {globalObservation.buy_pair_pair.trends?.leg1
                                ?.trend || "N/A"}
                            </span>
                            <div
                              className={`text-xs mt-1 font-semibold ${
                                globalObservation.buy_pair_pair.trends?.leg1
                                  ?.change > 0
                                  ? "text-green-600 dark:text-green-400"
                                  : globalObservation.buy_pair_pair.trends?.leg1
                                      ?.change < 0
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {globalObservation.buy_pair_pair.trends?.leg1
                                ?.change > 0
                                ? "+"
                                : ""}
                              {globalObservation.buy_pair_pair.trends?.leg1?.change?.toFixed(
                                3
                              ) || "0.000"}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                globalObservation.buy_pair_pair.trends?.leg2
                                  ?.trend === "STABLE"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                  : globalObservation.buy_pair_pair.trends?.leg2
                                      ?.trend === "INCREASING"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              }`}
                            >
                              {globalObservation.buy_pair_pair.trends?.leg2
                                ?.trend || "N/A"}
                            </span>
                            <div
                              className={`text-xs mt-1 font-semibold ${
                                globalObservation.buy_pair_pair.trends?.leg2
                                  ?.change > 0
                                  ? "text-green-600 dark:text-green-400"
                                  : globalObservation.buy_pair_pair.trends?.leg2
                                      ?.change < 0
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {globalObservation.buy_pair_pair.trends?.leg2
                                ?.change > 0
                                ? "+"
                                : ""}
                              {globalObservation.buy_pair_pair.trends?.leg2?.change?.toFixed(
                                3
                              ) || "0.000"}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary font-semibold">
                            ₹
                            {globalObservation.buy_pair_pair.final_prices?.leg1?.toFixed(
                              2
                            ) || "N/A"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary font-semibold">
                            ₹
                            {globalObservation.buy_pair_pair.final_prices?.leg2?.toFixed(
                              2
                            ) || "N/A"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-purple-600 dark:text-purple-400 font-medium">
                            {globalObservation.buy_pair_pair
                              .exit_execution_strategy?.strategy || "N/A"}
                          </td>
                          <td className="px-3 py-2 text-gray-700 dark:text-dark-text-secondary max-w-xs text-xs">
                            {globalObservation.buy_pair_pair.execution_strategy
                              ?.reason || "N/A"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Sell Pair Analysis */}
            {globalObservation && globalObservation.sell_pair_pair && (
              <div className="bg-white dark:bg-dark-card-gradient rounded-lg shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-b border-gray-200 dark:border-dark-border">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-dark-text-primary flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                      />
                    </svg>
                    Sell Pair Strategy
                  </h3>
                </div>
                <div className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 dark:bg-dark-surface">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Action
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Strategy
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Leg3 Trend
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Leg4 Trend
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Leg3 Price
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Leg4 Price
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Exit Strategy
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Reason
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                        <tr className="hover:bg-gray-50 dark:hover:bg-dark-surface">
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                globalObservation.sell_pair_pair
                                  .execution_strategy?.action === "EXECUTE"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              }`}
                            >
                              {globalObservation.sell_pair_pair
                                .execution_strategy?.action || "N/A"}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary font-semibold">
                            {globalObservation.sell_pair_pair.execution_strategy
                              ?.strategy || "N/A"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                globalObservation.sell_pair_pair.trends?.leg3
                                  ?.trend === "STABLE"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                  : globalObservation.sell_pair_pair.trends
                                      ?.leg3?.trend === "INCREASING"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              }`}
                            >
                              {globalObservation.sell_pair_pair.trends?.leg3
                                ?.trend || "N/A"}
                            </span>
                            <div
                              className={`text-xs mt-1 font-semibold ${
                                globalObservation.sell_pair_pair.trends?.leg3
                                  ?.change > 0
                                  ? "text-green-600 dark:text-green-400"
                                  : globalObservation.sell_pair_pair.trends
                                      ?.leg3?.change < 0
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {globalObservation.sell_pair_pair.trends?.leg3
                                ?.change > 0
                                ? "+"
                                : ""}
                              {globalObservation.sell_pair_pair.trends?.leg3?.change?.toFixed(
                                3
                              ) || "0.000"}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                globalObservation.sell_pair_pair.trends?.leg4
                                  ?.trend === "STABLE"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                  : globalObservation.sell_pair_pair.trends
                                      ?.leg4?.trend === "INCREASING"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              }`}
                            >
                              {globalObservation.sell_pair_pair.trends?.leg4
                                ?.trend || "N/A"}
                            </span>
                            <div
                              className={`text-xs mt-1 font-semibold ${
                                globalObservation.sell_pair_pair.trends?.leg4
                                  ?.change > 0
                                  ? "text-green-600 dark:text-green-400"
                                  : globalObservation.sell_pair_pair.trends
                                      ?.leg4?.change < 0
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {globalObservation.sell_pair_pair.trends?.leg4
                                ?.change > 0
                                ? "+"
                                : ""}
                              {globalObservation.sell_pair_pair.trends?.leg4?.change?.toFixed(
                                3
                              ) || "0.000"}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary font-semibold">
                            ₹
                            {globalObservation.sell_pair_pair.final_prices?.leg3?.toFixed(
                              2
                            ) || "N/A"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary font-semibold">
                            ₹
                            {globalObservation.sell_pair_pair.final_prices?.leg4?.toFixed(
                              2
                            ) || "N/A"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-purple-600 dark:text-purple-400 font-medium">
                            {globalObservation.sell_pair_pair
                              .exit_execution_strategy?.strategy || "N/A"}
                          </td>
                          <td className="px-3 py-2 text-gray-700 dark:text-dark-text-secondary max-w-xs text-xs">
                            {globalObservation.sell_pair_pair.execution_strategy
                              ?.reason || "N/A"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Execution Strategy Details */}
            {globalObservation && globalObservation.execution_strategy && (
              <div className="bg-white dark:bg-dark-card-gradient rounded-lg shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border-b border-gray-200 dark:border-dark-border">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-dark-text-primary flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-cyan-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Execution Strategy
                  </h3>
                </div>
                <div className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 dark:bg-dark-surface">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Action
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Strategy
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            First Leg
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Second Leg
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Reason
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                        <tr className="hover:bg-gray-50 dark:hover:bg-dark-surface">
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                globalObservation.execution_strategy.action ===
                                "EXECUTE"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              }`}
                            >
                              {globalObservation.execution_strategy.action}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary font-semibold">
                            {globalObservation.execution_strategy.strategy ||
                              "N/A"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-blue-600 dark:text-blue-400 font-medium">
                            {globalObservation.execution_strategy.first_leg ||
                              "N/A"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-purple-600 dark:text-purple-400 font-medium">
                            {globalObservation.execution_strategy.second_leg ||
                              "N/A"}
                          </td>
                          <td className="px-3 py-2 text-gray-700 dark:text-dark-text-secondary max-w-xs">
                            {globalObservation.execution_strategy.reason ||
                              "N/A"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Leg Trends Analysis */}
            {globalObservation && globalObservation.trends && (
              <div className="bg-white dark:bg-dark-card-gradient rounded-lg shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 border-b border-gray-200 dark:border-dark-border">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-dark-text-primary flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-violet-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 12l3-3 3 3 4-4"
                      />
                    </svg>
                    Legs Trend Analysis
                  </h3>
                </div>
                <div className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 dark:bg-dark-surface">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Leg
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Trend
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Change
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                        {Object.entries(globalObservation.trends).map(
                          ([legName, trend]) => (
                            <tr
                              key={legName}
                              className="hover:bg-gray-50 dark:hover:bg-dark-surface"
                            >
                              <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900 dark:text-dark-text-primary">
                                {legName}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    trend.trend === "STABLE"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                      : trend.trend === "INCREASING"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                  }`}
                                >
                                  {trend.trend}
                                </span>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span
                                  className={`font-semibold ${
                                    trend.change > 0
                                      ? "text-green-600 dark:text-green-400"
                                      : trend.change < 0
                                      ? "text-red-600 dark:text-red-400"
                                      : "text-gray-600 dark:text-gray-400"
                                  }`}
                                >
                                  {trend.change > 0 ? "+" : ""}
                                  {trend.change}
                                </span>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Final Prices */}
            {globalObservation && globalObservation.final_prices && (
              <div className="bg-white dark:bg-dark-card-gradient rounded-lg shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-b border-gray-200 dark:border-dark-border">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-dark-text-primary flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                    Final Prices
                  </h3>
                </div>
                <div className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 dark:bg-dark-surface">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Leg
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Final Price
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Action Type
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                        {Object.entries(globalObservation.final_prices).map(
                          ([legName, price]) => (
                            <tr
                              key={legName}
                              className="hover:bg-gray-50 dark:hover:bg-dark-surface"
                            >
                              <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900 dark:text-dark-text-primary">
                                {legName}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary font-semibold">
                                ₹{price?.toFixed(2) || "N/A"}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    globalObservation.leg_action_type === "BUY"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                  }`}
                                >
                                  {globalObservation.leg_action_type || "N/A"}
                                </span>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Exit Execution Strategy */}
            {globalObservation && globalObservation.exit_execution_strategy && (
              <div className="bg-white dark:bg-dark-card-gradient rounded-lg shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 border-b border-gray-200 dark:border-dark-border">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-dark-text-primary flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-rose-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Exit Execution Strategy
                  </h3>
                </div>
                <div className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 dark:bg-dark-surface">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Action
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Strategy
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            First Leg Exit
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Second Leg Exit
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                            Reason
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                        <tr className="hover:bg-gray-50 dark:hover:bg-dark-surface">
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                globalObservation.exit_execution_strategy
                                  .action === "EXECUTE"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              }`}
                            >
                              {globalObservation.exit_execution_strategy.action}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary font-semibold">
                            {globalObservation.exit_execution_strategy
                              .strategy || "N/A"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-blue-600 dark:text-blue-400 font-medium">
                            {globalObservation.first_leg_exit || "N/A"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-purple-600 dark:text-purple-400 font-medium">
                            {globalObservation.second_leg_exit || "N/A"}
                          </td>
                          <td className="px-3 py-2 text-gray-700 dark:text-dark-text-secondary max-w-xs">
                            {globalObservation.exit_execution_strategy.reason ||
                              "N/A"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Global Leg Details Table */}
            {globalLegDetails &&
              globalLegDetails.legs &&
              globalLegDetails.legs.length > 0 && (
                <div className="bg-white dark:bg-dark-card-gradient rounded-lg shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-b border-gray-200 dark:border-dark-border">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-dark-text-primary flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        />
                      </svg>
                      Strategy Legs Details
                    </h3>
                  </div>
                  <div className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 dark:bg-dark-surface">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                              Leg
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                              Symbol
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                              Type
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                              Strike
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                              Entry Price
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                              Current Price
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                              P&L
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-dark-text-secondary border-b border-gray-200 dark:border-dark-border">
                              Quantity
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                          {globalLegDetails.legs.map((leg, index) => (
                            <tr
                              key={index}
                              className="hover:bg-gray-50 dark:hover:bg-dark-surface"
                            >
                              <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900 dark:text-dark-text-primary">
                                {leg.leg_name || `Leg ${index + 1}`}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary font-mono">
                                {leg.symbol || "N/A"}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    leg.option_type === "CALL"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                  }`}
                                >
                                  {leg.option_type || "N/A"}
                                </span>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary">
                                {leg.strike_price || "N/A"}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary">
                                {formatPrice(leg.entry_price)}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary">
                                {formatPrice(leg.current_price)}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span
                                  className={`font-semibold ${
                                    leg.pnl >= 0
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-red-600 dark:text-red-400"
                                  }`}
                                >
                                  {formatPrice(leg.pnl)}
                                </span>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-dark-text-primary">
                                {leg.quantity || "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex">
              <svg
                className="w-4 h-4 text-red-400 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-2">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                  Error
                </h3>
                <div className="mt-1 text-xs text-red-700 dark:text-red-400">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ObservationTables;
