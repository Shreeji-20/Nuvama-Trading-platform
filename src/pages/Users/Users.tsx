import { ReactTable } from "../table";
import { useState, useEffect } from "react";

import {
  getChangedKeys,
  isAnyDefault,
  isRowExists,
  shallowEqual,
  unChangedKeys,
} from "../../hooks/commonFunctions";

import { ToastContainer, useToast } from "../../components/Toast";
import {
  createUser,
  updateUser,
  fetchUsers,
  deleteUser,
  loginUser,
} from "../../hooks/UsersFunctions/usersApiService";
import { data } from "react-router-dom";
import {
  Bell,
  Download,
  RefreshCw,
  Settings,
  Upload,
  User,
} from "lucide-react";
import { HorizontalTabs } from "../../components/HorizontalTabs";

import Accordion from "../../components/Accordion";
const Users = () => {
  const defaultRowValue = {
    userId: "user id ",
    apikey: " api key",
    apiSecret: "api Secret key",
    password: "",
    totpSecret: "",
    userName: "USERNAME-X",
    lastLogin: "",
    broker: "None",
    authToken: "",
    vendorSession: "",
    reqId: "",

    actions: [],
  };
  const [users, setUsers] = useState<any[]>([{ ...defaultRowValue }]);
  const [updatedUsers, setUpdatedUsers] = useState<any[]>(() =>
    users.map((u) => ({ ...u }))
  );

  const toast = useToast();

  useEffect(() => {
    fetchUsers()
      .then((data) => {
        console.log("Fetched users data:", data.length);
        if (data && data.length > 0) {
          requestAnimationFrame(() => {
            setUsers(data);
            setUpdatedUsers(data.map((u: any) => ({ ...u })));
            console.log(updatedUsers);
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users");
      });
  }, []);

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: <User className="h-4 w-4" />,
      content: <div>Profile content here</div>,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
      content: <div>Settings content here</div>,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="h-4 w-4" />,
      content: <div>Notifications content here</div>,
      disabled: true, // Optional
    },
  ];

  return (
    <>
      <ToastContainer
        toasts={toast.toasts}
        onRemove={toast.removeToast}
        position="bottom-right"
      />

      <ReactTable
        headerButtons={[
          {
            label: "Refresh",
            icon: <RefreshCw className="h-4 w-4" />,
            onClick: () => fetchUsers(),
            variant: "secondary",
          },
          {
            label: "Export",
            icon: <Download className="h-4 w-4" />,
            onClick: () => {},
            variant: "primary",
          },
          {
            label: "Import",
            icon: <Upload className="h-4 w-4" />,
            onClick: () => {},
            variant: "success",
          },
        ]}
        showFilters={true}
        title="Users Management"
        description="centralized user management for multiple brokers"
        data={updatedUsers}
        headerGap={false}
        fullHeight={false}
        cellInputType={{
          broker: "select",
          userId: "text",
          userName: "text",
          apiSecret: "text",
          apikey: "text",
          totpSecret: "text",
          password: "password",
        }}
        editable={true}
        editableColumns={[
          "broker",
          "userName",
          "apiSecret",
          "apikey",
          "totpSecret",
          "password",
        ]}
        columnOrder={[
          "userId",
          "userName",
          "broker",
          "apikey",
          "apiSecret",
          "totpSecret",
          "password",
          "lastLogin",
          "authToken",
          "vendorSession",
          "reqId",
          "actions",
        ]}
        onCellEdit={(rowIndex, columnId, newValue, rowData) => {
          console.log("Cell edited:", {
            rowIndex,
            columnId,
            newValue,
            rowData,
          });
          requestAnimationFrame(() => {
            const updated = [...updatedUsers];
            updated[rowIndex][columnId] = newValue;
            setUpdatedUsers(updated);
          });
          console.log("Updated Users after edit:", updatedUsers);
        }}
        dropdownOptions={{
          broker: ["Nuvama", "Angel"],
        }}
        showAddRow={true}
        defaultRowValues={defaultRowValue}
        onAddRow={(newRow) => setUpdatedUsers((prev) => [...prev, newRow])}
        buttonColumns={{
          actions: [
            {
              label: (rowData, idx) => {
                // Check if user exists based on userId instead of entire object
                const userExists = users.some(
                  (user) =>
                    user.userId === rowData.userId &&
                    rowData.userId !== defaultRowValue.userId
                );
                return userExists ? "Update" : "Save";
              },

              onClick: (rowData, idx) => {
                const originalUser = users.find(
                  (user) => user.userId === rowData.userId
                );
                const isExistingUser =
                  originalUser && rowData.userId !== defaultRowValue.userId;

                if (!isExistingUser) {
                  // New user - check for default values
                  const isAnyDefaultValue = isAnyDefault(
                    rowData,
                    defaultRowValue,
                    ["actions", "lastLogin"]
                  );

                  if (isAnyDefaultValue) {
                    const unchangedKeys = unChangedKeys(
                      rowData,
                      defaultRowValue,
                      ["actions", "lastLogin"]
                    );
                    toast.warning(
                      "Some fields are unchanged: " +
                        [...unchangedKeys].join(", ") +
                        ". Please update them before saving."
                    );
                    return;
                  }
                }

                if (isExistingUser) {
                  // Existing user - check if there are changes
                  const hasChanges = !shallowEqual(rowData, originalUser);

                  if (!hasChanges) {
                    toast.warning("No changes to save");
                    return;
                  }

                  const changedKeys = getChangedKeys(rowData, originalUser, [
                    "actions",
                    "lastLogin",
                  ]);

                  if (changedKeys.length > 0) {
                    const changedValues: any = { userId: rowData.userId };
                    changedKeys.forEach((key) => {
                      changedValues[key] = rowData[key];
                    });

                    updateUser(changedValues)
                      .then(() => {
                        toast.success("User updated successfully");
                        requestAnimationFrame(() => {
                          setUsers((prevUsers) =>
                            prevUsers.map((user) =>
                              user.userId === rowData.userId ? rowData : user
                            )
                          );
                        });
                      })
                      .catch(() => {
                        toast.error("Error updating user");
                      });
                  }
                } else {
                  // New user - create
                  createUser(rowData)
                    .then(() => {
                      toast.success("User created successfully");
                      requestAnimationFrame(() => {
                        setUsers((prevUsers) => [...prevUsers, rowData]);
                      });
                    })
                    .catch(() => {
                      toast.error("Error creating user");
                    });
                }
              },

              variant: "success",
            },

            {
              label: "Delete",
              onClick: (rowData, idx) => {
                toast.success("Deleted user successfully");
                requestAnimationFrame(() => {
                  deleteUser(rowData.userId);
                  setUsers(users.filter((_, i) => i !== idx));
                  setUpdatedUsers(users.filter((_, i) => i !== idx));
                });
              },
              variant: "danger",
            },

            {
              label: "Login",
              onClick: (rowData, idx) => {
                const unchangedKeys = unChangedKeys(rowData, defaultRowValue, [
                  "actions",
                  "lastLogin",
                ]);
                unchangedKeys.length > 0 &&
                  toast.warning(
                    "Some fields are unchanged: " +
                      [...unchangedKeys].join(", ") +
                      ". Please update them before login."
                  );

                loginUser(rowData)
                  .then((data) => {
                    requestAnimationFrame(() => {
                      setUsers((prev) => {
                        const updated = [...prev];
                        updated[idx] = { ...updated[idx], ...data.data };
                        return updated;
                      });
                      setUpdatedUsers((prev) => {
                        const updated = [...prev];
                        updated[idx] = { ...updated[idx], ...data.data };
                        return updated;
                      });
                    });
                    toast.success(
                      "User logged in successfully" + JSON.stringify(data.data)
                    );
                    console.log("Login response data:", data.data);
                  })
                  .catch(() => {
                    toast.error("Error logging in user");
                  });
              },
              variant: "primary",
            },
          ],
        }}
      />

      <HorizontalTabs
        tabs={tabs}
        defaultActiveTab="profile"
        variant="underline"
        fullWidth={false}
        onChange={(tabId) => console.log("Active tab:", tabId)}
      />
    </>
  );
};

export default Users;
