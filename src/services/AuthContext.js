// src/services/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add this function to create/update user profile
  const handleAuthChange = (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      // Create or update user profile
      const { user } = session;
      supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          username: user.user_metadata?.username || user.user_metadata?.name || (user.email ? user.email.split('@')[0] : 'Player'),
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          updated_at: new Date().toISOString()
        })
        .then(({ error }) => {
          if (error) console.error('Error creating user profile:', error);
          else console.log('User profile created/updated successfully');
        });
    }
  };

  useEffect(() => {
    // Set up initial session
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setUser(session?.user ?? null);
        
        // Create/update profile for existing user if they're logged in
        if (session?.user) {
          handleAuthChange('SIGNED_IN', session);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      
      // Call handle auth change on all auth events
      handleAuthChange(event, session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
}; 