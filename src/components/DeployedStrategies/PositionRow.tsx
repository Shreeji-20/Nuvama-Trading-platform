import React, { memo } from "react";
import squareOffIcon from "../../assets/squareofficon.png";
import { Order, PositionPnLData } from "../../types/deployedStrategies.types";

interface PositionRowProps {
  order: Order;
  liveDetails: Order;
  pnlData?: PositionPnLData;
  isExited: boolean;
  onSquareOff: (order: Order) => void;
}

const PositionRow = memo<PositionRowProps>(
  ({ order, liveDetails, pnlData, isExited, onSquareOff }) => {
    // Use the same orderId logic as in calculateSinglePositionPnL
    const orderId =
      order?.response?.data?.oID ||
      order?.response?.data?.oid ||
      order?.orderId ||
      liveDetails?.exchangeOrderNumber;
    const userId = order?.userId || "N/A";

    return (
      <tr
        className={`${
          isExited
            ? "bg-gray-50 dark:bg-gray-800 opacity-60"
            : "hover:bg-gray-50 dark:hover:bg-gray-800"
        }`}
      >
        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white font-medium text-center">
          {userId}
        </td>
        <td className="px-3 py-2 whitespace-nowrap text-xs text-center">
          {!isExited && (
            <button
              onClick={() => onSquareOff(order)}
              className="p-1 hover:opacity-70 transition-opacity inline-flex items-center justify-center"
              title="Square Off Position"
            >
              <img src={squareOffIcon} alt="Square Off" className="w-5 h-5" />
            </button>
          )}
        </td>
        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white text-center">
          {orderId || "N/A"}
        </td>
        <td className="px-3 py-2 text-xs text-center">
          <div className="flex flex-col items-center justify-center">
            <span className="text-gray-900 dark:text-white">
              {order.legId || "N/A"}
            </span>
            {order.isHedge === true && (
              <span className="mt-0.5 px-1.5 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded text-[9px] font-semibold uppercase leading-tight">
                Hedge
              </span>
            )}
          </div>
        </td>
        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white text-center">
          {order.symbol || "N/A"}
        </td>
        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white text-center">
          {order.strike || "N/A"}
        </td>
        <td className="px-3 py-2 whitespace-nowrap text-xs text-center">
          <span
            className={`px-2 py-1 rounded-full ${
              order.action === "BUY" ||
              order?.response?.data?.transactionType === "BUY"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {order.action || order?.response?.data?.transactionType || "N/A"}
          </span>
        </td>
        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white font-semibold text-center">
          {order?.response?.data?.fQty ||
            order?.response?.data?.qty ||
            order.quantity ||
            "N/A"}
        </td>
        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white font-semibold text-center">
          {pnlData
            ? `₹${pnlData.entryPrice}`
            : order.fPrc
            ? `₹${parseFloat(order.fPrc).toFixed(2)}`
            : order?.response?.data?.fPrc && order.response.data.fPrc !== "0.00"
            ? `₹${order.response.data.fPrc}`
            : order.limitPrice
            ? `₹${order.limitPrice}`
            : "N/A"}
        </td>
        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white font-semibold text-center">
          {pnlData ? (
            isExited ? (
              `₹${pnlData.exitPrice}`
            ) : (
              `₹${pnlData.currentPrice}`
            )
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>
        <td
          className={`px-3 py-2 whitespace-nowrap text-xs font-bold text-center ${
            pnlData && parseFloat(pnlData.pnl) >= 0
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {pnlData ? (
            <span
              className={`${
                parseFloat(pnlData.pnl) >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {parseFloat(pnlData.pnl) >= 0 ? "+" : ""}₹{pnlData.pnl}
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>
        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white text-center">
          {order?.executionTime
            ? new Date(order.executionTime).toLocaleString()
            : order?.response?.data?.orderTime ||
              order?.response?.data?.executionTime ||
              "N/A"}
        </td>
        <td className="px-3 py-2 whitespace-nowrap text-xs text-center">
          <span
            className={`px-2 py-1 rounded-full ${
              isExited
                ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            }`}
          >
            {isExited ? "Closed" : "Open"}
          </span>
        </td>
      </tr>
    );
  }
);

PositionRow.displayName = "PositionRow";

export default PositionRow;
