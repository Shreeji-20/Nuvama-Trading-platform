import { ReactTable } from "../table";
import { HorizontalTabs } from "../../components/HorizontalTabs";
import { User } from "lucide-react";

interface BaseConfigTableProps {
  data: any;
}

interface LegsTableProps {
  legs: any;
}

interface ExecutionParamsTableProps {
  data: any;
}



export const BaseConfigTable: React.FC<BaseConfigTableProps> = ({ data }) => {
  return (
    <ReactTable
      padding={false}
      rounded={false}
      title="Base Config"
      description="Common Configuration"
      fullHeight={false}
      data={[data]}
      showHeader={true}
      headerGap={false}
      showFooter={false}
      showFilters={false}
      headerStyle="inline"
    />
  );
};

export const LegsTable: React.FC<LegsTableProps> = ({ legs }) => {
  return (
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
    />
  );
};

export const ExecutionParamsTable: React.FC<ExecutionParamsTableProps> = ({
  data,
}) => {
  return (
    <ReactTable
      title="Execution Params"
      padding={false}
      description="Execution parameters and settings"
      fullHeight={false}
      data={[data]}
      showHeader={false}
      showFooter={false}
      showFilters={false}
      headerStyle="inline"
    />
  );
};
