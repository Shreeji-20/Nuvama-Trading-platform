import React from "react";
import { Filter, X, Search } from "lucide-react";
import { Strategy } from "../../types/deployedStrategies.types";
import { StrategyTag } from "../../types/strategy.types";

export interface FilterOptions {
  symbol: string;
  tag: string;
  status: string;
  showSelectedOnly: boolean;
  executionMode: string;
  searchText: string;
}

interface StrategiesFilterProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  strategies: Strategy[];
  filteredStrategies: Strategy[];
  availableTags: StrategyTag[];
  symbolOptions: string[];
}

const StrategiesFilter: React.FC<StrategiesFilterProps> = ({
  filters,
  onFiltersChange,
  strategies,
  filteredStrategies,
  availableTags,
  symbolOptions,
}) => {
  const updateFilter = (key: keyof FilterOptions, value: string | boolean) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      symbol: "",
      tag: "",
      status: "",
      showSelectedOnly: false,
      executionMode: "",
      searchText: "",
    });
  };

  const hasActiveFilters =
    filters.symbol ||
    filters.tag ||
    filters.status ||
    filters.showSelectedOnly ||
    filters.executionMode ||
    filters.searchText;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Filter Strategies
          </h3>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
              Active
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <X className="w-3 h-3" />
            Clear All
          </button>
        )}
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
        {/* Search Text */}
        <div className="col-span-full">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search Strategy Name/ID
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.searchText}
              onChange={(e) => updateFilter("searchText", e.target.value)}
              placeholder="Search by name or ID..."
              className="w-full pl-10 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Symbol Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Symbol
          </label>
          <select
            value={filters.symbol}
            onChange={(e) => updateFilter("symbol", e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Symbols</option>
            {symbolOptions.map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </select>
        </div>

        {/* Tag Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tag
          </label>
          <select
            value={filters.tag}
            onChange={(e) => updateFilter("tag", e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Tags</option>
            {availableTags.map((tag) => (
              <option key={tag.id} value={tag.tagName}>
                {tag.tagName}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="running">Running</option>
            <option value="paused">Paused</option>
            <option value="stopped">Stopped</option>
          </select>
        </div>

        {/* Execution Mode Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Execution Mode
          </label>
          <select
            value={filters.executionMode}
            onChange={(e) => updateFilter("executionMode", e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Modes</option>
            <option value="Live Mode">Live Mode</option>
            <option value="Simulation Mode">Simulation Mode</option>
          </select>
        </div>

        {/* Selected Only Checkbox */}
        <div className="flex items-end">
          <label className="flex items-center gap-2 px-2 py-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showSelectedOnly}
              onChange={(e) =>
                updateFilter("showSelectedOnly", e.target.checked)
              }
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Selected Only
            </span>
          </label>
        </div>
      </div>

      {/* Filter Summary */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Showing:
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                {filteredStrategies.length} / {strategies.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Selected:
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                {
                  filteredStrategies.filter((s) => s.isSelectedForTrading)
                    .length
                }
              </span>
            </div>
            {filteredStrategies.length > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Running:
                  </span>
                  <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded">
                    {
                      filteredStrategies.filter(
                        (s) =>
                          (s.config as any)?.baseConfig?.tradingState ===
                          "START"
                      ).length
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Live Mode:
                  </span>
                  <span className="px-2 py-0.5 text-xs font-semibold bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
                    {
                      filteredStrategies.filter(
                        (s) =>
                          (s.config as any)?.baseConfig?.executionMode ===
                          "Live Mode"
                      ).length
                    }
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategiesFilter;
