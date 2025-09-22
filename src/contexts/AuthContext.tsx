import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  full_name: string | null;
  role: string;
  status: string;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, accountType: string) => Promise<{ error: { message: string } | null }>;
  signIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  signOut: () => Promise<{ error: { message: string } | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(async () => {
          try {
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user!.id)
              .single();

            if (error) {
              console.error('Error fetching profile:', error);
              setProfile(null);
            } else {
              setProfile(profileData as UserProfile);
            }
          } catch (err) {
            console.error('Error in profile fetch:', err);
            setProfile(null);
          } finally {
            setLoading(false);
          }
        }, 0);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp: AuthContextValue['signUp'] = async (email, password, fullName, accountType) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            role: accountType,
          },
        },
      });
      if (error) {
        toast({ variant: 'destructive', title: 'Erro no cadastro', description: error.message });
        return { error } as any;
      }
      toast({ title: 'Cadastro realizado!', description: 'Verifique seu email para confirmar a conta.' });
      return { error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({ variant: 'destructive', title: 'Erro no cadastro', description: message });
      return { error: { message } };
    }
  };

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ variant: 'destructive', title: 'Erro no login', description: error.message });
        return { error } as any;
      }
      return { error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({ variant: 'destructive', title: 'Erro no login', description: message });
      return { error: { message } };
    }
  };

  const signOut: AuthContextValue['signOut'] = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao sair', description: error.message });
        return { error } as any;
      }
      toast({ title: 'Logout realizado', description: 'Você foi desconectado com sucesso.' });
      return { error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({ variant: 'destructive', title: 'Erro ao sair', description: message });
      return { error: { message } };
    }
  };

  const value = useMemo<AuthContextValue>(() => ({ user, session, profile, loading, signUp, signIn, signOut }), [user, session, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
