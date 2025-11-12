import * as XLSX from "xlsx";
import { Strategy } from "../../types/deployedStrategies.types";

/**
 * Export Utilities
 * Functions for exporting strategies to Excel format
 */

/**
 * Export a strategy to Excel file
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

    // Convert legs to array if it's an object (dict format)
    const legsArray = Array.isArray(legs) ? legs : Object.values(legs);

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
      ...legsArray.map((leg: any) => [
        leg.legId || "",
        leg.symbol || "",
        leg.optionType || "",
        leg.strikeDistance || "",
        leg.expiry || "",
        leg.action || "",
        leg.quantity || leg.lots || "",
        leg.orderType || "",
        leg.limitPrice || "",
        leg.isHedge || leg.dynamicHedge ? "Yes" : "No",
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
 * Export multiple strategies to a single Excel file
 */
export const exportMultipleStrategiesToExcel = (strategies: Strategy[]) => {
  try {
    const wb = XLSX.utils.book_new();

    strategies.forEach((strategy, index) => {
      const config = strategy.config as any;
      const baseConfig = config?.baseConfig || {};
      const legs = config?.legs || [];

      // Create strategy data
      const strategyData = [
        ["Strategy Configuration"],
        ["Strategy ID", baseConfig.strategyId || "N/A"],
        ["Strategy Name", baseConfig.strategyName || "N/A"],
        ["User ID", baseConfig.userId || "N/A"],
        ["Symbol", baseConfig.symbol || "N/A"],
        [],
        ["Legs"],
        ["Leg ID", "Symbol", "Option Type", "Strike", "Action", "Quantity"],
      ];

      // Convert legs to array if it's an object
      const legsArray = Array.isArray(legs) ? legs : Object.values(legs);

      legsArray.forEach((leg: any) => {
        strategyData.push([
          leg.legId || "",
          leg.symbol || "",
          leg.optionType || "",
          leg.strike || "",
          leg.action || "",
          leg.quantity || leg.lots || "",
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(strategyData);
      const sheetName = `Strategy_${index + 1}`.substring(0, 31); // Excel sheet name limit
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    // Save file
    const fileName = `strategies_export_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(wb, fileName);
  } catch (err) {
    console.error("Error exporting strategies to Excel:", err);
    alert("Failed to export strategies to Excel");
  }
};
