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
    isTrading = false, // Global trading state
  }) => {
    return (
      <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
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
            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                {strategy.config?.baseConfig?.strategyName ||
                  strategy.strategyId}
              </h3>
              <p className="text-[0.65rem] sm:text-xs text-gray-600 dark:text-gray-400 truncate">
                ID: {strategy.strategyId.substring(0, 8)}... | Deployed:{" "}
                {new Date(strategy.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
              <div className="text-center min-w-[60px]">
                <div className="text-[0.65rem] sm:text-xs text-gray-500 dark:text-gray-400">
                  Symbols
                </div>
                <div className="text-[0.65rem] sm:text-xs font-semibold text-blue-600 dark:text-blue-400 truncate max-w-[80px]">
                  {strategy.symbols?.join(", ") || "N/A"}
                </div>
              </div>
              <div className="text-center min-w-[40px]">
                <div className="text-[0.65rem] sm:text-xs text-gray-500 dark:text-gray-400">
                  Legs
                </div>
                <div className="text-[0.65rem] sm:text-xs font-semibold text-green-600 dark:text-green-400">
                  {strategy.config?.legs?.length || 0}
                </div>
              </div>
              {!isExpanded && ordersSummary && (
                <>
                  <div className="text-center min-w-[60px]">
                    <div className="text-[0.65rem] sm:text-xs text-gray-500 dark:text-gray-400">
                      Open Positions
                    </div>
                    <div className="text-[0.65rem] sm:text-xs font-semibold text-green-600 dark:text-green-400">
                      {ordersSummary.openPositions || 0}
                    </div>
                  </div>
                  <div className="text-center min-w-[50px]">
                    <div className="text-[0.65rem] sm:text-xs text-gray-500 dark:text-gray-400">
                      Open Orders
                    </div>
                    <div className="text-[0.65rem] sm:text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {ordersSummary.openOrders || 0}
                    </div>
                  </div>
                  <div className="text-center min-w-[50px]">
                    <div className="text-[0.65rem] sm:text-xs text-gray-500 dark:text-gray-400">
                      Completed
                    </div>
                    <div className="text-[0.65rem] sm:text-xs font-semibold text-purple-600 dark:text-purple-400">
                      {ordersSummary.completedOrders || 0}
                    </div>
                  </div>
                  {ordersSummary.totalPnL !== undefined && (
                    <div className="text-center min-w-[60px]">
                      <div className="text-[0.65rem] sm:text-xs text-gray-500 dark:text-gray-400">
                        Total P&L
                      </div>
                      <div
                        className={`text-[0.65rem] sm:text-xs font-bold ${
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
              <div className="">
                <div className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded-lg">
                  <span className="text-[0.65rem] sm:text-xs font-semibold text-blue-700 dark:text-blue-300">
                    {strategy.config.baseConfig.strategyState}
                  </span>
                </div>
              </div>
            )}

            {/* Selected for Trading Checkbox */}
            <div className="">
              <label
                className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors ${
                  isTrading && // Only check state if global trading is active
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
                    isTrading && // Only disable if global trading is active
                    strategy.config?.baseConfig?.strategyState &&
                    strategy.config.baseConfig.strategyState !== "MONITORING" &&
                    strategy.config.baseConfig.strategyState !== "FINISHED" &&
                    strategy.config.baseConfig.strategyState !== "NONE"
                  }
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-600 dark:border-gray-500 disabled:cursor-not-allowed"
                />
                <span className="text-[0.65rem] sm:text-xs font-medium text-gray-700 dark:text-gray-300">
                  Selected
                </span>
              </label>
            </div>

            {/* Trading Status Buttons - Only show if selected for trading */}
            {isSelectedForTrading && (
              <div className="flex items-center gap-1 bg-white dark:bg-gray-700 rounded-lg p-1 sm:p-1.5 border border-gray-200 dark:border-gray-600">
                {strategyStatus === "paused" ? (
                  <button
                    onClick={() =>
                      onStrategyStatusChange?.(strategy.strategyId, "running")
                    }
                    className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[0.65rem] sm:text-xs font-medium bg-blue-500 text-white shadow-md hover:bg-blue-600 transition-all"
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
                    className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[0.65rem] sm:text-xs font-medium transition-all ${
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
                  className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-500 hover:bg-green-600 text-white text-[0.65rem] sm:text-xs font-medium rounded transition-colors"
                >
                  💾 <span className="hidden xs:inline">Save</span>
                </button>
                <button
                  onClick={onCancelEdit}
                  className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-500 hover:bg-gray-600 text-white text-[0.65rem] sm:text-xs font-medium rounded transition-colors"
                >
                  ✕ <span className="hidden xs:inline">Cancel</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onExportToExcel(strategy.strategyId)}
                  className="px-2 sm:px-3 py-0.5 sm:py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[0.65rem] sm:text-xs font-medium rounded transition-colors"
                  title="Export to Excel"
                >
                  📊 <span className="hidden xs:inline">Export</span>
                </button>
                <button
                  onClick={() => onCopyStrategy(strategy)}
                  className="px-2 sm:px-3 py-0.5 sm:py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-[0.65rem] sm:text-xs font-medium rounded transition-colors flex items-center gap-0.5 sm:gap-1"
                  title="Copy Strategy"
                >
                  <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="hidden xs:inline">Copy</span>
                </button>
                <button
                  onClick={() => onStartEdit(strategy)}
                  className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-500 hover:bg-blue-600 text-white text-[0.65rem] sm:text-xs font-medium rounded transition-colors"
                >
                  ✏️ <span className="hidden xs:inline">Edit</span>
                </button>
                <button
                  onClick={() => onDelete(strategy.strategyId)}
                  className="px-2 sm:px-3 py-0.5 sm:py-1 bg-red-500 hover:bg-red-600 text-white text-[0.65rem] sm:text-xs font-medium rounded transition-colors"
                >
                  🗑️ <span className="hidden xs:inline">Delete</span>
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
