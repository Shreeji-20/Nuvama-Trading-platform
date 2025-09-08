import { data } from "autoprefixer";
import React, { useState, useEffect } from "react";
import config from "../config/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    apikey: "",
    apisecret: "",
    password: "",
    totp_secret: "",
    userid: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loginStatus, setLoginStatus] = useState({});
  const [loginProgress, setLoginProgress] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({ type: "", text: "" });

  const [saveIndex, setSaveIndex] = useState(null);

  useEffect(() => {
    if (saveIndex !== null) {
      saveEdit(saveIndex);
      setSaveIndex(null); // reset
    }
  }, [users]);
  // Fetch users from API on load
  useEffect(() => {
    fetch(config.buildUrl(config.ENDPOINTS.USERS))
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error("Invalid user data from API");
        }
      })
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const addUser = () => {
    if (!form.apikey || !form.apisecret || !form.userid || !form.password)
      return;

    fetch(config.buildUrl(config.ENDPOINTS.USER), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then(() => {
        setUsers([...users, { ...form, lastLogin: null }]);
        setForm({
          apikey: "",
          apisecret: "",
          password: "",
          totp_secret: "",
          userid: "",
        });
        setMessage({ type: "success", text: "User added successfully!" });
      })
      .catch(() => setMessage({ type: "error", text: "Failed to add user!" }));
  };

  const handleEditChange = (e, index) => {
    const updatedUsers = [...users];
    updatedUsers[index][e.target.name] = e.target.value;
    setUsers(updatedUsers);
  };

  const saveEdit = (index) => {
    const updatedUser = users[index];
    fetch(config.buildUrl(config.ENDPOINTS.USER), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    })
      .then((res) => res.json())
      .then(() => {
        setEditIndex(null);
        setMessage({ type: "success", text: "User updated successfully!" });
      })
      .catch(() =>
        setMessage({ type: "error", text: "Failed to update user!" })
      );
  };

  const handleLogin = (index) => {
    if (!users[index].password)
      return setMessage({ type: "warning", text: "Password is Empty !" });

    const user = users[index];
    const userId = user.userid;

    // Initialize login status
    setLoginStatus({
      ...loginStatus,
      [userId]: "starting",
    });

    setLoginProgress({
      ...loginProgress,
      [userId]: {
        step: "initializing",
        message: "🚀 Starting login process...",
        timestamp: new Date().toLocaleTimeString(),
      },
    });

    setMessage({ type: "info", text: `Starting login for ${userId}...` });

    fetch(config.buildUrl(config.ENDPOINTS.USERLOGIN), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    })
      .then((res) => {
        // Update progress
        setLoginProgress({
          ...loginProgress,
          [userId]: {
            step: "web_login",
            message: "🔐 Processing web login...",
            timestamp: new Date().toLocaleTimeString(),
          },
        });

        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(errorData.message || "Login Failed");
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log("Login response:", data);

        if (data.status === "success") {
          // Update progress through steps
          if (data.steps) {
            data.steps.forEach((step, stepIndex) => {
              setTimeout(() => {
                setLoginProgress({
                  ...loginProgress,
                  [userId]: {
                    step: step.step,
                    message: `✅ ${step.message}`,
                    timestamp: new Date().toLocaleTimeString(),
                  },
                });
              }, stepIndex * 1000);
            });
          }

          // Final success update
          setTimeout(() => {
            const updatedUsers = [...users];
            updatedUsers[index].lastLogin = new Date().toLocaleString();
            setUsers(updatedUsers);
            setSaveIndex(index);

            setLoginStatus({
              ...loginStatus,
              [userId]: "success",
            });

            setLoginProgress({
              ...loginProgress,
              [userId]: {
                step: "completed",
                message: "🎉 Login completed successfully!",
                timestamp: new Date().toLocaleTimeString(),
              },
            });

            setMessage({
              type: "success",
              text: `Login successful for ${userId}!`,
            });

            // Clear progress after 5 seconds
            setTimeout(() => {
              setLoginProgress((prev) => {
                const newProgress = { ...prev };
                delete newProgress[userId];
                return newProgress;
              });
              setLoginStatus((prev) => {
                const newStatus = { ...prev };
                delete newStatus[userId];
                return newStatus;
              });
            }, 5000);
          }, (data.steps?.length || 1) * 1000);
        } else {
          throw new Error(data.message || "Login failed!");
        }
      })
      .catch((error) => {
        console.error("Login error:", error);

        setLoginStatus({
          ...loginStatus,
          [userId]: "error",
        });

        setLoginProgress({
          ...loginProgress,
          [userId]: {
            step: "error",
            message: `❌ ${error.message}`,
            timestamp: new Date().toLocaleTimeString(),
          },
        });

        setMessage({
          type: "error",
          text: `Login failed for ${userId}: ${error.message}`,
        });

        // Clear error status after 10 seconds
        setTimeout(() => {
          setLoginProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[userId];
            return newProgress;
          });
          setLoginStatus((prev) => {
            const newStatus = { ...prev };
            delete newStatus[userId];
            return newStatus;
          });
        }, 10000);
      });
  };

  const deleteUser = (index) => {
    const userId = users[index].userid;

    if (!window.confirm(`Are you sure you want to delete user ${userId}?`)) {
      return;
    }

    fetch(config.buildUrl(config.ENDPOINTS.DELETEUSER), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(users[index]),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete user");
        setUsers(users.filter((_, i) => i !== index));
        setMessage({ type: "success", text: "User deleted successfully!" });
      })
      .catch(() =>
        setMessage({ type: "error", text: "Failed to delete user!" })
      );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel"
      ) {
        setSelectedFile(file);
        setUploadStatus({ type: "", text: "" });
      } else {
        setUploadStatus({
          type: "error",
          text: "Please select a valid Excel file (.xlsx or .xls)",
        });
        setSelectedFile(null);
      }
    }
  };

  const uploadExcelFile = () => {
    if (!selectedFile) {
      setUploadStatus({
        type: "error",
        text: "Please select an Excel file first",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setUploadStatus({ type: "info", text: "Uploading Excel file..." });

    fetch(config.buildUrl("/upload-excel"), {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          throw new Error(data.message || "Upload failed");
        }
        setUploadStatus({
          type: "success",
          text: `Excel file uploaded successfully! ${data.count} entries stored in Redis.`,
        });
        setSelectedFile(null);
        // Reset the file input
        const fileInput = document.getElementById("excel-file-input");
        if (fileInput) fileInput.value = "";
      })
      .catch((error) => {
        setUploadStatus({
          type: "error",
          text: `Upload failed: ${error.message}`,
        });
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-dark-gradient p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border p-6 md:p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-600 dark:bg-dark-accent rounded-xl p-3">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary">
                User Management
              </h1>
              <p className="text-gray-600 dark:text-dark-text-secondary mt-1">
                Manage Nuvama API users and their credentials
              </p>
            </div>
          </div>
        </div>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                : message.type === "warning"
                ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                : message.type === "info"
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === "success" && (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {message.type === "warning" && (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {message.type === "info" && (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {message.type === "error" && (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {message.text}
            </div>
          </div>
        )}

        {/* Add User Form */}
        <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border p-6 md:p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-6 flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 dark:bg-dark-accent rounded-full"></div>
            Add New User
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Nuvama User ID
              </label>
              <input
                type="text"
                name="userid"
                value={form.userid}
                onChange={handleChange}
                placeholder="Enter user ID"
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                TOTP Secret
              </label>
              <input
                type="password"
                name="totp_secret"
                value={form.totp_secret}
                onChange={handleChange}
                placeholder="Enter TOTP secret"
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                API Key
              </label>
              <input
                type="text"
                name="apikey"
                value={form.apikey}
                onChange={handleChange}
                placeholder="Enter API key"
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                API Secret
              </label>
              <input
                type="text"
                name="apisecret"
                value={form.apisecret}
                onChange={handleChange}
                placeholder="Enter API secret"
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-3 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent focus:border-blue-500 dark:focus:border-dark-accent transition-colors duration-200"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={addUser}
              className="bg-blue-600 dark:bg-dark-accent hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add User
            </button>
          </div>
        </div>

        {/* User List */}
        <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border">
          <div className="p-6 md:p-8 border-b border-gray-200 dark:border-dark-border">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full"></div>
              User List ({users.length})
            </h3>
          </div>

          {users.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-400 dark:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No users added yet
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                Add your first Nuvama API user to get started
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-dark-border">
                      <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-dark-text-secondary">
                        User ID
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-dark-text-secondary">
                        Password
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-dark-text-secondary">
                        TOTP Secret
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-dark-text-secondary">
                        API Key
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-dark-text-secondary">
                        API Secret
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-dark-text-secondary">
                        Last Login
                      </th>
                      <th className="text-center p-4 text-sm font-semibold text-gray-700 dark:text-dark-text-secondary">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-200"
                      >
                        <td className="p-4">
                          {editIndex === index ? (
                            <input
                              type="text"
                              name="userid"
                              value={user.userid}
                              onChange={(e) => handleEditChange(e, index)}
                              className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent"
                            />
                          ) : (
                            <span className="text-gray-900 dark:text-dark-text-primary font-medium">
                              {user.userid}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {editIndex === index ? (
                            <input
                              type="password"
                              name="password"
                              value={user.password || ""}
                              onChange={(e) => handleEditChange(e, index)}
                              className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent"
                              placeholder="Enter password"
                            />
                          ) : (
                            <span className="text-gray-700 dark:text-dark-text-secondary font-mono text-sm">
                              {user.password ? "•".repeat(8) : "-"}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {editIndex === index ? (
                            <input
                              type="password"
                              name="totp_secret"
                              value={user.totp_secret || ""}
                              onChange={(e) => handleEditChange(e, index)}
                              className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent"
                              placeholder="Enter TOTP secret"
                            />
                          ) : (
                            <span className="text-gray-700 dark:text-dark-text-secondary font-mono text-sm">
                              {user.totp_secret ? "•".repeat(12) : "-"}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {editIndex === index ? (
                            <input
                              type="text"
                              name="apikey"
                              value={user.apikey}
                              onChange={(e) => handleEditChange(e, index)}
                              className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent"
                            />
                          ) : (
                            <span className="text-gray-700 dark:text-dark-text-secondary font-mono text-sm">
                              {user.apikey}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {editIndex === index ? (
                            <input
                              type="text"
                              name="apisecret"
                              value={user.apisecret}
                              onChange={(e) => handleEditChange(e, index)}
                              className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent"
                            />
                          ) : (
                            <span className="text-gray-700 dark:text-dark-text-secondary font-mono text-sm">
                              {"•".repeat(Math.min(user.apisecret.length, 12))}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="text-gray-700 dark:text-dark-text-secondary text-sm">
                            {user.lastLogin ? (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                {user.lastLogin}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                Never
                              </div>
                            )}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 justify-center">
                            {editIndex === index ? (
                              <button
                                onClick={() => saveEdit(index)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Save
                              </button>
                            ) : (
                              <button
                                onClick={() => setEditIndex(index)}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                Edit
                              </button>
                            )}
                            <button
                              onClick={() => handleLogin(index)}
                              disabled={loginStatus[user.userid] === "starting"}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${
                                loginStatus[user.userid] === "starting"
                                  ? "bg-gray-400 cursor-not-allowed text-white"
                                  : loginStatus[user.userid] === "success"
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : loginStatus[user.userid] === "error"
                                  ? "bg-red-600 hover:bg-red-700 text-white"
                                  : "bg-blue-600 dark:bg-dark-accent hover:bg-blue-700 dark:hover:bg-blue-600 text-white"
                              }`}
                            >
                              {loginStatus[user.userid] === "starting" ? (
                                <>
                                  <svg
                                    className="w-4 h-4 animate-spin"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                  </svg>
                                  Logging in...
                                </>
                              ) : loginStatus[user.userid] === "success" ? (
                                <>
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  Success
                                </>
                              ) : loginStatus[user.userid] === "error" ? (
                                <>
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                  Retry
                                </>
                              ) : (
                                <>
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                    />
                                  </svg>
                                  Login
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => deleteUser(index)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden p-4 space-y-4">
                {users.map((user, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 border border-gray-200 dark:border-dark-border"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-blue-600 dark:text-blue-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-dark-text-primary">
                              {user.userid}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.lastLogin
                                ? `Last login: ${user.lastLogin}`
                                : "Never logged in"}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-dark-text-secondary">
                              API Key:
                            </span>
                            <span className="font-mono text-gray-900 dark:text-dark-text-primary">
                              {user.apikey.substring(0, 8)}...
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-dark-text-secondary">
                              Password:
                            </span>
                            <span className="text-gray-900 dark:text-dark-text-primary">
                              {user.password ? "•".repeat(8) : "-"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-dark-text-secondary">
                              TOTP Secret:
                            </span>
                            <span className="text-gray-900 dark:text-dark-text-primary">
                              {user.totp_secret ? "•".repeat(8) : "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {editIndex === index ? (
                      <div className="space-y-3 mb-4">
                        <input
                          type="text"
                          name="userid"
                          value={user.userid}
                          onChange={(e) => handleEditChange(e, index)}
                          className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                          placeholder="User ID"
                        />
                        <input
                          type="password"
                          name="password"
                          value={user.password || ""}
                          onChange={(e) => handleEditChange(e, index)}
                          className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                          placeholder="Password"
                        />
                        <input
                          type="password"
                          name="totp_secret"
                          value={user.totp_secret || ""}
                          onChange={(e) => handleEditChange(e, index)}
                          className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                          placeholder="TOTP Secret"
                        />
                        <input
                          type="text"
                          name="apikey"
                          value={user.apikey}
                          onChange={(e) => handleEditChange(e, index)}
                          className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                          placeholder="API Key"
                        />
                        <input
                          type="text"
                          name="apisecret"
                          value={user.apisecret}
                          onChange={(e) => handleEditChange(e, index)}
                          className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                          placeholder="API Secret"
                        />
                      </div>
                    ) : null}

                    <div className="flex flex-col sm:flex-row gap-2">
                      {editIndex === index ? (
                        <button
                          onClick={() => saveEdit(index)}
                          className="flex-1 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditIndex(index)}
                          className="flex-1 px-3 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleLogin(index)}
                        disabled={loginStatus[user.userid] === "starting"}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 ${
                          loginStatus[user.userid] === "starting"
                            ? "bg-gray-400 cursor-not-allowed text-white"
                            : loginStatus[user.userid] === "success"
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : loginStatus[user.userid] === "error"
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-blue-600 dark:bg-dark-accent hover:bg-blue-700 dark:hover:bg-blue-600 text-white"
                        }`}
                      >
                        {loginStatus[user.userid] === "starting" ? (
                          <>
                            <svg
                              className="w-4 h-4 animate-spin"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            Logging in...
                          </>
                        ) : loginStatus[user.userid] === "success" ? (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Success
                          </>
                        ) : loginStatus[user.userid] === "error" ? (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            Retry
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"
                              />
                            </svg>
                            Login
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => deleteUser(index)}
                        className="flex-1 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        {/* Excel Upload Section */}
        <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border p-6 md:p-8 mt-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-6 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full"></div>
            Upload Excel File
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Select Excel File (Column A will be stored in Redis)
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="excel-file-input"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30 file:cursor-pointer border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface"
                />
                <button
                  onClick={uploadExcelFile}
                  disabled={!selectedFile}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 ${
                    selectedFile
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Upload
                </button>
              </div>
            </div>

            {selectedFile && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm text-blue-700 dark:text-blue-400">
                    Selected: {selectedFile.name} (
                    {(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </div>
            )}

            {uploadStatus.text && (
              <div
                className={`p-4 rounded-lg border ${
                  uploadStatus.type === "success"
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                    : uploadStatus.type === "info"
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  {uploadStatus.type === "success" && (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {uploadStatus.type === "info" && (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {uploadStatus.type === "error" && (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {uploadStatus.text}
                </div>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-dark-text-primary mb-2">
                Instructions:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Upload an Excel file (.xlsx or .xls format)</li>
                <li>• Only data from Column A will be read and stored</li>
                <li>• Data will be stored in Redis as a list</li>
                <li>• Empty cells in Column A will be skipped</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Login Progress Display */}
        {Object.keys(loginProgress).length > 0 && (
          <div className="bg-white dark:bg-dark-card-gradient rounded-xl shadow-lg dark:shadow-dark-xl border border-gray-200 dark:border-dark-border mt-8">
            <div className="p-6 md:p-8 border-b border-gray-200 dark:border-dark-border">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
                Login Progress
              </h3>
            </div>
            <div className="p-6 md:p-8">
              <div className="space-y-4">
                {Object.entries(loginProgress).map(([userId, progress]) => (
                  <div
                    key={userId}
                    className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-blue-600 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-dark-text-primary">
                            User: {userId}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Step: {progress.step}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {progress.timestamp}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {loginStatus[userId] === "starting" && (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      )}
                      <p
                        className={`text-sm font-medium ${
                          progress.step === "error"
                            ? "text-red-600 dark:text-red-400"
                            : progress.step === "completed"
                            ? "text-green-600 dark:text-green-400"
                            : "text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {progress.message}
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            progress.step === "error"
                              ? "bg-red-500"
                              : progress.step === "completed"
                              ? "bg-green-500"
                              : progress.step === "web_login"
                              ? "bg-blue-500"
                              : "bg-blue-300"
                          }`}
                          style={{
                            width:
                              progress.step === "initializing"
                                ? "20%"
                                : progress.step === "web_login"
                                ? "50%"
                                : progress.step === "completed"
                                ? "100%"
                                : progress.step === "error"
                                ? "100%"
                                : "30%",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
