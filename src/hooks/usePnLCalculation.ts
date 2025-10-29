/**
 * usePnLCalculation Hook
 *
 * Custom hook for calculating P&L for open and closed positions.
 * Handles both SIMULATIONMODE and LIVEMODE orders.
 *
 * OPTIMIZATION:
 * =============
 * - Closed positions: Exit order fetched ONCE and cached (no repeated API calls)
 * - Open positions: Market depth fetched every second for live updates
 * - Uses useRef for cache to avoid stale closures in callbacks
 *
 * P&L CALCULATION:
 * ================
 *
 * OPEN POSITIONS (entered: true, exited: false):
 * - Entry price: response.data.fPrc
 * - Current price: Fetched from market depth (bid for BUY, ask for SELL)
 * - P&L = (Current - Entry) × Qty  [for BUY]
 * - P&L = (Entry - Current) × Qty  [for SELL]
 * - Market depth refreshed every second with live data
 *
 * CLOSED POSITIONS (entered: true, exited: true):
 * - Entry price: response.data.fPrc
 * - Exit price: Fetched from exit order ONCE (cached after first fetch)
 * - P&L = (Exit - Entry) × Qty  [for BUY]
 * - P&L = (Entry - Exit) × Qty  [for SELL]
 * - Exit order fetched only once when position is first detected as closed
 * - Subsequent refreshes skip API call and use cached data
 * - NO market depth fetching for closed positions (optimization)
 */

import { useState, useCallback, useRef } from "react";
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

  // Track which exit orders have already been fetched to avoid refetching
  // Using useRef so we can access current value in callbacks without dependency issues
  const fetchedExitOrdersRef = useRef<Set<string>>(new Set());

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

      const isExited = order.exited === true;

      // OPTIMIZATION: Skip API call for already-fetched closed positions
      if (isExited) {
        const isCached = fetchedExitOrdersRef.current.has(orderId);
        console.log(
          `[P&L Calc] Order ${orderId}: exited=${isExited}, cached=${isCached}, cache size=${fetchedExitOrdersRef.current.size}`
        );

        if (isCached) {
          console.log(
            `✓✓✓ SKIPPING ALL API CALLS for closed position ${orderId} (using cached P&L) ✓✓✓`
          );
          setLoadingPnL((prev) => ({ ...prev, [orderId]: false }));
          return; // <<< EARLY RETURN - NO API CALLS AFTER THIS
        }
      }

      // If we reach here, it's either:
      // 1. An OPEN position (needs market depth every second)
      // 2. A CLOSED position being processed for the FIRST time (needs exit order once)
      console.log(
        `[P&L Calc] Proceeding with API calls for order ${orderId} (isExited=${isExited})`
      );

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

          // Fetch exit order only once
          console.log(`Fetching exit order for closed position ${orderId}`);
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

            // Mark this exit order as fetched
            fetchedExitOrdersRef.current.add(orderId);
            console.log(
              `✓ Cached exit order for ${orderId}. Cache now contains: [${Array.from(
                fetchedExitOrdersRef.current
              ).join(", ")}]`
            );
          } else {
            console.error(`No exit price found for closed position ${orderId}`);
          }
        } else {
          // OPEN POSITION: Calculate unrealized P&L using market depth
          console.log(
            `[Market Depth] Fetching live data for open position ${orderId}`
          );

          if (!order.symbol || !order.strike || !order.optionType) {
            console.warn(`Missing instrument details for order ${orderId}:`, {
              symbol: order.symbol,
              strike: order.strike,
              optionType: order.optionType,
              expiry: order.expiry,
            });
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
                `No valid current price for open position ${orderId}:`,
                { currentPrice, action }
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
   * Optimized: Skip if no open positions and all closed positions are cached
   */
  const calculatePnLForPositions = useCallback(
    async (orders: Order[]) => {
      // Filter for entered positions only
      const positions = orders.filter((order) => order.entered === true);

      // Separate open vs closed positions
      const openPositions = positions.filter((order) => order.exited !== true);
      const closedPositions = positions.filter(
        (order) => order.exited === true
      );

      // Filter out already-cached closed positions to avoid unnecessary function calls
      const uncachedClosedPositions = closedPositions.filter((order) => {
        const orderId = getOrderId(order);
        return orderId && !fetchedExitOrdersRef.current.has(orderId);
      });

      const cachedClosedCount =
        closedPositions.length - uncachedClosedPositions.length;

      console.log(
        `[P&L Batch] ${openPositions.length} open + ${uncachedClosedPositions.length} new closed (${cachedClosedCount} cached closed)`
      );

      // OPTIMIZATION: If no open positions and all closed are cached, skip entirely
      if (openPositions.length === 0 && uncachedClosedPositions.length === 0) {
        console.log(
          `[P&L Batch] ✓ No open positions, all closed cached - SKIPPING P&L calculation`
        );
        return;
      }

      // Only process: open positions + uncached closed positions
      const positionsToProcess = [...openPositions, ...uncachedClosedPositions];

      console.log(
        `[P&L Batch] Processing ${positionsToProcess.length} positions`
      );

      // Calculate P&L for positions that need processing
      await Promise.all(
        positionsToProcess.map((order) => calculatePnLForPosition(order))
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
    // Also clear from fetched exit orders ref
    fetchedExitOrdersRef.current.delete(orderId);
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
