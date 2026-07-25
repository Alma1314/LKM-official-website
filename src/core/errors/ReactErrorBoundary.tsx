// src/core/errors/ReactErrorBoundary.tsx
import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ReactErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
            <p className="mb-2 text-sm font-medium text-red-800 dark:text-red-200">组件加载失败</p>
            <p className="mb-4 text-xs text-red-600 dark:text-red-400">{this.state.error?.message ?? '未知错误'}</p>
            <button
              onClick={this.handleRetry}
              className="rounded bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700"
            >
              重试
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
