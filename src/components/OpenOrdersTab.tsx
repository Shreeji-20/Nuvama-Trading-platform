import React from "react";
import { TabContentProps } from "../types/deployedStrategies.types";
import LiveIndicator from "./DeployedStrategies/LiveIndicator";
import { EmptyState } from "./DeployedStrategies/UIStates";
import {
  isOrderCompletedOrFinished,
  isOrderRejected,
  isOrderComplete,
  isOrderPending,
} from "../constants/deployedStrategies.constants";

const OpenOrdersTab: React.FC<TabContentProps> = ({
  strategy,
  orders,
  loadingOrders,
  isRefreshing,
  onRefresh,
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        }
        message={loadingOrders ? "Loading orders..." : "No orders found"}
        description="Orders will appear here when placed"
      />
    );
  }

  const pendingOrders = orders.filter(
    (order) =>
      !isOrderCompletedOrFinished(
        order?.response?.data?.sts || order?.orderStatus
      )
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-md font-semibold text-gray-900 dark:text-white">
            Open Orders
          </h3>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium rounded">
            Total: {pendingOrders.length}
          </span>
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

      {pendingOrders.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No pending orders
          </p>
        </div>
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
              {pendingOrders.map((order, idx) => {
                const liveDetails = order;
                const status = (
                  liveDetails?.response?.data?.sts || "unknown"
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
                          order?.response?.data?.transactionType === "BUY"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {order.action ||
                          order?.response?.data?.transactionType ||
                          "N/A"}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                      <div className="flex flex-col">
                        <span>
                          {order?.response?.data?.qty ||
                            order.quantity ||
                            "N/A"}
                        </span>
                        {order?.response?.data?.fQty &&
                          order.response.data.fQty !== "0" && (
                            <span className="text-green-600 dark:text-green-400 font-semibold">
                              Filled: {order.response.data.fQty}
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                      <div className="flex flex-col">
                        <span>
                          ₹
                          {order?.response?.data?.prc ||
                            order.limitPrice ||
                            "0.00"}
                        </span>
                        {order?.response?.data?.fPrc &&
                          order.response.data.fPrc !== "0.00" && (
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">
                              Avg: ₹{order.response.data.fPrc}
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                      {order?.executionTime
                        ? new Date(order.executionTime).toLocaleString()
                        : order?.response?.data?.orderTime || "N/A"}
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
                      {order?.response?.data?.rejectionReason || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OpenOrdersTab;
