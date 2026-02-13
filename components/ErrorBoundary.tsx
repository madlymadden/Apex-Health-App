import React, { Component, ComponentType, PropsWithChildren } from "react";
import { ErrorFallback, ErrorFallbackProps } from "@/components/ErrorFallback";
import { logError } from "@/lib/error-handling";

export type ErrorBoundaryProps = PropsWithChildren<{
  FallbackComponent?: ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, stackTrace: string) => void;
  context?: string;
  userId?: string;
}>;

type ErrorBoundaryState = { error: Error | null };

/**
 * This is a special case for for using the class components. Error boundaries must be class components because React only provides error boundary functionality through lifecycle methods (componentDidCatch and getDerivedStateFromError) which are not available in functional components.
 * https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Enhanced error logging with context
    logError(error, this.props.context || 'ErrorBoundary', this.props.userId);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo.componentStack);
    }

    // In development, log full error info
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  resetError = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      const FallbackComponent = this.props.FallbackComponent || ErrorFallback;
      return (
        <FallbackComponent 
          error={this.state.error} 
          resetError={this.resetError} 
        />
      );
    }

    return this.props.children;
  }
}
