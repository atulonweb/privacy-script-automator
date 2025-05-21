
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  resendVerificationEmail: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Make sure AuthProvider is a proper React component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Check if user is admin
        if (currentSession?.user) {
          const metadata = currentSession.user.app_metadata;
          setIsAdmin(metadata?.role === 'admin');
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Check if user is admin
      if (currentSession?.user) {
        const metadata = currentSession.user.app_metadata;
        setIsAdmin(metadata?.role === 'admin');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      toast.success('Registration Successful', {
        description: 'Please check your email for verification.'
      });
    } catch (error: any) {
      toast.error('Registration Failed', {
        description: error.message || 'Please try again.'
      });
      throw error;
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) throw error;
      toast.success('Verification Email Sent', {
        description: 'Please check your inbox.'
      });
    } catch (error: any) {
      toast.error('Failed to Send Verification', {
        description: error.message || 'Please try again later.'
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle email_not_confirmed error specially
        if (error.message.includes('Email not confirmed')) {
          throw new Error('email_not_confirmed');
        }
        throw error;
      }
      
      // Redirect based on user role
      if (data.user?.app_metadata?.role === 'admin') {
        navigate('/admin');
        toast.success('Admin Login Successful', {
          description: 'Welcome back to your admin dashboard!'
        });
      } else {
        navigate('/dashboard');
        toast.success('Login Successful', {
          description: 'Welcome back!'
        });
      }
    } catch (error: any) {
      if (error.message !== 'email_not_confirmed') {
        toast.error('Login Failed', {
          description: error.message || 'Invalid credentials. Please try again.'
        });
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
      toast.success('Logout Successful', {
        description: 'You have been logged out successfully.'
      });
    } catch (error: any) {
      toast.error('Logout Failed', {
        description: error.message || 'There was a problem logging out.'
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin,
    resendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
