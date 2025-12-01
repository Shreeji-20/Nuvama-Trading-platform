import React, { ReactNode, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
  footer?: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg" | "xl";
  rounded?: "none" | "sm" | "md" | "lg" | "xl";
  border?: boolean;
  fullHeight?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  quickData?: ReactNode;
  onToggle?: (isCollapsed: boolean) => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  title,
  subtitle,
  headerAction,
  footer,
  padding = "md",
  shadow = "lg",
  rounded = "xl",
  border = true,
  fullHeight = false,
  collapsible = false,
  defaultCollapsed = false,
  quickData,
  onToggle,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onToggle?.(newState);
  };
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-6",
    lg: "p-8",
  };

  const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  };

  const roundedClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
  };

  return (
    <div
      className={`
        bg-white dark:bg-gray-800
        ${shadowClasses[shadow]}
        ${roundedClasses[rounded]}
        ${border ? "border border-gray-200 dark:border-gray-700" : ""}
        ${fullHeight ? "h-full" : ""}
        ${className}
      `}
    >
      {/* Card Header */}
      {(title || subtitle || headerAction || collapsible) && (
        <div
          className={`flex items-center justify-between ${
            !isCollapsed ? "border-b border-gray-200 dark:border-gray-700" : ""
          } ${paddingClasses[padding]}`}
        >
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && !isCollapsed && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {headerAction && <div>{headerAction}</div>}
            {collapsible && (
              <button
                onClick={handleToggle}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                aria-label={isCollapsed ? "Expand" : "Collapse"}
              >
                {isCollapsed ? (
                  <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Data Preview (shown when collapsed) */}
      {collapsible && isCollapsed && quickData && (
        <div
          className={`${paddingClasses[padding]} border-t border-gray-200 dark:border-gray-700`}
        >
          {quickData}
        </div>
      )}

      {/* Card Body (hidden when collapsed) */}
      {!isCollapsed && (
        <>
          <div className={paddingClasses[padding]}>{children}</div>

          {/* Card Footer */}
          {footer && (
            <div
              className={`border-t border-gray-200 dark:border-gray-700 ${paddingClasses[padding]}`}
            >
              {footer}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Card;
