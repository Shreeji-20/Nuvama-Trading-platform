import { data } from "autoprefixer";
import React, { useState, useEffect } from "react";

// base URLs (development / production)
const DEV_BASE_URL = "http://localhost:8000";
const PROD_BASE_URL = "https://api.example.com"; // replace with real prod URL

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    apikey: "",
    apisecret: "",
    reqid: "",
    userid: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [saveIndex, setSaveIndex] = useState(null);

  useEffect(() => {
    if (saveIndex !== null) {
      saveEdit(saveIndex);
      setSaveIndex(null); // reset
    }
  }, [users]);
  // Fetch users from API on load
  useEffect(() => {
    fetch(`${DEV_BASE_URL}/users`)
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
    if (!form.apikey || !form.apisecret || !form.userid) return;

    fetch(`${DEV_BASE_URL}/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then(() => {
        setUsers([...users, { ...form, lastLogin: null }]);
        setForm({ apikey: "", apisecret: "", reqid: "", userid: "" });
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
    fetch(`${DEV_BASE_URL}/user`, {
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
    if (!users[index].reqid)
      return setMessage({ type: "warning", text: "Req ID is Empty !" });
    const user = users[index];
    fetch(`${DEV_BASE_URL}/userlogin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Login Failed");
        return res;
      })
      .then((data) => {
        console.log(data);
        if (data.ok) {
          const updatedUsers = [...users];
          updatedUsers[index].lastLogin = new Date().toLocaleString();
          setUsers(updatedUsers);
          setSaveIndex(index);
          setMessage({
            type: "success",
            text: "Login successful!",
          });
          // saveEdit(updatedUsers);
          // updatedUsers[index].reqid = "";
        } else {
          console.log("here ");
          setMessage({ type: "error", text: data.message || "Login failed!" });
        }
      })
      .catch(() => setMessage({ type: "error", text: "Failed to login!" }));
  };

  const deleteUser = (index) => {
    const userId = users[index].userid;

    if (!window.confirm(`Are you sure you want to delete user ${userId}?`)) {
      return;
    }

    fetch(`${DEV_BASE_URL}/deleteuser`, {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Request ID
              </label>
              <input
                type="text"
                name="reqid"
                value={form.reqid}
                onChange={handleChange}
                placeholder="Enter request ID"
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
                        API Key
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-dark-text-secondary">
                        API Secret
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-dark-text-secondary">
                        Request ID
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
                          {editIndex === index ? (
                            <input
                              type="text"
                              name="reqid"
                              value={user.reqid}
                              onChange={(e) => handleEditChange(e, index)}
                              className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-accent"
                            />
                          ) : (
                            <span className="text-gray-700 dark:text-dark-text-secondary">
                              {user.reqid || "-"}
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
                              className="bg-blue-600 dark:bg-dark-accent hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-1"
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
                                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                />
                              </svg>
                              Login
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
                              Request ID:
                            </span>
                            <span className="text-gray-900 dark:text-dark-text-primary">
                              {user.reqid || "-"}
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
                        <input
                          type="text"
                          name="reqid"
                          value={user.reqid}
                          onChange={(e) => handleEditChange(e, index)}
                          className="w-full border border-gray-300 dark:border-dark-border rounded-lg p-2 text-sm bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary"
                          placeholder="Request ID"
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
                        className="flex-1 px-3 py-2 rounded-lg bg-blue-600 dark:bg-dark-accent hover:bg-blue-700 dark:hover:bg-blue-600 text-white text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
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
                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"
                          />
                        </svg>
                        Login
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
      </div>
    </div>
  );
}
