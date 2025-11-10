import * as XLSX from "xlsx";
import { Strategy } from "../../types/deployedStrategies.types";

/**
 * Sanitize action config by converting string values to proper types
 */
export const sanitizeActionConfig = (config: any) => {
  if (!config) return config;

  const sanitized = { ...config };

  // Convert actionCount to integer
  if (sanitized.actionCount !== undefined && sanitized.actionCount !== null) {
    sanitized.actionCount =
      typeof sanitized.actionCount === "string"
        ? parseInt(sanitized.actionCount, 10)
        : sanitized.actionCount;
  }

  // Convert slOrderAdjust values to float
  if (sanitized.slOrderAdjust) {
    if (
      sanitized.slOrderAdjust.minPoints !== undefined &&
      sanitized.slOrderAdjust.minPoints !== null
    ) {
      sanitized.slOrderAdjust.minPoints =
        typeof sanitized.slOrderAdjust.minPoints === "string"
          ? parseFloat(sanitized.slOrderAdjust.minPoints)
          : sanitized.slOrderAdjust.minPoints;
    }
    if (
      sanitized.slOrderAdjust.maxPercentage !== undefined &&
      sanitized.slOrderAdjust.maxPercentage !== null
    ) {
      sanitized.slOrderAdjust.maxPercentage =
        typeof sanitized.slOrderAdjust.maxPercentage === "string"
          ? parseFloat(sanitized.slOrderAdjust.maxPercentage)
          : sanitized.slOrderAdjust.maxPercentage;
    }
  }

  return sanitized;
};

/**
 * Export strategy to Excel
 */
export const exportToExcel = (strategy: Strategy) => {
  try {
    const config = strategy.config as any;
    const baseConfig = config?.baseConfig || {};
    const legs = config?.legs || [];

    // Create base config sheet data
    const baseConfigData = [
      ["Strategy Configuration"],
      ["Strategy ID", baseConfig.strategyId || "N/A"],
      ["Strategy Name", baseConfig.strategyName || "N/A"],
      ["User ID", baseConfig.userId || "N/A"],
      ["Strategy Type", baseConfig.strategyType || "N/A"],
      ["Symbol", baseConfig.symbol || "N/A"],
      ["Entry Time", baseConfig.entryTime || "N/A"],
      ["Square Off Time", baseConfig.squareOffTime || "N/A"],
      ["Execution Mode", baseConfig.executionMode || "N/A"],
      ["Quantity Multiplier", baseConfig.quantityMultiplier || "N/A"],
    ];

    // Create legs sheet data
    const legsData = [
      [
        "Leg ID",
        "Symbol",
        "Option Type",
        "Strike Distance",
        "Expiry",
        "Action",
        "Quantity",
        "Order Type",
        "Limit Price",
        "Is Hedge",
      ],
      ...legs.map((leg: any) => [
        leg.legId || "",
        leg.symbol || "",
        leg.optionType || "",
        leg.strikeDistance || "",
        leg.expiry || "",
        leg.action || "",
        leg.quantity || "",
        leg.orderType || "",
        leg.limitPrice || "",
        leg.isHedge ? "Yes" : "No",
      ]),
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    const wsBase = XLSX.utils.aoa_to_sheet(baseConfigData);
    const wsLegs = XLSX.utils.aoa_to_sheet(legsData);

    XLSX.utils.book_append_sheet(wb, wsBase, "Configuration");
    XLSX.utils.book_append_sheet(wb, wsLegs, "Legs");

    // Save file
    const fileName = `${strategy.strategyId}_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(wb, fileName);
  } catch (err) {
    console.error("Error exporting to Excel:", err);
    alert("Failed to export strategy to Excel");
  }
};

/**
 * Toggle strategy expansion
 */
export const toggleStrategy = (
  strategyId: string,
  expandedStrategy: string | null,
  setExpandedStrategy: (
    updater: (prev: string | null) => string | null
  ) => void,
  fetchOrders: (strategyId: string) => void,
  startAutoRefresh: (strategyId: string) => void,
  stopAutoRefresh: (strategyId: string) => void
) => {
  const willBeExpanded = expandedStrategy !== strategyId;
  setExpandedStrategy((prev: string | null) =>
    prev === strategyId ? null : strategyId
  );

  // If expanding, fetch orders and start auto-refresh
  if (willBeExpanded) {
    fetchOrders(strategyId);
    startAutoRefresh(strategyId);
  } else {
    // If collapsing, stop auto-refresh
    stopAutoRefresh(strategyId);
  }
};
