// Type definitions for Deployed Strategies component
// Based on strategy_orders.py API structure

import { StrategyConfiguration, StrategyTag } from "./strategy.types";

// Alias for DeployedStrategy as Strategy for convenience
export type Strategy = DeployedStrategy;

// Order status constants type
export interface OrderStatusConstants {
  COMPLETE: string[];
  REJECTED: string[];
  CANCELLED: string[];
  PENDING: string[];
}

// Response data structure from broker API (nested in Order.response.data)
export interface OrderResponseData {
  // Broker order IDs
  oID?: string; // Broker order ID (LIVEMODE)
  oid?: string; // Alternative broker order ID format
  orderId?: string;

  // Price and quantity
  fPrc?: string; // Fill price (entry/exit price)
  fQty?: string; // Fill quantity
  ltp?: string; // Last traded price

  // Order status
  sts?: string; // Order status (COMPLETE, REJECTED, PENDING, etc.)

  // Additional fields
  prc?: string; // Limit price
  qty?: string; // Order quantity
  transactionType?: string; // BUY or SELL
  orderType?: string; // LIMIT, MARKET, etc.
  productType?: string; // NRML, MIS, CNC

  // Timestamps
  orderTime?: string;
  executionTime?: string;

  // Rejection/cancellation
  rejectionReason?: string;
  cancelledReason?: string;
}

// Complete Order structure from Redis (matches Python backend)
export interface Order {
  // Identification
  userId?: string;
  strategyId?: string;
  strategyName?: string;
  legId?: string;
  orderId?: string;
  redisKey?: string; // Added by API when fetching
  orderDetailsKey?: string; // Used for exit order lookup

  // Instrument details
  symbol?: string;
  strike?: string | number;
  optionType?: string; // CE or PE
  expiry?: string | number;

  // Order details
  action?: string; // BUY or SELL
  quantity?: number;
  limitPrice?: number;
  orderType?: string; // LIMIT, MARKET, SL, SL-M
  priceType?: string; // LTP, BIDASK, DEPTH, BID, ASK

  // Execution mode
  executionMode?: string; // LIVEMODE or SIMULATIONMODE

  // Position status flags
  entered?: boolean; // Order was executed (filled)
  exited?: boolean; // Position was closed
  isHedge?: boolean; // This is a hedge order (added by API)

  // Timestamps
  placedTime?: number;
  executionTime?: string;

  // Response from broker/simulation
  response?: {
    stat?: string;
    data?: OrderResponseData;
  };

  // Legacy fields (for backward compatibility)
  fPrc?: string;
  fQty?: string | number;
  orderStatus?: string;
  status?: string;
  exchangeOrderNumber?: string;
  liveDetails?: LiveOrderDetails;
}

// Live order details (for real-time updates)
export interface LiveOrderDetails {
  exchangeOrderNumber?: string;
  orderStatus?: string;
  transactionType?: string;
  totalQuantity?: string;
  fillQuantity?: string;
  price?: string;
  averagePrice?: string;
  fillPrice?: string;
  executionTime?: string;
  orderTime?: string;
  rejectionReason?: string;
}

// P&L data for a position
export interface PositionPnLData {
  pnl: string;
  entryPrice: string;
  exitPrice: string | null;
  currentPrice: string | null;
  quantity: number;
  action: string;
  isExited: boolean;
}

// Market depth bid/ask data
export interface DepthValue {
  price?: number;
  quantity?: number;
  orders?: number;
}

// Market depth response from API (depth endpoint)
export interface MarketDepthResponse {
  message: string;
  redisKey: string;
  data: {
    symbolname?: string;
    strikeprice?: number;
    optiontype?: string;
    expiry?: string;
    ltp?: number;
    bidValues?: DepthValue[];
    askValues?: DepthValue[];
    // Additional market depth fields
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
    oi?: number; // Open Interest
  } | null;
}

// Simplified market depth data for P&L calculation
export interface MarketDepthData {
  bid: number;
  ask: number;
  ltp: number;
}

