import React, { memo } from "react";

const OrderRow = memo(({ order, liveDetails }) => {
  const orderId =
    order?.response?.data?.orderId || liveDetails?.exchangeOrderNumber;
  const orderStatus = liveDetails?.orderStatus || order.status || "UNKNOWN";

  // Determine if order is pending (not completed)
  const isPending = !order.entered && orderStatus !== "COMPLETE";

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
        {orderId || "N/A"}
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
            order.action === "BUY" || liveDetails?.transactionType === "BUY"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {order.action || liveDetails?.transactionType || "N/A"}
        </span>
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
        {order?.response?.data?.ordType ||
          liveDetails?.orderType ||
          order.orderType ||
          "N/A"}
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white font-semibold">
        {order?.response?.data?.qty ||
          liveDetails?.totalQuantity ||
          order.quantity ||
          "N/A"}
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white font-semibold">
        {order?.response?.data?.fQty || liveDetails?.fillQuantity || "0"}
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white font-semibold">
        {order?.response?.data?.lmPrc ||
          liveDetails?.limitPrice ||
          order.limitPrice ||
          "N/A"}
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-xs">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            orderStatus === "COMPLETE" || orderStatus === "EXECUTED"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : orderStatus === "REJECTED" || orderStatus === "CANCELLED"
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              : orderStatus === "PENDING" || orderStatus === "OPEN"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {orderStatus}
        </span>
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
        {liveDetails?.orderTime ||
          (order.placedTime
            ? new Date(order.placedTime).toLocaleString()
            : "N/A")}
      </td>
    </tr>
  );
});

OrderRow.displayName = "OrderRow";

export default OrderRow;
