/**
 * Strategy Orders API Service
 *
 * Handles all API calls related to strategy orders, including:
 * - Fetching orders with live details
 * - P&L calculation data (entry/exit prices, market depth)
 * - Order status and position tracking
 *
 * Based on strategy_orders.py backend API
 */

import config from "../config/api";
import {
  Order,
  StrategyOrdersLiveResponse,
  ExitOrderResponse,
  EntryPriceResponse,
  MarketDepthResponse,
  MarketDepthData,
} from "../types/deployedStrategies.types";

const API_BASE_URL = config.API_BASE_URL;

/**
 * Get all orders for a specific strategy with live details
 *
 * This endpoint enriches orders with real-time data for both SIMULATIONMODE and LIVEMODE.
 *
 * @param strategyId - The strategy ID to fetch orders for
 * @returns Promise with orders array or null if none found
 */
export const getStrategyOrdersLiveDetails = async (
  strategyId: string
): Promise<Order[] | null> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/strategy-orders/get/${strategyId}/live-details`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: StrategyOrdersLiveResponse = await response.json();
    return data.orders;
  } catch (error) {
    console.error("Error fetching strategy orders with live details:", error);
    throw error;
  }
};

/**
 * Get orders filtered by leg ID
 *
 * @param strategyId - The strategy ID
 * @param legId - The leg ID to filter by
 * @returns Promise with filtered orders
 */
export const getStrategyOrdersByLeg = async (
  strategyId: string,
  legId: string
): Promise<Order[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/strategy-orders/get/${strategyId}/by-leg/${legId}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.orders || [];
  } catch (error) {
    console.error("Error fetching strategy orders by leg:", error);
    throw error;
  }
};

/**
 * Get orders filtered by user ID
 *
 * @param strategyId - The strategy ID
 * @param userId - The user ID to filter by
 * @returns Promise with filtered orders
 */
export const getStrategyOrdersByUser = async (
  strategyId: string,
  userId: string
): Promise<Order[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/strategy-orders/get/${strategyId}/by-user/${userId}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.orders || [];
  } catch (error) {
    console.error("Error fetching strategy orders by user:", error);
    throw error;
  }
};

/**
 * Get exit order details for closed positions
 *
 * Used to fetch the exit price for P&L calculation of closed positions.
 *
 * @param orderDetailsKey - The order details key from the original order
 * @returns Promise with exit order data or null
 */
export const getExitOrder = async (
  orderDetailsKey: string
): Promise<Order | null> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/strategy-orders/exit-order/${encodeURIComponent(
        orderDetailsKey
      )}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Exit order not found for ${orderDetailsKey}`);
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ExitOrderResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching exit order:", error);
    return null;
  }
};

/**
 * Get entry price and quantity for an order
 *
 * Intelligently fetches the correct entry price based on execution mode:
 * - SIMULATIONMODE: Returns fPrc from strategy order key
 * - LIVEMODE: Returns fPrc from live order key
 *
 * @param strategyId - The strategy ID
 * @param orderDetailsKey - The order details key (without strategyId prefix)
 * @returns Promise with entry price data
 */
export const getOrderEntryPrice = async (
  strategyId: string,
  orderDetailsKey: string
): Promise<EntryPriceResponse["data"]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/strategy-orders/entry-price/${strategyId}/${encodeURIComponent(
        orderDetailsKey
      )}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: EntryPriceResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching entry price:", error);
    throw error;
  }
};

/**
 * Get market depth for calculating live P&L
 *
 * @param symbol - Trading symbol (e.g., NIFTY, BANKNIFTY)
 * @param strike - Strike price
 * @param optionType - Option type (CE or PE)
 * @param expiry - Expiry index (0-5)
 * @returns Promise with market depth data or null
 */
export const getMarketDepth = async (
  symbol: string,
  strike: string | number,
  optionType: string,
  expiry: string | number
): Promise<MarketDepthData | null> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/strategy-orders/depth/${symbol}/${strike}/${optionType}/${expiry}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(
          `Market depth not found for ${symbol} ${strike} ${optionType} ${expiry}`
        );
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: MarketDepthResponse = await response.json();

    if (!data.data) {
      return null;
    }

    // Extract bid/ask/ltp from the response
    const bid = data.data.bidValues?.[0]?.price || 0;
    const ask = data.data.askValues?.[0]?.price || 0;
    const ltp = data.data.ltp || 0;

    return { bid, ask, ltp };
  } catch (error) {
    console.error("Error fetching market depth:", error);
    return null;
  }
};

/**
 * Get live order details by components
 *
 * @param userId - User ID
 * @param strategyName - Strategy name
 * @param legId - Leg ID
 * @param orderId - Order ID
 * @returns Promise with live order data
 */
export const getLiveOrderByComponents = async (
  userId: string,
  strategyName: string,
  legId: string,
  orderId: string
): Promise<Order | null> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/strategy-orders/live-order/${userId}/${strategyName}/${legId}/${orderId}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.orderDetails;
  } catch (error) {
    console.error("Error fetching live order:", error);
    return null;
  }
};

/**
 * Debug endpoint to troubleshoot order data issues
 *
 * @param strategyId - The strategy ID
 * @param orderDetailsKey - The order details key
 * @returns Promise with comprehensive debug information
 */
export const debugOrder = async (
  strategyId: string,
  orderDetailsKey: string
): Promise<any> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/strategy-orders/debug/${strategyId}/${encodeURIComponent(
        orderDetailsKey
      )}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.debug;
  } catch (error) {
    console.error("Error fetching debug info:", error);
    throw error;
  }
};

/**
 * Health check for strategy orders service
 *
 * @returns Promise with health status
 */
export const healthCheck = async (): Promise<{
  status: string;
  service: string;
  redis_connection: string;
  timestamp: string;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/strategy-orders/health`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error checking health:", error);
    throw error;
  }
};

// Export all functions as a service object
const strategyOrdersService = {
  getStrategyOrdersLiveDetails,
  getStrategyOrdersByLeg,
  getStrategyOrdersByUser,
  getExitOrder,
  getOrderEntryPrice,
  getMarketDepth,
  getLiveOrderByComponents,
  debugOrder,
  healthCheck,
};

export default strategyOrdersService;
