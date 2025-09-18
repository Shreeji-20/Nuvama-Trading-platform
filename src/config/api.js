// src/config/api.js
// Centralized API configuration using Vite environment variables

const config = {
  // API Base URL from environment variables
  // API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  // API_BASE_URL: "https://r4np4x2t-8000.inc1.devtunnels.ms",
  API_BASE_URL: "http://localhost:8000",

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

    // Observations endpoints (Instance ID based)
    OBSERVATIONS: {
      INSTANCES: "/observations/instances",
      EXECUTION_IDS: "/observations/instances/{instance_id}/execution-ids",
      OBSERVATION:
        "/observations/instances/{instance_id}/observation/{execution_id}",
      LATEST: "/observations/instances/{instance_id}/latest/{symbol}",
      LIVE_METRICS: "/observations/instances/{instance_id}/live-metrics",
      GLOBAL_OBSERVATION:
        "/observations/instances/{instance_id}/global-observation",
      GLOBAL_LEG_DETAILS:
        "/observations/instances/{instance_id}/global-leg-details",
      // Case decision observation endpoints
      CASE_DECISION_OBSERVATION:
        "/observations/instances/{instance_id}/case-decision-observation",
      CASE_DECISION_OBSERVATIONS:
        "/observations/instances/{instance_id}/case-decision-observations",
      CASE_DECISION_OBSERVATION_SPECIFIC:
        "/observations/instances/{instance_id}/case-decision-observation/{observation_id}",
    },
  },

  // Helper function to build full URL
  buildUrl: (endpoint) => {
    console.log(`API Base URL: ${config.API_BASE_URL}${endpoint}`);
    return `${config.API_BASE_URL}${endpoint}`;
  },

  // Helper function to build observation URLs with parameters
  buildObservationUrl: (endpointTemplate, params = {}) => {
    let endpoint = endpointTemplate;

    // Replace placeholders with actual values
    Object.keys(params).forEach((key) => {
      endpoint = endpoint.replace(`{${key}}`, params[key]);
    });

    console.log(`Observation API URL: ${config.API_BASE_URL}${endpoint}`);
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
