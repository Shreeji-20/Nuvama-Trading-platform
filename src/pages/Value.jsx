import React, { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [data, setData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filters, setFilters] = useState({
    symbol: "",
    ltp: "",
    vloume: "",
    value: "",
  });

  const DEV_BASE_URL = "http://localhost:8000";
  const API_URL = `${DEV_BASE_URL}/livedata`;

  // Fetch every 1s
  useEffect(() => {
    const fetchData = () => {
      fetch(API_URL)
        .then((res) => res.json())
        .then((json) => setData(json))
        .catch((err) => console.error("Error fetching data:", err));
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  // Enhance each row with computed fields: numeric LTP/value and percent change vs prev_close_price
  const enhancedData = data.map((item) => {
    const ltpNum = Number(item.ltp) || 0;
    const volumeNum = Number(item.vloume) || 0;
    const value = volumeNum * ltpNum;
    const prevClose = Number(item.prev_close_price);
    const hasPrev = !Number.isNaN(prevClose) && prevClose !== 0;
    const percentChange = hasPrev
      ? ((ltpNum - prevClose) / prevClose) * 100
      : 0;
    const trend = hasPrev
      ? ltpNum > prevClose
        ? "up"
        : ltpNum < prevClose
        ? "down"
        : "flat"
      : "flat";
    return {
      ...item,
      ltpNum,
      volumeNum,
      value,
      percentChange,
      trend,
    };
  });

  // Sort logic
  const sortedData = React.useMemo(() => {
    let sortableItems = [...enhancedData];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [enhancedData, sortConfig]);

  // Filter logic
  const filteredData = sortedData.filter((row) =>
    Object.keys(filters).every((key) =>
      row[key]?.toString().toLowerCase().includes(filters[key].toLowerCase())
    )
  );

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mx-auto p-4 max-w-6xl">
      <h2 className="text-2xl font-semibold mb-4">📊 Live Stock Data</h2>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-3 flex items-center justify-between border-b">
          <div className="text-sm text-gray-600">
            Rows: <span className="font-semibold">{filteredData.length}</span>
          </div>
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredData.length}</span>{" "}
            symbols
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="max-h-[70vh] overflow-y-auto">
            <table className="min-w-full divide-y table-fixed">
              <thead className="bg-gradient-to-r from-sky-600 to-indigo-600 text-white sticky top-0 z-10">
                <tr>
                  <th
                    className="p-3 text-left cursor-pointer"
                    onClick={() => requestSort("symbol")}
                  >
                    Symbol{" "}
                    {sortConfig.key === "symbol"
                      ? sortConfig.direction === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th
                    className="p-3 text-right cursor-pointer"
                    onClick={() => requestSort("ltp")}
                  >
                    LTP{" "}
                    {sortConfig.key === "ltp"
                      ? sortConfig.direction === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th
                    className="p-3 text-right cursor-pointer"
                    onClick={() => requestSort("vloume")}
                  >
                    Volume{" "}
                    {sortConfig.key === "vloume"
                      ? sortConfig.direction === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th
                    className="p-3 text-right cursor-pointer"
                    onClick={() => requestSort("value")}
                  >
                    Value (Cr)
                  </th>
                </tr>
                <tr className="bg-gray-50">
                  <th className="p-2">
                    <input
                      type="text"
                      value={filters.symbol}
                      onChange={(e) =>
                        handleFilterChange("symbol", e.target.value)
                      }
                      placeholder="Filter Symbol"
                      className="w-full p-2 border rounded"
                    />
                  </th>
                  <th className="p-2">
                    <input
                      type="text"
                      value={filters.ltp}
                      onChange={(e) =>
                        handleFilterChange("ltp", e.target.value)
                      }
                      placeholder="Filter LTP"
                      className="w-full p-2 border rounded text-right"
                    />
                  </th>
                  <th className="p-2">
                    <input
                      type="text"
                      value={filters.vloume}
                      onChange={(e) =>
                        handleFilterChange("vloume", e.target.value)
                      }
                      placeholder="Filter Volume"
                      className="w-full p-2 border rounded text-right"
                    />
                  </th>
                  <th className="p-2">
                    <input
                      type="text"
                      value={filters.value}
                      onChange={(e) =>
                        handleFilterChange("value", e.target.value)
                      }
                      placeholder="Filter Value"
                      className="w-full p-2 border rounded text-right"
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                {filteredData.length > 0 ? (
                  filteredData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-3 text-left font-medium">
                        {row.symbol}
                      </td>
                      <td className="p-3 text-right">
                        <div
                          className={`text-lg font-semibold ${
                            row.trend === "up"
                              ? "text-green-600"
                              : row.trend === "down"
                              ? "text-red-600"
                              : "text-black"
                          }`}
                        >
                          {Number(row.ltpNum).toFixed(2)}
                        </div>
                        {row.prev_close_price ? (
                          <div
                            className={`text-sm ${
                              row.trend === "up"
                                ? "text-green-600"
                                : row.trend === "down"
                                ? "text-red-600"
                                : "text-black"
                            }`}
                          >
                            {row.percentChange >= 0 ? "+" : ""}
                            {Number(row.percentChange).toFixed(2)}%
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">-</div>
                        )}
                      </td>
                      <td className="p-3 text-right text-lg font-semibold text-gray-800">
                        {Number(row.volumeNum).toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-lg font-semibold text-gray-800">
                        {(Number(row.value) / 10000000).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-gray-500">
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
