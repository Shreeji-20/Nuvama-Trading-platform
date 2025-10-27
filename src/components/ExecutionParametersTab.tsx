import React from "react";
import {
  ExecutionParams,
  Product,
  LegsExecution,
  PortfolioExecutionMode,
  EntryOrderType,
  DayOfWeek,
  StrategyTag,
} from "../types/strategy.types";

interface ExecutionParametersTabProps {
  executionParams: ExecutionParams;
  isEditing?: boolean;
  onChange?: (field: string, value: any) => void;
  availableTags?: StrategyTag[];
  loadingTags?: boolean;
  productOptions?: Product[];
  legsExecutionOptions?: LegsExecution[];
  portfolioExecutionModeOptions?: PortfolioExecutionMode[];
  entryOrderTypeOptions?: EntryOrderType[];
  daysOptions?: DayOfWeek[];
}

const ExecutionParametersTab: React.FC<ExecutionParametersTabProps> = ({
  executionParams,
  isEditing = false,
  onChange,
  availableTags = [],
  loadingTags = false,
  productOptions = ["NRML", "MIS", "CNC"],
  legsExecutionOptions = ["Parallel", "Sequential"],
  portfolioExecutionModeOptions = [
    "startTime",
    "underlyingPremium",
    "combinedPremium",
  ],
  entryOrderTypeOptions = ["LIMIT", "MARKET", "SL", "SL-M"],
  daysOptions = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
}) => {
  const handleChange = (field: string, value: any): void => {
    if (onChange) {
      onChange(field, value);
    }
  };

  const handleDaysChange = (day: DayOfWeek): void => {
    const currentDays = executionParams.runOnDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];
    handleChange("runOnDays", newDays);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-md font-semibold text-gray-900 dark:text-white">
        Execution Parameters
      </h3>

      {/* Cards in Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Form Parameters */}
        <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h4 className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
              Form Parameters
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
                    Product
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <select
                        value={executionParams.product || "NRML"}
                        onChange={(e) =>
                          handleChange("product", e.target.value)
                        }
                        className="w-full text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {productOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                        {executionParams.product || "N/A"}
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-600">
                  <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
                    Strategy Tag
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <select
                        value={executionParams.strategyTag || ""}
                        onChange={(e) =>
                          handleChange("strategyTag", e.target.value)
                        }
                        className="w-full text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={loadingTags}
                      >
                        <option value="">
                          {loadingTags ? "Loading tags..." : "Select Tag"}
                        </option>
                        {availableTags.map((tag) => (
                          <option key={tag.id} value={tag.id}>
                            {tag.tagName} (
                            {Object.keys(tag.userMultipliers || {}).length}{" "}
                            users)
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                        {(() => {
                          const tagId = executionParams.strategyTag;
                          if (tagId && availableTags.length > 0) {
                            const tag = availableTags.find(
                              (t) => t.id === tagId
                            );
                            return tag?.tagName || tagId;
                          }
                          return executionParams.strategyTag || "None";
                        })()}
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-600">
                  <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
                    Legs Execution
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <select
                        value={executionParams.legsExecution || "Parallel"}
                        onChange={(e) =>
                          handleChange("legsExecution", e.target.value)
                        }
                        className="w-full text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {legsExecutionOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                        {executionParams.legsExecution || "N/A"}
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-600">
                  <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
                    Portfolio Execution Mode
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <select
                        value={
                          executionParams.portfolioExecutionMode || "startTime"
                        }
                        onChange={(e) =>
                          handleChange("portfolioExecutionMode", e.target.value)
                        }
                        className="w-full text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {portfolioExecutionModeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                        {executionParams.portfolioExecutionMode || "N/A"}
                      </div>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
                    Entry Order Type
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <select
                        value={executionParams.entryOrderType || "LIMIT"}
                        onChange={(e) =>
                          handleChange("entryOrderType", e.target.value)
                        }
                        className="w-full text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {entryOrderTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                        {executionParams.entryOrderType || "N/A"}
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 2: Time Parameters */}
        <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h4 className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
              Time Parameters
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
                    Run On Days
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <div className="flex flex-wrap gap-1">
                        {daysOptions.map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleDaysChange(day)}
                            className={`px-2 py-1 text-[0.6rem] rounded transition-colors ${
                              (executionParams.runOnDays || []).includes(day)
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                            }`}
                          >
                            {day.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                        {(executionParams.runOnDays || []).length > 0
                          ? executionParams.runOnDays
                              .map((d) => d.slice(0, 3))
                              .join(", ")
                          : "None"}
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-600">
                  <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
                    Start Time
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <input
                        type="time"
                        value={executionParams.startTime || ""}
                        onChange={(e) =>
                          handleChange("startTime", e.target.value)
                        }
                        className="w-32 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                      />
                    ) : (
                      <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                        {executionParams.startTime || "N/A"}
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-600">
                  <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
                    End Time
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <input
                        type="time"
                        value={executionParams.endTime || ""}
                        onChange={(e) =>
                          handleChange("endTime", e.target.value)
                        }
                        className="w-32 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                      />
                    ) : (
                      <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                        {executionParams.endTime || "N/A"}
                      </div>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
                    Square Off Time
                  </td>
                  <td className="p-2">
                    {isEditing ? (
                      <input
                        type="time"
                        value={executionParams.squareoffTime || ""}
                        onChange={(e) =>
                          handleChange("squareoffTime", e.target.value)
                        }
                        className="w-32 text-[0.6rem] text-center p-1 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                      />
                    ) : (
                      <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                        {executionParams.squareoffTime || "N/A"}
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionParametersTab;
