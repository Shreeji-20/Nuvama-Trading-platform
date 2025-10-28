import React from "react";
import { StrategyHeaderProps } from "../types/deployedStrategies.types";

const StrategyHeader: React.FC<StrategyHeaderProps> = ({
  strategiesCount,
  onRefresh,
  loading = false,
}) => {
  return (
    <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-lg border border-light-border dark:border-dark-border p-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm md:text-md font-bold text-gray-900 dark:text-white">
            Deployed Strategies
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            View and manage all deployed strategy configurations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-xs font-medium rounded-lg transition-colors"
          >
            {loading ? "⏳ Refreshing..." : "🔄 Refresh"}
          </button>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Total Strategies
            </div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {strategiesCount}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyHeader;
