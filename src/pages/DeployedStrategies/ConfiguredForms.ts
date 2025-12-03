import { FormField } from "../../components/Form";

// Function to generate action config fields with a prefix
const createActionFormFields = (prefix: string = ""): FormField[] => {
  const addPrefix = (fieldName: string) =>
    prefix ? `${prefix}.${fieldName}` : fieldName;

  return [
    {
      name: addPrefix("actionType"),
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
      name: addPrefix("actionCount"),
      label: "Action Count",
      type: "number",
      defaultValue: "0",
      // required: true,
    },
    {
      name: addPrefix("orderAtBroker"),
      label: "Order At Broker",
      type: "checkbox",
      defaultValue: false,
      // required: true,
    },
    {
      name: addPrefix("slOrderAdjust.minPoints"),
      label: "SL Order Adjust - Min Points",
      type: "text",
      defaultValue: "",
      // required: true,
    },
    {
      name: addPrefix("slOrderAdjust.maxPercentage"),
      label: "SL Order Adjust - Max Percentage",
      type: "text",
      defaultValue: "",
      // required: true,
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
  onActionFormFields,
  onTargetActionFields,
  onStoplossActionFields,
  onSquareOffActionFields,
};
