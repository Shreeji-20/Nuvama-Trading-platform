import React, { useState, useMemo } from "react";
import { TabContentProps } from "../types/deployedStrategies.types";
import PositionRow from "./DeployedStrategies/PositionRow";
import LiveIndicator from "./DeployedStrategies/LiveIndicator";
import { EmptyState } from "./DeployedStrategies/UIStates";

const OpenPositionsTab: React.FC<TabContentProps> = ({
  strategy,
  orders,
  positionPnL,
  isRefreshing,
  onRefresh,
  onSquareOff,
}) => {
  const [filters, setFilters] = useState({
    userId: "",
    orderId: "",
    legId: "",
    symbol: "",
    strike: "",
    optionType: "",
    action: "",
    quantity: "",
    entryPrice: "",
    currentPrice: "",
    pnl: "",
    status: "",
  });

  const [timeSortOrder, setTimeSortOrder] = useState<"asc" | "desc" | null>(
    null
  );

  const handleFilterChange = (column: string, value: string) => {
    setFilters((prev) => ({ ...prev, [column]: value }));
  };

  const handleTimeSort = (order: "asc" | "desc") => {
    setTimeSortOrder(order);
  };

  const clearFilters = () => {
    setFilters({
      userId: "",
      orderId: "",
      legId: "",
      symbol: "",
      strike: "",
      optionType: "",
      action: "",
      quantity: "",
      entryPrice: "",
      currentPrice: "",
      pnl: "",
      status: "",
    });
    setTimeSortOrder(null);
  };

  // Process orders data
  const allPositions = orders
    ? orders.filter((order) => order.entered === true)
    : [];
  const openPositions = allPositions.filter((order) => order.exited !== true);
  const closedPositions = allPositions.filter((order) => order.exited === true);

  // Filter the positions based on filter criteria
  const filteredPositions = useMemo(() => {
    let result = allPositions.filter((order) => {
      const orderId =
        order?.response?.data?.oID ||
        order?.response?.data?.oid ||
        order?.orderId ||
        order?.liveDetails?.exchangeOrderNumber ||
        "";

      const pnlData = orderId ? positionPnL[orderId] : undefined;
      const currentPrice =
        pnlData?.currentPrice || order?.response?.data?.ltp || "";
      const pnl = pnlData?.pnl || "0";
      const status = order.exited ? "CLOSED" : "OPEN";
      const userId = order?.userId || "";
      const legId = order?.legId || "";
      const symbol = order?.symbol || "";
      const strike = order?.strike || "";
      const optionType = order?.optionType || "";
      const action =
        order?.action || order?.response?.data?.transactionType || "";
      const quantity = order?.quantity || order?.response?.data?.qty || "";
      const entryPrice = order?.response?.data?.fPrc || order?.limitPrice || "";

      return (
        userId
          .toString()
          .toLowerCase()
          .includes(filters.userId.toLowerCase()) &&
        orderId
          .toString()
          .toLowerCase()
          .includes(filters.orderId.toLowerCase()) &&
        legId.toString().toLowerCase().includes(filters.legId.toLowerCase()) &&
        symbol
          .toString()
          .toLowerCase()
          .includes(filters.symbol.toLowerCase()) &&
        strike
          .toString()
          .toLowerCase()
          .includes(filters.strike.toLowerCase()) &&
        optionType
          .toString()
          .toLowerCase()
          .includes(filters.optionType.toLowerCase()) &&
        action
          .toString()
          .toLowerCase()
          .includes(filters.action.toLowerCase()) &&
        quantity
          .toString()
          .toLowerCase()
          .includes(filters.quantity.toLowerCase()) &&
        entryPrice
          .toString()
          .toLowerCase()
          .includes(filters.entryPrice.toLowerCase()) &&
        currentPrice
          .toString()
          .toLowerCase()
          .includes(filters.currentPrice.toLowerCase()) &&
        pnl.toString().toLowerCase().includes(filters.pnl.toLowerCase()) &&
        status.toString().toLowerCase().includes(filters.status.toLowerCase())
      );
    });

    // Apply time sorting if selected
    if (timeSortOrder) {
      result = [...result].sort((a, b) => {
        const timeA = a?.executionTime
          ? new Date(a.executionTime).getTime()
          : a?.response?.data?.orderTime
          ? new Date(a.response.data.orderTime).getTime()
          : 0;
        const timeB = b?.executionTime
          ? new Date(b.executionTime).getTime()
          : b?.response?.data?.orderTime
          ? new Date(b.response.data.orderTime).getTime()
          : 0;

        return timeSortOrder === "asc" ? timeA - timeB : timeB - timeA;
      });
    }

    return result;
  }, [allPositions, filters, positionPnL, timeSortOrder]);

  const filteredOpenPositions = filteredPositions.filter(
    (order) => order.exited !== true
  );
  const filteredClosedPositions = filteredPositions.filter(
    (order) => order.exited === true
  );

  // Calculate total P&L
  let totalPnL = 0;
  filteredPositions.forEach((order) => {
    const orderId =
      order?.response?.data?.oID ||
      order?.response?.data?.oid ||
      order?.orderId ||
      order?.liveDetails?.exchangeOrderNumber;
    if (orderId && positionPnL[orderId]) {
      const pnl = parseFloat(positionPnL[orderId].pnl);
      if (!isNaN(pnl)) {
        totalPnL += pnl;
      }
    }
  });

  const hasActiveFilters =
    Object.values(filters).some((filter) => filter !== "") ||
    timeSortOrder !== null;

  // Early return check after all hooks
  if (orders === null || orders === undefined) {
    return (
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
        message="No positions found"
        description="Positions will appear here when orders are executed"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-md font-semibold text-gray-900 dark:text-white">
            Open Positions
          </h3>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
              Open: {filteredOpenPositions.length}
            </span>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs font-medium">
              Closed: {filteredClosedPositions.length}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold ${
                totalPnL >= 0
                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                  : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
              }`}
            >
              Total P&L: {totalPnL >= 0 ? "+" : ""}₹{totalPnL.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}
          <LiveIndicator />
          <button
            onClick={onRefresh}
            className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {filteredPositions.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {hasActiveFilters
              ? "No positions match the current filters"
              : "No open positions"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  User ID
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={filters.userId}
                    onChange={(e) =>
                      handleFilterChange("userId", e.target.value)
                    }
                    className="mt-1 block w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Square-off
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Order ID
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={filters.orderId}
                    onChange={(e) =>
                      handleFilterChange("orderId", e.target.value)
                    }
                    className="mt-1 block w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Leg ID
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={filters.legId}
                    onChange={(e) =>
                      handleFilterChange("legId", e.target.value)
                    }
                    className="mt-1 block w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Symbol
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={filters.symbol}
                    onChange={(e) =>
                      handleFilterChange("symbol", e.target.value)
                    }
                    className="mt-1 block w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Strike
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={filters.strike}
                    onChange={(e) =>
                      handleFilterChange("strike", e.target.value)
                    }
                    className="mt-1 block w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Option Type
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={filters.optionType}
                    onChange={(e) =>
                      handleFilterChange("optionType", e.target.value)
                    }
                    className="mt-1 block w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Action
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={filters.action}
                    onChange={(e) =>
                      handleFilterChange("action", e.target.value)
                    }
                    className="mt-1 block w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Quantity
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={filters.quantity}
                    onChange={(e) =>
                      handleFilterChange("quantity", e.target.value)
                    }
                    className="mt-1 block w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Entry Price
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={filters.entryPrice}
                    onChange={(e) =>
                      handleFilterChange("entryPrice", e.target.value)
                    }
                    className="mt-1 block w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Current/Exit Price
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={filters.currentPrice}
                    onChange={(e) =>
                      handleFilterChange("currentPrice", e.target.value)
                    }
                    className="mt-1 block w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  P&L
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={filters.pnl}
                    onChange={(e) => handleFilterChange("pnl", e.target.value)}
                    className="mt-1 block w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Entry Time
                  <div className="mt-1 flex gap-1">
                    <button
                      onClick={() => handleTimeSort("asc")}
                      className={`flex-1 px-2 py-1 text-xs border rounded ${
                        timeSortOrder === "asc"
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      } hover:bg-blue-400 hover:text-white transition-colors`}
                      title="Sort Ascending"
                    >
                      ↑ Asc
                    </button>
                    <button
                      onClick={() => handleTimeSort("desc")}
                      className={`flex-1 px-2 py-1 text-xs border rounded ${
                        timeSortOrder === "desc"
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      } hover:bg-blue-400 hover:text-white transition-colors`}
                      title="Sort Descending"
                    >
                      ↓ Desc
                    </button>
                  </div>
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Status
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="mt-1 block w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPositions.map((order, idx) => {
                const liveDetails = order;
                const isExited = order.exited === true;
                const orderId =
                  order?.response?.data?.oID ||
                  order?.response?.data?.oid ||
                  order?.orderId ||
                  liveDetails?.exchangeOrderNumber;
                const pnlData = orderId ? positionPnL[orderId] : undefined;

                return (
                  <PositionRow
                    key={`${orderId}-${idx}`}
                    order={order}
                    liveDetails={liveDetails}
                    pnlData={pnlData}
                    isExited={isExited}
                    onSquareOff={onSquareOff || (() => {})}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OpenPositionsTab;
