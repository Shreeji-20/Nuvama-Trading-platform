import React, { useEffect, useMemo, useState, useCallback } from "react";
import IndexCards from "../components/IndexCards";

/** ---------- Config ---------- */
// const BASE_URL = "https://r4np4x2t-8000.inc1.devtunnels.ms"; // change if needed
const DEV_BASE_URL = "http://localhost:8000"; // change if needed
const BASE_URL = DEV_BASE_URL; // use DEV by default
const SYMBOLS = ["NIFTY", "SENSEX"];
const EXPIRIES = ["0", "1", "2", "3"];

async function fetchOptionChain(symbol, expiry) {
  const res = await fetch(`${BASE_URL}/optiondata`);
  if (!res.ok) throw new Error(`Failed to fetch ${symbol} option chain`);
  const data = await res.json();

  const rows = Object.values(
    (data || [])
      .filter(
        (item) =>
          // console.log(first)
          item?.response?.data?.symbolname?.includes(symbol) &&
          String(item?.response?.data?.expiry) === String(expiry)
      )
      .reduce((acc, r) => {
        const d = r.response.data;
        const strike = Number(d?.strikeprice);

        if (!acc[strike]) {
          acc[strike] = {
            strike,
            ceBid: null,
            ceAsk: null,
            peBid: null,
            peAsk: null,
          };
        }

        if (d.optiontype === "CE") {
          acc[strike].ceBid = d.bidValues?.[0]?.price ?? null;
          acc[strike].ceAsk = d.askValues?.[0]?.price ?? null;
        } else if (d.optiontype === "PE") {
          acc[strike].peBid = d.bidValues?.[0]?.price ?? null;
          acc[strike].peAsk = d.askValues?.[0]?.price ?? null;
        }

        return acc;
      }, {})
  );

  return {
    underlying: Number(data.underlying ?? 0),
    rows,
  };
}

