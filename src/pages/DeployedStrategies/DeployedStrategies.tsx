import { ReactTable } from "../../components/table";
import { useState, useEffect } from "react";

import { ToastContainer, useToast } from "../../components/Toast";
import {
  createUser,
  updateUser,
  fetchUsers,
  deleteUser,
  loginUser,
} from "../../hooks/UsersFunctions/usersApiService";
import axios from "axios";
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
  Car,
  StopCircleIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  RotateCcwIcon,
} from "lucide-react";

import Accordion from "../../components/Accordion";
import { SampleData } from "../../hooks/DeployedStrategiesFunctions/TradingStatesHooks";
import { StrategyAccordionContent } from "./StrategyAccordionContent";
import {
  getChangedKeysDeep,
  getChangedKeysDeepWithValues,
} from "../../hooks/commonFunctions";

import Card from "../../components/Card";
const DeployedStrategies = () => {
  const toasts = useToast();
  const [globalTradingState, setGlobalTradingState] = useState<
    "RUNNING" | "PAUSED" | "STOPPED" | "RESUMED"
  >("STOPPED");
  const [strategies, setStrategies] = useState<Record<string, any>>({});
  const [updatedStrategies, setUpdatedStrategies] = useState<
    Record<string, any>
  >({});
  const [tradingState, setTradingState] = useState<{
    [key: string]: "running" | "paused" | "stopped";
  }>({});

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const response = await axios.get("http://localhost:8000/strategy/list");
        console.log("Response:", response.data);
        requestAnimationFrame(() => {
          setStrategies((prev) => ({
            ...(response.data?.strategies || {}),
          }));
          setUpdatedStrategies((prev) => ({
            ...(response.data?.strategies || {}),
          }));
        });
        console.log("Strategies set:", Object.keys(strategies).length);
      } catch (error) {
        console.error("Error fetching strategies:", error);
        toasts.error("Failed to fetch strategies");
      }
    };

    const fetchTradingState = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/trading_state/"
        );
        console.log("Trading State Response:", response.data);
        requestAnimationFrame(() => {
          setGlobalTradingState(
            response.data.global_trading_state.toUpperCase() as
              | "RUNNING"
              | "PAUSED"
              | "STOPPED"
          );
        });
      } catch (error) {
        console.error("Error fetching trading state:", error);
        toasts.error("Failed to fetch trading state");
      }
    };

    fetchTradingState();
    fetchStrategies();
  }, []);

  return (
    <div className="space-y-4">
      <ToastContainer
        toasts={toasts.toasts}
        onRemove={toasts.removeToast}
        position="bottom-right"
      />

      <Card
        title="Deployed Strategies"
        subtitle="View and manage all deployed strategy configurations"
        // padding="p-4"
        // className=""
        actions={
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-1 text-sm btn-outline-green rounded-xl"
              disabled={
                globalTradingState === "RUNNING" ||
                globalTradingState === "PAUSED"
              }
              onClick={async () => {
                const response = await axios.put(
                  "http://localhost:8000/trading_state/",
                  { action: "START" }
                );
                requestAnimationFrame(() => {
                  setGlobalTradingState("RUNNING");
                });
              }}
            >
              START_TRADING
            </button>
            <button
              className="px-4 py-1 rounded-xl text-sm btn-outline-amber"
              disabled={
                globalTradingState === "STOPPED" ||
                globalTradingState === "PAUSED"
              }
              onClick={async () => {
                const response = await axios.put(
                  "http://localhost:8000/trading_state/",
                  {
                    action: "PAUSE",
                  }
                );
                requestAnimationFrame(() => {
                  setGlobalTradingState("PAUSED");
                });
              }}
            >
              PAUSE
            </button>
            <button
              className="px-4 py-1 rounded-xl text-sm btn-outline-blue"
              disabled={
                globalTradingState === "STOPPED" ||
                globalTradingState === "RUNNING"
              }
              onClick={async () => {
                const response = await axios.put(
                  "http://localhost:8000/trading_state/",
                  {
                    action: "RESUME",
                  }
                );
                requestAnimationFrame(() => {
                  setGlobalTradingState("RUNNING");
                });
                console.log(
                  "globalTradingState after resume:",
                  globalTradingState
                );
              }}
            >
              RESUME
            </button>
            <button
              disabled={globalTradingState === "STOPPED"}
              className="px-4 py-1 text-sm btn-outline-rose rounded-xl"
              onClick={async () => {
                const response = await axios.put(
                  "http://localhost:8000/trading_state/",
                  { action: "STOP" }
                );
                requestAnimationFrame(() => {
                  setGlobalTradingState("STOPPED");
                });
              }}
            >
              STOP_TRADING
            </button>
          </div>
        }
      ></Card>

      <Accordion
        variant="separated"
        allowMultiple={true}
        padding={false}
        items={Object.keys(strategies).map((key) => ({
          id: strategies[key].base_config.strategy_id,
          title: (
            <div className="flex items-center justify-between w-full gap-6">
              <span className="font-semibold">
                {strategies[key].base_config.strategy_name}
              </span>
              <div className="flex gap-5 text-xs items-center">
                <span className="text-gray-500 dark:text-gray-400">
                  {Object.keys(strategies[key].legs).length} Legs •{" "}
                  {strategies[key].execution_params.product}
                </span>
                <span
                  className={`font-medium ${
                    strategies[key].base_config.trading_state === "START" ||
                    strategies[key].base_config.trading_state === "RUNNING"
                      ? "text-green-500 dark:text-green-300 p-1 rounded-lg"
                      : strategies[key].base_config.trading_state === "PAUSED"
                      ? "text-yellow-500 dark:text-yellow-300 p-1 rounded-lg"
                      : "text-red-500 dark:text-red-300 p-1 rounded-lg"
                  }`}
                >
                  {strategies[key].base_config.trading_state}
                </span>
              </div>
              <div className="flex gap-2 items-center justify-center">
                {/* Selection Button */}
                <span className="flex gap-2 items-center justify-center">
                  <input
                    type="checkbox"
                    checked={
                      strategies[key].base_config.is_selected_for_trading
                    }
                    onChange={async () => {
                      const response = await axios.put(
                        "http://localhost:8000/trading_state/trading_selection",
                        {
                          data: {
                            ...strategies[key],
                            base_config: {
                              ...strategies[key].base_config,
                              is_selected_for_trading:
                                !strategies[key].base_config
                                  .is_selected_for_trading,
                            },
                          },
                        }
                      );
                      toasts.success(
                        "Trading selection updated: " +
                          JSON.stringify(response.data.data)
                      );
                      requestAnimationFrame(() => {
                        setStrategies((prevStrategies) => ({
                          ...prevStrategies,
                          [key]: {
                            ...prevStrategies[key],
                            base_config: {
                              ...prevStrategies[key].base_config,
                              is_selected_for_trading:
                                !prevStrategies[key].base_config
                                  .is_selected_for_trading,
                            },
                          },
                        }));
                      });
                    }}
                  />
                  Selected
                </span>

                {/* Update Button */}
                <button
                  className="ml-2 px-4 py-0.5 rounded-xl text-xs md:text-sm btn-outline-violet"
                  onClick={async () => {
                    const response = await axios.put(
                      "http://localhost:8000/strategy/update_strategy",
                      {
                        data: {
                          key: strategies[key].base_config.strategy_id,
                          strategy: strategies[key],
                        },
                      }
                    );
                    toasts.success(
                      "Strategy updated: " +
                        JSON.stringify(response.data.message) +
                        JSON.stringify(response.data.strategyId),
                      2000
                    );
                  }}
                >
                  Update
                </button>
                <button
                  className="ml-2 px-4 py-0.5 rounded-xl text-xs md:text-sm btn-outline-red"
                  onClick={async () => {
                    const response = await axios.delete(
                      "http://localhost:8000/strategy/delete",
                      {
                        data: {
                          key: strategies[key].base_config.strategy_id,
                        },
                      }
                    );
                    toasts.success(
                      "Strategy deleted: " +
                        JSON.stringify(response.data.message)
                    );
                    requestAnimationFrame(() => {
                      setStrategies((prevStrategies) => {
                        const newStrategies = { ...prevStrategies };
                        delete newStrategies[key];
                        return newStrategies;
                      });
                    });
                  }}
                >
                  Delete
                </button>
              </div>

              {/* Action Buttons  */}
              <div className="gap-3 flex items-center">
                <button
                  className="disabled:opacity-45"
                  disabled={
                    strategies[key].base_config.trading_state === "RUNNING" ||
                    strategies[key].base_config.trading_state === "PAUSED"
                  }
                  onClick={async () => {
                    const response = await axios.put(
                      "http://localhost:8000/trading_state/strategy",
                      {
                        key: strategies[key].base_config.strategy_id,
                        action: "START",
                      }
                    );
                    requestAnimationFrame(() => {
                      setStrategies((prevStrategies) => ({
                        ...prevStrategies,
                        [key]: {
                          ...prevStrategies[key],
                          base_config: {
                            ...prevStrategies[key].base_config,
                            trading_state: "RUNNING",
                          },
                        },
                      }));
                    });
                  }}
                >
                  <PlayCircleIcon className="w-6 h-6 text-green-600" />
                </button>
                <button
                  className="disabled:opacity-45"
                  disabled={
                    strategies[key].base_config.trading_state === "PAUSED" ||
                    strategies[key].base_config.trading_state === "STOPPED"
                  }
                  onClick={async () => {
                    const response = await axios.put(
                      "http://localhost:8000/trading_state/strategy",
                      {
                        key: strategies[key].base_config.strategy_id,
                        action: "PAUSE",
                      }
                    );
                    requestAnimationFrame(() => {
                      setStrategies((prevStrategies) => ({
                        ...prevStrategies,
                        [key]: {
                          ...prevStrategies[key],
                          base_config: {
                            ...prevStrategies[key].base_config,
                            trading_state: "PAUSED",
                          },
                        },
                      }));
                    });
                  }}
                >
                  <PauseCircleIcon className="w-6 h-6 btn-outline-amber border-none" />
                </button>
                <button
                  disabled={
                    strategies[key].base_config.trading_state === "RUNNING" ||
                    strategies[key].base_config.trading_state === "STOPPED"
                  }
                  className="disabled:opacity-45"
                  onClick={async () => {
                    const response = await axios.put(
                      "http://localhost:8000/trading_state/strategy",
                      {
                        key: strategies[key].base_config.strategy_id,
                        action: "RESUME",
                      }
                    );
                    requestAnimationFrame(() => {
                      setStrategies((prevStrategies) => ({
                        ...prevStrategies,
                        [key]: {
                          ...prevStrategies[key],
                          base_config: {
                            ...prevStrategies[key].base_config,
                            trading_state: "RUNNING",
                          },
                        },
                      }));
                    });
                  }}
                >
                  <RotateCcwIcon className="w-6 h-6 btn-outline-blue border-none" />
                </button>
                <button
                  disabled={
                    strategies[key].base_config.trading_state === "STOPPED"
                  }
                  className="disabled:opacity-45"
                  onClick={async () => {
                    const response = await axios.put(
                      "http://localhost:8000/trading_state/strategy",
                      {
                        key: strategies[key].base_config.strategy_id,
                        action: "STOP",
                      }
                    );
                    requestAnimationFrame(() => {
                      setStrategies((prevStrategies) => ({
                        ...prevStrategies,
                        [key]: {
                          ...prevStrategies[key],
                          base_config: {
                            ...prevStrategies[key].base_config,
                            trading_state: "STOPPED",
                          },
                        },
                      }));
                    });
                  }}
                >
                  <StopCircleIcon
                    className="w-6 h-6 btn-outline-red border-none"
                    onClick={() => {
                      console.log(strategies[key]);
                    }}
                  />
                </button>
              </div>
            </div>
          ),
          icon: <Settings className="w-4 h-4" />,
          content: (
            <StrategyAccordionContent
              strategy={strategies[key]}
              setStrategies={setStrategies}
            />
          ),
        }))}
      />
    </div>
  );
};

export default DeployedStrategies;
