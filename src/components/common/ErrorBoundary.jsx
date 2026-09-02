import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

/**
 * Feature-level Error Boundary
 * Catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[ErrorBoundary - ${this.props.name || 'Component'}] Caught error:`, error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-rose-500/30 text-center space-y-4 max-w-xl mx-auto my-6 shadow-2xl backdrop-blur-xl animate-fade-in">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-serif font-bold text-white">
              {this.props.title || `${this.props.name || 'Feature'} Temporarily Interrupted`}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              An unexpected issue occurred in this panel. The rest of your application remains fully operational and safe.
            </p>
          </div>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-rose-300 text-left overflow-x-auto max-h-32">
              {this.state.error.toString()}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold transition-transform hover:scale-105 active:scale-95 shadow-md flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry This Section</span>
            </button>

            {this.props.showHome && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center space-x-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
