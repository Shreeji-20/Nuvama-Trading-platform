import { ReactTable } from "../../components/table";
import { HorizontalTabs } from "../../components/HorizontalTabs";
import {
  IndianRupee,
  Key,
  PlusCircle,
  RefreshCw,
  Settings,
  User,
} from "lucide-react";
import {
  executionModeOptions,
  expiryOptions,
  getStrikeOptions,
  orderTypeOptions,
  targetOptions,
  underlyingOptions,
} from "../../hooks/AdvancedOptionsBuilderFunctions";
import { FlexibleForm, FormField } from "../../components/Form";
import { useState, useMemo, useEffect } from "react";
import FlexibleModal from "../../components/Modal";
import {
  createActionFormFields,
  onActionFormFields,
  createPremumActionFormFields,
} from "./ConfiguredForms";
import { flattenObject } from "../../hooks/commonFunctions";
import {
  symbolOptions,
  priceTypeOptions,
} from "../../hooks/AdvancedOptionsBuilderFunctions";
import { SampleData } from "../../hooks/DeployedStrategiesFunctions/TradingStatesHooks";
import axios from "axios";

interface BaseConfigTableProps {
  data: any;
  onCellEdit?: onCellEditProps;
}

interface LegsTableProps {
  legs: any;
  onCellEdit?: onCellEditProps;
  onLegDelete?: onCellEditProps;
  onLegCopy?: onCellEditProps;
  onLegAdd?: () => void;
}

interface ExecutionParamsTableProps {
  data: any;
  onCellEdit?: onCellEditProps;
}

interface onCellEditProps {
  (rowIndex: number, columnId: string, newValue: any): void;
}
export const BaseConfigTable: React.FC<BaseConfigTableProps> = ({
  data,
  onCellEdit,
}) => {
  return (
    <ReactTable
      padding={false}
      rounded={false}
      title="Base Config"
      description=""
      fullHeight={false}
      data={[data]}
      showHeader={true}
      headerGap={false}
      showFooter={false}
      showFilters={false}
      headerStyle="inline"
      hideColumns={["is_selected_for_trading"]}
      editable={true}
      editableColumns={[
        "multiplier",
        "underlying",
        "buy_trades_first",
        "execution_mode",
      ]}
      cellInputType={{
        strategyName: "text",
        multiplier: "number",
        underlying: "select",
        buy_trades_first: "checkbox",
        execution_mode: "select",
      }}
      dropdownOptions={{
        underlying: underlyingOptions,
        execution_mode: executionModeOptions,
      }}
      onCellEdit={onCellEdit}
    />
  );
};

