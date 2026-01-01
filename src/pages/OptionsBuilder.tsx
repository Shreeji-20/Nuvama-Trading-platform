import React from "react";
import { useState, useEffect } from "react";
import { FlexibleForm, FormField } from "../components/Form";
import { ReactTable } from "../components/table";
const OptionsBuilder = () => {
  const [baseConfig, setBaseConfig] = useState<any>({
    strategy_name: "",
    execution_mode: "LIVE_MODE",
    buy_trades_first: false,
    multiplier: 1,
    underlying: "SPOT",
  });
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Options Strategy Builder New</h1>
      <ReactTable
        centered={true}
        // enableColumnResizing={true}
        data={[baseConfig]}
        editable={true}
        editableColumns={[
          "strategy_name",
          "execution_mode",
          "buy_trades_first",
          "multiplier",
          "underlying",
        ]}
        // addRowFields={[
        //   {
        //     name: "shreeji",
        //   },
        // ]}
        cellInputType={{
          buy_trades_first: "checkbox",
          execution_mode: "select",
          underlying: "select",
          multiplier: "number",
          strategy_name: "text",
        }}
        dropdownOptions={{
          execution_mode: ["LIVE_MODE", "SIMULATION_MODE"],
          underlying: ["SPOT", "FUTURES"],
        }}
        onCellEdit={(
          rowIndex: number,
          columnId: string,
          newValue: any,
          rowData: any
        ) => {
          setBaseConfig((prevConfig: any) => ({
            ...prevConfig,
            [columnId]: newValue,
          }));
          console.log(
            "Cell Edited" +
              " " +
              rowIndex +
              " " +
              columnId +
              " " +
              newValue +
              " ",
            rowData
          );
        }}

        showFooter={false}
        showFilters={false}
        padding={false}
        fullHeight={false}
        rounded={true}
        headerStyle="inline"
        title="Base Configuration"
        description=""
        headerGap={false}
      />
      <button
        className="btn-outline-blue rounded-xl px-4 py-1 mt-4"
        onClick={() => {
          console.log("Deploy Stratey Button Presses");
        }}
      >
        Deploy
      </button>
    </>
  );
};

export default OptionsBuilder;
