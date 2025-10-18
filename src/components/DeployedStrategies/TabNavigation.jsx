import React, { memo } from "react";

const TabNavigation = memo(({ tabs, activeTabId, onTabChange }) => {
  return (
    <>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`py-2 px-1 border-b-2 font-medium text-[0.6rem] whitespace-nowrap transition-colors ${
            activeTabId === tab.id
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </>
  );
});

TabNavigation.displayName = "TabNavigation";

export default TabNavigation;