export const LegsTable: React.FC<LegsTableProps> = ({
  legs,
  onCellEdit,
  onLegDelete,
  onLegCopy,
  onLegAdd,
}) => {
  const legsData = useMemo(() => Object.values(legs), [legs]);
  const [open, setOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [modalType, setModalType] = useState<
    | "on_squareoff_action_config"
    | "on_target_action_config"
    | "on_stoploss_action_config"
    | "premium_based_strike_config"
  >("on_squareoff_action_config");

  console.log("LegsTable rendered with legs:", legsData);
  return (
    <>
      <ReactTable
        title="Legs"
        padding={false}
        description=""
        // showAddRow={true}
        // rounded={true}
        fullHeight={false}
        data={legsData}
        addRowFields={[
          {
            key: "test123",
            label: "teat123",
            type: "text",
            required: true,
          },
        ]}
        showHeader={true}
        showFooter={false}
        showFilters={false}
        cellStyler={(value, columnId, rowData) => {
          if (columnId === "option_type") {
            return {
              bgColor:
                value === "CE"
                  ? "border border-green-500 dark:border-green-300 bg-green-300/15"
                  : "border border-red-500 dark:border-red-300 bg-red-300/15",
              textColor:
                value === "CE"
                  ? "text-green-800 dark:text-green-200"
                  : "text-red-800 dark:text-red-200",
              rounded: "rounded-lg",
            };
          }
          if (columnId === "action") {
            return {
              bgColor:
                value === "BUY"
                  ? "border border-green-500 dark:border-green-300 bg-green-300/15"
                  : "border border-red-500 dark:border-red-300 bg-red-300/15",
              textColor:
                value === "BUY"
                  ? "text-green-800 dark:text-green-200"
                  : "text-red-800 dark:text-red-200",
              rounded: "rounded-lg",
            };
          }
          if (columnId === "leg_id") {
            return {
              fontWeight: "font-bold",
              textColor: "text-blue-800 dark:text-blue-200",
              bgColor: "bg-blue-300/15",
              rounded: "rounded-lg",
            };
          }
          return {};
        }}
        headerButtons={[
          {
            label: "Add Leg",
            variant: "primary",
            icon: <PlusCircle className="h-4 w-4" />,
            onClick: () => {
              console.log("Add Leg clicked");
              onLegAdd && onLegAdd();
            },
          },
        ]}
        headerStyle="inline"
        buttonColumns={{
          config_buttons: [
            {
              label: "OnSquareOff",
              variant: "secondary",
              icon: <Settings className="h-4 w-4" />,
              onClick: (rowData: any, rowIndex: number) => {
                setSelectedRowIndex(rowIndex);
                setSelectedRowData(rowData);
                setModalType("on_squareoff_action_config");
                setOpen(true);
              },
            },
            {
              label: "OnTarget",
              variant: "success",
              icon: <Settings className="h-4 w-4" />,
              onClick: (rowData: any, rowIndex: number) => {
                setSelectedRowIndex(rowIndex);
                setSelectedRowData(rowData);
                setModalType("on_target_action_config");

                setOpen(true);
              },
            },
            {
              label: "OnStoploss",
              variant: "danger",
              icon: <Settings className="h-4 w-4" />,
              onClick: (rowData: any, rowIndex: number) => {
                setSelectedRowIndex(rowIndex);
                setSelectedRowData(rowData);
                setModalType("on_stoploss_action_config");
                setOpen(true);
              },
            },
            {
              label: "PremiumStrikeconfig",
              variant: "primary",
              icon: <IndianRupee className="h-4 w-4" />,
              onClick: (rowData: any, rowIndex: number) => {
                setSelectedRowIndex(rowIndex);
                setSelectedRowData(rowData);
                setModalType("premium_based_strike_config");
                setOpen(true);
              },
            },
          ],
          action_buttons: [
            {
              label: "Copyleg",
              variant: "secondary",
              icon: <RefreshCw className="h-4 w-4" />,
              onClick: (rowData: any, rowIndex: number) => {
                console.log("Duplicate Leg clicked for row:", rowData);
                onLegCopy && onLegCopy(rowIndex, "", null);
              },
            },
            {
              label: "Deleteleg",
              variant: "danger",
              icon: <User className="h-4 w-4" />,
              onClick: (rowData: any, rowIndex: number) => {
                console.log("Delete Leg clicked for row:", rowData);
                onLegDelete && onLegDelete(rowIndex, "", null);
              },
            },
          ],
        }}
        editable={true}
        editableColumns={[
          "symbol",
          "expiry",
          "price_type",
          "option_type",
          "depth_index",
          "order_type",
          "action",
          "lots",
          "strike",
          "tp_sl_config.target_logic_type",
          "tp_sl_config.stoploss_logic_type",
          "tp_sl_config.target_value",
          "tp_sl_config.stoploss_value",
          "wait_and_trade_value",
          "wait_and_trade_logic_type",
          "dynamic_hedge",
          "marked_as_complete",
          "premium_based_strike",
          "start_time",
        ]}
        hideColumns={[
          "on_stoploss_action_config.*",
          "on_target_action_config.*",
          "on_squareoff_action_config.*",
          "id",
          "premium_based_strike_config.*",
          "hedge_selected_strike.*",
          "selected_strike.*",
          "strategy_name",
          // "config_buttons",
          // "at_broker_settings.*",
        ]}
        cellInputType={{
          strike_type: "text", // inside premium_based_strike_config
          strike_distance: "number", // inside premium_based_strike_config
          option_type: "select",
          lots: "number",
          action: "select",
          symbol: "select",
          expiry: "select",
          price_type: "select",
          depth_index: "select",
          order_type: "select",
          "tp_sl_config.target_logic_type": "select",
          "tp_sl_config.stoploss_logic_type": "select",
          "tp_sl_config.target_value": "number",
          "tp_sl_config.stoploss_value": "number",
          wait_and_trade_value: "number",
          wait_and_trade_logic_type: "select",
          dynamic_hedge: "checkbox",
          start_time: "datetime-local",
          premium_based_strike: "checkbox",
          strike: "select",
          marked_as_complete: "checkbox",
        }}
        dropdownOptions={{
          expiry: ["0", "1", "2", "3", "4", "5"],
          symbol: symbolOptions,
          price_type: priceTypeOptions,
          order_type: orderTypeOptions,
          action: ["BUY", "SELL"],
          option_type: ["CE", "PE"],
          strike: (rowData: any) =>
            getStrikeOptions(rowData?.symbol || "NIFTY"),
          wait_and_trade_logic_type: targetOptions,
          "tp_sl_config.target_logic_type": targetOptions,
          "tp_sl_config.stoploss_logic_type": targetOptions,
        }}
        columnLabels={{
          "tp_sl_config.target_logic_type": "Target Logic",
          "tp_sl_config.stoploss_logic_type": "SL Logic",
          "tp_sl_config.target_value": "Target Value",
          "tp_sl_config.stoploss_value": "SL Value",
          wait_and_trade_logic_type: "Wait Logic",
          wait_and_trade_value: "Wait Value",
          dynamic_hedge: "Dynamic Hedge",
          marked_as_complete: "Marked As Complete",
          premium_based_strike: "Premium Based Strike",
          option_type: "Option Type",
          order_type: "Order Type",
          price_type: "Price Type",
          depth_index: "Depth Index",
          strategy_id: "Strategy ID",
        }}
        columnOrder={[
          "leg_id",
          "symbol",
          "expiry",
          "option_type",
          "action",
          "lots",
          "strike",
          "premium_based_strike",
          "strategy_id",
          "price_type",
          "depth_index",
          "order_type",
          "tp_sl_config.target_logic_type",
          "tp_sl_config.target_value",
          "tp_sl_config.stoploss_logic_type",
          "tp_sl_config.stoploss_value",
          "wait_and_trade_logic_type",
          "wait_and_trade_value",
          "dynamic_hedge",
          "marked_as_complete",
          "start_time",

          "config_buttons",
        ]}
        onCellEdit={onCellEdit}
        // onLegDelete={onLegDelete}
      />

      <FlexibleModal
        isOpen={open}
        closeOnEsc={true}
        onClose={() => setOpen(false)}
        position="center"
        width="500px"
        modalClassName="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-4"
      >
        {selectedRowData && (
          <FlexibleForm
            title={modalType}
            initialData={flattenObject(
              selectedRowData?.[modalType] || {},
              modalType
            )}
            onSubmit={(data) => {
              if (onCellEdit && selectedRowIndex !== null) {
                const filteredData = Object.keys(data)
                  .filter((key) => {
                    const value = data[key];
                    return typeof value !== "object" || value === null;
                  })
                  .reduce((acc, key) => {
                    acc[key] = data[key];
                    return acc;
                  }, {} as Record<string, any>);

                Object.keys(filteredData).forEach((key) => {
                  onCellEdit(selectedRowIndex, key, filteredData[key]);
                });
              }
              setOpen(false);
            }}
            fields={
              modalType === "premium_based_strike_config"
                ? createPremumActionFormFields("" + modalType)
                : createActionFormFields("" + modalType)
            }
          />
        )}
      </FlexibleModal>
    </>
  );
};

export const ExecutionParamsTable: React.FC<ExecutionParamsTableProps> = ({
  data,
  onCellEdit,
}) => {
  const [strategyTags, setStrategyTags] = useState<
    { label: string; value: string }[]
  >([]);
  useEffect(() => {
    const fetchStrategyTags = async () => {
      const response = await axios.get(
        "http://localhost:8000/strategy-tags/list"
      );
      const tags = response.data;
      setStrategyTags(
        tags.map((tag: any) => ({
          label: `${tag.tagName} (${tag.id})`,
          value: tag.id,
        }))
      );
    };
    fetchStrategyTags();
  }, []);
  return (
    <ReactTable
      title="Execution Params"
      enableRowSelection={true}
      onRowSelectionChange={(selectedRows) => {
        console.log("Selected rows:", selectedRows);
      }}
      rounded={true}
      padding={false}
      description=""
      fullHeight={false}
      data={[data]}
      showHeader={true}
      showFooter={false}
      showFilters={false}
      headerStyle="inline"
      editable={true}
      editableColumns={[
        "product",
        "strategy_tag",
        "legs_execution",
        "portfolio_execution_mode",
        "entry_order_type",
        "run_on_days",
        "start_time",
        "end_time",
        "squareoff_time",
      ]}
      cellInputType={{
        product: "select",
        strategy_tag: "select",
        legs_execution: "select",
        portfolio_execution_mode: "select",
        entry_order_type: "select",
        run_on_days: "multiselect",
        start_time: "datetime-local",
        end_time: "datetime-local",
        squareoff_time: "datetime-local",
      }}
      dropdownOptions={{
        product: ["MIS", "NRML", "CNC"],
        legs_execution: ["Parallel", "Sequential", "One by One"],
        portfolio_execution_mode: ["startTime", "underlyingPremium"],
        entry_order_type: ["MARKET", "LIMIT"],
        strategy_tag: strategyTags,
        run_on_days: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
          // ...
        ],
      }}
      onCellEdit={onCellEdit}
    />
  );
};
