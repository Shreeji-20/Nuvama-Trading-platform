import React, { memo } from "react";

const LoadingSpinner = memo(({ message = "Loading..." }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{message}</p>
    </div>
  );
});

LoadingSpinner.displayName = "LoadingSpinner";

const EmptyState = memo(
  ({ icon = "📋", message = "No data available", description }) => {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
        <div className="text-gray-400 dark:text-gray-500 mb-2">
          {typeof icon === "string" ? (
            <div className="text-4xl mb-2">{icon}</div>
          ) : (
            icon
          )}
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {message}
        </p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";

export { LoadingSpinner, EmptyState };
