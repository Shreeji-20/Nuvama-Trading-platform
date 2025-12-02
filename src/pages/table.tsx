import {
  useReactTable,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  PaginationState,
  ColumnSizingState,
} from "@tanstack/react-table";
import {
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import React, { useMemo, useState, CSSProperties } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// Types
interface CellStyle {
  bgColor?: string;
  textColor?: string;
  rounded?: string;
}

interface EditingCell {
  rowIndex: number;
  columnId: string;
}

interface ButtonConfig {
  label: string | ((rowData: any, rowIndex: number) => string);
  onClick: (rowData: any, rowIndex: number) => void;
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "warning"
    | "light"
    | "dark";
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean | ((rowData: any, rowIndex: number) => boolean);
}

interface HeaderButtonConfig {
  label: string;
  onClick: () => void;
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "warning"
    | "light"
    | "dark";
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

interface ReactTableProps {
  data: any[];
  title?: string;
  description?: string;
  showHeader?: boolean;
  headerStyle?: "card" | "inline"; // "card" = separate card above table, "inline" = label inside table card
  headerGap?: boolean; // Controls gap between header and table (only for card style)
  showFooter?: boolean;
  showFilters?: boolean;
  cellStyler?: (value: any, columnId: string, rowData: any) => CellStyle | null;
  rounded?: boolean;
  columnOrder?: string[] | null;
  hideColumns?: string[];
  fullHeight?: boolean;
  columnLabels?: Record<string, string>;
  scrollMode?: boolean;
  maxScrollHeight?: string;
  editable?: boolean;
  editableColumns?: string[];
  centered?: boolean;
  padding?: boolean | string;
  enableColumnResizing?: boolean;
  onCellEdit?: (
    rowIndex: number,
    columnId: string,
    newValue: any,
    rowData: any
  ) => void;
  cellInputType?: Record<
    string,
    "text" | "number" | "select" | "checkbox" | "password"
  >;
  dropdownOptions?: Record<string, string[]>;
  buttonColumns?: Record<string, ButtonConfig | ButtonConfig[]>;
  headerButtons?: HeaderButtonConfig[];
  showAddRow?: boolean;
  onAddRow?: (newRowData: any) => void;
  defaultRowValues?: any;
  addRowFields?: Array<{
    key: string;
    label: string;
    type?: "text" | "number" | "select" | "checkbox" | "password";
    options?: string[];
    required?: boolean;
  }>;
}

// Utility function to generate columns from data
const generateColumns = (data: any[]): ColumnDef<any>[] => {
  if (!data || data.length === 0) return [];

  const firstRow = data[0];
  const columns: ColumnDef<any>[] = [];

  const processObject = (obj: any, prefix = ""): void => {
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

export const ReactTable: React.FC<ReactTableProps> = ({
  data = [],
  title = "Data Table",
  description = "Displaying table data",
  showHeader = true,
  headerStyle = "card",
  headerGap = true,
  showFooter = true,
  showFilters = true,
  cellStyler = null,
  rounded = false,
  columnOrder = null,
  hideColumns = [],
  fullHeight = true,
  columnLabels = {},
  scrollMode = false,
  maxScrollHeight = "500px",
  editable = false,
  editableColumns = [],
  onCellEdit = null,
  cellInputType = {},
  dropdownOptions = {},
  buttonColumns = {},
  headerButtons = [],
  showAddRow = false,
  onAddRow = null,
  defaultRowValues = {},
  addRowFields = [],
  centered = true,
  enableColumnResizing = false,
  padding = true,
}) => {
  const getPaddingClasses = () => {
    if (padding === false) return "";
    if (typeof padding === "string") return padding;
    return fullHeight
      ? "p-3 sm:p-4 md:p-6"
      : "px-[4px] py-[4px] sm:px-4 md:px-6";
  };

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Auto-generate columns from data
  const columns = useMemo(() => {
    let generatedColumns = generateColumns(data);

    // Filter out hidden columns
    if (hideColumns && hideColumns.length > 0) {
      generatedColumns = generatedColumns.filter(
        (col: any) => !hideColumns.includes(col.accessorKey)
      );
    }

    // Reorder columns if columnOrder is provided
    if (columnOrder && Array.isArray(columnOrder)) {
      const orderedColumns: ColumnDef<any>[] = [];
      const columnMap = new Map(
        generatedColumns.map((col: any) => [col.accessorKey, col])
      );

      // Add columns in the specified order
      columnOrder.forEach((colId) => {
        if (columnMap.has(colId)) {
          orderedColumns.push(columnMap.get(colId)!);
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

    return columns.map((col: any) => ({
      ...col,
      header: columnLabels[col.accessorKey] || col.header,
    }));
  }, [columns, columnLabels]);

  // Helper function to get cell styling
  const getCellStyle = (
    value: any,
    columnId: string,
    rowData: any
  ): CellStyle => {
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

  // Helper function to check if a column is editable
  const isColumnEditable = (columnId: string): boolean => {
    if (!editable) return false;
    if (editableColumns.length === 0) return true; // All columns editable if none specified
    return editableColumns.includes(columnId);
  };

  // Handle cell click to enter edit mode
  const handleCellClick = (
    rowIndex: number,
    columnId: string,
    currentValue: any
  ): void => {
    if (isColumnEditable(columnId)) {
      // For checkbox type, toggle immediately without entering edit mode
      if (cellInputType[columnId] === "checkbox") {
        const newValue = currentValue === true || currentValue === "true";
        if (onCellEdit && typeof onCellEdit === "function") {
          onCellEdit(rowIndex, columnId, !newValue, data[rowIndex]);
        }
      } else {
        setEditingCell({ rowIndex, columnId });
        setEditValue(currentValue?.toString() || "");
      }
    }
  };

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    setEditValue(e.target.value);
  };

  // Handle save (blur or Enter key)
  const handleSave = (
    rowIndex: number,
    columnId: string,
    rowData: any
  ): void => {
    if (onCellEdit && typeof onCellEdit === "function") {
      onCellEdit(rowIndex, columnId, editValue, rowData);
    }
    setEditingCell(null);
    setEditValue("");
  };

  // Handle cancel (Escape key)
  const handleCancel = (): void => {
    setEditingCell(null);
    setEditValue("");
  };

  // Handle key down in edit input
  const handleKeyDown = (
    e: React.KeyboardEvent,
    rowIndex: number,
    columnId: string,
    rowData: any
  ): void => {
    if (e.key === "Enter") {
      handleSave(rowIndex, columnId, rowData);
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  // Get button variant classes
  const getButtonVariantClasses = (variant?: string): string => {
    switch (variant) {
      case "primary":
        return "bg-blue-600 hover:bg-blue-700 text-white";
      case "secondary":
        return "bg-gray-600 hover:bg-gray-700 text-white";
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "success":
        return "bg-green-600 hover:bg-green-700 text-white";
      case "warning":
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case "light":
        return "bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white";
      case "dark":
        return "bg-gray-800 hover:bg-gray-900 text-white dark:bg-gray-200 dark:hover:bg-gray-300 dark:text-gray-900";
      default:
        return "bg-blue-600 hover:bg-blue-700 text-white";
    }
  };

  // Render button(s) for a cell
  const renderButtonCell = (
    columnId: string,
    rowData: any,
    rowIndex: number
  ): React.ReactNode => {
    const buttonConfig = buttonColumns[columnId];
    if (!buttonConfig) return null;

    const configs = Array.isArray(buttonConfig) ? buttonConfig : [buttonConfig];

    return (
      <div className="flex items-center justify-center gap-2">
        {configs.map((config, idx) => {
          const buttonLabel =
            typeof config.label === "function"
              ? config.label(rowData, rowIndex)
              : config.label;

          const isDisabled =
            typeof config.disabled === "function"
              ? config.disabled(rowData, rowIndex)
              : config.disabled;

          return (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                if (!isDisabled) {
                  config.onClick(rowData, rowIndex);
                }
              }}
              disabled={isDisabled}
              className={`px-3 py-1 text-[11px] font-medium rounded transition-colors flex items-center gap-1 ${
                config.className || getButtonVariantClasses(config.variant)
              } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {config.icon && <span>{config.icon}</span>}
              {buttonLabel}
            </button>
          );
        })}
      </div>
    );
  };

  // Handle add row - directly adds row with default values
  const handleAddRow = (): void => {
    if (onAddRow && typeof onAddRow === "function") {
      onAddRow(defaultRowValues);
    }
  };

  const table = useReactTable({
    data,
    columns: finalColumns,
    state: {
      sorting,
      columnFilters,
      ...(scrollMode ? {} : { pagination }),
      ...(enableColumnResizing ? { columnSizing } : {}),
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    ...(scrollMode ? {} : { onPaginationChange: setPagination }),
    ...(enableColumnResizing ? { onColumnSizingChange: setColumnSizing } : {}),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(scrollMode ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    autoResetPageIndex: false,
    ...(enableColumnResizing ? { columnResizeMode: "onChange" as const } : {}),
  });

  const isEmpty = !data || data.length === 0;

  return (
    <div className={centered ? "max-w-[100rem] mx-auto" : "w-full"}>
      <div
        className={`${
          fullHeight ? " min-h-screen" : ""
        } bg-gray-50 dark:bg-gray-900 ${getPaddingClasses()}`}
      >
        <div className="">
          {/* Header Card - Only show if headerStyle is "card" */}
          {showHeader && headerStyle === "card" && (
            <div
              className={`bg-white shadow-lg border border-gray-200 dark:bg-gray-800 p-4 sm:p-5 md:p-6 ${
                headerGap
                  ? "rounded-lg sm:rounded-xl mb-4 sm:mb-5 md:mb-6 shadow-lg border border-gray-200 dark:border-gray-700"
                  : ""
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {title}
                  </h1>
                  <p className="text-[0.7rem] sm:text-xs text-gray-600 dark:text-gray-400">
                    {description}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {headerButtons.map((button, idx) => (
                    <button
                      key={idx}
                      onClick={button.onClick}
                      disabled={button.disabled}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                        button.className ||
                        getButtonVariantClasses(button.variant)
                      } ${
                        button.disabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {button.icon && (
                        <span className="w-3.5 h-3.5">{button.icon}</span>
                      )}
                      {button.label}
                    </button>
                  ))}
                  {showAddRow && (
                    <button
                      onClick={handleAddRow}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <span>+</span>
                      Add Row
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Table Card */}
          <div
            className={`bg-white dark:bg-gray-800 overflow-hidden ${
              showHeader && headerStyle === "card" && !headerGap
                ? "rounded-b-xl shadow-lg border border-gray-200 dark:border-gray-700"
                : "shadow-lg border border-gray-200 dark:border-gray-700"
            }`}
          >
            {/* Inline Header - Only show if headerStyle is "inline" */}
            {showHeader && headerStyle === "inline" && (
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h2>
                  {description && (
                    <p className="text-[0.65rem] text-gray-600 dark:text-gray-400 mt-0.5">
                      {description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {headerButtons.map((button, idx) => (
                    <button
                      key={idx}
                      onClick={button.onClick}
                      disabled={button.disabled}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                        button.className ||
                        getButtonVariantClasses(button.variant)
                      } ${
                        button.disabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {button.icon && (
                        <span className="w-3.5 h-3.5">{button.icon}</span>
                      )}
                      {button.label}
                    </button>
                  ))}
                  {showAddRow && (
                    <button
                      onClick={handleAddRow}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>+</span>
                      Add Row
                    </button>
                  )}
                </div>
              </div>
            )}

            {isEmpty ? (
              <div className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No data available
                </p>
              </div>
            ) : (
              <div
                className={`overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500 scrollbar-thumb-rounded-full ${
                  scrollMode ? "overflow-y-auto" : ""
                }`}
                style={
                  scrollMode
                    ? ({ maxHeight: maxScrollHeight } as CSSProperties)
                    : {}
                }
              >
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
                              className={`text-center px-4 py-3 text-[0.63rem] font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap first:rounded-tl-xl last:rounded-tr-xl ${
                                scrollMode
                                  ? "bg-gray-50 dark:bg-gray-800"
                                  : "bg-gray-50/50 dark:bg-gray-800/50"
                              }`}
                              style={{
                                width: enableColumnResizing
                                  ? header.getSize()
                                  : "auto",
                                position: "relative",
                              }}
                            >
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={header.column.getToggleSortingHandler()}
                                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                  <span>
                                    {header.column.columnDef.header as string}
                                  </span>
                                  <span className="flex flex-col">
                                    {header.column.getIsSorted() === "asc" ? (
                                      <ChevronUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                    ) : header.column.getIsSorted() ===
                                      "desc" ? (
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
                              {enableColumnResizing && (
                                <div
                                  onMouseDown={header.getResizeHandler()}
                                  onTouchStart={header.getResizeHandler()}
                                  className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-blue-500 ${
                                    header.column.getIsResizing()
                                      ? "bg-blue-500"
                                      : "bg-gray-300 dark:bg-gray-600"
                                  }`}
                                  style={{
                                    transform: header.column.getIsResizing()
                                      ? "scaleX(2)"
                                      : "scaleX(1)",
                                    transition: "transform 0.2s",
                                  }}
                                />
                              )}
                            </th>
                          ))}
                        </tr>
                        {/* Filter Row */}
                        {showFilters && (
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
                                  value={
                                    (header.column.getFilterValue() ??
                                      "") as string
                                  }
                                  onChange={(e) =>
                                    header.column.setFilterValue(e.target.value)
                                  }
                                  placeholder={`Filter...`}
                                  className="w-full px-3 py-1.5 text-[11px] border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                                />
                              </th>
                            ))}
                          </tr>
                        )}
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
                          const isEditing =
                            editingCell?.rowIndex === row.index &&
                            editingCell?.columnId === cell.column.id;
                          const canEdit = isColumnEditable(cell.column.id);

                          return (
                            <td
                              key={cell.id}
                              className="px-4 text-center text-[11px] max-w-xs h-[2.5rem]"
                              title={cellValue ? String(cellValue) : undefined}
                              onClick={() =>
                                !isEditing &&
                                !buttonColumns[cell.column.id] &&
                                handleCellClick(
                                  row.index,
                                  cell.column.id,
                                  cellValue
                                )
                              }
                            >
                              {buttonColumns[cell.column.id] ? (
                                renderButtonCell(
                                  cell.column.id,
                                  row.original,
                                  row.index
                                )
                              ) : isEditing ? (
                                cellInputType[cell.column.id] === "select" ? (
                                  <select
                                    value={editValue}
                                    onChange={handleInputChange}
                                    onBlur={() =>
                                      handleSave(
                                        row.index,
                                        cell.column.id,
                                        row.original
                                      )
                                    }
                                    onKeyDown={(e) =>
                                      handleKeyDown(
                                        e,
                                        row.index,
                                        cell.column.id,
                                        row.original
                                      )
                                    }
                                    autoFocus
                                    className="max-w-[120px] h-[1.75rem] px-2 py-0.5 text-[11px] border border-blue-500 dark:border-blue-400 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50"
                                  >
                                    {dropdownOptions[cell.column.id]?.map(
                                      (option) => (
                                        <option key={option} value={option}>
                                          {option}
                                        </option>
                                      )
                                    )}
                                  </select>
                                ) : (
                                  <input
                                    type={
                                      cellInputType[cell.column.id] || "text"
                                    }
                                    value={editValue}
                                    onChange={handleInputChange}
                                    onBlur={() =>
                                      handleSave(
                                        row.index,
                                        cell.column.id,
                                        row.original
                                      )
                                    }
                                    onKeyDown={(e) =>
                                      handleKeyDown(
                                        e,
                                        row.index,
                                        cell.column.id,
                                        row.original
                                      )
                                    }
                                    autoFocus
                                    className="max-w-[120px] h-[1.75rem] px-2 py-0.5 text-[11px] border border-blue-500 dark:border-blue-400 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50"
                                  />
                                )
                              ) : (
                                <div
                                  className={`truncate ${
                                    cellStyle.bgColor || ""
                                  } ${
                                    cellStyle.textColor ||
                                    "text-gray-900 dark:text-gray-100"
                                  } ${cellStyle.rounded || ""} ${
                                    cellStyle.bgColor ? "px-2 py-1" : ""
                                  } ${
                                    canEdit
                                      ? "cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                      : ""
                                  }`}
                                >
                                  {cellInputType[cell.column.id] === "checkbox"
                                    ? cellValue === true || cellValue === "true"
                                      ? "✓ True"
                                      : "✗ False"
                                    : (cellValue as string)}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            {showFooter && !scrollMode && !isEmpty && (
              <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30 px-4 py-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Page Info */}
                  <div className="flex items-center gap-2 text-[0.7rem] sm:text-xs text-gray-600 dark:text-gray-300">
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
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
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
                      <span className="px-2 text-xs text-gray-700 dark:text-gray-300 font-medium">
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
    </div>
  );
};
