import React, { useState } from "react";

interface TickDataUploaderProps {
  onDataUpload: (data: any[]) => void;
}

const TickDataUploader: React.FC<TickDataUploaderProps> = ({
  onDataUpload,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList): Promise<void> => {
    const file = files[0];
    setUploading(true);
    setError(null);

    try {
      const text = await file.text();

      // Try to parse as JSON Lines format (one JSON object per line)
      const lines = text.trim().split("\n");
      const tickData: any[] = [];

      for (let line of lines) {
        if (line.trim()) {
          try {
            const tick = JSON.parse(line);
            tickData.push(tick);
          } catch (parseError) {
            // If single line parsing fails, try parsing the entire content as JSON array
            try {
              const entireData = JSON.parse(text);
              if (Array.isArray(entireData)) {
                onDataUpload(entireData);
                setUploading(false);
                return;
              } else {
                onDataUpload([entireData]);
                setUploading(false);
                return;
              }
            } catch (wholeParseError) {
              setError(
                `Invalid JSON format in line: ${line.substring(0, 100)}...`
              );
              setUploading(false);
              return;
            }
          }
        }
      }

      if (tickData.length > 0) {
        onDataUpload(tickData);
      } else {
        setError("No valid tick data found in the file");
      }
    } catch (error) {
      setError(
        `Error reading file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }

    setUploading(false);
  };

  return (
    <div className="bg-white dark:bg-dark-card-gradient rounded-xl p-6 border border-gray-200 dark:border-dark-border mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">
        Upload Tick Data
      </h3>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-surface"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
              Processing file...
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex justify-center">
                <svg
                  className="h-12 w-12 text-gray-400 dark:text-gray-500"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
                  Drop your tick data file here
                </p>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">
                  or click to browse
                </p>
              </div>

              <div className="text-xs text-gray-500 dark:text-dark-text-secondary">
                <p>Supported formats:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>JSON Lines (.jsonl, .txt) - One JSON object per line</li>
                  <li>JSON Array (.json) - Array of tick objects</li>
                  <li>Single JSON Object (.json) - Single tick object</li>
                </ul>
              </div>
            </div>

            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".json,.jsonl,.txt"
              onChange={handleChange}
            />
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                Upload Error
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 dark:text-dark-text-secondary">
        <p className="font-medium mb-1">Expected tick data format:</p>
        <pre className="bg-gray-100 dark:bg-dark-surface p-2 rounded text-xs overflow-x-auto">
          {`{
  "timestamp": 1757494799.8457305,
  "datetime": "2025-09-10T13:59:59.845731",
  "type": "depth",
  "data": {
    "response": {
      "data": {
        "askValues": [{"price": "3450.00", "qty": "110"}],
        "bidValues": [{"price": "3448.70", "qty": "1"}],
        "taq": "279934",
        "tbq": "444781",
        "symbolname": "WAAREEENER"
      }
    }
  }
}`}
        </pre>
      </div>
    </div>
  );
};

export default TickDataUploader;
