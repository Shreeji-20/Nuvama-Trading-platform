import React, { useState, useEffect, useCallback } from "react";
import config from "../config/api";

const ObservationDashboard = () => {
  // State management
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [instances, setInstances] = useState([]);
  const [globalObservation, setGlobalObservation] = useState(null);
  const [globalLegDetails, setGlobalLegDetails] = useState(null);
  const [liveMetrics, setLiveMetrics] = useState(null);
  const [executionIds, setExecutionIds] = useState([]);
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Case Decision state
  const [activeTab, setActiveTab] = useState("observations");
  const [caseDecisionObservations, setCaseDecisionObservations] = useState([]);
  const [selectedCaseDecision, setSelectedCaseDecision] = useState(null);
  const [latestCaseDecision, setLatestCaseDecision] = useState(null);
  const [caseDecisionLoading, setCaseDecisionLoading] = useState(false);

  // Fetch all strategy instances
  const fetchInstances = useCallback(async () => {
    try {
      const response = await fetch(
        config.buildUrl(config.ENDPOINTS.OBSERVATIONS.INSTANCES)
      );
      if (!response.ok) throw new Error("Failed to fetch instances");
      const data = await response.json();
      setInstances(data.instances || []);

      // Auto-select first instance if none selected
      if (!selectedInstance && data.instances.length > 0) {
        setSelectedInstance(data.instances[0].instance_id);
      }
    } catch (err) {
      setError("Failed to load instances");
      console.error("Error fetching instances:", err);
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
      if (!response.ok) throw new Error("Failed to fetch leg details");
      const data = await response.json();
      setGlobalLegDetails(data);
    } catch (err) {
      console.error("Error fetching leg details:", err);
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

  // Fetch execution IDs for selected instance
  const fetchExecutionIds = useCallback(async () => {
    if (!selectedInstance) return;

    try {
      const url = config.buildObservationUrl(
        config.ENDPOINTS.OBSERVATIONS.EXECUTION_IDS,
        { instance_id: selectedInstance }
      );
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch execution IDs");
      const data = await response.json();
      setExecutionIds(data.execution_ids || []);
    } catch (err) {
      console.error("Error fetching execution IDs:", err);
      setExecutionIds([]);
    }
  }, [selectedInstance]);

  // Fetch specific observation by execution ID
  const fetchObservation = useCallback(
    async (executionId) => {
      if (!selectedInstance || !executionId) return;

      try {
        setLoading(true);
        const url = config.buildObservationUrl(
          config.ENDPOINTS.OBSERVATIONS.OBSERVATION,
          { instance_id: selectedInstance, execution_id: executionId }
        );
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch observation");
        const data = await response.json();
        setSelectedObservation(data);
      } catch (err) {
        console.error("Error fetching observation:", err);
        setSelectedObservation(null);
      } finally {
        setLoading(false);
      }
    },
    [selectedInstance]
  );

  // Fetch case decision observations for selected instance
  const fetchCaseDecisionObservations = useCallback(async () => {
    if (!selectedInstance) return;

    try {
      const url = config.buildObservationUrl(
        config.ENDPOINTS.OBSERVATIONS.CASE_DECISION_OBSERVATIONS,
        { instance_id: selectedInstance }
      );
      const response = await fetch(url);
      if (!response.ok)
        throw new Error("Failed to fetch case decision observations");
      const data = await response.json();
      setCaseDecisionObservations(data.observation_ids || []);
    } catch (err) {
      console.error("Error fetching case decision observations:", err);
      setCaseDecisionObservations([]);
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

  // Fetch specific case decision observation
  const fetchCaseDecisionObservation = useCallback(
    async (observationId) => {
      if (!selectedInstance || !observationId) return;

      try {
        setCaseDecisionLoading(true);
        const url = config.buildObservationUrl(
          config.ENDPOINTS.OBSERVATIONS.CASE_DECISION_OBSERVATION_SPECIFIC,
          { instance_id: selectedInstance, observation_id: observationId }
        );
        const response = await fetch(url);
        if (!response.ok)
          throw new Error("Failed to fetch case decision observation");
        const data = await response.json();
        setSelectedCaseDecision(data);
      } catch (err) {
        console.error("Error fetching case decision observation:", err);
        setSelectedCaseDecision(null);
      } finally {
        setCaseDecisionLoading(false);
      }
    },
    [selectedInstance]
  );

  // Handle instance selection change
  const handleInstanceChange = (instanceId) => {
    setSelectedInstance(instanceId);
    setSelectedObservation(null);
    setExecutionIds([]);
    setSelectedCaseDecision(null);
    setCaseDecisionObservations([]);
    setLatestCaseDecision(null);
  };

  // Auto-refresh data
  useEffect(() => {
    let interval;

    const refreshData = async () => {
      if (selectedInstance) {
        if (activeTab === "observations") {
          await Promise.all([
            fetchGlobalObservation(),
            fetchGlobalLegDetails(),
            fetchLiveMetrics(),
            fetchExecutionIds(),
          ]);
        } else if (activeTab === "case-decisions") {
          await Promise.all([
            fetchCaseDecisionObservations(),
            fetchLatestCaseDecision(),
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
    fetchExecutionIds,
    fetchCaseDecisionObservations,
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
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "running":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "stopped":
      case "error":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      case "paused":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300";
    }
  };

  // Get trend color
  const getTrendColor = (trend) => {
    switch (trend?.toUpperCase()) {
      case "INCREASING":
        return "text-green-600 dark:text-green-400";
      case "DECREASING":
        return "text-red-600 dark:text-red-400";
      case "STABLE":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-light-gradient dark:bg-dark-900 p-4 md:p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-light-lg dark:shadow-dark-xl p-6 border border-light-border dark:border-dark-border">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 dark:bg-indigo-500 rounded-xl p-3">
              <svg
                className="w-8 h-8 text-white"
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
            </div>
            <div>
              <h1 className="text-xs md:text-xs font-bold text-gray-900 dark:text-dark-text-primary">
                Strategy Observation Dashboard
              </h1>
              <p
                className="text-gray-600 dark:text-dark-text-secondary mt-1"
                style={{ fontSize: "0.7rem" }}
              >
                Real-time monitoring of box strategy execution and market
                observations
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl p-6 border border-gray-200 dark:border-dark-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Instance Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Strategy Instance
              </label>
              <select
                value={selectedInstance || ""}
                onChange={(e) => handleInstanceChange(e.target.value)}
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors duration-200 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                style={{ fontSize: "0.7rem" }}
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
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Auto Refresh (2s)
              </label>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
                      autoRefresh
                        ? "bg-indigo-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        autoRefresh ? "transform translate-x-4" : ""
                      }`}
                    ></div>
                  </div>
                  <span
                    className="ml-3 text-gray-700 dark:text-dark-text-secondary"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {autoRefresh ? "On" : "Off"}
                  </span>
                </label>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Instance Status
              </label>
              <div className="p-3 bg-gray-50 dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
                {selectedInstance ? (
                  <span
                    className={`px-3 py-1 rounded-full font-medium ${getStatusColor(
                      instances.find((i) => i.instance_id === selectedInstance)
                        ?.status
                    )}`}
                    style={{ fontSize: "0.7rem" }}
                  >
                    {instances.find((i) => i.instance_id === selectedInstance)
                      ?.status || "Unknown"}
                  </span>
                ) : (
                  <span
                    className="text-gray-500 dark:text-dark-text-muted"
                    style={{ fontSize: "0.7rem" }}
                  >
                    No instance selected
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        {selectedInstance && (
          <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border">
            <div className="border-b border-gray-200 dark:border-dark-border">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab("observations")}
                  className={`py-4 px-1 border-b-2 font-medium text-xs transition-colors duration-200 ${
                    activeTab === "observations"
                      ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary hover:border-gray-300"
                  }`}
                >
                  Observations
                </button>
                <button
                  onClick={() => setActiveTab("case-decisions")}
                  className={`py-4 px-1 border-b-2 font-medium text-xs transition-colors duration-200 ${
                    activeTab === "case-decisions"
                      ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary hover:border-gray-300"
                  }`}
                >
                  Case Decisions
                </button>
              </nav>
            </div>
          </div>
        )}

        {selectedInstance && activeTab === "observations" && (
          <>
            {/* Live Metrics */}
            {liveMetrics && (
              <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-b border-gray-200 dark:border-dark-border">
                  <h3 className="text-xs font-semibold text-gray-800 dark:text-dark-text-primary flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                    </svg>
                    Live Trading Metrics
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <div
                        className="font-medium text-green-800 dark:text-green-300 mb-1"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Entry Quantities
                      </div>
                      <div className="text-2xl font-bold text-green-900 dark:text-green-200">
                        {liveMetrics.entry_quantities || 0}
                      </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                      <div
                        className="font-medium text-red-800 dark:text-red-300 mb-1"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Exit Quantities
                      </div>
                      <div className="text-2xl font-bold text-red-900 dark:text-red-200">
                        {liveMetrics.exit_quantities || 0}
                      </div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                      <div
                        className="font-medium text-purple-800 dark:text-purple-300 mb-1"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Executed Spread
                      </div>
                      <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                        {formatPrice(liveMetrics.executed_spread)}
                      </div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                      <div
                        className="font-medium text-orange-800 dark:text-orange-300 mb-1"
                        style={{ fontSize: "0.7rem" }}
                      >
                        P&L
                      </div>
                      <div
                        className={`text-2xl font-bold ${
                          liveMetrics.pnl >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {formatPrice(liveMetrics.pnl)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-gray-500 dark:text-dark-text-muted">
                    Last updated: {formatTimestamp(liveMetrics.timestamp)}
                  </div>
                </div>
              </div>
            )}

            {/* Global Leg Details */}
            {globalLegDetails && (
              <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-b border-gray-200 dark:border-dark-border">
                  <h3 className="text-xs font-semibold text-gray-800 dark:text-dark-text-primary flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Global Leg Details
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(globalLegDetails)
                      .filter(([key]) => key.startsWith("leg"))
                      .map(([legKey, leg]) => (
                        <div
                          key={legKey}
                          className="bg-gray-50 dark:bg-dark-surface rounded-lg p-4 border border-gray-200 dark:border-dark-border"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span
                              className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full font-medium text-gray-700 dark:text-gray-300"
                              style={{ fontSize: "0.7rem" }}
                            >
                              {legKey.toUpperCase()}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                leg.action === "BUY"
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                              }`}
                            >
                              {leg.action}
                            </span>
                          </div>
                          <div
                            className="space-y-2"
                            style={{ fontSize: "0.7rem" }}
                          >
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-dark-text-secondary">
                                Symbol:
                              </span>
                              <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                                {leg.symbol || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-dark-text-secondary">
                                Strike:
                              </span>
                              <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                                {leg.strike || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-dark-text-secondary">
                                Type:
                              </span>
                              <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                                {leg.option_type}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-dark-text-secondary">
                                Price:
                              </span>
                              <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                                {formatPrice(leg.current_price)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-dark-text-secondary">
                                Quantity:
                              </span>
                              <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                                {leg.quantity || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Global Observation */}
            {globalObservation && (
              <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-b border-gray-200 dark:border-dark-border">
                  <h3 className="text-xs font-semibold text-gray-800 dark:text-dark-text-primary flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Global Market Observation
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Buy Pair */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <h4 className="text-xs font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Buy Pair
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span
                            className="text-green-700 dark:text-green-400"
                            style={{ fontSize: "0.7rem" }}
                          >
                            Trend:
                          </span>
                          <span
                            className={`px-2 py-1 rounded font-medium ${getTrendColor(
                              globalObservation.buy_pair?.trend
                            )} bg-white dark:bg-dark-surface`}
                            style={{ fontSize: "0.7rem" }}
                          >
                            {globalObservation.buy_pair?.execution_strategy
                              ?.strategy || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span
                            className="text-green-700 dark:text-green-400"
                            style={{ fontSize: "0.7rem" }}
                          >
                            First Leg:
                          </span>
                          <span
                            className="font-medium text-green-900 dark:text-green-200"
                            style={{ fontSize: "0.7rem" }}
                          >
                            {globalObservation.buy_pair?.first_leg || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span
                            className="text-green-700 dark:text-green-400"
                            style={{ fontSize: "0.7rem" }}
                          >
                            Second Leg:
                          </span>
                          <span
                            className="font-medium text-green-900 dark:text-green-200"
                            style={{ fontSize: "0.7rem" }}
                          >
                            {globalObservation.buy_pair?.second_leg || "N/A"}
                          </span>
                        </div>
                        <div className="mt-4">
                          <div
                            className="text-green-700 dark:text-green-400 mb-2"
                            style={{ fontSize: "0.7rem" }}
                          >
                            Execution Strategy:
                          </div>
                          <div className="bg-white dark:bg-dark-surface rounded p-3 text-xs">
                            <div className="flex justify-between mb-1">
                              <span>Action:</span>
                              <span className="font-medium">
                                {globalObservation.buy_pair?.execution_strategy
                                  ?.action || "N/A"}
                              </span>
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 mt-2">
                              {globalObservation.buy_pair?.execution_strategy
                                ?.reason || "No reason provided"}
                            </div>
                          </div>
                        </div>
                        {globalObservation.buy_pair?.final_prices && (
                          <div className="mt-4">
                            <div
                              className="text-green-700 dark:text-green-400 mb-2"
                              style={{ fontSize: "0.7rem" }}
                            >
                              Final Prices:
                            </div>
                            <div className="bg-white dark:bg-dark-surface rounded p-3 text-xs">
                              <div className="flex justify-between mb-1">
                                <span>
                                  {globalObservation?.buy_pair?.first_leg}
                                </span>
                                <span className="font-medium">
                                  {formatPrice(
                                    globalObservation?.buy_pair?.final_prices?.[
                                      globalObservation?.buy_pair?.first_leg
                                    ] || "N/A"
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>
                                  {globalObservation?.buy_pair?.second_leg}
                                </span>
                                <span className="font-medium">
                                  {formatPrice(
                                    globalObservation?.buy_pair?.final_prices?.[
                                      globalObservation?.buy_pair?.second_leg
                                    ] || "N/A"
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sell Pair */}
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                      <h4 className="text-xs font-semibold text-red-800 dark:text-red-300 mb-4 flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Sell Pair
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span
                            className="text-red-700 dark:text-red-400"
                            style={{ fontSize: "0.7rem" }}
                          >
                            Trend:
                          </span>
                          <span
                            className={`px-2 py-1 rounded font-medium ${getTrendColor(
                              globalObservation.sell_pair?.execution_strategy
                                ?.strategy || "N/A"
                            )} bg-white dark:bg-dark-surface`}
                            style={{ fontSize: "0.7rem" }}
                          >
                            {globalObservation.sell_pair?.execution_strategy
                              ?.strategy || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span
                            className="text-red-700 dark:text-red-400"
                            style={{ fontSize: "0.7rem" }}
                          >
                            First Leg:
                          </span>
                          <span
                            className="font-medium text-red-900 dark:text-red-200"
                            style={{ fontSize: "0.7rem" }}
                          >
                            {globalObservation.sell_pair?.first_leg || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span
                            className="text-red-700 dark:text-red-400"
                            style={{ fontSize: "0.7rem" }}
                          >
                            Second Leg:
                          </span>
                          <span
                            className="font-medium text-red-900 dark:text-red-200"
                            style={{ fontSize: "0.7rem" }}
                          >
                            {globalObservation.sell_pair?.second_leg || "N/A"}
                          </span>
                        </div>
                        <div className="mt-4">
                          <div
                            className="text-red-700 dark:text-red-400 mb-2"
                            style={{ fontSize: "0.7rem" }}
                          >
                            Execution Strategy:
                          </div>
                          <div className="bg-white dark:bg-dark-surface rounded p-3 text-xs">
                            <div className="flex justify-between mb-1">
                              <span>Action:</span>
                              <span className="font-medium">
                                {globalObservation.sell_pair?.execution_strategy
                                  ?.action || "N/A"}
                              </span>
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 mt-2">
                              {globalObservation.sell_pair?.execution_strategy
                                ?.reason || "No reason provided"}
                            </div>
                          </div>
                        </div>
                        {globalObservation.sell_pair?.final_prices && (
                          <div className="mt-4">
                            <div
                              className="text-red-700 dark:text-red-400 mb-2"
                              style={{ fontSize: "0.7rem" }}
                            >
                              Final Prices:
                            </div>
                            <div className="bg-white dark:bg-dark-surface rounded p-3 text-xs">
                              <div className="flex justify-between mb-1">
                                <span>
                                  {globalObservation?.sell_pair?.first_leg}
                                </span>
                                <span className="font-medium">
                                  {formatPrice(
                                    globalObservation.sell_pair.final_prices[
                                      globalObservation?.sell_pair?.first_leg
                                    ] || "N/A"
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>
                                  {globalObservation?.sell_pair?.second_leg}
                                </span>
                                <span className="font-medium">
                                  {formatPrice(
                                    globalObservation.sell_pair.final_prices[
                                      globalObservation?.sell_pair?.second_leg
                                    ] || "N/A"
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Global Decision Info */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div
                        className="font-medium text-blue-800 dark:text-blue-300 mb-1"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Case Decision
                      </div>
                      <div className="text-lg font-bold text-blue-900 dark:text-blue-200">
                        {globalObservation.case_decision || "N/A"}
                      </div>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                      <div
                        className="font-medium text-indigo-800 dark:text-indigo-300 mb-1"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Current Decision
                      </div>
                      <div className="text-lg font-bold text-indigo-900 dark:text-indigo-200">
                        {globalObservation.current_case_decision ||
                          globalObservation.case_decision ||
                          "N/A"}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div
                        className="font-medium text-gray-800 dark:text-gray-300 mb-1"
                        style={{ fontSize: "0.7rem" }}
                      >
                        ATM Strike
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-200">
                        {globalObservation.atm_strike || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-gray-500 dark:text-dark-text-muted">
                    Last updated: {formatTimestamp(globalObservation.timestamp)}
                  </div>
                </div>
              </div>
            )}

            {/* Case Decision Observations */}
            <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-b border-gray-200 dark:border-dark-border">
                <h3 className="text-xs font-semibold text-gray-800 dark:text-dark-text-primary flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-yellow-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Case Decision Observations
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Execution IDs List */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-800 dark:text-dark-text-primary mb-4">
                      Recent Execution IDs
                    </h4>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {executionIds.length > 0 ? (
                        executionIds.slice(0, 10).map((executionId) => (
                          <button
                            key={executionId}
                            onClick={() => fetchObservation(executionId)}
                            className={`w-full text-left p-3 rounded-lg border transition-colors duration-200 ${
                              selectedObservation?.execution_id === executionId
                                ? "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700"
                                : "bg-gray-50 dark:bg-dark-surface border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-elevated"
                            }`}
                          >
                            <div
                              className="font-mono text-gray-900 dark:text-dark-text-primary"
                              style={{ fontSize: "0.7rem" }}
                            >
                              {executionId}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="text-gray-500 dark:text-dark-text-muted text-center py-8">
                          No execution IDs found
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selected Observation Details */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-800 dark:text-dark-text-primary mb-4">
                      Observation Details
                    </h4>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
                      </div>
                    ) : selectedObservation ? (
                      <div className="space-y-4">
                        {/* Basic Info */}
                        <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-4 border border-gray-200 dark:border-dark-border">
                          <div
                            className="grid grid-cols-2 gap-4"
                            style={{ fontSize: "0.7rem" }}
                          >
                            <div>
                              <span className="text-gray-600 dark:text-dark-text-secondary">
                                Execution ID:
                              </span>
                              <div className="font-mono text-gray-900 dark:text-dark-text-primary">
                                {selectedObservation.execution_id}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-dark-text-secondary">
                                Case Decision:
                              </span>
                              <div className="font-semibold text-gray-900 dark:text-dark-text-primary">
                                {selectedObservation.case_decision || "N/A"}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-dark-text-secondary">
                                Status:
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                                  selectedObservation.status
                                )}`}
                              >
                                {selectedObservation.status || "Unknown"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-dark-text-secondary">
                                Duration:
                              </span>
                              <div className="text-gray-900 dark:text-dark-text-primary">
                                {selectedObservation.observation_duration || 0}s
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-dark-text-secondary">
                                Samples:
                              </span>
                              <div className="text-gray-900 dark:text-dark-text-primary">
                                {selectedObservation.valid_samples || 0}/
                                {selectedObservation.sample_count || 0}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-dark-text-secondary">
                                Symbol:
                              </span>
                              <div className="text-gray-900 dark:text-dark-text-primary">
                                {selectedObservation.symbol || "N/A"}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-gray-500 dark:text-dark-text-muted">
                            Timestamp:{" "}
                            {formatTimestamp(selectedObservation.timestamp)}
                          </div>
                        </div>

                        {/* Trends Analysis */}
                        {selectedObservation.trends && (
                          <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-4 border border-gray-200 dark:border-dark-border">
                            <h5 className="text-xs font-semibold text-gray-700 dark:text-dark-text-secondary mb-3">
                              Price Trends Analysis
                            </h5>
                            <div className="space-y-3">
                              {Object.entries(selectedObservation.trends).map(
                                ([legKey, trendData]) => (
                                  <div
                                    key={legKey}
                                    className="bg-white dark:bg-dark-elevated rounded p-3"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                                        {legKey}
                                      </span>
                                      <span
                                        className={`px-2 py-1 rounded text-xs font-medium ${getTrendColor(
                                          trendData.trend
                                        )} bg-gray-100 dark:bg-gray-700`}
                                      >
                                        {trendData.trend}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                      <div>
                                        <span className="text-gray-600 dark:text-dark-text-secondary">
                                          Change:
                                        </span>
                                        <div className="font-medium">
                                          {trendData.change?.toFixed(2) ||
                                            "N/A"}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-gray-600 dark:text-dark-text-secondary">
                                          Volatility:
                                        </span>
                                        <div className="font-medium">
                                          {trendData.volatility?.toFixed(2) ||
                                            "N/A"}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-gray-600 dark:text-dark-text-secondary">
                                          Direction:
                                        </span>
                                        <div className="font-medium">
                                          {trendData.direction || "N/A"}
                                        </div>
                                      </div>
                                    </div>
                                    {trendData.price_range && (
                                      <div className="mt-2 text-xs">
                                        <span className="text-gray-600 dark:text-dark-text-secondary">
                                          Range:
                                        </span>
                                        <span className="ml-1 font-medium">
                                          {formatPrice(
                                            trendData.price_range.min
                                          )}{" "}
                                          -{" "}
                                          {formatPrice(
                                            trendData.price_range.max
                                          )}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Execution Order */}
                        {selectedObservation.execution_order && (
                          <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-4 border border-gray-200 dark:border-dark-border">
                            <h5 className="text-xs font-semibold text-gray-700 dark:text-dark-text-secondary mb-3">
                              Execution Order
                            </h5>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-dark-text-secondary">
                                  Primary Leg:
                                </span>
                                <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                                  {
                                    selectedObservation.execution_order
                                      .primary_leg
                                  }
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-dark-text-secondary">
                                  Secondary Leg:
                                </span>
                                <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                                  {
                                    selectedObservation.execution_order
                                      .secondary_leg
                                  }
                                </span>
                              </div>
                              {selectedObservation.execution_order
                                .primary_change !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-dark-text-secondary">
                                    Primary Change:
                                  </span>
                                  <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                                    {selectedObservation.execution_order.primary_change.toFixed(
                                      2
                                    )}
                                  </span>
                                </div>
                              )}
                              {selectedObservation.execution_order
                                .secondary_change !== undefined && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-dark-text-secondary">
                                    Secondary Change:
                                  </span>
                                  <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                                    {selectedObservation.execution_order.secondary_change.toFixed(
                                      2
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Reason */}
                        {selectedObservation.reason && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                            <h5 className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                              Decision Reason
                            </h5>
                            <div
                              className="text-yellow-900 dark:text-yellow-200"
                              style={{ fontSize: "0.7rem" }}
                            >
                              {selectedObservation.reason}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500 dark:text-dark-text-muted text-center py-8">
                        Select an execution ID to view observation details
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Case Decisions Tab */}
        {selectedInstance && activeTab === "case-decisions" && (
          <>
            {/* Latest Case Decision */}
            {latestCaseDecision && (
              <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-b border-gray-200 dark:border-dark-border">
                  <h3 className="text-xs font-semibold text-gray-800 dark:text-dark-text-primary flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-purple-600"
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
                    Latest Case Decision
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 dark:text-dark-text-muted mb-1">
                        Decision
                      </p>
                      <p
                        className={`font-semibold ${
                          latestCaseDecision.final_decision === "CASE A"
                            ? "text-green-600 dark:text-green-400"
                            : latestCaseDecision.final_decision === "CASE B"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-orange-600 dark:text-orange-400"
                        }`}
                        style={{ fontSize: "0.7rem" }}
                      >
                        {latestCaseDecision.final_decision || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 dark:text-dark-text-muted mb-1">
                        Timestamp
                      </p>
                      <p
                        className="text-gray-900 dark:text-dark-text-primary"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {formatTimestamp(latestCaseDecision.timestamp)}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 dark:text-dark-text-muted mb-1">
                        Observation ID
                      </p>
                      <p
                        className="text-gray-900 dark:text-dark-text-primary font-mono"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {latestCaseDecision.observation_id?.slice(-8) || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 dark:text-dark-text-muted mb-1">
                        Analysis Duration
                      </p>
                      <p
                        className="text-gray-900 dark:text-dark-text-primary"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {latestCaseDecision.analysis_duration || "N/A"}s
                      </p>
                    </div>
                  </div>

                  {latestCaseDecision.decision_reasoning && (
                    <div className="mt-4 bg-gray-50 dark:bg-dark-surface rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 dark:text-dark-text-muted mb-2">
                        Decision Reasoning
                      </p>
                      <p
                        className="text-gray-700 dark:text-dark-text-secondary"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {latestCaseDecision.decision_reasoning}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Case Decision Observations List */}
            <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-b border-gray-200 dark:border-dark-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-800 dark:text-dark-text-primary flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-indigo-600"
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
                    Case Decision History
                  </h3>
                  <span
                    className="text-gray-500 dark:text-dark-text-muted"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {caseDecisionObservations.length} observations
                  </span>
                </div>
              </div>
              <div className="p-6">
                {caseDecisionObservations.length === 0 ? (
                  <div className="text-center py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <h3 className="mt-2 text-xs font-medium text-gray-900 dark:text-dark-text-primary">
                      No case decisions
                    </h3>
                    <p
                      className="mt-1 text-gray-500 dark:text-dark-text-muted"
                      style={{ fontSize: "0.7rem" }}
                    >
                      Case decision observations will appear here when
                      available.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {caseDecisionObservations.map((observationId, index) => (
                      <div
                        key={observationId}
                        className="border border-gray-200 dark:border-dark-border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors cursor-pointer"
                        onClick={() =>
                          fetchCaseDecisionObservation(observationId)
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-gray-900 dark:text-dark-text-primary">
                              Observation #
                              {caseDecisionObservations.length - index}
                            </p>
                            <p
                              className="text-gray-500 dark:text-dark-text-muted font-mono"
                              style={{ fontSize: "0.7rem" }}
                            >
                              ID: {observationId.slice(-12)}
                            </p>
                          </div>
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Case Decision Detail */}
            {selectedCaseDecision && (
              <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-b border-gray-200 dark:border-dark-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-gray-800 dark:text-dark-text-primary flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Case Decision Details
                    </h3>
                    <button
                      onClick={() => setSelectedCaseDecision(null)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {caseDecisionLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Decision Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-4">
                          <p className="text-xs font-medium text-gray-500 dark:text-dark-text-muted mb-1">
                            Final Decision
                          </p>
                          <p
                            className={`font-bold text-lg ${
                              selectedCaseDecision.final_decision === "CASE A"
                                ? "text-green-600 dark:text-green-400"
                                : selectedCaseDecision.final_decision ===
                                  "CASE B"
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-orange-600 dark:text-orange-400"
                            }`}
                          >
                            {selectedCaseDecision.final_decision || "N/A"}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-4">
                          <p className="text-xs font-medium text-gray-500 dark:text-dark-text-muted mb-1">
                            Analysis Time
                          </p>
                          <p
                            className="font-semibold text-gray-900 dark:text-dark-text-primary"
                            style={{ fontSize: "0.7rem" }}
                          >
                            {selectedCaseDecision.analysis_duration || "N/A"}s
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-4">
                          <p className="text-xs font-medium text-gray-500 dark:text-dark-text-muted mb-1">
                            Timestamp
                          </p>
                          <p
                            className="font-semibold text-gray-900 dark:text-dark-text-primary"
                            style={{ fontSize: "0.7rem" }}
                          >
                            {formatTimestamp(selectedCaseDecision.timestamp)}
                          </p>
                        </div>
                      </div>

                      {/* Decision Reasoning */}
                      {selectedCaseDecision.decision_reasoning && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                          <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-2">
                            Decision Reasoning
                          </h4>
                          <p
                            className="text-blue-700 dark:text-blue-400 leading-relaxed"
                            style={{ fontSize: "0.7rem" }}
                          >
                            {selectedCaseDecision.decision_reasoning}
                          </p>
                        </div>
                      )}

                      {/* Market Analysis Data */}
                      {selectedCaseDecision.market_data && (
                        <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-4">
                          <h4 className="text-xs font-semibold text-gray-800 dark:text-dark-text-primary mb-3">
                            Market Analysis Data
                          </h4>
                          <div className="bg-white dark:bg-dark-card rounded-lg p-3 font-mono text-xs overflow-x-auto">
                            <pre className="whitespace-pre-wrap text-gray-700 dark:text-dark-text-secondary">
                              {JSON.stringify(
                                selectedCaseDecision.market_data,
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <svg
                className="w-5 h-5 text-red-400 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-red-800 dark:text-red-300">
                  Error
                </h3>
                <div
                  className="mt-2 text-red-700 dark:text-red-400"
                  style={{ fontSize: "0.7rem" }}
                >
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

export default ObservationDashboard;
