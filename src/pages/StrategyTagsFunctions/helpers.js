/**
 * Get initial form data structure
 */
export const getInitialFormData = () => ({
  tagName: "",
  description: "",
  userMultipliers: {},
  users: [],
  globalSettings: {
    marketOrdersAllowed: false,
    onOrderFailure: {
      retryAfter: 0,
      retryCount: 0,
      marketAtLast: false,
    },
    modifyOptions: {
      betterPriceLogicType: "NONE",
      betterPriceLogicValue: 0,
    },
  },
});

/**
 * Prepare global settings for API submission
 */
export const prepareGlobalSettings = (globalSettings) => {
  return {
    ...globalSettings,
    modifyOptions: {
      ...globalSettings.modifyOptions,
      betterPriceLogicValue:
        globalSettings.modifyOptions.betterPriceLogicValue === ""
          ? 0
          : parseFloat(globalSettings.modifyOptions.betterPriceLogicValue) || 0,
    },
  };
};

/**
 * Prepare tag data for API submission
 */
export const prepareTagData = (formData) => {
  return {
    tagName: formData.tagName.trim(),
    description: formData.description.trim(),
    userMultipliers: formData.userMultipliers,
    globalSettings: prepareGlobalSettings(formData.globalSettings),
  };
};

/**
 * Validate form data
 */
export const validateFormData = (formData) => {
  const errors = [];

  if (!formData.tagName.trim()) {
    errors.push("Tag name is required");
  }

  if (Object.keys(formData.userMultipliers).length === 0) {
    errors.push("Please add at least one user with multiplier");
  }

  return errors;
};
