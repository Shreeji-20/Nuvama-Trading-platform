import React from "react";
import { TabContentProps } from "../types/deployedStrategies.types";
import PositionRow from "./DeployedStrategies/PositionRow";
import LiveIndicator from "./DeployedStrategies/LiveIndicator";
import { EmptyState } from "./DeployedStrategies/UIStates";

const OpenPositionsTab: React.FC<TabContentProps> = ({
  strategy,
  orders,
  loadingOrders,
  positionPnL,
  isRefreshing,
  onRefresh,
  onSquareOff,
}) => {
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
        message={loadingOrders ? "Loading positions..." : "No positions found"}
        description="Positions will appear here when orders are executed"
      />
    );
  }

  const allPositions = orders.filter((order) => order.entered === true);
  const openPositions = allPositions.filter((order) => order.exited !== true);
  const closedPositions = allPositions.filter((order) => order.exited === true);

  // Calculate total P&L
  let totalPnL = 0;
  allPositions.forEach((order) => {
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

  return (
    <div className="space-y-4">
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
              Total P&L: {totalPnL >= 0 ? "+" : ""}₹{totalPnL.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LiveIndicator />
          <button
            onClick={onRefresh}
            className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {allPositions.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No open positions
          </p>
        </div>
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
              {allPositions.map((order, idx) => {
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
