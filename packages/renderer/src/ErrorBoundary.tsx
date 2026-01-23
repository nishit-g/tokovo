import React, { Component, ReactNode, ErrorInfo } from "react";
import { createScopedLogger } from "@tokovo/core";

const log = createScopedLogger("renderer");

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    const { onError, componentName } = this.props;

    log.error(`Component ${componentName || "Unknown"} crashed`, error, {
      componentStack: errorInfo.componentStack,
    });

    if (onError) {
      onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      if (fallback) {
        return fallback;
      }

      return (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            color: "#ff6b6b",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "monospace",
            fontSize: 12,
          }}
        >
          <div style={{ fontSize: 16, marginBottom: 10 }}>Component Error</div>
          <div style={{ color: "#ccc", textAlign: "center", maxWidth: "90%" }}>
            {error.message}
          </div>
        </div>
      );
    }

    return children;
  }
}

interface RenderSafeProps {
  children: ReactNode;
  name: string;
  fallback?: ReactNode;
}

export const RenderSafe: React.FC<RenderSafeProps> = ({
  children,
  name,
  fallback,
}) => {
  return (
    <ErrorBoundary componentName={name} fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
};

interface AppErrorBoundaryProps {
  children: ReactNode;
  appId: string;
  onError?: (error: Error, appId: string) => void;
}

export const AppErrorBoundary: React.FC<AppErrorBoundaryProps> = ({
  children,
  appId,
  onError,
}) => {
  const handleError = (error: Error, _errorInfo: ErrorInfo) => {
    if (onError) {
      onError(error, appId);
    }
  };

  return (
    <ErrorBoundary
      componentName={`App:${appId}`}
      onError={handleError}
      fallback={
        <div
          style={{
            flex: 1,
            backgroundColor: "#1a1a1a",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "#666",
            fontFamily: "system-ui, sans-serif",
            fontSize: 14,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
          <div>App failed to render</div>
          <div style={{ fontSize: 12, marginTop: 8, color: "#444" }}>
            {appId}
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};
