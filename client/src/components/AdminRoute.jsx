import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8] flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">Access denied — admin only</p>
        <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
          Back to home
        </Link>
      </div>
    );
  }

  return children;
}
