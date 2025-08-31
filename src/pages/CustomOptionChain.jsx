import React, { useState, useEffect, useRef } from "react";
import { useMemo, useCallback } from "react";
import IndexCards from "../components/IndexCards";
import config from "../config/api";

async function fetchLegPrice(
  symbol,
  expiry,
  strikeprice,
  optiontype,
  orderType
) {
  // This function now expects data as an argument
  // Filtering logic only
  const match = (data || []).find(
    (item) =>
      item?.response?.data?.symbolname?.includes(symbol) &&
      String(item?.response?.data?.expiry) === String(expiry) &&
      Number(item?.response?.data?.strikeprice) === Number(strikeprice) &&
      item?.response?.data?.optiontype === optiontype
  );

  if (!match) return null;

  const d = match.response.data;
  return orderType === "buy"
    ? d.askValues?.[0]?.price ?? null // Buy → Ask
    : d.bidValues?.[0]?.price ?? null; // Sell → Bid
}

const SpreadPage = () => {
  const [rows, setRows] = useState([]);
  // Memoized filter function for leg price
  const filterLegPrice = useCallback(
    (data, symbol, expiry, strikeprice, optiontype, orderType) => {
      const match = (data || []).find(
        (item) =>
          item?.response?.data?.symbolname?.includes(symbol) &&
          String(item?.response?.data?.expiry) === String(expiry) &&
          Number(item?.response?.data?.strikeprice) === Number(strikeprice) &&
          item?.response?.data?.optiontype === optiontype
      );
      if (!match) return null;
      const d = match.response.data;
      return orderType === "buy"
        ? d.askValues?.[0]?.price ?? null // Buy → Ask
        : d.bidValues?.[0]?.price ?? null; // Sell → Bid
    },
    []
  );

  // Memoized updateSpreads
  const updateSpreads = useCallback(async () => {
    if (!Array.isArray(rows) || rows.length === 0) {
      setDisplayRows([]);
      return;
    }
    // Fetch optiondata once
    let optionData = [];
    try {
      const res = await fetch(config.buildUrl(config.ENDPOINTS.OPTIONDATA));
      if (!res.ok) throw new Error("Failed to fetch optiondata");
      optionData = await res.json();
    } catch (err) {
      console.error("Error fetching optiondata:", err);
      setDisplayRows(rows.map((row) => ({ ...row, spread: null })));
      return;
    }
    const updatedRows = await Promise.all(
      rows.map(async (row) => {
        const leg1Price = filterLegPrice(
          optionData,
          row.index,
          row.leg1Expiry,
          row.leg1Strike,
          row.leg1OptionType,
          row.leg1OrderType
        );
        const leg2Price = filterLegPrice(
          optionData,
          row.index,
          row.leg2Expiry,
          row.leg2Strike,
          row.leg2OptionType,
          row.leg2OrderType
        );
        const spread =
          leg1Price !== null && leg2Price !== null
            ? Number(leg1Price) + Number(leg2Price)
            : null;
        return { ...row, spread };
      })
    );
    setDisplayRows(updatedRows);
  }, [rows, filterLegPrice]);

  const [displayRows, setDisplayRows] = useState([]);
  const [form, setForm] = useState({
    index: "NIFTY",
    leg1Strike: "",
    leg1Expiry: "0",
    leg1OptionType: "CE",
    leg1OrderType: "buy",

    leg2Strike: "",
    leg2Expiry: "0",
    leg2OptionType: "PE",
    leg2OrderType: "sell",
  });

  const expiryOptions = useMemo(
    () => [
      { value: "0", label: "Current Week" },
      { value: "1", label: "Next Week" },
      { value: "2", label: "Week + 2" },
      { value: "3", label: "Week + 3" },
    ],
    []
  );

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ✅ Fetch existing spreads from server on mount
  useEffect(() => {
    const loadSpreads = async () => {
      try {
        const res = await fetch(config.buildUrl(config.ENDPOINTS.SPREADS));
        if (!res.ok) throw new Error("Failed to fetch spreads");
        const data = await res.json();
        console.log("Data : ", data);
        setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading spreads:", err);
      }
    };
    loadSpreads();
  }, []);

  // ✅ POST new spread to server
  const saveSpread = async (spread) => {
    try {
      const res = await fetch(config.buildUrl(config.ENDPOINTS.SPREADS), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spread),
      });
      if (!res.ok) throw new Error("Failed to save spread");
      console.log("Spread saved successfully");
    } catch (err) {
      console.error("Error saving spread:", err);
    }
  };

  // Add a spread to the watchlist & send to backend
  const fetchData = async () => {
    const newRow = {
      index: form.index,
      leg1Strike: form.leg1Strike,
      leg1Expiry: form.leg1Expiry,
      leg1OptionType: form.leg1OptionType,
      leg1OrderType: form.leg1OrderType,

      leg2Strike: form.leg2Strike,
      leg2Expiry: form.leg2Expiry,
      leg2OptionType: form.leg2OptionType,
      leg2OrderType: form.leg2OrderType,
      id: null, // will be set on backend
      spread: null, // will be updated in live fetch
    };

    await saveSpread(newRow); // ✅ save to server
    setRows((prev) => [...prev, newRow]);
  };

  // Live updater for spreads (fixed)
  useEffect(() => {
    let interval;
    updateSpreads();
    interval = setInterval(updateSpreads, 1000);
    return () => clearInterval(interval);
  }, [rows, updateSpreads]);

  // Handle inline edits
  const handleEdit = useCallback(
    (index, field, value) => {
      const updatedRows = [...rows];
      updatedRows[index][field] = value;
      setRows(updatedRows);
    },
    [rows]
  );

  // Delete a row
  const handleDelete = useCallback(
    (index) => {
      const this_row = rows[index];
      // Optionally send DELETE request to backend
      fetch(config.buildUrl(`${config.ENDPOINTS.SPREADS}/${this_row.id}`), {
        method: "DELETE",
      });
      setRows((prev) => prev.filter((_, i) => i !== index));
    },
    [rows]
  );

  return (
    <div className="p-4 md:p-6 space-y-6 app-container bg-white dark:bg-gray-900 min-h-full transition-colors duration-300">
      {/* Index Cards */}
      <IndexCards indices={["NIFTY", "SENSEX"]} className="" />

      {/* Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 border border-gray-300 dark:border-gray-600 p-4 rounded-lg shadow bg-white dark:bg-gray-800 transition-colors duration-300">
        {/* Index */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Index
          </label>
          <select
            name="index"
            value={form.index}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
          >
            <option value="NIFTY">NIFTY</option>
            <option value="SENSEX">SENSEX</option>
          </select>
        </div>

        {/* Leg 1 Strike */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Leg 1 Strike
          </label>
          <input
            name="leg1Strike"
            type="number"
            value={form.leg1Strike}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
          />
        </div>

        {/* Leg 1 Expiry */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Leg 1 Expiry
          </label>
          <select
            name="leg1Expiry"
            value={form.leg1Expiry}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
          >
            {expiryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Leg 1 Option Type */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Leg 1 Option Type
          </label>
          <select
            name="leg1OptionType"
            value={form.leg1OptionType}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
          >
            <option value="CE">Call (CE)</option>
            <option value="PE">Put (PE)</option>
          </select>
        </div>

        {/* Leg 1 Order Type */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Leg 1 Order Type
          </label>
          <select
            name="leg1OrderType"
            value={form.leg1OrderType}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>

        {/* Leg 2 Strike */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Leg 2 Strike
          </label>
          <input
            name="leg2Strike"
            type="number"
            value={form.leg2Strike}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
          />
        </div>

        {/* Leg 2 Expiry */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Leg 2 Expiry
          </label>
          <select
            name="leg2Expiry"
            value={form.leg2Expiry}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
          >
            {expiryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Leg 2 Option Type */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Leg 2 Option Type
          </label>
          <select
            name="leg2OptionType"
            value={form.leg2OptionType}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
          >
            <option value="CE">Call (CE)</option>
            <option value="PE">Put (PE)</option>
          </select>
        </div>

        {/* Leg 2 Order Type */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Leg 2 Order Type
          </label>
          <select
            name="leg2OrderType"
            value={form.leg2OrderType}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>

        {/* Submit */}
        <div className="flex items-end">
          <button
            onClick={fetchData}
            className="bg-blue-500 dark:bg-blue-600 text-white rounded p-2 w-full hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Add Spread
          </button>
        </div>
      </div>

      {/* Spread Table */}
      {displayRows.length > 0 && (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-600 transition-colors duration-300">
          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 transition-colors duration-300">
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-gray-900 dark:text-white">
                  Leg 1
                </th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-gray-900 dark:text-white">
                  Leg 2
                </th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-gray-900 dark:text-white">
                  Spread
                </th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-gray-900 dark:text-white">
                    {`${row.leg1Strike} ${row.leg1OptionType} (${row.leg1OrderType})`}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-gray-900 dark:text-white">
                    {`${row.leg2Strike} ${row.leg2OptionType} (${row.leg2OrderType})`}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-gray-900 dark:text-white font-mono">
                    {row.spread !== null &&
                    row.spread !== undefined &&
                    row.spread !== ""
                      ? Number(row.spread).toFixed(2)
                      : ""}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                    <button
                      onClick={() => handleDelete(i)}
                      className="bg-red-500 dark:bg-red-600 text-white px-3 py-1 rounded hover:bg-red-600 dark:hover:bg-red-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SpreadPage;
