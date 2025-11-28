import { useReactTable } from "@tanstack/react-table";
import {
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import React, { useMemo, useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// Utility function to generate columns from data
const generateColumns = (data) => {
  if (!data || data.length === 0) return [];

  const firstRow = data[0];
  const columns = [];

  const processObject = (obj, prefix = "") => {
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      const accessorKey = prefix ? `${prefix}.${key}` : key;

      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        // Nested object - recurse
        processObject(value, accessorKey);
      } else {
        // Primitive value or array - create column
        columns.push({
          accessorKey: accessorKey,
          header: key
            .replace(/([A-Z])/g, " $1") // Add space before capital letters
            .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
            .trim(),
        });
      }
    });
  };

  processObject(firstRow);
  return columns;
};

export const ReactTable = ({
  data = [],
  title = "Data Table",
  description = "Displaying table data",
  showHeader = true,
  showFooter = true,
  cellStyler = null, // Function: (value, columnId, rowData) => { bgColor, textColor, rounded }
  rounded = false, // Enable rounded corners on styled cells
  columnOrder = null, // Array: ['columnId1', 'columnId2', ...] to specify column order
  hideColumns = [], // Array: ['columnId1', 'columnId2', ...] to hide specific columns
  fullHeight = true, // Use min-h-screen (true) or auto height (false)
  columnLabels = {}, // Object: { 'columnId': 'Display Name', ... } to rename columns
  scrollMode = false, // Use vertical scroll (true) instead of pagination (false)
  maxScrollHeight = "500px", // Max height for scroll mode (e.g., '500px', '50vh')
}) => {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Auto-generate columns from data
  const columns = useMemo(() => {
    let generatedColumns = generateColumns(data);

    // Filter out hidden columns
    if (hideColumns && hideColumns.length > 0) {
      generatedColumns = generatedColumns.filter(
        (col) => !hideColumns.includes(col.accessorKey)
      );
    }

    // Reorder columns if columnOrder is provided
    if (columnOrder && Array.isArray(columnOrder)) {
      const orderedColumns = [];
      const columnMap = new Map(
        generatedColumns.map((col) => [col.accessorKey, col])
      );

      // Add columns in the specified order
      columnOrder.forEach((colId) => {
        if (columnMap.has(colId)) {
          orderedColumns.push(columnMap.get(colId));
          columnMap.delete(colId);
        }
      });

      // Add remaining columns that weren't in columnOrder
      columnMap.forEach((col) => orderedColumns.push(col));

      return orderedColumns;
    }

    return generatedColumns;
  }, [data, columnOrder, hideColumns]);

  // Apply column label overrides
  const finalColumns = useMemo(() => {
    if (!columnLabels || Object.keys(columnLabels).length === 0) {
      return columns;
    }

    return columns.map((col) => ({
      ...col,
      header: columnLabels[col.accessorKey] || col.header,
    }));
  }, [columns, columnLabels]);

  // Helper function to get cell styling
  const getCellStyle = (value, columnId, rowData) => {
    if (!cellStyler || typeof cellStyler !== "function") {
      return { bgColor: "", textColor: "", rounded: "" };
    }
    const style = cellStyler(value, columnId, rowData) || {
      bgColor: "",
      textColor: "",
      rounded: "",
    };
    // Apply global rounded if enabled and no specific rounded class provided
    if (rounded && !style.rounded && style.bgColor) {
      style.rounded = "rounded-xl";
    }
    return style;
  };

  const table = useReactTable({
    data,
    columns: finalColumns,
    state: {
      sorting,
      columnFilters,
      ...(scrollMode ? {} : { pagination }), // Only add pagination state if not in scroll mode
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    ...(scrollMode ? {} : { onPaginationChange: setPagination }), // Only handle pagination if not in scroll mode
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(scrollMode ? {} : { getPaginationRowModel: getPaginationRowModel() }), // Only use pagination model if not in scroll mode
    autoResetPageIndex: false, // Prevent page reset on data change
  });

  if (!data || data.length === 0) {
    return (
      <div
        className={`${
          fullHeight ? "min-h-screen" : ""
        } bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 md:p-6`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No data available
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${
        fullHeight ? "min-h-screen" : ""
      } bg-gray-50 dark:bg-gray-900 ${
        fullHeight ? "p-3 sm:p-4 md:p-6" : "px-3 sm:px-4 md:px-6 py-2"
      }`}
    >
      <div className="max-w-[100rem] mx-auto">
        {/* Header Card */}
        {showHeader && (
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {title}
                </h1>
                <p className="text-[11px] sm:text-[11px] text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
          <div
            className={`overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500 scrollbar-thumb-rounded-full ${
              scrollMode ? "overflow-y-auto" : ""
            }`}
            style={scrollMode ? { maxHeight: maxScrollHeight } : {}}
          >
            {" "}
            <table className="w-full table-auto">
              <thead>
                {table.getHeaderGroups().map((group) => (
                  <React.Fragment key={group.id}>
                    <tr
                      className={`border-b-2 border-gray-100 dark:border-gray-700 ${
                        scrollMode ? "sticky top-0 z-20" : ""
                      }`}
                    >
                      {group.headers.map((header) => (
                        <th
                          key={header.id}
                          className={`text-center px-4 py-3 text-[11px] font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap first:rounded-tl-xl last:rounded-tr-xl ${
                            scrollMode
                              ? "bg-gray-50 dark:bg-gray-800"
                              : "bg-gray-50/50 dark:bg-gray-800/50"
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={header.column.getToggleSortingHandler()}
                              className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              <span>{header.column.columnDef.header}</span>
                              <span className="flex flex-col">
                                {header.column.getIsSorted() === "asc" ? (
                                  <ChevronUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                ) : header.column.getIsSorted() === "desc" ? (
                                  <ChevronDown className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                ) : (
                                  <div className="flex flex-col">
                                    <ChevronUp className="h-3 w-3 opacity-30" />
                                    <ChevronDown className="h-3 w-3 opacity-30 -mt-1.5" />
                                  </div>
                                )}
                              </span>
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                    {/* Filter Row */}
                    <tr
                      className={`border-b border-gray-100 dark:border-gray-700 ${
                        scrollMode ? "sticky top-[2.5rem] z-20" : ""
                      }`}
                    >
                      {group.headers.map((header) => (
                        <th
                          key={`${header.id}-filter`}
                          className={`px-4 py-2 ${
                            scrollMode
                              ? "bg-gray-50 dark:bg-gray-800"
                              : "bg-gray-50/30 dark:bg-gray-800/30"
                          }`}
                        >
                          <input
                            type="text"
                            value={header.column.getFilterValue() ?? ""}
                            onChange={(e) =>
                              header.column.setFilterValue(e.target.value)
                            }
                            placeholder={`Filter...`}
                            className="w-full px-3 py-1.5 text-[11px] border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                          />
                        </th>
                      ))}
                    </tr>
                  </React.Fragment>
                ))}
              </thead>

              <tbody>
                {table.getRowModel().rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`transition-all duration-150 hover:bg-gray-50 dark:hover:bg-gray-700/30 border-b border-gray-50 dark:border-gray-800 last:border-0 ${
                      index % 2 === 0
                        ? "bg-white dark:bg-gray-800"
                        : "bg-gray-50/30 dark:bg-gray-800/50"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const cellValue = cell.renderValue();
                      const cellStyle = getCellStyle(
                        cellValue,
                        cell.column.id,
                        row.original
                      );

                      return (
                        <td
                          key={cell.id}
                          className="px-4 py-3 text-center text-[11px] max-w-xs"
                          title={cellValue}
                        >
                          <div
                            className={`truncate ${cellStyle.bgColor || ""} ${
                              cellStyle.textColor ||
                              "text-gray-900 dark:text-gray-100"
                            } ${cellStyle.rounded || ""} ${
                              cellStyle.bgColor ? "px-2 py-1" : ""
                            }`}
                          >
                            {cellValue}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {showFooter && !scrollMode && (
            <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30 px-4 py-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Page Info */}
                <div className="flex items-center gap-2 text-[11px] sm:text-[11px] text-gray-600 dark:text-gray-300">
                  <span>
                    Showing{" "}
                    {table.getState().pagination.pageIndex *
                      table.getState().pagination.pageSize +
                      1}{" "}
                    to{" "}
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) *
                        table.getState().pagination.pageSize,
                      table.getFilteredRowModel().rows.length
                    )}{" "}
                    of {table.getFilteredRowModel().rows.length} entries
                  </span>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                  {/* Page Size Selector */}
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => {
                      table.setPageSize(Number(e.target.value));
                    }}
                    className="px-2 py-1 text-[11px] border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  >
                    {[5, 10, 25, 50, 100].map((pageSize) => (
                      <option key={pageSize} value={pageSize}>
                        {pageSize} rows
                      </option>
                    ))}
                  </select>

                  {/* Navigation Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => table.setPageIndex(0)}
                      disabled={!table.getCanPreviousPage()}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="First page"
                    >
                      <ChevronsLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>

                    {/* Page Number Display */}
                    <span className="px-2 text-[11px] text-gray-700 dark:text-gray-300 font-medium">
                      Page {table.getState().pagination.pageIndex + 1} of{" "}
                      {table.getPageCount()}
                    </span>

                    <button
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Next page"
                    >
                      <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() =>
                        table.setPageIndex(table.getPageCount() - 1)
                      }
                      disabled={!table.getCanNextPage()}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Last page"
                    >
                      <ChevronsRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
