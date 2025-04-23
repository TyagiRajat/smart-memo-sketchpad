
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User } from '@/types';

// Initialize Supabase client only if environment variables are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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

// Initialize supabase conditionally to avoid errors
let supabase = null;
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (isSupabaseConfigured) {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase not configured. Using mock authentication.');
}

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
      
      if (isSupabaseConfigured && supabase) {
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
      } else {
        // Use local storage for mock authentication
        const session = authStorage.getSession();
        if (session) {
          setUser(session.user);
        }
      }
      
      setLoading(false);
    };

    checkSession();

    // Subscribe to auth changes if using Supabase
    let subscription: { unsubscribe: () => void } | null = null;
    
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
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
      
      subscription = data.subscription;
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        // Use Supabase authentication
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        
        if (error) throw error;
        
        toast.success('Signed in successfully');
        navigate('/dashboard');
      } else {
        // Use mock authentication
        const user = mockUsers.getUserByEmail(email);
        if (!user || user.password !== password) {
          throw new Error('Invalid email or password');
        }
        
        const userData: User = {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
        };
        
        // Save session to local storage
        authStorage.saveSession({
          user: userData
        });
        
        setUser(userData);
        toast.success('Signed in successfully');
        navigate('/dashboard');
      }
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
      if (isSupabaseConfigured && supabase) {
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
      } else {
        // Mock Google sign in for development
        toast.info('Mock Google sign in (Supabase not configured)');
        
        // Create a mock user
        const mockUser: User = {
          id: 'google-mock-' + Date.now(),
          email: 'google-user@example.com',
          name: 'Google User',
          avatar_url: 'https://lh3.googleusercontent.com/a/default-user',
        };
        
        // Save mock user and session
        mockUsers.saveUser({
          ...mockUser,
          password: 'mockpassword'
        });
        
        authStorage.saveSession({
          user: mockUser
        });
        
        setUser(mockUser);
        navigate('/dashboard');
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
      if (isSupabaseConfigured && supabase) {
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
      } else {
        // Mock sign up
        const existingUser = mockUsers.getUserByEmail(email);
        if (existingUser) {
          throw new Error('Email already in use');
        }
        
        const newUser = {
          id: 'mock-' + Date.now().toString(),
          email,
          password,
          name,
          avatar_url: undefined,
        };
        
        mockUsers.saveUser(newUser);
        
        const userData: User = {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          avatar_url: newUser.avatar_url,
        };
        
        // Save session
        authStorage.saveSession({
          user: userData
        });
        
        setUser(userData);
        toast.success('Account created successfully');
        navigate('/dashboard');
      }
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
      if (isSupabaseConfigured && supabase) {
        // Use Supabase sign out
        const { error } = await supabase.auth.signOut();
        
        if (error) throw error;
      } else {
        // Clear mock session
        authStorage.clearSession();
      }
      
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

export { supabase }; // Export supabase instance even if it's null
