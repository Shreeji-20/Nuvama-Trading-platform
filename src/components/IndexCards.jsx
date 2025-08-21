import React, { useState, useEffect } from "react";

// base URLs (development / production)
const DEV_BASE_URL = "http://localhost:8000";
const PROD_BASE_URL = "https://api.example.com"; // replace with real prod URL

// Icon mapping for different indices
const getIndexIcon = (symbol) => {
  const iconMap = {
    NIFTY: (
      <svg
        className="w-6 h-6"
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
    ),
    SENSEX: (
      <svg
        className="w-6 h-6"
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
    ),
    BANKNIFTY: (
      <svg
        className="w-6 h-6"
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
    ),
    FINNIFTY: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
    DEFAULT: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  };
  return iconMap[symbol] || iconMap["DEFAULT"];
};

// Color theme mapping for different indices
const getIndexTheme = (symbol) => {
  const themeMap = {
    NIFTY: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      icon: "text-blue-600 dark:text-blue-400",
    },
    SENSEX: {
      bg: "bg-orange-100 dark:bg-orange-900/30",
      icon: "text-orange-600 dark:text-orange-400",
    },
    BANKNIFTY: {
      bg: "bg-green-100 dark:bg-green-900/30",
      icon: "text-green-600 dark:text-green-400",
    },
    FINNIFTY: {
      bg: "bg-purple-100 dark:bg-purple-900/30",
      icon: "text-purple-600 dark:text-purple-400",
    },
    DEFAULT: {
      bg: "bg-gray-100 dark:bg-gray-900/30",
      icon: "text-gray-600 dark:text-gray-400",
    },
  };
  return themeMap[symbol] || themeMap["DEFAULT"];
};

// Exchange mapping for different indices
const getExchangeName = (symbol) => {
  const exchangeMap = {
    NIFTY: "National Stock Exchange",
    SENSEX: "Bombay Stock Exchange",
    BANKNIFTY: "National Stock Exchange",
    FINNIFTY: "National Stock Exchange",
  };
  return exchangeMap[symbol] || "Stock Exchange";
};

// Individual Index Card Component
const IndexCard = ({ indexData }) => {
  const { symbol, name, price, change, changePercent, high, low, volume } =
    indexData;
  const theme = getIndexTheme(symbol);
  const icon = getIndexIcon(symbol);
  const exchange = getExchangeName(symbol);

  const isPositive = change >= 0;
  const changeColor = isPositive
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";

  const formatNumber = (num) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-light-lg dark:shadow-dark-xl border border-light-border dark:border-dark-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`${theme.bg} rounded-lg p-3`}>
            <div className={theme.icon}>{icon}</div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
              {name || symbol}
            </h3>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              {exchange}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
            {price
              ? price.toLocaleString("en-IN", { minimumFractionDigits: 2 })
              : "--"}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <svg
              className={`w-4 h-4 ${
                isPositive ? "text-green-500" : "text-red-500"
              } ${isPositive ? "" : "rotate-180"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 17l9.2-9.2M17 17V7H7"
              />
            </svg>
            <span className={`${changeColor} font-medium`}>
              {isPositive ? "+" : ""}
              {change?.toFixed(2) || "--"} ({isPositive ? "+" : ""}
              {changePercent?.toFixed(2) || "--"}%)
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            High
          </p>
          <p className="font-semibold text-light-text-primary dark:text-dark-text-primary">
            {high
              ? high.toLocaleString("en-IN", { minimumFractionDigits: 2 })
              : "--"}
          </p>
        </div>
        <div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Low
          </p>
          <p className="font-semibold text-light-text-primary dark:text-dark-text-primary">
            {low
              ? low.toLocaleString("en-IN", { minimumFractionDigits: 2 })
              : "--"}
          </p>
        </div>
        <div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Volume
          </p>
          <p className="font-semibold text-light-text-primary dark:text-dark-text-primary">
            {volume ? formatNumber(volume) : "--"}
          </p>
        </div>
      </div>
    </div>
  );
};

// Main IndexCards Component
const IndexCards = ({ indices = [], className = "" }) => {
  const [indexData, setIndexData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch index data from backend
  const fetchIndexData = async () => {
    if (!indices || indices.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // If indices is an array of strings, fetch data for each
      if (typeof indices[0] === "string") {
        const promises = indices.map(async (symbol) => {
          try {
            const response = await fetch(`${DEV_BASE_URL}/index/${symbol}`);
            if (!response.ok) throw new Error(`Failed to fetch ${symbol}`);
            const data = await response.json();
            return {
              symbol,
              name: symbol,
              price:
                data?.response?.data?.ltp || data.ltp || data.current_price,
              change:
                data?.response?.data?.ltp - data?.response?.data?.c ||
                data.net_change,
              changePercent:
                ((data?.response?.data?.ltp - data?.response?.data?.c) * 100) /
                  (data?.response?.data?.ltp ||
                    data.ltp ||
                    data.current_price) || data.percent_change,
              high: data?.response?.data?.h || data.day_high,
              low: data?.response?.data?.l || data.day_low,
              volume: data?.response?.data?.vol || data.total_volume,
            };
          } catch (err) {
            console.error(`Error fetching ${symbol}:`, err);
            // Return default data structure for failed requests
            return {
              symbol,
              name: symbol,
              price: null,
              change: null,
              changePercent: null,
              high: null,
              low: null,
              volume: null,
            };
          }
        });

        const results = await Promise.all(promises);
        setIndexData(results);
      } else {
        // If indices is already an array of objects, use it directly
        setIndexData(indices);
      }
    } catch (err) {
      console.error("Error fetching index data:", err);
      setError("Failed to fetch index data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndexData();
  }, [indices]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchIndexData();
    }, 1000);

    return () => clearInterval(interval);
  }, [indices]);

  if (loading && indexData.length === 0) {
    return (
      <div className={`grid gap-6 ${className}`}>
        {Array.from({ length: indices.length || 2 }).map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border p-6 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3 w-12 h-12"></div>
                <div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl ${className}`}
      >
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      </div>
    );
  }

  if (!indexData || indexData.length === 0) {
    return null;
  }

  // Determine grid columns based on number of cards
  const getGridCols = (count) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-1 md:grid-cols-2";
    if (count === 3) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    if (count === 4) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  };

  return (
    <div className={`grid ${getGridCols(indexData.length)} gap-6 ${className}`}>
      {indexData.map((data, index) => (
        <IndexCard key={data.symbol || index} indexData={data} />
      ))}
    </div>
  );
};

export default IndexCards;
