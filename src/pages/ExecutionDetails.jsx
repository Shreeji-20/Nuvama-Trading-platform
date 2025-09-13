import React, { useState, useMemo } from 'react';
import TickDataAnalysis from '../components/TickDataAnalysis';

const ExecutionDetails = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [expandedMilestone, setExpandedMilestone] = useState(null);
  const [executionData, setExecutionData] = useState(null);

  // Sample data from string.txt
  const sampleData = {
    "execution_id": "20250910_220741_063",
    "strategy_name": "DirectIOCBox",
    "params_id": "c72ea026-6022-4c19-bebf-1e4724ddafb4",
    "case_type": null,
    "start_time": "2025-09-10T22:07:41.063475",
    "status": "STARTED",
    "milestones": [
      {
        "timestamp": "2025-09-10T22:07:41.063758",
        "milestone": "Global observation system verified active",
        "details": {}
      },
      {
        "timestamp": "2025-09-10T22:07:41.064632",
        "milestone": "User 70204607 needs more quantity",
        "details": {
          "user": "70204607",
          "leg": "bidding_leg",
          "remaining": 75,
          "current": 0,
          "desired": 75
        }
      },
      {
        "timestamp": "2025-09-10T22:07:41.064882",
        "milestone": "Starting 10-second BUY pair observation for case decision",
        "details": {
          "user": "70204607",
          "buy_legs": ["bidding_leg", "leg4"],
          "sell_legs": ["leg2", "leg3"],
          "observation_duration": 10
        }
      },
      {
        "timestamp": "2025-09-10T22:07:51.096850",
        "milestone": "User 70204607 executing CASE B",
        "details": {
          "strategy": "BUY_FIRST",
          "reason": "BUY_legs_moving_10_seconds",
          "observation_details": {
            "first_leg": "bidding_leg",
            "second_leg": "leg4",
            "trend": "moving",
            "observation_duration": 10,
            "sample_count": 50,
            "price_data": {
              "bidding_leg": [294.3, 295.25, 295.25, 295.25, 295.25, 295.25, 295.25, 295.25, 295.25, 295.25, 295.8, 295.8, 295.8, 295.8, 295.8, 295.8, 295.8, 295.8, 295.2, 295.2, 295.2, 295.2, 295.2, 295.2, 295.2, 295.2, 295.0, 295.0, 295.0, 295.0, 295.0, 295.0, 295.0, 295.0, 295.0, 294.55, 294.55, 294.55, 294.55, 294.55, 294.55, 294.55, 294.55, 294.45, 294.45, 294.45, 294.45, 294.45, 294.45, 294.45],
              "leg4": [199.2, 199.2, 199.2, 199.2, 199.2, 199.2, 199.05, 199.05, 199.05, 199.05, 199.05, 199.05, 199.05, 198.6, 198.6, 198.6, 198.6, 198.6, 198.6, 198.6, 198.6, 198.6, 198.6, 198.6, 198.6, 198.6, 198.6, 198.6, 198.6, 198.6, 199.0, 199.0, 199.0, 199.0, 199.0, 199.0, 199.0, 199.0, 199.0, 199.0, 199.0, 199.0, 199.0, 199.0, 199.0, 199.0, 199.0, 199.0, 199.0, 199.0],
              "timestamps": [1757524061.0651374, 1757524061.2655323, 1757524061.4660857, 1757524061.6667001, 1757524061.8672464, 1757524062.0676725, 1757524062.2681305, 1757524062.4687014, 1757524062.6705856, 1757524062.8721428, 1757524063.072584, 1757524063.2729974, 1757524063.4734602, 1757524063.6741922, 1757524063.876421, 1757524064.076909, 1757524064.277347, 1757524064.4778008, 1757524064.678266, 1757524064.878862, 1757524065.0793715, 1757524065.2799509, 1757524065.4804459, 1757524065.681153, 1757524065.8858354, 1757524066.0861762, 1757524066.2865264, 1757524066.486955, 1757524066.6874526, 1757524066.888004, 1757524067.0887086, 1757524067.2891803, 1757524067.4897518, 1757524067.69016, 1757524067.8905995, 1757524068.0911033, 1757524068.2914746, 1757524068.4918635, 1757524068.6923602, 1757524068.8928468, 1757524069.0933168, 1757524069.2920985, 1757524069.4924896, 1757524069.6931024, 1757524069.893654, 1757524070.0941498, 1757524070.2946703, 1757524070.4951823, 1757524070.695509, 1757524070.8959262]
            },
            "trends": {
              "bidding_leg": {
                "trend": "DECREASING",
                "change": -0.024163265306122932,
                "volatility": 0.4503731785974848,
                "direction": "UP"
              },
              "leg4": {
                "trend": "STABLE",
                "change": 0.004285714285714355,
                "volatility": 0.2202839077191087,
                "direction": "DOWN"
              }
            },
            "final_prices": {
              "bidding_leg": 294.45,
              "leg4": 199.0
            },
            "execution_order": {
              "primary_leg": "bidding_leg",
              "secondary_leg": "leg4",
              "primary_change": -0.024163265306122932,
              "secondary_change": 0.004285714285714355
            }
          }
        }
      },
      {
        "timestamp": "2025-09-10T22:09:09.599852",
        "milestone": "User 70204607 exited with BUY profit",
        "details": {
          "user": "70204607",
          "profit": 2.4499999999999886,
          "spread": 496.0
        }
      },
      {
        "timestamp": "2025-09-10T22:09:10.601387",
        "milestone": "User 70204607 needs more quantity",
        "details": {
          "user": "70204607",
          "leg": "bidding_leg",
          "remaining": 75,
          "current": 0,
          "desired": 75
        }
      },
      {
        "timestamp": "2025-09-10T22:09:10.601956",
        "milestone": "Starting 10-second BUY pair observation for case decision",
        "details": {
          "user": "70204607",
          "buy_legs": ["bidding_leg", "leg4"],
          "sell_legs": ["leg2", "leg3"],
          "observation_duration": 10
        }
      },
      {
        "timestamp": "2025-09-10T22:09:20.632311",
        "milestone": "User 70204607 executing CASE A",
        "details": {
          "strategy": "SELL_FIRST",
          "reason": "BUY_legs_stable_10_seconds",
          "observation_details": false
        }
      },
      {
        "timestamp": "2025-09-10T22:09:20.632806",
        "milestone": "CASE A execution started for user 70204607",
        "details": {
          "strategy": "SELL_FIRST",
          "buy_legs": ["bidding_leg", "leg4"],
          "sell_legs": ["leg2", "leg3"]
        }
      },
      {
        "timestamp": "2025-09-10T22:09:20.633549",
        "milestone": "Placing first SELL order (MODIFY) for leg2",
        "details": {}
      },
      {
        "timestamp": "2025-09-10T22:09:20.934438",
        "milestone": "Placing second SELL order (MODIFY) for leg3",
        "details": {}
      },
      {
        "timestamp": "2025-09-10T22:09:21.235819",
        "milestone": "SELL pair execution completed",
        "details": {
          "spread": 96.1,
          "prices": {
            "leg2": 36.4,
            "leg3": 59.7
          }
        }
      }
    ],
    "errors": [],
    "orders": {},
    "observations": {
      "BUY_PAIR_CASE_DECISION": [
        {
          "timestamp": "2025-09-10T22:07:51.096496",
          "data": {
            "user": "70204607",
            "buy_legs": ["bidding_leg", "leg4"],
            "sell_legs": ["leg2", "leg3"],
            "observation_result": "moving trend detected",
            "observation_duration": 10
          }
        },
        {
          "timestamp": "2025-09-10T22:09:20.631775",
          "data": {
            "user": "70204607",
            "buy_legs": ["bidding_leg", "leg4"],
            "sell_legs": ["leg2", "leg3"],
            "observation_result": false,
            "observation_duration": 10
          }
        }
      ]
    },
    "final_result": null,
    "end_time": null,
    "duration": null
  };

  const data = executionData || sampleData;

  // Helper functions
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status) => {
    const colors = {
      'STARTED': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300',
      'COMPLETED': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
      'FAILED': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300',
      'PAUSED': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
    };
    return colors[status] || 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-300';
  };

  const getStrategyIcon = (strategy) => {
    const icons = {
      'DirectIOCBox': '📊',
      'BUY_FIRST': '🟢',
      'SELL_FIRST': '🔴'
    };
    return icons[strategy] || '📈';
  };

  const calculateDuration = () => {
    if (data.start_time && data.end_time) {
      const start = new Date(data.start_time);
      const end = new Date(data.end_time);
      return Math.round((end - start) / 1000);
    }
    return null;
  };

  const profitMilestones = useMemo(() => {
    return data.milestones.filter(m => 
      m.milestone.includes('profit') || 
      m.milestone.includes('loss') ||
      m.details.profit !== undefined
    );
  }, [data.milestones]);

  const KeyValuePair = ({ label, value, className = "" }) => (
    <div className={`flex justify-between items-center py-2 ${className}`}>
      <span className="text-gray-600 dark:text-dark-text-secondary font-medium">{label}:</span>
      <span className="text-gray-900 dark:text-dark-text-primary font-semibold">{value}</span>
    </div>
  );

  const JsonViewer = ({ data, title }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
      <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-4 border border-gray-200 dark:border-dark-border">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left hover:bg-gray-100 dark:hover:bg-gray-600 p-2 rounded transition-colors duration-200"
        >
          <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">{title}</h4>
          <span className="text-gray-500 dark:text-gray-400">
            {isExpanded ? '−' : '+'}
          </span>
        </button>
        {isExpanded && (
          <pre className="mt-3 text-xs bg-white dark:bg-dark-card-gradient p-3 rounded border overflow-x-auto text-gray-700 dark:text-dark-text-primary max-h-64 overflow-y-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    );
  };

    const PriceChart = ({ prices }) => {
    if (!prices || !Array.isArray(prices) || prices.length === 0) {
      return (
        <div className="bg-gray-50 dark:bg-dark-surface p-4 rounded-lg border border-gray-200 dark:border-dark-border">
          <p className="text-gray-500 dark:text-dark-text-secondary text-center">No price data available</p>
        </div>
      );
    }

    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;

    return (
      <div className="bg-white dark:bg-dark-card-gradient p-6 rounded-lg border border-gray-200 dark:border-dark-border">
        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-dark-text-primary">Price Movement</h4>
        <div className="relative h-40 bg-gray-50 dark:bg-dark-surface rounded border border-gray-200 dark:border-dark-border p-4">
          <svg className="w-full h-full">
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              points={prices.map((price, index) => {
                const x = (index / (prices.length - 1)) * 100;
                const y = 100 - ((price - minPrice) / priceRange) * 100;
                return `${x},${y}`;
              }).join(' ')}
            />
          </svg>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 dark:bg-dark-surface p-3 rounded border border-gray-200 dark:border-dark-border">
            <span className="text-gray-500 dark:text-dark-text-secondary">Min Price:</span>
            <span className="font-medium text-gray-900 dark:text-dark-text-primary ml-2">₹{minPrice.toFixed(2)}</span>
          </div>
          <div className="bg-gray-50 dark:bg-dark-surface p-3 rounded border border-gray-200 dark:border-dark-border">
            <span className="text-gray-500 dark:text-dark-text-secondary">Max Price:</span>
            <span className="font-medium text-gray-900 dark:text-dark-text-primary ml-2">₹{maxPrice.toFixed(2)}</span>
          </div>
          <div className="bg-gray-50 dark:bg-dark-surface p-3 rounded border border-gray-200 dark:border-dark-border">
            <span className="text-gray-500 dark:text-dark-text-secondary">Range:</span>
            <span className="font-medium text-gray-900 dark:text-dark-text-primary ml-2">₹{priceRange.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-dark-gradient p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border p-6 md:p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary">
                Execution Details
              </h1>
              <p className="text-gray-600 dark:text-dark-text-secondary mt-2">
                Strategy execution monitoring and analysis
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Execution ID: {data.execution_id}
              </p>
              <div className="flex items-center mt-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(data.status)}`}>
                  {data.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Execution Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary uppercase tracking-wider">
                  Execution ID
                </p>
                <p className="text-2xl font-bold text-blue-500 mt-2">
                  {data.execution_id.slice(-6)}
                </p>
              </div>
              <div className="text-4xl opacity-20">{getStrategyIcon(data.strategy_name)}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary uppercase tracking-wider">
                  Strategy
                </p>
                <p className="text-2xl font-bold text-green-500 mt-2">
                  {data.strategy_name}
                </p>
              </div>
              <div className="text-4xl opacity-20">🎯</div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary uppercase tracking-wider">
                  Milestones
                </p>
                <p className="text-2xl font-bold text-purple-500 mt-2">
                  {data.milestones.length}
                </p>
              </div>
              <div className="text-4xl opacity-20">📍</div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary uppercase tracking-wider">
                  Start Time
                </p>
                <p className="text-lg font-bold text-orange-500 mt-2">
                  {new Date(data.start_time).toLocaleTimeString()}
                </p>
              </div>
              <div className="text-4xl opacity-20">⏱️</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border mb-8">
          <div className="border-b border-gray-200 dark:border-dark-border">
            <nav className="flex space-x-8 px-6">
              {['overview', 'milestones', 'observations', 'price-analysis', 'raw-data'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors duration-200 ${
                    selectedTab === tab
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {tab.replace('-', ' ')}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-6 border border-gray-200 dark:border-dark-border">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">Basic Information</h3>
                    <div className="space-y-2">
                      <KeyValuePair label="Execution ID" value={data.execution_id} />
                      <KeyValuePair label="Strategy Name" value={data.strategy_name} />
                      <KeyValuePair label="Params ID" value={data.params_id?.slice(0, 8) + '...'} />
                      <KeyValuePair label="Start Time" value={formatTimestamp(data.start_time)} />
                      <KeyValuePair label="Status" value={data.status} />
                      {calculateDuration() && (
                        <KeyValuePair label="Duration" value={`${calculateDuration()}s`} />
                      )}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-6 border border-gray-200 dark:border-dark-border">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">Performance Metrics</h3>
                    <div className="space-y-4">
                      {profitMilestones.length > 0 ? (
                        profitMilestones.map((milestone, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-dark-border last:border-b-0">
                            <span className="text-gray-600 dark:text-dark-text-secondary text-sm">
                              {formatTimestamp(milestone.timestamp)}
                            </span>
                            <span className={`font-semibold ${
                              milestone.details.profit > 0 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              ₹{milestone.details.profit}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No profit/loss data available</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-6 border border-gray-200 dark:border-dark-border">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {data.milestones.slice(-5).reverse().map((milestone, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-white dark:bg-dark-card-gradient rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                            {milestone.milestone}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimestamp(milestone.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'milestones' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">Execution Milestones</h3>
                {data.milestones.map((milestone, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border overflow-hidden">
                    <button
                      onClick={() => setExpandedMilestone(expandedMilestone === index ? null : index)}
                      className="w-full p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">
                              {milestone.milestone}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                              {formatTimestamp(milestone.timestamp)}
                            </p>
                          </div>
                        </div>
                        <span className="text-gray-400 dark:text-gray-500">
                          {expandedMilestone === index ? '−' : '+'}
                        </span>
                      </div>
                    </button>
                    
                    {expandedMilestone === index && Object.keys(milestone.details).length > 0 && (
                      <div className="px-4 pb-4">
                        <div className="bg-white dark:bg-dark-card-gradient rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 dark:text-dark-text-primary mb-3">Details:</h5>
                          <JsonViewer data={milestone.details} title="Milestone Details" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedTab === 'observations' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">Observations</h3>
                {Object.entries(data.observations).map(([key, observations]) => (
                  <div key={key} className="bg-gray-50 dark:bg-dark-surface rounded-lg p-6 border border-gray-200 dark:border-dark-border">
                    <h4 className="font-medium text-gray-900 dark:text-dark-text-primary mb-4">{key.replace(/_/g, ' ')}</h4>
                    <div className="space-y-4">
                      {observations.map((obs, index) => (
                        <div key={index} className="bg-white dark:bg-dark-card-gradient rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                              Observation {index + 1}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
                              {formatTimestamp(obs.timestamp)}
                            </span>
                          </div>
                          <JsonViewer data={obs.data} title="Observation Data" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedTab === 'price-analysis' && (
              <div className="space-y-6">
                {/* Advanced Tick Data Analysis */}
                <TickDataAnalysis />
                
                {/* Original Price Analysis */}
                <div className="bg-white dark:bg-dark-card-gradient rounded-xl p-6 border border-gray-200 dark:border-dark-border">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">Historical Price Analysis</h3>
                  {data.milestones.find(m => m.details.observation_details?.price_data) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {Object.entries(data.milestones.find(m => m.details.observation_details?.price_data)?.details.observation_details.price_data || {}).map(([leg, prices]) => (
                        <PriceChart key={leg} priceData={prices} title={`${leg} Price Movement`} />
                      ))}
                    </div>
                  )}
                  
                  {/* Trends Analysis */}
                  {data.milestones.find(m => m.details.observation_details?.trends) && (
                    <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-6 border border-gray-200 dark:border-dark-border mt-6">
                      <h4 className="font-medium text-gray-900 dark:text-dark-text-primary mb-4">Trends Analysis</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(data.milestones.find(m => m.details.observation_details?.trends)?.details.observation_details.trends || {}).map(([leg, trend]) => (
                          <div key={leg} className="bg-white dark:bg-dark-card-gradient rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 dark:text-dark-text-primary mb-2">{leg}</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-dark-text-secondary">Trend:</span>
                                <span className={`font-medium ${
                                  trend.trend === 'DECREASING' ? 'text-red-500' : 
                                  trend.trend === 'INCREASING' ? 'text-green-500' : 'text-yellow-500'
                                }`}>
                                  {trend.trend}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-dark-text-secondary">Change:</span>
                                <span className={`font-medium ${trend.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {trend.change.toFixed(4)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-dark-text-secondary">Volatility:</span>
                                <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                                  {trend.volatility.toFixed(4)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-dark-text-secondary">Direction:</span>
                                <span className={`font-medium ${trend.direction === 'UP' ? 'text-green-500' : 'text-red-500'}`}>
                                  {trend.direction}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedTab === 'raw-data' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Raw Data</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                  <JsonViewer data={data} title="Complete Execution Data" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* File Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Load Custom Execution Data</h3>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-200">
            <div className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-500 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                  Upload a JSON file with execution data
                </span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  accept=".json"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const jsonData = JSON.parse(event.target.result);
                          setExecutionData(jsonData);
                        } catch (error) {
                          console.error('Error parsing JSON:', error);
                          alert('Error parsing JSON file. Please check the format.');
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                JSON files up to 10MB
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionDetails;
