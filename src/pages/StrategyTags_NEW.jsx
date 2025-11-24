import React, { useState, useEffect } from "react";
import config from "../config/api";
import {
  fetchUsers as apiFetchUsers,
  fetchTags as apiFetchTags,
  createTag as apiCreateTag,
  updateTag as apiUpdateTag,
  deleteTag as apiDeleteTag,
} from "./StrategyTagsFunctions";
import {
  getInitialFormData,
  prepareGlobalSettings,
  prepareTagData,
  validateFormData,
} from "./StrategyTagsFunctions";
import {
  StrategyTagsHeader,
  MessageAlert,
  TagsTable,
  CreateTagForm,
} from "../components/strategyTagComponents";

const StrategyTags = () => {
  const [tags, setTags] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [userInfoMap, setUserInfoMap] = useState({});

  // Form state
  const [formData, setFormData] = useState(getInitialFormData());
  const [editingTagId, setEditingTagId] = useState(null);

  // Inline editing state
  const [inlineEditingTagId, setInlineEditingTagId] = useState(null);
  const [inlineEditData, setInlineEditData] = useState(null);

  // User selection state
  const [selectedUserId, setSelectedUserId] = useState("");
  const [multiplier, setMultiplier] = useState(1);

  // Show message helper
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Fetch all users
  const fetchUsers = async () => {
    const result = await apiFetchUsers();
    if (result) {
      setUsers(result.users);
      setUserInfoMap(result.userInfoMap);
    }
  };

  // Fetch all strategy tags
  const fetchTags = async () => {
    setLoading(true);
    const result = await apiFetchTags();
    if (result.success) {
      setTags(result.data);
    } else {
      showMessage("error", "Failed to fetch strategy tags");
    }
    setLoading(false);
  };

  // Add user to the form
  const addUserMultiplier = () => {
    if (!selectedUserId) {
      showMessage("error", "Please select a user");
      return;
    }

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

    setSelectedUserId("");
    setMultiplier(1);
  };

  // Remove user from form
  const removeUserMultiplier = (userId) => {
    const newMultipliers = { ...formData.userMultipliers };
    delete newMultipliers[userId];
    setFormData({ ...formData, userMultipliers: newMultipliers });
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

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateFormData(formData);
    if (errors.length > 0) {
      showMessage("error", errors[0]);
      return;
    }

    setLoading(true);
    const tagData = prepareTagData(formData);

    let result;
    if (editingTagId) {
      result = await apiUpdateTag(editingTagId, tagData);
    } else {
      result = await apiCreateTag(tagData);
    }

    if (result.success) {
      showMessage(
        "success",
        editingTagId
          ? "Strategy tag updated successfully"
          : "Strategy tag created successfully"
      );
      resetForm();
      fetchTags();
    } else {
      showMessage("error", result.message || "Failed to save strategy tag");
    }
    setLoading(false);
  };

  // Start inline editing
  const startInlineEdit = (tag) => {
    setInlineEditingTagId(tag.id);
    setInlineEditData({
      tagName: tag.tagName,
      description: tag.description || "",
      userMultipliers: tag.userMultipliers || {},
      globalSettings: tag.globalSettings || getInitialFormData().globalSettings,
    });
  };

  // Cancel inline editing
  const cancelInlineEdit = () => {
    setInlineEditingTagId(null);
    setInlineEditData(null);
  };

  // Save inline edit
  const saveInlineEdit = async () => {
    const errors = validateFormData(inlineEditData);
    if (errors.length > 0) {
      showMessage("error", errors[0]);
      return;
    }

    setLoading(true);
    const tagData = prepareTagData(inlineEditData);
    const result = await apiUpdateTag(inlineEditingTagId, tagData);

    if (result.success) {
      showMessage("success", "Strategy tag updated successfully");
      cancelInlineEdit();
      fetchTags();
    } else {
      showMessage("error", result.message || "Failed to update strategy tag");
    }
    setLoading(false);
  };

  // Delete tag
  const deleteTag = async (tagId) => {
    if (!confirm("Are you sure you want to delete this strategy tag?")) {
      return;
    }

    setLoading(true);
    const result = await apiDeleteTag(tagId);

    if (result.success) {
      showMessage("success", "Strategy tag deleted successfully");
      fetchTags();
    } else {
      showMessage("error", "Failed to delete strategy tag");
    }
    setLoading(false);
  };

  // Cancel editing
  const cancelEdit = () => {
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setFormData(getInitialFormData());
    setEditingTagId(null);
    setSelectedUserId("");
    setMultiplier(1);
  };

  useEffect(() => {
    fetchUsers();
    fetchTags();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 md:p-4">
      <div className="max-w-[100rem] mx-auto space-y-4">
        {/* Header */}
        <StrategyTagsHeader
          tags={tags}
          loading={loading}
          onRefresh={fetchTags}
        />

        {/* Message */}
        <MessageAlert message={message} />

        {/* Create/Edit Form */}
        <CreateTagForm
          formData={formData}
          setFormData={setFormData}
          users={users}
          userInfoMap={userInfoMap}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
          multiplier={multiplier}
          setMultiplier={setMultiplier}
          onAddUserMultiplier={addUserMultiplier}
          onUpdateUserMultiplier={updateUserMultiplier}
          onRemoveUserMultiplier={removeUserMultiplier}
          onSubmit={handleSubmit}
          onCancelEdit={cancelEdit}
          editingTagId={editingTagId}
          loading={loading}
        />

        {/* Tags List Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Existing Strategy Tags
            </h2>
          </div>

          <TagsTable
            tags={tags}
            loading={loading}
            inlineEditingTagId={inlineEditingTagId}
            inlineEditData={inlineEditData}
            userInfoMap={userInfoMap}
            onStartEdit={startInlineEdit}
            onSaveEdit={saveInlineEdit}
            onCancelEdit={cancelInlineEdit}
            onDelete={deleteTag}
            onUpdateEditData={setInlineEditData}
          />
        </div>
      </div>
    </div>
  );
};

export default StrategyTags;
