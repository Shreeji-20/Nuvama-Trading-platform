import React, { useState, useEffect, useMemo, useCallback } from "react";
import config from "../config/api";

// Export to Excel functionality
const exportToExcel = (data, filename = "orders_export") => {
  // Convert data to CSV format
  const headers = [
    "Time",
    "User ID",
    "Symbol",
    "Trading Symbol",
    "Action",
    "Quantity",
    "Price",
    "Status",
    "Exchange",
    "Product",
    "Order Type",
    "Remarks",
  ];

  const csvContent = [
    headers.join(","),
    ...data.map((order) =>
      [
        order.ordTim || "",
        order.userID || "",
        order.dpName || "",
        order.tSym || "",
        order.tTyp || "",
        order.tQty || "",
        order.avgPrc || order.prc || "",
        order.sts || "",
        order.exc || "",
        order.pCode || "",
        order.oTyp || "",
        (order.rmk || "").replace(/,/g, ";"), // Replace commas to avoid CSV issues
      ]
        .map((field) => `"${field}"`)
        .join(",")
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${filename}_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// FilterInput component - defined outside to prevent re-creation
const FilterInput = React.memo(
  ({
    type = "text",
    placeholder,
    value,
    onChange,
    options = null,
    searchable = false,
    className = "",
    filterKey,
    dropdownState,
    setDropdownState,
    searchTerm,
    setSearchTerm,
  }) => {
    const isOpen = dropdownState || false;

    const handleSetIsOpen = useCallback(
      (open) => {
        setDropdownState(filterKey, open);
      },
      [filterKey, setDropdownState]
    );

    const handleSetSearchTerm = useCallback(
      (term) => {
        setSearchTerm(filterKey, term);
      },
      [filterKey, setSearchTerm]
    );

    // For searchable dropdowns
    if (options && searchable) {
      const currentSearchTerm = searchTerm || "";
      const filteredOptions = options.filter((option) =>
        option.toLowerCase().includes(currentSearchTerm.toLowerCase())
      );

      return (
        <div className="relative min-w-0">
          <input
            type="text"
            placeholder={placeholder}
            value={currentSearchTerm}
            onChange={(e) => {
              const newValue = e.target.value;
              handleSetSearchTerm(newValue);
              handleSetIsOpen(true);

              // If exact match found, set the filter
              const exactMatch = options.find(
                (option) => option.toLowerCase() === newValue.toLowerCase()
              );

              if (exactMatch) {
                onChange({ target: { value: exactMatch } });
              } else if (newValue === "") {
                onChange({ target: { value: "" } });
              } else {
                // For partial matches, allow typing but don't set filter yet
                onChange({ target: { value: "" } });
              }
            }}
            onFocus={() => handleSetIsOpen(true)}
            onBlur={(e) => {
              // Small delay to allow dropdown clicks
              setTimeout(() => {
                if (!e.target.matches(":focus")) {
                  handleSetIsOpen(false);
                }
              }, 150);
            }}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary transition-colors duration-200 focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-light-accent dark:focus:border-dark-accent ${className}`}
          />
          {isOpen && filteredOptions.length > 0 && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => handleSetIsOpen(false)}
              />
              {/* Dropdown */}
              <div className="absolute z-20 w-full mt-1 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredOptions.slice(0, 50).map((option, index) => (
                  <div
                    key={`${filterKey}-${index}-${option}`}
                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-dark-text-primary"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent input blur
                      handleSetSearchTerm(option);
                      onChange({ target: { value: option } });
                      handleSetIsOpen(false);
                    }}
                  >
                    {option}
                  </div>
                ))}
                {filteredOptions.length > 50 && (
                  <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 italic">
                    ...and {filteredOptions.length - 50} more options
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      );
    }

    // Regular dropdown
    if (options) {
      return (
        <div className="min-w-0">
          <select
            value={value}
            onChange={onChange}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary transition-colors duration-200 focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-light-accent dark:focus:border-dark-accent ${className}`}
          >
            <option value="">{placeholder}</option>
            {options.map((option, index) => (
              <option key={`${filterKey}-${index}-${option}`} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // Regular input
    return (
      <div className="min-w-0">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary transition-colors duration-200 focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-light-accent dark:focus:border-dark-accent ${className}`}
        />
      </div>
    );
  }
);

const OrdersTable = () => {
  // Core states
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [users, setUsers] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    userID: "",
    dpName: "",
    tTyp: "",
    sts: "",
    exc: "",
    pCode: "",
    oTyp: "",
    opTyp: "",
    rmk: "",
    minQty: "",
    maxQty: "",
    minPrice: "",
    maxPrice: "",
  });

  // Dropdown states - persistent across re-renders
  const [dropdownStates, setDropdownStates] = useState({});
  const [searchTerms, setSearchTerms] = useState({});

  // Sorting states
  const [sortConfig, setSortConfig] = useState({
    key: "ordTim",
    direction: "desc",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Static dropdown values
  const staticOptions = useMemo(
    () => ({
      tTyp: ["B", "S"],
      sts: ["complete", "pending", "cancelled", "rejected", "open", "filled"],
      exc: ["NSE", "BSE", "NFO", "BFO", "MCX", "NCDEX"],
      pCode: ["MIS", "CNC", "NRML", "CO", "BO"],
      oTyp: ["MARKET", "LIMIT", "SL", "SL-M"],
      opTyp: ["CE", "PE", "XX"],
    }),
    []
  );

  // Dynamic options from orders data
  const dynamicOptions = useMemo(
    () => ({
      dpName: [
        ...new Set(orders.map((order) => order.dpName).filter(Boolean)),
      ].sort(),
      rmk: [
        ...new Set(orders.map((order) => order.rmk).filter(Boolean)),
      ].sort(),
    }),
    [orders]
  );

  // Combined options
  const allOptions = useMemo(
    () => ({
      ...staticOptions,
      ...dynamicOptions,
      userID: users,
    }),
    [staticOptions, dynamicOptions, users]
  );

  // Stable dropdown state handlers
  const setDropdownState = useCallback((key, isOpen) => {
    setDropdownStates((prev) => ({ ...prev, [key]: isOpen }));
  }, []);

  const setSearchTerm = useCallback((key, term) => {
    setSearchTerms((prev) => ({ ...prev, [key]: term }));
  }, []);

  // Filter change handler
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  // Stable onChange handlers
  const onChangeHandlers = useMemo(() => {
    const handlers = {};
    Object.keys(filters).forEach((key) => {
      handlers[key] = (e) => handleFilterChange(key, e.target.value);
    });
    return handlers;
  }, [handleFilterChange]);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(config.buildUrl(config.ENDPOINTS.USERS));
        const data = await response.json();
        if (Array.isArray(data)) {
          setUsers(data.map((user) => user.userid).sort());
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  // Fetch orders
  const fetchOrders = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh || orders.length === 0) {
          setLoading(true);
        }

        const response = await fetch(config.buildUrl(config.ENDPOINTS.ORDERS));
        const data = await response.json();

        if (response.ok) {
          const ordersData = data.orders.map((order) => {
            if (order.response && order.response.data) {
              return {
                ...order.response.data,
                redis_key: order.redis_key,
                raw_timestamp: order.timestamp || Date.now(),
              };
            }
            return order;
          });

          setOrders(ordersData);
          setLastUpdated(new Date());
          setError(null);
        } else {
          if (isManualRefresh || orders.length === 0) {
            setError(data.message || "Failed to fetch orders");
          }
        }
      } catch (err) {
        if (isManualRefresh || orders.length === 0) {
          setError("Network error: " + err.message);
        }
      } finally {
        if (isManualRefresh || orders.length === 0) {
          setLoading(false);
        }
      }
    },
    [orders.length]
  );

  // Auto refresh
  useEffect(() => {
    fetchOrders(true);
    const interval = setInterval(() => fetchOrders(false), 1000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      userID: "",
      dpName: "",
      tTyp: "",
      sts: "",
      exc: "",
      pCode: "",
      oTyp: "",
      opTyp: "",
      rmk: "",
      minQty: "",
      maxQty: "",
      minPrice: "",
      maxPrice: "",
    });
    setDropdownStates({});
    setSearchTerms({});
    setCurrentPage(1);
  }, []);

  // Sorting
  const handleSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders.filter((order) => {
      return (
        (!filters.userID ||
          order.userID?.toLowerCase().includes(filters.userID.toLowerCase())) &&
        (!filters.dpName ||
          order.dpName?.toLowerCase().includes(filters.dpName.toLowerCase())) &&
        (!filters.tTyp || order.tTyp === filters.tTyp) &&
        (!filters.sts || order.sts === filters.sts) &&
        (!filters.exc || order.exc === filters.exc) &&
        (!filters.pCode || order.pCode === filters.pCode) &&
        (!filters.oTyp || order.oTyp === filters.oTyp) &&
        (!filters.opTyp || order.opTyp === filters.opTyp) &&
        (!filters.rmk ||
          order.rmk?.toLowerCase().includes(filters.rmk.toLowerCase())) &&
        (!filters.minQty || parseInt(order.tQty) >= parseInt(filters.minQty)) &&
        (!filters.maxQty || parseInt(order.tQty) <= parseInt(filters.maxQty)) &&
        (!filters.minPrice ||
          parseFloat(order.avgPrc || order.prc) >=
            parseFloat(filters.minPrice)) &&
        (!filters.maxPrice ||
          parseFloat(order.avgPrc || order.prc) <= parseFloat(filters.maxPrice))
      );
    });

    // Sort
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (
          ["tQty", "fQty", "avgPrc", "prc", "fPrc", "stkPrc"].includes(
            sortConfig.key
          )
        ) {
          aVal = parseFloat(aVal) || 0;
          bVal = parseFloat(bVal) || 0;
        }

        if (["ordTim", "epochTim"].includes(sortConfig.key)) {
          const parseTime = (timeStr) => {
            if (!timeStr) return 0;
            if (timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
              const today = new Date().toISOString().split("T")[0];
              return new Date(`${today}T${timeStr}`).getTime();
            }
            const parsed = new Date(timeStr);
            if (!isNaN(parsed.getTime())) {
              return parsed.getTime();
            }
            return 0;
          };
          aVal = parseTime(aVal);
          bVal = parseTime(bVal);
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [orders, filters, sortConfig]);

  // Pagination
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = filteredAndSortedOrders.slice(
      startIndex,
      startIndex + itemsPerPage
    );
    return { totalPages, startIndex, paginatedOrders };
  }, [filteredAndSortedOrders, currentPage, itemsPerPage]);

  // Status colors
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "complete":
      case "filled":
        return "text-emerald-700 dark:text-emerald-300 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-700/50";
      case "pending":
      case "open":
        return "text-amber-700 dark:text-amber-300 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 border border-amber-200 dark:border-amber-700/50";
      case "cancelled":
      case "rejected":
        return "text-red-700 dark:text-red-300 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border border-red-200 dark:border-red-700/50";
      default:
        return "text-gray-700 dark:text-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/20 border border-gray-200 dark:border-gray-600/50";
    }
  };

  const getActionColor = (action) => {
    switch (action?.toLowerCase()) {
      case "b":
      case "buy":
        return "text-green-700 dark:text-green-300 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 border border-green-200 dark:border-green-700/50";
      case "s":
      case "sell":
        return "text-red-700 dark:text-red-300 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border border-red-200 dark:border-red-700/50";
      default:
        return "text-gray-700 dark:text-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/20 border border-gray-200 dark:border-gray-600/50";
    }
  };

  // Sortable header component
  const SortableHeader = ({ sortKey, children }) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortConfig.key === sortKey && (
          <span className="text-light-accent dark:text-dark-accent">
            {sortConfig.direction === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </th>
  );

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-light-gradient dark:bg-dark-gradient p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-light-accent dark:border-dark-accent mx-auto"></div>
          <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary">
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-light-lg dark:shadow-dark-xl p-4 md:p-6 mb-6 border border-light-border dark:border-dark-border transition-colors duration-300">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                Orders Management
              </h1>
              <p className="text-sm md:text-base text-light-text-secondary dark:text-dark-text-secondary mt-1">
                Total: {filteredAndSortedOrders.length} orders
                {filteredAndSortedOrders.length !== orders.length && (
                  <span className="text-light-accent dark:text-dark-accent">
                    {" "}
                    (filtered from {orders.length})
                  </span>
                )}
                {lastUpdated && (
                  <span className="block sm:inline sm:ml-2">
                    • Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
              <button
                onClick={() =>
                  exportToExcel(filteredAndSortedOrders, "orders_export")
                }
                disabled={filteredAndSortedOrders.length === 0}
                className={`
                  group relative px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold text-white 
                  transition-all duration-300 transform hover:scale-105 
                  shadow-lg hover:shadow-xl overflow-hidden text-sm md:text-base
                  ${
                    filteredAndSortedOrders.length === 0
                      ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  }
                `}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center space-x-2">
                  <span className="group-hover:rotate-12 transition-transform duration-300">
                    📊
                  </span>
                  <span className="hidden sm:inline">Export to Excel</span>
                  <span className="sm:hidden">Export</span>
                </div>
              </button>
              <button
                onClick={() => fetchOrders(true)}
                disabled={loading}
                className={`
                  group relative px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold text-white 
                  transition-all duration-300 transform hover:scale-105 
                  shadow-lg hover:shadow-xl overflow-hidden text-sm md:text-base
                  ${
                    loading
                      ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  }
                `}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center space-x-2">
                  <span
                    className={`${
                      loading ? "animate-spin" : "group-hover:rotate-180"
                    } transition-transform duration-500`}
                  >
                    {loading ? "⏳" : "🔄"}
                  </span>
                  <span className="hidden sm:inline">
                    {loading ? "Refreshing..." : "Refresh Data"}
                  </span>
                  <span className="sm:hidden">
                    {loading ? "Refreshing..." : "Refresh"}
                  </span>
                </div>
              </button>
              <button
                onClick={clearFilters}
                className="group px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-sm md:text-base"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>🗑️</span>
                  <span className="hidden sm:inline">Clear Filters</span>
                  <span className="sm:hidden">Clear</span>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl">
              <p className="text-red-700 dark:text-red-300 text-sm md:text-base">
                Error: {error}
              </p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-light-lg dark:shadow-dark-xl p-4 md:p-6 mb-6 border border-light-border dark:border-dark-border transition-colors duration-300">
          <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
            Filters
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
            <FilterInput
              placeholder="User ID"
              value={filters.userID}
              onChange={onChangeHandlers.userID}
              options={allOptions.userID}
              filterKey="userID"
              dropdownState={dropdownStates.userID}
              setDropdownState={setDropdownState}
              searchTerm={searchTerms.userID}
              setSearchTerm={setSearchTerm}
            />
            <FilterInput
              placeholder="Symbol"
              value={filters.dpName}
              onChange={onChangeHandlers.dpName}
              options={allOptions.dpName}
              searchable={true}
              filterKey="dpName"
              dropdownState={dropdownStates.dpName}
              setDropdownState={setDropdownState}
              searchTerm={searchTerms.dpName}
              setSearchTerm={setSearchTerm}
            />
            <FilterInput
              placeholder="Action"
              value={filters.tTyp}
              onChange={onChangeHandlers.tTyp}
              options={allOptions.tTyp}
              filterKey="tTyp"
              dropdownState={dropdownStates.tTyp}
              setDropdownState={setDropdownState}
              searchTerm={searchTerms.tTyp}
              setSearchTerm={setSearchTerm}
            />
            <FilterInput
              placeholder="Status"
              value={filters.sts}
              onChange={onChangeHandlers.sts}
              options={allOptions.sts}
              filterKey="sts"
              dropdownState={dropdownStates.sts}
              setDropdownState={setDropdownState}
              searchTerm={searchTerms.sts}
              setSearchTerm={setSearchTerm}
            />
            <FilterInput
              placeholder="Exchange"
              value={filters.exc}
              onChange={onChangeHandlers.exc}
              options={allOptions.exc}
              filterKey="exc"
              dropdownState={dropdownStates.exc}
              setDropdownState={setDropdownState}
              searchTerm={searchTerms.exc}
              setSearchTerm={setSearchTerm}
            />
            <FilterInput
              placeholder="Product"
              value={filters.pCode}
              onChange={onChangeHandlers.pCode}
              options={allOptions.pCode}
              filterKey="pCode"
              dropdownState={dropdownStates.pCode}
              setDropdownState={setDropdownState}
              searchTerm={searchTerms.pCode}
              setSearchTerm={setSearchTerm}
            />
            <FilterInput
              placeholder="Order Type"
              value={filters.oTyp}
              onChange={onChangeHandlers.oTyp}
              options={allOptions.oTyp}
              filterKey="oTyp"
              dropdownState={dropdownStates.oTyp}
              setDropdownState={setDropdownState}
              searchTerm={searchTerms.oTyp}
              setSearchTerm={setSearchTerm}
            />
            <FilterInput
              placeholder="Option Type"
              value={filters.opTyp}
              onChange={onChangeHandlers.opTyp}
              options={allOptions.opTyp}
              filterKey="opTyp"
              dropdownState={dropdownStates.opTyp}
              setDropdownState={setDropdownState}
              searchTerm={searchTerms.opTyp}
              setSearchTerm={setSearchTerm}
            />
            <FilterInput
              placeholder="Remarks"
              value={filters.rmk}
              onChange={onChangeHandlers.rmk}
              options={allOptions.rmk}
              searchable={true}
              filterKey="rmk"
              dropdownState={dropdownStates.rmk}
              setDropdownState={setDropdownState}
              searchTerm={searchTerms.rmk}
              setSearchTerm={setSearchTerm}
            />
            <FilterInput
              type="number"
              placeholder="Min Qty"
              value={filters.minQty}
              onChange={onChangeHandlers.minQty}
              filterKey="minQty"
              dropdownState={dropdownStates.minQty}
              setDropdownState={setDropdownState}
              searchTerm={searchTerms.minQty}
              setSearchTerm={setSearchTerm}
            />
            <FilterInput
              type="number"
              placeholder="Max Qty"
              value={filters.maxQty}
              onChange={onChangeHandlers.maxQty}
              filterKey="maxQty"
              dropdownState={dropdownStates.maxQty}
              setDropdownState={setDropdownState}
              searchTerm={searchTerms.maxQty}
              setSearchTerm={setSearchTerm}
            />
            <FilterInput
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={onChangeHandlers.minPrice}
              filterKey="minPrice"
              dropdownState={dropdownStates.minPrice}
              setDropdownState={setDropdownState}
              searchTerm={searchTerms.minPrice}
              setSearchTerm={setSearchTerm}
            />
            <FilterInput
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={onChangeHandlers.maxPrice}
              filterKey="maxPrice"
              dropdownState={dropdownStates.maxPrice}
              setDropdownState={setDropdownState}
              searchTerm={searchTerms.maxPrice}
              setSearchTerm={setSearchTerm}
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-light-lg dark:shadow-dark-xl border border-light-border dark:border-dark-border overflow-hidden transition-colors duration-300">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-light-border dark:divide-dark-border">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <SortableHeader sortKey="ordTim">Time</SortableHeader>
                  <SortableHeader sortKey="userID">User</SortableHeader>
                  <SortableHeader sortKey="dpName">Symbol</SortableHeader>
                  <SortableHeader sortKey="tSym">Trading Symbol</SortableHeader>
                  <SortableHeader sortKey="tTyp">Action</SortableHeader>
                  <SortableHeader sortKey="tQty">Quantity</SortableHeader>
                  <SortableHeader sortKey="avgPrc">Price</SortableHeader>
                  <SortableHeader sortKey="sts">Status</SortableHeader>
                  <SortableHeader sortKey="exc">Exchange</SortableHeader>
                  <SortableHeader sortKey="pCode">Product</SortableHeader>
                  <SortableHeader sortKey="oTyp">Order Type</SortableHeader>
                  <SortableHeader sortKey="rmk">Remarks</SortableHeader>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-transparent divide-y divide-light-border dark:divide-dark-border">
                {paginationData.paginatedOrders.map((order, index) => (
                  <tr
                    key={order.redis_key || index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-light-text-primary dark:text-dark-text-primary">
                      {order.ordTim}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-light-accent dark:text-dark-accent">
                      {order.userID}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-light-text-primary dark:text-dark-text-primary">
                      {order.dpName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-light-text-primary dark:text-dark-text-primary">
                      {order.tSym}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(
                          order.tTyp
                        )}`}
                      >
                        {order.tTyp}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-light-text-primary dark:text-dark-text-primary">
                      {order.tQty}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-light-text-primary dark:text-dark-text-primary">
                      ₹{order.avgPrc || order.prc}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          order.sts
                        )}`}
                      >
                        {order.sts}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-light-text-primary dark:text-dark-text-primary">
                      {order.exc}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-light-text-primary dark:text-dark-text-primary">
                      {order.pCode}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-light-text-primary dark:text-dark-text-primary">
                      {order.oTyp}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-light-text-primary dark:text-dark-text-primary">
                      {order.rmk || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4 p-4">
            {paginationData.paginatedOrders.map((order, index) => (
              <div
                key={order.redis_key || index}
                className="bg-white dark:bg-dark-elevated rounded-lg border border-light-border dark:border-dark-border p-4 space-y-3"
              >
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(
                        order.tTyp
                      )}`}
                    >
                      {order.tTyp}
                    </span>
                    <span className="text-sm font-mono text-light-text-primary dark:text-dark-text-primary">
                      {order.dpName}
                    </span>
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      order.sts
                    )}`}
                  >
                    {order.sts}
                  </span>
                </div>

                {/* Trading Symbol row */}
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Trading Symbol:
                  </span>
                  <span className="ml-2 font-mono text-light-text-primary dark:text-dark-text-primary">
                    {order.tSym || "-"}
                  </span>
                </div>

                {/* Main details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      User:
                    </span>
                    <span className="ml-2 font-medium text-light-accent dark:text-dark-accent">
                      {order.userID}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Time:
                    </span>
                    <span className="ml-2 text-light-text-primary dark:text-dark-text-primary">
                      {order.ordTim}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Qty:
                    </span>
                    <span className="ml-2 text-light-text-primary dark:text-dark-text-primary">
                      {order.tQty}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Price:
                    </span>
                    <span className="ml-2 text-light-text-primary dark:text-dark-text-primary">
                      ₹{order.avgPrc || order.prc}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Exchange:
                    </span>
                    <span className="ml-2 text-light-text-primary dark:text-dark-text-primary">
                      {order.exc}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Product:
                    </span>
                    <span className="ml-2 text-light-text-primary dark:text-dark-text-primary">
                      {order.pCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Order Type:
                    </span>
                    <span className="ml-2 text-light-text-primary dark:text-dark-text-primary">
                      {order.oTyp}
                    </span>
                  </div>
                  {order.rmk && (
                    <div className="col-span-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Remarks:
                      </span>
                      <span className="ml-2 text-light-text-primary dark:text-dark-text-primary">
                        {order.rmk}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-t border-light-border dark:border-dark-border">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Showing {paginationData.startIndex + 1}-
                  {Math.min(
                    paginationData.startIndex + itemsPerPage,
                    filteredAndSortedOrders.length
                  )}{" "}
                  of {filteredAndSortedOrders.length}
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 dark:border-dark-border rounded px-2 py-1 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary w-auto"
                >
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                  <option value={200}>200 per page</option>
                </select>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-dark-border rounded text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary px-2">
                  Page {currentPage} of {paginationData.totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(paginationData.totalPages, prev + 1)
                    )
                  }
                  disabled={currentPage === paginationData.totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-dark-border rounded text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;
