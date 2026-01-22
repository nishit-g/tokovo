import React from "react";
import { AbsoluteFill } from "remotion";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error);
    console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <AbsoluteFill
          style={{
            backgroundColor: "#1a1a1a",
            color: "#ff4444",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "monospace",
            padding: 40,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️ Render Error</div>
          <div
            style={{
              fontSize: 18,
              color: "#ffaaaa",
              maxWidth: "80%",
              textAlign: "center",
              whiteSpace: "pre-wrap",
            }}
          >
            {this.state.error?.message || "Unknown error"}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#888",
              marginTop: 20,
              maxWidth: "80%",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {this.state.error?.stack?.split("\n").slice(0, 5).join("\n")}
          </div>
        </AbsoluteFill>
      );
    }

    return this.props.children;
  }
}
