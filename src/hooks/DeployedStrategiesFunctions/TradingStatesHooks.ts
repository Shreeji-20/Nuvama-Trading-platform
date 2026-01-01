type TradingState = {
  [key: string]: "running" | "paused" | "stopped";
};

const startTradingState = (key: string, tradingState: TradingState) => {
  return tradingState[key] === "stopped" || tradingState[key] === undefined;
};
const pauseTradingState = (key: string, tradingState: TradingState) => {
  return tradingState[key] === "running" || tradingState[key] === undefined;
};
const resumeTradingState = (key: string, tradingState: TradingState) => {
  return tradingState[key] === "paused" || tradingState[key] === undefined;
};
const stopTradingState = (key: string, tradingState: TradingState) => {
  return tradingState[key] === "running" || tradingState[key] === "paused";
};

const SampleData = [
  {
    execution_params: {
      product: "NRML",
      strategy_tag: "tag_8e65a34d1c45",
      legs_execution: "Parallel",
      portfolio_execution_mode: "startTime",
      entry_order_type: "LIMIT",
      run_on_days: ["Thursday"],
      start_time: "",
      end_time: "",
      squareoff_time: "",
    },
    timestamp: "2025-11-27T13:06:07.525272",
    target_settings: {
      target_type: "CombinedProfit",
      target_value: 0.0,
    },
    legs: {
      LEG_001: {
        marked_as_complete: false,
        id: 1764223999953,
        leg_id: "LEG_001",
        strategy_id: "STRATEGY_996751",
        strategy_name: "NIFTY_NEW",
        symbol: "NIFTY",
        expiry: 0,
        price_type: "BIDASK",
        depth_index: 1,
        order_type: "LIMIT",
        action: "SELL",
        option_type: "CE",
        lots: 1,
        strike: "ATM",
        target_type: "POINTS",
        target_value: 1.0,
        stoploss_type: "POINTS",
        stoploss_value: 1.0,
        start_time: "",
        wait_and_trade: 0.0,
        wait_and_trade_logic: "NONE",
        dynamic_hedge: true,

        on_target_action_config: {
          action_type: "NONE",
          action_count: 1,
          order_at_broker: false,
          sl_order_adjust: {
            min_points: 0.0,
            max_percentage: 0.0,
          },
        },
        on_stoploss_action_config: {
          action_type: "NONE",
          action_count: 1,
          order_at_broker: false,
          sl_order_adjust: {
            min_points: 0.0,
            max_percentage: 0.0,
          },
        },
        on_square_off_action_config: {
          action_type: "NONE",
          action_count: 1,
          order_at_broker: false,
          sl_order_adjust: {
            min_points: 0.0,
            max_percentage: 0.0,
          },
        },
        premiumBasedStrike: true,
        premiumBasedStrikeConfig: {
          strikeType: "NearestPremium",
          maxDepth: 25,
          searchSide: "OTM",
          value: 20.0,
          condition: "Greaterthanequal",
          between: 0.0,
          and_value: 0.0,
        },
        hedgeSelectedStrike: null,
        selectedStrike: null,
        reEnterCount: 0,
        reEnterLogic: "NONE",
        initialLegPrice: 0,
        configButtons: [],
      },
      LEG_002: {
        markedAsComplete: false,
        id: 1764224033614,
        legId: "LEG_002",
        strategyId: "STRATEGY_996751",
        strategyName: "NIFTY_NEW",
        symbol: "NIFTY",
        expiry: 0,
        priceType: "BIDASK",
        depthIndex: 1,
        orderType: "LIMIT",
        action: "SELL",
        optionType: "CE",
        lots: 1,
        strike: "ATM",
        targetType: "POINTS",
        targetValue: 1.0,
        stoplossType: "POINTS",
        stoplossValue: 1.0,
        startTime: "",
        waitAndTrade: 2.0,
        waitAndTradeLogic: "POINTS",
        dynamicHedge: true,

        onTargetActionConfig: {
          actionType: "NONE",
          actionCount: 1,
          orderAtBroker: false,
          slOrderAdjust: {
            minPoints: 0.0,
            maxPercentage: 0.0,
          },
        },
        onStoplossActionConfig: {
          actionType: "NONE",
          actionCount: 1,
          orderAtBroker: false,
          slOrderAdjust: {
            minPoints: 0.0,
            maxPercentage: 0.0,
          },
        },
        onSquareOffActionConfig: {
          actionType: "NONE",
          actionCount: 1,
          orderAtBroker: false,
          slOrderAdjust: {
            minPoints: 0.0,
            maxPercentage: 0.0,
          },
        },
        premiumBasedStrike: true,
        premiumBasedStrikeConfig: {
          strikeType: "NearestPremium",
          maxDepth: 25,
          searchSide: "OTM",
          value: 20.0,
          condition: "Greaterthanequal",
          between: 0.0,
          and_value: 0.0,
        },
        hedgeSelectedStrike: null,
        selectedStrike: null,
        reEnterCount: 0,
        reEnterLogic: "NONE",
        initialLegPrice: 0,
        configButtons: [],
      },
    },
    exitSettings: {
      exitOrderType: "LIMIT",
      exitSellFirst: false,
      holdBuyTime: 0.0,
      waitBtwnRetry: 0.0,
      maxWaitTime: 0.0,
    },
    base_config: {
      strategy_id: "STRATEGY_996751",
      strategy_name: "NIFTY_NEW",
      multiplier: 1,
      underlying: "Spot",
      buy_trades_first: false,
      is_selected_for_trading: true,
      execution_mode: "Live Mode",
      trading_state: "PAUSED",
    },
    at_broker_settings: {
      leg_sl_at_broker: false,
      leg_tp_at_broker: false,
      leg_re_entry_at_broker: false,
      leg_wn_t_at_broker: false,
      sl_order_trigger_adjust: {
        min_points: 0.0,
        max_percentage: 0.0,
      },
    },
    dynamic_hedge_settings: {
      hedge_type: "fixed Distance",
      min_hedge_distance: 0,
      max_hedge_distance: 0,
      min_premium: 0.0,
      max_premium: 0.0,
      strike_steps: {
        NIFTY: 50,
      },
      strike_500: false,
      strike_distance: 1,
    },
    stoploss_settings: {
      stoploss_type: "CombinedProfit",
      stoploss_value: 0.0,
      stoploss_wait: 0.0,
      sqr_off_only_loss_legs: false,
      sqr_off_only_profit_legs: false,
    },
  },
];

export {
  startTradingState,
  pauseTradingState,
  resumeTradingState,
  stopTradingState,
  SampleData,
};
