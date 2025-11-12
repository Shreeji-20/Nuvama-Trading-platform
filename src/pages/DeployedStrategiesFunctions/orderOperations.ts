import config from "../../config/api";
import { Order } from "../../types/deployedStrategies.types";

const API_BASE_URL = config.API_BASE_URL;

/**
 * Order Operations
 * Functions for handling order-related operations
 */

/**
 * Handle Square Off for a position
 */
export const handleSquareOff = async (
  order: Order,
  fetchOrders?: (strategyId: string) => void
) => {
  const orderId =
    order?.response?.data?.oID || order?.orderId || order?.exchangeOrderNumber;
  const userId = order?.userId;

  if (!orderId || !userId) {
    alert("Cannot square off: Missing order ID or user ID");
    return;
  }

  console.log("Initiating square off for order:", orderId, order);

  // Fire and forget - send request immediately
  fetch(`${API_BASE_URL}/strategy-orders/squareofforder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(order),
  })
    .then((response) => {
      console.log(
        `Square off request sent for order: ${orderId}, status: ${response.status}`
      );
      if (!response.ok) {
        console.warn(
          `Square off request failed with status: ${response.status}`
        );
      }
      return response.json();
    })
    .then((data) => {
      console.log("Square off response:", data);
    })
    .catch((error) => {
      console.error("Error sending square off request:", error);
    });

  // Immediately show success message
  console.log(`Square off request initiated for Order ID: ${orderId}`);

  // Optionally refresh orders after a short delay
  // if (order.strategyId && fetchOrders) {
  //   setTimeout(() => {
  //     fetchOrders(order.strategyId!);
  //   }, 1000);
  // }
};

/**
 * Toggle strategy expansion and manage order fetching
 */
export const toggleStrategy = (
  strategyId: string,
  expandedStrategy: string | null,
  setExpandedStrategy: (id: string | null) => void,
  fetchOrders: (strategyId: string) => void,
  startAutoRefresh: (strategyId: string) => void,
  stopAutoRefresh: (strategyId: string) => void
) => {
  const willBeExpanded = expandedStrategy !== strategyId;
  setExpandedStrategy(willBeExpanded ? strategyId : null);

  // If expanding, fetch orders and start auto-refresh
  if (willBeExpanded) {
    fetchOrders(strategyId);
    startAutoRefresh(strategyId);
  } else {
    // If collapsing, stop auto-refresh
    stopAutoRefresh(strategyId);
  }
};

/**
 * Fetch option data from the backend
 */
export const fetchOptionData = async (
  setOptionDataCache: (data: any[]) => void,
  setLastOptionDataFetch: (date: Date) => void
) => {
  try {
    const response = await fetch(config.buildUrl(config.ENDPOINTS.OPTIONDATA));

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
};
