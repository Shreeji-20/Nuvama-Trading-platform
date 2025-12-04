import axios, { AxiosError } from "axios";
import { ReactTable } from "../pages/table";
import { useState, useRef, useEffect } from "react";

// Type definitions
interface Position {
  orderId?: number;
  symbol?: string;
  quantity?: number;
  price?: number;
  trsTyp?: string;
  sts?: string;
  opTyp?: string;
  stkPrc?: number;
  dpExpDt?: string;
  urlzPL?: number;
  rlzPL?: number;
  ntPL?: number;
  ntQty?: number;
  mtm?: number;
  chg?: number;
  chgP?: number;
  [key: string]: any; // Allow additional dynamic properties
}

interface NetPnlData {
  orderId?: number;
  symbol?: string;
  quantity?: number;
  price?: number;
  ntMTM?: number;
  npos?: number;
  opn?: number;
  tdyMtm?: number;
  urlMtm?: number;
  cls?: number;
  type?: string;
  rlzPL?: number;
  urlzPL?: number;
  ntPL?: number;
  opTyp?: string;
  chg?: number;
  chgP?: number;
  [key: string]: any; // Allow additional dynamic properties
}

interface ApiResponse {
  pos: Position[];
  [key: string]: any; // For other fields that will become NetPnlData
}

export const NetPositionsTable = () => {
  const fetchOrders = async (): Promise<void> => {
    try {
      const response = await axios.get<ApiResponse>(
        "http://100.64.231.34:8000/books/netPositions/70204607"
      );
      const { pos, ...rest } = response.data.netPositions;
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
  const [positions, setPositions] = useState<Position[]>([
    { orderId: 1, symbol: "AAPL", quantity: 10, price: 150 },
  ]);

  const [netPnlData, setNetPnlData] = useState<NetPnlData[]>([
    { orderId: 1, symbol: "AAPL", quantity: 10, price: 150 },
  ]);
  const netpnlDataRef = useRef<NetPnlData[]>(netPnlData);

  const currentDataRef = useRef<Position[]>(positions);
  useEffect(() => {
    const timer = setInterval(async () => {
      await fetchOrders();
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <ReactTable
        data={positions}
        editable={true}
        editableColumns={["trsTyp", "opTyp"]}
        cellInputType={{
          trsTyp: "text",
          opTyp: "select",
        }}
        dropdownOptions={{
          opTyp: ["CE", "PE", "FUT"],
        }}
        onCellEdit={(rowIndex, columnId, newValue, rowData) => {
          console.log("Cell edited:", {
            rowIndex,
            columnId,
            newValue,
            rowData,
          });
          // Here you can add logic to handle the edited cell value,
          // such as updating the backend or state.
        }}
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
      <br />
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
