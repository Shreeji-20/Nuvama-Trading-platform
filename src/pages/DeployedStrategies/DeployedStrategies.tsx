import { ReactTable } from "../table";
import { useState, useEffect } from "react";

import { ToastContainer, useToast } from "../../components/Toast";
import {
  createUser,
  updateUser,
  fetchUsers,
  deleteUser,
  loginUser,
} from "../../hooks/UsersFunctions/usersApiService";

import {
  Bell,
  Download,
  RefreshCw,
  Settings,
  Upload,
  User,
  Play,
  Pause,
  StopCircle,
  icons,
} from "lucide-react";
import { HorizontalTabs } from "../../components/HorizontalTabs";

import Accordion from "../../components/Accordion";
import { SampleData } from "../../hooks/DeployedStrategiesFunctions/TradingStatesHooks";
import { StrategyAccordionContent } from "./StrategyAccordionContent";
import DropdownForm from "../../components/DropdownForm";
import PopperFormExample from "../Examples/PopperFormExample";
import { usePopper } from "../../components/Popper";

const DeployedStrategies = () => {
  const toasts = useToast();
  const [strategies, setStrategies] = useState<any[]>(SampleData);
  
  const [tradingState, setTradingState] = useState<{
    [key: string]: "running" | "paused" | "stopped";
  }>({});

  return (
    <div className="space-y-4">
      {/* <PopperFormExample /> */}
      <ToastContainer
        toasts={toasts.toasts}
        onRemove={toasts.removeToast}
        position="bottom-right"
      />

      <ReactTable
        title="Deployed Strategies"
        padding={false}
        description="List of all deployed trading strategies"
        data={strategies.map((strategy) => ({
          strategyId: strategy.baseConfig.strategyId,
          strategyName: strategy.baseConfig.strategyName,
          tradingState: strategy.baseConfig.tradingState,
          legsCount: Object.keys(strategy.legs).length,
          product: strategy.executionParams.product,
          strategyTag: strategy.executionParams.strategyTag,
          executionMode: strategy.baseConfig.executionMode,
        }))}
        headerGap={true}
        showHeader={true}
        showFilters={true}
        showFooter={false}
        headerStyle="card"
        fullHeight={false}
        headerButtons={[
          {
            label: "Start Trading",
            icon: <Play className="h-4 w-4" />,
            onClick: () => fetchUsers(),
            variant: "success",
          },
          {
            label: "Pause Trading",
            icon: <Play className="h-4 w-4" />,
            onClick: () => fetchUsers(),
            variant: "warning",
          },
          {
            label: "Resume Trading",
            icon: <Play className="h-4 w-4" />,
            onClick: () => fetchUsers(),
            variant: "primary",
          },
          {
            label: "Stop Trading",
            icon: <StopCircle className="h-4 w-4" />,
            onClick: () => fetchUsers(),
            variant: "danger",
            // disabled: true,
          },
        ]}
      />

      <Accordion
        variant="separated"
        allowMultiple={true}
        padding={false}
        items={strategies.map((strategy) => ({
          id: strategy.baseConfig.strategyId,
          title: (
            <div className="flex items-center justify-between w-full gap-2">
              <span className="font-semibold">
                {strategy.baseConfig.strategyName}
              </span>
              <div className="flex gap-3 text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  {Object.keys(strategy.legs).length} Legs •{" "}
                  {strategy.executionParams.product}
                </span>
                <span
                  className={`font-medium ${
                    strategy.baseConfig.tradingState === "START"
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {strategy.baseConfig.tradingState}
                </span>
              </div>
            </div>
          ),
          icon: <Settings className="w-4 h-4" />,
          content: (
            <StrategyAccordionContent
              strategy={strategy}
              setStrategies={setStrategies}
            />
          ),
        }))}
      />
    </div>
  );
};

export default DeployedStrategies;
