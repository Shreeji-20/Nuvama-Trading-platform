import React, { useState, useEffect, useCallback, useMemo } from "react";
import IndexCards from "../components/IndexCards";
import config from "../config/api";

const MultiLegSpread = () => {
  // Debug toggle for console logging
  const [debugMode, setDebugMode] = useState(false);

  // State for managing spread strategies
  const [strategies, setStrategies] = useState([]);
  const [displayStrategies, setDisplayStrategies] = useState([]);

  // Form state for adding new leg to current strategy
  const [currentStrategy, setCurrentStrategy] = useState({
    id: null,
    name: "",
    legs: [],
    totalSpread: null,
    biddingLegId: null, // ID of the leg selected as bidding leg
  });

  const [legForm, setLegForm] = useState({
    symbol: "NIFTY",
    strike: "",
    expiry: "0",
    optionType: "CE",
    orderType: "buy",
    quantity: 1,
    noBidAskAverage: 1, // Per-leg bid/ask averaging
    pricingMethod: "average", // "average" or "depth"
    depthIndex: 3, // Which depth level to use (1-5)
  });

  const [strategyName, setStrategyName] = useState("");
  const [editingStrategy, setEditingStrategy] = useState(null);
  const [editingLeg, setEditingLeg] = useState(null);
  const [sendToAdvanced, setSendToAdvanced] = useState(false);

  // Form for editing individual legs
  const [editLegForm, setEditLegForm] = useState({
    symbol: "NIFTY",
    strike: "",
    expiry: "0",
    optionType: "CE",
    orderType: "buy",
    quantity: 1,
    noBidAskAverage: 1, // Per-leg bid/ask averaging
    pricingMethod: "average", // "average" or "depth"
    depthIndex: 3, // Which depth level to use (1-5)
  });

  // Symbol and expiry options
  const symbolOptions = ["NIFTY", "BANKNIFTY", "FINNIFTY", "SENSEX"];
  const expiryOptions = useMemo(
    () => [
      { value: "0", label: "Current Week" },
      { value: "1", label: "Next Week" },
      { value: "2", label: "Week + 2" },
      { value: "3", label: "Week + 3" },
    ],
    []
  );

  // Filter function to get leg price from option data with bid/ask averaging and depth pricing
  const filterLegPrice = useCallback(
    (
      data,
      symbol,
      expiry,
      strikeprice,
      optiontype,
      orderType,
      noBidAskAverage = 1,
      pricingMethod = "average",
      depthIndex = 3
    ) => {
      try {
        // Validate inputs
        if (!data || !Array.isArray(data)) {
          console.warn("Invalid data provided to filterLegPrice");
          return null;
        }

        const match = data.find(
          (item) =>
            item?.response?.data?.symbolname?.includes(symbol) &&
            String(item?.response?.data?.expiry) === String(expiry) &&
            Number(item?.response?.data?.strikeprice) === Number(strikeprice) &&
            item?.response?.data?.optiontype === optiontype
        );

        if (!match) {
          if (debugMode)
            console.warn(
              `No match found for ${symbol} ${strikeprice} ${optiontype} exp:${expiry}`
            );
          return null;
        }

        const d = match.response.data;

        if (orderType === "buy") {
          // For buy orders, use bid values
          const bidValues = d.bidValues || [];
          if (bidValues.length === 0) {
            if (debugMode)
              console.warn(
                `No bid values for ${symbol} ${strikeprice} ${optiontype}`
              );
            return null;
          }

          if (pricingMethod === "depth") {
            // Use specific depth index (1-based, convert to 0-based)
            const index = Math.max(
              0,
              Math.min(depthIndex - 1, bidValues.length - 1)
            );
            const price = Number(bidValues[index]?.price);
            return !isNaN(price) && price > 0 ? price : null;
          } else {
            // Use averaging method
            const valuesToAverage = bidValues.slice(
              0,
              Math.min(noBidAskAverage, bidValues.length)
            );

            const validPrices = valuesToAverage
              .map((val) => Number(val.price))
              .filter((price) => !isNaN(price) && price > 0);

            if (validPrices.length === 0) return null;

            const sum = validPrices.reduce((acc, price) => acc + price, 0);
            const average = sum / validPrices.length;

            return !isNaN(average) && average > 0 ? average : null;
          }
        } else {
          // For sell orders, use ask values
          const askValues = d.askValues || [];
          if (askValues.length === 0) {
            if (debugMode)
              console.warn(
                `No ask values for ${symbol} ${strikeprice} ${optiontype}`
              );
            return null;
          }

          if (pricingMethod === "depth") {
            // Use specific depth index (1-based, convert to 0-based)
            const index = Math.max(
              0,
              Math.min(depthIndex - 1, askValues.length - 1)
            );
            const price = Number(askValues[index]?.price);
            return !isNaN(price) && price > 0 ? price : null;
          } else {
            // Use averaging method
            const valuesToAverage = askValues.slice(
              0,
              Math.min(noBidAskAverage, askValues.length)
            );

            const validPrices = valuesToAverage
              .map((val) => Number(val.price))
              .filter((price) => !isNaN(price) && price > 0);

            if (validPrices.length === 0) return null;

            const sum = validPrices.reduce((acc, price) => acc + price, 0);
            const average = sum / validPrices.length;

            return !isNaN(average) && average > 0 ? average : null;
          }
        }
      } catch (error) {
        console.error("Error in filterLegPrice:", error);
        return null;
      }
    },
    []
  );

  // Calculate reverse spread by inverting all leg actions
  const calculateReverseSpread = useCallback(
    (strategy, optionData) => {
      try {
        if (!strategy?.legs || strategy.legs.length === 0) {
          return null;
        }

        let reverseSpread = 0;
        let hasValidPrice = false;

        if (debugMode) {
          console.log("=== CALCULATING REVERSE SPREAD ===");
          console.log("Strategy:", strategy.name);
        }

        for (const leg of strategy.legs) {
          // Validate leg data
          if (!leg || typeof leg.quantity !== "number" || leg.quantity <= 0) {
            console.warn("Invalid leg data:", leg);
            continue;
          }

          // Reverse the order type: buy becomes sell, sell becomes buy
          const reversedOrderType = leg.orderType === "buy" ? "sell" : "buy";
          const legNoBidAskAverage = Number(leg.noBidAskAverage) || 1;
          const legPricingMethod = leg.pricingMethod || "average";
          const legDepthIndex = Number(leg.depthIndex) || 3;

          const legPrice = filterLegPrice(
            optionData,
            leg.symbol,
            leg.expiry,
            leg.strike,
            leg.optionType,
            reversedOrderType,
            legNoBidAskAverage,
            legPricingMethod,
            legDepthIndex
          );

          if (debugMode) {
            console.log(
              `Reverse calculation for ${leg.symbol} ${leg.strike} ${leg.optionType}:`,
              {
                originalOrder: leg.orderType,
                reversedOrder: reversedOrderType,
                price: legPrice,
                quantity: leg.quantity,
                pricingMethod: legPricingMethod,
                noBidAskAverage: legNoBidAskAverage,
                depthIndex: legDepthIndex,
              }
            );
          }

          if (legPrice !== null && !isNaN(legPrice) && legPrice > 0) {
            hasValidPrice = true;

            // Validate quantity
            const quantity = Number(leg.quantity);
            if (isNaN(quantity) || quantity <= 0) {
              console.warn("Invalid quantity for leg:", leg);
              continue;
            }

            // Calculate contribution with reversed action
            const contribution =
              reversedOrderType === "sell"
                ? -Number(legPrice) * quantity
                : Number(legPrice) * quantity;

            // Validate contribution
            if (!isNaN(contribution)) {
              reverseSpread += contribution;
              if (debugMode)
                console.log(
                  `Added contribution: ${contribution}, running total: ${reverseSpread}`
                );
            } else {
              if (debugMode)
                console.warn("Invalid contribution calculated:", contribution);
            }
          } else {
            if (debugMode)
              console.warn(
                `No valid price for reversed ${leg.symbol} ${leg.strike} ${leg.optionType}`
              );
          }
        }

        const finalSpread =
          hasValidPrice && !isNaN(reverseSpread) ? reverseSpread : null;
        if (debugMode) console.log("Final reverse spread:", finalSpread);
        return finalSpread;
      } catch (error) {
        console.error("Error in calculateReverseSpread:", error);
        return null;
      }
    },
    [filterLegPrice]
  );

  // Update all strategy spreads
  const updateAllSpreads = useCallback(async () => {
    if (!Array.isArray(strategies) || strategies.length === 0) {
      setDisplayStrategies([]);
      return;
    }

    try {
      // Fetch optiondata once for all strategies
      const res = await fetch(config.buildUrl(config.ENDPOINTS.OPTIONDATA));
      if (!res.ok) throw new Error(`Failed to fetch optiondata: ${res.status}`);
      const optionData = await res.json();

      if (debugMode) {
        console.log("=== UPDATING ALL SPREADS ===");
        console.log("Fetched option data:", optionData?.length, "items");
      }

      const updatedStrategies = strategies.map((strategy) => {
        if (debugMode)
          console.log(`\n=== Processing Strategy: ${strategy.name} ===`);

        if (!strategy.legs || strategy.legs.length === 0) {
          if (debugMode) console.log("No legs found for strategy");
          return {
            ...strategy,
            totalSpread: null,
            reverseSpread: null,
            biddingLegId: strategy.biddingLegId,
          };
        }

        let totalSpread = 0;
        let hasValidPrice = false;
        let legDetails = [];

        for (const leg of strategy.legs) {
          // Validate leg data
          if (!leg || typeof leg.quantity !== "number" || leg.quantity <= 0) {
            console.warn("Invalid leg data:", leg);
            continue;
          }

          const legNoBidAskAverage = Number(leg.noBidAskAverage) || 1;
          const legPricingMethod = leg.pricingMethod || "average";
          const legDepthIndex = Number(leg.depthIndex) || 3;

          const legPrice = filterLegPrice(
            optionData,
            leg.symbol,
            leg.expiry,
            leg.strike,
            leg.optionType,
            leg.orderType,
            legNoBidAskAverage,
            legPricingMethod,
            legDepthIndex
          );

          legDetails.push({
            leg: `${leg.symbol} ${leg.strike} ${leg.optionType}`,
            price: legPrice,
            orderType: leg.orderType,
            quantity: leg.quantity,
            noBidAskAverage: legNoBidAskAverage,
            pricingMethod: legPricingMethod,
            depthIndex: legDepthIndex,
          });

          if (debugMode) {
            console.log(
              `Forward calculation for ${leg.symbol} ${leg.strike} ${leg.optionType}:`,
              {
                orderType: leg.orderType,
                price: legPrice,
                quantity: leg.quantity,
                pricingMethod: legPricingMethod,
                noBidAskAverage: legNoBidAskAverage,
                depthIndex: legDepthIndex,
              }
            );
          }

          if (legPrice !== null && !isNaN(legPrice) && legPrice > 0) {
            hasValidPrice = true;

            // Validate quantity
            const quantity = Number(leg.quantity);
            if (isNaN(quantity) || quantity <= 0) {
              console.warn("Invalid quantity for leg:", leg);
              continue;
            }

            // If sell order, subtract the price (negative contribution)
            // If buy order, add the price (positive contribution)
            const contribution =
              leg.orderType === "sell"
                ? -Number(legPrice) * quantity
                : Number(legPrice) * quantity;

            // Validate contribution
            if (!isNaN(contribution)) {
              totalSpread += contribution;
              if (debugMode)
                console.log(
                  `Added contribution: ${contribution}, running total: ${totalSpread}`
                );
            } else {
              if (debugMode)
                console.warn("Invalid contribution calculated:", contribution);
            }
          } else {
            if (debugMode)
              console.warn(
                `No valid price for ${leg.symbol} ${leg.strike} ${leg.optionType}`
              );
          }
        }

        // Calculate reverse spread
        const reverseSpread = calculateReverseSpread(strategy, optionData);

        if (debugMode) {
          console.log(`Strategy "${strategy.name}" final calculation:`, {
            legDetails,
            totalSpread:
              hasValidPrice && !isNaN(totalSpread) ? totalSpread : null,
            reverseSpread,
            hasValidPrice,
          });
        }

        return {
          ...strategy,
          totalSpread:
            hasValidPrice && !isNaN(totalSpread) ? totalSpread : null,
          reverseSpread,
          biddingLegId: strategy.biddingLegId,
        };
      });

      setDisplayStrategies(updatedStrategies);
    } catch (err) {
      console.error("Error updating spreads:", err);
      setDisplayStrategies(
        strategies.map((s) => ({
          ...s,
          totalSpread: null,
          reverseSpread: null,
          biddingLegId: s.biddingLegId,
        }))
      );
    }
  }, [strategies, filterLegPrice, calculateReverseSpread]);

  // Handle form changes
  const handleLegFormChange = (e) => {
    const { name, value } = e.target;

    // Handle numeric fields properly
    let processedValue = value;
    if (
      name === "noBidAskAverage" ||
      name === "depthIndex" ||
      name === "quantity" ||
      name === "strike"
    ) {
      // Only convert to number if value is not empty and is a valid number
      if (value !== "" && !isNaN(Number(value))) {
        processedValue = Number(value);
      } else if (value === "") {
        processedValue = ""; // Keep empty string during typing
      } else {
        processedValue = value; // Keep invalid input as string to show validation error
      }
    }

    setLegForm((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  // Handle edit leg form changes
  const handleEditLegFormChange = (e) => {
    const { name, value } = e.target;

    // Handle numeric fields properly
    let processedValue = value;
    if (
      name === "noBidAskAverage" ||
      name === "depthIndex" ||
      name === "quantity" ||
      name === "strike"
    ) {
      processedValue = value === "" ? "" : Number(value);
    }

    setEditLegForm((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  // Start editing a leg
  const startEditingLeg = (leg) => {
    setEditingLeg(leg);
    setEditLegForm({
      symbol: leg.symbol,
      strike: leg.strike.toString(),
      expiry: leg.expiry,
      optionType: leg.optionType,
      orderType: leg.orderType,
      quantity: leg.quantity,
      noBidAskAverage: leg.noBidAskAverage || 1,
      pricingMethod: leg.pricingMethod || "average",
      depthIndex: leg.depthIndex || 3,
    });
  };

  // Update leg in current strategy
  const updateLegInStrategy = () => {
    if (!editingLeg) return;

    const updatedLeg = {
      ...editingLeg,
      symbol: editLegForm.symbol,
      strike: Number(editLegForm.strike),
      expiry: editLegForm.expiry,
      optionType: editLegForm.optionType,
      orderType: editLegForm.orderType,
      quantity: Number(editLegForm.quantity),
      noBidAskAverage: Number(editLegForm.noBidAskAverage),
      pricingMethod: editLegForm.pricingMethod,
      depthIndex: Number(editLegForm.depthIndex),
    };

    setCurrentStrategy((prev) => ({
      ...prev,
      legs: prev.legs.map((leg) =>
        leg.id === editingLeg.id ? updatedLeg : leg
      ),
    }));

    // Reset edit form
    setEditingLeg(null);
    setEditLegForm({
      symbol: "NIFTY",
      strike: "",
      expiry: "0",
      optionType: "CE",
      orderType: "buy",
      quantity: 1,
      noBidAskAverage: 1,
      pricingMethod: "average",
      depthIndex: 3,
    });
  };

  // Cancel editing leg
  const cancelEditingLeg = () => {
    setEditingLeg(null);
    setEditLegForm({
      symbol: "NIFTY",
      strike: "",
      expiry: "0",
      optionType: "CE",
      orderType: "buy",
      quantity: 1,
      noBidAskAverage: 1,
      pricingMethod: "average",
      depthIndex: 3,
    });
  };

  // Symbol to lot size mapping (same as in Strategies.jsx)
  const [lotSizes, setLotSizes] = useState({
    NIFTY: 75,
    BANKNIFTY: 25,
    FINNIFTY: 40,
    SENSEX: 10,
  });

  // Helper function to get lot size for a symbol
  const getLotSize = (symbol) => {
    return lotSizes[symbol] || 75; // fallback to 75 if not found
  };

  // Map MultiLeg strategy to AdvancedOptions format
  const mapToAdvancedOptionsFormat = (strategy) => {
    if (!strategy.legs || strategy.legs.length === 0) return null;

    console.log("=== MAPPING STRATEGY TO ADVANCED FORMAT ===");
    console.log("Full strategy object:", strategy);
    console.log("Strategy bidding leg ID:", strategy.biddingLegId);
    console.log(
      "Available leg IDs:",
      strategy.legs.map((leg) => ({
        id: leg.id,
        symbol: leg.symbol,
        strike: leg.strike,
      }))
    );
    // Determine which leg is the bidding leg - ALWAYS respect the saved selection
    let biddingLegId = strategy.biddingLegId;
    let selectedBiddingLeg = null;

    console.log("DEBUG: Bidding leg search details:", {
      searchingFor: biddingLegId,
      searchingForType: typeof biddingLegId,
      availableIds: strategy.legs.map((leg) => ({
        id: leg.id,
        type: typeof leg.id,
      })),
    });

    // Find the selected bidding leg in the legs array with type-safe comparison
    if (biddingLegId) {
      selectedBiddingLeg = strategy.legs.find(
        (leg) => String(leg.id) === String(biddingLegId)
      );
      if (!selectedBiddingLeg) {
        console.warn(
          "Saved bidding leg ID not found in legs array, falling back to first leg"
        );
        console.warn("Search details:", {
          biddingLegId,
          biddingLegIdType: typeof biddingLegId,
          availableLegs: strategy.legs.map((leg) => ({
            id: leg.id,
            type: typeof leg.id,
          })),
        });
        selectedBiddingLeg = strategy.legs[0];
        biddingLegId = selectedBiddingLeg.id;
      } else {
        console.log("Using saved bidding leg:", selectedBiddingLeg);
      }
    } else {
      // No bidding leg selected, use first leg as default
      selectedBiddingLeg = strategy.legs[0];
      biddingLegId = selectedBiddingLeg.id;
      console.log(
        "No bidding leg selected, defaulting to first leg:",
        selectedBiddingLeg
      );
    }

    console.log("Final bidding leg selection:", {
      biddingLegId: biddingLegId,
      selectedBiddingLeg: selectedBiddingLeg,
      totalLegs: strategy.legs.length,
    });

    // Create legs object (leg1, leg2, leg3, etc.) and base_legs array
    const legs = {};
    const baseLegs = [];
    let biddingLeg = null;

    strategy.legs.forEach((leg, index) => {
      const legKey = `leg${index + 1}`;
      const symbolLotSize = getLotSize(leg.symbol);

      const legData = {
        symbol: leg.symbol,
        strike: leg.strike,
        type: leg.optionType, // CE/PE
        expiry: parseInt(leg.expiry), // Convert to number
        action: leg.orderType.toUpperCase(), // BUY/SELL
        quantity: leg.quantity * symbolLotSize, // Convert to lot size based on symbol
      };

      legs[legKey] = legData;

      // Check if this is the selected bidding leg (type-safe comparison)
      if (String(leg.id) === String(biddingLegId)) {
        biddingLeg = {
          ...legData,
          noBidAskAverage: leg.noBidAskAverage || 1,
          pricingMethod: leg.pricingMethod || "average",
          depthIndex: leg.depthIndex || 3,
        };
        console.log(
          `Set bidding leg from index ${index}:`,
          leg,
          `Lot size: ${symbolLotSize}`
        );
      } else {
        // Only add non-bidding legs to base_legs
        baseLegs.push(legKey);
        console.log(`Added ${legKey} to base_legs (not bidding leg)`);
      }
    });

    // Final validation - ensure we have a bidding leg
    if (!biddingLeg) {
      console.error("ERROR: No bidding leg created, this should not happen!");
      // Emergency fallback
      const firstLeg = strategy.legs[0];
      const firstLegLotSize = getLotSize(firstLeg.symbol);
      biddingLeg = {
        symbol: firstLeg.symbol,
        strike: firstLeg.strike,
        type: firstLeg.optionType,
        expiry: parseInt(firstLeg.expiry),
        action: firstLeg.orderType.toUpperCase(),
        quantity: firstLeg.quantity * firstLegLotSize,
        noBidAskAverage: firstLeg.noBidAskAverage || 1,
        pricingMethod: firstLeg.pricingMethod || "average",
        depthIndex: firstLeg.depthIndex || 3,
      };
      // Remove leg1 from base_legs since it's now the bidding leg
      const firstLegKey = "leg1";
      const index = baseLegs.indexOf(firstLegKey);
      if (index > -1) {
        baseLegs.splice(index, 1);
      }
      console.log("Emergency fallback: Used first leg as bidding leg");
    }

    console.log("Final mapping result:", {
      biddingLeg: biddingLeg,
      baseLegs: baseLegs,
      totalLegsCount: Object.keys(legs).length,
    });

    return {
      ...legs,
      bidding_leg: biddingLeg,
      base_legs: baseLegs,
      bidding_leg_key: "bidding_leg",
      desired_spread: Math.abs(strategy.totalSpread || 100),
      exit_desired_spread: Math.abs(strategy.totalSpread || 100) * 0.8,
      start_price: 50,
      exit_start: 150,
      action: "BUY",
      quantity_multiplier: 1, // For multiplying leg quantities
      slice_multiplier: 1, // For slicing orders
      user_ids: [],
      run_state: 3, // Not Started
      order_type: "LIMIT",
      IOC_timeout: 30,
      exit_price_gap: 2.0,
      no_of_bidask_average: biddingLeg?.noBidAskAverage || 1,
      pricing_method: biddingLeg?.pricingMethod || "average",
      depth_index: biddingLeg?.depthIndex || 3,
      notes: `Imported from MultiLeg: ${strategy.name} | Bidding Leg: ${biddingLeg?.symbol} ${biddingLeg?.strike} ${biddingLeg?.type}`,
    };
  }; // Send strategy to Advanced Options
  const sendStrategyToAdvanced = async (strategy, forceManual = false) => {
    // Only check the toggle if this is not a manual send (force = false means auto-send on save)
    if (!forceManual && !sendToAdvanced) return;

    console.log("=== SENDING STRATEGY TO ADVANCED ===");
    console.log("Strategy being sent:", {
      name: strategy.name,
      biddingLegId: strategy.biddingLegId,
      legs: strategy.legs.map((leg) => ({
        id: leg.id,
        symbol: leg.symbol,
        strike: leg.strike,
      })),
      selectedBiddingLeg: strategy.legs.find(
        (leg) => String(leg.id) === String(strategy.biddingLegId)
      ),
    });

    try {
      const advancedFormat = mapToAdvancedOptionsFormat(strategy);
      if (!advancedFormat) {
        alert("Cannot convert strategy - no legs found");
        return;
      }

      console.log("Converted to advanced format:", {
        biddingLeg: advancedFormat.bidding_leg,
        baseLegs: advancedFormat.base_legs,
        notes: advancedFormat.notes,
      });

      const response = await fetch(
        config.buildUrl(config.ENDPOINTS.ADVANCED_OPTIONS),
        config.getFetchOptions("POST", advancedFormat)
      );

      if (response.ok) {
        alert(
          `Strategy "${strategy.name}" sent to Advanced Options successfully!`
        );
      } else {
        throw new Error("Failed to send strategy to Advanced Options");
      }
    } catch (error) {
      console.error("Error sending to Advanced Options:", error);
      alert(`Failed to send strategy: ${error.message}`);
    }
  };

  // Add leg to current strategy
  const addLegToStrategy = () => {
    // Validate strike price
    if (
      !legForm.strike ||
      legForm.strike === "" ||
      isNaN(Number(legForm.strike))
    ) {
      alert("Please enter a valid strike price");
      return;
    }

    // Ensure all numeric values are valid
    const strike = Number(legForm.strike);
    const quantity = Number(legForm.quantity) || 1;
    const noBidAskAverage = Number(legForm.noBidAskAverage) || 1;
    const depthIndex = Number(legForm.depthIndex) || 3;

    // Validate all numeric values
    if (isNaN(strike) || strike <= 0) {
      alert("Strike price must be a valid number greater than 0");
      return;
    }

    if (isNaN(quantity) || quantity <= 0) {
      alert("Quantity must be a valid number greater than 0");
      return;
    }

    if (isNaN(noBidAskAverage) || noBidAskAverage < 1 || noBidAskAverage > 5) {
      alert("Bid/Ask Average must be between 1 and 5");
      return;
    }

    if (isNaN(depthIndex) || depthIndex < 1 || depthIndex > 5) {
      alert("Depth Index must be between 1 and 5");
      return;
    }

    if (debugMode) {
      console.log("Adding leg with validated values:", {
        symbol: legForm.symbol,
        strike,
        expiry: legForm.expiry,
        optionType: legForm.optionType,
        orderType: legForm.orderType,
        quantity,
        noBidAskAverage,
        pricingMethod: legForm.pricingMethod,
        depthIndex,
      });
    }

    const newLeg = {
      id: `leg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      symbol: legForm.symbol,
      strike: strike,
      expiry: legForm.expiry,
      optionType: legForm.optionType,
      orderType: legForm.orderType,
      quantity: quantity,
      noBidAskAverage: noBidAskAverage,
      pricingMethod: legForm.pricingMethod,
      depthIndex: depthIndex,
    };

    setCurrentStrategy((prev) => ({
      ...prev,
      legs: [...prev.legs, newLeg],
    }));

    // Reset leg form
    setLegForm({
      symbol: "NIFTY",
      strike: "",
      expiry: "0",
      optionType: "CE",
      orderType: "buy",
      quantity: 1,
      noBidAskAverage: 1,
      pricingMethod: "average",
      depthIndex: 3,
    });
  };

  // Remove leg from current strategy
  const removeLegFromStrategy = (legId) => {
    setCurrentStrategy((prev) => ({
      ...prev,
      legs: prev.legs.filter((leg) => leg.id !== legId),
    }));
  };

  // Save strategy
  const saveStrategy = async () => {
    if (!strategyName.trim()) {
      alert("Please enter a strategy name");
      return;
    }

    if (currentStrategy.legs.length === 0) {
      alert("Please add at least one leg to the strategy");
      return;
    }

    const strategyToSave = {
      id: editingStrategy ? editingStrategy.id : Date.now(),
      name: strategyName,
      legs: currentStrategy.legs,
      totalSpread: null,
      biddingLegId: currentStrategy.biddingLegId,
    };

    console.log("Saving strategy with bidding leg:", {
      strategyName: strategyName,
      biddingLegId: currentStrategy.biddingLegId,
      totalLegs: currentStrategy.legs.length,
      selectedBiddingLeg: currentStrategy.legs.find(
        (leg) => leg.id === currentStrategy.biddingLegId
      ),
    });

    try {
      // Save to backend
      const method = editingStrategy ? "PUT" : "POST";
      const url = editingStrategy
        ? config.buildUrl(
            `${config.ENDPOINTS.MULTILEG_SPREADS}/${editingStrategy.id}`
          )
        : config.buildUrl(config.ENDPOINTS.MULTILEG_SPREADS);

      console.log(`Making ${method} request to:`, url);
      console.log("Strategy data:", strategyToSave);

      const res = await fetch(
        url,
        config.getFetchOptions(method, strategyToSave)
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Failed to save strategy: ${res.status} - ${errorText}`
        );
      }

      const savedStrategy = await res.json();
      console.log("Strategy saved successfully:", savedStrategy);

      // Update local state with saved strategy
      if (editingStrategy) {
        setStrategies((prev) =>
          prev.map((s) =>
            s.id === editingStrategy.id
              ? {
                  ...savedStrategy,
                  biddingLegId: currentStrategy.biddingLegId, // Ensure bidding leg ID is preserved
                }
              : s
          )
        );
      } else {
        setStrategies((prev) => [
          ...prev,
          {
            ...savedStrategy,
            biddingLegId: currentStrategy.biddingLegId, // Ensure bidding leg ID is preserved
          },
        ]);
      }

      // Send to Advanced Options if toggle is on
      if (sendToAdvanced) {
        await sendStrategyToAdvanced(savedStrategy, false); // false = auto-send, respect toggle
      }

      // Reset form
      resetForm();
      alert("Strategy saved successfully!");
    } catch (err) {
      console.error("Error saving strategy:", err);
      alert(`Failed to save strategy: ${err.message}`);
    }
  };

  // Reset form
  const resetForm = () => {
    setCurrentStrategy({
      id: null,
      name: "",
      legs: [],
      totalSpread: null,
      biddingLegId: null,
    });
    setStrategyName("");
    setEditingStrategy(null);
  };

  // Load strategy for editing
  const loadStrategyForEdit = (strategy) => {
    console.log("Loading strategy for edit:", {
      strategyName: strategy.name,
      biddingLegId: strategy.biddingLegId,
      legs: strategy.legs.map((leg) => ({
        id: leg.id,
        symbol: leg.symbol,
        strike: leg.strike,
      })),
    });

    setEditingStrategy(strategy);
    setCurrentStrategy({
      ...strategy,
      biddingLegId: strategy.biddingLegId || null,
    });
    setStrategyName(strategy.name);

    console.log(
      "Strategy loaded for editing, bidding leg ID:",
      strategy.biddingLegId
    );
  };

  // Delete strategy
  const deleteStrategy = async (strategyId) => {
    if (!confirm("Are you sure you want to delete this strategy?")) return;

    try {
      console.log(`Deleting strategy with ID: ${strategyId}`);

      const res = await fetch(
        config.buildUrl(`${config.ENDPOINTS.MULTILEG_SPREADS}/${strategyId}`),
        config.getFetchOptions("DELETE")
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Failed to delete strategy: ${res.status} - ${errorText}`
        );
      }

      // Update local state
      setStrategies((prev) => prev.filter((s) => s.id !== strategyId));
      console.log("Strategy deleted successfully");
      alert("Strategy deleted successfully!");
    } catch (err) {
      console.error("Error deleting strategy:", err);
      alert(`Failed to delete strategy: ${err.message}`);
    }
  };

  // Load strategies on mount
  useEffect(() => {
    const loadStrategies = async () => {
      try {
        console.log("Loading strategies from backend...");

        const res = await fetch(
          config.buildUrl(config.ENDPOINTS.MULTILEG_SPREADS),
          config.getFetchOptions("GET")
        );

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Failed to load strategies: ${res.status} - ${errorText}`
          );
        }

        const data = await res.json();
        console.log("Strategies loaded:", data);

        if (Array.isArray(data)) {
          setStrategies(data);
        } else if (data.strategies && Array.isArray(data.strategies)) {
          setStrategies(data.strategies);
        } else {
          console.warn("Unexpected data format:", data);
          setStrategies([]);
        }
      } catch (err) {
        console.error("Error loading strategies:", err);
        // Don't show alert for initial load failure - user might not have backend running
        console.log(
          "Failed to load strategies from backend, starting with empty list"
        );
        setStrategies([]);
      }
    };
    loadStrategies();
  }, []);

  // Load lot sizes from API (same as in Strategies.jsx)
  useEffect(() => {
    fetch(config.buildUrl(config.ENDPOINTS.LOTSIZES))
      .then((response) => response.json())
      .then((data) => {
        console.log("Lot sizes loaded:", data);
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

  // Live spread updates
  useEffect(() => {
    let interval;
    let mounted = true;

    const performUpdate = async () => {
      if (mounted) {
        await updateAllSpreads();
      }
    };

    // Initial update
    performUpdate();

    // Set up interval for live updates
    interval = setInterval(performUpdate, 1000); // Update every 100 milliseconds

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
    };
  }, [updateAllSpreads]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-light-lg dark:shadow-dark-xl p-6 border border-light-border dark:border-dark-border">
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl md:text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                Multi-Leg Spread Builder
              </h1>
              <p className="text-gray-600 dark:text-dark-text-secondary mt-1">
                Create complex option strategies with multiple legs across
                different symbols
              </p>
            </div>
          </div>
        </div>

        {/* Index Cards */}
        <IndexCards indices={["NIFTY", "SENSEX"]} className="" />
        {/* <IndexCards indices={["BANKNIFTY", "FINNIFTY"]} className="" /> */}

        {/* Strategy Builder */}
        <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl p-6 border border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text-primary">
              {editingStrategy ? "Edit Strategy" : "Build New Strategy"}
            </h2>
            {editingStrategy && (
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {/* Strategy Name and Advanced Options Toggle */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Strategy Name
              </label>
              <input
                type="text"
                value={strategyName}
                onChange={(e) => setStrategyName(e.target.value)}
                placeholder="Enter strategy name (e.g., Iron Condor, Straddle)"
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-colors duration-200 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Send to Advanced Options
              </label>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendToAdvanced}
                    onChange={(e) => setSendToAdvanced(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
                      sendToAdvanced
                        ? "bg-purple-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        sendToAdvanced ? "transform translate-x-4" : ""
                      }`}
                    ></div>
                  </div>
                  <span className="ml-3 text-sm text-gray-700 dark:text-dark-text-secondary">
                    {sendToAdvanced ? "Yes" : "No"}
                  </span>
                </label>
                <div className="text-xs text-gray-500 dark:text-dark-text-muted">
                  Auto-create strategy in Advanced Options Table
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Debug Mode
              </label>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={debugMode}
                    onChange={(e) => setDebugMode(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
                      debugMode ? "bg-red-600" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        debugMode ? "transform translate-x-4" : ""
                      }`}
                    ></div>
                  </div>
                  <span className="ml-3 text-sm text-gray-700 dark:text-dark-text-secondary">
                    {debugMode ? "On" : "Off"}
                  </span>
                </label>
                <div className="text-xs text-gray-500 dark:text-dark-text-muted">
                  Show detailed calculation logs
                </div>
              </div>
            </div>
          </div>

          {/* Strategy Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Bidding Leg Selection
              </label>
              <select
                value={currentStrategy.biddingLegId || ""}
                onChange={(e) => {
                  const newBiddingLegId = e.target.value || null;
                  console.log("Bidding leg changed:", {
                    from: currentStrategy.biddingLegId,
                    to: newBiddingLegId,
                    availableLegs: currentStrategy.legs.map((leg) => ({
                      id: leg.id,
                      symbol: leg.symbol,
                      strike: leg.strike,
                    })),
                  });

                  setCurrentStrategy((prev) => ({
                    ...prev,
                    biddingLegId: newBiddingLegId,
                  }));
                }}
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-colors duration-200 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
              >
                <option value="">Select Bidding Leg (Optional)</option>
                {currentStrategy.legs.map((leg, index) => (
                  <option key={leg.id} value={leg.id}>
                    Leg {index + 1}: {leg.symbol} {leg.strike} {leg.optionType}{" "}
                    ({leg.orderType}) - Qty: {leg.quantity}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-dark-text-muted mt-1">
                Select which leg will be used as the bidding leg for advanced
                strategies. Current selection:{" "}
                {currentStrategy.biddingLegId
                  ? `Leg ID ${currentStrategy.biddingLegId}`
                  : "None selected"}
              </p>
            </div>
          </div>

          {/* Add Leg Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-10 gap-4 mb-6 p-4 bg-gray-50 dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                Symbol
              </label>
              <select
                name="symbol"
                value={legForm.symbol}
                onChange={handleLegFormChange}
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              >
                {symbolOptions.map((symbol) => (
                  <option key={symbol} value={symbol}>
                    {symbol}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                Strike
              </label>
              <input
                name="strike"
                type="number"
                value={legForm.strike}
                onChange={handleLegFormChange}
                placeholder="Strike price"
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                Expiry
              </label>
              <select
                name="expiry"
                value={legForm.expiry}
                onChange={handleLegFormChange}
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              >
                {expiryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                Type
              </label>
              <select
                name="optionType"
                value={legForm.optionType}
                onChange={handleLegFormChange}
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              >
                <option value="CE">Call (CE)</option>
                <option value="PE">Put (PE)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                Order
              </label>
              <select
                name="orderType"
                value={legForm.orderType}
                onChange={handleLegFormChange}
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              >
                <option value="buy">Buy (+)</option>
                <option value="sell">Sell (-)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                Quantity
                <span className="ml-1 text-xs text-gray-500 dark:text-dark-text-muted">
                  (Lot Size: {getLotSize(legForm.symbol)})
                </span>
              </label>
              <input
                name="quantity"
                type="number"
                min="1"
                value={legForm.quantity}
                onChange={handleLegFormChange}
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              />
              <p className="text-xs text-gray-500 dark:text-dark-text-muted mt-1">
                Total: {legForm.quantity * getLotSize(legForm.symbol)} shares
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                Bid/Ask Avg
              </label>
              <select
                name="noBidAskAverage"
                value={legForm.noBidAskAverage}
                onChange={handleLegFormChange}
                disabled={legForm.pricingMethod === "depth"}
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                Pricing Method
              </label>
              <select
                name="pricingMethod"
                value={legForm.pricingMethod}
                onChange={handleLegFormChange}
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              >
                <option value="average">Average</option>
                <option value="depth">Depth</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                Depth Index
              </label>
              <select
                name="depthIndex"
                value={legForm.depthIndex}
                onChange={handleLegFormChange}
                disabled={legForm.pricingMethod === "average"}
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value={1}>1st (Best)</option>
                <option value={2}>2nd</option>
                <option value={3}>3rd</option>
                <option value={4}>4th</option>
                <option value={5}>5th</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={addLegToStrategy}
                className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-lg p-2 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Add Leg
              </button>
            </div>
          </div>

          {/* Current Strategy Legs */}
          {currentStrategy.legs.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 dark:text-dark-text-primary mb-3">
                Current Strategy Legs ({currentStrategy.legs.length})
              </h3>
              <div className="grid gap-3">
                {currentStrategy.legs.map((leg, index) => (
                  <div
                    key={leg.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white dark:bg-dark-elevated rounded-lg border border-gray-200 dark:border-dark-border"
                  >
                    {editingLeg && editingLeg.id === leg.id ? (
                      // Edit form for leg
                      <div className="w-full">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2 mb-3">
                          <select
                            name="symbol"
                            value={editLegForm.symbol}
                            onChange={handleEditLegFormChange}
                            className="border border-gray-300 dark:border-dark-border rounded p-2 text-sm bg-white dark:bg-dark-surface"
                          >
                            {symbolOptions.map((symbol) => (
                              <option key={symbol} value={symbol}>
                                {symbol}
                              </option>
                            ))}
                          </select>
                          <input
                            name="strike"
                            type="number"
                            value={editLegForm.strike}
                            onChange={handleEditLegFormChange}
                            placeholder="Strike"
                            className="border border-gray-300 dark:border-dark-border rounded p-2 text-sm bg-white dark:bg-dark-surface"
                          />
                          <select
                            name="expiry"
                            value={editLegForm.expiry}
                            onChange={handleEditLegFormChange}
                            className="border border-gray-300 dark:border-dark-border rounded p-2 text-sm bg-white dark:bg-dark-surface"
                          >
                            {expiryOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <select
                            name="optionType"
                            value={editLegForm.optionType}
                            onChange={handleEditLegFormChange}
                            className="border border-gray-300 dark:border-dark-border rounded p-2 text-sm bg-white dark:bg-dark-surface"
                          >
                            <option value="CE">Call</option>
                            <option value="PE">Put</option>
                          </select>
                          <select
                            name="orderType"
                            value={editLegForm.orderType}
                            onChange={handleEditLegFormChange}
                            className="border border-gray-300 dark:border-dark-border rounded p-2 text-sm bg-white dark:bg-dark-surface"
                          >
                            <option value="buy">Buy</option>
                            <option value="sell">Sell</option>
                          </select>
                          <input
                            name="quantity"
                            type="number"
                            min="1"
                            value={editLegForm.quantity}
                            onChange={handleEditLegFormChange}
                            className="border border-gray-300 dark:border-dark-border rounded p-2 text-sm bg-white dark:bg-dark-surface"
                          />
                          <select
                            name="noBidAskAverage"
                            value={editLegForm.noBidAskAverage}
                            onChange={handleEditLegFormChange}
                            disabled={editLegForm.pricingMethod === "depth"}
                            className="border border-gray-300 dark:border-dark-border rounded p-2 text-sm bg-white dark:bg-dark-surface disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value={1}>Avg 1</option>
                            <option value={2}>Avg 2</option>
                            <option value={3}>Avg 3</option>
                            <option value={4}>Avg 4</option>
                            <option value={5}>Avg 5</option>
                          </select>
                          <select
                            name="pricingMethod"
                            value={editLegForm.pricingMethod}
                            onChange={handleEditLegFormChange}
                            className="border border-gray-300 dark:border-dark-border rounded p-2 text-sm bg-white dark:bg-dark-surface"
                          >
                            <option value="average">Avg</option>
                            <option value="depth">Depth</option>
                          </select>
                          <select
                            name="depthIndex"
                            value={editLegForm.depthIndex}
                            onChange={handleEditLegFormChange}
                            disabled={editLegForm.pricingMethod === "average"}
                            className="border border-gray-300 dark:border-dark-border rounded p-2 text-sm bg-white dark:bg-dark-surface disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value={1}>1st</option>
                            <option value={2}>2nd</option>
                            <option value={3}>3rd</option>
                            <option value={4}>4th</option>
                            <option value={5}>5th</option>
                          </select>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={updateLegInStrategy}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditingLeg}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Display leg info
                      <>
                        <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 mb-2 sm:mb-0">
                          <span className="bg-gray-100 dark:bg-dark-surface px-2 py-1 rounded text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                            Leg {index + 1}
                          </span>
                          {currentStrategy.biddingLegId === leg.id && (
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-xs font-medium">
                              Bidding Leg
                            </span>
                          )}
                          <span
                            className={`px-2 py-1 rounded text-sm font-medium ${
                              leg.orderType === "buy"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                            }`}
                          >
                            {leg.orderType === "buy" ? "+" : "-"} {leg.quantity}
                            x
                          </span>
                          <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                            {leg.symbol} {leg.strike} {leg.optionType}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
                            Exp:{" "}
                            {
                              expiryOptions.find((e) => e.value === leg.expiry)
                                ?.label
                            }
                          </span>
                          <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded text-xs font-medium">
                            {leg.pricingMethod === "depth"
                              ? `Depth: ${leg.depthIndex || 3}`
                              : `Avg: ${leg.noBidAskAverage || 1}`}
                          </span>
                          <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-1 rounded text-xs font-medium">
                            {leg.pricingMethod === "depth"
                              ? "Depth Mode"
                              : "Average Mode"}
                          </span>
                          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-xs font-medium">
                            Total: {leg.quantity * getLotSize(leg.symbol)}{" "}
                            shares
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditingLeg(leg)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => removeLegFromStrategy(leg.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={saveStrategy}
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  {editingStrategy ? "Update Strategy" : "Save Strategy"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Saved Strategies */}
        {displayStrategies.length > 0 && (
          <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-dark-elevated dark:to-dark-surface border-b border-gray-200 dark:border-dark-border">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text-primary">
                Saved Strategies ({displayStrategies.length})
              </h3>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-elevated">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Strategy Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Legs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Forward Spread
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Reverse Spread
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-dark-border">
                  {displayStrategies.map((strategy) => (
                    <tr
                      key={strategy.id}
                      className="hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-dark-text-primary mb-1">
                          {strategy.name}
                        </div>
                        <div className="flex items-center gap-2">
                          {strategy.biddingLegId ? (
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {(() => {
                                const biddingLeg = strategy.legs.find(
                                  (leg) =>
                                    String(leg.id) ===
                                    String(strategy.biddingLegId)
                                );
                                return biddingLeg
                                  ? `${biddingLeg.symbol} ${biddingLeg.strike}`
                                  : "Bidding";
                              })()}
                            </span>
                          ) : (
                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded text-xs">
                              No Bidding Leg
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {strategy.legs.map((leg, idx) => {
                            const isBiddingLeg =
                              String(strategy.biddingLegId) === String(leg.id);
                            return (
                              <div
                                key={leg.id}
                                className={`text-sm flex items-center justify-between p-2 rounded-lg transition-colors ${
                                  isBiddingLeg
                                    ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                                    : "text-gray-600 dark:text-dark-text-secondary"
                                }`}
                              >
                                <div className="flex items-center">
                                  <span
                                    className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                      leg.orderType === "buy"
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                    }`}
                                  ></span>
                                  {isBiddingLeg && (
                                    <span className="bg-blue-600 dark:bg-blue-500 text-white text-xs px-2 py-1 rounded-full mr-2 font-medium">
                                      BIDDING
                                    </span>
                                  )}
                                  <span
                                    className={
                                      isBiddingLeg
                                        ? "font-medium text-blue-800 dark:text-blue-300"
                                        : ""
                                    }
                                  >
                                    {leg.orderType === "buy" ? "+" : "-"}
                                    {leg.quantity}x {leg.symbol} {leg.strike}{" "}
                                    {leg.optionType}
                                  </span>
                                </div>
                                {isBiddingLeg && (
                                  <div className="flex items-center space-x-1">
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                                      {leg.pricingMethod === "depth"
                                        ? `Depth: ${leg.depthIndex || 3}`
                                        : `Avg: ${leg.noBidAskAverage || 1}`}
                                    </span>
                                    <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-1 rounded">
                                      {leg.pricingMethod === "depth"
                                        ? "D"
                                        : "A"}
                                    </span>
                                    <svg
                                      className="w-4 h-4 text-blue-600 dark:text-blue-400"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-lg font-mono font-bold ${
                            strategy.totalSpread === null
                              ? "text-gray-400 dark:text-dark-text-muted"
                              : strategy.totalSpread >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {strategy.totalSpread !== null
                            ? `₹${strategy.totalSpread.toFixed(2)}`
                            : "Calculating..."}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-lg font-mono font-bold ${
                            strategy.reverseSpread === null
                              ? "text-gray-400 dark:text-dark-text-muted"
                              : strategy.reverseSpread >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {strategy.reverseSpread !== null
                            ? `₹${strategy.reverseSpread.toFixed(2)}`
                            : "Calculating..."}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-dark-text-muted mt-1">
                          (Inverted Actions)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => loadStrategyForEdit(strategy)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => sendStrategyToAdvanced(strategy, true)} // true = manual send, ignore toggle
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 transition-colors duration-200"
                        >
                          Send
                        </button>
                        <button
                          onClick={() => deleteStrategy(strategy.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 p-4">
              {displayStrategies.map((strategy) => (
                <div
                  key={strategy.id}
                  className="bg-white dark:bg-dark-elevated rounded-lg border border-gray-200 dark:border-dark-border p-4 space-y-3"
                >
                  {/* Strategy Name */}
                  <div className="font-medium text-gray-900 dark:text-dark-text-primary text-lg">
                    {strategy.name}
                  </div>

                  {/* Strategy Info */}
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-dark-text-secondary">
                    <span className="bg-gray-100 dark:bg-dark-surface px-2 py-1 rounded">
                      Bidding Price:{" "}
                      {(() => {
                        const biddingLeg = strategy.biddingLegId
                          ? strategy.legs.find(
                              (leg) =>
                                String(leg.id) === String(strategy.biddingLegId)
                            )
                          : strategy.legs[0];

                        if (biddingLeg?.pricingMethod === "depth") {
                          return `Depth ${biddingLeg?.depthIndex || 3}`;
                        } else {
                          return `Avg ${biddingLeg?.noBidAskAverage || 1}`;
                        }
                      })()}
                    </span>
                    {strategy.biddingLegId ? (
                      <span className="bg-blue-600 dark:bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {(() => {
                          const biddingLeg = strategy.legs.find(
                            (leg) =>
                              String(leg.id) === String(strategy.biddingLegId)
                          );
                          return biddingLeg
                            ? `${biddingLeg.symbol} ${biddingLeg.strike} ${biddingLeg.optionType}`
                            : "Bidding Leg Set";
                        })()}
                      </span>
                    ) : (
                      <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded text-xs">
                        No Bidding Leg Selected
                      </span>
                    )}
                  </div>

                  {/* Legs */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                      Legs:
                    </div>
                    <div className="space-y-2">
                      {strategy.legs.map((leg, idx) => {
                        const isBiddingLeg =
                          String(strategy.biddingLegId) === String(leg.id);
                        return (
                          <div
                            key={leg.id}
                            className={`text-sm flex items-center justify-between p-3 rounded-lg transition-colors ${
                              isBiddingLeg
                                ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                                : "text-gray-600 dark:text-dark-text-secondary bg-gray-50 dark:bg-dark-surface"
                            }`}
                          >
                            <div className="flex items-center flex-wrap gap-2">
                              <span
                                className={`inline-block w-2 h-2 rounded-full ${
                                  leg.orderType === "buy"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              ></span>
                              {isBiddingLeg && (
                                <span className="bg-blue-600 dark:bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                  BIDDING LEG
                                </span>
                              )}
                              <span
                                className={
                                  isBiddingLeg
                                    ? "font-medium text-blue-800 dark:text-blue-300"
                                    : ""
                                }
                              >
                                {leg.orderType === "buy" ? "+" : "-"}
                                {leg.quantity}x {leg.symbol} {leg.strike}{" "}
                                {leg.optionType}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  isBiddingLeg
                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                    : "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                                }`}
                              >
                                {leg.pricingMethod === "depth"
                                  ? `Depth: ${leg.depthIndex || 3}`
                                  : `Avg: ${leg.noBidAskAverage || 1}`}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  isBiddingLeg
                                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300"
                                    : "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300"
                                }`}
                              >
                                {leg.pricingMethod === "depth" ? "D" : "A"}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  isBiddingLeg
                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                }`}
                              >
                                {leg.quantity * getLotSize(leg.symbol)} shares
                              </span>
                              {isBiddingLeg && (
                                <svg
                                  className="w-4 h-4 text-blue-600 dark:text-blue-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Spreads */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                        Forward Spread:
                      </div>
                      <div
                        className={`text-lg font-mono font-bold ${
                          strategy.totalSpread === null
                            ? "text-gray-400 dark:text-dark-text-muted"
                            : strategy.totalSpread >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {strategy.totalSpread !== null
                          ? `₹${strategy.totalSpread.toFixed(2)}`
                          : "Calculating..."}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                        Reverse Spread:
                      </div>
                      <div
                        className={`text-lg font-mono font-bold ${
                          strategy.reverseSpread === null
                            ? "text-gray-400 dark:text-dark-text-muted"
                            : strategy.reverseSpread >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {strategy.reverseSpread !== null
                          ? `₹${strategy.reverseSpread.toFixed(2)}`
                          : "Calculating..."}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-dark-text-muted">
                        (Inverted Actions)
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-2 border-t border-gray-200 dark:border-dark-border">
                    <button
                      onClick={() => loadStrategyForEdit(strategy)}
                      className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => sendStrategyToAdvanced(strategy, true)} // true = manual send, ignore toggle
                      className="flex-1 text-center bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm transition-colors duration-200"
                    >
                      Send to Advanced
                    </button>
                    <button
                      onClick={() => deleteStrategy(strategy.id)}
                      className="flex-1 text-center bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiLegSpread;
