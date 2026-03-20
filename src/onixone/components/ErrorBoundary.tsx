import React from 'react';

type Props = { children: React.ReactNode };

type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // Log to console and optionally send to telemetry
    console.error('Uncaught error in React tree:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-8 shadow-soft max-w-2xl text-center">
            <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">An unexpected error occurred while loading a component. Try refreshing the page. If the problem persists, check the dev server.</p>
            <details className="text-left text-xs text-slate-500 dark:text-slate-400">
              <summary>Technical details</summary>
              <pre className="whitespace-pre-wrap">{this.state.error?.message}</pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
