# StrategyTags Architecture

## Component Hierarchy

```
StrategyTags.jsx (Main Container - 280 lines)
│
├── State Management
│   ├── tags, users, loading, message
│   ├── formData, editingTagId
│   ├── inlineEditingTagId, inlineEditData
│   └── selectedUserId, multiplier, userInfoMap
│
├── API Functions (from StrategyTagsFunctions/)
│   ├── fetchUsers()
│   ├── fetchTags()
│   ├── createTag()
│   ├── updateTag()
│   └── deleteTag()
│
├── Helper Functions (from StrategyTagsFunctions/)
│   ├── getInitialFormData()
│   ├── prepareGlobalSettings()
│   ├── prepareTagData()
│   └── validateFormData()
│
└── UI Components
    │
    ├── StrategyTagsHeader
    │   ├── Props: tags, loading, onRefresh
    │   └── Displays: Title, Refresh Button, Tag Count
    │
    ├── MessageAlert
    │   ├── Props: message {type, text}
    │   └── Displays: Success/Error Messages
    │
    ├── CreateTagForm
    │   ├── Props: formData, setFormData, users, userInfoMap, etc.
    │   ├── Sections:
    │   │   ├── Tag Name & Description
    │   │   ├── User Multipliers Selection
    │   │   ├── Added Users Table
    │   │   └── Global Settings
    │   │       ├── Market Orders Allowed
    │   │       ├── Order Failure Handling
    │   │       └── Modify Options
    │   └── Actions: Submit, Cancel
    │
    └── Tags List Section
        └── TagsTable
            ├── Props: tags, loading, inlineEditingTagId, etc.
            ├── States: Loading, Empty, Data
            └── TagTableRow (for each tag)
                ├── Props: tag, isEditing, editData, etc.
                ├── Modes: View Mode, Edit Mode
                └── 8 Columns:
                    ├── Tag Name (editable)
                    ├── Description (editable)
                    ├── Users & Multipliers (editable)
                    ├── Market Orders (editable)
                    ├── Order Failure (editable)
                    ├── Modify Options (editable)
                    ├── Created (read-only)
                    └── Actions (Edit/Delete or Save/Cancel)
```

## Data Flow

### 1. Page Load

```
useEffect()
  → fetchUsers()
    → API call
    → setUsers() + setUserInfoMap()
  → fetchTags()
    → API call
    → setTags()
```

### 2. Create Tag Flow

```
User fills CreateTagForm
  → Selects user + multiplier
  → Clicks "Add"
    → addUserMultiplier()
    → Updates formData.userMultipliers
  → Fills global settings
  → Clicks "Create Tag"
    → handleSubmit()
      → validateFormData()
      → prepareTagData()
      → apiCreateTag()
      → showMessage("success")
      → resetForm()
      → fetchTags()
```

### 3. Inline Edit Flow

```
User clicks "Edit" button in TagTableRow
  → startInlineEdit(tag)
    → setInlineEditingTagId(tag.id)
    → setInlineEditData(tag data)
  → TagTableRow switches to edit mode
  → User modifies fields
    → onUpdateEditData() updates inlineEditData
  → User clicks "Save"
    → saveInlineEdit()
      → validateFormData()
      → prepareTagData()
      → apiUpdateTag()
      → showMessage("success")
      → cancelInlineEdit()
      → fetchTags()
```

### 4. Delete Flow

```
User clicks "Delete" button
  → confirm() dialog
  → deleteTag(tagId)
    → apiDeleteTag()
    → showMessage("success")
    → fetchTags()
```

## File Organization

```
src/
├── pages/
│   ├── StrategyTags.jsx (Main component - 280 lines)
│   └── StrategyTagsFunctions/
│       ├── api.js (API calls - 5 functions)
│       ├── helpers.js (Utilities - 4 functions)
│       └── index.js (Exports)
│
└── components/
    └── strategyTagComponents/
        ├── StrategyTagsHeader.jsx (Header)
        ├── MessageAlert.jsx (Messages)
        ├── CreateTagForm.jsx (Form - all sections)
        ├── TagsTable.jsx (Table wrapper)
        ├── TagTableRow.jsx (Table row with inline editing)
        └── index.js (Exports)
```

## Benefits of This Architecture

### Separation of Concerns

- **API Layer**: All network calls in one place
- **Helper Layer**: Data transformation and validation
- **UI Layer**: Presentational components
- **State Layer**: Main component manages state

### Reusability

- Components can be used elsewhere
- API functions can be called from other pages
- Helper functions are utility-first

### Maintainability

- Each file has a single purpose
- Easy to find and fix bugs
- Clear boundaries between layers

### Testability

- Can unit test helpers independently
- Can mock API calls easily
- Can test components in isolation

### Scalability

- Easy to add new features
- Can extend components with new props
- Can add new API endpoints easily
