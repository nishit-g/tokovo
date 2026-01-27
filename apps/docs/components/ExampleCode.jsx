"use client";

import { useState } from "react";
import Link from "next/link";

export function ExampleCode({ code, language = "typescript", exampleLink }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="nx-my-6 nx-rounded-lg nx-border nx-border-gray-200 dark:nx-border-gray-800 nx-overflow-hidden">
      <div className="nx-relative">
        <pre className="nx-overflow-x-auto nx-bg-gray-50 dark:nx-bg-gray-900 nx-p-4 nx-m-0">
          <code className={`nx-font-mono nx-text-sm language-${language}`}>
            {code}
          </code>
        </pre>
        <button
          onClick={handleCopy}
          className="nx-absolute nx-top-3 nx-right-3 nx-px-2 nx-py-1 nx-text-xs nx-rounded nx-bg-gray-200 dark:nx-bg-gray-800 nx-text-gray-700 dark:nx-text-gray-300 hover:nx-bg-gray-300 dark:hover:nx-bg-gray-700 nx-transition-colors"
          aria-label="Copy code"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      {exampleLink && (
        <div className="nx-px-4 nx-py-3 nx-bg-white dark:nx-bg-gray-950 nx-border-t nx-border-gray-200 dark:nx-border-gray-800">
          <Link
            href={exampleLink}
            className="nx-inline-flex nx-items-center nx-gap-2 nx-text-sm nx-text-blue-600 dark:nx-text-blue-400 hover:nx-text-blue-800 dark:hover:nx-text-blue-200 hover:nx-underline"
          >
            <span>View full example</span>
            <svg
              className="nx-w-4 nx-h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
