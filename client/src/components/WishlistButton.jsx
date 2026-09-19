import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toggleWishlist } from '../api/account';
import { useToast } from './ui/Toast';

export default function WishlistButton({ productId, className = '', size = 14 }) {
  const { user, loading, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const inWishlist = !!user?.wishlist?.includes(productId);

  const mutation = useMutation({
    mutationFn: toggleWishlist,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], (old) => (old ? { ...old, wishlist: data.wishlist } : old));
      refreshUser();
      toast({
        type: 'success',
        message: inWishlist ? 'Removed from saved designs' : 'Saved to saved designs',
      });
    },
    onError: (err) => toast({ type: 'error', message: err?.message || 'Could not update saved designs' }),
  });

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    if (!user) {
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?redirect=${redirect}`);
      return;
    }
    mutation.mutate(productId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || mutation.isPending}
      aria-label={user ? (inWishlist ? 'Remove from saved designs' : 'Save to saved designs') : 'Save to saved designs'}
      aria-pressed={inWishlist}
      className={`w-9 h-9 flex items-center justify-center rounded-lg border backdrop-blur-sm transition-all ${
        inWishlist
          ? 'bg-black/60 border-white/25 text-red-400'
          : 'bg-black/60 border-white/25 text-white hover:text-[var(--accent)] hover:border-[var(--accent)]'
      } ${loading || mutation.isPending ? 'opacity-50 cursor-wait' : 'cursor-pointer'} ${className}`}
    >
      <Heart size={size} aria-hidden="true" fill={inWishlist ? 'currentColor' : 'none'} />
    </button>
  );
}