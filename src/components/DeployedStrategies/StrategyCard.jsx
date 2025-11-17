import React, { memo } from "react";
import {
  Trash2,
  Edit2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Pause,
  RotateCcw,
} from "lucide-react";

const StrategyCard = memo(
  ({
    strategy,
    isExpanded,
    isEditing,
    onToggleExpand,
    onStartEdit,
    onDelete,
    onSave,
    onCancelEdit,
    ordersSummary,
    onExportToExcel,
    onCopyStrategy,
    strategyStatus = "stopped",
    onStrategyStatusChange,
    isSelectedForTrading = false,
    onToggleSelected,
  }) => {
    return (
      <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onToggleExpand(strategy.strategyId)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg
                className={`w-5 h-5 transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {strategy.config?.baseConfig?.strategyName ||
                  strategy.strategyId}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                ID: {strategy.strategyId} | Deployed:{" "}
                {new Date(strategy.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-4 mr-4">
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Symbols
                </div>
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {strategy.symbols?.join(", ") || "N/A"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Legs
                </div>
                <div className="text-xs font-semibold text-green-600 dark:text-green-400">
                  {strategy.config?.legs?.length || 0}
                </div>
              </div>
              {!isExpanded && ordersSummary && (
                <>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Open Positions
                    </div>
                    <div className="text-xs font-semibold text-green-600 dark:text-green-400">
                      {ordersSummary.openPositions || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Open Orders
                    </div>
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {ordersSummary.openOrders || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Completed
                    </div>
                    <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                      {ordersSummary.completedOrders || 0}
                    </div>
                  </div>
                  {ordersSummary.totalPnL !== undefined && (
                    <div className="text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Total P&L
                      </div>
                      <div
                        className={`text-xs font-bold ${
                          ordersSummary.totalPnL >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {ordersSummary.totalPnL >= 0 ? "+" : ""}₹
                        {ordersSummary.totalPnL.toFixed(2)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Strategy State Badge */}
            {strategy.config?.baseConfig?.strategyState && (
              <div className="mr-3">
                <div className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded-lg">
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                    {strategy.config.baseConfig.strategyState}
                  </span>
                </div>
              </div>
            )}

            {/* Selected for Trading Checkbox */}
            <div className="mr-3">
              <label
                className={`flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors ${
                  strategy.config?.baseConfig?.strategyState &&
                  strategy.config.baseConfig.strategyState !== "MONITORING" &&
                  strategy.config.baseConfig.strategyState !== "FINISHED" &&
                  strategy.config.baseConfig.strategyState !== "NONE"
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-650"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelectedForTrading}
                  onChange={onToggleSelected}
                  disabled={
                    strategy.config?.baseConfig?.strategyState &&
                    strategy.config.baseConfig.strategyState !== "MONITORING" &&
                    strategy.config.baseConfig.strategyState !== "FINISHED" &&
                    strategy.config.baseConfig.strategyState !== "NONE"
                  }
                  className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-600 dark:border-gray-500 disabled:cursor-not-allowed"
                />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Selected
                </span>
              </label>
            </div>

            {/* Trading Status Buttons - Only show if selected for trading */}
            {isSelectedForTrading && (
              <div className="flex items-center gap-1 mr-3 bg-white dark:bg-gray-700 rounded-lg p-1.5 border border-gray-200 dark:border-gray-600">
                {strategyStatus === "paused" ? (
                  <button
                    onClick={() =>
                      onStrategyStatusChange?.(strategy.strategyId, "running")
                    }
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white shadow-md hover:bg-blue-600 transition-all"
                    title="Resume Trading"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span className="hidden sm:inline">Resume</span>
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      onStrategyStatusChange?.(strategy.strategyId, "paused")
                    }
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                      strategyStatus === "paused"
                        ? "bg-yellow-500 text-white shadow-md"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                    title="Pause Trading"
                  >
                    <Pause className="w-3 h-3" />
                    <span className="hidden sm:inline">Pause</span>
                  </button>
                )}
              </div>
            )}

            {isEditing ? (
              <>
                <button
                  onClick={() => onSave(strategy.strategyId)}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded transition-colors"
                >
                  💾 Save
                </button>
                <button
                  onClick={onCancelEdit}
                  className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium rounded transition-colors"
                >
                  ✕ Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onExportToExcel(strategy.strategyId)}
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded transition-colors"
                  title="Export to Excel"
                >
                  📊 Export
                </button>
                <button
                  onClick={() => onCopyStrategy(strategy)}
                  className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium rounded transition-colors flex items-center gap-1"
                  title="Copy Strategy"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
                <button
                  onClick={() => onStartEdit(strategy)}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => onDelete(strategy.strategyId)}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded transition-colors"
                >
                  🗑️ Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);

StrategyCard.displayName = "StrategyCard";

export default StrategyCard;
