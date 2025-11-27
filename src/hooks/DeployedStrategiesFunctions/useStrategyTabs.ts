import { useState } from "react";

/**
 * Custom Hook for Strategy Tab Management
 * Manages active tabs and settings tabs for each strategy
 */

export interface UseStrategyTabsReturn {
  activeTab: Record<string, string>;
  activeSettingsTab: Record<string, string>;
  getActiveTab: (strategyId: string) => string;
  setStrategyTab: (strategyId: string, tabId: string) => void;
  getActiveSettingsTab: (strategyId: string) => string;
  setStrategySettingsTab: (strategyId: string, tabId: string) => void;
}

export const useStrategyTabs = (): UseStrategyTabsReturn => {
  const [activeTab, setActiveTab] = useState<Record<string, string>>({});
  const [activeSettingsTab, setActiveSettingsTab] = useState<
    Record<string, string>
  >({});

  // Get active tab for a strategy (default to "positions")
  const getActiveTab = (strategyId: string): string => {
    return activeTab[strategyId] || "positions";
  };

  // Set active tab for a strategy
  const setStrategyTab = (strategyId: string, tabId: string) => {
    setActiveTab((prev) => ({ ...prev, [strategyId]: tabId }));
  };

  // Get active settings tab for a strategy (default to "execution")
  const getActiveSettingsTab = (strategyId: string): string => {
    return activeSettingsTab[strategyId] || "execution";
  };

  // Set active settings tab for a strategy
  const setStrategySettingsTab = (strategyId: string, tabId: string) => {
    setActiveSettingsTab((prev) => ({ ...prev, [strategyId]: tabId }));
  };

  return {
    activeTab,
    activeSettingsTab,
    getActiveTab,
    setStrategyTab,
    getActiveSettingsTab,
    setStrategySettingsTab,
  };
};
