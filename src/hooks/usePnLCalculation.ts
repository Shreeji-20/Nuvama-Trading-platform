/**
 * usePnLCalculation Hook
 *
 * Custom hook for calculating P&L for open and closed positions.
 * Handles both SIMULATIONMODE and LIVEMODE orders.
 *
 * P&L CALCULATION:
 * ================
 *
 * OPEN POSITIONS (entered: true, exited: false):
 * - Entry price: response.data.fPrc
 * - Current price: Fetched from market depth (bid for BUY, ask for SELL)
 * - P&L = (Current - Entry) × Qty  [for BUY]
 * - P&L = (Entry - Current) × Qty  [for SELL]
 *
 * CLOSED POSITIONS (entered: true, exited: true):
 * - Entry price: response.data.fPrc
 * - Exit price: Fetched from exit order
 * - P&L = (Exit - Entry) × Qty  [for BUY]
 * - P&L = (Entry - Exit) × Qty  [for SELL]
 */

import { useState, useCallback } from "react";
import {
  Order,
  PositionPnLData,
  MarketDepthData,
} from "../types/deployedStrategies.types";
import strategyOrdersService from "../services/strategyOrders.service";

interface UsePnLCalculationReturn {
  positionPnL: Record<string, PositionPnLData>;
  loadingPnL: Record<string, boolean>;
  calculatePnLForPosition: (order: Order) => Promise<void>;
  calculatePnLForPositions: (orders: Order[]) => Promise<void>;
  getMarketDepth: (
    symbol: string,
    strike: string | number,
    optionType: string,
    expiry: string | number
  ) => Promise<MarketDepthData | null>;
  clearPnL: (orderId: string) => void;
}

export const usePnLCalculation = (): UsePnLCalculationReturn => {
  const [positionPnL, setPositionPnL] = useState<
    Record<string, PositionPnLData>
  >({});
  const [loadingPnL, setLoadingPnL] = useState<Record<string, boolean>>({});

  /**
   * Get order ID from order object (handles multiple formats)
   */
  const getOrderId = (order: Order): string | undefined => {
    return (
      order?.response?.data?.oID ||
      order?.response?.data?.oid ||
      order?.orderId ||
      order?.exchangeOrderNumber
    );
  };

  /**
   * Get market depth for live price
   */
  const getMarketDepth = useCallback(
    async (
      symbol: string,
      strike: string | number,
      optionType: string,
      expiry: string | number
    ): Promise<MarketDepthData | null> => {
      try {
        return await strategyOrdersService.getMarketDepth(
          symbol,
          strike,
          optionType,
          expiry
        );
      } catch (error) {
        console.error("Error fetching market depth:", error);
        return null;
      }
    },
    []
  );

  /**
   * Calculate P&L for a single position
   */
  const calculatePnLForPosition = useCallback(
    async (order: Order) => {
      const orderId = getOrderId(order);

      if (!orderId) {
        console.warn("No orderId found for order:", order);
        return;
      }

      // Set loading state
      setLoadingPnL((prev) => ({ ...prev, [orderId]: true }));

      try {
        const isExited = order.exited === true;
        const action = order.action;

        // Get entry price and quantity
        let entryPrice = parseFloat(
          order?.response?.data?.fPrc || order?.fPrc || "0"
        );
        let quantity = parseInt(
          order?.response?.data?.fQty?.toString() ||
            order?.fQty?.toString() ||
            order?.quantity?.toString() ||
            "0"
        );

        if (!entryPrice || !quantity || !action) {
          console.warn(`Incomplete data for order ${orderId}:`, {
            entryPrice,
            quantity,
            action,
          });
          setLoadingPnL((prev) => ({ ...prev, [orderId]: false }));
          return;
        }

        let pnl = 0;
        let exitPrice: number | null = null;
        let currentPrice: number | null = null;

        if (isExited) {
          // CLOSED POSITION: Fetch exit order
          const orderDetailsKey = order.orderDetailsKey || orderId;
          const exitOrder = await strategyOrdersService.getExitOrder(
            orderDetailsKey
          );

          if (exitOrder?.response?.data?.fPrc) {
            exitPrice = parseFloat(exitOrder.response.data.fPrc);

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
                exitPrice: exitPrice?.toFixed(2) || "0.00",
                currentPrice: null,
                quantity,
                action,
                isExited: true,
              },
            }));
          } else {
            console.error(`No exit price found for closed position ${orderId}`);
          }
        } else {
          // OPEN POSITION: Calculate unrealized P&L using market depth
          if (!order.symbol || !order.strike || !order.optionType) {
            console.warn(`Missing instrument details for order ${orderId}`);
            setLoadingPnL((prev) => ({ ...prev, [orderId]: false }));
            return;
          }

          const depthData = await getMarketDepth(
            order.symbol,
            order.strike,
            order.optionType,
            order.expiry || 0
          );

          if (depthData) {
            // Get current price based on action
            if (action === "BUY") {
              // For BUY positions, use bid price (price at which we can sell)
              currentPrice = depthData.bid;
            } else if (action === "SELL") {
              // For SELL positions, use ask price (price at which we need to buy back)
              currentPrice = depthData.ask;
            }

            // Calculate unrealized P&L
            if (currentPrice && currentPrice > 0) {
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
                  currentPrice: currentPrice?.toFixed(2) || "0.00",
                  quantity,
                  action,
                  isExited: false,
                },
              }));
            } else {
              console.warn(
                `No valid current price for open position ${orderId}`
              );
            }
          } else {
            console.warn(`No market depth data for open position ${orderId}`);
          }
        }
      } catch (error) {
        console.error(`Error calculating P&L for order ${orderId}:`, error);
      } finally {
        // Clear loading state
        setLoadingPnL((prev) => ({ ...prev, [orderId]: false }));
      }
    },
    [getMarketDepth]
  );

  /**
   * Calculate P&L for multiple positions
   */
  const calculatePnLForPositions = useCallback(
    async (orders: Order[]) => {
      // Filter for entered positions only
      const positions = orders.filter((order) => order.entered === true);

      // Calculate P&L for each position in parallel
      await Promise.all(
        positions.map((order) => calculatePnLForPosition(order))
      );
    },
    [calculatePnLForPosition]
  );

  /**
   * Clear P&L data for a specific order
   */
  const clearPnL = useCallback((orderId: string) => {
    setPositionPnL((prev) => {
      const newPnL = { ...prev };
      delete newPnL[orderId];
      return newPnL;
    });
    setLoadingPnL((prev) => {
      const newLoading = { ...prev };
      delete newLoading[orderId];
      return newLoading;
    });
  }, []);

  return {
    positionPnL,
    loadingPnL,
    calculatePnLForPosition,
    calculatePnLForPositions,
    getMarketDepth,
    clearPnL,
  };
};

export default usePnLCalculation;
