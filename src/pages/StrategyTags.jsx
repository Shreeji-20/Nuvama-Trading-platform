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
    userMultipliers: {}, // Dictionary of userId: multiplier
  });

  // Editing state
  const [editingTagId, setEditingTagId] = useState(null);

  // User selection state
  const [selectedUserId, setSelectedUserId] = useState("");
  const [multiplier, setMultiplier] = useState(1);

  // Helper to get user info for display
  const [userInfoMap, setUserInfoMap] = useState({}); // userId -> username mapping

  const API_BASE_URL = "http://localhost:8000";

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

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tagName: formData.tagName.trim(),
          description: formData.description.trim(),
          userMultipliers: formData.userMultipliers,
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

  // Start editing a tag
  const startEdit = (tag) => {
    setEditingTagId(tag.id);
    setFormData({
      tagName: tag.tagName,
      description: tag.description || "",
      userMultipliers: tag.userMultipliers || {},
    });
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
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                Strategy Tags Management
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Create and manage strategy tags with user-specific multipliers
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchTags}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                🔄 Refresh
              </button>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
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
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        {/* Create/Edit Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h2 className="text-md font-semibold text-gray-900 dark:text-white">
              {editingTagId ? "Edit Strategy Tag" : "Create New Strategy Tag"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tag Name and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tag Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tagName}
                  onChange={(e) =>
                    setFormData({ ...formData, tagName: e.target.value })
                  }
                  placeholder="e.g., Conservative, Aggressive"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional description"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* User Selection */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                User Multipliers <span className="text-red-500">*</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select User
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addUserMultiplier}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
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
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Added Users ({Object.keys(formData.userMultipliers).length})
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
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
                                className="w-24 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              />
                            </td>
                            <td className="p-2 text-right">
                              <button
                                type="button"
                                onClick={() => removeUserMultiplier(userId)}
                                className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors"
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

            {/* Form Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
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
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
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
            <h2 className="text-md font-semibold text-gray-900 dark:text-white">
              Existing Strategy Tags
            </h2>
          </div>

          {loading && tags.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
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
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create your first strategy tag using the form above
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                    <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">
                      Tag Name
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">
                      Description
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">
                      Users & Multipliers
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">
                      Created
                    </th>
                    <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tags.map((tag) => (
                    <tr
                      key={tag.id}
                      className="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="p-3">
                        <span className="inline-flex px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded">
                          {tag.tagName}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-400">
                        {tag.description || "-"}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {tag.userMultipliers &&
                          Object.keys(tag.userMultipliers).length > 0 ? (
                            Object.entries(tag.userMultipliers).map(
                              ([userId, multiplier]) => (
                                <span
                                  key={userId}
                                  className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded"
                                >
                                  {userInfoMap[userId] || userId}: {multiplier}x
                                </span>
                              )
                            )
                          ) : (
                            <span className="text-gray-500">No users</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-400">
                        {tag.createdAt
                          ? new Date(tag.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEdit(tag)}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteTag(tag.id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
