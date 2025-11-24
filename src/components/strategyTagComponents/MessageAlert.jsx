import React from "react";

const MessageAlert = ({ message }) => {
  if (!message.text) return null;

  return (
    <div
      className={`p-4 rounded-lg border ${
        message.type === "success"
          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
          : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
      }`}
    >
      <p className="text-[0.7rem]">{message.text}</p>
    </div>
  );
};

export default MessageAlert;
