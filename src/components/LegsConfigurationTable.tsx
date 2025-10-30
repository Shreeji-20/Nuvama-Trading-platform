import React from "react";
import {
  Leg,
  PriceType,
  OrderType,
  TargetStoplossType,
  ActionType,
} from "../types/strategy.types";

interface ToggleButtonProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  colorScheme?: "buysell" | "callput";
}

interface LegsConfigurationTableProps {
  legs?: Record<string, Leg>;
  isEditing?: boolean;
  onLegChange?: (legId: string, field: string, value: any) => void;
  onDeleteLeg?: (legId: string) => void;
  onCopyLeg?: (legId: string) => void;
  onAddLeg?: () => void;
  onPremiumStrikeModalOpen?: (legId: string) => void;
  symbolOptions?: string[];
  expiryOptions?: number[];
  targetOptions?: TargetStoplossType[];
  stoplossOptions?: TargetStoplossType[];
  priceTypeOptions?: PriceType[];
  actionOptions?: ActionType[];
  orderTypeOptions?: OrderType[];
  strategyId?: string;
}

/**
 * Reusable Legs Configuration Table Component
 * Used in both AdvancedOptionsBuilder and DeployedStrategies
 */
const LegsConfigurationTable: React.FC<LegsConfigurationTableProps> = ({
  legs = {},
  isEditing = false,
  onLegChange,
  onDeleteLeg,
  onCopyLeg,
  onAddLeg,
  onPremiumStrikeModalOpen,
  symbolOptions = ["NIFTY", "BANKNIFTY", "FINNIFTY", "SENSEX"],
  expiryOptions = [0, 1, 2, 3, 4, 5],
  targetOptions = ["NONE", "ABSOLUTE", "PERCENTAGE", "POINTS"],
  stoplossOptions = ["NONE", "ABSOLUTE", "PERCENTAGE", "POINTS"],
  priceTypeOptions = ["LTP", "BIDASK", "DEPTH", "BID", "ASK"],
  actionOptions = ["NONE", "REENTRY", "REEXECUTE"],
  orderTypeOptions = ["LIMIT", "MARKET"],
  strategyId,
}) => {
  // Convert legs Record to array for easier rendering
  const legsArray = Object.entries(legs).map(([legId, leg]) => ({
    ...leg,
    legId: legId,
  }));
  // Helper function to get strike options based on symbol
  const getStrikeOptions = (symbol: string): string[] => {
    const stepSize = symbol === "NIFTY" || symbol === "FINNIFTY" ? 50 : 100;
    const strikes: string[] = [];

    for (let i = -50; i <= 50; i++) {
      const offset = i * stepSize;
      if (offset === 0) {
        strikes.push("ATM");
      } else if (offset > 0) {
        strikes.push(`ATM+${offset}`);
      } else {
        strikes.push(`ATM${offset}`);
      }
    }

    return strikes;
  };

  // Toggle button component with color coding
  const ToggleButton: React.FC<ToggleButtonProps> = ({
    value,
    onChange,
    options,
    colorScheme,
  }) => {
    const handleToggle = (): void => {
      const currentIndex = options.indexOf(value);
      const nextIndex = (currentIndex + 1) % options.length;
      onChange(options[nextIndex]);
    };

    const getDisplayLabel = (): string => {
      if (colorScheme === "buysell") {
        if (value === "BUY") return "B";
        if (value === "SELL") return "S";
      }
      return value;
    };

    const getColorClasses = (): string => {
      if (!colorScheme) {
        return "bg-blue-500 hover:bg-blue-600 text-white border-blue-600";
      }

      if (colorScheme === "buysell") {
        if (value === "BUY") {
          return "bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border-green-500";
        } else if (value === "SELL") {
          return "bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500";
        }
      }

      if (colorScheme === "callput") {
        if (value === "CE") {
          return "bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border-green-500";
        } else if (value === "PE") {
          return "bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500";
        }
      }

      return "bg-blue-500 hover:bg-blue-600 text-white border-blue-600";
    };

    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`px-2 py-1 text-[0.7rem] font-medium rounded border transition-colors min-w-[40px] ${getColorClasses()}`}
        disabled={!isEditing}
      >
        {getDisplayLabel()}
      </button>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-center p-1 text-[0.7rem] text-gray-700 dark:text-gray-300 whitespace-nowrap font-bold">
              Leg ID
            </th>
            <th className="text-center p-1 text-[0.7rem] font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Symbol
            </th>
            <th className="text-center p-1 text-[0.7rem] font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Expiry
            </th>
            <th className="text-center p-1 text-[0.7rem] font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Action
            </th>
            <th className="text-center p-1 text-[0.7rem] font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Option
            </th>
            <th className="text-center p-1 text-[0.7rem] font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Lots
            </th>
            <th className="text-center p-1 text-[0.7rem] font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Strike
            </th>
            <th className="text-center p-1 text-[0.7rem] font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Target
            </th>
            <th className="text-center p-1 text-[0.7rem] font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Target Value
            </th>
            <th className="text-center p-1 text-[0.7rem] font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Stop Loss
            </th>
            <th className="text-center p-1 text-[0.7rem] font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Stop Loss Value
            </th>
            <th className="text-center p-1 text-[0.7rem] font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Price Type
            </th>
            <th className="text-center p-1 text-[0.7rem] font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Depth Index
            </th>
            <th className="text-center p-1 text-[0.7rem] font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Order Type
            </th>
            <th className="text-center p-1 text-[0.7rem] font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Start Time
            </th>
            <th className="text-center p-1 text-[0.7rem] font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Wait & Trade Logic
            </th>
            <th className="text-center p-1 text-[0.7rem] font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Wait & Trade
            </th>
            <th className="text-center p-1 text-[0.7rem] font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Dynamic Hedge
            </th>
            <th className="text-center p-1 text-[0.7rem] font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              On Target Action
            </th>
            <th className="text-center p-1 text-[0.7rem] font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              On Stoploss Action
            </th>
            <th className="text-center p-1 text-[0.7rem] font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {legsArray.map((leg, index) => (
            <tr
              key={leg.legId || index}
              className={`border-b border-gray-100 dark:border-gray-700 ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-gray-800"
                  : "bg-white dark:bg-gray-700"
              }`}
            >
              {/* Leg ID */}
              <td className="p-1">
                <div className="text-center">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-[0.7rem] font-medium rounded">
                    {leg.legId}
                  </span>
                </div>
              </td>

              {/* Symbol */}
              <td className="p-1 text-center">
                {isEditing && onLegChange ? (
                  <select
                    value={leg.symbol}
                    onChange={(e) =>
                      onLegChange(leg.legId, "symbol", e.target.value)
                    }
                    className="w-auto text-[0.7rem] text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                  >
                    {symbolOptions.map((symbol) => (
                      <option key={symbol} value={symbol}>
                        {symbol}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-gray-900 dark:text-white text-[0.7rem]">
                    {leg.symbol}
                  </span>
                )}
              </td>

              {/* Expiry */}
              <td className="p-1 text-center">
                {isEditing && onLegChange ? (
                  <select
                    value={leg.expiry}
                    onChange={(e) =>
                      onLegChange(leg.legId, "expiry", e.target.value)
                    }
                    className="w-auto text-[0.7rem] text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                  >
                    {expiryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-gray-900 dark:text-white text-[0.7rem]">
                    {leg.expiry}
                  </span>
                )}
              </td>

              {/* Action (BUY/SELL) */}
              <td className="p-1">
                <div className="flex justify-center">
                  {isEditing && onLegChange ? (
                    <ToggleButton
                      value={leg.action}
                      onChange={(value) =>
                        onLegChange(leg.legId, "action", value)
                      }
                      options={["BUY", "SELL"]}
                      colorScheme="buysell"
                    />
                  ) : (
                    <span
                      className={`px-1 py-0.5 rounded text-[0.7rem] font-medium ${
                        leg.action === "BUY"
                          ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500"
                          : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500"
                      }`}
                    >
                      {leg.action}
                    </span>
                  )}
                </div>
              </td>

              {/* Option Type (CE/PE) */}
              <td className="p-1">
                <div className="flex justify-center">
                  {isEditing && onLegChange ? (
                    <ToggleButton
                      value={leg.optionType}
                      onChange={(value) =>
                        onLegChange(leg.legId, "optionType", value)
                      }
                      options={["CE", "PE"]}
                      colorScheme="callput"
                    />
                  ) : (
                    <span
                      className={`px-1 py-0.5 rounded text-[0.7rem] font-medium ${
                        leg.optionType === "CE"
                          ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500"
                          : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500"
                      }`}
                    >
                      {leg.optionType}
                    </span>
                  )}
                </div>
              </td>

              {/* Lots */}
              <td className="p-1 text-center">
                {isEditing && onLegChange ? (
                  <input
                    type="number"
                    value={leg.lots}
                    onChange={(e) =>
                      onLegChange(
                        leg.legId,
                        "lots",
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-14 text-[0.7rem] text-center p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                    min="1"
                  />
                ) : (
                  <span className="text-gray-900 dark:text-white text-[0.7rem]">
                    {leg.lots}
                  </span>
                )}
              </td>

              {/* Strike */}
              <td className="p-1">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={leg.premiumBasedStrike || false}
                      onChange={(e) =>
                        onLegChange &&
                        onLegChange(
                          leg.legId,
                          "premiumBasedStrike",
                          e.target.checked
                        )
                      }
                      disabled={!isEditing}
                      className="w-3 h-3 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-[0.7rem] text-gray-600 dark:text-gray-400">
                      Premium
                    </span>
                  </div>
                  {!leg.premiumBasedStrike ? (
                    isEditing && onLegChange ? (
                      <select
                        value={leg.strike}
                        onChange={(e) =>
                          onLegChange(leg.legId, "strike", e.target.value)
                        }
                        className="w-auto text-[0.7rem] text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        style={{ maxHeight: "200px", overflowY: "auto" }}
                        size={1}
                      >
                        {getStrikeOptions(leg.symbol).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-900 dark:text-white text-[0.7rem]">
                        {leg.strike}
                      </span>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        onPremiumStrikeModalOpen &&
                        onPremiumStrikeModalOpen(leg.legId)
                      }
                      className="px-2 py-1 text-[0.7rem] bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                      disabled={!isEditing}
                    >
                      {isEditing ? "Configure" : "Premium Based"}
                    </button>
                  )}
                </div>
              </td>

              {/* Target */}
              <td className="p-1 text-center">
                {isEditing && onLegChange ? (
                  <select
                    value={leg.target}
                    onChange={(e) =>
                      onLegChange(leg.legId, "target", e.target.value)
                    }
                    className="w-auto text-[0.7rem] text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                  >
                    {targetOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-gray-900 dark:text-white text-[0.7rem]">
                    {leg.target}
                  </span>
                )}
              </td>

              {/* Target Value */}
              <td className="p-1">
                <div className="flex justify-center">
                  {isEditing && onLegChange ? (
                    <input
                      type="number"
                      value={leg.targetValue}
                      onChange={(e) => {
                        const value = e.target.value;
                        onLegChange(
                          leg.legId,
                          "targetValue",
                          value === "" || value === "-"
                            ? value
                            : parseFloat(value) || 0
                        );
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (value === "" || value === "-") {
                          onLegChange(leg.legId, "targetValue", 0);
                        }
                      }}
                      className="w-14 text-[0.7rem] text-center p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      step="0.01"
                      placeholder="Enter value"
                    />
                  ) : (
                    <span className="text-gray-900 dark:text-white text-[0.7rem]">
                      {leg.targetValue}
                    </span>
                  )}
                </div>
              </td>

              {/* Stoploss */}
              <td className="p-1 text-center">
                {isEditing && onLegChange ? (
                  <select
                    value={leg.stoploss}
                    onChange={(e) =>
                      onLegChange(leg.legId, "stoploss", e.target.value)
                    }
                    className="w-auto text-[0.7rem] text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                  >
                    {stoplossOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-gray-900 dark:text-white text-[0.7rem]">
                    {leg.stoploss}
                  </span>
                )}
              </td>

              {/* Stoploss Value */}
              <td className="p-1">
                <div className="flex justify-center">
                  {isEditing && onLegChange ? (
                    <input
                      type="number"
                      value={leg.stoplossValue}
                      onChange={(e) => {
                        const value = e.target.value;
                        onLegChange(
                          leg.legId,
                          "stoplossValue",
                          value === "" || value === "-"
                            ? value
                            : parseFloat(value) || 0
                        );
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (value === "" || value === "-") {
                          onLegChange(leg.legId, "stoplossValue", 0);
                        }
                      }}
                      className="w-14 text-[0.7rem] text-center p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      step="0.01"
                      placeholder="Enter value"
                    />
                  ) : (
                    <span className="text-gray-900 dark:text-white text-[0.7rem]">
                      {leg.stoplossValue}
                    </span>
                  )}
                </div>
              </td>

              {/* Price Type */}
              <td className="p-1 text-center">
                {isEditing && onLegChange ? (
                  <select
                    value={leg.priceType}
                    onChange={(e) =>
                      onLegChange(leg.legId, "priceType", e.target.value)
                    }
                    className="w-auto text-[0.7rem] text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                  >
                    {priceTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-gray-900 dark:text-white text-[0.7rem]">
                    {leg.priceType}
                  </span>
                )}
              </td>

              {/* Depth Index */}
              <td className="p-1 text-center">
                {isEditing && onLegChange ? (
                  <select
                    value={leg.depthIndex}
                    onChange={(e) =>
                      onLegChange(
                        leg.legId,
                        "depthIndex",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-auto text-[0.7rem] text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                ) : (
                  <span className="text-gray-900 dark:text-white text-[0.7rem]">
                    {leg.depthIndex}
                  </span>
                )}
              </td>

              {/* Order Type */}
              <td className="p-1 text-center">
                {isEditing && onLegChange ? (
                  <select
                    value={leg.orderType || "LIMIT"}
                    onChange={(e) =>
                      onLegChange(leg.legId, "orderType", e.target.value)
                    }
                    className="w-auto text-[0.7rem] text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                  >
                    {orderTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-gray-900 dark:text-white text-[0.7rem]">
                    {leg.orderType}
                  </span>
                )}
              </td>

              {/* Start Time */}
              <td className="p-1 text-center">
                {isEditing && onLegChange ? (
                  <input
                    type="time"
                    value={leg.startTime}
                    onChange={(e) =>
                      onLegChange(leg.legId, "startTime", e.target.value)
                    }
                    className="w-auto text-[0.7rem] text-center p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                  />
                ) : (
                  <span className="text-gray-900 dark:text-white text-[0.7rem]">
                    {leg.startTime || "-"}
                  </span>
                )}
              </td>

              {/* Wait & Trade Logic */}
              <td className="p-1 text-center">
                {isEditing && onLegChange ? (
                  <select
                    value={leg.waitAndTradeLogic}
                    onChange={(e) =>
                      onLegChange(
                        leg.legId,
                        "waitAndTradeLogic",
                        e.target.value
                      )
                    }
                    className="w-auto text-[0.7rem] text-center p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                  >
                    <option value="NONE">NONE</option>
                    <option value="ABSOLUTE">ABSOLUTE</option>
                    <option value="PERCENTAGE">PERCENTAGE</option>
                    <option value="POINTS">POINTS</option>
                  </select>
                ) : (
                  <span className="text-gray-900 dark:text-white text-[0.7rem]">
                    {leg.waitAndTradeLogic}
                  </span>
                )}
              </td>

              {/* Wait & Trade */}
              <td className="p-1 text-center">
                {isEditing && onLegChange ? (
                  <input
                    type="number"
                    value={leg.waitAndTrade}
                    onChange={(e) => {
                      const value = e.target.value;
                      onLegChange(
                        leg.legId,
                        "waitAndTrade",
                        value === "" || value === "-"
                          ? value
                          : parseFloat(value) || 0
                      );
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value === "" || value === "-") {
                        onLegChange(leg.legId, "waitAndTrade", 0);
                      }
                    }}
                    step="0.01"
                    className="w-16 text-[0.7rem] text-center p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mx-auto"
                    placeholder="Enter value"
                  />
                ) : (
                  <span className="text-gray-900 dark:text-white text-[0.7rem]">
                    {leg.waitAndTrade || 0}
                  </span>
                )}
              </td>

              {/* Dynamic Hedge */}
              <td className="p-1">
                <div className="flex justify-center">
                  {isEditing && onLegChange ? (
                    <input
                      type="checkbox"
                      checked={leg.dynamicHedge || false}
                      onChange={(e) =>
                        onLegChange(leg.legId, "dynamicHedge", e.target.checked)
                      }
                      className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  ) : (
                    <span className="text-gray-900 dark:text-white text-[0.7rem]">
                      {leg.dynamicHedge ? "✓" : "-"}
                    </span>
                  )}
                </div>
              </td>

              {/* On Target Action */}
              <td className="p-1 text-center">
                {isEditing && onLegChange ? (
                  <select
                    value={leg.onTargetAction || "NONE"}
                    onChange={(e) =>
                      onLegChange(leg.legId, "onTargetAction", e.target.value)
                    }
                    className="w-auto text-[0.7rem] text-center p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                  >
                    {actionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-gray-900 dark:text-white text-[0.7rem]">
                    {leg.onTargetAction || "NONE"}
                  </span>
                )}
              </td>

              {/* On Stoploss Action */}
              <td className="p-1 text-center">
                {isEditing && onLegChange ? (
                  <select
                    value={leg.onStoplossAction || "NONE"}
                    onChange={(e) =>
                      onLegChange(leg.legId, "onStoplossAction", e.target.value)
                    }
                    className="w-auto text-[0.7rem] text-center p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mx-auto"
                  >
                    {actionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-gray-900 dark:text-white text-[0.7rem]">
                    {leg.onStoplossAction || "NONE"}
                  </span>
                )}
              </td>

              {/* Actions */}
              <td className="p-2 text-center">
                {isEditing && (
                  <div className="flex items-center justify-center gap-1">
                    {onCopyLeg && (
                      <button
                        onClick={() => onCopyLeg(leg.legId)}
                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-[0.7rem] font-medium rounded transition-colors"
                        title="Copy this leg"
                      >
                        Copy
                      </button>
                    )}
                    {onDeleteLeg && (
                      <button
                        onClick={() => onDeleteLeg(leg.legId)}
                        className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-[0.7rem] font-medium rounded transition-colors"
                        title="Remove this leg"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Leg Button */}
      {isEditing && onAddLeg && (
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={onAddLeg}
            className="px-3 py-1.5 text-[0.7rem] bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          >
            + Add Leg
          </button>
        </div>
      )}
    </div>
  );
};

export default LegsConfigurationTable;
