import React, { memo } from "react";
import { Trash2, Edit2, ChevronDown, ChevronUp } from "lucide-react";

const StrategyCard = memo(
  ({
    strategy,
    isExpanded,
    isEditing,
    onToggleExpand,
    onStartEdit,
    onDelete,
  }) => {
    return (
      <div
        className={`bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-lg border border-light-border dark:border-dark-border transition-all duration-300 ${
          isExpanded ? "ring-2 ring-blue-500" : ""
        }`}
      >
        {/* Strategy Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {strategy.strategyName}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    strategy.status === "active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {strategy.status}
                </span>
                {strategy.strategyTag && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {strategy.strategyTag}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>ID: {strategy.strategyId}</span>
                <span>•</span>
                <span>Symbol: {strategy.symbol}</span>
                <span>•</span>
                <span>Type: {strategy.strategyType}</span>
                <span>•</span>
                <span>Legs: {strategy.legs?.length || 0}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {!isEditing && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartEdit(strategy);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Edit Strategy"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(strategy.strategyId);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete Strategy"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => onToggleExpand(strategy.strategyId)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

StrategyCard.displayName = "StrategyCard";

export default StrategyCard;
