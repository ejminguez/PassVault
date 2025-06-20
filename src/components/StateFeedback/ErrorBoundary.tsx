import { createSignal, createEffect, onCleanup, JSX } from "solid-js";

interface ErrorBoundaryProps {
  children: JSX.Element;
  fallback?: (error: Error, reset: () => void) => JSX.Element;
  onError?: (error: Error, errorInfo: any) => void;
}

interface ErrorInfo {
  componentStack?: string;
  errorBoundary?: string;
}

const ErrorBoundary = (props: ErrorBoundaryProps) => {
  const [error, setError] = createSignal<Error | null>(null);
  const [errorInfo, setErrorInfo] = createSignal<ErrorInfo | null>(null);

  // Reset error state
  const resetError = () => {
    setError(null);
    setErrorInfo(null);
  };

  // Global error handler for unhandled promise rejections
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    if (event.reason instanceof Error) {
      setError(event.reason);
      setErrorInfo({ errorBoundary: 'Promise rejection' });
      props.onError?.(event.reason, { errorBoundary: 'Promise rejection' });
    }
  };

  // Global error handler for uncaught errors
  const handleError = (event: ErrorEvent) => {
    console.error('Uncaught error:', event.error);
    
    if (event.error instanceof Error) {
      setError(event.error);
      setErrorInfo({ errorBoundary: 'Global error' });
      props.onError?.(event.error, { errorBoundary: 'Global error' });
    }
  };

  createEffect(() => {
    // Add global error listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    onCleanup(() => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    });
  });

  // Default error fallback component
  const DefaultErrorFallback = (error: Error, reset: () => void) => (
    <div class="error-boundary">
      <div class="error-boundary-content">
        <div class="error-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2M12,7A2,2 0 0,0 10,9A2,2 0 0,0 12,11A2,2 0 0,0 14,9A2,2 0 0,0 12,7M12,17.5A1.5,1.5 0 0,1 10.5,16A1.5,1.5 0 0,1 12,14.5A1.5,1.5 0 0,1 13.5,16A1.5,1.5 0 0,1 12,17.5Z" />
          </svg>
        </div>
        
        <h2>Something went wrong</h2>
        <p class="error-message">
          An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
        </p>
        
        <details class="error-details">
          <summary>Error Details</summary>
          <div class="error-stack">
            <h4>Error:</h4>
            <pre>{error.message}</pre>
            
            {error.stack && (
              <>
                <h4>Stack Trace:</h4>
                <pre>{error.stack}</pre>
              </>
            )}
            
            {errorInfo() && (
              <>
                <h4>Component Stack:</h4>
                <pre>{JSON.stringify(errorInfo(), null, 2)}</pre>
              </>
            )}
          </div>
        </details>
        
        <div class="error-actions">
          <button class="retry-button" onClick={reset}>
            Try Again
          </button>
          <button 
            class="reload-button" 
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );

  // Catch errors in child components
  try {
    if (error()) {
      const fallbackComponent = props.fallback || DefaultErrorFallback;
      return fallbackComponent(error()!, resetError);
    }
    
    return props.children;
  } catch (caughtError) {
    console.error('Error caught by boundary:', caughtError);
    
    if (caughtError instanceof Error) {
      setError(caughtError);
      setErrorInfo({ componentStack: 'Component render error' });
      props.onError?.(caughtError, { componentStack: 'Component render error' });
      
      const fallbackComponent = props.fallback || DefaultErrorFallback;
      return fallbackComponent(caughtError, resetError);
    }
    
    return props.children;
  }
};

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = <T extends Record<string, any>>(
  Component: (props: T) => JSX.Element,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  return (props: T) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

// Hook for manual error reporting
export const useErrorHandler = () => {
  const reportError = (error: Error, context?: string) => {
    console.error(`Error reported from ${context || 'unknown context'}:`, error);
    
    // You can extend this to send errors to a logging service
    // Example: sendToLoggingService(error, context);
  };

  const handleAsyncError = async <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      if (error instanceof Error) {
        reportError(error, context);
      }
      return null;
    }
  };

  return {
    reportError,
    handleAsyncError
  };
};

export default ErrorBoundary;
