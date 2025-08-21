import React, { useState, useEffect } from "react";

const DEV_BASE_URL = "http://localhost:8000";

const AdvancedOptionsForm = () => {
  // Form state
  const [formData, setFormData] = useState({
    legs: {
      leg1: {
        symbol: "NIFTY",
        strike: 20000,
        type: "CE",
        expiry: 0, // Numeric expiry: 0=current week
      },
      leg2: {
        symbol: "NIFTY",
        strike: 20100,
        type: "PE",
        expiry: 1, // Numeric expiry: 1=next week
      },
      leg3: {
        symbol: "NIFTY",
        strike: 20200,
        type: "CE",
        expiry: 2, // Numeric expiry: 2=following week
      },
    },
    bidding_leg: {
      symbol: "NIFTY",
      strike: 20150,
      type: "PE",
      expiry: 0, // Numeric expiry: 0=current week
    },
    base_legs: ["leg1", "leg2", "leg3"],
    bidding_leg_key: "bidding_leg",
    desired_spread: 100,
    exit_desired_spread: 80,
    start_price: 50,
    exit_start: 150,
    action: "BUY",
    quantity: 50, // Default to 1 lot of NIFTY
    slices: 50, // Default to 1 lot of NIFTY
    user_ids: [],
    run_state: 0,
    order_type: "LIMIT",
    IOC_timeout: 30,
    exit_price_gap: 2.0,
    no_of_bidask_average: 1,
    notes: "", // Add notes field
  });

  // Counter for generating unique leg IDs
  const [legCounter, setLegCounter] = useState(4);

  // State for storing lot sizes from API
  const [lotSizes, setLotSizes] = useState({
    NIFTY: 50,
    BANKNIFTY: 15,
    FINNIFTY: 40,
    SENSEX: 10,
  });

  // State for users
  const [usersForDropdown, setUsersForDropdown] = useState([]);

  // Fetch users for dropdown
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${DEV_BASE_URL}/users`);
      if (response.ok) {
        const users = await response.json();
        setUsersForDropdown(users);
      } else {
        console.error("Error fetching users:", response.status);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch lot sizes from backend
  const fetchLotSizes = async () => {
    try {
      const response = await fetch(`${DEV_BASE_URL}/lotsizes`);
      if (response.ok) {
        const sizes = await response.json();
        setLotSizes(sizes);
      } else {
        console.error("Error fetching lot sizes:", response.status);
        // Use default lot sizes if endpoint is not available
        console.log("Using default lot sizes");
      }
    } catch (error) {
      console.error("Error fetching lot sizes:", error);
      // Use default lot sizes if endpoint is not available
      console.log("Using default lot sizes");
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchUsers();
    fetchLotSizes();
  }, []);

  // Helper function to generate expiry options (now numeric)
  const getExpiryOptions = () => {
    const options = [
      { value: 0, label: "0 - Current Week" },
      { value: 1, label: "1 - Next Week" },
      { value: 2, label: "2 - Following Week" },
      { value: 3, label: "3 - Month 1" },
      { value: 4, label: "4 - Month 2" },
      { value: 5, label: "5 - Month 3" },
      { value: 6, label: "6 - Month 4" },
      { value: 7, label: "7 - Month 5" },
      { value: 8, label: "8 - Month 6" },
      { value: 9, label: "9 - Month 7" },
    ];
    return options;
  };

  // Helper function to generate lot options
  const getLotOptions = (symbol) => {
    const lotSize = lotSizes[symbol] || 50;
    const options = [];

    for (let i = 1; i <= 10; i++) {
      const quantity = i * lotSize;
      options.push({
        value: quantity,
        label: `${i} Lot (${quantity})`,
      });
    }

    return options;
  };

  // Options for dropdowns
  const symbolOptions = ["NIFTY", "BANKNIFTY", "FINNIFTY", "SENSEX"];
  const typeOptions = ["CE", "PE"];
  const actionOptions = ["BUY", "SELL"];
  const orderTypeOptions = ["LIMIT", "MARKET"];
  const runStateOptions = [
    { value: 0, label: "Running" },
    { value: 1, label: "Paused" },
    { value: 2, label: "Stopped" },
    { value: 3, label: "Not Started" },
  ];

  const expiryOptions = getExpiryOptions();

  // User management
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle leg changes
  const handleLegChange = (legKey, field, value) => {
    setFormData((prev) => ({
      ...prev,
      legs: {
        ...prev.legs,
        [legKey]: {
          ...prev.legs[legKey],
          [field]: value,
        },
      },
    }));
  };

  // Add new base leg
  const addBaseLeg = () => {
    const newLegKey = `leg${legCounter}`;
    setFormData((prev) => ({
      ...prev,
      legs: {
        ...prev.legs,
        [newLegKey]: {
          symbol: "NIFTY",
          strike: 20000,
          type: "CE",
          expiry: 0, // Default to current week (numeric)
        },
      },
      base_legs: [...prev.base_legs, newLegKey],
    }));
    setLegCounter((prev) => prev + 1);
  };

  // Remove base leg
  const removeBaseLeg = (legKey) => {
    if (Object.keys(formData.legs).length <= 1) {
      alert("At least one base leg is required");
      return;
    }

    setFormData((prev) => {
      const newLegs = { ...prev.legs };
      delete newLegs[legKey];

      return {
        ...prev,
        legs: newLegs,
        base_legs: prev.base_legs.filter((leg) => leg !== legKey),
      };
    });
  };

  // Handle base legs selection
  const handleBaseLegToggle = (leg) => {
    setFormData((prev) => ({
      ...prev,
      base_legs: prev.base_legs.includes(leg)
        ? prev.base_legs.filter((l) => l !== leg)
        : [...prev.base_legs, leg],
    }));
  };

  // Handle bidding leg changes
  const handleBiddingLegChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      bidding_leg: {
        ...prev.bidding_leg,
        [field]: value,
      },
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Prepare data in the required format (includes notes field)
      const submitData = {
        ...formData.legs, // Spread all legs (leg1, leg2, etc.)
        bidding_leg: formData.bidding_leg,
        base_legs: formData.base_legs,
        bidding_leg_key: formData.bidding_leg_key,
        desired_spread: formData.desired_spread,
        exit_desired_spread: formData.exit_desired_spread,
        start_price: formData.start_price,
        exit_start: formData.exit_start,
        action: formData.action,
        quantity: formData.quantity,
        slices: formData.slices,
        user_ids: formData.user_ids,
        run_state: formData.run_state,
        order_type: formData.order_type,
        IOC_timeout: formData.IOC_timeout,
        exit_price_gap: formData.exit_price_gap,
        no_of_bidask_average: formData.no_of_bidask_average,
        notes: formData.notes, // Include notes field
      };

      const response = await fetch(`${DEV_BASE_URL}/advanced-options`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        setMessage("Strategy submitted successfully!");
        console.log("Form submitted:", submitData);
      } else {
        throw new Error("Failed to submit strategy");
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      legs: {
        leg1: {
          symbol: "NIFTY",
          strike: 20000,
          type: "CE",
          expiry: 0, // Numeric expiry: 0=current week
        },
        leg2: {
          symbol: "NIFTY",
          strike: 20100,
          type: "PE",
          expiry: 1, // Numeric expiry: 1=next week
        },
        leg3: {
          symbol: "NIFTY",
          strike: 20200,
          type: "CE",
          expiry: 2, // Numeric expiry: 2=following week
        },
      },
      bidding_leg: {
        symbol: "NIFTY",
        strike: 20150,
        type: "PE",
        expiry: 0, // Numeric expiry: 0=current week
      },
      base_legs: ["leg1", "leg2", "leg3"],
      bidding_leg_key: "bidding_leg",
      desired_spread: 100,
      exit_desired_spread: 80,
      start_price: 50,
      exit_start: 150,
      action: "BUY",
      quantity: 50,
      slices: 50,
      user_ids: [],
      run_state: 0,
      order_type: "LIMIT",
      IOC_timeout: 30,
      exit_price_gap: 2.0,
      no_of_bidask_average: 1,
      notes: "", // Reset notes field
    });
    setLegCounter(4);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-light-gradient dark:bg-dark-gradient p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-light-lg dark:shadow-dark-xl p-6 mb-6 border border-light-border dark:border-dark-border">
          <div className="flex items-center gap-4">
            <div className="bg-purple-600 dark:bg-purple-500 rounded-xl p-3">
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                Advanced Options Strategy
              </h1>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                Configure multi-leg options strategy with bidding leg
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Legs Configuration */}
          <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-light-lg dark:shadow-dark-xl p-6 border border-light-border dark:border-dark-border">
            <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
              Legs Configuration
            </h2>

            {/* Expiry Explanation */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500 rounded-full p-1 mt-0.5">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Expiry Cycle Numbers
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Use numeric values: <strong>0</strong>=Current Week,{" "}
                    <strong>1</strong>=Next Week, <strong>2</strong>=Following
                    Week,
                    <strong>3-5</strong>=Monthly Expiries, <strong>6-9</strong>
                    =Quarterly Expiries
                  </p>
                </div>
              </div>
            </div>

            {/* Base Legs */}
            <div className="space-y-6 mb-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-light-text-primary dark:text-dark-text-primary">
                  Base Legs ({Object.keys(formData.legs).length})
                </h3>
                <button
                  type="button"
                  onClick={addBaseLeg}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors flex items-center gap-2"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Base Leg
                </button>
              </div>

              <div className="space-y-4">
                {Object.entries(formData.legs).map(([legKey, legData]) => (
                  <div
                    key={legKey}
                    className="bg-light-elevated dark:bg-dark-elevated rounded-lg p-4 border border-light-border dark:border-dark-border"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-light-text-primary dark:text-dark-text-primary capitalize">
                        {legKey.replace("leg", "Leg ")}
                      </h4>
                      {Object.keys(formData.legs).length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBaseLeg(legKey)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                          title="Remove this leg"
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
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Horizontal layout for leg fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                          Symbol
                        </label>
                        <select
                          value={legData.symbol}
                          onChange={(e) =>
                            handleLegChange(legKey, "symbol", e.target.value)
                          }
                          className="w-full border border-light-border dark:border-dark-border rounded-lg p-3 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                        >
                          {symbolOptions.map((symbol) => (
                            <option key={symbol} value={symbol}>
                              {symbol}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                          Strike
                        </label>
                        <input
                          type="number"
                          value={legData.strike}
                          onChange={(e) =>
                            handleLegChange(
                              legKey,
                              "strike",
                              Number(e.target.value)
                            )
                          }
                          className="w-full border border-light-border dark:border-dark-border rounded-lg p-3 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                          Type
                        </label>
                        <select
                          value={legData.type}
                          onChange={(e) =>
                            handleLegChange(legKey, "type", e.target.value)
                          }
                          className="w-full border border-light-border dark:border-dark-border rounded-lg p-3 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                        >
                          {typeOptions.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                          Expiry
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="9"
                          value={legData.expiry}
                          onChange={(e) =>
                            handleLegChange(
                              legKey,
                              "expiry",
                              Number(e.target.value)
                            )
                          }
                          className="w-full border border-light-border dark:border-dark-border rounded-lg p-3 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                          placeholder="0-9"
                        />
                        <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">
                          0=Current, 1=Next Week, 2=Following, etc.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bidding Leg */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-medium text-light-text-primary dark:text-dark-text-primary mb-4">
                Bidding Leg
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                    Symbol
                  </label>
                  <select
                    value={formData.bidding_leg.symbol}
                    onChange={(e) =>
                      handleBiddingLegChange("symbol", e.target.value)
                    }
                    className="w-full border border-light-border dark:border-dark-border rounded-lg p-3 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                  >
                    {symbolOptions.map((symbol) => (
                      <option key={symbol} value={symbol}>
                        {symbol}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                    Strike
                  </label>
                  <input
                    type="number"
                    value={formData.bidding_leg.strike}
                    onChange={(e) =>
                      handleBiddingLegChange("strike", Number(e.target.value))
                    }
                    className="w-full border border-light-border dark:border-dark-border rounded-lg p-3 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                    Type
                  </label>
                  <select
                    value={formData.bidding_leg.type}
                    onChange={(e) =>
                      handleBiddingLegChange("type", e.target.value)
                    }
                    className="w-full border border-light-border dark:border-dark-border rounded-lg p-3 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                  >
                    {typeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                    Expiry
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="9"
                    value={formData.bidding_leg.expiry}
                    onChange={(e) =>
                      handleBiddingLegChange("expiry", Number(e.target.value))
                    }
                    className="w-full border border-light-border dark:border-dark-border rounded-lg p-3 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                    placeholder="0-9"
                  />
                  <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">
                    0=Current, 1=Next Week, 2=Following, etc.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Strategy Configuration */}
          <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-light-lg dark:shadow-dark-xl p-6 border border-light-border dark:border-dark-border">
            <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-6">
              Strategy Configuration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Base Legs Selection */}
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-3">
                  Base Legs Selection
                </label>
                <div className="flex flex-wrap gap-3">
                  {Object.keys(formData.legs).map((leg) => (
                    <label
                      key={leg}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.base_legs.includes(leg)}
                        onChange={() => handleBaseLegToggle(leg)}
                        className="w-4 h-4 text-light-accent dark:text-dark-accent border-light-border dark:border-dark-border rounded focus:ring-light-accent dark:focus:ring-dark-accent"
                      />
                      <span className="text-light-text-primary dark:text-dark-text-primary capitalize">
                        {leg.replace("leg", "Leg ")}
                      </span>
                    </label>
                  ))}
                </div>
                {formData.base_legs.length === 0 && (
                  <p className="text-sm text-red-500 mt-2">
                    Please select at least one base leg for the strategy.
                  </p>
                )}
              </div>

              {/* Spreads */}
              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                  Desired Spread
                </label>
                <input
                  type="number"
                  value={formData.desired_spread}
                  onChange={(e) =>
                    handleChange("desired_spread", Number(e.target.value))
                  }
                  className="w-full border border-light-border dark:border-dark-border rounded-lg p-3 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                  Exit Desired Spread
                </label>
                <input
                  type="number"
                  value={formData.exit_desired_spread}
                  onChange={(e) =>
                    handleChange("exit_desired_spread", Number(e.target.value))
                  }
                  className="w-full border border-light-border dark:border-dark-border rounded-lg p-3 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                  Start Price
                </label>
                <input
                  type="number"
                  value={formData.start_price}
                  onChange={(e) =>
                    handleChange("start_price", Number(e.target.value))
                  }
                  className="w-full border border-light-border dark:border-dark-border rounded-lg p-3 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                  Exit Start
                </label>
                <input
                  type="number"
                  value={formData.exit_start}
                  onChange={(e) =>
                    handleChange("exit_start", Number(e.target.value))
                  }
                  className="w-full border border-light-border dark:border-dark-border rounded-lg p-3 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                  Exit Price Gap
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.exit_price_gap}
                  onChange={(e) =>
                    handleChange("exit_price_gap", Number(e.target.value))
                  }
                  className="w-full border border-light-border dark:border-dark-border rounded-lg p-3 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                  Action
                </label>
                <select
                  value={formData.action}
                  onChange={(e) => handleChange("action", e.target.value)}
                  className="w-full border border-light-border dark:border-dark-border rounded-lg p-3 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                >
                  {actionOptions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Order Configuration */}
          <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-light-lg dark:shadow-dark-xl p-6 border border-light-border dark:border-dark-border">
            <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-6">
              Order Configuration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                  Quantity (Lots)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    handleChange("quantity", Number(e.target.value))
                  }
                  className="w-full border border-light-border dark:border-dark-border rounded-lg p-3 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                  Slices (Lots)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.slices}
                  onChange={(e) =>
                    handleChange("slices", Number(e.target.value))
                  }
                  className="w-full border border-light-border dark:border-dark-border rounded-lg p-3 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                  Order Type
                </label>
                <select
                  value={formData.order_type}
                  onChange={(e) => handleChange("order_type", e.target.value)}
                  className="w-full border border-light-border dark:border-dark-border rounded-lg p-3 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                >
                  {orderTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                  IOC Timeout (seconds)
                </label>
                <input
                  type="number"
                  value={formData.IOC_timeout}
                  onChange={(e) =>
                    handleChange("IOC_timeout", Number(e.target.value))
                  }
                  className="w-full border border-light-border dark:border-dark-border rounded-lg p-3 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                  Bid/Ask Average
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.no_of_bidask_average}
                  onChange={(e) =>
                    handleChange("no_of_bidask_average", Number(e.target.value))
                  }
                  className="w-full border border-light-border dark:border-dark-border rounded-lg p-3 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                  Run State
                </label>
                <select
                  value={formData.run_state}
                  onChange={(e) =>
                    handleChange("run_state", Number(e.target.value))
                  }
                  className="w-full border border-light-border dark:border-dark-border rounded-lg p-3 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                >
                  {runStateOptions.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes Field */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Add any notes or comments about this strategy..."
                rows={3}
                className="w-full border border-light-border dark:border-dark-border rounded-lg p-3 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent resize-vertical"
              />
            </div>
          </div>

          {/* User Selection */}
          <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-light-lg dark:shadow-dark-xl p-6 border border-light-border dark:border-dark-border">
            <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-6">
              User Selection
            </h2>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                Selected Users
              </label>
              <div className="bg-light-elevated dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg p-4 max-h-40 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {usersForDropdown.length === 0 ? (
                    <div className="text-sm text-light-text-muted dark:text-dark-text-muted col-span-full text-center py-4">
                      No users available
                    </div>
                  ) : (
                    usersForDropdown.map((u) => {
                      const val = String(u.userid ?? u.id);
                      const label = u.username ?? u.userid ?? u.id;
                      const checked = (formData.user_ids || [])
                        .map(String)
                        .includes(val);
                      return (
                        <label
                          key={val}
                          className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-light-surface dark:hover:bg-dark-elevated p-2 rounded transition-colors duration-200"
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-light-accent dark:text-dark-accent border-light-border dark:border-dark-border rounded focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent bg-light-surface dark:bg-dark-surface"
                            checked={checked}
                            onChange={(e) => {
                              setFormData((prev) => {
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
                          <span className="text-light-text-secondary dark:text-dark-text-secondary">
                            {label}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Selected users display */}
              {(formData.user_ids || []).length > 0 && (
                <div className="mt-4">
                  <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">
                    Selected: {formData.user_ids.length} user(s)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.user_ids || []).map((userId) => {
                      const user = usersForDropdown.find(
                        (u) => String(u.userid ?? u.id) === String(userId)
                      );
                      const label = user
                        ? user.username ?? user.userid ?? user.id
                        : userId;
                      return (
                        <span
                          key={userId}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-light-accent/10 dark:bg-dark-accent/10 text-light-accent dark:text-dark-accent rounded-full border border-light-accent/20 dark:border-dark-accent/20"
                        >
                          {label}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                user_ids: (prev.user_ids || []).filter(
                                  (id) => id !== userId
                                ),
                              }));
                            }}
                            className="text-light-accent dark:text-dark-accent hover:text-red-600 dark:hover:text-red-400"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-light-success dark:bg-dark-success text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? "Submitting..." : "Submit Strategy"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="flex-1 py-3 bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors font-semibold"
            >
              Reset Form
            </button>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.includes("Error")
                  ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                  : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdvancedOptionsForm;
