import config from "../../config/api";

/**
 * Fetch all users from the API
 */
export const fetchUsers = async () => {
  try {
    const response = await fetch(config.buildUrl(config.ENDPOINTS.USERS));
    if (response.ok) {
      const usersData = await response.json();
      const usersArray = Array.isArray(usersData) ? usersData : [];

      // Build userId -> username map
      const userMap = {};
      usersArray.forEach((user) => {
        const userId = String(user.userid || user.id);
        const username = user.username || user.userid || user.id;
        userMap[userId] = username;
      });

      return { users: usersArray, userInfoMap: userMap };
    } else {
      console.error("Error fetching users");
      return { users: [], userInfoMap: {} };
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return { users: [], userInfoMap: {} };
  }
};

/**
 * Fetch all strategy tags from the API
 */
export const fetchTags = async (API_BASE_URL) => {
  try {
    const response = await fetch(`${API_BASE_URL}/strategy-tags/list`);
    if (response.ok) {
      const data = await response.json();
      return { success: true, data: Array.isArray(data) ? data : [] };
    } else {
      return { success: false, error: "Failed to fetch strategy tags" };
    }
  } catch (error) {
    console.error("Error fetching tags:", error);
    return { success: false, error: "Failed to fetch strategy tags" };
  }
};

/**
 * Create a new strategy tag
 */
export const createTag = async (API_BASE_URL, tagData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/strategy-tags/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tagData),
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.detail || "Failed to create strategy tag",
      };
    }
  } catch (error) {
    console.error("Error creating tag:", error);
    return { success: false, error: "Failed to create strategy tag" };
  }
};

/**
 * Update an existing strategy tag
 */
export const updateTag = async (API_BASE_URL, tagId, tagData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/strategy-tags/update/${tagId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tagData),
      }
    );

    if (response.ok) {
      return { success: true };
    } else {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.detail || "Failed to update strategy tag",
      };
    }
  } catch (error) {
    console.error("Error updating tag:", error);
    return { success: false, error: "Failed to update strategy tag" };
  }
};

/**
 * Delete a strategy tag
 */
export const deleteTag = async (API_BASE_URL, tagId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/strategy-tags/delete/${tagId}`,
      {
        method: "DELETE",
      }
    );

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: "Failed to delete strategy tag" };
    }
  } catch (error) {
    console.error("Error deleting tag:", error);
    return { success: false, error: "Failed to delete strategy tag" };
  }
};
