import React, { useState, useEffect, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import config from "../config/api";
import LegsConfigurationTable from "../components/LegsConfigurationTable";
import {
  StrategyCard,
  PositionRow,
  OrderRow,
  LiveIndicator,
  TabNavigation,
  EmptyState,
} from "../components/DeployedStrategies";
import { Trash2, Edit2, Save, X, ChevronDown, ChevronUp } from "lucide-react";

const DeployedStrategies = () => {
  // Symbol options for dropdown
  const symbolOptions = ["NIFTY", "BANKNIFTY", "FINNIFTY", "SENSEX"];

  // Order status constants for matching various API responses
  const ORDER_STATUS = {
    COMPLETE: ["COMPLETE", "COMPLETED", "EXECUTED", "FILLED"],
    REJECTED: ["REJECTED", "REJECT"],
    CANCELLED: ["CANCELLED", "CANCELED", "CANCELLED_BY_USER", "CANCEL"],
    PENDING: ["PENDING", "OPEN", "NEW", "ACCEPTED", "TRIGGER_PENDING"],
  };

  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedStrategy, setExpandedStrategy] = useState(null);
  const [editingStrategy, setEditingStrategy] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [availableTags, setAvailableTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [activeTab, setActiveTab] = useState({}); // Tab state for each strategy (keyed by strategyId)
  const [premiumStrikeModalLeg, setPremiumStrikeModalLeg] = useState(null); // Track which leg's modal is open
  const [currentEditingStrategyId, setCurrentEditingStrategyId] =
    useState(null); // Track which strategy is being edited
  const [strategyOrders, setStrategyOrders] = useState({}); // Orders for each strategy (keyed by strategyId)
  const [loadingOrders, setLoadingOrders] = useState({}); // Loading state for orders (keyed by strategyId)

  // Use state for P&L data - React will handle updates efficiently with memo
  const [positionPnL, setPositionPnL] = useState({}); // P&L data for positions (keyed by orderId)
  const [loadingPnL, setLoadingPnL] = useState({}); // Loading state for P&L calculation (keyed by orderId)

  // Option data cache - fetched once and used for all positions
  const [optionDataCache, setOptionDataCache] = useState([]);
  const [lastOptionDataFetch, setLastOptionDataFetch] = useState(null);

  // Ref to store interval IDs for auto-refresh (keyed by strategyId)
  const refreshIntervalsRef = useRef({});
  const optionDataIntervalRef = useRef(null);

  const API_BASE_URL = "http://localhost:8000";

  // Options for dynamic hedge settings
  const hedgeTypeOptions = ["premium Based", "fixed Distance"];

  // Helper functions to check order status
  const isOrderComplete = (status) => {
    return ORDER_STATUS.COMPLETE.includes(status?.toUpperCase());
  };

  const isOrderRejected = (status) => {
    return ORDER_STATUS.REJECTED.includes(status?.toUpperCase());
  };

  const isOrderCancelled = (status) => {
    return ORDER_STATUS.CANCELLED.includes(status?.toUpperCase());
  };

  const isOrderPending = (status) => {
    return ORDER_STATUS.PENDING.includes(status?.toUpperCase());
  };

  const isOrderCompletedOrFinished = (status) => {
    return (
      isOrderComplete(status) ||
      isOrderRejected(status) ||
      isOrderCancelled(status)
    );
  };

  // Tab configuration
  const tabs = [
    { id: "parameters", label: "Configuration" },
    { id: "positions", label: "Open Positions" },
    { id: "orders", label: "Open Orders" },
    { id: "completed", label: "Completed Orders" },
  ];

  // Get active tab for a strategy (default to "parameters")
  const getActiveTab = (strategyId) => {
    return activeTab[strategyId] || "parameters";
  };

  // Set active tab for a strategy
  const setStrategyTab = (strategyId, tabId) => {
    setActiveTab((prev) => ({ ...prev, [strategyId]: tabId }));

    // Start auto-refresh only for order-related tabs
    if (tabId === "positions" || tabId === "orders" || tabId === "completed") {
      // Fetch orders immediately when switching to order tabs
      fetchStrategyOrders(strategyId);
      // Start auto-refresh
      startAutoRefresh(strategyId);
    } else {
      // Stop auto-refresh when switching to non-order tabs (like "parameters")
      stopAutoRefresh(strategyId);
    }
  };

  // Fetch all deployed strategies
  const fetchStrategies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/strategy/list`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStrategies(data.strategies || []);
    } catch (err) {
      console.error("Error fetching strategies:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available strategy tags
  const fetchStrategyTags = async () => {
    try {
      setLoadingTags(true);
      const response = await fetch(`${API_BASE_URL}/strategy-tags/list`);
      if (response.ok) {
        const tags = await response.json();
        setAvailableTags(tags);
      } else {
        console.error("Failed to fetch strategy tags");
      }
    } catch (error) {
      console.error("Error fetching strategy tags:", error);
    } finally {
      setLoadingTags(false);
    }
  };

  // Update strategy
  const updateStrategy = async (strategyId, updatedConfig) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/strategy/update/${strategyId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedConfig),
        }
      );

      if (!response.ok) {
        // Get detailed error message from response
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Unknown error" }));
        console.error("Update error response:", errorData);

        // Handle validation errors specifically
        if (response.status === 422 && errorData.detail?.errors) {
          const errorMessages = errorData.detail.errors
            .map((err) => `${err.loc.join(".")}: ${err.msg}`)
            .join("\n");
          throw new Error(`Validation errors:\n${errorMessages}`);
        }

        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }
      const result = await response.json();
      // Refresh strategies list
      fetchStrategies();
      setEditingStrategy(null);
      setEditValues({});

      alert("Strategy updated successfully!");
    } catch (err) {
      console.error("Error updating strategy:", err);
      alert(`Failed to update strategy: ${err.message}`);
    }
  };

  // Delete strategy
  const deleteStrategy = async (strategyId) => {
    if (!confirm(`Are you sure you want to delete strategy ${strategyId}?`)) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/strategy/delete/${strategyId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      alert("Strategy deleted successfully!");
      fetchStrategies();
    } catch (err) {
      console.error("Error deleting strategy:", err);
      alert(`Failed to delete strategy: ${err.message}`);
    }
  };

  // Copy strategy
  const copyStrategy = async (strategy) => {
    const originalId = strategy.strategyId;

    // Generate new unique strategy ID with timestamp
    const timestamp = Date.now();
    const newStrategyId = `${originalId}_copy_${timestamp}`;

    // Create a deep copy of the strategy config
    const newConfig = JSON.parse(JSON.stringify(strategy.config));

    // Update the strategy ID in the config
    if (newConfig.baseConfig) {
      newConfig.baseConfig.strategyId = newStrategyId;
    }

    if (
      !confirm(
        `Create a copy of strategy "${originalId}"?\n\nNew Strategy ID: ${newStrategyId}`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/stratergy/stratergy_1/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            strategyId: newStrategyId,
            symbols: strategy.symbols || [],
            config: newConfig,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      alert(
        `Strategy copied successfully!\n\nNew Strategy ID: ${newStrategyId}`
      );
      fetchStrategies();
    } catch (err) {
      console.error("Error copying strategy:", err);
      alert(`Failed to copy strategy: ${err.message}`);
    }
  };

  // Start editing strategy
  const startEditing = (strategy) => {
    setEditingStrategy(strategy.strategyId);
    setEditValues(strategy.config);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingStrategy(null);
    setEditValues({});
  };

  // Save edited strategy
  const saveEdit = (strategyId) => {
    // Ensure all legs have required fields with defaults
    const sanitizedConfig = {
      ...editValues,
      legs:
        editValues.legs?.map((leg) => ({
          ...leg,
          strategyId: editValues.baseConfig?.strategyId || strategyId,
          strategyName: editValues.baseConfig?.strategyName || "",
          // Apply defaults for all fields
          action: leg.action || "BUY",
          orderType: leg.orderType || "LIMIT",
          target: leg.target || "NONE",
          targetValue: leg.targetValue !== undefined ? leg.targetValue : 0,
          stoploss: leg.stoploss || "NONE",
          stoplossValue:
            leg.stoplossValue !== undefined ? leg.stoplossValue : 0,
          priceType: leg.priceType || "BIDASK",
          depthIndex: leg.depthIndex || 1,
          startTime: leg.startTime || "",
          waitAndTrade: leg.waitAndTrade !== undefined ? leg.waitAndTrade : 0,
          waitAndTradeLogic: leg.waitAndTradeLogic || "NONE",
          dynamicHedge:
            leg.dynamicHedge !== undefined ? leg.dynamicHedge : false,
          onTargetAction: leg.onTargetAction || "NONE",
          onStoplossAction: leg.onStoplossAction || "NONE",
          premiumBasedStrike:
            leg.premiumBasedStrike !== undefined
              ? leg.premiumBasedStrike
              : false,
        })) || [],
      // Ensure executionParams has defaults
      executionParams: editValues.executionParams
        ? {
            ...editValues.executionParams,
            entryOrderType:
              editValues.executionParams.entryOrderType || "LIMIT",
          }
        : undefined,
      // Ensure exitSettings has defaults
      exitSettings: editValues.exitSettings
        ? {
            ...editValues.exitSettings,
            exitOrderType: editValues.exitSettings.exitOrderType || "LIMIT",
          }
        : undefined,
      // Ensure dynamicHedgeSettings has strikeDistance if hedgeType is fixed Distance
      dynamicHedgeSettings: editValues.dynamicHedgeSettings
        ? {
            ...editValues.dynamicHedgeSettings,
            strikeDistance:
              editValues.dynamicHedgeSettings.hedgeType === "fixed Distance"
                ? editValues.dynamicHedgeSettings.strikeDistance || 1
                : editValues.dynamicHedgeSettings.strikeDistance || 1,
          }
        : undefined,
    };

    updateStrategy(strategyId, sanitizedConfig);
  };

  // Handle edit value change
  const handleEditChange = (path, value) => {
    setEditValues((prev) => {
      const newValues = { ...prev };
      const keys = path.split(".");
      let current = newValues;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;

      // Update all legs when strategyId or strategyName changes
      if (
        path === "baseConfig.strategyId" ||
        path === "baseConfig.strategyName"
      ) {
        const field = keys[keys.length - 1];
        if (newValues.legs) {
          newValues.legs = newValues.legs.map((leg) => ({
            ...leg,
            [field]: value,
          }));
        }
      }

      return newValues;
    });
  };

  // Handle leg field change
  const handleLegChange = (legIndex, field, value) => {
    setEditValues((prev) => {
      const newValues = { ...prev };
      if (!newValues.legs) {
        newValues.legs = [...prev.legs];
      }
      newValues.legs[legIndex] = {
        ...newValues.legs[legIndex],
        [field]: value,
      };
      return newValues;
    });
  };

  // Add new leg function
  const handleAddLeg = (strategyId) => {
    setEditValues((prev) => {
      const newValues = { ...prev };
      if (!newValues.legs) {
        newValues.legs = [...prev.legs];
      }

      const legCounter = newValues.legs.length + 1;
      const newLeg = {
        id: Date.now(),
        legId: `LEG_${legCounter.toString().padStart(3, "0")}`,
        strategyId: newValues.baseConfig?.strategyId || strategyId,
        strategyName: newValues.baseConfig?.strategyName || "",
        symbol: "NIFTY",
        expiry: 0,
        action: "BUY",
        optionType: "CE",
        lots: 1,
        strike: "ATM",
        target: "NONE",
        targetValue: 0,
        stoploss: "NONE",
        stoplossValue: 0,
        priceType: "BIDASK",
        depthIndex: 1,
        orderType: "LIMIT",
        startTime: "",
        waitAndTrade: 0,
        waitAndTradeLogic: "NONE",
        dynamicHedge: false,
        onTargetAction: "NONE",
        onStoplossAction: "NONE",
        premiumBasedStrike: false,
      };

      newValues.legs.push(newLeg);
      return newValues;
    });
  };

  // Delete leg function
  const handleDeleteLeg = (legIndex) => {
    setEditValues((prev) => {
      const newValues = { ...prev };
      if (!newValues.legs) {
        newValues.legs = [...prev.legs];
      }
      newValues.legs.splice(legIndex, 1);
      return newValues;
    });
  };

  // Update premium based strike config for a specific leg
  const handlePremiumStrikeConfigChange = (legIndex, field, value) => {
    setEditValues((prev) => {
      const newValues = { ...prev };
      if (!newValues.legs) {
        newValues.legs = [...prev.legs];
      }
      if (!newValues.legs[legIndex].premiumBasedStrikeConfig) {
        newValues.legs[legIndex].premiumBasedStrikeConfig = {
          strikeType: "NearestPremium",
          maxDepth: 5,
          searchSide: "BOTH",
          value: 0,
          condition: "Greaterthanequal",
          between: 0,
          and: 0,
        };
      }
      newValues.legs[legIndex] = {
        ...newValues.legs[legIndex],
        premiumBasedStrikeConfig: {
          ...newValues.legs[legIndex].premiumBasedStrikeConfig,
          [field]: value,
        },
      };
      return newValues;
    });
  };

  // Get value from edit state or original strategy
  const getEditValue = (strategy, path) => {
    if (editingStrategy !== strategy.strategyId) {
      // Not editing, return original value
      const keys = path.split(".");
      let value = strategy.config;
      for (const key of keys) {
        value = value?.[key];
      }
      return value;
    }
    // Editing, return from editValues
    const keys = path.split(".");
    let value = editValues;
    for (const key of keys) {
      value = value?.[key];
    }
    return value;
  };

  // Toggle strategy expansion
  const toggleExpand = (strategyId) => {
    const isExpanding = expandedStrategy !== strategyId;

    setExpandedStrategy(isExpanding ? strategyId : null);

    if (isExpanding) {
      // Fetch orders immediately when expanding
      fetchStrategyOrders(strategyId);
      // Check if current tab is one of the order tabs before starting auto-refresh
      const currentTab = getActiveTab(strategyId);
      if (
        currentTab === "positions" ||
        currentTab === "orders" ||
        currentTab === "completed"
      ) {
        startAutoRefresh(strategyId);
      }
    } else {
      // Stop auto-refresh when collapsing
      stopAutoRefresh(strategyId);
    }
  }; // Fetch orders for a specific strategy (memoized for performance)

  const fetchStrategyOrders = useCallback(async (strategyId) => {
    try {
      setLoadingOrders((prev) => ({ ...prev, [strategyId]: true }));

      // Use the live-details endpoint to get enriched order data
      const response = await fetch(
        `${API_BASE_URL}/strategy-orders/get/${strategyId}/live-details`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched orders for strategy", strategyId, data);
      // Store orders for this strategy
      setStrategyOrders((prev) => ({
        ...prev,
        [strategyId]: data.orders || null,
      }));

      // Calculate P&L for positions
      if (data.orders) {
        calculatePnLForPositions(data.orders);
      }
    } catch (err) {
      // Set null for this strategy to indicate fetch was attempted but failed
      setStrategyOrders((prev) => ({
        ...prev,
        [strategyId]: null,
      }));
    } finally {
      setLoadingOrders((prev) => ({ ...prev, [strategyId]: false }));
    }
  }, []);

  // Start auto-refresh for a strategy
  const startAutoRefresh = useCallback(
    (strategyId) => {
      // Clear any existing interval for this strategy
      if (refreshIntervalsRef.current[strategyId]) {
        clearInterval(refreshIntervalsRef.current[strategyId]);
      }

      // Set up new interval to refresh every 1 second
      const intervalId = setInterval(() => {
        fetchStrategyOrders(strategyId);
      }, 1000);

      refreshIntervalsRef.current[strategyId] = intervalId;
    },
    [fetchStrategyOrders]
  );

  // Stop auto-refresh for a strategy
  const stopAutoRefresh = useCallback((strategyId) => {
    if (refreshIntervalsRef.current[strategyId]) {
      clearInterval(refreshIntervalsRef.current[strategyId]);
      delete refreshIntervalsRef.current[strategyId];
    }
  }, []);

  // Fetch all option data once
  const fetchOptionData = useCallback(async () => {
    try {
      const response = await fetch(
        config.buildUrl(config.ENDPOINTS.OPTIONDATA)
      );

      if (!response.ok) {
        console.warn("Failed to fetch option data");
        return;
      }

      const data = await response.json();
      setOptionDataCache(data || []);
      setLastOptionDataFetch(new Date());
    } catch (err) {
      console.error("Error fetching option data:", err);
    }
  }, []);

  // Get market depth from cached option data
  const getMarketDepthFromCache = useCallback(
    (symbol, strike, optionType, expiry) => {
      try {
        // Find matching option from cache
        const option = optionDataCache.find((item) => {
          const d = item?.response?.data;
          if (!d) return false;

          return (
            d.symbolname?.includes(symbol) &&
            Number(d.strikeprice) === Number(strike) &&
            d.optiontype === optionType &&
            String(d.expiry) === String(expiry)
          );
        });

        if (!option?.response?.data) {
          return null;
        }

        const data = option.response.data;

        // Return depth data in the same format as the old API
        return {
          bid: data.bidValues?.[0]?.price || 0,
          ask: data.askValues?.[0]?.price || 0,
          ltp: data.ltp || 0,
        };
      } catch (err) {
        console.error("Error getting market depth from cache:", err);
        return null;
      }
    },
    [optionDataCache]
  );

  // Fetch market depth for live price (deprecated - keeping for backward compatibility)
  const fetchMarketDepth = async (symbol, strike, optionType, expiry) => {
    // Use cached data instead of making individual API calls
    return getMarketDepthFromCache(symbol, strike, optionType, expiry);
  };

  // Fetch exit order for closed position
  const fetchExitOrder = async (orderDetailsKey) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/strategy-orders/exit-order/${encodeURIComponent(
          orderDetailsKey
        )}`
      );

      if (!response.ok) {
        console.warn(`⚠️ Exit order not found for ${orderDetailsKey}`);
        return null;
      }

      const data = await response.json();

      return data.data;
    } catch (err) {
      return null;
    }
  };

  // Calculate P&L for all positions
  const calculatePnLForPositions = async (orders) => {
    const positionsWithEntry = orders.filter((order) => order.entered === true);

    for (const order of positionsWithEntry) {
      await calculateSinglePositionPnL(order);
    }
  };

  // Handle Square Off for a position
  const handleSquareOff = async (order) => {
    const orderId = order?.response?.data?.orderId || order.exchangeOrderNumber;
    const userId = order?.userId;

    if (!orderId || !userId) {
      alert("Cannot square off: Missing order ID or user ID");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to square off this position?\n\nOrder ID: ${orderId}\nUser: ${userId}`
      )
    ) {
      return;
    }

    try {
      // TODO: Implement the square off API call here
      // Example:
      // const response = await fetch(`${API_BASE_URL}/square-off/${orderId}/${userId}`, {
      //   method: "POST",
      // });
      // if (!response.ok) throw new Error("Square off failed");

      alert(`Square off initiated for Order ID: ${orderId}`);
      // Refresh orders after square off
      // You can add the actual API endpoint when available
    } catch (error) {
      console.error("Error squaring off position:", error);
      alert(`Failed to square off position: ${error.message}`);
    }
  };

  // Calculate P&L for a single position
  const calculateSinglePositionPnL = async (order) => {
    const orderId =
      order?.response?.data?.oID ||
      order?.response?.data?.oid ||
      order?.orderId ||
      order?.liveDetails?.exchangeOrderNumber;

    if (!orderId) {
      console.warn(`No orderId found for order:`, order);
      return;
    }

    // Set loading state
    setLoadingPnL((prev) => ({ ...prev, [orderId]: true }));

    try {
      const isExited = order.exited === true;
      const executionMode = order.executionMode || "SIMULATIONMODE";

      // Get entry price - for LIVEMODE, fetch from live order key
      let entryPrice = 0;
      let quantity = 0;

      // Fallback to response data if not fetched from live order
      if (!entryPrice) {
        entryPrice = parseFloat(
          order?.response?.data?.fPrc ||
            order?.fPrc ||
            order?.liveDetails?.fillPrice ||
            0
        );
      }

      if (!quantity) {
        quantity = parseInt(
          order?.response?.data?.fQty ||
            order?.quantity ||
            order?.liveDetails?.fillQuantity ||
            0
        );
      }

      const action = order.action || order.liveDetails?.transactionType;

      if (!entryPrice || !quantity || !action) {
        console.warn(`⚠️ Incomplete data for order ${orderId}:`, {
          entryPrice,
          quantity,
          action,
          executionMode,
        });
        setLoadingPnL((prev) => ({ ...prev, [orderId]: false }));
        return;
      }

      let pnl = 0;
      let exitPrice = 0;
      let currentPrice = 0;

      if (isExited) {
        // CLOSED POSITION: Fetch exit order for realized P&L
        const orderDetailsKey = order.orderDetailsKey || orderId;

        const exitOrder = await fetchExitOrder(orderDetailsKey);

        // Get exit price from exit order
        if (exitOrder && exitOrder?.response?.data?.fPrc) {
          exitPrice = parseFloat(exitOrder.response.data.fPrc);
        } else {
          console.error(
            `❌ No exit price found for closed position ${orderId}`
          );
        }

        if (exitPrice > 0) {
          // Calculate realized P&L
          if (action === "BUY") {
            pnl = (exitPrice - entryPrice) * quantity;
          } else if (action === "SELL") {
            pnl = (entryPrice - exitPrice) * quantity;
          }

          // Update state with P&L data
          setPositionPnL((prev) => ({
            ...prev,
            [orderId]: {
              pnl: pnl.toFixed(2),
              entryPrice: entryPrice.toFixed(2),
              exitPrice: exitPrice.toFixed(2),
              currentPrice: null,
              quantity,
              action,
              isExited: true,
            },
          }));
        }
      } else {
        // OPEN POSITION: Calculate unrealized P&L using latest market price

        // Fetch live market depth for current price
        const depthData = await fetchMarketDepth(
          order.symbol,
          order.strike,
          order.optionType,
          order.expiry
        );

        if (depthData) {
          // Get current price based on action from cached data
          if (action === "BUY") {
            // For BUY positions, use bid price (price at which we can sell)
            currentPrice = parseFloat(depthData.bid || 0);
          } else if (action === "SELL") {
            // For SELL positions, use ask price (price at which we need to buy back)
            currentPrice = parseFloat(depthData.ask || 0);
          }

          // Calculate unrealized P&L
          if (currentPrice > 0) {
            if (action === "BUY") {
              pnl = (currentPrice - entryPrice) * quantity;
            } else if (action === "SELL") {
              pnl = (entryPrice - currentPrice) * quantity;
            }

            // Update state with P&L data
            setPositionPnL((prev) => ({
              ...prev,
              [orderId]: {
                pnl: pnl.toFixed(2),
                entryPrice: entryPrice.toFixed(2),
                exitPrice: null,
                currentPrice: currentPrice.toFixed(2),
                quantity,
                action,
                isExited: false,
              },
            }));
          } else {
            console.warn(
              `⚠️ No valid current price found for open position ${orderId}`
            );
          }
        } else {
          console.warn(
            `⚠️ No market depth data found for open position ${orderId}`
          );
        }
      }
    } catch (err) {
      console.error(`❌ Error calculating P&L for order ${orderId}:`, err);
    } finally {
      // Clear loading state
      setLoadingPnL((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Calculate summary for a strategy
  const getStrategySummary = useCallback(
    (strategyId) => {
      const orders = strategyOrders[strategyId] || [];

      const openPositions = orders.filter(
        (order) =>
          order.exited !== true &&
          (isOrderComplete(order.status || order.orderStatus) || order.fQty > 0)
      ).length;

      const openOrders = orders.filter(
        (order) =>
          !isOrderCompletedOrFinished(order.status || order.orderStatus)
      ).length;

      const completedOrders = orders.filter((order) =>
        isOrderCompletedOrFinished(order.status || order.orderStatus)
      ).length;

      // Calculate total P&L from all positions
      let totalPnL = 0;
      orders.forEach((order) => {
        // Use the same orderId logic as in calculateSinglePositionPnL
        const orderId =
          order?.response?.data?.oID ||
          order?.response?.data?.oid ||
          order?.orderId ||
          order?.exchangeOrderNumber;
        if (orderId && positionPnL[orderId]) {
          const pnl = parseFloat(positionPnL[orderId].pnl);
          if (!isNaN(pnl)) {
            totalPnL += pnl;
          }
        }
      });

      return { openPositions, openOrders, completedOrders, totalPnL };
    },
    [strategyOrders, positionPnL]
  );

  // Export strategy data to Excel
  const exportToExcel = useCallback(
    (strategyId) => {
      const strategy = strategies.find((s) => s.strategyId === strategyId);
      const orders = strategyOrders[strategyId] || [];

      if (!strategy) {
        alert("Strategy not found");
        return;
      }

      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // ===== SHEET 1: Strategy Overview =====
      const overviewData = [
        ["STRATEGY OVERVIEW"],
        [],
        ["Strategy ID", strategy.strategyId],
        ["Symbols", strategy.symbols?.join(", ") || "N/A"],
        ["Deployed At", new Date(strategy.timestamp).toLocaleString()],
        ["Total Legs", strategy.config?.legs?.length || 0],
        [],
        ["BASE CONFIGURATION"],
        [],
        ["Lots", strategy.config?.baseConfig?.lots || "N/A"],
        ["Underlying", strategy.config?.baseConfig?.underlying || "N/A"],
        [
          "Buy Trades First",
          strategy.config?.baseConfig?.buyTradesFirst ? "Yes" : "No",
        ],
        [
          "Max Open Orders",
          strategy.config?.baseConfig?.maxOpenOrders || "N/A",
        ],
        [
          "Max Open Trades",
          strategy.config?.baseConfig?.maxOpenTrades || "N/A",
        ],
        [
          "Max Profit Per Day",
          strategy.config?.baseConfig?.maxProfitPerDay || "N/A",
        ],
        [
          "Max Loss Per Day",
          strategy.config?.baseConfig?.maxLossPerDay || "N/A",
        ],
        [
          "Max Profit Per Trade",
          strategy.config?.baseConfig?.maxProfitPerTrade || "N/A",
        ],
        [
          "Max Loss Per Trade",
          strategy.config?.baseConfig?.maxLossPerTrade || "N/A",
        ],
        ["Start Time", strategy.config?.baseConfig?.startTime || "N/A"],
        ["End Time", strategy.config?.baseConfig?.endTime || "N/A"],
        [
          "Square Off Time",
          strategy.config?.baseConfig?.squareOffTime || "N/A",
        ],
      ];

      const ws_overview = XLSX.utils.aoa_to_sheet(overviewData);

      // Style the overview sheet
      ws_overview["!cols"] = [{ wch: 25 }, { wch: 40 }];

      XLSX.utils.book_append_sheet(wb, ws_overview, "Strategy Overview");

      // ===== SHEET 2: Legs Configuration =====
      const legs = strategy.config?.legs || [];
      if (legs.length > 0) {
        const legsData = [
          ["LEG CONFIGURATION"],
          [],
          [
            "Leg ID",
            "Leg Name",
            "Lots",
            "Position",
            "Option Type",
            "Expiry",
            "Strike Type",
            "Strike Distance",
            "Premium Range",
          ],
        ];

        legs.forEach((leg) => {
          legsData.push([
            leg.legId || "N/A",
            leg.legName || "N/A",
            leg.lots || "N/A",
            leg.position || "N/A",
            leg.optionType || "N/A",
            leg.expiry || "N/A",
            leg.strikeType || "N/A",
            leg.strikeDistance || "N/A",
            leg.premiumBasedStrikeConfig?.premiumRange
              ? `${leg.premiumBasedStrikeConfig.premiumRange.min} - ${leg.premiumBasedStrikeConfig.premiumRange.max}`
              : "N/A",
          ]);
        });

        const ws_legs = XLSX.utils.aoa_to_sheet(legsData);
        ws_legs["!cols"] = Array(9).fill({ wch: 15 });
        XLSX.utils.book_append_sheet(wb, ws_legs, "Legs Configuration");
      }

      // ===== SHEET 3: All Orders =====
      if (orders.length > 0) {
        const allOrdersData = orders.map((order) => {
          // Use the same orderId logic as in calculateSinglePositionPnL
          const orderId =
            order?.response?.data?.oID ||
            order?.response?.data?.oid ||
            order?.orderId ||
            order?.exchangeOrderNumber;
          const pnlData = positionPnL[orderId];
          const status = order.status || order.orderStatus || "N/A";

          return {
            "User ID": order?.userId || "N/A",
            "Order ID": orderId || "N/A",
            "Leg ID": order.legId || "N/A",
            Symbol: order.symbol || "N/A",
            Strike: order.strike || "N/A",
            "Option Type": order.optionType || "N/A",
            Action: order.action || "N/A",
            Quantity: order?.response?.data?.fQty || order?.fQty || "N/A",
            "Entry Price": pnlData
              ? pnlData.entryPrice
              : order.fPrc || order.limitPrice || "N/A",
            "Current/Exit Price": pnlData
              ? order.exited
                ? pnlData.exitPrice
                : pnlData.currentPrice
              : "N/A",
            "P&L": pnlData ? pnlData.pnl : "N/A",
            "Execution Time": order?.executionTime
              ? new Date(order.executionTime).toLocaleString()
              : "N/A",
            "Position Status": order.exited ? "Closed" : "Open",
            "Order Status": status.toUpperCase(),
          };
        });

        const ws_all_orders = XLSX.utils.json_to_sheet(allOrdersData);
        ws_all_orders["!cols"] = Array(14).fill({ wch: 15 });
        XLSX.utils.book_append_sheet(wb, ws_all_orders, "All Orders");
      }

      // ===== SHEET 4: Open Positions =====
      const openPositions = orders.filter(
        (order) =>
          order.exited !== true &&
          (isOrderComplete(order.status || order.orderStatus) || order.fQty > 0)
      );
      if (openPositions.length > 0) {
        const openPosData = openPositions.map((order) => {
          // Use the same orderId logic as in calculateSinglePositionPnL
          const orderId =
            order?.response?.data?.oID ||
            order?.response?.data?.oid ||
            order?.orderId ||
            order?.exchangeOrderNumber;
          const pnlData = positionPnL[orderId];

          return {
            "User ID": order?.userId || "N/A",
            "Order ID": orderId || "N/A",
            "Leg ID": order.legId || "N/A",
            Symbol: order.symbol || "N/A",
            Strike: order.strike || "N/A",
            Action: order.action || "N/A",
            Quantity: order?.response?.data?.fQty || order?.fQty || "N/A",
            "Entry Price": pnlData
              ? pnlData.entryPrice
              : order.fPrc || order.limitPrice || "N/A",
            "Current Price": pnlData ? pnlData.currentPrice : "N/A",
            "P&L": pnlData ? pnlData.pnl : "N/A",
            "Execution Time": order?.executionTime
              ? new Date(order.executionTime).toLocaleString()
              : "N/A",
          };
        });

        const ws_open_pos = XLSX.utils.json_to_sheet(openPosData);
        ws_open_pos["!cols"] = Array(11).fill({ wch: 15 });
        XLSX.utils.book_append_sheet(wb, ws_open_pos, "Open Positions");
      }

      // ===== SHEET 5: Closed Positions =====
      const closedPositions = orders.filter((order) => order.exited === true);
      if (closedPositions.length > 0) {
        const closedPosData = closedPositions.map((order) => {
          // Use the same orderId logic as in calculateSinglePositionPnL
          const orderId =
            order?.response?.data?.oID ||
            order?.response?.data?.oid ||
            order?.orderId ||
            order?.exchangeOrderNumber;
          const pnlData = positionPnL[orderId];

          return {
            "User ID": order?.userId || "N/A",
            "Order ID": orderId || "N/A",
            "Leg ID": order.legId || "N/A",
            Symbol: order.symbol || "N/A",
            Strike: order.strike || "N/A",
            Action: order.action || "N/A",
            Quantity: order?.response?.data?.fQty || order?.fQty || "N/A",
            "Entry Price": pnlData
              ? pnlData.entryPrice
              : order.fPrc || order.limitPrice || "N/A",
            "Exit Price": pnlData ? pnlData.exitPrice : "N/A",
            "P&L": pnlData ? pnlData.pnl : "N/A",
            "Execution Time": order?.executionTime
              ? new Date(order.executionTime).toLocaleString()
              : "N/A",
          };
        });

        const ws_closed_pos = XLSX.utils.json_to_sheet(closedPosData);
        ws_closed_pos["!cols"] = Array(11).fill({ wch: 15 });
        XLSX.utils.book_append_sheet(wb, ws_closed_pos, "Closed Positions");
      }

      // ===== SHEET 6: P&L Summary =====
      let totalPnL = 0;
      let profitableOrders = 0;
      let losingOrders = 0;
      let totalProfit = 0;
      let totalLoss = 0;

      orders.forEach((order) => {
        // Use the same orderId logic as in calculateSinglePositionPnL
        const orderId =
          order?.response?.data?.oID ||
          order?.response?.data?.oid ||
          order?.orderId ||
          order?.exchangeOrderNumber;
        if (orderId && positionPnL[orderId]) {
          const pnl = parseFloat(positionPnL[orderId].pnl);
          if (!isNaN(pnl)) {
            totalPnL += pnl;
            if (pnl > 0) {
              profitableOrders++;
              totalProfit += pnl;
            } else if (pnl < 0) {
              losingOrders++;
              totalLoss += Math.abs(pnl);
            }
          }
        }
      });

      const pnlSummaryData = [
        ["P&L SUMMARY"],
        [],
        ["Metric", "Value"],
        ["Total Orders", orders.length],
        ["Open Positions", openPositions.length],
        ["Closed Positions", closedPositions.length],
        [],
        ["Total P&L", `₹${totalPnL.toFixed(2)}`],
        ["Total Profit", `₹${totalProfit.toFixed(2)}`],
        ["Total Loss", `₹${totalLoss.toFixed(2)}`],
        ["Profitable Orders", profitableOrders],
        ["Losing Orders", losingOrders],
        [
          "Win Rate",
          `${
            orders.length > 0
              ? ((profitableOrders / orders.length) * 100).toFixed(2)
              : 0
          }%`,
        ],
      ];

      const ws_pnl_summary = XLSX.utils.aoa_to_sheet(pnlSummaryData);
      ws_pnl_summary["!cols"] = [{ wch: 25 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, ws_pnl_summary, "P&L Summary");

      // ===== SHEET 7: Order Status Breakdown =====
      const statusBreakdown = {};
      orders.forEach((order) => {
        const status = (
          order.status ||
          order.orderStatus ||
          "UNKNOWN"
        ).toUpperCase();
        statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
      });

      const statusData = [
        ["ORDER STATUS BREAKDOWN"],
        [],
        ["Status", "Count"],
        ...Object.entries(statusBreakdown).map(([status, count]) => [
          status,
          count,
        ]),
      ];

      const ws_status = XLSX.utils.aoa_to_sheet(statusData);
      ws_status["!cols"] = [{ wch: 20 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws_status, "Status Breakdown");

      // Generate Excel file
      XLSX.writeFile(
        wb,
        `${strategyId}_Complete_Report_${
          new Date().toISOString().split("T")[0]
        }.xlsx`
      );
    },
    [strategies, strategyOrders, positionPnL, isOrderComplete]
  );

  useEffect(() => {
    fetchStrategies();
    fetchStrategyTags();

    // Fetch option data immediately
    fetchOptionData();

    // Auto-refresh strategies list every 30 seconds
    const strategiesInterval = setInterval(fetchStrategies, 30000);

    // Auto-refresh option data every 1 second for live prices
    optionDataIntervalRef.current = setInterval(fetchOptionData, 1000);

    // Cleanup: Stop all auto-refresh intervals when component unmounts
    return () => {
      clearInterval(strategiesInterval);

      // Clear option data interval
      if (optionDataIntervalRef.current) {
        clearInterval(optionDataIntervalRef.current);
      }

      // Clear all strategy order refresh intervals
      Object.keys(refreshIntervalsRef.current).forEach((strategyId) => {
        clearInterval(refreshIntervalsRef.current[strategyId]);
      });
      refreshIntervalsRef.current = {};
    };
  }, [fetchOptionData]);

  // Cleanup interval when expandedStrategy changes
  useEffect(() => {
    return () => {
      // When expandedStrategy changes, cleanup happens automatically via toggleExpand
      // This effect ensures cleanup if component re-renders unexpectedly
    };
  }, [expandedStrategy]);

  // Recalculate P&L when option data updates
  useEffect(() => {
    if (optionDataCache.length === 0) return;

    // Recalculate P&L for all open positions across all strategies
    Object.keys(strategyOrders).forEach((strategyId) => {
      const orders = strategyOrders[strategyId];
      if (orders && Array.isArray(orders)) {
        const openPositions = orders.filter(
          (order) => order.entered === true && order.exited !== true
        );

        // Recalculate P&L for open positions
        openPositions.forEach((order) => {
          calculateSinglePositionPnL(order);
        });
      }
    });
  }, [optionDataCache]);

  if (loading && strategies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading strategies...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 md:p-4">
      <div className="max-w-[100rem] mx-auto space-y-4">
        {/* Header */}
        <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-lg border border-light-border dark:border-dark-border p-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm md:text-md font-bold text-gray-900 dark:text-white">
                Deployed Strategies
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                View and manage all deployed strategy configurations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchStrategies}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors"
              >
                🔄 Refresh
              </button>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Total Strategies
                </div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {strategies.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              Error: {error}
            </p>
          </div>
        )}

        {/* Strategies List */}
        {strategies.length === 0 ? (
          <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-lg border border-light-border dark:border-dark-border p-8 text-center">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No strategies deployed yet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Deploy a strategy from the Advanced Options Builder to see it here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {strategies.map((strategy) => (
              <div
                key={strategy.strategyId}
                className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-lg border border-light-border dark:border-dark-border overflow-hidden"
              >
                {/* Strategy Header */}
                <StrategyCard
                  strategy={strategy}
                  isExpanded={expandedStrategy === strategy.strategyId}
                  isEditing={editingStrategy === strategy.strategyId}
                  onToggleExpand={toggleExpand}
                  onStartEdit={startEditing}
                  onDelete={deleteStrategy}
                  onSave={saveEdit}
                  onCancelEdit={cancelEditing}
                  ordersSummary={getStrategySummary(strategy.strategyId)}
                  onExportToExcel={exportToExcel}
                  onCopyStrategy={copyStrategy}
                />

                {/* Expanded Details */}
                {expandedStrategy === strategy.strategyId && (
                  <div className="p-3 space-y-3">
                    {/* Base Configuration */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Base Configuration
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 ">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 p-1">
                            Strategy ID
                          </div>
                          <div className="text-xs font-semibold text-gray-900 dark:text-white p-1">
                            {getEditValue(strategy, "baseConfig.strategyId") ||
                              "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 p-1">
                            Lots
                          </div>
                          {editingStrategy === strategy.strategyId ? (
                            <input
                              type="number"
                              value={
                                getEditValue(strategy, "baseConfig.lots") || ""
                              }
                              onChange={(e) =>
                                handleEditChange(
                                  "baseConfig.lots",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                          ) : (
                            <div className="text-xs font-semibold text-gray-900 dark:text-white p-1">
                              {getEditValue(strategy, "baseConfig.lots") ||
                                "N/A"}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 p-1">
                            Underlying
                          </div>
                          {editingStrategy === strategy.strategyId ? (
                            <select
                              value={
                                getEditValue(
                                  strategy,
                                  "baseConfig.underlying"
                                ) || "Spot"
                              }
                              onChange={(e) =>
                                handleEditChange(
                                  "baseConfig.underlying",
                                  e.target.value
                                )
                              }
                              className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                              <option value="Spot">Spot</option>
                              <option value="Futures">Futures</option>
                            </select>
                          ) : (
                            <div className="text-xs p-1 font-semibold text-gray-900 dark:text-white">
                              {getEditValue(
                                strategy,
                                "baseConfig.underlying"
                              ) || "N/A"}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 p-1">
                            Buy Trades First
                          </div>
                          {editingStrategy === strategy.strategyId ? (
                            <select
                              value={
                                getEditValue(
                                  strategy,
                                  "baseConfig.buyTradesFirst"
                                )
                                  ? "true"
                                  : "false"
                              }
                              onChange={(e) =>
                                handleEditChange(
                                  "baseConfig.buyTradesFirst",
                                  e.target.value === "true"
                                )
                              }
                              className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                              <option value="false">No</option>
                              <option value="true">Yes</option>
                            </select>
                          ) : (
                            <div className="text-xs p-1 font-semibold text-gray-900 dark:text-white">
                              {getEditValue(
                                strategy,
                                "baseConfig.buyTradesFirst"
                              )
                                ? "Yes"
                                : "No"}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs p-1 text-gray-500 dark:text-gray-400">
                            Execution Mode
                          </div>
                          {editingStrategy === strategy.strategyId ? (
                            <select
                              value={
                                getEditValue(
                                  strategy,
                                  "baseConfig.executionMode"
                                ) || "Live Mode"
                              }
                              onChange={(e) =>
                                handleEditChange(
                                  "baseConfig.executionMode",
                                  e.target.value
                                )
                              }
                              className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                              <option value="Live Mode">Live Mode</option>
                              <option value="Simulation Mode">
                                Simulation Mode
                              </option>
                            </select>
                          ) : (
                            <div className="text-xs font-semibold text-gray-900 dark:text-white">
                              <span
                                className={`p-1 rounded text-xs font-medium ${
                                  getEditValue(
                                    strategy,
                                    "baseConfig.executionMode"
                                  ) === "Live Mode"
                                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                    : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                }`}
                              >
                                {getEditValue(
                                  strategy,
                                  "baseConfig.executionMode"
                                ) || "Live Mode"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Legs Table */}
                    {strategy.config?.legs &&
                      strategy.config.legs.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Legs Configuration ({strategy.config.legs.length}{" "}
                            legs)
                          </h4>
                          <LegsConfigurationTable
                            legs={
                              editingStrategy === strategy.strategyId
                                ? editValues.legs
                                : strategy.config.legs
                            }
                            isEditing={editingStrategy === strategy.strategyId}
                            onLegChange={(index, field, value) =>
                              handleLegChange(index, field, value)
                            }
                            onDeleteLeg={(index) => handleDeleteLeg(index)}
                            onAddLeg={() => handleAddLeg(strategy.strategyId)}
                            onPremiumStrikeModalOpen={(index) => {
                              setPremiumStrikeModalLeg(index);
                              setCurrentEditingStrategyId(strategy.strategyId);
                            }}
                            symbolOptions={symbolOptions}
                            expiryOptions={[0, 1, 2, 3, 4, 5]}
                            targetOptions={[
                              "NONE",
                              "ABSOLUTE",
                              "PERCENTAGE",
                              "POINTS",
                            ]}
                            stoplossOptions={[
                              "NONE",
                              "ABSOLUTE",
                              "PERCENTAGE",
                              "POINTS",
                            ]}
                            priceTypeOptions={[
                              "LTP",
                              "BIDASK",
                              "DEPTH",
                              "BID",
                              "ASK",
                            ]}
                            actionOptions={["NONE", "REENTRY", "REEXECUTE"]}
                            orderTypeOptions={["LIMIT", "MARKET"]}
                            strategyId={strategy.strategyId}
                          />
                        </div>
                      )}

                    {/* Horizontal Tabs */}
                    <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-lg border border-light-border dark:border-dark-border p-3 mt-4">
                      <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                        <nav className="flex space-x-8 overflow-x-auto">
                          <TabNavigation
                            tabs={tabs}
                            activeTabId={getActiveTab(strategy.strategyId)}
                            onTabChange={(tabId) =>
                              setStrategyTab(strategy.strategyId, tabId)
                            }
                          />
                        </nav>
                      </div>

                      {/* Tab Content */}
                      <div className="mt-4">
                        {/* Configuration Tab */}
                        {getActiveTab(strategy.strategyId) === "parameters" && (
                          <div className="space-y-4">
                            {/* Execution Parameters */}
                            {strategy.config?.executionParams && (
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  Execution Parameters
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Product
                                    </div>
                                    {editingStrategy === strategy.strategyId ? (
                                      <select
                                        value={
                                          getEditValue(
                                            strategy,
                                            "executionParams.product"
                                          ) || "NRML"
                                        }
                                        onChange={(e) =>
                                          handleEditChange(
                                            "executionParams.product",
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      >
                                        <option value="NRML">NRML</option>
                                        <option value="MIS">MIS</option>
                                        <option value="CNC">CNC</option>
                                      </select>
                                    ) : (
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {getEditValue(
                                          strategy,
                                          "executionParams.product"
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Strategy Name
                                    </div>
                                    {editingStrategy === strategy.strategyId ? (
                                      <input
                                        type="text"
                                        value={
                                          getEditValue(
                                            strategy,
                                            "executionParams.strategyName"
                                          ) || ""
                                        }
                                        onChange={(e) =>
                                          handleEditChange(
                                            "executionParams.strategyName",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Enter strategy name"
                                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      />
                                    ) : (
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {getEditValue(
                                          strategy,
                                          "executionParams.strategyName"
                                        ) || "-"}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Strategy Tag
                                    </div>
                                    {editingStrategy === strategy.strategyId ? (
                                      <select
                                        value={
                                          getEditValue(
                                            strategy,
                                            "executionParams.strategyTag"
                                          ) || ""
                                        }
                                        onChange={(e) => {
                                          handleEditChange(
                                            "executionParams.strategyTag",
                                            e.target.value
                                          );
                                        }}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        disabled={loadingTags}
                                      >
                                        <option value="">
                                          {loadingTags
                                            ? "Loading..."
                                            : "Select Tag"}
                                        </option>
                                        {availableTags.map((tag) => (
                                          <option key={tag.id} value={tag.id}>
                                            {tag.tagName} (
                                            {
                                              Object.keys(
                                                tag.userMultipliers || {}
                                              ).length
                                            }{" "}
                                            users)
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {(() => {
                                          const tagId = getEditValue(
                                            strategy,
                                            "executionParams.strategyTag"
                                          );
                                          if (tagId) {
                                            const tag = availableTags.find(
                                              (t) => t.id === tagId
                                            );
                                            return tag?.tagName || tagId;
                                          }
                                          return "None";
                                        })()}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Legs Execution
                                    </div>
                                    {editingStrategy === strategy.strategyId ? (
                                      <select
                                        value={
                                          getEditValue(
                                            strategy,
                                            "executionParams.legsExecution"
                                          ) || "Parallel"
                                        }
                                        onChange={(e) =>
                                          handleEditChange(
                                            "executionParams.legsExecution",
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      >
                                        <option value="Parallel">
                                          Parallel
                                        </option>
                                        <option value="One by One">
                                          One by One
                                        </option>
                                        <option value="Sequential">
                                          Sequential
                                        </option>
                                      </select>
                                    ) : (
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {getEditValue(
                                          strategy,
                                          "executionParams.legsExecution"
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Entry Order Type
                                    </div>
                                    {editingStrategy === strategy.strategyId ? (
                                      <select
                                        value={
                                          getEditValue(
                                            strategy,
                                            "executionParams.entryOrderType"
                                          ) || "LIMIT"
                                        }
                                        onChange={(e) =>
                                          handleEditChange(
                                            "executionParams.entryOrderType",
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      >
                                        <option value="LIMIT">LIMIT</option>
                                        <option value="MARKET">MARKET</option>
                                        <option value="SL">SL</option>
                                        <option value="SL-M">SL-M</option>
                                      </select>
                                    ) : (
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {getEditValue(
                                          strategy,
                                          "executionParams.entryOrderType"
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Start Time
                                    </div>
                                    {editingStrategy === strategy.strategyId ? (
                                      <input
                                        type="text"
                                        value={
                                          getEditValue(
                                            strategy,
                                            "executionParams.startTime"
                                          ) || ""
                                        }
                                        onChange={(e) =>
                                          handleEditChange(
                                            "executionParams.startTime",
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        placeholder="HH:MM"
                                      />
                                    ) : (
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {getEditValue(
                                          strategy,
                                          "executionParams.startTime"
                                        ) || "N/A"}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Target & Stoploss */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {strategy.config?.targetSettings && (
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                  <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    Target Settings
                                  </h4>
                                  <div className="space-y-2">
                                    <div>
                                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                                        Type:
                                      </span>
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <select
                                          value={
                                            getEditValue(
                                              strategy,
                                              "targetSettings.targetType"
                                            ) || "CombinedProfit"
                                          }
                                          onChange={(e) =>
                                            handleEditChange(
                                              "targetSettings.targetType",
                                              e.target.value
                                            )
                                          }
                                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                          <option value="CombinedProfit">
                                            CombinedProfit
                                          </option>
                                          <option value="IndividualLegProfit">
                                            IndividualLegProfit
                                          </option>
                                          <option value="PercentageProfit">
                                            PercentageProfit
                                          </option>
                                          <option value="PremiumTarget">
                                            PremiumTarget
                                          </option>
                                          <option value="UnderlyingMovement">
                                            UnderlyingMovement
                                          </option>
                                        </select>
                                      ) : (
                                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                          {getEditValue(
                                            strategy,
                                            "targetSettings.targetType"
                                          )}
                                        </span>
                                      )}
                                    </div>
                                    <div>
                                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                                        Value:
                                      </span>
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <input
                                          type="number"
                                          value={
                                            getEditValue(
                                              strategy,
                                              "targetSettings.targetValue"
                                            ) || ""
                                          }
                                          onChange={(e) =>
                                            handleEditChange(
                                              "targetSettings.targetValue",
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                      ) : (
                                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                          {getEditValue(
                                            strategy,
                                            "targetSettings.targetValue"
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {strategy.config?.stoplossSettings && (
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                  <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    Stoploss Settings
                                  </h4>
                                  <div className="space-y-2">
                                    <div>
                                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                                        Type:
                                      </span>
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <select
                                          value={
                                            getEditValue(
                                              strategy,
                                              "stoplossSettings.stoplossType"
                                            ) || "CombinedLoss"
                                          }
                                          onChange={(e) =>
                                            handleEditChange(
                                              "stoplossSettings.stoplossType",
                                              e.target.value
                                            )
                                          }
                                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                          <option value="CombinedLoss">
                                            CombinedLoss
                                          </option>
                                          <option value="CombinedProfit">
                                            CombinedProfit
                                          </option>
                                          <option value="IndividualLegLoss">
                                            IndividualLegLoss
                                          </option>
                                          <option value="PercentageLoss">
                                            PercentageLoss
                                          </option>
                                          <option value="PremiumLoss">
                                            PremiumLoss
                                          </option>
                                          <option value="UnderlyingMovement">
                                            UnderlyingMovement
                                          </option>
                                        </select>
                                      ) : (
                                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                          {getEditValue(
                                            strategy,
                                            "stoplossSettings.stoplossType"
                                          )}
                                        </span>
                                      )}
                                    </div>
                                    <div>
                                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                                        Value:
                                      </span>
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <input
                                          type="number"
                                          value={
                                            getEditValue(
                                              strategy,
                                              "stoplossSettings.stoplossValue"
                                            ) || ""
                                          }
                                          onChange={(e) =>
                                            handleEditChange(
                                              "stoplossSettings.stoplossValue",
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                      ) : (
                                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                          {getEditValue(
                                            strategy,
                                            "stoplossSettings.stoplossValue"
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Exit Settings */}
                            {strategy.config?.exitSettings && (
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                  Exit Settings
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Order Type
                                    </div>
                                    {editingStrategy === strategy.strategyId ? (
                                      <select
                                        value={
                                          getEditValue(
                                            strategy,
                                            "exitSettings.exitOrderType"
                                          ) || "LIMIT"
                                        }
                                        onChange={(e) =>
                                          handleEditChange(
                                            "exitSettings.exitOrderType",
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      >
                                        <option value="LIMIT">LIMIT</option>
                                        <option value="MARKET">MARKET</option>
                                        <option value="SL">SL</option>
                                        <option value="SL-M">SL-M</option>
                                        <option value="SL-L">SL-L</option>
                                      </select>
                                    ) : (
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {getEditValue(
                                          strategy,
                                          "exitSettings.exitOrderType"
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Exit Sell First
                                    </div>
                                    {editingStrategy === strategy.strategyId ? (
                                      <select
                                        value={
                                          getEditValue(
                                            strategy,
                                            "exitSettings.exitSellFirst"
                                          )
                                            ? "true"
                                            : "false"
                                        }
                                        onChange={(e) =>
                                          handleEditChange(
                                            "exitSettings.exitSellFirst",
                                            e.target.value === "true"
                                          )
                                        }
                                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      >
                                        <option value="false">No</option>
                                        <option value="true">Yes</option>
                                      </select>
                                    ) : (
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {getEditValue(
                                          strategy,
                                          "exitSettings.exitSellFirst"
                                        )
                                          ? "Yes"
                                          : "No"}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Max Wait Time
                                    </div>
                                    {editingStrategy === strategy.strategyId ? (
                                      <input
                                        type="number"
                                        value={
                                          getEditValue(
                                            strategy,
                                            "exitSettings.maxWaitTime"
                                          ) || ""
                                        }
                                        onChange={(e) =>
                                          handleEditChange(
                                            "exitSettings.maxWaitTime",
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      />
                                    ) : (
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {getEditValue(
                                          strategy,
                                          "exitSettings.maxWaitTime"
                                        )}
                                        s
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Dynamic Hedge Settings */}
                            {strategy.config?.dynamicHedgeSettings && (
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                  Dynamic Hedge Settings
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Hedge Type
                                    </div>
                                    {editingStrategy === strategy.strategyId ? (
                                      <select
                                        value={
                                          getEditValue(
                                            strategy,
                                            "dynamicHedgeSettings.hedgeType"
                                          ) || "premium Based"
                                        }
                                        onChange={(e) =>
                                          handleEditChange(
                                            "dynamicHedgeSettings.hedgeType",
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      >
                                        <option value="premium Based">
                                          premium Based
                                        </option>
                                        <option value="fixed Distance">
                                          fixed Distance
                                        </option>
                                      </select>
                                    ) : (
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {getEditValue(
                                          strategy,
                                          "dynamicHedgeSettings.hedgeType"
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Strike Steps
                                    </div>
                                    {editingStrategy === strategy.strategyId ? (
                                      <input
                                        type="number"
                                        value={
                                          getEditValue(
                                            strategy,
                                            "dynamicHedgeSettings.strikeSteps"
                                          ) || ""
                                        }
                                        onChange={(e) => {
                                          const value =
                                            e.target.value === ""
                                              ? 1
                                              : parseInt(e.target.value);
                                          handleEditChange(
                                            "dynamicHedgeSettings.strikeSteps",
                                            value
                                          );
                                        }}
                                        step="1"
                                        min="1"
                                        placeholder="Any integer"
                                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      />
                                    ) : (
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {getEditValue(
                                          strategy,
                                          "dynamicHedgeSettings.strikeSteps"
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Strike 500
                                    </div>
                                    {editingStrategy === strategy.strategyId ? (
                                      <select
                                        value={
                                          getEditValue(
                                            strategy,
                                            "dynamicHedgeSettings.strike500"
                                          )
                                            ? "true"
                                            : "false"
                                        }
                                        onChange={(e) =>
                                          handleEditChange(
                                            "dynamicHedgeSettings.strike500",
                                            e.target.value === "true"
                                          )
                                        }
                                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      >
                                        <option value="false">No</option>
                                        <option value="true">Yes</option>
                                      </select>
                                    ) : (
                                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {getEditValue(
                                          strategy,
                                          "dynamicHedgeSettings.strike500"
                                        )
                                          ? "Yes"
                                          : "No"}
                                      </div>
                                    )}
                                  </div>
                                  {getEditValue(
                                    strategy,
                                    "dynamicHedgeSettings.hedgeType"
                                  ) === "fixed Distance" && (
                                    <div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Strike Distance
                                      </div>
                                      {editingStrategy ===
                                      strategy.strategyId ? (
                                        <input
                                          type="number"
                                          value={
                                            getEditValue(
                                              strategy,
                                              "dynamicHedgeSettings.strikeDistance"
                                            ) || ""
                                          }
                                          onChange={(e) =>
                                            handleEditChange(
                                              "dynamicHedgeSettings.strikeDistance",
                                              parseInt(e.target.value) || 1
                                            )
                                          }
                                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                          min="1"
                                        />
                                      ) : (
                                        <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                          {getEditValue(
                                            strategy,
                                            "dynamicHedgeSettings.strikeDistance"
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {getEditValue(
                                    strategy,
                                    "dynamicHedgeSettings.hedgeType"
                                  ) === "premium Based" && (
                                    <>
                                      <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          Min Hedge Distance
                                        </div>
                                        {editingStrategy ===
                                        strategy.strategyId ? (
                                          <input
                                            type="number"
                                            value={
                                              getEditValue(
                                                strategy,
                                                "dynamicHedgeSettings.minHedgeDistance"
                                              ) || ""
                                            }
                                            onChange={(e) =>
                                              handleEditChange(
                                                "dynamicHedgeSettings.minHedgeDistance",
                                                parseInt(e.target.value) || 0
                                              )
                                            }
                                            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            min="0"
                                            placeholder="Min distance"
                                          />
                                        ) : (
                                          <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                            {getEditValue(
                                              strategy,
                                              "dynamicHedgeSettings.minHedgeDistance"
                                            ) || 0}
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          Max Hedge Distance
                                        </div>
                                        {editingStrategy ===
                                        strategy.strategyId ? (
                                          <input
                                            type="number"
                                            value={
                                              getEditValue(
                                                strategy,
                                                "dynamicHedgeSettings.maxHedgeDistance"
                                              ) || ""
                                            }
                                            onChange={(e) =>
                                              handleEditChange(
                                                "dynamicHedgeSettings.maxHedgeDistance",
                                                parseInt(e.target.value) || 0
                                              )
                                            }
                                            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            min="0"
                                            placeholder="Max distance"
                                          />
                                        ) : (
                                          <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                            {getEditValue(
                                              strategy,
                                              "dynamicHedgeSettings.maxHedgeDistance"
                                            ) || 0}
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          Min Premium
                                        </div>
                                        {editingStrategy ===
                                        strategy.strategyId ? (
                                          <input
                                            type="number"
                                            step="0.01"
                                            value={
                                              getEditValue(
                                                strategy,
                                                "dynamicHedgeSettings.minPremium"
                                              ) || ""
                                            }
                                            onChange={(e) =>
                                              handleEditChange(
                                                "dynamicHedgeSettings.minPremium",
                                                parseFloat(e.target.value) ||
                                                  0.0
                                              )
                                            }
                                            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            min="0"
                                            placeholder="Min premium"
                                          />
                                        ) : (
                                          <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                            {getEditValue(
                                              strategy,
                                              "dynamicHedgeSettings.minPremium"
                                            ) || 0.0}
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          Max Premium
                                        </div>
                                        {editingStrategy ===
                                        strategy.strategyId ? (
                                          <input
                                            type="number"
                                            step="0.01"
                                            value={
                                              getEditValue(
                                                strategy,
                                                "dynamicHedgeSettings.maxPremium"
                                              ) || ""
                                            }
                                            onChange={(e) =>
                                              handleEditChange(
                                                "dynamicHedgeSettings.maxPremium",
                                                parseFloat(e.target.value) ||
                                                  0.0
                                              )
                                            }
                                            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            min="0"
                                            placeholder="Max premium"
                                          />
                                        ) : (
                                          <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                            {getEditValue(
                                              strategy,
                                              "dynamicHedgeSettings.maxPremium"
                                            ) || 0.0}
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Open Positions Tab */}
                        {getActiveTab(strategy.strategyId) === "positions" && (
                          <div className="space-y-4">
                            {(() => {
                              const allPositions =
                                strategyOrders[strategy.strategyId]?.filter(
                                  (order) => order.entered === true
                                ) || [];
                              const openPositions = allPositions.filter(
                                (order) => order.exited !== true
                              );
                              const closedPositions = allPositions.filter(
                                (order) => order.exited === true
                              );

                              // Calculate total P&L
                              let totalPnL = 0;
                              allPositions.forEach((order) => {
                                // Use the same orderId logic as in calculateSinglePositionPnL
                                const orderId =
                                  order?.response?.data?.oID ||
                                  order?.response?.data?.oid ||
                                  order?.orderId ||
                                  order?.exchangeOrderNumber;
                                if (orderId && positionPnL[orderId]) {
                                  const pnl = parseFloat(
                                    positionPnL[orderId].pnl
                                  );
                                  if (!isNaN(pnl)) {
                                    totalPnL += pnl;
                                  }
                                }
                              });

                              return (
                                <>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                                        Open Positions
                                      </h3>
                                      <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                                          Open: {openPositions.length}
                                        </span>
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs font-medium">
                                          Closed: {closedPositions.length}
                                        </span>
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            totalPnL >= 0
                                              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                              : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                                          }`}
                                        >
                                          Total P&L: {totalPnL >= 0 ? "+" : ""}₹
                                          {totalPnL.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {refreshIntervalsRef.current[
                                        strategy.strategyId
                                      ] && <LiveIndicator />}
                                      <button
                                        onClick={() =>
                                          fetchStrategyOrders(
                                            strategy.strategyId
                                          )
                                        }
                                        className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                      >
                                        🔄 Refresh
                                      </button>
                                    </div>
                                  </div>
                                </>
                              );
                            })()}

                            {strategyOrders[strategy.strategyId] === null ||
                            strategyOrders[strategy.strategyId] ===
                              undefined ? (
                              <EmptyState
                                icon={
                                  <svg
                                    className="w-12 h-12 mx-auto"
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
                                }
                                message={
                                  loadingOrders[strategy.strategyId]
                                    ? "Loading positions..."
                                    : "No positions found"
                                }
                                description="Positions will appear here when orders are executed"
                              />
                            ) : (
                              <div className="overflow-x-auto overflow-y-auto max-h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                                    <tr>
                                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        User ID
                                      </th>
                                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Action
                                      </th>
                                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Order ID
                                      </th>
                                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Leg ID
                                      </th>
                                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Symbol
                                      </th>
                                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Strike
                                      </th>
                                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Action
                                      </th>
                                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Quantity
                                      </th>
                                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Entry Price
                                      </th>
                                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Current/Exit Price
                                      </th>
                                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        P&L
                                      </th>
                                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Entry Time
                                      </th>
                                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Status
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {strategyOrders[strategy.strategyId]
                                      .filter((order) => order.entered === true)
                                      .map((order, idx) => {
                                        const liveDetails = order;
                                        const isExited = order.exited === true;

                                        // Use the same orderId logic as in calculateSinglePositionPnL
                                        const orderId =
                                          order?.response?.data?.oID ||
                                          order?.response?.data?.oid ||
                                          order?.orderId ||
                                          liveDetails?.exchangeOrderNumber;
                                        const pnlData = positionPnL[orderId];

                                        return (
                                          <PositionRow
                                            key={`${orderId}-${idx}`}
                                            order={order}
                                            liveDetails={liveDetails}
                                            pnlData={pnlData}
                                            isExited={isExited}
                                            onSquareOff={handleSquareOff}
                                          />
                                        );
                                      })}
                                  </tbody>
                                </table>
                                {strategyOrders[strategy.strategyId].filter(
                                  (order) => order.entered === true
                                ).length === 0 && (
                                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      No open positions
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Open Orders Tab */}
                        {getActiveTab(strategy.strategyId) === "orders" && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                                  Open Orders
                                </h3>
                                {(() => {
                                  const allOrders =
                                    strategyOrders[strategy.strategyId]?.filter(
                                      (order) =>
                                        !isOrderCompletedOrFinished(
                                          order?.response?.data?.sts ||
                                            order?.orderStatus
                                        )
                                    ) || [];
                                  return (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium rounded">
                                      Total: {allOrders.length}
                                    </span>
                                  );
                                })()}
                              </div>
                              <div className="flex items-center gap-2">
                                {refreshIntervalsRef.current[
                                  strategy.strategyId
                                ] && <LiveIndicator />}
                                <button
                                  onClick={() =>
                                    fetchStrategyOrders(strategy.strategyId)
                                  }
                                  className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                >
                                  🔄 Refresh
                                </button>
                              </div>
                            </div>

                            {strategyOrders[strategy.strategyId] === null ||
                            strategyOrders[strategy.strategyId] ===
                              undefined ? (
                              <EmptyState
                                icon={
                                  <svg
                                    className="w-12 h-12 mx-auto"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                  </svg>
                                }
                                message={
                                  loadingOrders[strategy.strategyId]
                                    ? "Loading orders..."
                                    : "No orders found"
                                }
                                description="Orders will appear here when placed"
                              />
                            ) : (
                              <div className="overflow-x-auto overflow-y-auto max-h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Order ID
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Leg ID
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Symbol
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Strike
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Action
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Qty / Fill Qty
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Limit / Avg Price
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Order Time
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Status
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
                                        Rejection Reason
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {strategyOrders[strategy.strategyId]
                                      .filter((order) => {
                                        // Show only pending orders (not rejected, not complete, not cancelled)
                                        const liveDetails = order;
                                        const status = (
                                          liveDetails?.response?.data?.sts ||
                                          "unknown"
                                        ).toUpperCase();

                                        // Exclude completed/finished orders
                                        return (
                                          !isOrderCompletedOrFinished(status) ||
                                          status === "UNKNOWN"
                                        );
                                      })
                                      .map((order, idx) => {
                                        const liveDetails = order;
                                        const status = (
                                          liveDetails?.response?.data?.sts ||
                                          "unknown"
                                        ).toUpperCase();

                                        return (
                                          <tr
                                            key={idx}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                          >
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {order.orderId ||
                                                liveDetails?.exchangeOrderNumber ||
                                                "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {order.legId || "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {order.symbol || "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {order.strike || "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs">
                                              <span
                                                className={`px-2 py-1 rounded-full ${
                                                  order.action === "BUY" ||
                                                  liveDetails?.transactionType ===
                                                    "BUY"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                }`}
                                              >
                                                {order.action ||
                                                  liveDetails?.transactionType ||
                                                  "N/A"}
                                              </span>
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {liveDetails ? (
                                                <div className="flex flex-col">
                                                  <span>
                                                    {liveDetails.totalQuantity ||
                                                      order.quantity ||
                                                      "N/A"}
                                                  </span>
                                                  {liveDetails.fillQuantity &&
                                                    liveDetails.fillQuantity !==
                                                      "0" && (
                                                      <span className="text-green-600 dark:text-green-400 font-semibold">
                                                        Filled:{" "}
                                                        {
                                                          liveDetails.fillQuantity
                                                        }
                                                      </span>
                                                    )}
                                                </div>
                                              ) : (
                                                order.quantity || "N/A"
                                              )}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {liveDetails ? (
                                                <div className="flex flex-col">
                                                  <span>
                                                    ₹
                                                    {liveDetails.price ||
                                                      order.limitPrice ||
                                                      "0.00"}
                                                  </span>
                                                  {liveDetails.averagePrice &&
                                                    liveDetails.averagePrice !==
                                                      "0.00" && (
                                                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                                        Avg: ₹
                                                        {
                                                          liveDetails.averagePrice
                                                        }
                                                      </span>
                                                    )}
                                                </div>
                                              ) : order.limitPrice ? (
                                                `₹${order.limitPrice}`
                                              ) : (
                                                "N/A"
                                              )}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {order?.executionTime
                                                ? new Date(
                                                    order.executionTime
                                                  ).toLocaleString()
                                                : liveDetails?.executionTime
                                                ? new Date(
                                                    liveDetails.executionTime
                                                  ).toLocaleString()
                                                : liveDetails?.orderTime ||
                                                  "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs">
                                              <span
                                                className={`px-2 py-1 rounded-full ${
                                                  isOrderRejected(status)
                                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                    : isOrderComplete(status)
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    : isOrderPending(status)
                                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                }`}
                                              >
                                                {status}
                                              </span>
                                            </td>
                                            <td className="px-3 py-2 text-xs text-gray-900 dark:text-white break-words">
                                              {liveDetails?.rejectionReason ||
                                                "-"}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                  </tbody>
                                </table>
                                {strategyOrders[strategy.strategyId].filter(
                                  (order) => {
                                    const status = (
                                      order?.response?.data?.sts ||
                                      order?.orderStatus ||
                                      "unknown"
                                    ).toUpperCase();
                                    return (
                                      !isOrderCompletedOrFinished(status) ||
                                      status === "UNKNOWN"
                                    );
                                  }
                                ).length === 0 && (
                                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      No pending orders
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Completed Orders Tab */}
                        {getActiveTab(strategy.strategyId) === "completed" && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                                  Completed Orders
                                </h3>
                                {(() => {
                                  const completedOrders =
                                    strategyOrders[strategy.strategyId]?.filter(
                                      (order) =>
                                        isOrderCompletedOrFinished(
                                          order?.response?.data?.sts ||
                                            order.orderStatus
                                        )
                                    ) || [];
                                  return (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs font-medium rounded">
                                      Total: {completedOrders.length}
                                    </span>
                                  );
                                })()}
                              </div>
                              <div className="flex items-center gap-2">
                                {refreshIntervalsRef.current[
                                  strategy.strategyId
                                ] && <LiveIndicator />}
                                <button
                                  onClick={() =>
                                    fetchStrategyOrders(strategy.strategyId)
                                  }
                                  className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                >
                                  🔄 Refresh
                                </button>
                              </div>
                            </div>

                            {strategyOrders[strategy.strategyId] === null ||
                            strategyOrders[strategy.strategyId] ===
                              undefined ? (
                              <EmptyState
                                icon={
                                  <svg
                                    className="w-12 h-12 mx-auto"
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
                                }
                                message={
                                  loadingOrders[strategy.strategyId]
                                    ? "Loading orders..."
                                    : "No completed orders"
                                }
                                description="Order history will appear here"
                              />
                            ) : (
                              <div className="overflow-x-auto overflow-y-auto max-h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Order ID
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Leg ID
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Symbol
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Strike
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Action
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Fill Qty
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Avg Fill Price
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Order Time
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        Status
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
                                        Rejection Reason
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {strategyOrders[strategy.strategyId]
                                      .filter((order) => {
                                        // Show completed, rejected, and cancelled orders
                                        return isOrderCompletedOrFinished(
                                          order?.response?.data?.sts ||
                                            order.orderStatus
                                        );
                                      })
                                      .map((order, idx) => {
                                        const liveDetails = order;
                                        const status = (
                                          liveDetails?.response?.data?.sts ||
                                          liveDetails.orderStatus
                                        ).toUpperCase();

                                        return (
                                          <tr
                                            key={idx}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                          >
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {order.orderId ||
                                                liveDetails?.exchangeOrderNumber ||
                                                "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {order.legId || "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {order.symbol || "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {order.strike || "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs">
                                              <span
                                                className={`px-2 py-1 rounded-full ${
                                                  order.action === "BUY" ||
                                                  liveDetails?.transactionType ===
                                                    "BUY"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                }`}
                                              >
                                                {order.action ||
                                                  liveDetails?.transactionType ||
                                                  "N/A"}
                                              </span>
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white font-semibold">
                                              {liveDetails?.fillQuantity ||
                                                liveDetails?.totalQuantity ||
                                                order.quantity ||
                                                "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white font-semibold">
                                              {liveDetails?.averagePrice &&
                                              liveDetails.averagePrice !==
                                                "0.00"
                                                ? `₹${liveDetails.averagePrice}`
                                                : liveDetails?.fillPrice &&
                                                  liveDetails.fillPrice !==
                                                    "0.00"
                                                ? `₹${liveDetails.fillPrice}`
                                                : order.limitPrice
                                                ? `₹${order.limitPrice}`
                                                : "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                              {order?.executionTime
                                                ? new Date(
                                                    order.executionTime
                                                  ).toLocaleString()
                                                : liveDetails?.executionTime
                                                ? new Date(
                                                    liveDetails.executionTime
                                                  ).toLocaleString()
                                                : liveDetails?.orderTime ||
                                                  "N/A"}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-xs">
                                              <span
                                                className={`px-2 py-1 rounded-full ${
                                                  isOrderRejected(status)
                                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                    : isOrderCancelled(status)
                                                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                }`}
                                              >
                                                {isOrderRejected(status)
                                                  ? "REJECTED"
                                                  : isOrderCancelled(status)
                                                  ? "CANCELLED"
                                                  : isOrderComplete(status)
                                                  ? "COMPLETE"
                                                  : status}
                                              </span>
                                            </td>
                                            <td className="px-3 py-2 text-xs text-gray-900 dark:text-white break-words">
                                              {liveDetails?.rejectionReason ||
                                                "-"}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                  </tbody>
                                </table>
                                {strategyOrders[strategy.strategyId].filter(
                                  (order) =>
                                    isOrderCompletedOrFinished(
                                      order?.response?.data?.sts ||
                                        order.orderStatus
                                    )
                                ).length === 0 && (
                                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      No completed orders yet
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Premium Based Strike Configuration Modal */}
        {premiumStrikeModalLeg !== null && currentEditingStrategyId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              {(() => {
                const leg = editValues.legs?.[premiumStrikeModalLeg];
                if (!leg) return null;

                // Ensure premiumBasedStrikeConfig exists
                if (!leg.premiumBasedStrikeConfig) {
                  leg.premiumBasedStrikeConfig = {
                    strikeType: "NearestPremium",
                    maxDepth: 5,
                    searchSide: "BOTH",
                    value: 0,
                    condition: "Greaterthanequal",
                    between: 0,
                    and: 0,
                  };
                }

                return (
                  <>
                    <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Premium Based Strike - {leg.legId}
                      </h3>
                      <button
                        onClick={() => {
                          setPremiumStrikeModalLeg(null);
                          setCurrentEditingStrategyId(null);
                        }}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Strike Type */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Strike Type
                        </label>
                        <select
                          value={leg.premiumBasedStrikeConfig.strikeType}
                          onChange={(e) =>
                            handlePremiumStrikeConfigChange(
                              premiumStrikeModalLeg,
                              "strikeType",
                              e.target.value
                            )
                          }
                          className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="NearestPremium">
                            Nearest Premium
                          </option>
                          <option value="premium">Premium</option>
                        </select>
                      </div>

                      {/* Max Depth */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Max Depth
                        </label>
                        <input
                          type="number"
                          value={leg.premiumBasedStrikeConfig.maxDepth}
                          onChange={(e) =>
                            handlePremiumStrikeConfigChange(
                              premiumStrikeModalLeg,
                              "maxDepth",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </div>

                      {/* Search Side */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Search Side
                        </label>
                        <select
                          value={leg.premiumBasedStrikeConfig.searchSide}
                          onChange={(e) =>
                            handlePremiumStrikeConfigChange(
                              premiumStrikeModalLeg,
                              "searchSide",
                              e.target.value
                            )
                          }
                          className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="ITM">ITM</option>
                          <option value="OTM">OTM</option>
                          <option value="BOTH">BOTH</option>
                        </select>
                      </div>

                      {/* Conditional Fields based on Strike Type */}
                      {leg.premiumBasedStrikeConfig.strikeType ===
                      "NearestPremium" ? (
                        <>
                          {/* Value */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Value
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={leg.premiumBasedStrikeConfig.value}
                              onChange={(e) =>
                                handlePremiumStrikeConfigChange(
                                  premiumStrikeModalLeg,
                                  "value",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* Condition */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Condition
                            </label>
                            <select
                              value={leg.premiumBasedStrikeConfig.condition}
                              onChange={(e) =>
                                handlePremiumStrikeConfigChange(
                                  premiumStrikeModalLeg,
                                  "condition",
                                  e.target.value
                                )
                              }
                              className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="Greaterthanequal">
                                Greater Than or Equal (≥)
                              </option>
                              <option value="lessthanequal">
                                Less Than or Equal (≤)
                              </option>
                            </select>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Between */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Between
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={leg.premiumBasedStrikeConfig.between}
                              onChange={(e) =>
                                handlePremiumStrikeConfigChange(
                                  premiumStrikeModalLeg,
                                  "between",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* And */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              And
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={leg.premiumBasedStrikeConfig.and}
                              onChange={(e) =>
                                handlePremiumStrikeConfigChange(
                                  premiumStrikeModalLeg,
                                  "and",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setPremiumStrikeModalLeg(null);
                          setCurrentEditingStrategyId(null);
                        }}
                        className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeployedStrategies;
