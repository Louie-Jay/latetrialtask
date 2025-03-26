import React, { Component, ErrorInfo } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { logger } from '../lib/logging';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export default class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Uncaught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-premium-black">
          <div className="text-center">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 animate-pulse" />
              <AlertTriangle className="relative z-10 mx-auto h-16 w-16 text-red-400" />
            </div>
            <h1 className="text-4xl font-bold text-gradient mb-4">Something Went Wrong</h1>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {this.state.error?.message || 'An error occurred while rendering this page.'}
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={this.handleRetry}
                className="premium-button inline-flex items-center space-x-2"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Try Again</span>
              </button>
              <Link
                to="/"
                className="secondary-button inline-flex items-center space-x-2"
              >
                <Home className="h-5 w-5" />
                <span>Return Home</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}