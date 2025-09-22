import { useAuthContext } from '@/contexts/AuthContext';

// Re-export the same API but sourced from the global AuthProvider
export interface UserProfile {
  id: string;
  full_name: string | null;
  role: string;
  status: string;
}

export const useAuth = () => useAuthContext();
