import React from "react";
import { Square } from "lucide-react";

interface StopTradingButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const StopTradingButton: React.FC<StopTradingButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-xs
        transition-all duration-200 shadow-md hover:shadow-lg
        ${
          disabled || loading
            ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            : "bg-red-500 hover:bg-red-600 text-white"
        }
      `}
    >
      <Square className={`w-3.5 h-3.5 ${loading ? "animate-pulse" : ""}`} />
      <span>{loading ? "Stopping..." : "Stop Trading"}</span>
    </button>
  );
};

export default StopTradingButton;
