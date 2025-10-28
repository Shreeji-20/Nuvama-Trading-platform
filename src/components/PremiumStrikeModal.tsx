import React from "react";

/**
 * Reusable Premium Based Strike Configuration Modal
 * Used in both AdvancedOptionsBuilder and DeployedStrategies
 */

type StrikeType = "NearestPremium" | "premium";
type SearchSide = "ITM" | "OTM" | "BOTH";
type Condition = "Greaterthanequal" | "lessthanequal";

interface PremiumBasedStrikeConfig {
  strikeType: StrikeType;
  maxDepth: number | string;
  searchSide: SearchSide;
  value: number | string;
  condition: Condition;
  between: number | string;
  and: number | string;
}

interface Leg {
  legId: string;
  premiumBasedStrikeConfig?: PremiumBasedStrikeConfig;
  [key: string]: any;
}

interface PremiumStrikeModalProps {
  leg: Leg | null;
  isOpen: boolean;
  onClose: () => void;
  onConfigChange: (field: string, value: any) => void;
}

const PremiumStrikeModal: React.FC<PremiumStrikeModalProps> = ({
  leg,
  isOpen,
  onClose,
  onConfigChange,
}) => {
  if (!isOpen || !leg) return null;

  // Ensure premiumBasedStrikeConfig exists with defaults
  const config: PremiumBasedStrikeConfig = leg.premiumBasedStrikeConfig || {
    strikeType: "NearestPremium",
    maxDepth: 5,
    searchSide: "BOTH",
    value: 0,
    condition: "Greaterthanequal",
    between: 0,
    and: 0,
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Premium Based Strike - {leg.legId}
          </h3>
          <button
            onClick={onClose}
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
          {/* Strike Type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Strike Type
            </label>
            <select
              value={config.strikeType}
              onChange={(e) => onConfigChange("strikeType", e.target.value)}
              className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="NearestPremium">Nearest Premium</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          {/* Max Depth */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Depth
            </label>
            <input
              type="number"
              value={config.maxDepth}
              onChange={(e) => {
                const value = e.target.value;
                // Prevent negative sign but allow empty
                if (value !== "-") {
                  onConfigChange(
                    "maxDepth",
                    value === "" ? "" : parseInt(value) || 0
                  );
                }
              }}
              onBlur={(e) => {
                const value = e.target.value;
                if (value === "") {
                  onConfigChange("maxDepth", 0);
                }
              }}
              className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              min="0"
              placeholder="Enter value"
            />
          </div>

          {/* Search Side */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search Side
            </label>
            <select
              value={config.searchSide}
              onChange={(e) => onConfigChange("searchSide", e.target.value)}
              className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="ITM">ITM</option>
              <option value="OTM">OTM</option>
              <option value="BOTH">BOTH</option>
            </select>
          </div>

          {/* Conditional Fields based on Strike Type */}
          {config.strikeType === "NearestPremium" ? (
            <>
              {/* Value */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Value
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={config.value}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Prevent negative sign but allow empty
                    if (value !== "-") {
                      onConfigChange(
                        "value",
                        value === "" ? "" : parseFloat(value) || 0
                      );
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      onConfigChange("value", 0);
                    }
                  }}
                  className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  min="0"
                  placeholder="Enter value"
                />
              </div>

              {/* Condition */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Condition
                </label>
                <select
                  value={config.condition}
                  onChange={(e) => onConfigChange("condition", e.target.value)}
                  className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Greaterthanequal">
                    Greater Than or Equal (≥)
                  </option>
                  <option value="lessthanequal">Less Than or Equal (≤)</option>
                </select>
              </div>
            </>
          ) : (
            <>
              {/* Between */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Between
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={config.between}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Prevent negative sign but allow empty
                    if (value !== "-") {
                      onConfigChange(
                        "between",
                        value === "" ? "" : parseFloat(value) || 0
                      );
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      onConfigChange("between", 0);
                    }
                  }}
                  className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  min="0"
                  placeholder="Enter value"
                />
              </div>

              {/* And */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  And
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={config.and}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Prevent negative sign but allow empty
                    if (value !== "-") {
                      onConfigChange(
                        "and",
                        value === "" ? "" : parseFloat(value) || 0
                      );
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      onConfigChange("and", 0);
                    }
                  }}
                  className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  min="0"
                  placeholder="Enter value"
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumStrikeModal;
