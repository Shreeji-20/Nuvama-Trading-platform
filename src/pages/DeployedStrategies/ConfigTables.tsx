import { ReactTable } from "../table";
import { HorizontalTabs } from "../../components/HorizontalTabs";
import { IndianRupee, RefreshCw, Settings, User } from "lucide-react";
import {
  executionModeOptions,
  expiryOptions,
  getStrikeOptions,
  orderTypeOptions,
  targetOptions,
  underlyingOptions,
} from "../../hooks/AdvancedOptionsBuilderFunctions";
import { FlexibleForm, FormField } from "../../components/Form";
import { useState, useMemo } from "react";
import FlexibleModal from "../../components/Modal";
import { createActionFormFields, onActionFormFields } from "./ConfiguredForms";
import { flattenObject } from "../../hooks/commonFunctions";
import {
  symbolOptions,
  priceTypeOptions,
} from "../../hooks/AdvancedOptionsBuilderFunctions";
interface BaseConfigTableProps {
  data: any;
  onCellEdit?: onCellEditProps;
}

interface LegsTableProps {
  legs: any;
  onCellEdit?: onCellEditProps;
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
      editable={true}
      cellInputType={{
        strategyName: "text",
        multiplier: "number",
        underlying: "select",
        buyTradesFirst: "checkbox",
        executionMode: "select",
      }}
      dropdownOptions={{
        underlying: underlyingOptions,
        executionMode: executionModeOptions,
      }}
      editableColumns={[
        "strategyName",
        "multiplier",
        "underlying",
        "buyTradesFirst",
        "executionMode",
      ]}
      onCellEdit={onCellEdit}
    />
  );
};

export const LegsTable: React.FC<LegsTableProps> = ({ legs, onCellEdit }) => {
  const legsData = useMemo(() => Object.values(legs), [legs]);
  const [open, setOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  console.log("LegsTable rendered with legs:", legsData);
  return (
    <>
      <ReactTable
        title="Legs"
        padding={false}
        description="Details of each leg"
        fullHeight={false}
        data={legsData}
        showHeader={true}
        showFooter={false}
        showFilters={false}
        headerStyle="inline"
        buttonColumns={{
          configButtons: [
            {
              label: "OnSquareOff",
              variant: "secondary",
              icon: <Settings className="h-4 w-4" />,
              onClick: (rowData: any, rowIndex: number) => {
                setSelectedRowIndex(rowIndex);
                setSelectedRowData(rowData);
                setOpen(true);
              },
            },
            {
              label: "PremiumStrikeconfig",
              variant: "primary",
              icon: <IndianRupee className="h-4 w-4" />,
              onClick: (rowData: any, rowIndex: number) => {
                console.log(
                  "PremiumStrikeconfig clicked for row:",
                  rowData,
                  rowIndex
                );
              },
            },
          ],
        }}
        editable={true}
        editableColumns={[
          "symbol",
          "expiry",
          "priceType",
          "optionType",
          "depthIndex",
          "orderType",
          "action",
          "lots",
          "strike",
          "targetType",
          "stoplossType",
          "targetValue",
          "stoplossValue",
          "waitAndTradeValue",
          "waitAndTradeLogic",
          "dynamicHedge",
        ]}
        hideColumns={[
          "onStoplossActionConfig.*",
          "onTargetActionConfig.*",
          "onSquareOffActionConfig.*",
          "markedAsComplete",
          "id",
          "premiumBasedStrikeConfig.*",
          "hedgeSelectedStrike.*",
          "selectedStrike.*",
          "reEnterCount",
          "reEnterLogic",
          "initialLegPrice",
          "strategyName",
          "hedgeSelectedStrike",
          "selectedStrike",
        ]}
        cellInputType={{
          strikeType: "text",
          strikeCriteria: "text",
          optionType: "select",
          lots: "number",
          action: "select",
          symbol: "select",
          expiry: "select",
          priceType: "select",
          depthIndex: "select",
          orderType: "select",
          targetType: "select",
          stoplossType: "select",
          targetValue: "number",
          stoplossValue: "number",
          waitAndTradeValue: "number",
          waitAndTradeLogic: "select",
          dynamicHedge: "checkbox",
          startTime: "text",
          premiumBasedStrike: "checkbox",
          strike: "select",
        }}
        dropdownOptions={{
          symbol: symbolOptions,
          expiry: expiryOptions,
          priceType: priceTypeOptions,
          depthIndex: [1, 2, 3, 4, 5],
          orderType: orderTypeOptions,
          action: ["BUY", "SELL"],
          optionType: ["CE", "PE"],
          // Dynamic strike options based on row's symbol
          strike: (rowData: any) =>
            getStrikeOptions(rowData?.symbol || "NIFTY"),
          waitAndTradeLogic: targetOptions,
        }}
        columnOrder={["onSquareOffActionConfig"]}
        onCellEdit={onCellEdit}
      />

      <FlexibleModal
        isOpen={open}
        closeOnEsc={true}
        onClose={() => setOpen(false)}
        position="center"
        width="500px"
      >
        {selectedRowData && (
          <FlexibleForm
            title="Leg Configuration"
            initialData={flattenObject(
              selectedRowData?.onSquareOffActionConfig || {},
              "onSquareOffActionConfig"
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
            fields={createActionFormFields("onSquareOffActionConfig")}
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
  return (
    <ReactTable
      title="Execution Params"
      padding={false}
      description="Execution parameters and settings"
      fullHeight={false}
      data={[data]}
      showHeader={true}
      showFooter={false}
      showFilters={false}
      headerStyle="inline"
      editable={true}
      editableColumns={[
        "product",
        "strategyTag",
        "legsExecution",
        "portfolioExecutionMode",
        "entryOrderType",
      ]}
      cellInputType={{
        product: "select",
        strategyTag: "text",
        legsExecution: "select",
        portfolioExecutionMode: "select",
        entryOrderType: "select",
      }}
      dropdownOptions={{
        product: ["MIS", "NRML", "CNC"],
        legsExecution: ["PARALLEL", "SEQUENTIAL"],
        portfolioExecutionMode: ["SINGLE", "MULTIPLE"],
        entryOrderType: ["MARKET", "LIMIT"],
      }}
      onCellEdit={onCellEdit}
    />
  );
};
