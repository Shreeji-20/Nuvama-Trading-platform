import React, { useState, useRef, useEffect } from "react";

function useOutsideClick(refs, handler) {
  useEffect(() => {
    const onDoc = (e) => {
      // if click is inside any of the refs, ignore
      if (refs.some((r) => r.current && r.current.contains(e.target))) return;
      handler(e);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [refs, handler]);
}

export default function DropdownForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  useOutsideClick([buttonRef, panelRef], () => setOpen(false));

  useEffect(() => {
    if (open) {
      // focus first input when opened
      const first = panelRef.current?.querySelector(
        "input, textarea, select, button"
      );
      first?.focus();
    }
  }, [open]);

  const submit = (e) => {
    e.preventDefault();
    // handle submission
    console.log("Saved:", name);
    setOpen(false); // close after save (optional)
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        Open form
      </button>

      {open && (
        <div
          className="mx-auto"
          ref={panelRef}
          role="dialog"
          aria-label="Inline form"
          style={{
            position: "relative",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: 220,
            padding: 12,
            border: "1px solid #ddd",
            background: "#fff",
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            zIndex: 1000,
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          // prevent panel clicks from closing if parent had a global close
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={submit}>
            <label style={{ display: "block", marginBottom: 8 }}>
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ display: "block", width: "100%", marginTop: 6 }}
              />
            </label>

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <button type="button" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="submit">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
