import React, { useState, useMemo } from "react";
import TickDataUploader from "./TickDataUploader";

interface AskBidValue {
  no?: string;
  price: string;
  qty: string;
}

interface TickData {
  timestamp: number;
  datetime: string;
  type: string;
  redis_key?: string;
  data: {
    response: {
      data: {
        askValues: AskBidValue[];
        bidValues: AskBidValue[];
        ltt?: string;
        symbol?: string;
        taq?: string;
        tbq?: string;
        symbolname: string;
        expiry?: number;
        strikeprice?: string;
        optiontype?: string;
        tradingsymbol?: string;
      };
      streaming_type?: string;
    };
  };
}

interface ProcessedCandle {
  timestamp: number;
  datetime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  askPrice: number;
  bidPrice: number;
  spread: number;
  cumulativeVolume: number;
  totalAskQty: number;
  totalBidQty: number;
  tickCount: number;
  symbol: string;
}

interface ChartData {
  prices: number[];
  volumes: number[];
  labels: string[];
}

interface Statistics {
  priceRange: {
    min: number;
    max: number;
    avg: number;
  };
  volumeRange: {
    min: number;
    max: number;
    avg: number;
  };
  spreadRange: {
    min: number;
    max: number;
    avg: number;
  };
  totalTicks: number;
  symbol: string;
}

interface TickDataAnalysisProps {
  tickData?: TickData[];
}

interface ChartProps {
  data: ChartData;
  type?: "line";
  height?: number;
}

