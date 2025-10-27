import React, { useState } from "react";

interface JsonViewerProps {
  data: any;
  title?: string;
  maxHeight?: string;
}

const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  title,
  maxHeight = "300px",
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const renderValue = (
    value: any,
    key: string = "",
    level: number = 0
  ): React.ReactElement => {
    const indent = "  ".repeat(level);

    if (value === null) {
      return <span className="text-gray-500">null</span>;
    }

    if (typeof value === "boolean") {
      return <span className="text-blue-600">{value.toString()}</span>;
    }

    if (typeof value === "number") {
      return <span className="text-green-600">{value}</span>;
    }

    if (typeof value === "string") {
      return <span className="text-orange-600">"{value}"</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-500">[]</span>;
      }

      return (
        <div>
          <span className="text-gray-700">[</span>
          {value.map((item, index) => (
            <div key={index} style={{ marginLeft: "20px" }}>
              {renderValue(item, index.toString(), level + 1)}
              {index < value.length - 1 && (
                <span className="text-gray-500">,</span>
              )}
            </div>
          ))}
          <span className="text-gray-700">]</span>
        </div>
      );
    }

    if (typeof value === "object") {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        return <span className="text-gray-500">{"{}"}</span>;
      }

      return (
        <div>
          <span className="text-gray-700">{"{"}</span>
          {entries.map(([objKey, objValue], index) => (
            <div key={objKey} style={{ marginLeft: "20px" }}>
              <span className="text-purple-600">"{objKey}"</span>
              <span className="text-gray-500">: </span>
              {renderValue(objValue, objKey, level + 1)}
              {index < entries.length - 1 && (
                <span className="text-gray-500">,</span>
              )}
            </div>
          ))}
          <span className="text-gray-700">{"}"}</span>
        </div>
      );
    }

    return <span className="text-gray-800">{String(value)}</span>;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {title && (
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? "Collapse" : "Expand"}
          </button>
        </div>
      )}
      <div
        className="p-4 font-mono text-xs overflow-auto"
        style={{
          maxHeight: isExpanded ? "none" : maxHeight,
          backgroundColor: "#f8f9fa",
        }}
      >
        {renderValue(data)}
      </div>
    </div>
  );
};

export default JsonViewer;
