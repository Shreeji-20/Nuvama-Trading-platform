import React from "react";
import { Popper, usePopper } from "../../components/Popper";
import { FlexibleForm, FormField } from "../../components/Form";
import { ReactTable } from "../table";
import { Plus, Edit } from "lucide-react";

// Example: Using Popper + Form with a table
const PopperFormExample = () => {
  const addPopper = usePopper();
  const editPopper = usePopper();
  const [selectedRow, setSelectedRow] = React.useState<any>(null);
  const [data, setData] = React.useState([
    { id: 1, name: "Strategy 1", type: "Iron Condor", status: "Active" },
    { id: 2, name: "Strategy 2", type: "Butterfly", status: "Inactive" },
  ]);

  // Form fields configuration
  const formFields: FormField[] = [
    {
      name: "name",
      label: "Strategy Name",
      type: "text",
      required: true,
      placeholder: "Enter strategy name",
      validate: (value) => {
        if (value.length < 3) return "Name must be at least 3 characters";
        return null;
      },
    },
    {
      name: "type",
      label: "Strategy Type",
      type: "select",
      required: true,
      options: [
        { label: "Iron Condor", value: "Iron Condor" },
        { label: "Butterfly", value: "Butterfly" },
        { label: "Straddle", value: "Straddle" },
        { label: "Strangle", value: "Strangle" },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
      ],
    },
    {
      name: "multiplier",
      label: "Multiplier",
      type: "number",
      min: 1,
      max: 10,
      step: 1,
      helpText: "Enter a value between 1-10",
    },
    {
      name: "autoExecute",
      label: "Auto Execute",
      type: "checkbox",
      helpText: "Automatically execute trades",
    },
  ];

  // Handle add new
  const handleAddSubmit = (formData: Record<string, any>) => {
    const newId = Math.max(...data.map((d) => d.id), 0) + 1;
    const newItem = {
      id: newId,
      name: formData.name || "",
      type: formData.type || "",
      status: formData.status || "",
    };
    setData([...data, newItem]);
    addPopper.close();
  };

  // Handle edit
  const handleEditSubmit = (formData: Record<string, any>) => {
    setData(
      data.map((item) =>
        item.id === selectedRow.id ? { ...item, ...formData } : item
      )
    );
    editPopper.close();
  };

  return (
    <div className="p-6">
      <ReactTable
        title="Strategies"
        description="Manage your trading strategies"
        data={data}
        headerButtons={[
          {
            label: "Add Strategy",
            icon: <Plus className="h-4 w-4" />,
            onClick: addPopper.toggle,
            variant: "primary",
          },
        ]}
        buttonColumns={{
          actions: {
            label: "Edit",
            icon: <Edit className="h-3 w-3" />,
            onClick: (rowData) => {
              setSelectedRow(rowData);
              editPopper.toggle();
            },
            variant: "secondary",
          },
        }}
      />

      {/* Add Strategy Popper */}
      <Popper
        open={addPopper.open}
        onClose={addPopper.close}
        title="Add New Strategy"
        placement="bottom-end"
        width="500px"
        showBackdrop={true}
      >
        <FlexibleForm
          fields={formFields}
          onSubmit={handleAddSubmit}
          onCancel={addPopper.close}
          submitLabel="Create Strategy"
          columns={1}
        />
      </Popper>

      {/* Edit Strategy Popper */}
      <Popper
        open={editPopper.open}
        onClose={editPopper.close}
        title="Edit Strategy"
        placement="bottom-end"
        width="500px"
        showBackdrop={true}
      >
        <FlexibleForm
          fields={formFields}
          onSubmit={handleEditSubmit}
          onCancel={editPopper.close}
          initialData={selectedRow}
          submitLabel="Update Strategy"
          columns={1}
        />
      </Popper>
    </div>
  );
};

export default PopperFormExample;
