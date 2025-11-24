import React from "react";

const StrategyTagsHeader = ({ tags, loading, onRefresh }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Strategy Tags Management
          </h1>
          <p className="text-[0.7rem] text-gray-600 dark:text-gray-400 mt-1">
            Create and manage strategy tags with user-specific multipliers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-[0.7rem] font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            🔄 Refresh
          </button>
          <div className="text-center">
            <div className="text-[0.7rem] text-gray-500 dark:text-gray-400">
              Total Tags
            </div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {tags.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyTagsHeader;
