import React, { Component, ReactNode, PropsWithChildren } from "react";
import NotFound from "./NotFound";

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<
  PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("捕获到错误: ", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // 备用UI
      return <NotFound />;
    }

    // 正常渲染
    return this.props.children;
  }
}

export default ErrorBoundary;
