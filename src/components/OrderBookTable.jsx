import axios from "axios";
import { ReactTable } from "./table";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";
import { createContext } from "react";
// import requestAnimationFrame from "requestanimationframe";
export const OrderBookTable = () => {
  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/books/orderBook/70204607"
      );
      currentDataRef.current = response.data.orderBook;

      requestAnimationFrame(() => {
        if (currentDataRef.current && currentDataRef.current.length > 0) {
          setOrderBook([...currentDataRef.current]);
        } else {
          setOrderBook([
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

  const fetchTrades = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/books/tradebook/70204607"
      );
      currentTradeDataRef.current = response.data.tradeBook;

      requestAnimationFrame(() => {
        if (
          currentTradeDataRef.current &&
          currentTradeDataRef.current.length > 0
        ) {
          setTradeBook([...currentTradeDataRef.current]);
        } else {
          setTradeBook([
            { tradeId: 1, symbol: "AAPL", quantity: 10, price: 150 },
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
  const [orderBook, setOrderBook] = useState([
    { orderId: 1, symbol: "AAPL", quantity: 10, price: 150 },
  ]);

  const currentDataRef = useRef(orderBook);
  const orderBookContext = createContext();

  useEffect(() => {
    const timer = setInterval(async () => {
      await fetchOrders();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const [tradeBook, setTradeBook] = useState([
    { tradeId: 1, symbol: "AAPL", quantity: 10, price: 150 },
  ]);

  const currentTradeDataRef = useRef(tradeBook);

  useEffect(() => {
    const timer = setInterval(async () => {
      await fetchTrades();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <ReactTable
        data={orderBook}
        title="Order Book"
        description="Real-time order book data"
        showHeader={true}
        showFooter={false}
        rounded={true}
        fullHeight={false}
        columnOrder={["trsTyp", "sts", "opTyp"]}
        scrollMode={true}
        maxScrollHeight="40rem"
        cellStyler={(value, columnId, rowData) => {
          // Example 1: Style based on quantity
          if (columnId === "trsTyp") {
            const transitionType = value;
            if (transitionType === "SELL") {
              return {
                bgColor: "bg-red-100 dark:bg-red-900/30",
                textColor: "text-red-500 dark:text-red-300 font-semibold",
              };
            }
            if (transitionType === "BUY") {
              return {
                bgColor: "bg-green-100 dark:bg-green-900/30",
                textColor: "text-green-500 dark:text-green-300",
              };
            }
          }

          if (columnId === "sts") {
            const transitionType = value;
            if (transitionType === "rejected") {
              return {
                bgColor: "bg-red-100 dark:bg-red-900/30",
                textColor: "text-red-500 dark:text-red-300 font-semibold",
              };
            }
            if (transitionType === "complete") {
              return {
                bgColor: "bg-green-100 dark:bg-green-900/30",
                textColor: "text-green-500 dark:text-green-300",
              };
            }
            if (transitionType === "pending") {
              return {
                bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
                textColor: "text-yellow-500 dark:text-yellow-300",
              };
            }
            if (transitionType === "cancelled") {
              return {
                bgColor: "bg-gray-100 dark:bg-gray-900/30",
                textColor: "text-gray-500 dark:text-gray-300",
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

      <ReactTable
        data={tradeBook}
        title="Trade Book"
        description="Real-time trade book data"
        showHeader={true}
        showFooter={false}
        rounded={true}
        fullHeight={true}
        columnOrder={["trsTyp", "sts", "opTyp"]}
        scrollMode={true}
        maxScrollHeight="40rem"
        cellStyler={(value, columnId, rowData) => {
          // Example 1: Style based on quantity
          if (columnId === "trsTyp") {
            const transitionType = value;
            if (transitionType === "SELL") {
              return {
                bgColor: "bg-red-100 dark:bg-red-900/30",
                textColor: "text-red-500 dark:text-red-300 font-semibold",
              };
            }
            if (transitionType === "BUY") {
              return {
                bgColor: "bg-green-100 dark:bg-green-900/30",
                textColor: "text-green-500 dark:text-green-300",
              };
            }
          }

          if (columnId === "sts") {
            const transitionType = value;
            if (transitionType === "rejected") {
              return {
                bgColor: "bg-red-100 dark:bg-red-900/30",
                textColor: "text-red-500 dark:text-red-300 font-semibold",
              };
            }
            if (transitionType === "complete") {
              return {
                bgColor: "bg-green-100 dark:bg-green-900/30",
                textColor: "text-green-500 dark:text-green-300",
              };
            }
            if (transitionType === "pending") {
              return {
                bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
                textColor: "text-yellow-500 dark:text-yellow-300",
              };
            }
            if (transitionType === "cancelled") {
              return {
                bgColor: "bg-gray-100 dark:bg-gray-900/30",
                textColor: "text-gray-500 dark:text-gray-300",
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
    </>
  );
};
