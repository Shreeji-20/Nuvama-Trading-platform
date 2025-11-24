import React from "react";
import type { ToggleButtonProps } from "../../types/strategy.types";

// Generate dynamic strike options based on symbol
export const getStrikeOptions = (symbol: string): string[] => {
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

// Generate new strategy ID
export const generateNewStrategyId = (): string => {
  return `STRATEGY_${Date.now().toString().slice(-6)}`;
};

// Toggle button component with color coding
export const ToggleButton: React.FC<ToggleButtonProps> = ({
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
      className={`px-2 py-1 text-[0.6rem] font-medium rounded border transition-colors min-w-[40px] ${getColorClasses()}`}
    >
      {getDisplayLabel()}
    </button>
  );
};
