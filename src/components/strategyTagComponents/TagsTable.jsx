import React from "react";
import TagTableRow from "./TagTableRow";

const TagsTable = ({
  tags,
  loading,
  inlineEditingTagId,
  inlineEditData,
  userInfoMap,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onUpdateEditData,
}) => {
  if (loading && tags.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-[0.7rem] text-gray-600 dark:text-gray-400">
          Loading tags...
        </p>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No strategy tags yet
        </h3>
        <p className="text-[0.7rem] text-gray-600 dark:text-gray-400">
          Create your first strategy tag using the form above
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px] text-[0.7rem]">
        <thead>
          <tr className="bg-gray-100/80 dark:bg-gray-700/80 border-b-2 border-gray-300 dark:border-gray-600">
            <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">
              Tag Name
            </th>
            <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">
              Description
            </th>
            <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">
              Users & Multipliers
            </th>
            <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">
              Market Orders
            </th>
            <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">
              Order Failure
            </th>
            <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">
              Modify Options
            </th>
            <th className="text-left p-2 font-semibold text-gray-700 dark:text-gray-300">
              Created
            </th>
            <th className="text-right p-2 font-semibold text-gray-700 dark:text-gray-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {tags.map((tag) => (
            <TagTableRow
              key={tag.id}
              tag={tag}
              isEditing={inlineEditingTagId === tag.id}
              editData={inlineEditingTagId === tag.id ? inlineEditData : tag}
              userInfoMap={userInfoMap}
              onStartEdit={() => onStartEdit(tag)}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onDelete={() => onDelete(tag.id)}
              onUpdateEditData={onUpdateEditData}
              loading={loading}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TagsTable;
