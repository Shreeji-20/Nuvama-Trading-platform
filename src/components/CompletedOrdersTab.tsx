import React, { useState, useMemo } from "react";
import { TabContentProps } from "../types/deployedStrategies.types";
import LiveIndicator from "./DeployedStrategies/LiveIndicator";
import { EmptyState } from "./DeployedStrategies/UIStates";
import {
  isOrderCompletedOrFinished,
  isOrderRejected,
  isOrderCancelled,
  isOrderComplete,
} from "../constants/deployedStrategies.constants";

const CompletedOrdersTab: React.FC<TabContentProps> = ({
  strategy,
  orders,
  isRefreshing,
  onRefresh,
}) => {
  const [filters, setFilters] = useState({
    orderId: "",
    legId: "",
    symbol: "",
    strike: "",
    action: "",
    fillQty: "",
    avgPrice: "",
    status: "",
    rejectionReason: "",
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
      orderId: "",
      legId: "",
      symbol: "",
      strike: "",
      action: "",
      fillQty: "",
      avgPrice: "",
      status: "",
      rejectionReason: "",
    });
    setTimeSortOrder(null);
  };

  const completedOrders = orders
    ? orders.filter((order) =>
        isOrderCompletedOrFinished(
          order?.response?.data?.sts || order.orderStatus
        )
      )
    : [];

  // Filter the completed orders based on filter criteria
  const filteredOrders = useMemo(() => {
    let result = completedOrders.filter((order) => {
      const orderId = order.orderId || order?.response?.data?.oID || "";
      const legId = order.legId || "";
      const symbol = order.symbol || "";
      const strike = order.strike || "";
      const action =
        order.action || order?.response?.data?.transactionType || "";
      const fillQty =
        order?.response?.data?.fQty ||
        order?.response?.data?.qty ||
        order.quantity ||
        "";
      const avgPrice =
        order?.response?.data?.fPrc && order.response.data.fPrc !== "0.00"
          ? order.response.data.fPrc
          : order.limitPrice || "";
      const status = (
        order?.response?.data?.sts ||
        order.orderStatus ||
        "UNKNOWN"
      ).toUpperCase();
      const rejectionReason = order?.response?.data?.rejectionReason || "";

      return (
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
        action
          .toString()
          .toLowerCase()
          .includes(filters.action.toLowerCase()) &&
        fillQty
          .toString()
          .toLowerCase()
          .includes(filters.fillQty.toLowerCase()) &&
        avgPrice
          .toString()
          .toLowerCase()
          .includes(filters.avgPrice.toLowerCase()) &&
        status
          .toString()
          .toLowerCase()
          .includes(filters.status.toLowerCase()) &&
        rejectionReason
          .toString()
          .toLowerCase()
          .includes(filters.rejectionReason.toLowerCase())
      );
    });

    // Apply time sorting if selected
    if (timeSortOrder) {
      result = [...result].sort((a, b) => {
        const timeA = a?.executionTime
          ? new Date(a.executionTime).getTime()
          : a?.response?.data?.executionTime
          ? new Date(a.response.data.executionTime).getTime()
          : a?.response?.data?.orderTime
          ? new Date(a.response.data.orderTime).getTime()
          : 0;
        const timeB = b?.executionTime
          ? new Date(b.executionTime).getTime()
          : b?.response?.data?.executionTime
          ? new Date(b.response.data.executionTime).getTime()
          : b?.response?.data?.orderTime
          ? new Date(b.response.data.orderTime).getTime()
          : 0;

        return timeSortOrder === "asc" ? timeA - timeB : timeB - timeA;
      });
    }

    return result;
  }, [completedOrders, filters, timeSortOrder]);

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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        message="No completed orders"
        description="Order history will appear here"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-md font-semibold text-gray-900 dark:text-white">
            Completed Orders
          </h3>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs font-medium rounded">
            Total: {filteredOrders.length}
          </span>
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

      {filteredOrders.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {hasActiveFilters
              ? "No orders match the current filters"
              : "No completed orders yet"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Fill Qty
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={filters.fillQty}
                    onChange={(e) =>
                      handleFilterChange("fillQty", e.target.value)
                    }
                    className="mt-1 block w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Avg Fill Price
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={filters.avgPrice}
                    onChange={(e) =>
                      handleFilterChange("avgPrice", e.target.value)
                    }
                    className="mt-1 block w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Order Time
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
                  Rejection Reason
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={filters.rejectionReason}
                    onChange={(e) =>
                      handleFilterChange("rejectionReason", e.target.value)
                    }
                    className="mt-1 block w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.map((order, idx) => {
                const status = (
                  order?.response?.data?.sts ||
                  order.orderStatus ||
                  "UNKNOWN"
                ).toUpperCase();

                return (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                      {order.orderId || order?.response?.data?.oID || "N/A"}
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
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white font-semibold">
                      {order?.response?.data?.fQty ||
                        order?.response?.data?.qty ||
                        order.quantity ||
                        "N/A"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white font-semibold">
                      {order?.response?.data?.fPrc &&
                      order.response.data.fPrc !== "0.00"
                        ? `₹${order.response.data.fPrc}`
                        : order.limitPrice
                        ? `₹${order.limitPrice}`
                        : "N/A"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                      {order?.executionTime
                        ? new Date(order.executionTime).toLocaleString()
                        : order?.response?.data?.executionTime
                        ? new Date(
                            order.response.data.executionTime
                          ).toLocaleString()
                        : order?.response?.data?.orderTime || "N/A"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          isOrderRejected(status)
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : isOrderCancelled(status)
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }`}
                      >
                        {isOrderRejected(status)
                          ? "REJECTED"
                          : isOrderCancelled(status)
                          ? "CANCELLED"
                          : isOrderComplete(status)
                          ? "COMPLETE"
                          : status}
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

export default CompletedOrdersTab;
