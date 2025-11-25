import React from "react";

const TagTableRow = ({
  tag,
  isEditing,
  editData,
  userInfoMap,
  onUpdateEditData,
  onSaveEdit,
  onCancelEdit,
  onStartEdit,
  onDelete,
  loading,
}) => {
  const currentData = isEditing ? editData : tag;

  const handleMultiplierChange = (userId, value) => {
    const newMultipliers = { ...editData.userMultipliers };
    newMultipliers[userId] = parseFloat(value) || 0;
    onUpdateEditData({ ...editData, userMultipliers: newMultipliers });
  };

  const handleGlobalSettingChange = (path, value) => {
    const newSettings = { ...editData.globalSettings };
    const keys = path.split(".");

    if (keys.length === 1) {
      newSettings[keys[0]] = value;
    } else if (keys.length === 2) {
      newSettings[keys[0]] = {
        ...newSettings[keys[0]],
        [keys[1]]: value,
      };
    }

    onUpdateEditData({ ...editData, globalSettings: newSettings });
  };

  return (
    <tr
      className={`border-b border-gray-200/50 dark:border-gray-700/50 transition-all ${
        isEditing
          ? "bg-blue-50/50 dark:bg-blue-900/20 ring-2 ring-blue-400 dark:ring-blue-500"
          : "hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
      }`}
    >
      {/* Tag Name */}
      <td className="p-2">
        {isEditing ? (
          <input
            type="text"
            value={editData.tagName}
            onChange={(e) =>
              onUpdateEditData({ ...editData, tagName: e.target.value })
            }
            className="w-full px-2 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-600 text-blue-900 dark:text-blue-100 text-[0.7rem] font-semibold rounded focus:ring-1 focus:ring-blue-400"
          />
        ) : (
          <span className="inline-flex px-2 py-0.5 bg-blue-500/90 text-white text-[0.7rem] font-semibold rounded">
            {tag.tagName}
          </span>
        )}
      </td>

      {/* Description */}
      <td className="p-2">
        {isEditing ? (
          <input
            type="text"
            value={editData.description}
            onChange={(e) =>
              onUpdateEditData({ ...editData, description: e.target.value })
            }
            placeholder="Description"
            className="w-full px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-[0.7rem] rounded focus:ring-1 focus:ring-blue-400"
          />
        ) : (
          <span className="text-gray-600 dark:text-gray-400">
            {tag.description || "-"}
          </span>
        )}
      </td>

      {/* Users & Multipliers */}
      <td className="p-2">
        <div className="flex flex-wrap gap-1">
          {currentData.userMultipliers &&
          Object.keys(currentData.userMultipliers).length > 0 ? (
            Object.entries(currentData.userMultipliers).map(
              ([userId, multiplier]) => (
                <span
                  key={userId}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 border border-green-500/30 text-green-700 dark:text-green-300 text-[0.65rem] rounded font-medium"
                >
                  {userInfoMap[userId] || userId}:
                  {isEditing ? (
                    <input
                      type="number"
                      value={multiplier}
                      onChange={(e) =>
                        handleMultiplierChange(userId, e.target.value)
                      }
                      step="0.1"
                      min="0"
                      className="w-12 px-1 py-0 bg-white dark:bg-gray-700 border border-green-400 dark:border-green-600 rounded text-[0.65rem]"
                    />
                  ) : (
                    `${multiplier}x`
                  )}
                </span>
              )
            )
          ) : (
            <span className="text-gray-500">-</span>
          )}
        </div>
      </td>

      {/* Market Orders */}
      <td className="p-2">
        {currentData.globalSettings && (
          <>
            {isEditing ? (
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={currentData.globalSettings.marketOrdersAllowed}
                  onChange={(e) =>
                    handleGlobalSettingChange(
                      "marketOrdersAllowed",
                      e.target.checked
                    )
                  }
                  className="w-3 h-3"
                />
                <span className="text-[0.7rem]">
                  {currentData.globalSettings.marketOrdersAllowed
                    ? "Allowed"
                    : "Not Allowed"}
                </span>
              </label>
            ) : (
              <span
                className={
                  tag.globalSettings.marketOrdersAllowed
                    ? "inline-flex px-2 py-0.5 text-[0.65rem] rounded bg-green-500/20 border border-green-500/30 text-green-700 dark:text-green-300"
                    : "inline-flex px-2 py-0.5 text-[0.65rem] rounded bg-red-500/20 border border-red-500/30 text-red-700 dark:text-red-300"
                }
              >
                {tag.globalSettings.marketOrdersAllowed ? "✅ Yes" : "❌ No"}
              </span>
            )}
          </>
        )}
      </td>

      {/* Order Failure */}
      <td className="p-2">
        {currentData.globalSettings && (
          <>
            {isEditing ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={currentData.globalSettings.onOrderFailure.retryCount}
                  onChange={(e) =>
                    handleGlobalSettingChange(
                      "onOrderFailure.retryCount",
                      parseInt(e.target.value) || 0
                    )
                  }
                  min="0"
                  className="w-12 px-1 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-[0.65rem]"
                  placeholder="Count"
                />
                <span className="text-[0.65rem]">x @</span>
                <input
                  type="number"
                  value={currentData.globalSettings.onOrderFailure.retryAfter}
                  onChange={(e) =>
                    handleGlobalSettingChange(
                      "onOrderFailure.retryAfter",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  step="0.1"
                  min="0"
                  className="w-12 px-1 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-[0.65rem]"
                  placeholder="Sec"
                />
                <span className="text-[0.65rem]">s</span>
              </div>
            ) : (
              <span className="text-gray-700 dark:text-gray-300">
                {tag.globalSettings.onOrderFailure?.retryCount || 0}x @{" "}
                {tag.globalSettings.onOrderFailure?.retryAfter || 0}s
              </span>
            )}
          </>
        )}
      </td>

      {/* Modify Options */}
      <td className="p-2">
        {currentData.globalSettings && (
          <>
            {isEditing ? (
              <select
                value={
                  currentData.globalSettings.modifyOptions.betterPriceLogicType
                }
                onChange={(e) =>
                  handleGlobalSettingChange(
                    "modifyOptions.betterPriceLogicType",
                    e.target.value
                  )
                }
                className="w-full px-1 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-[0.65rem]"
              >
                <option value="NONE">NONE</option>
                <option value="POINTS">POINTS</option>
                <option value="PERCENTAGE">PERCENTAGE</option>
                <option value="TICKS">TICKS</option>
              </select>
            ) : (
              <span className="text-gray-700 dark:text-gray-300">
                {tag.globalSettings.modifyOptions?.betterPriceLogicType ||
                  "NONE"}
              </span>
            )}
          </>
        )}
      </td>

      {/* Created */}
      <td className="p-2 text-gray-600 dark:text-gray-400">
        {tag.createdAt ? new Date(tag.createdAt).toLocaleDateString() : "-"}
      </td>

      {/* Actions */}
      <td className="p-2">
        <div className="flex gap-1 justify-end">
          {isEditing ? (
            <>
              <button
                onClick={onSaveEdit}
                disabled={loading}
                className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-[0.7rem] font-medium rounded transition-colors disabled:opacity-50"
                title="Save"
              >
                💾 Save
              </button>
              <button
                onClick={onCancelEdit}
                className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white text-[0.7rem] font-medium rounded transition-colors"
                title="Cancel"
              >
                ✖️
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onStartEdit(tag)}
                className="px-2 py-1 bg-blue-500/90 hover:bg-blue-600 text-white text-[0.7rem] font-medium rounded transition-colors"
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(tag.id)}
                className="px-2 py-1 bg-red-500/90 hover:bg-red-600 text-white text-[0.7rem] font-medium rounded transition-colors"
                title="Delete"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default TagTableRow;