// Option data from cache (for batch fetching)
export interface OptionData {
  response?: {
    data?: {
      symbolname?: string;
      strikeprice?: number;
      optiontype?: string;
      expiry?: string;
      bidValues?: DepthValue[];
      askValues?: DepthValue[];
      ltp?: number;
    };
  };
}

// API Response types from strategy_orders.py

// Response from /get/{strategy_id}/live-details
export interface StrategyOrdersLiveResponse {
  message: string;
  strategyId: string;
  count: number;
  orders: Order[] | null;
}

// Response from /exit-order/{order_details_key}
export interface ExitOrderResponse {
  message: string;
  redisKey: string;
  data: Order | null;
}

// Response from /entry-price/{strategy_id}/{order_details_key}
export interface EntryPriceResponse {
  message: string;
  strategyOrderKey: string;
  executionMode: string;
  data: {
    entryPrice: string;
    quantity: string;
    source: string; // "live_order" or "strategy_order"
    orderId: string;
  };
}

// Strategy with deployed metadata
export interface DeployedStrategy {
  strategyId: string;
  symbols?: string[];
  timestamp: string;
  config: StrategyConfiguration;
}

// Strategy summary data
export interface StrategySummary {
  openPositions: number;
  openOrders: number;
  completedOrders: number;
  totalPnL: number;
}

// Tab configuration
export interface TabConfig {
  id: string;
  label: string;
}

// Props for StrategyHeader component
export interface StrategyHeaderProps {
  strategiesCount: number;
  onRefresh: () => void;
  loading?: boolean;
}

// Props for StrategyCard component
export interface StrategyCardProps {
  strategy: DeployedStrategy;
  isExpanded: boolean;
  isEditing: boolean;
  onToggleExpand: (strategyId: string) => void;
  onStartEdit: (strategy: DeployedStrategy) => void;
  onDelete: (strategyId: string) => void;
  onSave: (strategyId: string) => void;
  onCancelEdit: () => void;
  ordersSummary: StrategySummary;
  onExportToExcel: (strategyId: string) => void;
  onCopyStrategy: (strategy: DeployedStrategy) => void;
}

// Props for tab components
export interface TabContentProps {
  strategy: DeployedStrategy;
  orders: Order[] | null;
  loadingOrders: boolean;
  positionPnL: Record<string, PositionPnLData>;
  loadingPnL: Record<string, boolean>;
  isRefreshing: boolean;
  onRefresh: () => void;
  onSquareOff?: (order: Order) => void;
}

// Props for PremiumStrikeModal
export interface PremiumStrikeModalProps {
  legIndex: number | null;
  leg: any;
  isOpen: boolean;
  onClose: () => void;
  onConfigChange: (legIndex: number, field: string, value: any) => void;
}

// Props for StrategyConfigurationView
export interface StrategyConfigurationViewProps {
  strategy: DeployedStrategy;
  isEditing: boolean;
  editValues: StrategyConfiguration;
  availableTags: StrategyTag[];
  loadingTags: boolean;
  symbolOptions: string[];
  getEditValue: (strategy: DeployedStrategy, path: string) => any;
  onEditChange: (path: string, value: any) => void;
  onLegChange: (legIndex: number, field: string, value: any) => void;
  onAddLeg: (strategyId: string) => void;
  onDeleteLeg: (legIndex: number) => void;
  onPremiumStrikeModalOpen: (legIndex: number) => void;
}

// Order status helper functions type
export interface OrderStatusHelpers {
  isOrderComplete: (status: string | undefined) => boolean;
  isOrderRejected: (status: string | undefined) => boolean;
  isOrderCancelled: (status: string | undefined) => boolean;
  isOrderPending: (status: string | undefined) => boolean;
  isOrderCompletedOrFinished: (status: string | undefined) => boolean;
}

// State for editing
export interface EditState {
  editingStrategy: string | null;
  editValues: StrategyConfiguration | Record<string, any>;
  premiumStrikeModalLeg: number | null;
  currentEditingStrategyId: string | null;
}

// Auto-refresh state
export interface AutoRefreshState {
  activeTab: Record<string, string>;
  expandedStrategy: string | null;
  refreshIntervals: Record<string, number>;
}
