// SocketContext.tsx
import React, { createContext, useContext, useEffect } from "react";
import { socketManager } from "./socketManager";

const SocketContext = createContext(socketManager);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    socketManager.connect();
    return () => socketManager.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={socketManager}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
