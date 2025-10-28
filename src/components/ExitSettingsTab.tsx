import React from "react";
import { ExitSettings, ExitOrderType } from "../types/strategy.types";

interface ExitSettingsTabProps {
  exitSettings: ExitSettings;
  isEditing?: boolean;
  onChange?: (field: string, value: any) => void;
  exitOrderTypeOptions?: ExitOrderType[];
}

const ExitSettingsTab: React.FC<ExitSettingsTabProps> = ({
  exitSettings,
  isEditing = false,
  onChange,
  exitOrderTypeOptions = ["LIMIT", "MARKET", "SL", "SL-M"],
}) => {
  const handleChange = (field: string, value: any): void => {
    if (onChange) {
      onChange(field, value);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-md font-semibold text-gray-900 dark:text-white">
        Exit Settings
      </h3>

      {/* Cards in Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Exit Configuration */}
        <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <h4 className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
              Exit Configuration
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
                    Exit Order Type
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <select
                        value={exitSettings.exitOrderType || "LIMIT"}
                        onChange={(e) =>
                          handleChange("exitOrderType", e.target.value)
                        }
                        className="w-full text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      >
                        {exitOrderTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                        {exitSettings.exitOrderType || "N/A"}
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-600">
                  <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
                    Exit Sell First
                  </td>
                  <td className="p-2">
                    <div className="flex justify-center">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={exitSettings.exitSellFirst || false}
                          onChange={(e) =>
                            handleChange("exitSellFirst", e.target.checked)
                          }
                          className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 dark:focus:ring-yellow-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      ) : (
                        <span className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
                          {exitSettings.exitSellFirst ? "Yes" : "No"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
                    Hold Buy Time (seconds)
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={exitSettings.holdBuyTime ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleChange(
                            "holdBuyTime",
                            value === "" || value === "-"
                              ? value
                              : parseFloat(value) || 0
                          );
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value === "" || value === "-") {
                            handleChange("holdBuyTime", 0);
                          }
                        }}
                        className="w-24 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 mx-auto"
                        step="0.1"
                        placeholder="Hold time in seconds"
                      />
                    ) : (
                      <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                        {exitSettings.holdBuyTime ?? "N/A"}
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 2: Retry Settings */}
        <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
            <h4 className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
              Retry Settings
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
                    Wait Between Retry (seconds)
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={exitSettings.waitBtwnRetry ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleChange(
                            "waitBtwnRetry",
                            value === "" || value === "-"
                              ? value
                              : parseFloat(value) || 0
                          );
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value === "" || value === "-") {
                            handleChange("waitBtwnRetry", 0);
                          }
                        }}
                        className="w-24 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 mx-auto"
                        step="0.1"
                        placeholder="Wait time between retries"
                      />
                    ) : (
                      <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                        {exitSettings.waitBtwnRetry ?? "N/A"}
                      </div>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
                    Max Wait Time (seconds)
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={exitSettings.maxWaitTime ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleChange(
                            "maxWaitTime",
                            value === "" || value === "-"
                              ? value
                              : parseFloat(value) || 0
                          );
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value === "" || value === "-") {
                            handleChange("maxWaitTime", 0);
                          }
                        }}
                        className="w-24 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 mx-auto"
                        step="0.1"
                        placeholder="Maximum wait time"
                      />
                    ) : (
                      <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                        {exitSettings.maxWaitTime ?? "N/A"}
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Exit Summary */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <div className="text-center">
          <div className="text-[0.6rem] text-yellow-600 dark:text-yellow-400 font-medium">
            Current Exit Configuration
          </div>
          <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white mt-1">
            Order Type: {exitSettings.exitOrderType || "N/A"} | Sell First:{" "}
            {exitSettings.exitSellFirst ? "Yes" : "No"} | Hold Buy:{" "}
            {exitSettings.holdBuyTime ?? 0}s
          </div>
          <div className="text-[0.6rem] text-gray-600 dark:text-gray-400 mt-1">
            Wait Between Retry: {exitSettings.waitBtwnRetry ?? 0}s | Max Wait:{" "}
            {exitSettings.maxWaitTime ?? 0}s
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitSettingsTab;
