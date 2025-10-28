import React from "react";
import { StoplossSettings, StoplossType } from "../types/strategy.types";

interface StoplossSettingsTabProps {
  stoplossSettings: StoplossSettings;
  isEditing?: boolean;
  onChange?: (field: string, value: any) => void;
  stoplossTypeOptions?: StoplossType[];
}

const StoplossSettingsTab: React.FC<StoplossSettingsTabProps> = ({
  stoplossSettings,
  isEditing = false,
  onChange,
  stoplossTypeOptions = [
    "CombinedLoss",
    "IndividualLegLoss",
    "PercentageLoss",
    "PremiumLoss",
    "UnderlyingMovement",
  ],
}) => {
  const handleChange = (field: string, value: any): void => {
    if (onChange) {
      onChange(field, value);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-md font-semibold text-gray-900 dark:text-white">
        Stoploss Settings
      </h3>

      {/* Cards in Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Stoploss Configuration */}
        <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <h4 className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
              Stoploss Configuration
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
                    Stoploss Type
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <select
                        value={stoplossSettings.stoplossType || "CombinedLoss"}
                        onChange={(e) =>
                          handleChange("stoplossType", e.target.value)
                        }
                        className="w-full text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        {stoplossTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                        {stoplossSettings.stoplossType || "N/A"}
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-600">
                  <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
                    Stoploss Value
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={stoplossSettings.stoplossValue ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleChange(
                            "stoplossValue",
                            value === "" || value === "-"
                              ? value
                              : parseFloat(value) || 0
                          );
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value === "" || value === "-") {
                            handleChange("stoplossValue", 0);
                          }
                        }}
                        className="w-24 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 mx-auto"
                        step="0.01"
                        placeholder="Enter stoploss value"
                      />
                    ) : (
                      <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                        {stoplossSettings.stoplossValue ?? "N/A"}
                      </div>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
                    Stoploss Wait (seconds)
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={stoplossSettings.stoplossWait ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleChange(
                            "stoplossWait",
                            value === "" || value === "-"
                              ? value
                              : parseFloat(value) || 0
                          );
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value === "" || value === "-") {
                            handleChange("stoplossWait", 0);
                          }
                        }}
                        className="w-24 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 mx-auto"
                        step="0.1"
                        placeholder="Wait time in seconds"
                      />
                    ) : (
                      <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                        {stoplossSettings.stoplossWait ?? "N/A"}
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 2: Square Off Options */}
        <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <h4 className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
              Square Off Options
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-center p-2 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                    Option
                  </th>
                  <th className="text-center p-2 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                    Enabled
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-600">
                  <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
                    Square Off Only Loss Legs
                  </td>
                  <td className="p-2">
                    <div className="flex justify-center">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={stoplossSettings.sqrOffOnlyLossLegs || false}
                          onChange={(e) =>
                            handleChange("sqrOffOnlyLossLegs", e.target.checked)
                          }
                          className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      ) : (
                        <span className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
                          {stoplossSettings.sqrOffOnlyLossLegs ? "Yes" : "No"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
                    Square Off Only Profit Legs
                  </td>
                  <td className="p-2">
                    <div className="flex justify-center">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={
                            stoplossSettings.sqrOffOnlyProfitLegs || false
                          }
                          onChange={(e) =>
                            handleChange(
                              "sqrOffOnlyProfitLegs",
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      ) : (
                        <span className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
                          {stoplossSettings.sqrOffOnlyProfitLegs ? "Yes" : "No"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stoploss Summary */}
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <div className="text-center">
          <div className="text-[0.6rem] text-red-600 dark:text-red-400 font-medium">
            Current Stoploss Configuration
          </div>
          <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white mt-1">
            Type: {stoplossSettings.stoplossType || "N/A"} | Value:{" "}
            {stoplossSettings.stoplossValue ?? 0} | Wait:{" "}
            {stoplossSettings.stoplossWait ?? 0}s
          </div>
          <div className="text-[0.6rem] text-gray-600 dark:text-gray-400 mt-1">
            Loss Legs:{" "}
            {stoplossSettings.sqrOffOnlyLossLegs ? "Enabled" : "Disabled"} |
            Profit Legs:{" "}
            {stoplossSettings.sqrOffOnlyProfitLegs ? "Enabled" : "Disabled"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoplossSettingsTab;
