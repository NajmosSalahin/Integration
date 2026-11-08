import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasAdminSection } from '../lib/permissions';

export default function AdminRoute({ section, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center">
        <div className="animate-pulse text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">Access denied — admin only</p>
        <Link to="/" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          Back to home
        </Link>
      </div>
    );
  }

  if (section && !hasAdminSection(user, section)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}