/** ---------- Table Component ---------- */
function OptionChainTable({ title, defaultSymbol = "NIFTY" }) {
  const [mobileView, setMobileView] = useState(false);
  const allFields = [
    { key: "strike", label: "Strike" },
    { key: "ceBid", label: "CE Bid" },
    { key: "ceAsk", label: "CE Ask" },
    { key: "peBid", label: "PE Bid" },
    { key: "peAsk", label: "PE Ask" },
    { key: "BidSpread", label: "Bid Spread" },
    { key: "AskSpread", label: "Ask Spread" },
  ];
  const [mobileFields, setMobileFields] = useState([
    "strike",
    "ceBid",
    "BidSpread",
  ]);

  // mobile spread mode: 'Bid' => show ceBid/peBid/BidSpread, 'Ask' => ceAsk/peAsk/AskSpread
  const [spreadMode, setSpreadMode] = useState("Bid");

  // detect small screens (simple)
  useEffect(() => {
    // treat phones and tablets (<=1024px) as compact/mobile view
    const m = window.matchMedia("(max-width: 1024px)");
    const update = () => setMobileView(m.matches);
    update();
    m.addEventListener("change", update);
    return () => m.removeEventListener("change", update);
  }, []);
  const onHeaderClick = useCallback((key) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: "asc" };
      return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
    });
  }, []);
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [underlying, setUnderlying] = useState(0);
  const [rows, setRows] = useState([]);
  const [expiry, setExpiry] = useState("0");
  const prevRowsRef = React.useRef(new Map());

  // Sorting
  const [sort, setSort] = useState({ key: "strike", dir: "asc" }); // dir: 'asc' | 'desc'

  // Filters (per-column numeric min/max)
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    strikeMin: "",
    strikeMax: "",
    ceBidMin: "",
    ceBidMax: "",
    ceAskMin: "",
    ceAskMax: "",
    BidSpreadMin: "",
    BidSpreadMax: "",
    peBidMin: "",
    peBidMax: "",
    peAskMin: "",
    peAskMax: "",
    AskSpreadMin: "",
    AskSpreadMax: "",
  });

  const load = useCallback(
    async (sym = symbol, exp = expiry, showLoading = false) => {
      try {
        if (showLoading) setLoading(true);
        setError("");
        const { underlying, rows: fetchedRows } = await fetchOptionChain(
          sym,
          exp
        );
        setUnderlying(underlying || 0);

        // Merge incoming rows with previous rows to preserve object identity
        const prevMap = prevRowsRef.current || new Map();
        const merged = (fetchedRows || []).map((r) => {
          const key = r.strike;
          const prev = prevMap.get(key);
          if (
            prev &&
            prev.ceBid === r.ceBid &&
            prev.ceAsk === r.ceAsk &&
            prev.peBid === r.peBid &&
            prev.peAsk === r.peAsk
          ) {
            return prev; // reuse previous object if values unchanged
          }
          return r;
        });

        setRows(merged);
        // update ref map
        prevRowsRef.current = new Map((merged || []).map((r) => [r.strike, r]));
      } catch (e) {
        console.error(e);
        setError(e.message || "Failed to load data");
        setRows([]);
        setUnderlying(0);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [symbol, expiry]
  );

  useEffect(() => {
    // initial load (show loading UI)
    load(symbol, expiry, true);
    // poll every 1s without toggling loading UI
    const id = setInterval(() => {
      load(symbol, expiry, false);
    }, 1000);
    return () => clearInterval(id);
  }, [symbol, expiry, load]);

  // Keep rows identity stable; compute spreads on-demand where needed
  const withComputed = useMemo(() => rows, [rows]);

  const computeSpread = (r, type) => {
    if (!r) return null;
    if (type === "BidSpread") {
      return r.ceBid != null && r.peBid != null
        ? Number(r.peBid) + Number(r.ceBid)
        : null;
    }
    if (type === "AskSpread") {
      return r.peAsk != null && r.ceAsk != null
        ? Number(r.peAsk) + Number(r.ceAsk)
        : null;
    }
    return r[type];
  };

  const atmStrike = useMemo(() => {
    if (!underlying || !withComputed.length) return null;
    // nearest strike to underlying
    let best = withComputed[0]?.strike ?? null;
    let bestDiff = best != null ? Math.abs(best - underlying) : Infinity;
    for (const r of withComputed) {
      const d = Math.abs(r.strike - underlying);
      if (d < bestDiff) {
        bestDiff = d;
        best = r.strike;
      }
    }
    return best;
  }, [underlying, withComputed]);

  const filterFn = useCallback(
    (list) => {
      const f = filters;
      const num = (v) =>
        v === "" || v === null || v === undefined ? null : Number(v);
      const fks = {
        strike: [num(f.strikeMin), num(f.strikeMax)],
        ceBid: [num(f.ceBidMin), num(f.ceBidMax)],
        ceAsk: [num(f.ceAskMin), num(f.ceAskMax)],
        peBid: [num(f.peBidMin), num(f.peBidMax)],
        peAsk: [num(f.peAskMin), num(f.peAskMax)],
        BidSpread: [num(f.BidSpreadMin), num(f.BidSpreadMax)],
        AskSpread: [num(f.AskSpreadMin), num(f.AskSpreadMax)],
      };
      return list.filter((r) => {
        const checks = Object.entries(fks).map(([key, [min, max]]) => {
          const val =
            key === "BidSpread" || key === "AskSpread"
              ? computeSpread(r, key)
              : r[key];
          if (val == null) return true; // treat missing as pass
          if (min != null && val < min) return false;
          if (max != null && val > max) return false;
          return true;
        });
        return checks.every(Boolean);
      });
    },
    [filters]
  );
  const filtered = useMemo(
    () => filterFn(withComputed),
    [withComputed, filterFn]
  );
  const sorted = useMemo(() => {
    const arr = [...filtered];
    const { key, dir } = sort;
    const getVal = (obj, key) => {
      const v =
        key === "BidSpread" || key === "AskSpread"
          ? computeSpread(obj, key)
          : obj[key];
      return v == null ? -Infinity : v;
    };
    arr.sort((a, b) => {
      const av = getVal(a, key);
      const bv = getVal(b, key);
      if (av === bv) return 0;
      return dir === "asc" ? (av < bv ? -1 : 1) : av > bv ? -1 : 1;
    });
    // ensure stable ordering by strike when sort key is strike or unspecified
    if (!key || key === "strike") {
      arr.sort((a, b) => (a.strike || 0) - (b.strike || 0));
    }
    return arr;
  }, [filtered, sort]);
  const memoOnHeaderClick = useCallback(onHeaderClick, []);

  const th = (label, key) => {
    const active = sort.key === key;
    const arrow = active ? (sort.dir === "asc" ? "▲" : "▼") : "↕";
    return (
      <th
        className="p-2 cursor-pointer select-none whitespace-nowrap"
        onClick={() => memoOnHeaderClick(key)}
        title="Click to sort"
      >
        <div className="flex items-center gap-1 justify-center">
          <span>{label}</span>
          <span className="text-xs opacity-70">{arrow}</span>
        </div>
      </th>
    );
  };

  const fmt = (v) =>
    v == null || Number.isNaN(v)
      ? "-"
      : typeof v === "number"
      ? v.toFixed(2)
      : String(v);
  const memoFmt = useCallback(fmt, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () =>
    setFilters({
      strikeMin: "",
      strikeMax: "",
      ceBidMin: "",
      ceBidMax: "",
      ceAskMin: "",
      ceAskMax: "",
      BidSpreadMin: "",
      BidSpreadMax: "",
      peBidMin: "",
      peBidMax: "",
      peAskMin: "",
      peAskMax: "",
      AskSpreadMin: "",
      AskSpreadMax: "",
    });

  const memoClearFilters = useCallback(clearFilters, []);

  // Memoized row components to avoid full re-renders when only values change
  const DesktopRow = React.memo(
    ({ r, memoFmt, isATM }) => {
      const getValueColor = (value, type) => {
        if (value == null || Number.isNaN(value)) return "";
        const num = Number(value);
        if (type === "positive")
          return num > 0
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400";
        return "";
      };

      const formatCurrency = (val) => {
        if (val == null || Number.isNaN(val)) return "-";
        return `₹${Number(val).toLocaleString()}`;
      };

      return (
        <tr
          className={`transition-all duration-200 hover:bg-gray-50 dark:hover:bg-dark-surface ${
            isATM
              ? "bg-blue-50 dark:bg-dark-accent/20 border-l-4 border-blue-500 dark:border-dark-accent"
              : "bg-white dark:bg-dark-card-gradient"
          }`}
        >
          <td
            className={`p-4 text-center font-bold border-r border-gray-200 dark:border-dark-border ${
              isATM
                ? "text-blue-800 dark:text-dark-accent"
                : "text-gray-900 dark:text-dark-text-primary"
            }`}
          >
            {formatCurrency(r.strike)}
          </td>
          <td
            className={`p-4 text-center border-r border-gray-200 dark:border-gray-600 font-medium ${
              r.ceBid != null
                ? "text-green-700 dark:text-green-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {r.ceBid != null ? formatCurrency(r.ceBid) : "-"}
          </td>
          <td
            className={`p-4 text-center border-r border-gray-200 dark:border-gray-600 font-medium ${
              r.ceAsk != null
                ? "text-green-700 dark:text-green-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {r.ceAsk != null ? formatCurrency(r.ceAsk) : "-"}
          </td>
          <td
            className={`p-4 text-center border-r border-gray-200 dark:border-gray-600 font-medium ${
              r.peBid != null
                ? "text-red-700 dark:text-red-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {r.peBid != null ? formatCurrency(r.peBid) : "-"}
          </td>
          <td
            className={`p-4 text-center border-r border-gray-200 dark:border-gray-600 font-medium ${
              r.peAsk != null
                ? "text-red-700 dark:text-red-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {r.peAsk != null ? formatCurrency(r.peAsk) : "-"}
          </td>
          <td className="p-4 text-center border-r border-gray-200 dark:border-gray-600">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                computeSpread(r, "BidSpread") != null
                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              }`}
            >
              {computeSpread(r, "BidSpread") != null
                ? formatCurrency(computeSpread(r, "BidSpread"))
                : "-"}
            </span>
          </td>
          <td className="p-4 text-center">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                computeSpread(r, "AskSpread") != null
                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              }`}
            >
              {computeSpread(r, "AskSpread") != null
                ? formatCurrency(computeSpread(r, "AskSpread"))
                : "-"}
            </span>
          </td>
        </tr>
      );
    },
    (prev, next) => {
      const a = prev.r;
      const b = next.r;
      return (
        a.strike === b.strike &&
        a.ceBid === b.ceBid &&
        a.ceAsk === b.ceAsk &&
        a.peBid === b.peBid &&
        a.peAsk === b.peAsk &&
        computeSpread(a, "BidSpread") === computeSpread(b, "BidSpread") &&
        computeSpread(a, "AskSpread") === computeSpread(b, "AskSpread") &&
        prev.isATM === next.isATM
      );
    }
  );

  const MobileRow = React.memo(
    ({ r, memoFmt, isATM, cols }) => {
      const formatCurrency = (val) => {
        if (val == null || Number.isNaN(val)) return "-";
        return `₹${Number(val).toLocaleString()}`;
      };

      return (
        <tr
          className={`transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${
            isATM
              ? "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 border-l-4 border-yellow-400 dark:border-yellow-500"
              : "bg-white dark:bg-gray-800"
          }`}
        >
          {cols.map((c, idx) => {
            const val =
              c === "BidSpread" || c === "AskSpread"
                ? computeSpread(r, c)
                : r[c];

            const getColumnColor = (colKey, value) => {
              if (value == null) return "text-gray-400 dark:text-gray-500";
              if (colKey === "strike")
                return isATM
                  ? "text-yellow-800 dark:text-yellow-300"
                  : "text-gray-900 dark:text-white";
              if (colKey.includes("ce") || colKey.includes("CE"))
                return "text-green-700 dark:text-green-400";
              if (colKey.includes("pe") || colKey.includes("PE"))
                return "text-red-700 dark:text-red-400";
              if (colKey.includes("Spread"))
                return "text-purple-700 dark:text-purple-400";
              return "text-gray-900 dark:text-white";
            };

            return (
              <td
                key={c}
                className={`p-3 text-center font-medium text-sm border-r border-gray-200 dark:border-gray-600 last:border-r-0 ${getColumnColor(
                  c,
                  val
                )}`}
              >
                {val != null && c !== "strike" && !c.includes("Spread") ? (
                  formatCurrency(val)
                ) : val != null && (c === "strike" || c.includes("Spread")) ? (
                  c === "strike" ? (
                    formatCurrency(val)
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                      {formatCurrency(val)}
                    </span>
                  )
                ) : (
                  "-"
                )}
              </td>
            );
          })}
        </tr>
      );
    },
    (prev, next) => {
      const a = prev.r;
      const b = next.r;
      // compare only the columns displayed
      for (const c of prev.cols) {
        const av =
          c === "BidSpread" || c === "AskSpread" ? computeSpread(a, c) : a[c];
        const bv =
          c === "BidSpread" || c === "AskSpread" ? computeSpread(b, c) : b[c];
        if ((av ?? null) !== (bv ?? null)) return false;
      }
      return prev.isATM === next.isATM;
    }
  );

  return (
    <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border transition-all duration-300">
      {/* Header Section */}
      <div className="bg-gray-50 dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border rounded-t-xl px-6 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-dark-accent/20 rounded-lg p-2">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-dark-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                {title}
              </h2>
              <div className="flex items-center gap-2 text-gray-600 dark:text-dark-text-secondary">
                <span className="text-sm">Underlying:</span>
                <span className="font-semibold bg-blue-100 dark:bg-dark-accent/20 px-2 py-1 rounded-md text-blue-800 dark:text-dark-accent">
                  {underlying ? `₹${underlying.toLocaleString()}` : "-"}
                </span>
                {loading && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 dark:bg-dark-success rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 dark:text-dark-success">
                      Live
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-dark-surface rounded-lg px-3 py-2 border border-gray-200 dark:border-dark-border">
              <label className="text-gray-700 dark:text-dark-text-secondary text-sm font-medium">
                Expiry
              </label>
              <select
                className="bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-lg px-3 py-1.5 text-gray-900 dark:text-dark-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent"
                value={expiry}
                onChange={useCallback((e) => setExpiry(e.target.value), [])}
              >
                {EXPIRIES.map((s) => (
                  <option
                    key={s}
                    value={s}
                    className="dark:bg-dark-surface dark:text-dark-text-primary"
                  >
                    {s === "0" ? "Current" : `${s} Week${s !== "1" ? "s" : ""}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-gray-100 dark:bg-dark-surface rounded-lg px-3 py-2 border border-gray-200 dark:border-dark-border">
              <label className="text-gray-700 dark:text-dark-text-secondary text-sm font-medium">
                Symbol
              </label>
              <select
                className="bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-lg px-3 py-1.5 text-gray-900 dark:text-dark-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent"
                value={symbol}
                onChange={useCallback((e) => setSymbol(e.target.value), [])}
              >
                {SYMBOLS.map((s) => (
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

            <div className="flex gap-2">
              <button
                onClick={useCallback(() => load(symbol), [load, symbol])}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-dark-accent dark:hover:bg-blue-500 border border-blue-600 dark:border-dark-accent text-white font-medium text-sm transition-all duration-200 disabled:opacity-50"
              >
                <svg
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>

              <button
                onClick={useCallback(() => setFiltersOpen((v) => !v), [])}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-dark-surface dark:hover:bg-gray-700 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text-primary font-medium text-sm transition-all duration-200"
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
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
                  />
                </svg>
                {filtersOpen ? "Hide Filters" : "Filters"}
              </button>
            </div>

            {/* Mobile spread selector */}
            {mobileView && (
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-dark-surface rounded-lg px-3 py-2 border border-gray-200 dark:border-dark-border">
                <label className="text-gray-700 dark:text-dark-text-secondary text-sm font-medium">
                  View
                </label>
                <select
                  className="bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-lg px-3 py-1.5 text-gray-900 dark:text-dark-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent"
                  value={spreadMode}
                  onChange={(e) => setSpreadMode(e.target.value)}
                >
                  <option
                    value="Bid"
                    className="dark:bg-dark-surface dark:text-dark-text-primary"
                  >
                    Bid Spread
                  </option>
                  <option
                    value="Ask"
                    className="dark:bg-dark-surface dark:text-dark-text-primary"
                  >
                    Ask Spread
                  </option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {filtersOpen && (
        <div className="mx-6 mb-6">
          <div className="bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-dark-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                  />
                </svg>
                Advanced Filters
              </h3>
              <button
                onClick={memoClearFilters}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-dark-border text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-surface text-sm font-medium transition-colors"
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
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Clear All
              </button>
            </div>

            <div className="flex flex-col space-y-6">
              {/* Strike Price Range */}
              <div className="bg-white dark:bg-dark-card-gradient rounded-lg p-6 border border-gray-200 dark:border-dark-border">
                <h4 className="font-semibold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 dark:bg-dark-accent rounded-full"></div>
                  Strike Price Range
                </h4>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 dark:text-dark-text-secondary font-medium mb-2">
                      Minimum Strike
                    </label>
                    <input
                      type="number"
                      name="strikeMin"
                      value={filters.strikeMin}
                      onChange={handleFilterChange}
                      className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200"
                      placeholder="e.g. 24000"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 dark:text-dark-text-secondary font-medium mb-2">
                      Maximum Strike
                    </label>
                    <input
                      type="number"
                      name="strikeMax"
                      value={filters.strikeMax}
                      onChange={handleFilterChange}
                      className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200"
                      placeholder="e.g. 25200"
                    />
                  </div>
                </div>
              </div>

              {/* Call Options (CE) */}
              <div className="bg-white dark:bg-dark-card-gradient rounded-lg p-6 border border-gray-200 dark:border-dark-border">
                <h4 className="font-semibold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 dark:bg-dark-success rounded-full"></div>
                  Call Options (CE)
                </h4>
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 dark:text-dark-text-secondary font-medium mb-2">
                        CE Bid Minimum
                      </label>
                      <input
                        type="number"
                        name="ceBidMin"
                        value={filters.ceBidMin}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200"
                        placeholder="Min bid price"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 dark:text-dark-text-secondary font-medium mb-2">
                        CE Bid Maximum
                      </label>
                      <input
                        type="number"
                        name="ceBidMax"
                        value={filters.ceBidMax}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200"
                        placeholder="Max bid price"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 dark:text-dark-text-secondary font-medium mb-2">
                        CE Ask Minimum
                      </label>
                      <input
                        type="number"
                        name="ceAskMin"
                        value={filters.ceAskMin}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200"
                        placeholder="Min ask price"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 dark:text-dark-text-secondary font-medium mb-2">
                        CE Ask Maximum
                      </label>
                      <input
                        type="number"
                        name="ceAskMax"
                        value={filters.ceAskMax}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200"
                        placeholder="Max ask price"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Put Options (PE) */}
              <div className="bg-white dark:bg-dark-card-gradient rounded-lg p-6 border border-gray-200 dark:border-dark-border">
                <h4 className="font-semibold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Put Options (PE)
                </h4>
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 dark:text-dark-text-secondary font-medium mb-2">
                        PE Bid Minimum
                      </label>
                      <input
                        type="number"
                        name="peBidMin"
                        value={filters.peBidMin}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200"
                        placeholder="Min bid price"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 dark:text-dark-text-secondary font-medium mb-2">
                        PE Bid Maximum
                      </label>
                      <input
                        type="number"
                        name="peBidMax"
                        value={filters.peBidMax}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200"
                        placeholder="Max bid price"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 dark:text-dark-text-secondary font-medium mb-2">
                        PE Ask Minimum
                      </label>
                      <input
                        type="number"
                        name="peAskMin"
                        value={filters.peAskMin}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200"
                        placeholder="Min ask price"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 dark:text-dark-text-secondary font-medium mb-2">
                        PE Ask Maximum
                      </label>
                      <input
                        type="number"
                        name="peAskMax"
                        value={filters.peAskMax}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200"
                        placeholder="Max ask price"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Spread Filters */}
              <div className="bg-white dark:bg-dark-card-gradient rounded-lg p-6 border border-gray-200 dark:border-dark-border">
                <h4 className="font-semibold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
                  Spread Filters
                </h4>
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 dark:text-dark-text-secondary font-medium mb-2">
                        Bid Spread Minimum
                      </label>
                      <input
                        type="number"
                        name="BidSpreadMin"
                        value={filters.BidSpreadMin}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200"
                        placeholder="Min bid spread"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 dark:text-dark-text-secondary font-medium mb-2">
                        Bid Spread Maximum
                      </label>
                      <input
                        type="number"
                        name="BidSpreadMax"
                        value={filters.BidSpreadMax}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200"
                        placeholder="Max bid spread"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 dark:text-dark-text-secondary font-medium mb-2">
                        Ask Spread Minimum
                      </label>
                      <input
                        type="number"
                        name="AskSpreadMin"
                        value={filters.AskSpreadMin}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200"
                        placeholder="Min ask spread"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 dark:text-dark-text-secondary font-medium mb-2">
                        Ask Spread Maximum
                      </label>
                      <input
                        type="number"
                        name="AskSpreadMax"
                        value={filters.AskSpreadMax}
                        onChange={handleFilterChange}
                        className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200"
                        placeholder="Max ask spread"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full">
        <div className="bg-white dark:bg-dark-card-gradient border border-gray-200 dark:border-dark-border overflow-hidden">
          {/* mobile compact 4-column table */}
          {mobileView ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-dark-surface sticky top-0">
                  <tr className="text-gray-700 dark:text-dark-text-secondary">
                    {/* compute mobile columns based on spreadMode */}
                    {(() => {
                      const cols =
                        spreadMode === "Bid"
                          ? ["strike", "ceBid", "peBid", "BidSpread"]
                          : ["strike", "ceAsk", "peAsk", "AskSpread"];
                      return cols.map((c, idx) => (
                        <th
                          key={c}
                          className="p-3 text-center font-semibold text-xs border-r border-gray-300 dark:border-dark-border last:border-r-0"
                        >
                          {allFields.find((a) => a.key === c)?.label || c}
                        </th>
                      ));
                    })()}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span>Loading option chain data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-8 text-center text-red-600 dark:text-red-400"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                          <span>{error}</span>
                        </div>
                      </td>
                    </tr>
                  ) : sorted.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <svg
                            className="w-12 h-12 text-gray-300 dark:text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                          </svg>
                          <span>No option data available</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sorted.map((r) => {
                      const isATM = atmStrike != null && r.strike === atmStrike;
                      const cols =
                        spreadMode === "Bid"
                          ? ["strike", "ceBid", "peBid", "BidSpread"]
                          : ["strike", "ceAsk", "peAsk", "AskSpread"];
                      return (
                        <MobileRow
                          key={r.strike}
                          r={r}
                          memoFmt={memoFmt}
                          isATM={isATM}
                          cols={cols}
                        />
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-dark-surface sticky top-0">
                  <tr className="text-gray-700 dark:text-dark-text-secondary">
                    {[
                      { key: "strike", label: "Strike", color: "yellow" },
                      { key: "ceBid", label: "CE Bid", color: "green" },
                      { key: "ceAsk", label: "CE Ask", color: "green" },
                      { key: "peBid", label: "PE Bid", color: "red" },
                      { key: "peAsk", label: "PE Ask", color: "red" },
                      {
                        key: "BidSpread",
                        label: "Bid Spread",
                        color: "purple",
                      },
                      {
                        key: "AskSpread",
                        label: "Ask Spread",
                        color: "purple",
                      },
                    ].map(({ key, label, color }) => {
                      const active = sort.key === key;
                      const arrow = active
                        ? sort.dir === "asc"
                          ? "▲"
                          : "▼"
                        : "↕";
                      const colorClasses = {
                        yellow:
                          "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700",
                        green:
                          "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700",
                        red: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700",
                        purple:
                          "bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700",
                      };

                      return (
                        <th
                          key={key}
                          className={`p-4 cursor-pointer select-none font-semibold border-r border-gray-300 dark:border-dark-border last:border-r-0 hover:bg-gray-100 dark:hover:bg-dark-surface transition-all duration-200 ${
                            active ? "bg-blue-50 dark:bg-dark-accent/20" : ""
                          }`}
                          onClick={() => memoOnHeaderClick(key)}
                          title="Click to sort"
                        >
                          <div className="flex items-center gap-2 justify-center whitespace-nowrap">
                            <span>{label}</span>
                            <span
                              className={`text-xs transition-colors ${
                                active
                                  ? "text-blue-600 dark:text-dark-accent"
                                  : "text-gray-400 dark:text-dark-text-secondary"
                              }`}
                            >
                              {arrow}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        <div className="flex flex-col items-center gap-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span className="text-lg">
                            Loading option chain data...
                          </span>
                          <span className="text-sm opacity-75">
                            Fetching real-time prices
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-12 text-center text-red-600 dark:text-red-400"
                      >
                        <div className="flex flex-col items-center gap-4">
                          <svg
                            className="w-12 h-12"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                          <span className="text-lg font-medium">
                            Error loading data
                          </span>
                          <span className="text-sm">{error}</span>
                        </div>
                      </td>
                    </tr>
                  ) : sorted.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        <div className="flex flex-col items-center gap-4">
                          <svg
                            className="w-16 h-16 text-gray-300 dark:text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                          </svg>
                          <span className="text-lg">
                            No option data available
                          </span>
                          <span className="text-sm opacity-75">
                            Try adjusting your filters or refreshing the data
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sorted.map((r) => {
                      const isATM = atmStrike != null && r.strike === atmStrike;
                      return (
                        <DesktopRow
                          key={r.strike}
                          r={r}
                          memoFmt={memoFmt}
                          isATM={isATM}
                        />
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** ---------- Page with two tables ---------- */
export default function OptionChains() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-dark-gradient p-4 md:p-8 transition-colors duration-300">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border p-6 md:p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-600 dark:bg-dark-accent rounded-xl p-3">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-dark-text-primary">
                Option Chains
              </h1>
              <p className="text-gray-600 dark:text-dark-text-secondary mt-1">
                Real-time option chain data with advanced filtering and analysis
              </p>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-dark-success/20 rounded-lg border border-green-200 dark:border-dark-success/30">
              <div className="w-2 h-2 bg-green-500 dark:bg-dark-success rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800 dark:text-dark-success">
                Live Data Updates
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-dark-accent/20 rounded-lg border border-blue-200 dark:border-dark-accent/30">
              <svg
                className="w-4 h-4 text-blue-600 dark:text-dark-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
                />
              </svg>
              <span className="text-sm font-medium text-blue-800 dark:text-dark-accent">
                Advanced Filters
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
              <svg
                className="w-4 h-4 text-gray-600 dark:text-dark-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-800 dark:text-dark-text-secondary">
                Spread Analysis
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Index Cards */}
      <div className="max-w-7xl mx-auto mb-8">
        <IndexCards indices={["NIFTY", "SENSEX"]} className="" />
      </div>

      {/* Option Chain Tables */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <OptionChainTable title="NIFTY Chain" defaultSymbol="NIFTY" />
          <OptionChainTable title="SENSEX Chain" defaultSymbol="SENSEX" />
        </div>
      </div>
    </div>
  );
}
