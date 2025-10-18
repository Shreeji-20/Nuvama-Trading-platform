import React, { memo } from "react";

const LiveIndicator = memo(() => {
  return (
    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      Live
    </span>
  );
});

LiveIndicator.displayName = "LiveIndicator";

export default LiveIndicator;
