import React from "react";

interface AtBrokerSettings {
  legSlAtBroker: boolean;
  legTpAtBroker: boolean;
  legReEntryAtBroker: boolean;
  legWnTAtBroker: boolean;
  slOrderTriggerAdjust: {
    minPoint: number;
    maxPercentage: number;
  };
}

interface AtBrokerTabProps {
  atBrokerSettings: AtBrokerSettings;
  isEditing?: boolean;
  onChange?: (field: string, value: any) => void;
}

const AtBrokerTab: React.FC<AtBrokerTabProps> = ({
  atBrokerSettings,
  isEditing = false,
  onChange,
}) => {
  const handleChange = (field: string, value: any): void => {
    if (onChange) {
      onChange(field, value);
    }
  };

  const handleNestedChange = (
    parentField: string,
    childField: string,
    value: any
  ): void => {
    if (onChange) {
      const parentValue =
        atBrokerSettings[parentField as keyof AtBrokerSettings];
      const updated = {
        ...(typeof parentValue === "object" && parentValue !== null
          ? parentValue
          : {}),
        [childField]: value,
      };
      onChange(parentField, updated);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-md font-semibold text-gray-900 dark:text-white">
        At Broker Settings
      </h3>

      {/* Grid layout for 2 cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: At Broker Options */}
        <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h4 className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
              At Broker Options
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
                {/* Leg SL At Broker */}
                <tr className="border-b border-gray-100 dark:border-gray-600">
                  <td className="p-3 text-[0.6rem] text-center text-gray-700 dark:text-gray-300 font-medium">
                    Leg SL At Broker
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={atBrokerSettings.legSlAtBroker || false}
                          onChange={(e) =>
                            handleChange("legSlAtBroker", e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                        />
                      ) : (
                        <span className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
                          {atBrokerSettings.legSlAtBroker ? "Yes" : "No"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Leg TP At Broker */}
                <tr className="border-b border-gray-100 dark:border-gray-600">
                  <td className="p-3 text-[0.6rem] text-center text-gray-700 dark:text-gray-300 font-medium">
                    Leg TP At Broker
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={atBrokerSettings.legTpAtBroker || false}
                          onChange={(e) =>
                            handleChange("legTpAtBroker", e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                        />
                      ) : (
                        <span className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
                          {atBrokerSettings.legTpAtBroker ? "Yes" : "No"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Leg Re-Entry At Broker */}
                <tr className="border-b border-gray-100 dark:border-gray-600">
                  <td className="p-3 text-[0.6rem] text-center text-gray-700 dark:text-gray-300 font-medium">
                    Leg Re-Entry At Broker
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={atBrokerSettings.legReEntryAtBroker || false}
                          onChange={(e) =>
                            handleChange("legReEntryAtBroker", e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                        />
                      ) : (
                        <span className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
                          {atBrokerSettings.legReEntryAtBroker ? "Yes" : "No"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Leg WnT At Broker */}
                <tr>
                  <td className="p-3 text-[0.6rem] text-center text-gray-700 dark:text-gray-300 font-medium">
                    Leg WnT At Broker
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={atBrokerSettings.legWnTAtBroker || false}
                          onChange={(e) =>
                            handleChange("legWnTAtBroker", e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                        />
                      ) : (
                        <span className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
                          {atBrokerSettings.legWnTAtBroker ? "Yes" : "No"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 2: SL Order Trigger Adjust */}
        <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h4 className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
              SL Order Trigger Adjust
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
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
                {/* Min Point */}
                <tr className="border-b border-gray-100 dark:border-gray-600">
                  <td className="p-3 text-[0.6rem] text-center text-gray-700 dark:text-gray-300 font-medium">
                    Min Point
                  </td>
                  <td className="p-3">
                    {isEditing ? (
                      <input
                        type="number"
                        value={
                          atBrokerSettings.slOrderTriggerAdjust?.minPoint ?? ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          handleNestedChange(
                            "slOrderTriggerAdjust",
                            "minPoint",
                            value === "" || value === "-"
                              ? value
                              : parseFloat(value) || 0
                          );
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value === "" || value === "-") {
                            handleNestedChange(
                              "slOrderTriggerAdjust",
                              "minPoint",
                              0
                            );
                          }
                        }}
                        className="w-32 text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                        step="0.01"
                        placeholder="Min point"
                      />
                    ) : (
                      <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                        {atBrokerSettings.slOrderTriggerAdjust?.minPoint ?? 0}
                      </div>
                    )}
                  </td>
                </tr>

                {/* Max Percentage */}
                <tr>
                  <td className="p-3 text-[0.6rem] text-center text-gray-700 dark:text-gray-300 font-medium">
                    Max Percentage
                  </td>
                  <td className="p-3">
                    {isEditing ? (
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          value={
                            atBrokerSettings.slOrderTriggerAdjust
                              ?.maxPercentage ?? ""
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            handleNestedChange(
                              "slOrderTriggerAdjust",
                              "maxPercentage",
                              value === "" || value === "-"
                                ? value
                                : parseFloat(value) || 0
                            );
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (value === "" || value === "-") {
                              handleNestedChange(
                                "slOrderTriggerAdjust",
                                "maxPercentage",
                                0
                              );
                            }
                          }}
                          className="w-24 text-[0.6rem] text-center p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          step="0.1"
                          min="0"
                          max="100"
                          placeholder="Percentage"
                        />
                        <span className="text-[0.6rem] text-gray-700 dark:text-gray-300">
                          %
                        </span>
                      </div>
                    ) : (
                      <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white text-center">
                        {atBrokerSettings.slOrderTriggerAdjust?.maxPercentage ??
                          0}
                        %
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Info Box */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-center">
              <div className="text-[0.6rem] text-blue-600 dark:text-blue-400 font-medium">
                Current SL Trigger Adjust Configuration
              </div>
              <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white mt-1">
                Min Point:{" "}
                {atBrokerSettings.slOrderTriggerAdjust?.minPoint ?? 0} | Max
                Percentage:{" "}
                {atBrokerSettings.slOrderTriggerAdjust?.maxPercentage ?? 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <div className="text-center">
          <div className="text-[0.6rem] text-green-600 dark:text-green-400 font-medium">
            Current At Broker Configuration
          </div>
          <div className="text-[0.6rem] font-semibold text-gray-900 dark:text-white mt-1">
            Leg SL: {atBrokerSettings.legSlAtBroker ? "Enabled" : "Disabled"} |
            Leg TP: {atBrokerSettings.legTpAtBroker ? "Enabled" : "Disabled"} |
            Re-Entry:{" "}
            {atBrokerSettings.legReEntryAtBroker ? "Enabled" : "Disabled"} |
            WnT: {atBrokerSettings.legWnTAtBroker ? "Enabled" : "Disabled"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtBrokerTab;
