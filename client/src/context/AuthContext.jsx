import { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMe, login as apiLogin, signup as apiSignup, logout as apiLogout } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [initialized, setInitialized] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        return await getMe();
      } catch {
        return null;
      }
    },
    retry: 1,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!isLoading) {
      setInitialized(true);
    }
  }, [isLoading]);

  const loginMutation = useMutation({
    mutationFn: apiLogin,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
    },
  });

  const signupMutation = useMutation({
    mutationFn: apiSignup,
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: apiLogout,
    onSettled: () => {
      queryClient.setQueryData(['user'], null);
      queryClient.clear();
    },
  });

  const refreshUser = () => queryClient.invalidateQueries({ queryKey: ['user'] });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        loading: !initialized,
        login: loginMutation.mutateAsync,
        signup: signupMutation.mutateAsync,
        logout: logoutMutation.mutateAsync,
        refreshUser,
        loginError: loginMutation.error,
        signupError: signupMutation.error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
