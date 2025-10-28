// Constants for Deployed Strategies component
import {
  OrderStatusConstants,
  TabConfig,
} from "../types/deployedStrategies.types";

// Order status constants for matching various API responses
export const ORDER_STATUS: OrderStatusConstants = {
  COMPLETE: ["COMPLETE", "COMPLETED", "EXECUTED", "FILLED"],
  REJECTED: ["REJECTED", "REJECT"],
  CANCELLED: ["CANCELLED", "CANCELED", "CANCELLED_BY_USER", "CANCEL"],
  PENDING: ["PENDING", "OPEN", "NEW", "ACCEPTED", "TRIGGER_PENDING"],
};

// Symbol options for dropdown
export const SYMBOL_OPTIONS = ["NIFTY", "BANKNIFTY", "FINNIFTY", "SENSEX"];

// Tab configuration
export const TABS: TabConfig[] = [
  { id: "parameters", label: "Configuration" },
  { id: "positions", label: "Open Positions" },
  { id: "orders", label: "Open Orders" },
  { id: "completed", label: "Completed Orders" },
];

// Hedge type options
export const HEDGE_TYPE_OPTIONS = ["premium Based", "fixed Distance"];

// Auto-refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  STRATEGIES: 30000, // 30 seconds
  OPTION_DATA: 1000, // 1 second
  ORDERS: 1000, // 1 second
};

// Order status helper functions
export const isOrderComplete = (status: string | undefined): boolean => {
  if (!status) return false;
  return ORDER_STATUS.COMPLETE.includes(status.toUpperCase());
};

export const isOrderRejected = (status: string | undefined): boolean => {
  if (!status) return false;
  return ORDER_STATUS.REJECTED.includes(status.toUpperCase());
};

export const isOrderCancelled = (status: string | undefined): boolean => {
  if (!status) return false;
  return ORDER_STATUS.CANCELLED.includes(status.toUpperCase());
};

export const isOrderPending = (status: string | undefined): boolean => {
  if (!status) return false;
  return ORDER_STATUS.PENDING.includes(status.toUpperCase());
};

export const isOrderCompletedOrFinished = (
  status: string | undefined
): boolean => {
  return (
    isOrderComplete(status) ||
    isOrderRejected(status) ||
    isOrderCancelled(status)
  );
};
