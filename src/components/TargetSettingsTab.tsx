import React from "react";

interface TargetSettings {
  targetType: string;
  targetValue: number;
}

interface TargetSettingsTabProps {
  targetSettings: TargetSettings;
  isEditing?: boolean;
  onChange?: (field: string, value: any) => void;
  targetTypeOptions?: string[];
}

const TargetSettingsTab: React.FC<TargetSettingsTabProps> = ({
  targetSettings,
  isEditing = false,
  onChange,
  targetTypeOptions = [
    "CombinedProfit",
    "IndividualLegProfit",
    "PercentageProfit",
    "PremiumTarget",
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
        Target Settings
      </h3>

      {/* Target Settings Card */}
      <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <h4 className="text-md font-semibold text-gray-900 dark:text-white">
            Target Configuration
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
              <tr className="border-b border-gray-100 dark:border-gray-600">
                <td className="p-3 text-[0.6rem] text-center text-gray-700 dark:text-gray-300 font-medium">
                  Target Type
                </td>
                <td className="p-3">
                  {isEditing ? (
                    <select
                      value={targetSettings.targetType || "CombinedProfit"}
                      onChange={(e) =>
                        handleChange("targetType", e.target.value)
                      }
                      className="w-full text-[0.6rem] text-center p-3 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      {targetTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                      {targetSettings.targetType || "N/A"}
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <td className="p-3 text-[0.6rem] text-center text-gray-700 dark:text-gray-300 font-medium">
                  Target Value
                </td>
                <td className="p-3">
                  {isEditing ? (
                    <input
                      type="number"
                      value={targetSettings.targetValue ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleChange(
                          "targetValue",
                          value === "" || value === "-"
                            ? value
                            : parseFloat(value) || 0
                        );
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (value === "" || value === "-") {
                          handleChange("targetValue", 0);
                        }
                      }}
                      className="w-24 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mx-auto"
                      step="0.01"
                      placeholder="Enter target value"
                    />
                  ) : (
                    <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                      {targetSettings.targetValue ?? "N/A"}
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Target Summary */}
        <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="text-center">
            <div className="text-[0.6rem] text-orange-600 dark:text-orange-400 font-medium">
              Current Target Configuration
            </div>
            <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white mt-1">
              {targetSettings.targetType || "N/A"}:{" "}
              {targetSettings.targetValue ?? 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetSettingsTab;
