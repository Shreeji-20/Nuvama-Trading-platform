import { ReactTable } from "../table";
import { HorizontalTabs } from "../../components/HorizontalTabs";
import { RefreshCw, Settings, User } from "lucide-react";
import {
  executionModeOptions,
  underlyingOptions,
} from "../../hooks/AdvancedOptionsBuilderFunctions";
import { Popper, usePopper } from "../../components/Popper";
import { FlexibleForm, FormField } from "../../components/Form";

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
  //   const popper = usePopper();

  //   const fields: FormField[] = [
  //     {
  //       name: "field1",
  //       label: "Field 1",
  //       type: "text" as const,
  //       required: true,
  //     },
  //     {
  //       name: "field2",
  //       label: "Field 2",
  //       type: "select" as const,
  //       options: [
  //         { label: "Option 1", value: "opt1" },
  //         { label: "Option 2", value: "opt2" },
  //       ],
  //     },
  //   ];

  return (
    <>
      <ReactTable
        title="Legs"
        padding={false}
        description="Details of each leg"
        fullHeight={false}
        data={Object.values(legs)}
        showHeader={true}
        showFooter={false}
        showFilters={false}
        headerStyle="inline"
        buttonColumns={{
          onSquareOffAction: {
            label: "Config",
            variant: "secondary",
            icon: <Settings className="h-4 w-4" />,
            onClick: () => {},
          },
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
          "onTargetAction",
          "onStoplossAction",
        ]}
        cellInputType={{
          legName: "text",
          strikeType: "text",
          strikeCriteria: "text",
          optionType: "select",
          lots: "number",
          position: "select",
        }}
        dropdownOptions={{
          optionType: ["CE", "PE"],
          position: ["BUY", "SELL"],
        }}
        onCellEdit={onCellEdit}
      />

      {/* <Popper
        open={popper.open}
        onClose={popper.close}
        title="Add Item"
        placement="right"
        width="600px"
        showBackdrop={true}
      >
        <FlexibleForm
          fields={fields}
          onSubmit={(data) => {
            console.log(data);
            popper.close();
          }}
          onCancel={popper.close}
        />
      </Popper> */}
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
