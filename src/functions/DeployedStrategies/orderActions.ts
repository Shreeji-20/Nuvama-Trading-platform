import config from "../../config/api";
import { Order } from "../../types/deployedStrategies.types";

const API_BASE_URL = config.API_BASE_URL;

/**
 * Handle Square Off for a position
 */
export const handleSquareOff = (order: Order) => {
  const orderId =
    order?.response?.data?.oID || order?.orderId || order?.exchangeOrderNumber;
  const userId = order?.userId;
  const strategyId = order?.strategyId;
  const legId = order?.legId;
  const orderDetailsKey = order?.orderDetailsKey;

  if (!orderId || !userId) {
    alert("Cannot square off: Missing order ID or user ID");
    return;
  }

  if (!strategyId || !legId) {
    alert("Cannot square off: Missing strategy ID or leg ID");
    return;
  }

  console.log("Initiating square off for order:", orderId, order);

  // Prepare the square off request data
  const squareOffData = {
    strategyId: strategyId,
    legId: legId,
    userId: userId,
    orderId: orderId,
    orderDetailsKey:
      orderDetailsKey || `${strategyId}:${userId}_${legId}_${orderId}`,
    strike: order.strike,
    action: order.action,
    isHedge: order.isHedge || false,
    symbol: order.symbol,
    optionType: order.optionType,
    expiry: order.expiry,
    quantity: order?.response?.data?.fQty || order.quantity,
  };

  console.log("Square off request data:", squareOffData);

  // Fire and forget - send request immediately
  fetch(`${API_BASE_URL}/strategy-orders/squareofforder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(squareOffData),
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
      alert(`Square off successful for Order ID: ${orderId}`);
    })
    .catch((error) => {
      console.error("Error sending square off request:", error);
      alert(
        `Square off failed for Order ID: ${orderId}. Error: ${error.message}`
      );
    });

  // Immediately show success message
  console.log(`Square off request initiated for Order ID: ${orderId}`);
};
