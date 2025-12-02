import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export interface AccordionItem {
  id: string | number;
  title: string | React.ReactNode;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpenIds?: (string | number)[];
  variant?: "default" | "bordered" | "separated";
  className?: string;
  onToggle?: (id: string | number, isOpen: boolean) => void;
  centered?: boolean;
  padding?: boolean | string;
}

const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpenIds = [],
  variant = "default",
  className = "",
  onToggle,
  centered = true,
  padding = true,
}) => {
  const getPaddingClasses = () => {
    if (padding === false) return "";
    if (typeof padding === "string") return padding;
    return "px-3 sm:px-4 md:px-6 py-4";
  };
  const [openIds, setOpenIds] = useState<Set<string | number>>(
    new Set(defaultOpenIds)
  );

  const toggle = (id: string | number) => {
    const newOpenIds = new Set(openIds);
    const willBeOpen = !openIds.has(id);

    if (allowMultiple) {
      if (willBeOpen) {
        newOpenIds.add(id);
      } else {
        newOpenIds.delete(id);
      }
    } else {
      newOpenIds.clear();
      if (willBeOpen) {
        newOpenIds.add(id);
      }
    }

    setOpenIds(newOpenIds);
    onToggle?.(id, willBeOpen);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "bordered":
        return {
          container:
            "border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden",
          item: "border-b border-gray-200 dark:border-gray-700 last:border-b-0",
          header:
            "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/70",
          content: "bg-gray-50 dark:bg-gray-900/50",
        };
      case "separated":
        return {
          container: "space-y-3",
          item: "border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm",
          header:
            "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/70",
          content: "bg-gray-50 dark:bg-gray-900/50",
        };
      case "default":
      default:
        return {
          container: "space-y-2",
          item: "rounded-lg overflow-hidden",
          header:
            "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
          content: "bg-white dark:bg-gray-900",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={`${
        centered ? "max-w-[100rem] mx-auto" : "w-full"
      } ${getPaddingClasses()}`}
    >
      <div className={`w-full ${styles.container} ${className}`}>
        {items.map((item) => {
          const isOpen = openIds.has(item.id);
          const isDisabled = item.disabled;

          return (
            <div key={item.id} className={styles.item}>
              {/* Accordion Header */}
              <button
                onClick={() => !isDisabled && toggle(item.id)}
                disabled={isDisabled}
                className={`
                w-full px-4 py-3 flex items-center justify-between 
                transition-all duration-200
                ${styles.header}
                ${
                  isDisabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              `}
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  {item.icon && (
                    <span className="flex-shrink-0 text-gray-600 dark:text-gray-400">
                      {item.icon}
                    </span>
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.title}
                  </span>
                </div>

                <span
                  className={`
                  flex-shrink-0 transition-transform duration-200 
                  text-gray-600 dark:text-gray-400
                  ${isOpen ? "transform rotate-0" : ""}
                `}
                >
                  {isOpen ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </span>
              </button>

              {/* Accordion Content */}
              {isOpen && (
                <div
                  className={`
                  ${getPaddingClasses()}border-t border-gray-200 dark:border-gray-700
                  ${styles.content}
                  text-sm text-gray-700 dark:text-gray-300
                  animate-in fade-in slide-in-from-top-2 duration-200
                `}
                >
                  {item.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Accordion;
