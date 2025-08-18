import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setUsers(JSON.parse(localStorage.getItem("users")) || []);
  }, []);

  const handleLogin = (user) => {
    console.log("Login for:", user); // Hook your token logic here
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User List</h1>
          <Link
            to="/add"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add User
          </Link>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-4 space-y-4">
          {users.length === 0 ? (
            <p className="text-gray-500">No users added yet.</p>
          ) : (
            users.map((user, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <p className="font-semibold">{user.here_user_id}</p>
                  <p className="text-sm text-gray-500">{user.apikey}</p>
                </div>
                <button
                  onClick={() => handleLogin(user)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Login
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
