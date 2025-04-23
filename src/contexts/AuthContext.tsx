import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User } from '@/types';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with the provided credentials
const supabaseUrl = 'https://khmeghcoocsegjsrgsaw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtobWVnaGNvb2NzZWdqc3Jnc2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMzIwMjQsImV4cCI6MjA2MDkwODAyNH0.3eY-lb2UFIGFhbD6shyWGxE26XYT0Y24Jd6onARhyQ8';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Maintain the mockUsers and authStorage for fallback/testing purposes
// Create a mock storage for users when Supabase is not configured
const mockUsers = {
  getUsers: () => {
    const users = localStorage.getItem('mock_users');
    return users ? JSON.parse(users) : [];
  },
  saveUser: (user: any) => {
    const users = mockUsers.getUsers();
    const existingUser = users.find((u: any) => u.email === user.email);
    if (!existingUser) {
      users.push(user);
      localStorage.setItem('mock_users', JSON.stringify(users));
    }
    return user;
  },
  getUserByEmail: (email: string) => {
    const users = mockUsers.getUsers();
    return users.find((u: any) => u.email === email);
  }
};

// Storage for auth session
const authStorage = {
  getSession: () => {
    const session = localStorage.getItem('auth_session');
    return session ? JSON.parse(session) : null;
  },
  saveSession: (session: any) => {
    localStorage.setItem('auth_session', JSON.stringify(session));
  },
  clearSession: () => {
    localStorage.removeItem('auth_session');
  }
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const checkSession = async () => {
      setLoading(true);
      
      try {
        // Get current session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Get user data from session
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            avatar_url: session.user.user_metadata?.avatar_url || undefined,
          };
          
          setUser(userData);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          avatar_url: session.user.user_metadata?.avatar_url || undefined,
        };
        
        setUser(userData);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Use Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      toast.success('Signed in successfully');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Use Supabase OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Note: Successful OAuth redirects away from the app
      if (!data.url) {
        toast.error('Failed to initialize Google sign in');
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      // Use Supabase sign up
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name
          },
        }
      });
      
      if (error) throw error;
      
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Use Supabase sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setUser(null);
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message || 'Failed to sign out');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { supabase }; // Export supabase instance
