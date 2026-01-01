import { FormField } from "../../components/Form";

// Function to generate action config fields with a prefix
const createActionFormFields = (prefix: string = ""): FormField[] => {
  const addPrefix = (fieldName: string) =>
    prefix ? `${prefix}.${fieldName}` : fieldName;

  return [
    {
      name: addPrefix("action_type"),
      label: "Action Type",
      type: "select",
      defaultValue: "NONE",
      // required: true,
      options: [
        { label: "REENTRY", value: "REENTRY" },
        { label: "REEXECUTE", value: "REEXECUTE" },
        { label: "NONE", value: "NONE" },
      ],
    },
    {
      name: addPrefix("action_count"),
      label: "Action Count",
      type: "number",
      defaultValue: "0",
      // required: true,
    },
    {
      name: addPrefix("order_at_broker"),
      label: "Order At Broker",
      type: "checkbox",
      defaultValue: false,
      // required: true,
    },
    {
      name: addPrefix("sl_order_adjust.min_points"),
      label: "SL Order Adjust - Min Points",
      type: "text",
      defaultValue: "",
      // required: true,
    },
    {
      name: addPrefix("sl_order_adjust.max_percentage"),
      label: "SL Order Adjust - Max Percentage",
      type: "text",
      defaultValue: "",
      // required: true,
    },
  ];
};

const createPremumActionFormFields = (prefix: string = ""): FormField[] => {
  const addPrefix = (fieldName: string) =>
    prefix ? `${prefix}.${fieldName}` : fieldName;

  return [
    {
      name: addPrefix("strike_type"),
      label: "Premium Strike Type",
      type: "select",
      defaultValue: "NEAREST-PREMIUM",
      options: [
        { label: "NEAREST-PREMIUM", value: "NEAREST-PREMIUM" },
        { label: "RANGE-PREMIUM", value: "RANGE-PREMIUM" },
      ],
      required: true,
    },
    {
      name: addPrefix("max_depth"),
      label: "Max Depth",
      type: "number",
      defaultValue: "30",
      required: true,
    },
    {
      name: addPrefix("search_side"),
      label: "Search Side",
      type: "select",
      defaultValue: "BOTH",
      options: [
        { label: "BOTH", value: "BOTH" },
        { label: "OTM", value: "OTM" },
        { label: "ITM", value: "ITM" },
      ],
      required: true,
    },
    {
      name: addPrefix("value"),
      label: "Premium Value",
      type: "number",
      defaultValue: "10",
      required: false,
    },
    {
      name: addPrefix("condition"),
      label: "Condition",
      type: "select",
      defaultValue: "Greaterthanequal",
      options: [
        { label: "Greaterthanequal", value: "Greaterthanequal" },
        { label: "lessthanequal", value: "lessthanequal" },
      ],
      required: true,
    },
    {
      name: addPrefix("between"),
      label: "Between",
      type: "number",
      defaultValue: "0",
      required: false,
    },
    {
      name: addPrefix("and_value"),
      label: "And",
      type: "number",
      defaultValue: "0",
      required: false,
    },
  ];
};
// Export pre-configured instances for different action types
const onActionFormFields = createActionFormFields(); // No prefix
const onTargetActionFields = createActionFormFields("onTargetActionConfig");
const onStoplossActionFields = createActionFormFields("onStoplossActionConfig");
const onSquareOffActionFields = createActionFormFields(
  "onSquareOffActionConfig"
);

export {
  createActionFormFields,
  createPremumActionFormFields,
  onActionFormFields,
  onTargetActionFields,
  onStoplossActionFields,
  onSquareOffActionFields,
};
