import React, { ErrorInfo, ReactNode } from 'react';
import { toast } from './ui/use-toast';
import logger from '@/lib/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("Uncaught error:", { error, errorInfo });
    toast({
      title: "An error occurred",
      description: "We're sorry, but something went wrong. Please try again later.",
      variant: "destructive",
    });
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please refresh the page and try again.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
