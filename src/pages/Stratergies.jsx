// src/pages/Orders.jsx
import React, { useEffect, useMemo, useState } from "react";
import IndexCards from "../components/IndexCards";

// base URLs (development / production)
const DEV_BASE_URL = "http://localhost:8000";
const PROD_BASE_URL = "https://api.example.com"; // replace with real prod URL

export default function Stratergies() {
  // ----- Select options -----
  const SYMBOL_OPTIONS = ["NIFTY", "BANKNIFTY", "FINNIFTY", "SENSEX"];
  const BASE_LEG_OPTIONS = ["CE", "PE"];
  const ACTION_OPTIONS = ["buy", "sell"];
  const BID_ASK_AVG_OPTIONS = [1, 2, 3, 4, 5];
  const ORDER_TYPE = ["LIMIT", "MARKET"];

  // ----- Form state -----
  const [form, setForm] = useState({
    symbol: "NIFTY",
    order_type: "limit",
    quantity: 75, // Will be updated when lot sizes are fetched
    slices: 75, // Will be updated when lot sizes are fetched
    base_leg: "CE",
    // IOC removed
    IOC_timeout: 1, // keep if your backend expects it; remove if not needed
    call_strike: 24900,
    put_strike: 24400,
    desired_spread: 0,
    start_price: 0,
    user_ids: [], // <- multiple
    expiry: 0,
    no_of_bid_ask_average: 5,
    action: "buy",
    exit_start: 140.5,
    exit_desired_spread: 140.6,
    exit_price_gap: 1,
    note: "",
    run_state: 3,
  });

  // State for storing lot sizes from API
  const [lotSizes, setLotSizes] = useState({
    NIFTY: 75,
    BANKNIFTY: 25,
    FINNIFTY: 40,
    SENSEX: 10,
  });

  useEffect(() => {
    fetch(`${DEV_BASE_URL}/lotsizes`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // Process the fetched data - assuming data structure like:
        // { NIFTY: 75, BANKNIFTY: 25, FINNIFTY: 40, SENSEX: 10 }
        // or [{ symbol: "NIFTY", lotsize: 75 }, ...]
        if (data && typeof data === "object") {
          if (Array.isArray(data)) {
            // If data is array format
            const lotSizeMap = {};
            data.forEach((item) => {
              if (item.symbol && item.lotsize) {
                lotSizeMap[item.symbol] = item.lotsize;
              }
            });
            if (Object.keys(lotSizeMap).length > 0) {
              setLotSizes((prev) => ({ ...prev, ...lotSizeMap }));
            }
          } else {
            // If data is object format
            setLotSizes((prev) => ({ ...prev, ...data }));
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching lot sizes:", error);
      });
  }, []);

  // Get current symbol's lot size
  const getCurrentLotSize = () => {
    return lotSizes[form.symbol] || 75; // fallback to 75 if not found
  };

  // Update form quantities when lot sizes are fetched
  useEffect(() => {
    const currentLotSize = getCurrentLotSize();
    setForm((prev) => ({
      ...prev,
      quantity: currentLotSize,
      slices: currentLotSize,
    }));
  }, [lotSizes, form.symbol]);

  // Dynamic quantity and slices options based on current symbol
  const QUANTITY_OPTIONS = useMemo(() => {
    const LOT = getCurrentLotSize();
    return [1, 2, 3, 4, 5].map((lots) => lots * LOT);
  }, [form.symbol, lotSizes]);

  const SLICES_OPTIONS = useMemo(() => {
    const LOT = getCurrentLotSize();
    return [1, 2, 3, 4, 5].map((lots) => lots * LOT);
  }, [form.symbol, lotSizes]);

  // temp input for adding user_ids
  const [userIdInput, setUserIdInput] = useState("");

  // component state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usersForDropdown, setUsersForDropdown] = useState([]);
  const [optionData, setOptionData] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [inlineEditingIndex, setInlineEditingIndex] = useState(null);

  // fields that should be coerced to numbers when editing the form
  const numericFields = new Set([
    "quantity",
    "slices",
    "call_strike",
    "put_strike",
    "desired_spread",
    "start_price",
    "IOC_timeout",
    "expiry",
    "exit_start",
    "exit_desired_spread",
    "exit_price_gap",
    "no_of_bid_ask_average",
  ]);

  // ----- Helpers -----
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: numericFields.has(name)
        ? value === ""
          ? ""
          : Number(value)
        : value,
    }));
  };

  // run_state -> color class helper
  function getRunStateClass(run_state) {
    return run_state === 0
      ? "text-green-600"
      : run_state === 1
      ? "text-yellow-600"
      : "text-red-600";
  }

  const handleSelectChange = (name, value) => {
    setForm((prev) => {
      const newForm = {
        ...prev,
        [name]: numericFields.has(name) ? Number(value) : value,
      };

      // If symbol changes, update quantity and slices to use new lot size
      if (name === "symbol") {
        const newLotSize = lotSizes[value] || 75;
        newForm.quantity = newLotSize; // Set to 1 lot of new symbol
        newForm.slices = newLotSize; // Set slices to 1 lot as well
      }

      return newForm;
    });
  };

  const addUserId = () => {
    const v = userIdInput.trim();
    if (!v) return;
    setForm((prev) => ({
      ...prev,
      user_ids: Array.from(new Set([...(prev.user_ids || []), v])),
    }));
    setUserIdInput("");
  };

  const removeUserId = (id) => {
    setForm((prev) => ({
      ...prev,
      user_ids: (prev.user_ids || []).filter((x) => x !== id),
    }));
  };

  // ----- API -----
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${DEV_BASE_URL}/stratergy/stratergy_1`);
      const data = await res.json();
      console.log(data);
      // Normalize array and field names
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.orders)
        ? data.orders
        : [];
      const normalized = arr.map((o) => ({
        ...o,
        // migrate possible legacy fields
        user_ids: Array.isArray(o.user_ids)
          ? o.user_ids
          : o.user_id
          ? [o.user_id]
          : [],
        no_of_bid_ask_average:
          o.no_of_bid_ask_average ?? o.no_of_bidask_average ?? 2,
        // ensure run_state exists (0 = running, 1 = paused, 2 = exited)
        run_state: typeof o.run_state === "number" ? o.run_state : 0,
      }));
      setOrders(normalized);
      // also fetch logged-in users for dropdown (filter later)
      try {
        const ures = await fetch(`${DEV_BASE_URL}/users`);
        const udata = await ures.json();
        const arr = Array.isArray(udata)
          ? udata
          : Array.isArray(udata?.users)
          ? udata.users
          : [];
        const logged = arr.filter(
          (u) =>
            u.last_login_time != null ||
            u.lastLogin != null ||
            u.last_login != null
        );
        setUsersForDropdown(logged);
      } catch (e) {
        console.warn("Failed to fetch users for dropdown", e);
      }
    } catch (e) {
      console.error("GET /api/orders failed:", e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const saveOrder = async () => {
    try {
      if (editingIndex !== null) {
        // update
        const body = { ...form };
        await fetch(`${DEV_BASE_URL}/stratergy/stratergy_1/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const next = [...orders];
        next[editingIndex] = body;
        setOrders(next);
        setEditingIndex(null);
      } else {
        // create
        const res = await fetch(`${DEV_BASE_URL}/stratergy/stratergy_1/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const created = await res.json();
        setOrders((prev) => [...prev, created]);
        fetchOrders();
      }
      // reset minimal fields you want reset after save (keep as-is if you prefer)
      // setForm((prev) => ({ ...prev, user_ids: [] }));
    } catch (e) {
      console.error("Save failed:", e);
    }
  };

  const startEdit = (index) => {
    // enable inline editing for the selected row (separate from form edit)
    setInlineEditingIndex(index);
  };

  const cancelInlineEdit = () => setInlineEditingIndex(null);

  const handleInlineChange = (index, field, value) => {
    setOrders((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const saveInlineEdit = async (index) => {
    const body = orders[index];
    try {
      await fetch(`${DEV_BASE_URL}/stratergy/stratergy_1/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setInlineEditingIndex(null);
    } catch (e) {
      console.error("Inline save failed", e);
    }
  };

  const deleteOrder = async (index) => {
    // optional: call DELETE endpoint here
    await fetch(`${DEV_BASE_URL}/stratergy/stratergy_1/${orders[index].id}`, {
      method: "DELETE",
    });
    setOrders((prev) => prev.filter((_, i) => i !== index));
  };

  // update run state (start/pause/resume/exit)
  const updateOrderState = async (index, newState) => {
    const o = { ...orders[index], run_state: newState };
    try {
      await fetch(`${DEV_BASE_URL}/stratergy/stratergy_1/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(o),
      });
      setOrders((prev) => {
        const next = [...prev];
        next[index] = o;
        return next;
      });
    } catch (e) {
      console.error("Failed to update state", e);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Poll option data for live spread computation
  useEffect(() => {
    let mounted = true;
    let t;
    async function load() {
      try {
        const res = await fetch(`${DEV_BASE_URL}/optiondata`);
        if (!res.ok) throw new Error("Failed to fetch optiondata");
        const data = await res.json();
        if (mounted) setOptionData(Array.isArray(data) ? data : []);
      } catch (err) {
        // keep previous data on error
      }
    }
    load();
    t = setInterval(load, 1000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  // ---------- spread helpers (avg of first N bid/ask values, find match) ----------
  function avgFirstN(arr, n) {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const slice = arr.slice(0, Math.max(1, n));
    const vals = slice
      .map((v) => Number(v?.price ?? v))
      .filter((x) => !Number.isNaN(x));
    if (vals.length === 0) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  function findOptionMatch(data, symbol, expiry, strikeprice, optiontype) {
    return (data || []).find(
      (item) =>
        item?.response?.data?.symbolname?.includes(symbol) &&
        String(item?.response?.data?.expiry) === String(expiry) &&
        Number(item?.response?.data?.strikeprice) === Number(strikeprice) &&
        item?.response?.data?.optiontype === optiontype
    );
  }

  function legPriceFromData(o, strike, optionType, optionOrderType) {
    // o: order object used to pick expiry and averaging count
    const n = Number(o.no_of_bid_ask_average ?? 1);
    const match = findOptionMatch(
      optionData,
      o.symbol ?? o.index,
      o.expiry ?? 0,
      strike,
      optionType
    );
    if (!match) return null;
    const d = match.response.data;
    // if order type is buy -> use ask average; if sell -> bid average
    if ((optionOrderType || o.action) === "buy") {
      return avgFirstN(d.askValues, n);
    }
    return avgFirstN(d.bidValues, n);
  }

  function computeSpreadForOrder(o) {
    // Assumption: leg1 = CE at call_strike, leg2 = PE at put_strike
    // If action === 'buy' we take ask averages for both legs, else bid averages for both legs.
    const cs = Number(o.call_strike ?? o.leg1Strike ?? 0);
    const ps = Number(o.put_strike ?? o.leg2Strike ?? 0);
    const leg1 = legPriceFromData(o, cs, "CE", o.action);
    const leg2 = legPriceFromData(o, ps, "PE", o.action);
    if (leg1 == null || leg2 == null) return null;
    return Number(leg1) + Number(leg2);
  }

  // compute separate ask and bid spreads (sum of ask averages and sum of bid averages)
  function computeAskBidSpreads(o) {
    const cs = Number(o.call_strike ?? o.leg1Strike ?? 0);
    const ps = Number(o.put_strike ?? o.leg2Strike ?? 0);
    // average ask for each leg
    const match1 = findOptionMatch(
      optionData,
      o.symbol ?? o.index,
      o.expiry ?? 0,
      cs,
      "CE"
    );
    const match2 = findOptionMatch(
      optionData,
      o.symbol ?? o.index,
      o.expiry ?? 0,
      ps,
      "PE"
    );
    const n = Number(o.no_of_bid_ask_average ?? 1);
    const ask1 = match1 ? avgFirstN(match1.response.data.askValues, n) : null;
    const ask2 = match2 ? avgFirstN(match2.response.data.askValues, n) : null;
    const bid1 = match1 ? avgFirstN(match1.response.data.bidValues, n) : null;
    const bid2 = match2 ? avgFirstN(match2.response.data.bidValues, n) : null;
    const ask =
      ask1 == null || ask2 == null ? null : Number(ask1) + Number(ask2);
    const bid =
      bid1 == null || bid2 == null ? null : Number(bid1) + Number(bid2);
    return { ask, bid };
  }

  // ----- UI -----
  return (
    <div className="min-h-screen bg-light-gradient dark:bg-dark-gradient p-2 md:p-6 transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto overflow-hidden">
        {/* Header */}
        <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-light-lg dark:shadow-dark-xl p-6 mb-6 border border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                Trading Strategies
              </h1>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                Manage your option trading strategies
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-light-success/10 dark:bg-dark-success/20 text-light-success dark:text-dark-success px-3 py-1 rounded-full text-sm font-medium border border-light-success/20 dark:border-dark-success/30">
                {orders.length} Active
              </div>
              <button
                onClick={fetchOrders}
                className="bg-light-accent hover:bg-blue-700 dark:bg-dark-accent dark:hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-light-lg hover:shadow-light-xl dark:shadow-dark-lg"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Index Cards */}
        <IndexCards indices={["NIFTY", "SENSEX"]} className="mb-6" />

        {/* Form */}
        <div className="bg-light-card-gradient dark:bg-dark-card-gradient shadow-light-lg dark:shadow-dark-xl rounded-xl p-6 mb-6 border border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
              {editingIndex !== null ? "Edit Strategy" : "Create New Strategy"}
            </h2>
            {editingIndex !== null && (
              <div className="bg-light-accent/10 dark:bg-dark-accent/20 text-light-accent dark:text-dark-accent px-3 py-1 rounded-full text-sm font-medium border border-light-accent/20 dark:border-dark-accent/30">
                ID: {form.id}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* symbol */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                Symbol
              </label>
              <select
                className="w-full border border-light-border dark:border-dark-border rounded-lg p-3 focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-light-accent dark:focus:border-dark-accent transition-colors duration-200 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary"
                value={form.symbol}
                onChange={(e) => handleSelectChange("symbol", e.target.value)}
              >
                {SYMBOL_OPTIONS.map((s) => (
                  <option
                    key={s}
                    value={s}
                    className="dark:bg-dark-surface dark:text-dark-text-primary"
                  >
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* order_type */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary">
                Order Type
              </label>
              <select
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                value={form.order_type}
                onChange={(e) =>
                  handleSelectChange("order_type", e.target.value)
                }
              >
                {ORDER_TYPE.map((s) => (
                  <option
                    key={s}
                    value={s}
                    className="dark:bg-dark-surface dark:text-dark-text-primary"
                  >
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* quantity (dropdown) */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary">
                Quantity
                <span className="ml-1 text-xs text-gray-500 dark:text-dark-text-muted">
                  (Lot Size: {getCurrentLotSize()})
                </span>
              </label>
              <select
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                value={form.quantity}
                onChange={(e) => handleSelectChange("quantity", e.target.value)}
              >
                {QUANTITY_OPTIONS.map((q) => (
                  <option
                    key={q}
                    value={q}
                    className="dark:bg-dark-surface dark:text-dark-text-primary"
                  >
                    {q} ({q / getCurrentLotSize()} lot
                    {q / getCurrentLotSize() !== 1 ? "s" : ""})
                  </option>
                ))}
              </select>
            </div>

            {/* slices (dropdown) */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary">
                Slices
                <span className="ml-1 text-xs text-gray-500 dark:text-dark-text-muted">
                  (Per Slice)
                </span>
              </label>
              <select
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                value={form.slices}
                onChange={(e) => handleSelectChange("slices", e.target.value)}
              >
                {SLICES_OPTIONS.map((s) => (
                  <option
                    key={s}
                    value={s}
                    className="dark:bg-dark-surface dark:text-dark-text-primary"
                  >
                    {s} ({s / getCurrentLotSize()} lot
                    {s / getCurrentLotSize() !== 1 ? "s" : ""} per slice)
                  </option>
                ))}
              </select>
            </div>

            {/* base_leg (dropdown) */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary">
                Base Leg
              </label>
              <select
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                value={form.base_leg}
                onChange={(e) => handleSelectChange("base_leg", e.target.value)}
              >
                {BASE_LEG_OPTIONS.map((b) => (
                  <option
                    key={b}
                    value={b}
                    className="dark:bg-dark-surface dark:text-dark-text-primary"
                  >
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* action (dropdown) */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary">
                Action
              </label>
              <select
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                value={form.action}
                onChange={(e) => handleSelectChange("action", e.target.value)}
              >
                {ACTION_OPTIONS.map((a) => (
                  <option
                    key={a}
                    value={a}
                    className="dark:bg-dark-surface dark:text-dark-text-primary"
                  >
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* no_of_bid_ask_average (dropdown) */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary">
                Bid/Ask Average
              </label>
              <select
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                value={form.no_of_bid_ask_average}
                onChange={(e) =>
                  handleSelectChange("no_of_bid_ask_average", e.target.value)
                }
              >
                {BID_ASK_AVG_OPTIONS.map((n) => (
                  <option
                    key={n}
                    value={n}
                    className="dark:bg-dark-surface dark:text-dark-text-primary"
                  >
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* strikes / pricing */}
            <LabeledNumber
              label="Call Strike"
              name="call_strike"
              value={form.call_strike}
              onChange={handleChange}
            />
            <LabeledNumber
              label="Put Strike"
              name="put_strike"
              value={form.put_strike}
              onChange={handleChange}
            />
            <LabeledNumber
              label="Desired Spread"
              name="desired_spread"
              value={form.desired_spread}
              onChange={handleChange}
            />
            <LabeledNumber
              label="Start Price"
              name="start_price"
              value={form.start_price}
              onChange={handleChange}
            />
            <LabeledNumber
              label="IOC Timeout"
              name="IOC_timeout"
              value={form.IOC_timeout}
              onChange={handleChange}
            />
            <LabeledNumber
              label="Expiry"
              name="expiry"
              value={form.expiry}
              onChange={handleChange}
            />
            <LabeledNumber
              label="Exit Start"
              name="exit_start"
              value={form.exit_start}
              onChange={handleChange}
              step="0.01"
            />
            <LabeledNumber
              label="Exit Desired Spread"
              name="exit_desired_spread"
              value={form.exit_desired_spread}
              onChange={handleChange}
              step="0.01"
            />
            <LabeledNumber
              label="Exit Price Gap (in percentage)"
              name="exit_price_gap"
              value={form.exit_price_gap}
              onChange={handleChange}
              step="0.01"
            />

            {/* user_ids (checkbox list) */}
            <div className="lg:col-span-4 space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary">
                Selected Users
              </label>
              <div className="bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-lg p-4 max-h-40 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {usersForDropdown.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-dark-text-muted col-span-full text-center py-4">
                      No users available
                    </div>
                  ) : (
                    usersForDropdown.map((u) => {
                      const val = String(u.userid ?? u.id);
                      const label = u.username ?? u.userid ?? u.id;
                      const checked = (form.user_ids || [])
                        .map(String)
                        .includes(val);
                      return (
                        <label
                          key={val}
                          className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-white dark:hover:bg-dark-elevated p-2 rounded transition-colors duration-200"
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 dark:text-dark-accent border-gray-300 dark:border-dark-border rounded focus:ring-blue-500 dark:focus:ring-dark-accent bg-white dark:bg-dark-surface"
                            checked={checked}
                            onChange={(e) => {
                              setForm((prev) => {
                                const cur = Array.isArray(prev.user_ids)
                                  ? prev.user_ids.map(String)
                                  : [];
                                const next = e.target.checked
                                  ? Array.from(new Set([...cur, val]))
                                  : cur.filter((x) => x !== val);
                                return { ...prev, user_ids: next };
                              });
                            }}
                          />
                          <span className="text-gray-700 dark:text-dark-text-secondary">
                            {label}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
              {(form.user_ids || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {(form.user_ids || []).map((id) => (
                    <span
                      key={id}
                      className="inline-flex items-center gap-2 bg-blue-100 dark:bg-dark-accent/20 text-blue-800 dark:text-dark-accent px-3 py-1 rounded-full text-sm font-medium border dark:border-dark-accent/30"
                    >
                      {id}
                      <button
                        type="button"
                        onClick={() => removeUserId(id)}
                        className="text-blue-600 dark:text-dark-accent hover:text-blue-800 dark:hover:text-blue-300 font-bold transition-colors duration-200"
                        aria-label={`Remove ${id}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* note */}
            <div className="lg:col-span-4 space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary ">
                Strategy Notes
              </label>
              <textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
                rows={3}
                placeholder="Add any notes or comments about this strategy..."
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-dark-border">
            <div className="flex space-x-3">
              <button
                onClick={saveOrder}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-dark-accent dark:to-blue-600 dark:hover:from-blue-500 dark:hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl dark:shadow-dark-lg flex items-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>
                  {editingIndex !== null
                    ? "Update Strategy"
                    : "Create Strategy"}
                </span>
              </button>
              {editingIndex !== null && (
                <button
                  onClick={() => setEditingIndex(null)}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-dark-elevated dark:hover:bg-gray-600 text-gray-700 dark:text-dark-text-secondary px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                  type="button"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            {loading && (
              <div className="flex items-center space-x-2 text-gray-600 dark:text-dark-text-muted">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-dark-accent"></div>
                <span className="text-sm">Processing...</span>
              </div>
            )}
          </div>
        </div>

        {/* Strategies Table */}
        <div className="bg-light-card-gradient dark:bg-dark-card-gradient shadow-light-lg dark:shadow-dark-xl rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
          <div className="px-6 py-4 bg-light-secondary dark:bg-dark-elevated border-b border-light-border dark:border-dark-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
                  Active Strategies
                </h3>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                  Manage and monitor your trading strategies
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Total:{" "}
                  <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                    {orders.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-light-accent dark:border-dark-accent"></div>
                <span className="text-light-text-secondary dark:text-dark-text-secondary">
                  Loading strategies...
                </span>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-dark-text-muted mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2">
                No strategies found
              </h3>
              <p className="text-gray-500 dark:text-dark-text-muted">
                Create your first strategy to get started
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto max-w-full">
                <table className="w-full min-w-max">
                  <thead className="bg-gray-50 dark:bg-dark-elevated">
                    <tr>
                      <Th>ID</Th>
                      <Th>Symbol</Th>
                      <Th>Order Type</Th>
                      <Th>Quantity</Th>
                      <Th>Slices</Th>
                      <Th>Base Leg</Th>
                      <Th>IOC Timeout</Th>
                      <Th>Call Strike</Th>
                      <Th>Put Strike</Th>
                      <Th>Start / Spread</Th>
                      <Th>Exit / Spread</Th>
                      <Th>Live Spread</Th>
                      <Th>Users</Th>
                      <Th>Expiry</Th>
                      <Th>Bid/Ask Avg</Th>
                      <Th>Action</Th>
                      <Th>Note</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-dark-border bg-white dark:bg-dark-surface">
                    {orders.map((o, i) => (
                      <tr
                        key={o.id || i}
                        className="hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors duration-200"
                      >
                        <Td>
                          <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                            {o.id ?? "-"}
                          </span>
                        </Td>
                        <Td>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-dark-accent/20 text-blue-800 dark:text-dark-accent border dark:border-dark-accent/30">
                            {o.symbol ?? "-"}
                          </span>
                        </Td>
                        <Td>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              o.order_type === "MARKET"
                                ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 dark:border-red-700/30"
                                : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 dark:border-green-700/30"
                            }`}
                          >
                            {o.order_type ?? "-"}
                          </span>
                        </Td>

                        <Td>
                          {inlineEditingIndex === i ? (
                            <select
                              value={o.quantity}
                              onChange={(e) =>
                                handleInlineChange(
                                  i,
                                  "quantity",
                                  Number(e.target.value)
                                )
                              }
                              className="border border-gray-300 dark:border-dark-border rounded p-2 text-sm w-24 focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                            >
                              {QUANTITY_OPTIONS.map((q) => (
                                <option key={q} value={q}>
                                  {q}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="text-sm">
                              <div className="font-medium text-gray-900 dark:text-dark-text-primary">
                                {o.quantity}
                              </div>
                              <div className="text-gray-500 dark:text-dark-text-secondary">
                                (
                                {Math.round(
                                  o.quantity / (lotSizes[o.symbol] || 75)
                                )}{" "}
                                lots)
                              </div>
                            </div>
                          )}
                        </Td>

                        <Td>
                          {inlineEditingIndex === i ? (
                            <select
                              value={o.slices}
                              onChange={(e) =>
                                handleInlineChange(
                                  i,
                                  "slices",
                                  Number(e.target.value)
                                )
                              }
                              className="border border-gray-300 dark:border-dark-border rounded p-2 text-sm w-24 focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                            >
                              {SLICES_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="text-sm">
                              <div className="font-medium text-gray-900 dark:text-dark-text-primary">
                                {o.slices}
                              </div>
                              <div className="text-gray-500 dark:text-dark-text-secondary">
                                (
                                {Math.round(
                                  o.slices / (lotSizes[o.symbol] || 75)
                                )}{" "}
                                slice)
                              </div>
                            </div>
                          )}
                        </Td>

                        <Td>
                          {inlineEditingIndex === i ? (
                            <select
                              value={o.base_leg}
                              onChange={(e) =>
                                handleInlineChange(
                                  i,
                                  "base_leg",
                                  e.target.value
                                )
                              }
                              className="border border-gray-300 dark:border-dark-border rounded p-2 text-sm w-20 focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                            >
                              {BASE_LEG_OPTIONS.map((b) => (
                                <option key={b} value={b}>
                                  {b}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                o.base_leg === "CE"
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 dark:border-green-700/30"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 dark:border-red-700/30"
                              }`}
                            >
                              {o.base_leg}
                            </span>
                          )}
                        </Td>

                        <Td>
                          {inlineEditingIndex === i ? (
                            <input
                              type="number"
                              value={o.IOC_timeout}
                              onChange={(e) =>
                                handleInlineChange(
                                  i,
                                  "IOC_timeout",
                                  Number(e.target.value)
                                )
                              }
                              className="border border-gray-300 dark:border-dark-border rounded p-2 text-sm w-24 focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                            />
                          ) : (
                            <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                              {o.IOC_timeout}
                            </span>
                          )}
                        </Td>

                        <Td>
                          {inlineEditingIndex === i ? (
                            <input
                              type="number"
                              value={o.call_strike}
                              onChange={(e) =>
                                handleInlineChange(
                                  i,
                                  "call_strike",
                                  Number(e.target.value)
                                )
                              }
                              className="border border-gray-300 dark:border-dark-border rounded p-2 text-sm w-24 focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                            />
                          ) : (
                            <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                              {o.call_strike}
                            </span>
                          )}
                        </Td>

                        <Td>
                          {inlineEditingIndex === i ? (
                            <input
                              type="number"
                              value={o.put_strike}
                              onChange={(e) =>
                                handleInlineChange(
                                  i,
                                  "put_strike",
                                  Number(e.target.value)
                                )
                              }
                              className="border border-gray-300 dark:border-dark-border rounded p-2 text-sm w-24 focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                            />
                          ) : (
                            <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                              {o.put_strike}
                            </span>
                          )}
                        </Td>

                        <Td>
                          <div className="text-sm">
                            {inlineEditingIndex === i ? (
                              <div className="flex space-x-1">
                                <input
                                  type="number"
                                  value={o.start_price}
                                  onChange={(e) =>
                                    handleInlineChange(
                                      i,
                                      "start_price",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="border border-gray-300 dark:border-gray-600 rounded p-1 text-sm w-16 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                />
                                <input
                                  type="number"
                                  value={o.desired_spread}
                                  onChange={(e) =>
                                    handleInlineChange(
                                      i,
                                      "desired_spread",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="border border-gray-300 dark:border-gray-600 rounded p-1 text-sm w-16 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                />
                              </div>
                            ) : (
                              <div>
                                <div className="font-medium text-gray-900 dark:text-dark-text-primary">
                                  {o.start_price ?? "-"}
                                </div>
                                <div className="text-gray-500 dark:text-dark-text-secondary">
                                  {o.desired_spread ?? "-"}
                                </div>
                              </div>
                            )}
                          </div>
                        </Td>

                        <Td>
                          <div className="text-sm">
                            {inlineEditingIndex === i ? (
                              <div className="flex space-x-1">
                                <input
                                  type="number"
                                  value={o.exit_start}
                                  onChange={(e) =>
                                    handleInlineChange(
                                      i,
                                      "exit_start",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="border border-gray-300 dark:border-gray-600 rounded p-1 text-sm w-16 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                />
                                <input
                                  type="number"
                                  value={o.exit_desired_spread}
                                  onChange={(e) =>
                                    handleInlineChange(
                                      i,
                                      "exit_desired_spread",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="border border-gray-300 dark:border-gray-600 rounded p-1 text-sm w-16 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                />
                              </div>
                            ) : (
                              <div>
                                <div className="font-medium text-gray-900 dark:text-dark-text-primary">
                                  {o.exit_start ?? "-"}
                                </div>
                                <div className="text-gray-500 dark:text-dark-text-secondary">
                                  {o.exit_desired_spread ?? "-"}
                                </div>
                              </div>
                            )}
                          </div>
                        </Td>

                        <Td>
                          <div className="text-sm">
                            {(() => {
                              const { ask, bid } = computeAskBidSpreads(o);
                              const forward = o.action === "buy" ? ask : bid;
                              const reverse = o.action === "buy" ? bid : ask;
                              const f =
                                forward == null
                                  ? "-"
                                  : Number(forward).toFixed(2);
                              const r =
                                reverse == null
                                  ? "-"
                                  : Number(reverse).toFixed(2);
                              return (
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-dark-text-primary">
                                    {f}
                                  </div>
                                  <div className="text-gray-500 dark:text-dark-text-secondary">
                                    {r}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </Td>

                        <Td>
                          {inlineEditingIndex === i ? (
                            <div className="max-w-xs">
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                {usersForDropdown.slice(0, 3).map((u) => {
                                  const val = String(u.userid ?? u.id);
                                  const label = u.username ?? u.userid ?? u.id;
                                  const checked = Array.isArray(o.user_ids)
                                    ? o.user_ids.map(String).includes(val)
                                    : false;
                                  return (
                                    <label
                                      key={val}
                                      className="flex items-center space-x-1"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={(e) => {
                                          const curr = Array.isArray(o.user_ids)
                                            ? o.user_ids.map(String)
                                            : [];
                                          const next = [...curr];
                                          if (e.target.checked) {
                                            if (!next.includes(val))
                                              next.push(val);
                                          } else {
                                            const idx = next.indexOf(val);
                                            if (idx !== -1) next.splice(idx, 1);
                                          }
                                          handleInlineChange(
                                            i,
                                            "user_ids",
                                            next
                                          );
                                        }}
                                        className="w-3 h-3"
                                      />
                                      <span>{label}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          ) : Array.isArray(o.user_ids) &&
                            o.user_ids.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {o.user_ids.slice(0, 2).map((id) => (
                                <span
                                  key={id}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border dark:border-gray-600"
                                >
                                  {id}
                                </span>
                              ))}
                              {o.user_ids.length > 2 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 border dark:border-gray-500">
                                  +{o.user_ids.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 text-sm">
                              None
                            </span>
                          )}
                        </Td>

                        <Td>
                          {inlineEditingIndex === i ? (
                            <input
                              type="number"
                              value={o.expiry}
                              onChange={(e) =>
                                handleInlineChange(
                                  i,
                                  "expiry",
                                  Number(e.target.value)
                                )
                              }
                              className="border border-gray-300 dark:border-gray-600 rounded p-1 text-sm w-16 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                            />
                          ) : (
                            <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                              {o.expiry}
                            </span>
                          )}
                        </Td>

                        <Td>
                          {inlineEditingIndex === i ? (
                            <select
                              value={o.no_of_bid_ask_average ?? 2}
                              onChange={(e) =>
                                handleInlineChange(
                                  i,
                                  "no_of_bid_ask_average",
                                  Number(e.target.value)
                                )
                              }
                              className="border border-gray-300 dark:border-gray-600 rounded p-1 text-sm w-16 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                            >
                              {BID_ASK_AVG_OPTIONS.map((n) => (
                                <option key={n} value={n}>
                                  {n}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                              {o.no_of_bid_ask_average ??
                                o.no_of_bidask_average}
                            </span>
                          )}
                        </Td>

                        <Td>
                          {inlineEditingIndex === i ? (
                            <select
                              value={o.action}
                              onChange={(e) =>
                                handleInlineChange(i, "action", e.target.value)
                              }
                              className="border border-gray-300 dark:border-gray-600 rounded p-1 text-sm w-16 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                            >
                              {ACTION_OPTIONS.map((a) => (
                                <option key={a} value={a}>
                                  {a}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                o.action === "buy"
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 dark:border-green-700/30"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 dark:border-red-700/30"
                              }`}
                            >
                              {o.action}
                            </span>
                          )}
                        </Td>

                        <Td>
                          {inlineEditingIndex === i ? (
                            <input
                              type="text"
                              value={o.note ?? ""}
                              onChange={(e) =>
                                handleInlineChange(i, "note", e.target.value)
                              }
                              className="border border-gray-300 dark:border-gray-600 rounded p-1 text-sm w-16 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                            />
                          ) : (
                            <span
                              className="text-sm text-gray-600 dark:text-dark-text-secondary truncate max-w-xs block"
                              title={o.note}
                            >
                              {o.note || "-"}
                            </span>
                          )}
                        </Td>

                        <Td>
                          <div className="space-y-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                o.run_state === 0
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 dark:border-green-700/30"
                                  : o.run_state === 1
                                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 dark:border-yellow-700/30"
                                  : o.run_state === 3
                                  ? "dark:bg-gray-700 dark:text-dark-text-secondary"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 dark:border-red-700/30"
                              }`}
                            >
                              {o.run_state === 0
                                ? "Running"
                                : o.run_state === 1
                                ? "Paused"
                                : o.run_state === 3
                                ? "Not yet started"
                                : "Exited"}
                            </span>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => updateOrderState(i, 0)}
                                className="px-2 py-1 rounded text-xs bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
                                title="Start"
                              >
                                ▶
                              </button>
                              <button
                                onClick={() => updateOrderState(i, 1)}
                                className="px-2 py-1 rounded text-xs bg-yellow-500 text-white hover:bg-yellow-600 transition-colors duration-200"
                                title="Pause"
                              >
                                ⏸
                              </button>
                              <button
                                onClick={() => updateOrderState(i, 2)}
                                className="px-2 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
                                title="Exit"
                              >
                                ⏹
                              </button>
                            </div>
                          </div>
                        </Td>

                        <Td>
                          {inlineEditingIndex === i ? (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => saveInlineEdit(i)}
                                className="px-3 py-1.5 rounded text-xs bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelInlineEdit}
                                className="px-3 py-1.5 rounded text-xs bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors duration-200"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => deleteOrder(i)}
                                className="px-3 py-1.5 rounded text-xs bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
                              >
                                Delete
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => startEdit(i)}
                                className="px-3 py-1.5 rounded text-xs bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteOrder(i)}
                                className="px-3 py-1.5 rounded text-xs bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden space-y-4 p-4">
                {orders.map((o, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-sm dark:shadow-dark-lg hover:shadow-md dark:hover:shadow-dark-xl transition-shadow duration-200"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-dark-accent/20 text-blue-800 dark:text-dark-accent border dark:border-dark-accent/30">
                            {o.symbol}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              o.action === "buy"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 dark:border-green-700/30"
                                : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 dark:border-red-700/30"
                            }`}
                          >
                            {o.action}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                          ID: {o.id}
                        </div>
                      </div>

                      {inlineEditingIndex === i ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                                Call Strike
                              </label>
                              <input
                                type="number"
                                value={o.call_strike}
                                onChange={(e) =>
                                  handleInlineChange(
                                    i,
                                    "call_strike",
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                                Put Strike
                              </label>
                              <input
                                type="number"
                                value={o.put_strike}
                                onChange={(e) =>
                                  handleInlineChange(
                                    i,
                                    "put_strike",
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                                Start Price
                              </label>
                              <input
                                type="number"
                                value={o.start_price}
                                onChange={(e) =>
                                  handleInlineChange(
                                    i,
                                    "start_price",
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Desired Spread
                              </label>
                              <input
                                type="number"
                                value={o.desired_spread}
                                onChange={(e) =>
                                  handleInlineChange(
                                    i,
                                    "desired_spread",
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Exit Start
                              </label>
                              <input
                                type="number"
                                value={o.exit_start}
                                onChange={(e) =>
                                  handleInlineChange(
                                    i,
                                    "exit_start",
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Exit Spread
                              </label>
                              <input
                                type="number"
                                value={o.exit_desired_spread}
                                onChange={(e) =>
                                  handleInlineChange(
                                    i,
                                    "exit_desired_spread",
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Users
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {usersForDropdown.map((u) => {
                                const val = String(u.userid ?? u.id);
                                const label = u.username ?? u.userid ?? u.id;
                                const checked = Array.isArray(o.user_ids)
                                  ? o.user_ids.map(String).includes(val)
                                  : false;
                                return (
                                  <label
                                    key={val}
                                    className="flex items-center space-x-2 text-sm"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={(e) => {
                                        const curr = Array.isArray(o.user_ids)
                                          ? o.user_ids.map(String)
                                          : [];
                                        const next = [...curr];
                                        if (e.target.checked) {
                                          if (!next.includes(val))
                                            next.push(val);
                                        } else {
                                          const idx = next.indexOf(val);
                                          if (idx !== -1) next.splice(idx, 1);
                                        }
                                        handleInlineChange(i, "user_ids", next);
                                      }}
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300">
                                      {label}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex space-x-2 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <button
                              onClick={() => saveInlineEdit(i)}
                              className="flex-1 px-4 py-2 rounded bg-green-600 dark:bg-green-700 text-white text-sm font-medium hover:bg-green-700 dark:hover:bg-green-800 transition-colors duration-200"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={cancelInlineEdit}
                              className="flex-1 px-4 py-2 rounded bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => deleteOrder(i)}
                              className="px-4 py-2 rounded bg-red-600 dark:bg-red-700 text-white text-sm font-medium hover:bg-red-700 dark:hover:bg-red-800 transition-colors duration-200"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-dark-text-secondary">
                                Quantity:
                              </span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-dark-text-primary">
                                {o.quantity} (
                                {Math.round(
                                  o.quantity / (lotSizes[o.symbol] || 75)
                                )}{" "}
                                lots)
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-dark-text-secondary">
                                Expiry:
                              </span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-dark-text-primary">
                                {o.expiry}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-dark-text-secondary">
                                Call Strike:
                              </span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-dark-text-primary">
                                {o.call_strike}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-dark-text-secondary">
                                Put Strike:
                              </span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-dark-text-primary">
                                {o.put_strike}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-dark-text-secondary">
                                Start Price:
                              </span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-dark-text-primary">
                                {o.start_price ?? "-"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-dark-text-secondary">
                                Exit Start:
                              </span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-dark-text-primary">
                                {o.exit_start ?? "-"}
                              </span>
                            </div>
                          </div>

                          <div className="text-sm">
                            <span className="text-gray-600 dark:text-dark-text-secondary">
                              Live Spread:
                            </span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-dark-text-primary">
                              {(() => {
                                const s = computeSpreadForOrder(o);
                                return s == null ? "-" : Number(s).toFixed(2);
                              })()}
                            </span>
                          </div>

                          {o.note && (
                            <div className="text-sm">
                              <span className="text-gray-600 dark:text-dark-text-secondary">
                                Note:
                              </span>
                              <span className="ml-2 text-gray-700 dark:text-dark-text-secondary">
                                {o.note}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-dark-border">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                                o.run_state === 0
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 dark:border-green-700/30"
                                  : o.run_state === 1
                                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 dark:border-yellow-700/30"
                                  : o.run_state === 3
                                  ? "bg-gray-100 dark:bg-gray-700/30 text-gray-800 dark:text-gray-300 dark:border-gray-600/30"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 dark:border-red-700/30"
                              }`}
                            >
                              {o.run_state === 0
                                ? "Running"
                                : o.run_state === 1
                                ? "Paused"
                                : o.run_state === 3
                                ? "Not yet started"
                                : "Exited"}
                            </span>

                            <div className="flex space-x-2">
                              <button
                                onClick={() => startEdit(i)}
                                className="px-3 py-1 rounded bg-blue-600 dark:bg-blue-700 text-white text-sm hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => updateOrderState(i, 0)}
                                className="px-2 py-1 rounded bg-green-600 dark:bg-green-700 text-white text-sm hover:bg-green-700 dark:hover:bg-green-800 transition-colors duration-200"
                                title="Start"
                              >
                                ▶
                              </button>
                              <button
                                onClick={() => updateOrderState(i, 1)}
                                className="px-2 py-1 rounded bg-yellow-500 dark:bg-yellow-600 text-white text-sm hover:bg-yellow-600 dark:hover:bg-yellow-700 transition-colors duration-200"
                                title="Pause"
                              >
                                ⏸
                              </button>
                              <button
                                onClick={() => updateOrderState(i, 2)}
                                className="px-2 py-1 rounded bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800 transition-colors duration-200"
                                title="Exit"
                              >
                                ⏹
                              </button>
                              <button
                                onClick={() => deleteOrder(i)}
                                className="px-3 py-1 rounded bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800 transition-colors duration-200"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Enhanced UI Components ---------- */
function LabeledNumber({ label, name, value, onChange, step }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary">
        {label}
      </label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        step={step}
        className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-muted"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-dark-text-secondary uppercase tracking-wider bg-gray-50 dark:bg-dark-elevated border-b border-gray-200 dark:border-dark-border">
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text-primary border-b border-gray-200 dark:border-dark-border">
      {children}
    </td>
  );
}
