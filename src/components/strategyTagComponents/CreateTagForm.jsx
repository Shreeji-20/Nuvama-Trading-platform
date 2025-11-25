import React from "react";

const CreateTagForm = ({
  formData,
  setFormData,
  users,
  userInfoMap,
  selectedUserId,
  setSelectedUserId,
  multiplier,
  setMultiplier,
  onAddUserMultiplier,
  onUpdateUserMultiplier,
  onRemoveUserMultiplier,
  onSubmit,
  onCancelEdit,
  editingTagId,
  loading,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {editingTagId ? "Edit Strategy Tag" : "Create New Strategy Tag"}
        </h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Tag Name and Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[0.7rem] font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tag Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.tagName}
              onChange={(e) =>
                setFormData({ ...formData, tagName: e.target.value })
              }
              placeholder="e.g., Conservative, Aggressive"
              className="w-full px-3 py-2 text-[0.7rem] border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-[0.7rem] font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optional description"
              className="w-full px-3 py-2 text-[0.7rem] border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* User Selection */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
            User Multipliers <span className="text-red-500">*</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[0.7rem] font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select User
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 text-[0.7rem] border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select User --</option>
                {users.map((user) => {
                  const userId = String(user.userid || user.id);
                  const username = user.username || user.userid || user.id;
                  return (
                    <option key={userId} value={userId}>
                      {username}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-[0.7rem] font-medium text-gray-700 dark:text-gray-300 mb-1">
                Multiplier
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={multiplier}
                  onChange={(e) => setMultiplier(e.target.value)}
                  step="0.1"
                  min="0"
                  placeholder="1.0"
                  className="flex-1 px-3 py-2 text-[0.7rem] border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={onAddUserMultiplier}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-[0.7rem] font-medium rounded-lg transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Added Users Table */}
        {Object.keys(formData.userMultipliers).length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <h4 className="text-[0.7rem] font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Added Users ({Object.keys(formData.userMultipliers).length})
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-[0.7rem]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">
                      User
                    </th>
                    <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">
                      Multiplier
                    </th>
                    <th className="text-right p-2 font-semibold text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(formData.userMultipliers).map(
                    ([userId, multiplierValue]) => (
                      <tr
                        key={userId}
                        className="border-b border-gray-100 dark:border-gray-600"
                      >
                        <td className="p-2 text-gray-900 dark:text-white">
                          {userInfoMap[userId] || userId}
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={multiplierValue}
                            onChange={(e) =>
                              onUpdateUserMultiplier(userId, e.target.value)
                            }
                            step="0.1"
                            min="0"
                            className="w-24 px-2 py-1 text-[0.7rem] border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <button
                            type="button"
                            onClick={() => onRemoveUserMultiplier(userId)}
                            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-[0.7rem] rounded transition-colors"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Global Settings Section */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
            Global Order Settings
          </h3>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 space-y-4">
            {/* Market Orders Allowed */}
            <div className="pb-3 border-b border-gray-200 dark:border-gray-600">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.globalSettings.marketOrdersAllowed}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      globalSettings: {
                        ...formData.globalSettings,
                        marketOrdersAllowed: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-[0.7rem] text-gray-700 dark:text-gray-300 font-medium">
                  Allow Market Orders
                </span>
              </label>
            </div>

            {/* Order Failure Handling */}
            <div className="pb-3 border-b border-gray-200 dark:border-gray-600">
              <h4 className="text-[0.7rem] font-semibold text-gray-700 dark:text-gray-300 mb-3">
                📋 Order Failure Handling
              </h4>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-[0.7rem] font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Retry After (seconds)
                  </label>
                  <input
                    type="number"
                    value={formData.globalSettings.onOrderFailure.retryAfter}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        globalSettings: {
                          ...formData.globalSettings,
                          onOrderFailure: {
                            ...formData.globalSettings.onOrderFailure,
                            retryAfter: parseFloat(e.target.value) || 0,
                          },
                        },
                      })
                    }
                    step="0.1"
                    min="0"
                    className="w-24 px-3 py-2 text-[0.7rem] border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Retry Count
                  </label>
                  <input
                    type="number"
                    value={formData.globalSettings.onOrderFailure.retryCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        globalSettings: {
                          ...formData.globalSettings,
                          onOrderFailure: {
                            ...formData.globalSettings.onOrderFailure,
                            retryCount: parseInt(e.target.value) || 0,
                          },
                        },
                      })
                    }
                    min="0"
                    className="w-20 px-3 py-2 text-[0.7rem] border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Market Order
                  </label>
                  <label className="flex items-center justify-center gap-2 px-3 py-2 h-[42px]">
                    <input
                      type="checkbox"
                      checked={
                        formData.globalSettings.onOrderFailure.marketAtLast
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          globalSettings: {
                            ...formData.globalSettings,
                            onOrderFailure: {
                              ...formData.globalSettings.onOrderFailure,
                              marketAtLast: e.target.checked,
                            },
                          },
                        })
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-[0.7rem] text-gray-700 dark:text-gray-300 font-medium">
                      Market at Last
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modify Options */}
            <div>
              <h4 className="text-[0.7rem] font-semibold text-gray-700 dark:text-gray-300 mb-3">
                ⚙️ Modify Options
              </h4>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-[0.7rem] font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Better Price Logic
                  </label>
                  <select
                    value={
                      formData.globalSettings.modifyOptions.betterPriceLogicType
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        globalSettings: {
                          ...formData.globalSettings,
                          modifyOptions: {
                            ...formData.globalSettings.modifyOptions,
                            betterPriceLogicType: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-32 px-3 py-2 text-[0.7rem] border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option value="NONE">NONE</option>
                    <option value="POINTS">POINTS</option>
                    <option value="PERCENTAGE">PERCENTAGE</option>
                    <option value="TICKS">TICKS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[0.7rem] font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Better Price Value
                  </label>
                  <input
                    type="text"
                    value={
                      formData.globalSettings.modifyOptions
                        .betterPriceLogicValue
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        globalSettings: {
                          ...formData.globalSettings,
                          modifyOptions: {
                            ...formData.globalSettings.modifyOptions,
                            betterPriceLogicValue: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="0"
                    className="w-24 px-3 py-2 text-[0.7rem] border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white text-[0.7rem] font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : editingTagId ? "Update Tag" : "Create Tag"}
          </button>
          {editingTagId && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white text-[0.7rem] font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateTagForm;
