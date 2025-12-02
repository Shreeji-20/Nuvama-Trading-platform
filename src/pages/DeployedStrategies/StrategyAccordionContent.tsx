import React from "react";
import {
  BaseConfigTable,
  LegsTable,
  ExecutionParamsTable,
} from "./ConfigTables";
import { useStrategyEditors } from "./useStrategyEditors";
import { HorizontalTabs } from "../../components/HorizontalTabs";
import { RefreshCw, User, Settings } from "lucide-react";
interface StrategyAccordionContentProps {
  strategy: any;
  setStrategies: React.Dispatch<React.SetStateAction<any[]>>;
}

/**
 * Content component for each strategy accordion item
 * Uses the custom hook to create memoized edit handlers
 * This component is instantiated once per strategy
 */
export const StrategyAccordionContent: React.FC<
  StrategyAccordionContentProps
> = ({ strategy, setStrategies }) => {
  // Each strategy gets its own set of memoized handlers
  const editors = useStrategyEditors(
    strategy.baseConfig.strategyId,
    setStrategies
  );

  return (
    <div>
      <BaseConfigTable
        data={strategy.baseConfig}
        onCellEdit={editors.handleBaseConfigEdit}
      />
      <LegsTable legs={strategy.legs} onCellEdit={editors.handleLegsEdit} />
      <HorizontalTabs
        padding={false}
        // rounded={false}
        // className="mt-4"
        tabs={[
          {
            label: "Execution Parameters",
            icon: <Settings className="h-4 w-4" />,
            content: (
              <ExecutionParamsTable
                data={strategy.executionParams}
                onCellEdit={editors.handleExecutionParamsEdit}
              />
            ),
            id: "execution-params",
          },
        ]}
      />
      {/* <ExecutionParamsTable
        data={strategy.executionParams}
        onCellEdit={editors.handleExecutionParamsEdit}
      /> */}
    </div>
  );
};
