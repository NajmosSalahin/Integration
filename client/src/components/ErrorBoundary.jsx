import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught:', error);
    if (info?.componentStack) console.error(info.componentStack);
  }

  handleReload = () => window.location.reload();

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const message = String(error?.message || error || '');
    const isChunk =
      /ChunkLoadError|Failed to fetch dynamically imported module|error loading dynamically imported module|disallowed MIME type|Failed to fetch|dynamically imported module/i.test(
        message
      );

    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
            <AlertTriangle className="text-amber-400" size={22} />
          </div>
          <h1 className="text-xl font-semibold mb-2">
            {isChunk ? "Couldn't load this page" : 'Something went wrong'}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mb-2">
            {isChunk
              ? "A part of the app didn't load. This is usually a stale build — press Reload and it should come right back."
              : 'An unexpected error interrupted this page. Your data is safe.'}
          </p>
          {import.meta.env.DEV && (
            <pre className="mt-3 mb-4 bg-black/40 border border-white/10 rounded-lg p-3 text-left text-xs text-red-300 max-h-32 overflow-auto">
              {message || 'No error message available.'}
            </pre>
          )}
          <button
            onClick={this.handleReload}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <RefreshCw size={16} /> Reload
          </button>
        </div>
      </div>
    );
  }
}
