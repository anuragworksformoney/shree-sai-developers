import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  constructor(props: Props) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Application Runtime Error Caught by Boundary]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetToHome = () => {
    window.location.hash = '';
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070C18] text-[#E2E8F0] flex flex-col items-center justify-center p-6 text-center font-montserrat selection:bg-[#D4AF37]/30">
          <div className="max-w-md w-full bg-[#1C2541] border border-[rgba(212,175,55,0.3)] rounded-lg p-8 shadow-2xl space-y-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-[rgba(212,175,55,0.1)] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold font-cinzel text-white tracking-wide">
                Shree Sai Developers
              </h1>
              <p className="text-sm font-semibold text-[#D4AF37] tracking-wider uppercase text-xs">
                Application Recovery
              </p>
              <p className="text-xs text-[#94A3B8] leading-relaxed pt-1">
                An unexpected interface issue occurred. You can reload the page or return to the main showcase.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-[#0B1325] border border-[#2A3454] rounded p-3 text-[11px] text-[#CBD5E1] font-mono overflow-x-auto max-h-28">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded bg-[#D4AF37] hover:bg-[#E5C158] text-[#070C18] font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleResetToHome}
                className="flex-1 py-2.5 px-4 rounded bg-[#0B1325] hover:bg-[#141E33] border border-[#2A3454] hover:border-[#D4AF37] text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Go to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
