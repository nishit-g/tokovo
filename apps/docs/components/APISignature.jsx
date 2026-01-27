"use client";

import { useState } from "react";

export function APISignature({ signature, description }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(signature);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="nx-my-6 nx-rounded-lg nx-border nx-border-gray-200 dark:nx-border-gray-800 nx-overflow-hidden">
      <div className="nx-bg-gray-50 dark:nx-bg-gray-900 nx-px-4 nx-py-3 nx-flex nx-items-start nx-justify-between nx-gap-3">
        <pre className="nx-flex-1 nx-overflow-x-auto nx-m-0">
          <code className="nx-font-mono nx-text-sm nx-text-purple-700 dark:nx-text-purple-300">
            {signature}
          </code>
        </pre>
        <button
          onClick={handleCopy}
          className="nx-shrink-0 nx-px-2 nx-py-1 nx-text-xs nx-rounded nx-bg-gray-200 dark:nx-bg-gray-800 nx-text-gray-700 dark:nx-text-gray-300 hover:nx-bg-gray-300 dark:hover:nx-bg-gray-700 nx-transition-colors"
          aria-label="Copy signature"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      {description && (
        <div className="nx-px-4 nx-py-3 nx-bg-white dark:nx-bg-gray-950 nx-border-t nx-border-gray-200 dark:nx-border-gray-800">
          <p className="nx-text-sm nx-text-gray-600 dark:nx-text-gray-400 nx-m-0">
            {description}
          </p>
        </div>
      )}
    </div>
  );
}
