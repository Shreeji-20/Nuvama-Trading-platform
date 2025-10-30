import React from "react";
import { DynamicHedgeSettings, HedgeType, Leg } from "../types/strategy.types";

interface DynamicHedgeTabProps {
  dynamicHedgeSettings: DynamicHedgeSettings;
  legs?: Record<string, Leg>; // Optional legs dict to get symbols
  isEditing?: boolean;
  onChange?: (field: string, value: any) => void;
  hedgeTypeOptions?: HedgeType[];
}

const DynamicHedgeTab: React.FC<DynamicHedgeTabProps> = ({
  dynamicHedgeSettings,
  legs = {},
  isEditing = false,
  onChange,
  hedgeTypeOptions = ["premium Based", "fixed Distance"],
}) => {
  const handleChange = (field: string, value: any): void => {
    if (onChange) {
      onChange(field, value);
    }
  };

  // Extract unique symbols from legs
  const uniqueSymbols = React.useMemo(() => {
    const symbols = Object.values(legs).map((leg) => leg.symbol);
    return Array.from(new Set(symbols));
  }, [legs]);

  // Default strike steps per symbol
  const defaultStrikeSteps: Record<string, number> = {
    NIFTY: 50,
    SENSEX: 100,
    BANKNIFTY: 100,
  };

  // Get strike steps value for a symbol
  const getStrikeStepsForSymbol = (symbol: string): number | string => {
    return (
      dynamicHedgeSettings.strikeSteps?.[symbol] ??
      defaultStrikeSteps[symbol] ??
      50
    );
  };

  // Update strike steps for a specific symbol
  const handleSymbolStrikeStepsChange = (symbol: string, value: any): void => {
    const currentStrikeSteps: Record<string, number> = {
      ...(dynamicHedgeSettings.strikeSteps || {}),
    };

    // Update the specific symbol
    currentStrikeSteps[symbol] = value;

    handleChange("strikeSteps", currentStrikeSteps);
  };

  // Handle blur to set default if empty
  const handleSymbolStrikeStepsBlur = (symbol: string, value: any): void => {
    if (value === "" || value === "-") {
      handleSymbolStrikeStepsChange(symbol, defaultStrikeSteps[symbol] ?? 50);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-md font-semibold text-gray-900 dark:text-white">
        Dynamic Hedge Settings
      </h3>

      {/* Grid layout for 2 cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Hedge Parameters */}
        <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h4 className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
              Hedge Parameters
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-center p-2 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                    Parameter
                  </th>
                  <th className="text-center p-2 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-600">
                  <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
                    Hedge Type
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <select
                        value={
                          dynamicHedgeSettings.hedgeType || "premium Based"
                        }
                        onChange={(e) =>
                          handleChange("hedgeType", e.target.value)
                        }
                        className="w-full text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        {hedgeTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                        {dynamicHedgeSettings.hedgeType || "N/A"}
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-600">
                  <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
                    Min Hedge Distance
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={dynamicHedgeSettings.minHedgeDistance ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleChange(
                            "minHedgeDistance",
                            value === "" || value === "-"
                              ? value
                              : parseInt(value) || 0
                          );
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value === "" || value === "-") {
                            handleChange("minHedgeDistance", 0);
                          }
                        }}
                        className="w-24 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 mx-auto"
                        placeholder="Min distance"
                      />
                    ) : (
                      <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                        {dynamicHedgeSettings.minHedgeDistance ?? "N/A"}
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-600">
                  <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
                    Max Hedge Distance
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={dynamicHedgeSettings.maxHedgeDistance ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleChange(
                            "maxHedgeDistance",
                            value === "" || value === "-"
                              ? value
                              : parseInt(value) || 0
                          );
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value === "" || value === "-") {
                            handleChange("maxHedgeDistance", 0);
                          }
                        }}
                        className="w-24 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 mx-auto"
                        placeholder="Max distance"
                      />
                    ) : (
                      <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                        {dynamicHedgeSettings.maxHedgeDistance ?? "N/A"}
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-600">
                  <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
                    Min Premium
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={dynamicHedgeSettings.minPremium ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleChange(
                            "minPremium",
                            value === "" || value === "-"
                              ? value
                              : parseFloat(value) || 0.0
                          );
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value === "" || value === "-") {
                            handleChange("minPremium", 0.0);
                          }
                        }}
                        className="w-24 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 mx-auto"
                        placeholder="Min premium"
                      />
                    ) : (
                      <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                        {dynamicHedgeSettings.minPremium ?? "N/A"}
                      </div>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
                    Max Premium
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={dynamicHedgeSettings.maxPremium ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleChange(
                            "maxPremium",
                            value === "" || value === "-"
                              ? value
                              : parseFloat(value) || 0.0
                          );
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value === "" || value === "-") {
                            handleChange("maxPremium", 0.0);
                          }
                        }}
                        className="w-24 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 mx-auto"
                        placeholder="Max premium"
                      />
                    ) : (
                      <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                        {dynamicHedgeSettings.maxPremium ?? "N/A"}
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 2: Strike Configuration */}
        <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h4 className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
              Strike Configuration
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full max-w-md mx-auto">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-center p-3 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                    Parameter
                  </th>
                  <th className="text-center p-3 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Strike Steps - Per Symbol */}
                {uniqueSymbols.map((symbol) => (
                  <tr
                    key={symbol}
                    className="border-b border-gray-100 dark:border-gray-600"
                  >
                    <td className="p-3 text-[0.6rem] text-center text-gray-700 dark:text-gray-300 font-medium">
                      Strike Steps ({symbol})
                    </td>
                    <td className="p-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={getStrikeStepsForSymbol(symbol)}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleSymbolStrikeStepsChange(
                              symbol,
                              value === "" || value === "-"
                                ? value
                                : parseInt(value) ||
                                    (defaultStrikeSteps[symbol] ?? 50)
                            );
                          }}
                          onBlur={(e) => {
                            handleSymbolStrikeStepsBlur(symbol, e.target.value);
                          }}
                          className="w-32 text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                          step="1"
                          min="1"
                          placeholder={`Default: ${
                            defaultStrikeSteps[symbol] ?? 50
                          }`}
                        />
                      ) : (
                        <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                          {getStrikeStepsForSymbol(symbol)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {dynamicHedgeSettings.hedgeType === "fixed Distance" && (
                  <tr className="border-b border-gray-100 dark:border-gray-600">
                    <td className="p-3 text-[0.6rem] text-center text-gray-700 dark:text-gray-300 font-medium">
                      Strike Distance
                    </td>
                    <td className="p-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={dynamicHedgeSettings.strikeDistance ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleChange(
                              "strikeDistance",
                              value === "" || value === "-"
                                ? value
                                : parseInt(value) || 1
                            );
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (value === "" || value === "-") {
                              handleChange("strikeDistance", 1);
                            }
                          }}
                          className="w-32 text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                          min="1"
                          placeholder="Strike distance"
                        />
                      ) : (
                        <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                          {dynamicHedgeSettings.strikeDistance ?? "N/A"}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="p-3 text-[0.6rem] text-center text-gray-700 dark:text-gray-300 font-medium">
                    Strike 500
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={dynamicHedgeSettings.strike500 || false}
                          onChange={(e) =>
                            handleChange("strike500", e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      ) : (
                        <span className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
                          {dynamicHedgeSettings.strike500 ? "Yes" : "No"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Strike Configuration Info */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-center">
              <div className="text-[0.6rem] text-blue-600 dark:text-blue-400 font-medium">
                Current Strike Configuration
              </div>
              <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white mt-1">
                Steps:{" "}
                {dynamicHedgeSettings.strikeSteps
                  ? Object.entries(dynamicHedgeSettings.strikeSteps)
                      .map(([sym, val]) => `${sym}:${val}`)
                      .join(", ")
                  : "N/A"}
                {dynamicHedgeSettings.hedgeType === "fixed Distance" && (
                  <> | Distance: {dynamicHedgeSettings.strikeDistance ?? 1}</>
                )}
                {" | Strike 500: "}
                {dynamicHedgeSettings.strike500 ? "Enabled" : "Disabled"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Hedge Summary */}
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <div className="text-center">
          <div className="text-[0.6rem] text-green-600 dark:text-green-400 font-medium">
            Current Dynamic Hedge Configuration
          </div>
          <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white mt-1">
            Type: {dynamicHedgeSettings.hedgeType || "N/A"} | Distance:{" "}
            {dynamicHedgeSettings.minHedgeDistance ?? 0} -{" "}
            {dynamicHedgeSettings.maxHedgeDistance ?? 0} | Premium:{" "}
            {dynamicHedgeSettings.minPremium ?? 0.0} -{" "}
            {dynamicHedgeSettings.maxPremium ?? 0.0}
          </div>
          <div className="text-[0.6rem] text-gray-600 dark:text-gray-400 mt-1">
            Strike Steps:{" "}
            {dynamicHedgeSettings.strikeSteps
              ? Object.entries(dynamicHedgeSettings.strikeSteps)
                  .map(([sym, val]) => `${sym}:${val}`)
                  .join(", ")
              : "N/A"}
            {dynamicHedgeSettings.hedgeType === "fixed Distance" && (
              <> | Distance: {dynamicHedgeSettings.strikeDistance ?? 1}</>
            )}
            {" | Strike 500: "}
            {dynamicHedgeSettings.strike500 ? "Enabled" : "Disabled"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicHedgeTab;
