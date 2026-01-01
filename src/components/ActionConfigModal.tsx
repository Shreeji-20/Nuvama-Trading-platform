import React from "react";

/**
 * Reusable Action Configuration Modal
 * Used for onTargetAction, onStoplossAction, and onSquareOffAction
 * Used in both AdvancedOptionsBuilder and DeployedStrategies
 */

type ActionType = "NONE" | "REENTRY" | "REEXECUTE";

interface SLOrderAdjust {
  min_points: number | string;
  max_percentage: number | string;
}

interface ActionConfig {
  action_type: ActionType;
  action_count: number | string;
  order_at_broker: boolean;
  sl_order_adjust: SLOrderAdjust;
}

interface Leg {
  leg_id: string;
  on_target_action_config?: ActionConfig | null;
  on_stoploss_action_config?: ActionConfig | null;
  on_squareoff_action_config?: ActionConfig | null;
  [key: string]: any;
}

interface ActionConfigModalProps {
  leg: Leg | null;
  isOpen: boolean;
  onClose: () => void;
  onConfigChange: (field: string, value: any) => void;
  actionType: "target" | "stoploss" | "squareoff"; // Which action config to edit
}

const ActionConfigModal: React.FC<ActionConfigModalProps> = ({
  leg,
  isOpen,
  onClose,
  onConfigChange,
  actionType,
}) => {
  if (!isOpen || !leg) return null;

  // Get the config based on action type
  const getConfigKey = () => {
    switch (actionType) {
      case "target":
        return "on_target_action_config";
      case "stoploss":
        return "on_stoploss_action_config";
      case "squareoff":
        return "on_squareoff_action_config";
      default:
        return "on_target_action_config";
    }
  };

  const configKey = getConfigKey();

  // Ensure action config exists with defaults
  const config: ActionConfig = leg[configKey] || {
    action_type: "NONE",
    action_count: 1,
    order_at_broker: false,
    sl_order_adjust: {
      min_points: 0,
      max_percentage: 0,
    },
  };

  // Get display title based on action type
  const getTitle = () => {
    switch (actionType) {
      case "target":
        return "On Target Action";
      case "stoploss":
        return "On Stoploss Action";
      case "squareoff":
        return "On SquareOff Action";
      default:
        return "Action Configuration";
    }
  };

  // Handle close with validation
  const handleClose = () => {
    // Ensure action_count is at least 1 before closing
    const currentCount =
      typeof config.action_count === "string"
        ? parseInt(config.action_count)
        : config.action_count;

    if (!currentCount || currentCount <= 0) {
      onConfigChange("action_count", 1);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {getTitle()} - {leg.leg_id}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Action Type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Action Type
            </label>
            <select
              value={config.action_type}
              onChange={(e) =>
                onConfigChange("action_type", e.target.value as ActionType)
              }
              className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="NONE">NONE</option>
              <option value="REENTRY">REENTRY</option>
              <option value="REEXECUTE">REEXECUTE</option>
            </select>
          </div>

          {/* Action Count */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Action Count
            </label>
            <input
              type="number"
              value={config.action_count}
              onChange={(e) => {
                const value = e.target.value;
                const parsedValue = parseInt(value);

                // Allow empty string or parse to number
                // If parsed value is 0 or less, set to 1
                if (value === "") {
                  onConfigChange("action_count", "");
                } else if (parsedValue <= 0) {
                  onConfigChange("action_count", 1);
                } else {
                  onConfigChange("action_count", parsedValue || 1);
                }
              }}
              onBlur={(e) => {
                const value = e.target.value;
                const parsedValue = parseInt(value);

                // Default to 1 if empty, 0, or less than 0 on blur
                if (value === "" || parsedValue <= 0) {
                  onConfigChange("action_count", 1);
                }
              }}
              className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              min="1"
              placeholder="Enter action count (default: 1)"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Minimum value is 1. Defaults to 1 if empty or invalid.
            </p>
          </div>

          {/* Order At Broker */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.order_at_broker}
                onChange={(e) =>
                  onConfigChange("order_at_broker", e.target.checked)
                }
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Order At Broker
              </span>
            </label>
            <p className="mt-1 ml-6 text-xs text-gray-500 dark:text-gray-400">
              Execute this action through broker
            </p>
          </div>

          {/* SL Order Adjust */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">
              SL Order Adjustment
            </h4>

            {/* Min Points */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Points
              </label>
              <input
                type="number"
                step="0.01"
                value={config.sl_order_adjust?.min_points ?? 0}
                onChange={(e) => {
                  const value = e.target.value;
                  onConfigChange("sl_order_adjust", {
                    min_points: value === "" ? "" : parseFloat(value) || 0,
                    max_percentage: config.sl_order_adjust?.max_percentage ?? 0,
                  });
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    onConfigChange("sl_order_adjust", {
                      min_points: 0,
                      max_percentage:
                        config.sl_order_adjust?.max_percentage ?? 0,
                    });
                  }
                }}
                className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Enter minimum points"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Minimum points adjustment for SL trigger
              </p>
            </div>

            {/* Max Percentage */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Percentage
              </label>
              <input
                type="number"
                step="0.01"
                value={config.sl_order_adjust?.max_percentage ?? 0}
                onChange={(e) => {
                  const value = e.target.value;
                  onConfigChange("sl_order_adjust", {
                    min_points: config.sl_order_adjust?.min_points ?? 0,
                    max_percentage: value === "" ? "" : parseFloat(value) || 0,
                  });
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    onConfigChange("sl_order_adjust", {
                      min_points: config.sl_order_adjust?.min_points ?? 0,
                      max_percentage: 0,
                    });
                  }
                }}
                className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Enter maximum percentage"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Maximum percentage adjustment for SL trigger
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionConfigModal;
