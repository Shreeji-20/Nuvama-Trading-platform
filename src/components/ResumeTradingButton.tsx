import React from "react";
import { RotateCcw } from "lucide-react";

interface ResumeTradingButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const ResumeTradingButton: React.FC<ResumeTradingButtonProps> = ({
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
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }
      `}
    >
      <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-pulse" : ""}`} />
      <span>{loading ? "Resuming..." : "Resume Trading"}</span>
    </button>
  );
};

export default ResumeTradingButton;
