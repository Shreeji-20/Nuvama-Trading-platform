/**
 * useStrategyOrders Hook
 *
 * Custom hook for managing strategy orders with auto-refresh capability.
 * Handles fetching orders with live details and managing refresh intervals.
 *
 * Features:
 * - Fetch orders on demand
 * - Auto-refresh at specified interval
 * - Loading and error states
 * - Cleanup on unmount
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { Order } from "../types/deployedStrategies.types";
import strategyOrdersService from "../services/strategyOrders.service";

interface UseStrategyOrdersOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseStrategyOrdersReturn {
  orders: Record<string, Order[] | null>;
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
  fetchOrders: (strategyId: string) => Promise<void>;
  startAutoRefresh: (strategyId: string) => void;
  stopAutoRefresh: (strategyId: string) => void;
  clearOrders: (strategyId: string) => void;
}

export const useStrategyOrders = (
  options: UseStrategyOrdersOptions = {}
): UseStrategyOrdersReturn => {
  const { autoRefresh = false, refreshInterval = 1000 } = options;

  const [orders, setOrders] = useState<Record<string, Order[] | null>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string | null>>({});

  // Store interval IDs for each strategy
  const intervalRefs = useRef<Record<string, number>>({});

  /**
   * Fetch orders for a specific strategy
   */
  const fetchOrders = useCallback(async (strategyId: string) => {
    try {
      setLoading((prev) => ({ ...prev, [strategyId]: true }));
      setError((prev) => ({ ...prev, [strategyId]: null }));

      const fetchedOrders =
        await strategyOrdersService.getStrategyOrdersLiveDetails(strategyId);

      setOrders((prev) => ({ ...prev, [strategyId]: fetchedOrders }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError((prev) => ({ ...prev, [strategyId]: errorMessage }));
      console.error(`Error fetching orders for strategy ${strategyId}:`, err);
    } finally {
      setLoading((prev) => ({ ...prev, [strategyId]: false }));
    }
  }, []);

  /**
   * Start auto-refresh for a specific strategy
   */
  const startAutoRefresh = useCallback(
    (strategyId: string) => {
      // Clear any existing interval
      if (intervalRefs.current[strategyId]) {
        clearInterval(intervalRefs.current[strategyId]);
      }

      // Fetch immediately
      fetchOrders(strategyId);

      // Set up new interval
      const intervalId = window.setInterval(() => {
        fetchOrders(strategyId);
      }, refreshInterval);

      intervalRefs.current[strategyId] = intervalId;

      console.log(
        `Started auto-refresh for strategy ${strategyId} (interval: ${refreshInterval}ms)`
      );
    },
    [fetchOrders, refreshInterval]
  );

  /**
   * Stop auto-refresh for a specific strategy
   */
  const stopAutoRefresh = useCallback((strategyId: string) => {
    if (intervalRefs.current[strategyId]) {
      clearInterval(intervalRefs.current[strategyId]);
      delete intervalRefs.current[strategyId];
      console.log(`Stopped auto-refresh for strategy ${strategyId}`);
    }
  }, []);

  /**
   * Clear orders for a specific strategy
   */
  const clearOrders = useCallback((strategyId: string) => {
    setOrders((prev) => {
      const newOrders = { ...prev };
      delete newOrders[strategyId];
      return newOrders;
    });
    setLoading((prev) => {
      const newLoading = { ...prev };
      delete newLoading[strategyId];
      return newLoading;
    });
    setError((prev) => {
      const newError = { ...prev };
      delete newError[strategyId];
      return newError;
    });
  }, []);

  /**
   * Cleanup all intervals on unmount
   */
  useEffect(() => {
    return () => {
      Object.keys(intervalRefs.current).forEach((strategyId) => {
        if (intervalRefs.current[strategyId]) {
          clearInterval(intervalRefs.current[strategyId]);
        }
      });
      intervalRefs.current = {};
    };
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    startAutoRefresh,
    stopAutoRefresh,
    clearOrders,
  };
};

export default useStrategyOrders;
