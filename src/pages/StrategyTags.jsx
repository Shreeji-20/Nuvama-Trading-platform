import React, { useState, useEffect } from "react";
import config from "../config/api";

const StrategyTags = () => {
  const [tags, setTags] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form state
  const [formData, setFormData] = useState({
    tagName: "",
    description: "",
    userMultipliers: {}, // Dictionary userId: multiplier
    users: [], // Array of {userId, multiplier}
    globalSettings: {
      marketOrdersAllowed: false,
      onOrderFailure: {
        retryAfter: 0,
        retryCount: 0,
        marketAtLast: false,
      },
      modifyOptions: {
        priceType: "LTP",
        depthIndex: 0,
        betterPriceLogicType: "None",
        betterPriceLogicValue: 0,
      },
    },
  });

  // Editing state
  const [editingTagId, setEditingTagId] = useState(null);
  const [inlineEditingTagId, setInlineEditingTagId] = useState(null);
  const [inlineEditData, setInlineEditData] = useState(null);

  // User selection state
  const [selectedUserId, setSelectedUserId] = useState("");
  const [multiplier, setMultiplier] = useState(1);

  // Helper to get user info for display
  const [userInfoMap, setUserInfoMap] = useState({}); // userId -> username mapping

  const API_BASE_URL = config.API_BASE_URL;

  // Fetch all users for selection
  const fetchUsers = async () => {
    try {
      const response = await fetch(config.buildUrl(config.ENDPOINTS.USERS));
      if (response.ok) {
        const usersData = await response.json();
        const usersArray = Array.isArray(usersData) ? usersData : [];
        setUsers(usersArray);

        // Build userId -> username map
        const userMap = {};
        usersArray.forEach((user) => {
          const userId = String(user.userid || user.id);
          const username = user.username || user.userid || user.id;
          userMap[userId] = username;
        });
        setUserInfoMap(userMap);
      } else {
        console.error("Error fetching users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch all strategy tags
  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/strategy-tags/list`);
      if (response.ok) {
        const data = await response.json();
        setTags(Array.isArray(data) ? data : []);
      } else {
        showMessage("error", "Failed to fetch strategy tags");
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      showMessage("error", "Failed to fetch strategy tags");
    } finally {
      setLoading(false);
    }
  };

  // Show message helper
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Add user to the form
  const addUserMultiplier = () => {
    if (!selectedUserId) {
      showMessage("error", "Please select a user");
      return;
    }

    // Check if user already added
    if (formData.userMultipliers[selectedUserId]) {
      showMessage("error", "User already added");
      return;
    }

    setFormData({
      ...formData,
      userMultipliers: {
        ...formData.userMultipliers,
        [selectedUserId]: parseFloat(multiplier) || 1,
      },
    });

    // Reset selection
    setSelectedUserId("");
    setMultiplier(1);
  };

  // Remove user from form
  const removeUserMultiplier = (userId) => {
    const newMultipliers = { ...formData.userMultipliers };
    delete newMultipliers[userId];
    setFormData({
      ...formData,
      userMultipliers: newMultipliers,
    });
  };

  // Update user multiplier
  const updateUserMultiplier = (userId, newMultiplier) => {
    setFormData({
      ...formData,
      userMultipliers: {
        ...formData.userMultipliers,
        [userId]: parseFloat(newMultiplier) || 1,
      },
    });
  };

  // Handle form submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tagName.trim()) {
      showMessage("error", "Tag name is required");
      return;
    }

    if (Object.keys(formData.userMultipliers).length === 0) {
      showMessage("error", "Please add at least one user with multiplier");
      return;
    }

    try {
      setLoading(true);
      const endpoint = editingTagId
        ? `${API_BASE_URL}/strategy-tags/update/${editingTagId}`
        : `${API_BASE_URL}/strategy-tags/create`;

      const method = editingTagId ? "PUT" : "POST";

      // Prepare global settings with default value for betterPriceLogicValue if empty
      const globalSettings = {
        ...formData.globalSettings,
        modifyOptions: {
          ...formData.globalSettings.modifyOptions,
          betterPriceLogicValue:
            formData.globalSettings.modifyOptions.betterPriceLogicValue === ""
              ? 0
              : parseFloat(
                  formData.globalSettings.modifyOptions.betterPriceLogicValue
                ) || 0,
        },
      };

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tagName: formData.tagName.trim(),
          description: formData.description.trim(),
          userMultipliers: formData.userMultipliers,
          globalSettings: globalSettings,
        }),
      });

      if (response.ok) {
        showMessage(
          "success",
          editingTagId
            ? "Strategy tag updated successfully"
            : "Strategy tag created successfully"
        );
        resetForm();
        fetchTags();
      } else {
        const errorData = await response.json().catch(() => ({}));
        showMessage("error", errorData.detail || "Failed to save strategy tag");
      }
    } catch (error) {
      console.error("Error saving tag:", error);
      showMessage("error", "Failed to save strategy tag");
    } finally {
      setLoading(false);
    }
  };

  // Start inline editing
  const startEdit = (tag) => {
    setInlineEditingTagId(tag.id);
    setInlineEditData({
      tagName: tag.tagName,
      description: tag.description || "",
      userMultipliers: tag.userMultipliers || {},
      globalSettings: tag.globalSettings || {
        marketOrdersAllowed: false,
        onOrderFailure: {
          retryAfter: 0,
          retryCount: 0,
          marketAtLast: false,
        },
        modifyOptions: {
          priceType: "LTP",
          depthIndex: 0,
          betterPriceLogicType: "None",
          betterPriceLogicValue: 0,
        },
      },
    });
  };

  // Cancel inline editing
  const cancelInlineEdit = () => {
    setInlineEditingTagId(null);
    setInlineEditData(null);
  };

  // Save inline edit
  const saveInlineEdit = async () => {
    if (!inlineEditData.tagName.trim()) {
      showMessage("error", "Tag name is required");
      return;
    }

    if (Object.keys(inlineEditData.userMultipliers).length === 0) {
      showMessage("error", "Please add at least one user with multiplier");
      return;
    }

    try {
      setLoading(true);
      const endpoint = `${API_BASE_URL}/strategy-tags/update/${inlineEditingTagId}`;

      const globalSettings = {
        ...inlineEditData.globalSettings,
        modifyOptions: {
          ...inlineEditData.globalSettings.modifyOptions,
          betterPriceLogicValue:
            inlineEditData.globalSettings.modifyOptions
              .betterPriceLogicValue === ""
              ? 0
              : parseFloat(
                  inlineEditData.globalSettings.modifyOptions
                    .betterPriceLogicValue
                ) || 0,
        },
      };

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tagName: inlineEditData.tagName.trim(),
          description: inlineEditData.description.trim(),
          userMultipliers: inlineEditData.userMultipliers,
          globalSettings: globalSettings,
        }),
      });

      if (response.ok) {
        showMessage("success", "Strategy tag updated successfully");
        cancelInlineEdit();
        fetchTags();
      } else {
        const errorData = await response.json().catch(() => ({}));
        showMessage(
          "error",
          errorData.detail || "Failed to update strategy tag"
        );
      }
    } catch (error) {
      console.error("Error updating tag:", error);
      showMessage("error", "Failed to update strategy tag");
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      tagName: "",
      description: "",
      userMultipliers: {},
      globalSettings: {
        marketOrdersAllowed: false,
        onOrderFailure: {
          retryAfter: 0,
          retryCount: 0,
          marketAtLast: false,
        },
        modifyOptions: {
          priceType: "LTP",
          depthIndex: 0,
          betterPriceLogicType: "None",
          betterPriceLogicValue: 0,
        },
      },
    });
    setEditingTagId(null);
    setSelectedUserId("");
    setMultiplier(1);
  };

  // Delete tag
  const deleteTag = async (tagId) => {
    if (!confirm("Are you sure you want to delete this strategy tag?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/strategy-tags/delete/${tagId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        showMessage("success", "Strategy tag deleted successfully");
        fetchTags();
      } else {
        showMessage("error", "Failed to delete strategy tag");
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
      showMessage("error", "Failed to delete strategy tag");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTags();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 md:p-4">
      <div className="max-w-[100rem] mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Strategy Tags Management
              </h1>
              <p className="text-[0.7rem] text-gray-600 dark:text-gray-400 mt-1">
                Create and manage strategy tags with user-specific multipliers
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchTags}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-[0.7rem] font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                🔄 Refresh
              </button>
              <div className="text-center">
                <div className="text-[0.7rem] text-gray-500 dark:text-gray-400">
                  Total Tags
                </div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {tags.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`p-4 rounded-lg border ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
            }`}
          >
            <p className="text-[0.7rem]">{message.text}</p>
          </div>
        )}

        {/* Create/Edit Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingTagId ? "Edit Strategy Tag" : "Create New Strategy Tag"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                      onClick={addUserMultiplier}
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
                        ([userId, multiplier]) => (
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
                                value={multiplier}
                                onChange={(e) =>
                                  updateUserMultiplier(userId, e.target.value)
                                }
                                step="0.1"
                                min="0"
                                className="w-24 px-2 py-1 text-[0.7rem] border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              />
                            </td>
                            <td className="p-2 text-right">
                              <button
                                type="button"
                                onClick={() => removeUserMultiplier(userId)}
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

            {/* Global Settings Section - Combined Card */}
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
                        value={
                          formData.globalSettings.onOrderFailure.retryAfter
                        }
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
                        value={
                          formData.globalSettings.onOrderFailure.retryCount
                        }
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
                      <label className="flex items-center gap-2">
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
                        Price Type
                      </label>
                      <select
                        value={formData.globalSettings.modifyOptions.priceType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            globalSettings: {
                              ...formData.globalSettings,
                              modifyOptions: {
                                ...formData.globalSettings.modifyOptions,
                                priceType: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-28 px-3 py-2 text-[0.7rem] border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      >
                        <option value="LTP">LTP</option>
                        <option value="BidAsk">BidAsk</option>
                        <option value="Depth">Depth</option>
                      </select>
                    </div>
                    {formData.globalSettings.modifyOptions.priceType ===
                      "Depth" && (
                      <div>
                        <label className="block text-[0.7rem] font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Depth Index
                        </label>
                        <select
                          value={
                            formData.globalSettings.modifyOptions.depthIndex
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              globalSettings: {
                                ...formData.globalSettings,
                                modifyOptions: {
                                  ...formData.globalSettings.modifyOptions,
                                  depthIndex: parseInt(e.target.value),
                                },
                              },
                            })
                          }
                          className="w-20 px-3 py-2 text-[0.7rem] border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        >
                          <option value={0}>0</option>
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                          <option value={4}>4</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-[0.7rem] font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Better Price Logic
                      </label>
                      <select
                        value={
                          formData.globalSettings.modifyOptions
                            .betterPriceLogicType
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
                        <option value="None">None</option>
                        <option value="Absolute">Absolute</option>
                        <option value="Percentage">Percentage</option>
                        <option value="Ticks">Ticks</option>
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
                {loading
                  ? "Saving..."
                  : editingTagId
                  ? "Update Tag"
                  : "Create Tag"}
              </button>
              {editingTagId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white text-[0.7rem] font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tags List Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Existing Strategy Tags
            </h2>
          </div>

          {loading && tags.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-[0.7rem] text-gray-600 dark:text-gray-400">
                Loading tags...
              </p>
            </div>
          ) : tags.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No strategy tags yet
              </h3>
              <p className="text-[0.7rem] text-gray-600 dark:text-gray-400">
                Create your first strategy tag using the form above
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-[0.7rem]">
                <thead>
                  <tr className="bg-gray-100/80 dark:bg-gray-700/80 border-b-2 border-gray-300 dark:border-gray-600">
                    <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">
                      Tag Name
                    </th>
                    <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">
                      Description
                    </th>
                    <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">
                      Users & Multipliers
                    </th>
                    <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">
                      Market Orders
                    </th>
                    <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">
                      Order Failure
                    </th>
                    <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">
                      Modify Options
                    </th>
                    <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">
                      Created
                    </th>
                    <th className="text-right p-2 font-semibold text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tags.map((tag) => {
                    const isEditing = inlineEditingTagId === tag.id;
                    const editData = isEditing ? inlineEditData : tag;

                    return (
                      <tr
                        key={tag.id}
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
                                setInlineEditData({
                                  ...inlineEditData,
                                  tagName: e.target.value,
                                })
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
                                setInlineEditData({
                                  ...inlineEditData,
                                  description: e.target.value,
                                })
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
                            {editData.userMultipliers &&
                            Object.keys(editData.userMultipliers).length > 0 ? (
                              Object.entries(editData.userMultipliers).map(
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
                                        onChange={(e) => {
                                          const newMultipliers = {
                                            ...inlineEditData.userMultipliers,
                                          };
                                          newMultipliers[userId] =
                                            parseFloat(e.target.value) || 0;
                                          setInlineEditData({
                                            ...inlineEditData,
                                            userMultipliers: newMultipliers,
                                          });
                                        }}
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
                          {editData.globalSettings && (
                            <>
                              {isEditing ? (
                                <label className="flex items-center gap-1">
                                  <input
                                    type="checkbox"
                                    checked={
                                      editData.globalSettings
                                        .marketOrdersAllowed
                                    }
                                    onChange={(e) =>
                                      setInlineEditData({
                                        ...inlineEditData,
                                        globalSettings: {
                                          ...inlineEditData.globalSettings,
                                          marketOrdersAllowed: e.target.checked,
                                        },
                                      })
                                    }
                                    className="w-3 h-3"
                                  />
                                  <span className="text-[0.7rem]">
                                    {editData.globalSettings.marketOrdersAllowed
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
                                  {tag.globalSettings.marketOrdersAllowed
                                    ? "✅ Yes"
                                    : "❌ No"}
                                </span>
                              )}
                            </>
                          )}
                        </td>

                        {/* Order Failure */}
                        <td className="p-2">
                          {editData.globalSettings && (
                            <>
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={
                                      editData.globalSettings.onOrderFailure
                                        .retryCount
                                    }
                                    onChange={(e) =>
                                      setInlineEditData({
                                        ...inlineEditData,
                                        globalSettings: {
                                          ...inlineEditData.globalSettings,
                                          onOrderFailure: {
                                            ...inlineEditData.globalSettings
                                              .onOrderFailure,
                                            retryCount:
                                              parseInt(e.target.value) || 0,
                                          },
                                        },
                                      })
                                    }
                                    min="0"
                                    className="w-12 px-1 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-[0.65rem]"
                                    placeholder="Count"
                                  />
                                  <span className="text-[0.65rem]">x @</span>
                                  <input
                                    type="number"
                                    value={
                                      editData.globalSettings.onOrderFailure
                                        .retryAfter
                                    }
                                    onChange={(e) =>
                                      setInlineEditData({
                                        ...inlineEditData,
                                        globalSettings: {
                                          ...inlineEditData.globalSettings,
                                          onOrderFailure: {
                                            ...inlineEditData.globalSettings
                                              .onOrderFailure,
                                            retryAfter:
                                              parseFloat(e.target.value) || 0,
                                          },
                                        },
                                      })
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
                                  {tag.globalSettings.onOrderFailure
                                    ?.retryCount || 0}
                                  x @{" "}
                                  {tag.globalSettings.onOrderFailure
                                    ?.retryAfter || 0}
                                  s
                                </span>
                              )}
                            </>
                          )}
                        </td>

                        {/* Modify Options */}
                        <td className="p-2">
                          {editData.globalSettings && (
                            <>
                              {isEditing ? (
                                <div className="space-y-1">
                                  <select
                                    value={
                                      editData.globalSettings.modifyOptions
                                        .priceType
                                    }
                                    onChange={(e) =>
                                      setInlineEditData({
                                        ...inlineEditData,
                                        globalSettings: {
                                          ...inlineEditData.globalSettings,
                                          modifyOptions: {
                                            ...inlineEditData.globalSettings
                                              .modifyOptions,
                                            priceType: e.target.value,
                                          },
                                        },
                                      })
                                    }
                                    className="w-full px-1 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-[0.65rem]"
                                  >
                                    <option value="LTP">LTP</option>
                                    <option value="BidAsk">BidAsk</option>
                                    <option value="Depth">Depth</option>
                                  </select>
                                  <select
                                    value={
                                      editData.globalSettings.modifyOptions
                                        .betterPriceLogicType
                                    }
                                    onChange={(e) =>
                                      setInlineEditData({
                                        ...inlineEditData,
                                        globalSettings: {
                                          ...inlineEditData.globalSettings,
                                          modifyOptions: {
                                            ...inlineEditData.globalSettings
                                              .modifyOptions,
                                            betterPriceLogicType:
                                              e.target.value,
                                          },
                                        },
                                      })
                                    }
                                    className="w-full px-1 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-[0.65rem]"
                                  >
                                    <option value="None">None</option>
                                    <option value="Absolute">Absolute</option>
                                    <option value="Percentage">
                                      Percentage
                                    </option>
                                    <option value="Ticks">Ticks</option>
                                  </select>
                                </div>
                              ) : (
                                <span className="text-gray-700 dark:text-gray-300">
                                  {tag.globalSettings.modifyOptions
                                    ?.priceType || "LTP"}{" "}
                                  |{" "}
                                  {tag.globalSettings.modifyOptions
                                    ?.betterPriceLogicType || "None"}
                                </span>
                              )}
                            </>
                          )}
                        </td>

                        {/* Created */}
                        <td className="p-2 text-gray-600 dark:text-gray-400">
                          {tag.createdAt
                            ? new Date(tag.createdAt).toLocaleDateString()
                            : "-"}
                        </td>

                        {/* Actions */}
                        <td className="p-2">
                          <div className="flex gap-1 justify-end">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={saveInlineEdit}
                                  disabled={loading}
                                  className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-[0.7rem] font-medium rounded transition-colors disabled:opacity-50"
                                  title="Save"
                                >
                                  💾 Save
                                </button>
                                <button
                                  onClick={cancelInlineEdit}
                                  className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white text-[0.7rem] font-medium rounded transition-colors"
                                  title="Cancel"
                                >
                                  ✖️
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEdit(tag)}
                                  className="px-2 py-1 bg-blue-500/90 hover:bg-blue-600 text-white text-[0.7rem] font-medium rounded transition-colors"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => deleteTag(tag.id)}
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
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrategyTags;
