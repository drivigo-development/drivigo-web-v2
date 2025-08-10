// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';
import { supabaseAdmin } from '../utils/supabaseAdmin';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to insert user data into the users table
  const insertUserToDatabase = async (user, metadata = {}) => {
    if (!user) {
      console.error('No user provided to insertUserToDatabase');
      return { data: null, error: new Error('No user provided') };
    }
    
    try {
      // Determine if this is a Google auth
      const isGoogleAuth = user.app_metadata?.provider === 'google' || 
                          (user.identities || []).some(i => i.provider === 'google');
      
      // Prepare user data with required fields
      const userData = {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || metadata.role, // Only use role from user metadata or passed metadata, no default
        name: user.user_metadata?.full_name || 
              user.user_metadata?.name || 
              metadata.name ||
              user.email.split('@')[0] || 'User' // Name is required, provide fallback
      };
      
      // console.log('Role from user metadata:', user.user_metadata?.role);
      // console.log('Role from passed metadata:', metadata.role);
      // console.log('Final role being used:', userData.role);
      
      // Add optional fields for profile image
      if (user.user_metadata) {
        userData.profile_img = user.user_metadata.avatar_url || 
                             user.user_metadata.picture || 
                             metadata.profile_img || null;
      }
      
      // console.log(`Inserting ${isGoogleAuth ? 'Google' : 'email'} user data:`, userData);
      
      // Insert user data into users table
      const { data, error } = await supabase
        .from('users')
        .upsert([userData], { onConflict: 'id' })
        .select();
        
      if (error) {
        console.error('Error inserting user data:', error);
        return { data: null, error };
      }
      
      // console.log('Successfully inserted/updated user data:', data);
      return { data, error: null };
    } catch (err) {
      console.error('Exception in insertUserToDatabase:', err);
      return { data: null, error: err };
    }
  };

  useEffect(() => {
    // Initialize auth and set up listener for auth state changes
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        setSession(data.session);
        setUser(data.session?.user || null);

        // Set up auth state change listener
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            // console.log('Auth state changed:', event, session?.user?.id);
            setSession(session);
            setUser(session?.user || null);
            
            // Handle sign-in events
            if (event === 'SIGNED_IN' && session?.user) {
              // console.log('User signed in:', session.user);
              
              // Always insert user data on sign in to ensure it exists
              const { error: insertError } = await insertUserToDatabase(session.user);
              
              if (insertError) {
                toast.error(`Error inserting user data: ${insertError.message}`);
              }
            }
            
            setLoading(false);
          }
        );

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Check if email already exists using admin API
  const checkEmailExists = async (email) => {
    try {
      setLoading(true);
      
      // Fetch all existing users (paginated) and check if the email already exists
      const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (usersError) {
        console.error('Error fetching users:', usersError);
        return { exists: false, error: usersError };
      }
      
      // Check if any user has the same email (case-insensitive)
      const emailExists = (usersData?.users ?? []).some(u => 
        (u.email ?? '').toLowerCase() === email.toLowerCase()
      );
      
      return { exists: emailExists, error: null };
    } catch (err) {
      console.error('Error checking email:', err);
      return { exists: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUpWithEmail = async (email, password, metadata = {}) => {
    try {
      setLoading(true);
      
      // First check if email already exists
      const { exists, error: checkError } = await checkEmailExists(email);
      
      if (checkError) {
        console.error('Error checking if email exists:', checkError);
      }
      
      if (exists) {
        return { data: null, error: new Error('This email is already registered. Please sign in instead.') };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      if (error) throw error;
      
      // Insert user data into users table
      if (data?.user) {
        // Use the shared function to insert user data
        const { error: insertError } = await insertUserToDatabase(data.user, metadata);
        
        if (insertError) {
          toast.error(`Error inserting user data: ${insertError.message}`);
          console.error('Error inserting user data:', insertError);
        }
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Error signing up:', err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signInWithEmail = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Error signing in:', err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with OAuth provider (Google)
  const signInWithGoogle = async (options = {}) => {
    try {
      setLoading(true);
      const { redirectTo } = options;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Error signing in with Google:', err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };
  
  // Handle Google OAuth callback
  const handleGoogleCallback = async (options = {}) => {
    try {
      setLoading(true);
      
      // Get the current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session in callback:', sessionError);
        return { error: sessionError };
      }
      
      if (!sessionData?.session?.user) {
        console.error('No user found in session during callback');
        return { error: new Error('No user found in session') };
      }
      
      // Get the role from options
      const { role } = options;
      // console.log('Google callback with role from URL:', role);
      
      // Check if this is a new user (sign up) or existing user (sign in)
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', sessionData.session.user.id)
        .single();
      
      // If user exists, this is a sign-in, and we don't need a role
      const isSignIn = !userCheckError && existingUser;
      
      if (role) {
        // Update the user metadata with the role
        // console.log('Updating user metadata with role:', role);
        const { error: updateError } = await supabase.auth.updateUser({
          data: { role }
        });
        
        if (updateError) {
          console.error('Error updating user metadata with role:', updateError);
          return { error: updateError };
        }
        
        // console.log('Successfully updated user metadata with role:', role);
        
        // Get the updated session after metadata update
        const { data: updatedSession, error: refreshError } = await supabase.auth.getSession();
        
        if (refreshError) {
          console.error('Error refreshing session after metadata update:', refreshError);
          return { error: refreshError };
        }
        
        // Create metadata object with the role
        const metadata = { role };
        
        // Explicitly insert user data into database with the role from URL
        const { error: insertError } = await insertUserToDatabase(updatedSession.session.user, metadata);
        
        if (insertError) {
          console.error('Error inserting user data during callback:', insertError);
          return { error: insertError };
        }
        
        // console.log('Successfully handled Google callback and inserted user data with role:', role);
        return { success: true };
      } else if (isSignIn) {
        // This is a sign-in for an existing user, so we don't need a role
        // Just insert/update the user data with whatever metadata we have
        const { error: insertError } = await insertUserToDatabase(sessionData.session.user);
        
        if (insertError) {
          console.error('Error inserting user data during sign-in callback:', insertError);
          return { error: insertError };
        }
        
        return { success: true };
      } else {
        // This is a new user (sign-up) but no role was provided
        console.error('No role provided for new user during sign-up');
        return { error: new Error('No role provided for new user') };
      }
    } catch (err) {
      console.error('Error in Google callback handler:', err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error('Error signing out:', err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Error resetting password:', err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Update user data
  const updateUserData = async (userData) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.updateUser({
        data: userData
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Error updating user data:', err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!session;
  const getUserRole = () => user?.user_metadata?.role || null;

  const value = {
    user,
    session,
    loading,
    error,
    isAuthenticated,
    getUserRole,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    handleGoogleCallback,
    signOut,
    resetPassword,
    updateUserData,
    checkEmailExists
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
