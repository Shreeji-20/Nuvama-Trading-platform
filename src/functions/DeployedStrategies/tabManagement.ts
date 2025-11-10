/**
 * Get active settings tab for a strategy
 */
export const getActiveSettingsTab = (
  strategyId: string,
  activeSettingsTab: Record<string, string>
): string => {
  return activeSettingsTab[strategyId] || "execution";
};

/**
 * Set active settings tab for a strategy
 */
export const setStrategySettingsTab = (
  strategyId: string,
  tabId: string,
  setActiveSettingsTab: (
    updater: (prev: Record<string, string>) => Record<string, string>
  ) => void
) => {
  setActiveSettingsTab((prev) => ({ ...prev, [strategyId]: tabId }));
};

/**
 * Get active tab for a strategy (default to "positions")
 */
export const getActiveTab = (
  strategyId: string,
  activeTab: Record<string, string>
): string => {
  return activeTab[strategyId] || "positions";
};

/**
 * Set active tab for a strategy
 */
export const setStrategyTab = (
  strategyId: string,
  tabId: string,
  setActiveTab: (
    updater: (prev: Record<string, string>) => Record<string, string>
  ) => void
) => {
  setActiveTab((prev) => ({ ...prev, [strategyId]: tabId }));
};
