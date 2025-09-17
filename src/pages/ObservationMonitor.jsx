import React, { useState, useEffect, useMemo } from "react";
import config from "../config/api";

const ObservationMonitor = () => {
  const [observations, setObservations] = useState([]);
  const [executionIds, setExecutionIds] = useState([]);
  const [selectedExecutionId, setSelectedExecutionId] = useState("");
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch execution IDs
  const fetchExecutionIds = async () => {
    try {
      const response = await fetch(
        config.buildUrl("/observations/execution-ids")
      );
      const data = await response.json();
      if (response.ok) {
        setExecutionIds(data.execution_ids || []);
        // Auto-select the most recent if none selected
        if (!selectedExecutionId && data.execution_ids.length > 0) {
          setSelectedExecutionId(data.execution_ids[0]);
        }
      } else {
        setError(data.message || "Failed to fetch execution IDs");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    }
  };

  // Fetch specific observation
  const fetchObservation = async (executionId) => {
    if (!executionId) return;

    try {
      const response = await fetch(
        config.buildUrl(`/observations/observation/${executionId}`)
      );
      const data = await response.json();
      if (response.ok) {
        setSelectedObservation(data);
        setError(null);
      } else {
        setError(data.detail || "Failed to fetch observation");
        setSelectedObservation(null);
      }
    } catch (err) {
      setError("Network error: " + err.message);
      setSelectedObservation(null);
    }
  };

  // Fetch all observations
  const fetchAllObservations = async () => {
    try {
      const response = await fetch(
        config.buildUrl("/observations/all?limit=100")
      );
      const data = await response.json();
      if (response.ok) {
        setObservations(data.observations || []);
      }
    } catch (err) {
      console.error("Failed to fetch all observations:", err);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch(config.buildUrl("/observations/stats"));
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchExecutionIds(),
        fetchAllObservations(),
        fetchStats(),
      ]);
      setLastUpdated(new Date());
      setLoading(false);
    };
    loadData();
  }, []);

  // Fetch specific observation when selection changes
  useEffect(() => {
    if (selectedExecutionId) {
      fetchObservation(selectedExecutionId);
    }
  }, [selectedExecutionId]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      await Promise.all([
        fetchExecutionIds(),
        fetchAllObservations(),
        fetchStats(),
      ]);
      if (selectedExecutionId) {
        await fetchObservation(selectedExecutionId);
      }
      setLastUpdated(new Date());
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, selectedExecutionId]);

  // Helper functions
  const getStatusColor = (caseDecision, status) => {
    if (status === "error") {
      return "bg-red-100 text-red-800 border-red-200";
    }
    switch (caseDecision) {
      case "CASE_A":
        return "bg-green-100 text-green-800 border-green-200";
      case "CASE_B":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case "INCREASING":
        return "text-green-600";
      case "DECREASING":
        return "text-red-600";
      case "STABLE":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Statistics summary
  const statsSummary = useMemo(() => {
    if (!observations.length) return null;

    const caseACount = observations.filter(
      (obs) => obs.case_decision === "CASE_A"
    ).length;
    const caseBCount = observations.filter(
      (obs) => obs.case_decision === "CASE_B"
    ).length;
    const errorCount = observations.filter(
      (obs) => obs.status === "error"
    ).length;

    return {
      total: observations.length,
      caseA: caseACount,
      caseB: caseBCount,
      errors: errorCount,
      caseAPercentage: observations.length
        ? ((caseACount / observations.length) * 100).toFixed(1)
        : 0,
      caseBPercentage: observations.length
        ? ((caseBCount / observations.length) * 100).toFixed(1)
        : 0,
    };
  }, [observations]);

  if (loading && !observations.length) {
    return (
      <div className="min-h-screen bg-light-gradient dark:bg-dark-gradient p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-light-accent dark:border-dark-accent mx-auto"></div>
          <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary">
            Loading observations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gradient dark:bg-dark-gradient p-4 md:p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-light-lg dark:shadow-dark-xl p-4 md:p-6 mb-6 border border-light-border dark:border-dark-border">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                Box Strategy Observation Monitor
              </h1>
              <p className="text-sm md:text-base text-light-text-secondary dark:text-dark-text-secondary mt-1">
                Real-time monitoring of market case decisions
                {lastUpdated && (
                  <span className="block sm:inline sm:ml-2">
                    • Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Auto-refresh
                </span>
              </label>
              <button
                onClick={() => {
                  fetchExecutionIds();
                  fetchAllObservations();
                  fetchStats();
                  if (selectedExecutionId)
                    fetchObservation(selectedExecutionId);
                  setLastUpdated(new Date());
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl">
              <p className="text-red-700 dark:text-red-300 text-sm">
                Error: {error}
              </p>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        {statsSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white dark:bg-dark-card rounded-lg p-4 border border-light-border dark:border-dark-border">
              <div className="text-2xl font-bold text-blue-600">
                {statsSummary.total}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Observations
              </div>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-lg p-4 border border-light-border dark:border-dark-border">
              <div className="text-2xl font-bold text-green-600">
                {statsSummary.caseA}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                CASE A ({statsSummary.caseAPercentage}%)
              </div>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-lg p-4 border border-light-border dark:border-dark-border">
              <div className="text-2xl font-bold text-yellow-600">
                {statsSummary.caseB}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                CASE B ({statsSummary.caseBPercentage}%)
              </div>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-lg p-4 border border-light-border dark:border-dark-border">
              <div className="text-2xl font-bold text-red-600">
                {statsSummary.errors}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Errors
              </div>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-lg p-4 border border-light-border dark:border-dark-border">
              <div className="text-2xl font-bold text-purple-600">
                {statsSummary.total > 0
                  ? Math.round((statsSummary.caseA / statsSummary.total) * 100)
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Stability Rate
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Execution ID Selector & Recent Observations */}
          <div className="lg:col-span-1">
            <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-light-lg dark:shadow-dark-xl p-6 border border-light-border dark:border-dark-border">
              <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                Execution IDs
              </h2>

              <select
                value={selectedExecutionId}
                onChange={(e) => setSelectedExecutionId(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary mb-4"
              >
                <option value="">Select Execution ID</option>
                {executionIds.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>

              {/* Recent Observations List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recent Observations
                </h3>
                {observations.slice(0, 10).map((obs) => (
                  <div
                    key={obs.execution_id}
                    onClick={() => setSelectedExecutionId(obs.execution_id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedExecutionId === obs.execution_id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
                          obs.case_decision,
                          obs.status
                        )}`}
                      >
                        {obs.case_decision || "ERROR"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(obs.timestamp).split(" ")[1]}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {obs.symbol} | {obs.action} |{" "}
                      {obs.isExit ? "Exit" : "Entry"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ID: {obs.execution_id.slice(-8)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Observation Details */}
          <div className="lg:col-span-2">
            {selectedObservation ? (
              <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-light-lg dark:shadow-dark-xl p-6 border border-light-border dark:border-dark-border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                    Observation Details
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      selectedObservation.case_decision,
                      selectedObservation.status
                    )}`}
                  >
                    {selectedObservation.case_decision || "ERROR"}
                  </span>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Execution ID
                      </label>
                      <div className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        {selectedObservation.execution_id}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Timestamp
                      </label>
                      <div className="text-sm">
                        {formatTimestamp(selectedObservation.timestamp)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Symbol & Strike
                      </label>
                      <div className="text-sm">
                        {selectedObservation.symbol} @{" "}
                        {selectedObservation.atm_strike}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Action & Type
                      </label>
                      <div className="text-sm">
                        {selectedObservation.action} -{" "}
                        {selectedObservation.isExit ? "Exit" : "Entry"}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Duration & Samples
                      </label>
                      <div className="text-sm">
                        {selectedObservation.observation_duration}s |{" "}
                        {selectedObservation.valid_samples} samples
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Status
                      </label>
                      <div className="text-sm">
                        {selectedObservation.status}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trends Analysis */}
                {selectedObservation.trends && (
                  <div className="mb-6">
                    <h3 className="text-md font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
                      Trend Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(selectedObservation.trends).map(
                        ([legKey, trendData]) => (
                          <div
                            key={legKey}
                            className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
                          >
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                              {legKey}
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Trend:
                                </span>
                                <span
                                  className={`font-medium ${getTrendColor(
                                    trendData.trend
                                  )}`}
                                >
                                  {trendData.trend}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Change:
                                </span>
                                <span
                                  className={
                                    trendData.change >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  {trendData.change >= 0 ? "+" : ""}
                                  {trendData.change?.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Volatility:
                                </span>
                                <span>{trendData.volatility?.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Direction:
                                </span>
                                <span
                                  className={
                                    trendData.direction === "UP"
                                      ? "text-green-600"
                                      : trendData.direction === "DOWN"
                                      ? "text-red-600"
                                      : "text-gray-600"
                                  }
                                >
                                  {trendData.direction}
                                </span>
                              </div>
                              {trendData.price_range && (
                                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Range:{" "}
                                    {trendData.price_range.min?.toFixed(2)} -{" "}
                                    {trendData.price_range.max?.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Start:{" "}
                                    {trendData.price_range.start?.toFixed(2)} →
                                    End: {trendData.price_range.end?.toFixed(2)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Execution Order */}
                {selectedObservation.execution_order && (
                  <div className="mb-6">
                    <h3 className="text-md font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
                      Execution Order
                    </h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                            1st
                          </span>
                          <span className="font-medium">
                            {selectedObservation.execution_order.primary_leg}
                          </span>
                          {selectedObservation.execution_order
                            .primary_change && (
                            <span className="text-sm text-gray-600">
                              (
                              {selectedObservation.execution_order.primary_change?.toFixed(
                                2
                              )}
                              )
                            </span>
                          )}
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="flex items-center space-x-2">
                          <span className="bg-gray-600 text-white px-2 py-1 rounded text-xs font-medium">
                            2nd
                          </span>
                          <span className="font-medium">
                            {selectedObservation.execution_order.secondary_leg}
                          </span>
                          {selectedObservation.execution_order
                            .secondary_change && (
                            <span className="text-sm text-gray-600">
                              (
                              {selectedObservation.execution_order.secondary_change?.toFixed(
                                2
                              )}
                              )
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reason */}
                <div>
                  <h3 className="text-md font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
                    Decision Reason
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedObservation.reason
                        ?.replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                    {selectedObservation.moving_legs && (
                      <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                        Moving legs:{" "}
                        {selectedObservation.moving_legs.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-light-lg dark:shadow-dark-xl p-6 border border-light-border dark:border-dark-border">
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                    No Observation Selected
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500">
                    Select an execution ID from the list to view detailed
                    observation data
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObservationMonitor;
