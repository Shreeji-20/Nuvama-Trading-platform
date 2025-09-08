// src/config/api.js
// Centralized API configuration using Vite environment variables

const config = {
  // API Base URL from environment variables
  // API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  // API_BASE_URL: "https://r4np4x2t-8000.inc1.devtunnels.ms",
  API_BASE_URL: "http://100.98.41.25:8000",

  // App configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || "Nuvama Trading Platform",
  NODE_ENV: import.meta.env.VITE_NODE_ENV || "development",

  // API Endpoints
  ENDPOINTS: {
    // User management
    USERS: "/users",
    USER: "/user",
    USERLOGIN: "/userlogin",
    DELETEUSER: "/deleteuser",

    // Strategy management
    STRATEGIES: "/stratergy/stratergy_1",
    STRATEGIES_ADD: "/stratergy/stratergy_1/add",
    STRATEGIES_UPDATE: "/stratergy/stratergy_1/update",

    // Multi-leg spreads
    MULTILEG_SPREADS: "/multileg-spreads",

    // Advanced options
    ADVANCED_OPTIONS: "/advanced-options",

    // Data endpoints
    OPTIONDATA: "/optiondata",
    INDEX: "/index",
    LIVEDATA: "/livedata",
    LOTSIZES: "/lotsizes",
    SPREADS: "/spreads",
    ORDERS: "/orders",
  },

  // Helper function to build full URL
  buildUrl: (endpoint) => {
    console.log(`API Base URL: ${config.API_BASE_URL}${endpoint}`);
    return `${config.API_BASE_URL}${endpoint}`;
  },

  // Helper function for common fetch options
  getFetchOptions: (method = "GET", body = null) => {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    if (body) {
      options.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    return options;
  },
};

export default config;
