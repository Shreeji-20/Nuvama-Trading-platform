import axios, { AxiosError } from "axios";
import { ReactTable } from "../../pages/table";
import { useState, useRef, useEffect } from "react";
import type {
  Underlying,
  ExecutionMode,
  BaseConfig,
  PremiumBasedStrikeConfig,
  Leg,
  ExecutionParams,
  TargetSettings,
  StoplossSettings,
  ExitSettings,
  DynamicHedgeSettings,
  AtBrokerSettings,
  StrategyTag,
  DeploymentStatus,
} from "../../types/strategy.types";

import { baseConfigDefault } from "./defaultValues";
import { underlyingOptions } from "../../hooks/AdvancedOptionsBuilderFunctions";
export const OptionsStrategyBuilder = () => {
  const [baseConfig, setBaseConfig] = useState<BaseConfig>(baseConfigDefault);

  return (
    <div>
      <ReactTable
        data={[baseConfig]}
        title="Base Config"
        description=""
        showHeader={true}
        headerStyle="inline"
        showFooter={false}
        showFilters={false}
        editable={true}
        editableColumns={[
          "strategyName",
          "lots",
          "underlying",
          "buyTradesFirst",
          "executionMode",
        ]}
        cellInputType={{
          underlying: "select",
          strategyName: "text",
          lots: "number",
          buyTradesFirst: "checkbox",
          executionMode: "select",
        }}
        dropdownOptions={{
          underlying: underlyingOptions,
          executionMode: ["Live Mode", "Simulation Mode"],
        }}
        onCellEdit={(rowIndex, columnId, newValue) => {
          requestAnimationFrame(() => {
            setBaseConfig((prev) => ({
              ...prev,
              [columnId]: newValue,
            }));
            console.log("BaseConfig updated:", { columnId, newValue });
          });
        }}
      />

      {/* <ReactTable data={[]} title="Legs Config" /> */}
    </div>
  );
};
