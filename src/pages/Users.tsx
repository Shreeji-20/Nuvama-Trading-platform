import { ReactTable } from "../pages/table";
import { useState } from "react";
const Users = () => {
  const [users, setUsers] = useState<any[]>([
    {
      userId: "",
      userName: "",
      apiSecret: "",
      apikey: "",
      totpSecret: "",
      password: "",
      broker: "",
    },
  ]);
  return (
    <>
      <h1>Users Page</h1>
      <ReactTable
        showFilters={true}
        title="Users Management"
        description="Central Users Managemet"
        data={users}
        cellInputType={{
          broker: "select",
          userId: "text",
          userName: "text",
          apiSecret: "text",
          apikey: "text",
          totpSecret: "text",
          password: "text",
        }}
        editable={true}
        onCellEdit={(rowIndex, columnId, newValue, rowData) => {
          console.log("Cell edited:", {
            rowIndex,
            columnId,
            newValue,
            rowData,
          });
          // Here you can add logic to handle the edited cell value,
          // such as updating the backend or state.
        }}
        dropdownOptions={{
          broker: ["Nuvama"],
        }}
      />
    </>
  );
};

export default Users;
