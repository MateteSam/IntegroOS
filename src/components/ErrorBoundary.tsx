import React from 'react';
import { AlertTriangle, RefreshCw, MessageCircle, Copy, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
  showDetails: boolean;
}

const MAX_RETRIES = 3;

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught an error:', error, errorInfo);
    this.setState({ errorInfo });

    // Log to localStorage for debugging
    try {
      const errorLog = JSON.parse(localStorage.getItem('integro-error-log') || '[]');
      errorLog.unshift({
        message: error.message,
        stack: error.stack,
        component: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
      // Keep only last 20 errors
      localStorage.setItem('integro-error-log', JSON.stringify(errorLog.slice(0, 20)));
    } catch (e) {
      console.warn('Failed to log error to localStorage:', e);
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < MAX_RETRIES) {
      this.setState(prev => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prev.retryCount + 1
      }));
      toast.info(`Retry attempt ${this.state.retryCount + 1} of ${MAX_RETRIES}...`);
    } else {
      toast.error('Maximum retries reached. Please refresh the page.');
    }
  };

  handleCopyError = () => {
    const errorText = `
# Integro OS Error Report
## Timestamp: ${new Date().toISOString()}
## Error: ${this.state.error?.message || 'Unknown error'}

### Stack Trace:
${this.state.error?.stack || 'No stack trace available'}

### Component Stack:
${this.state.errorInfo?.componentStack || 'No component stack available'}

---
Please ask Antigravity to help diagnose and fix this issue.
    `.trim();

    navigator.clipboard.writeText(errorText);
    toast.success('Error details copied! Paste to Antigravity for help.');
  };

  handleAskAntigravity = () => {
    // Create a structured help request
    const helpRequest = {
      type: 'error_recovery',
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      component: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      context: 'Integro OS encountered an unrecoverable error'
    };

    // Store request for Antigravity pickup
    try {
      const requests = JSON.parse(localStorage.getItem('antigravity-help-queue') || '[]');
      requests.unshift(helpRequest);
      localStorage.setItem('antigravity-help-queue', JSON.stringify(requests.slice(0, 10)));
    } catch (e) {
      console.warn('Failed to queue help request:', e);
    }

    // Copy to clipboard as well
    this.handleCopyError();
    toast.success('Help request queued! Error copied to clipboard for Antigravity.');
  };

  render() {
    if (this.state.hasError) {
      // Allow custom fallback components
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      const canRetry = this.state.retryCount < MAX_RETRIES;

      return (
        <div className="min-h-[400px] flex items-center justify-center bg-background p-4">
          <Card className="max-w-lg w-full border-destructive/20 shadow-lg">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-7 w-7 text-destructive" />
              </div>
              <CardTitle className="text-center text-xl font-serif">Something went wrong</CardTitle>
              <CardDescription className="text-center">
                Integro OS encountered an unexpected error. Don't worry - we can help fix this.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={this.handleRetry}
                  variant="outline"
                  disabled={!canRetry}
                  className="h-12"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {canRetry ? `Retry (${MAX_RETRIES - this.state.retryCount} left)` : 'No retries left'}
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="h-12"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
              </div>

              {/* Ask Antigravity - Primary CTA */}
              <Button
                onClick={this.handleAskAntigravity}
                className="w-full h-14 gradient-primary text-primary-foreground font-bold glow-gold"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Ask Antigravity for Help
              </Button>

              {/* Error Details Collapsible */}
              <div className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                  className="w-full flex items-center justify-between p-3 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium">Error Details</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${this.state.showDetails ? 'rotate-180' : ''}`} />
                </button>
                {this.state.showDetails && (
                  <div className="p-3 pt-0 space-y-3">
                    <pre className="bg-muted p-3 rounded-lg overflow-auto text-xs max-h-32 text-destructive">
                      {this.state.error?.message || 'Unknown error'}
                    </pre>
                    <Button
                      onClick={this.handleCopyError}
                      variant="ghost"
                      size="sm"
                      className="w-full"
                    >
                      <Copy className="w-3 h-3 mr-2" />
                      Copy Full Error Report
                    </Button>
                  </div>
                )}
              </div>

              {/* Retry count indicator */}
              {this.state.retryCount > 0 && (
                <p className="text-xs text-center text-muted-foreground">
                  Retry attempts: {this.state.retryCount} / {MAX_RETRIES}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier use with hooks
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallbackComponent?: React.ReactNode
) {
  return function ErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallbackComponent={fallbackComponent}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
