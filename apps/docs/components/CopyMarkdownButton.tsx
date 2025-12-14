import React, { useState, useCallback } from "react";

/**
 * Copy as Markdown Button
 * 
 * Copies the current page content as markdown to clipboard.
 * Works by fetching the raw .md/.mdx file from the same path.
 */
export const CopyMarkdownButton: React.FC = () => {
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCopy = useCallback(async () => {
        setLoading(true);
        try {
            // Get current path
            const path = window.location.pathname;

            // Try to fetch the .md or .mdx file
            // Nextra serves pages from /pages directory
            let content = "";

            // Try .mdx first, then .md
            for (const ext of [".mdx", ".md"]) {
                try {
                    const response = await fetch(`/_next/static/chunks/pages${path}${ext}`.replace(/\/\//g, "/"));
                    if (response.ok) {
                        content = await response.text();
                        break;
                    }
                } catch {
                    // Continue to next extension
                }
            }

            // If no file found, use the visible content
            if (!content) {
                // Get the main content area
                const article = document.querySelector("article");
                if (article) {
                    // Use innerHTML and convert to markdown-like text
                    content = article.innerText || "";
                }
            }

            // Copy to clipboard
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
            // Fallback: copy visible text
            const article = document.querySelector("article");
            if (article) {
                await navigator.clipboard.writeText(article.innerText || "");
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <button
            onClick={handleCopy}
            disabled={loading}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid rgba(156, 163, 175, 0.3)",
                backgroundColor: copied ? "rgba(34, 197, 94, 0.1)" : "transparent",
                color: copied ? "#22c55e" : "inherit",
                cursor: loading ? "wait" : "pointer",
                fontSize: 14,
                transition: "all 0.2s",
            }}
            title="Copy page content as markdown"
        >
            {loading ? (
                <span>⏳</span>
            ) : copied ? (
                <>
                    <span>✓</span>
                    <span>Copied!</span>
                </>
            ) : (
                <>
                    <span>📋</span>
                    <span>Copy .md</span>
                </>
            )}
        </button>
    );
};

export default CopyMarkdownButton;
