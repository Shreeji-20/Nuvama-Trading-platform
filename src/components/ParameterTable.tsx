import React from "react";

/**
 * Reusable Parameter Table Component
 * Displays configuration parameters in a table format with optional editing
 */

interface ParameterRow {
  label: string;
  displayValue: string | number | React.ReactNode;
  editComponent?: React.ReactNode;
}

interface ParameterTableProps {
  title: string;
  colorDot: string;
  rows: ParameterRow[];
  isEditing?: boolean;
}

const ParameterTable: React.FC<ParameterTableProps> = ({
  title,
  colorDot,
  rows,
  isEditing = false,
}) => {
  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-3">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 ${colorDot} rounded-full`}></div>
        <h4 className="text-[0.6rem] font-semibold text-gray-900 dark:text-white">
          {title}
        </h4>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-600">
              <th className="text-center p-2 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                Parameter
              </th>
              <th className="text-center p-2 text-[0.6rem] font-semibold text-gray-700 dark:text-gray-300">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className={
                  index < rows.length - 1
                    ? "border-b border-gray-100 dark:border-gray-600"
                    : ""
                }
              >
                <td className="p-2 text-[0.6rem] text-center text-gray-700 dark:text-gray-300">
                  {row.label}
                </td>
                <td className="p-2">
                  {isEditing && row.editComponent ? (
                    row.editComponent
                  ) : (
                    <div className="text-[0.6rem] text-center font-semibold text-gray-900 dark:text-white">
                      {row.displayValue}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParameterTable;