const TickDataAnalysis: React.FC<TickDataAnalysisProps> = ({
  tickData = [],
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1min");
  const [selectedMetric, setSelectedMetric] = useState<string>("price");
  const [chartHeight, setChartHeight] = useState<number>(400);
  const [uploadedData, setUploadedData] = useState<TickData[]>([]);

  // Sample tick data structure
  const sampleTickData: TickData[] = [
    {
      timestamp: 1757494799.8457305,
      datetime: "2025-09-10T13:59:59.845731",
      type: "depth",
      redis_key: "depth:WAAREEENER",
      data: {
        response: {
          data: {
            askValues: [
              { no: "5", price: "3450.00", qty: "110" },
              { no: "1", price: "3450.30", qty: "160" },
              { no: "2", price: "3450.40", qty: "5" },
              { no: "4", price: "3450.60", qty: "34" },
              { no: "1", price: "3450.70", qty: "20" },
            ],
            bidValues: [
              { no: "1", price: "3448.70", qty: "1" },
              { no: "2", price: "3448.60", qty: "3" },
              { no: "3", price: "3448.50", qty: "52" },
              { no: "2", price: "3448.40", qty: "26" },
              { no: "1", price: "3448.30", qty: "23" },
            ],
            ltt: "10/09/2025 14:29:59",
            symbol: "25907_NSE",
            taq: "279934",
            tbq: "444781",
            symbolname: "WAAREEENER",
            expiry: 0,
            strikeprice: "",
            optiontype: "",
            tradingsymbol: "INE377N01017",
          },
          streaming_type: "quote2",
        },
      },
    },
  ];

  // Use uploaded data first, then provided data, then sample data
  const data =
    uploadedData.length > 0
      ? uploadedData
      : tickData.length > 0
      ? tickData
      : sampleTickData;

  // Handle data upload
  const handleDataUpload = (newData: any[]): void => {
    setUploadedData(newData as TickData[]);
  };

  // Process tick data into OHLC format for different timeframes
  const processedData = useMemo((): ProcessedCandle[] => {
    if (!data || data.length === 0) return [];

    const timeframeMinutes: Record<string, number> = {
      "1min": 1,
      "5min": 5,
      "15min": 15,
      "30min": 30,
      "1hour": 60,
      "4hour": 240,
    };

    const intervalMs = timeframeMinutes[selectedTimeframe] * 60 * 1000;
    const candleMap = new Map<number, ProcessedCandle>();

    data.forEach((tick) => {
      try {
        const tickTime = new Date(tick.datetime).getTime();
        const candleTime = Math.floor(tickTime / intervalMs) * intervalMs;

        const askPrice = parseFloat(
          tick.data.response.data.askValues[0]?.price || "0"
        );
        const bidPrice = parseFloat(
          tick.data.response.data.bidValues[0]?.price || "0"
        );
        const midPrice = (askPrice + bidPrice) / 2;
        const spread = askPrice - bidPrice;

        const taq = parseInt(tick.data.response.data.taq || "0");
        const tbq = parseInt(tick.data.response.data.tbq || "0");
        const cumulativeVolume = tbq - taq;

        const totalAskQty = tick.data.response.data.askValues.reduce(
          (sum, ask) => sum + parseInt(ask.qty),
          0
        );
        const totalBidQty = tick.data.response.data.bidValues.reduce(
          (sum, bid) => sum + parseInt(bid.qty),
          0
        );

        if (!candleMap.has(candleTime)) {
          candleMap.set(candleTime, {
            timestamp: candleTime,
            datetime: new Date(candleTime).toISOString(),
            open: midPrice,
            high: midPrice,
            low: midPrice,
            close: midPrice,
            askPrice,
            bidPrice,
            spread,
            cumulativeVolume,
            totalAskQty,
            totalBidQty,
            tickCount: 0,
            symbol: tick.data.response.data.symbolname,
          });
        }

        const candle = candleMap.get(candleTime)!;
        candle.high = Math.max(candle.high, midPrice);
        candle.low = Math.min(candle.low, midPrice);
        candle.close = midPrice;
        candle.askPrice = askPrice;
        candle.bidPrice = bidPrice;
        candle.spread = spread;
        candle.cumulativeVolume = cumulativeVolume;
        candle.totalAskQty = totalAskQty;
        candle.totalBidQty = totalBidQty;
        candle.tickCount++;
      } catch (error) {
        console.error("Error processing tick:", error);
      }
    });

    return Array.from(candleMap.values()).sort(
      (a, b) => a.timestamp - b.timestamp
    );
  }, [data, selectedTimeframe]);

  // Chart data based on selected metric
  const chartData = useMemo((): ChartData => {
    if (!processedData || processedData.length === 0)
      return { prices: [], volumes: [], labels: [] };

    const prices = processedData
      .map((candle) => {
        switch (selectedMetric) {
          case "price":
            return candle.close || 0;
          case "spread":
            return candle.spread || 0;
          case "askPrice":
            return candle.askPrice || 0;
          case "bidPrice":
            return candle.bidPrice || 0;
          default:
            return candle.close || 0;
        }
      })
      .filter((p) => !isNaN(p));

    const volumes = processedData
      .map((candle) => candle.cumulativeVolume || 0)
      .filter((v) => !isNaN(v));
    const labels = processedData.map((candle) =>
      new Date(candle.timestamp).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      })
    );

    return { prices, volumes, labels };
  }, [processedData, selectedMetric]);

  // Calculate statistics
  const statistics = useMemo((): Statistics => {
    if (!processedData || processedData.length === 0)
      return {
        priceRange: { min: 0, max: 0, avg: 0 },
        volumeRange: { min: 0, max: 0, avg: 0 },
        spreadRange: { min: 0, max: 0, avg: 0 },
        totalTicks: 0,
        symbol: "N/A",
      };

    const prices = processedData.map((c) => c.close).filter((p) => !isNaN(p));
    const volumes = processedData
      .map((c) => c.cumulativeVolume)
      .filter((v) => !isNaN(v));
    const spreads = processedData.map((c) => c.spread).filter((s) => !isNaN(s));

    if (prices.length === 0 || volumes.length === 0 || spreads.length === 0) {
      return {
        priceRange: { min: 0, max: 0, avg: 0 },
        volumeRange: { min: 0, max: 0, avg: 0 },
        spreadRange: { min: 0, max: 0, avg: 0 },
        totalTicks: processedData.length,
        symbol: processedData[0]?.symbol || "N/A",
      };
    }

    return {
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
        avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      },
      volumeRange: {
        min: Math.min(...volumes),
        max: Math.max(...volumes),
        avg: volumes.reduce((a, b) => a + b, 0) / volumes.length,
      },
      spreadRange: {
        min: Math.min(...spreads),
        max: Math.max(...spreads),
        avg: spreads.reduce((a, b) => a + b, 0) / spreads.length,
      },
      totalTicks: processedData.length,
      symbol: processedData[0]?.symbol || "N/A",
    };
  }, [processedData]);

  // SVG Chart Component
  const Chart: React.FC<ChartProps> = ({
    data,
    type = "line",
    height = 300,
  }) => {
    if (!data || data.prices.length === 0)
      return (
        <div className="text-center text-gray-500 dark:text-dark-text-secondary py-8">
          No data available
        </div>
      );

    const { prices, volumes, labels } = chartData;

    // Safety checks for empty arrays
    if (!prices || prices.length === 0 || !volumes || volumes.length === 0) {
      return (
        <div className="text-center text-gray-500 dark:text-dark-text-secondary py-8">
          No chart data available
        </div>
      );
    }

    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const maxVolume = Math.max(...volumes.map((v) => Math.abs(v)));
    const minVolume = Math.min(...volumes);

    const priceRange = maxPrice - minPrice || 1;
    const volumeRange = maxVolume - minVolume || 1;

    return (
      <div className="space-y-4">
        {/* Price Chart */}
        <div className="bg-white dark:bg-dark-card-gradient rounded-lg p-4 border border-gray-200 dark:border-dark-border">
          <h4 className="text-sm font-medium text-gray-900 dark:text-dark-text-primary mb-2">
            {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}{" "}
            Movement ({selectedTimeframe})
          </h4>
          <svg className="w-full" style={{ height: height }}>
            {/* Grid lines */}
            {[...Array(5)].map((_, i) => (
              <line
                key={i}
                x1="0"
                y1={`${i * 20}%`}
                x2="100%"
                y2={`${i * 20}%`}
                stroke="#e5e7eb"
                strokeWidth="0.5"
                className="dark:stroke-gray-600"
              />
            ))}

            {/* Price line */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              points={prices
                .map((price, index) => {
                  const x =
                    prices.length > 1
                      ? (index / (prices.length - 1)) * 100
                      : 50;
                  const y =
                    priceRange > 0
                      ? ((maxPrice - price) / priceRange) * 80 + 10
                      : 50;
                  return `${x},${y}`;
                })
                .filter((point) => !point.includes("NaN"))
                .join(" ")}
            />

            {/* Data points */}
            {prices.map((price, index) => {
              const x =
                prices.length > 1 ? (index / (prices.length - 1)) * 100 : 50;
              const y =
                priceRange > 0
                  ? ((maxPrice - price) / priceRange) * 80 + 10
                  : 50;
              if (isNaN(x) || isNaN(y)) return null;
              return (
                <circle
                  key={index}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="3"
                  fill="#3b82f6"
                  className="hover:r-4 transition-all cursor-pointer"
                >
                  <title>{`${labels[index]}: ₹${price.toFixed(2)}`}</title>
                </circle>
              );
            })}
          </svg>
        </div>

        {/* Volume Chart */}
        <div className="bg-white dark:bg-dark-card-gradient rounded-lg p-4 border border-gray-200 dark:border-dark-border">
          <h4 className="text-sm font-medium text-gray-900 dark:text-dark-text-primary mb-2">
            Cumulative Volume Analysis (TBQ - TAQ) - {selectedTimeframe}
          </h4>
          <div className="mb-2 text-xs text-gray-600 dark:text-dark-text-secondary">
            <p>
              •{" "}
              <span className="text-green-600 font-medium">
                Positive values
              </span>
              : More buyers (TBQ {">"}TAQ)
            </p>
            <p>
              •{" "}
              <span className="text-red-600 font-medium">Negative values</span>:
              More sellers (TAQ {">"} TBQ)
            </p>
          </div>
          <svg className="w-full" style={{ height: height * 0.7 }}>
            {/* Grid lines */}
            {[...Array(5)].map((_, i) => (
              <line
                key={i}
                x1="0"
                y1={`${i * 20}%`}
                x2="100%"
                y2={`${i * 20}%`}
                stroke="#e5e7eb"
                strokeWidth="0.5"
                className="dark:stroke-gray-600"
              />
            ))}

            {/* Zero line */}
            <line
              x1="0"
              y1="50%"
              x2="100%"
              y2="50%"
              stroke="#6b7280"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Volume bars */}
            {volumes.map((volume, index) => {
              const x =
                volumes.length > 1 ? (index / (volumes.length - 1)) * 100 : 50;
              const barWidth = Math.max(
                (100 / Math.max(volumes.length, 1)) * 0.8,
                1
              );
              const isPositive = volume >= 0;
              const maxAbsVolume = Math.max(
                1,
                ...volumes.map((v) => Math.abs(v))
              );
              const barHeight =
                maxAbsVolume > 0 ? (Math.abs(volume) / maxAbsVolume) * 45 : 0;
              const y = isPositive ? 50 - barHeight : 50;

              // Skip if any value is NaN
              if (isNaN(x) || isNaN(y) || isNaN(barWidth) || isNaN(barHeight))
                return null;

              return (
                <g key={index}>
                  <rect
                    x={`${x - barWidth / 2}%`}
                    y={`${y}%`}
                    width={`${barWidth}%`}
                    height={`${barHeight}%`}
                    fill={isPositive ? "#10b981" : "#ef4444"}
                    className="hover:opacity-80 cursor-pointer"
                    opacity="0.8"
                  >
                    <title>{`${labels[index] || "N/A"}: ${
                      volume > 0 ? "Buyers Advantage" : "Sellers Advantage"
                    } (${Math.abs(volume).toLocaleString()})`}</title>
                  </rect>

                  {/* Volume value labels for significant bars */}
                  {Math.abs(volume) > maxAbsVolume * 0.5 && !isNaN(x) && (
                    <text
                      x={`${x}%`}
                      y={`${isPositive ? y - 2 : y + barHeight + 4}%`}
                      textAnchor="middle"
                      className="text-xs fill-gray-700 dark:fill-gray-300"
                      fontSize="10"
                    >
                      {Math.abs(volume) > 1000
                        ? `${(Math.abs(volume) / 1000).toFixed(1)}k`
                        : Math.abs(volume).toLocaleString()}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Time labels */}
            {labels.map((label, index) => {
              if (index % Math.ceil(Math.max(labels.length / 8, 1)) === 0) {
                const x =
                  labels.length > 1 ? (index / (labels.length - 1)) * 100 : 50;
                if (isNaN(x)) return null;
                return (
                  <text
                    key={index}
                    x={`${x}%`}
                    y="95%"
                    textAnchor="middle"
                    className="text-xs fill-gray-500 dark:fill-gray-400"
                    fontSize="10"
                  >
                    {label}
                  </text>
                );
              }
              return null;
            })}
          </svg>
          <div className="flex justify-center space-x-6 mt-3 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-600 dark:text-dark-text-secondary">
                Buyers Dominating
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-600 dark:text-dark-text-secondary">
                Sellers Dominating
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-1 bg-gray-600 rounded"></div>
              <span className="text-gray-600 dark:text-dark-text-secondary">
                Equilibrium
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Data Upload Section */}
      <TickDataUploader onDataUpload={handleDataUpload} />

      {/* Header */}
      <div className="bg-white dark:bg-dark-card-gradient rounded-xl p-6 border border-gray-200 dark:border-dark-border">
        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
          Tick Data Analysis - {statistics.symbol}
        </h2>

        {uploadedData.length > 0 && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-400">
                  Uploaded data loaded successfully! ({uploadedData.length} tick
                  records)
                </p>
              </div>
            </div>
          </div>
        )}

        {uploadedData.length === 0 && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                  Using sample data. Upload your tick data file above for real
                  analysis.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Timeframe Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
              Timeframe
            </label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md 
                         bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1min">1 Minute</option>
              <option value="5min">5 Minutes</option>
              <option value="15min">15 Minutes</option>
              <option value="30min">30 Minutes</option>
              <option value="1hour">1 Hour</option>
              <option value="4hour">4 Hours</option>
            </select>
          </div>

          {/* Metric Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
              Price Metric
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md 
                         bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="price">Mid Price</option>
              <option value="askPrice">Ask Price</option>
              <option value="bidPrice">Bid Price</option>
              <option value="spread">Bid-Ask Spread</option>
            </select>
          </div>

          {/* Chart Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
              Chart Height
            </label>
            <select
              value={chartHeight}
              onChange={(e) => setChartHeight(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md 
                         bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="300">Small</option>
              <option value="400">Medium</option>
              <option value="500">Large</option>
              <option value="600">Extra Large</option>
            </select>
          </div>

          {/* Data Points */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
              Data Points
            </label>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {statistics.totalTicks}
            </div>
            <div className="text-xs text-gray-500 dark:text-dark-text-secondary">
              Total Candles
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-4 border border-gray-200 dark:border-dark-border">
            <h4 className="font-medium text-gray-900 dark:text-dark-text-primary mb-2">
              Price Statistics
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-text-secondary">
                  Min:
                </span>
                <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                  ₹{statistics.priceRange?.min?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-text-secondary">
                  Max:
                </span>
                <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                  ₹{statistics.priceRange?.max?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-text-secondary">
                  Avg:
                </span>
                <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                  ₹{statistics.priceRange?.avg?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-4 border border-gray-200 dark:border-dark-border">
            <h4 className="font-medium text-gray-900 dark:text-dark-text-primary mb-2">
              Volume Statistics
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-text-secondary">
                  Min:
                </span>
                <span
                  className={`font-medium ${
                    statistics.volumeRange?.min >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {statistics.volumeRange?.min?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-text-secondary">
                  Max:
                </span>
                <span
                  className={`font-medium ${
                    statistics.volumeRange?.max >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {statistics.volumeRange?.max?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-text-secondary">
                  Avg:
                </span>
                <span
                  className={`font-medium ${
                    statistics.volumeRange?.avg >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {statistics.volumeRange?.avg?.toFixed(0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-4 border border-gray-200 dark:border-dark-border">
            <h4 className="font-medium text-gray-900 dark:text-dark-text-primary mb-2">
              Spread Statistics
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-text-secondary">
                  Min:
                </span>
                <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                  ₹{statistics.spreadRange?.min?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-text-secondary">
                  Max:
                </span>
                <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                  ₹{statistics.spreadRange?.max?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-text-secondary">
                  Avg:
                </span>
                <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                  ₹{statistics.spreadRange?.avg?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <Chart data={chartData} height={chartHeight} />

      {/* Order Book Visualization */}
      {processedData.length > 0 && (
        <div className="bg-white dark:bg-dark-card-gradient rounded-xl p-6 border border-gray-200 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">
            Latest Order Book Analysis
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ask Side */}
            <div>
              <h4 className="font-medium text-red-600 dark:text-red-400 mb-3">
                Ask Side (Sellers)
              </h4>
              <div className="space-y-2">
                {data[0]?.data.response.data.askValues.map((ask, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                      ₹{ask.price}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
                      {ask.qty} qty
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bid Side */}
            <div>
              <h4 className="font-medium text-green-600 dark:text-green-400 mb-3">
                Bid Side (Buyers)
              </h4>
              <div className="space-y-2">
                {data[0]?.data.response.data.bidValues.map((bid, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                      ₹{bid.price}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
                      {bid.qty} qty
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white dark:bg-dark-card-gradient rounded-xl p-6 border border-gray-200 dark:border-dark-border">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">
          Processed Data ({selectedTimeframe})
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-border">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                  Time
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                  Open
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                  High
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                  Low
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                  Close
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                  Spread
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                  Cum. Volume
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                  Sentiment
                </th>
              </tr>
            </thead>
            <tbody>
              {processedData.slice(-10).map((candle, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-dark-surface"
                >
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-dark-text-primary">
                    {new Date(candle.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-dark-text-primary">
                    ₹{candle.open.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-sm text-green-600 dark:text-green-400">
                    ₹{candle.high.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-sm text-red-600 dark:text-red-400">
                    ₹{candle.low.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-dark-text-primary">
                    ₹{candle.close.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-dark-text-secondary">
                    ₹{candle.spread.toFixed(2)}
                  </td>
                  <td
                    className={`px-4 py-2 text-sm font-medium ${
                      candle.cumulativeVolume >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {candle.cumulativeVolume.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        candle.cumulativeVolume > 0
                          ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                          : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400"
                      }`}
                    >
                      {candle.cumulativeVolume > 0 ? "Bullish" : "Bearish"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TickDataAnalysis;
