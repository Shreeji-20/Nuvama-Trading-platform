import React, { useState } from "react";

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface HorizontalTabsProps {
  tabs: Tab[];
  defaultActiveTab?: string;
  onChange?: (tabId: string) => void;
  variant?: "default" | "pills" | "underline";
  fullWidth?: boolean;
  centered?: boolean;
  padding?: boolean | string;
}

export const HorizontalTabs: React.FC<HorizontalTabsProps> = ({
  tabs,
  defaultActiveTab,
  onChange,
  variant = "default",
  fullWidth = false,
  centered = true,
  padding = true,
}) => {
  const [activeTab, setActiveTab] = useState<string>(
    defaultActiveTab || tabs[0]?.id || ""
  );

  const getPaddingClasses = () => {
    if (padding === false) return "";
    if (typeof padding === "string") return padding;
    return "px-[4px] py-[4px] sm:px-4 md:px-6";
  };

  const handleTabClick = (tabId: string, disabled?: boolean) => {
    if (disabled) return;
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const getTabStyles = (isActive: boolean, disabled?: boolean) => {
    const baseStyles =
      "px-4 py-2 text-sm font-medium transition-all duration-200";
    const widthStyles = fullWidth ? "flex-1" : "";

    if (disabled) {
      return `${baseStyles} ${widthStyles} cursor-not-allowed opacity-50`;
    }

    switch (variant) {
      case "pills":
        return `${baseStyles} ${widthStyles} rounded-lg ${
          isActive
            ? "bg-blue-600 text-white shadow-md"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`;
      case "underline":
        return `${baseStyles} ${widthStyles} border-b-2 ${
          isActive
            ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
            : "border-transparent text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
        }`;
      case "default":
      default:
        return `${baseStyles} ${widthStyles} rounded-t-lg border-b-2 ${
          isActive
            ? "bg-white dark:bg-gray-800 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400"
            : "bg-gray-50 dark:bg-gray-700/50 border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`;
    }
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    // <div className="w-full bg-gray-50 dark:bg-gray-900 px-3 sm:px-4 md:px-6 py-4">
    // <div className="w-full bg-gray-50 dark:bg-gray-900 border-[2px] border-gray-700 dark:border-gray-700 rounded-xl px-3 sm:px-4 md:px-6 py-4">
    <div
      className={`${
        centered ? "max-w-[115rem] mx-auto" : "w-full"
      } mx-auto bg-gray-50 dark:bg-gray-900 ${getPaddingClasses()}`}
    >
      <div className={`${centered ? "max-w-[115rem] mx-auto" : "w-full"} `}>
        {/* Tab Headers Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div
            className={`flex ${
              variant === "underline"
                ? "border-b border-gray-200 dark:border-gray-700"
                : "gap-2"
            } ${fullWidth ? "w-full" : ""}`}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id, tab.disabled)}
                disabled={tab.disabled}
                className={getTabStyles(activeTab === tab.id, tab.disabled)}
              >
                {tab.icon && (
                  <span className="inline-flex items-center gap-2">
                    {tab.icon}
                  </span>
                )}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-4">{activeTabContent}</div>
        </div>
      </div>
    </div>
  );
};

// Hook for managing tabs state externally
export const useTabs = (initialTab?: string) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab || "");

  return {
    activeTab,
    setActiveTab,
  };
};
