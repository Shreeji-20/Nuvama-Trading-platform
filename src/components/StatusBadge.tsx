import React from "react";

/**
 * Reusable Status Badge Component
 * Used for displaying various status types with appropriate colors
 */

type StatusType =
  | "order-status"
  | "action"
  | "execution-mode"
  | "pnl"
  | "position-status";

interface StatusBadgeProps {
  type: StatusType;
  value: string | number;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  value,
  className = "",
}) => {
  const getColorClasses = (): string => {
    switch (type) {
      case "order-status":
        const upperStatus = String(value)?.toUpperCase();
        if (
          ["COMPLETE", "COMPLETED", "EXECUTED", "FILLED"].includes(upperStatus)
        ) {
          return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        } else if (["REJECTED", "REJECT"].includes(upperStatus)) {
          return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        } else if (
          ["CANCELLED", "CANCELED", "CANCELLED_BY_USER", "CANCEL"].includes(
            upperStatus
          )
        ) {
          return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
        } else if (
          ["PENDING", "OPEN", "NEW", "ACCEPTED", "TRIGGER_PENDING"].includes(
            upperStatus
          )
        ) {
          return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
        }
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";

      case "action":
        if (value === "BUY") {
          return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        } else if (value === "SELL") {
          return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        }
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";

      case "execution-mode":
        if (value === "Live Mode") {
          return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        } else if (value === "Simulation Mode") {
          return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        }
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";

      case "pnl":
        const pnlValue = parseFloat(String(value));
        if (pnlValue >= 0) {
          return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        }
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";

      case "position-status":
        if (value === "Open") {
          return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        } else if (value === "Closed") {
          return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
        }
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";

      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${getColorClasses()} ${className}`}
    >
      {value}
    </span>
  );
};

export default StatusBadge;
