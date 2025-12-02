````import { Popper, usePopper } from "../../components/Popper";
import { FlexibleForm } from "../../components/Form";

const YourComponent = () => {
  const popper = usePopper(); // Manages open/close state

  const fields = [
    { name: "field1", label: "Field 1", type: "text", required: true },
    { name: "field2", label: "Field 2", type: "select", options: [...] }
  ];

  return (
    <>
      <ReactTable
        data={data}
        headerButtons={[
          {
            label: "Add New",
            onClick: popper.toggle, // Open popper
            variant: "primary"
          }
        ]}
      />

      <Popper
        open={popper.open}
        onClose={popper.close}
        title="Add Item"
        placement="bottom-end"
        width="600px"
        showBackdrop={true}
      >
        <FlexibleForm
          fields={fields}
          onSubmit={(data) => {
            console.log(data);
            popper.close();
          }}
          onCancel={popper.close}
        />
      </Popper>
    </>
  );
};```
````
