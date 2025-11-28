import axios from "axios";
import { ReactTable } from "../pages/table";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";

// import requestAnimationFrame from "requestanimationframe";
export const NetPositionsTable = () => {
  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        "http://100.64.231.34:8000/netPositions"
      );
      const { pos, ...rest } = response.data;
      currentDataRef.current = pos;
      netpnlDataRef.current = [rest];
      requestAnimationFrame(() => {
        if (currentDataRef.current && currentDataRef.current.length > 0) {
          setPositions([...currentDataRef.current]);
          setNetPnlData([...netpnlDataRef.current]);
        } else {
          setPositions([
            { orderId: 1, symbol: "AAPL", quantity: 10, price: 150 },
          ]);
          setNetPnlData([
            { orderId: 1, symbol: "AAPL", quantity: 10, price: 150 },
          ]);
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Axios-specific error
        console.error("Axios error:", error.response?.data || error.message);
      } else {
        // Generic error
        console.error("Unexpected error:", error);
      }
    }
  };

  // Example 1: Simple flat data
  const [positions, setPositions] = useState([
    { orderId: 1, symbol: "AAPL", quantity: 10, price: 150 },
  ]);

  const [netPnlData, setNetPnlData] = useState([
    { orderId: 1, symbol: "AAPL", quantity: 10, price: 150 },
  ]);
  const netpnlDataRef = useRef(netPnlData);

  const currentDataRef = useRef(positions);
  useEffect(() => {
    const timer = setInterval(async () => {
      await fetchOrders();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <ReactTable
        data={positions}
        editable={true}
        title="Net Positions"
        description="Real-time net positions data"
        showHeader={true}
        showFooter={true}
        rounded={true}
        fullHeight={false}
        columnOrder={[
          "trsTyp",
          "sts",
          "opTyp",
          "stkPrc",
          "dpExpDt",
          "urlzPL",
          "rlzPL",
          "ntPL",
          "ntQty",
          "mtm",
        ]}
        columnLabels={{
          trsTyp: "Trans",
          sts: "Status",
          opTyp: "OptionType",
          urlzPL: "Unrealized P&L",
          rlzPL: "Realized P&L",
          ntPL: "Net P&L",
          ntQty: "Net Quantity",
          mtm: "MTM",
          stkPrc: "Strike Price",
          dpExpDt: "Expiry Date",
        }}
        cellStyler={(value, columnId, rowData) => {
          if (columnId === "trsTyp") {
            const transitionType = value;
            if (transitionType === "S") {
              return {
                // bgColor: "bg-red-100 dark:bg-red-900/30",
                textColor: "text-red-500 dark:text-red-300 font-semibold",
              };
            }
            if (transitionType === "B") {
              return {
                // bgColor: "bg-green-100 dark:bg-green-900/30",
                textColor: "text-green-500 dark:text-green-300",
              };
            }
          }

          if (
            columnId === "rlzPL" ||
            columnId === "urlzPL" ||
            columnId === "ntPL" ||
            columnId === "ntQty" ||
            columnId === "mtm"
          ) {
            const pnl = parseFloat(value);
            if (pnl < 0) {
              return {
                // bgColor: "bg-red-100 dark:bg-red-900/30",
                textColor: "text-red-500 dark:text-red-300 font-semibold",
              };
            }
            if (pnl > 0) {
              return {
                // bgColor: "bg-green-100 dark:bg-green-900/30",
                textColor: "text-green-500 dark:text-green-300",
              };
            }
          }

          if (columnId === "opTyp") {
            const optionType = value;
            if (optionType === "CE") {
              return {
                // bgColor: "bg-green-100 dark:bg-green-900/30",
                textColor: "text-green-500 dark:text-green-300 font-semibold",
              };
            }
            if (optionType === "PE") {
              return {
                // bgColor: "bg-red-100 dark:bg-red-900/30",
                textColor: "text-red-500 dark:text-red-300 font-semibold",
              };
            }
          }

          if (columnId === "chg" || columnId === "chgP") {
            const numericValue = parseFloat(value);
            if (numericValue > 0) {
              return {
                textColor: "text-green-500 dark:text-green-400 font-semibold",
              };
            }
            if (numericValue < 0) {
              return {
                textColor: "text-red-500 dark:text-red-400 font-semibold",
              };
            }
            if (numericValue === 0) {
              return {
                textColor: "text-gray-500 dark:text-gray-400 font-semibold",
              };
            }
          }
          return null; // No styling for other cases
        }}
      />
      <br></br>
      <ReactTable
        data={netPnlData}
        description="Real-time net positions data"
        showHeader={false}
        showFooter={false}
        rounded={true}
        fullHeight={false}
        columnLabels={{
          ntMTM: "Net MTM",
          npos: "Net Positions",
          opn: "Open Positions",
          tdyMtm: "Todays MTM",
          urlMtm: "UnRealized MTM",
          cls: "Closed",
        }}
        hideColumns={["type"]}
        cellStyler={(value, columnId, rowData) => {
          if (
            columnId === "ntMTM" ||
            columnId === "tdyMtm" ||
            columnId === "urlMtm"
          ) {
            const net_mtm = parseFloat(value);
            if (net_mtm < 0) {
              return {
                // bgColor: "bg-red-100 dark:bg-red-900/30",
                textColor: "text-red-500 dark:text-red-300 font-semibold",
              };
            }
            if (net_mtm > 0) {
              return {
                // bgColor: "bg-green-100 dark:bg-green-900/30",
                textColor: "text-green-500 dark:text-green-300",
              };
            }
          }

          if (
            columnId === "rlzPL" ||
            columnId === "urlzPL" ||
            columnId === "ntPL"
          ) {
            const pnl = parseFloat(value);
            if (pnl < 0) {
              return {
                bgColor: "bg-red-100 dark:bg-red-900/30",
                textColor: "text-red-500 dark:text-red-300 font-semibold",
              };
            }
            if (pnl > 0) {
              return {
                bgColor: "bg-green-100 dark:bg-green-900/30",
                textColor: "text-green-500 dark:text-green-300",
              };
            }
          }

          if (columnId === "opTyp") {
            const optionType = value;
            if (optionType === "CE") {
              return {
                bgColor: "bg-green-100 dark:bg-green-900/30",
                textColor: "text-green-500 dark:text-green-300 font-semibold",
              };
            }
            if (optionType === "PE") {
              return {
                bgColor: "bg-red-100 dark:bg-red-900/30",
                textColor: "text-red-500 dark:text-red-300 font-semibold",
              };
            }
          }

          if (columnId === "chg" || columnId === "chgP") {
            const numericValue = parseFloat(value);
            if (numericValue > 0) {
              return {
                textColor: "text-green-500 dark:text-green-400 font-semibold",
              };
            }
            if (numericValue < 0) {
              return {
                textColor: "text-red-500 dark:text-red-400 font-semibold",
              };
            }
            if (numericValue === 0) {
              return {
                textColor: "text-gray-500 dark:text-gray-400 font-semibold",
              };
            }
          }
          return null; // No styling for other cases
        }}
      />
    </div>
  );
};
