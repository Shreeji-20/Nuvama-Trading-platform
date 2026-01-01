import type {
  BaseConfig,
  ExecutionParams,
  TargetSettings,
  StoplossSettings,
  ExitSettings,
  DynamicHedgeSettings,
  AtBrokerSettings,
  DayOfWeek,
  Leg,
} from "../../types/strategy.types";

// Handle base config changes
export const createBaseConfigChangeHandler = (
  setBaseConfig: React.Dispatch<React.SetStateAction<BaseConfig>>,
  setLegs: React.Dispatch<React.SetStateAction<Record<string, Leg>>>
) => {
  return <K extends keyof BaseConfig>(field: K, value: BaseConfig[K]): void => {
    setBaseConfig((prev) => ({ ...prev, [field]: value }));

    if (field === "strategy_id" || field === "strategy_name") {
      setLegs((prev) => {
        const updated: Record<string, Leg> = {};
        Object.entries(prev).forEach(([legId, leg]) => {
          updated[legId] = { ...leg, [field]: value };
        });
        return updated;
      });
    }
  };
};

// Handle execution parameters changes
export const createExecutionParamChangeHandler = (
  setExecutionParams: React.Dispatch<React.SetStateAction<ExecutionParams>>
) => {
  return <K extends keyof ExecutionParams>(
    field: K,
    value: ExecutionParams[K]
  ): void => {
    setExecutionParams((prev) => ({ ...prev, [field]: value }));
  };
};

// Handle days selection (multiple)
export const createDaysChangeHandler = (
  setExecutionParams: React.Dispatch<React.SetStateAction<ExecutionParams>>
) => {
  return (day: DayOfWeek): void => {
    setExecutionParams((prev) => ({
      ...prev,
      run_on_days: prev.run_on_days.includes(day)
        ? prev.run_on_days.filter((d: DayOfWeek) => d !== day)
        : [...prev.run_on_days, day],
    }));
  };
};

// Handle target settings changes
export const createTargetSettingsChangeHandler = (
  setTargetSettings: React.Dispatch<React.SetStateAction<TargetSettings>>
) => {
  return <K extends keyof TargetSettings>(
    field: K,
    value: TargetSettings[K]
  ): void => {
    setTargetSettings((prev) => ({ ...prev, [field]: value }));
  };
};

// Handle stoploss settings changes
export const createStoplossSettingsChangeHandler = (
  setStoplossSettings: React.Dispatch<React.SetStateAction<StoplossSettings>>
) => {
  return <K extends keyof StoplossSettings>(
    field: K,
    value: StoplossSettings[K]
  ): void => {
    setStoplossSettings((prev) => ({ ...prev, [field]: value }));
  };
};

// Handle exit settings changes
export const createExitSettingsChangeHandler = (
  setExitSettings: React.Dispatch<React.SetStateAction<ExitSettings>>
) => {
  return <K extends keyof ExitSettings>(
    field: K,
    value: ExitSettings[K]
  ): void => {
    setExitSettings((prev) => ({ ...prev, [field]: value }));
  };
};

// Handle dynamic hedge settings changes
export const createDynamicHedgeSettingsChangeHandler = (
  setDynamicHedgeSettings: React.Dispatch<
    React.SetStateAction<DynamicHedgeSettings>
  >
) => {
  return <K extends keyof DynamicHedgeSettings>(
    field: K,
    value: DynamicHedgeSettings[K]
  ): void => {
    setDynamicHedgeSettings((prev) => ({ ...prev, [field]: value }));
  };
};

// Handle At Broker settings changes
export const createAtBrokerSettingsChangeHandler = (
  setAtBrokerSettings: React.Dispatch<React.SetStateAction<AtBrokerSettings>>
) => {
  return <K extends keyof AtBrokerSettings>(
    field: K,
    value: AtBrokerSettings[K]
  ): void => {
    setAtBrokerSettings((prev) => ({ ...prev, [field]: value }));
  };
};
