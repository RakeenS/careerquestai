import React, { createContext, useState, useEffect, useContext } from 'react'
import { supabase } from '../lib/supabaseClient'
import { sendDiscordNotification } from '../lib/discordWebhook'
import { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
  updateUserMetadata: (metadata: { [key: string]: any }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const setUserFromSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)
      
      // Don't initialize API usage to avoid 406 errors
    }
    setUserFromSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      
      // Check if this is a new signup (especially for Google OAuth)
      if (event === 'SIGNED_IN' && currentUser && session) {
        console.log('Auth event: SIGNED_IN', {
          userId: currentUser.id,
          email: currentUser.email,
          createdAt: currentUser.created_at,
          provider: currentUser.app_metadata?.provider
        });
        
        // Check if this is a new user by looking at created_at vs current time
        const userCreatedAt = new Date(currentUser.created_at);
        const now = new Date();
        const timeDiff = now.getTime() - userCreatedAt.getTime();
        const isNewUser = timeDiff < 60000; // Less than 1 minute old = new signup
        
        console.log('New user check:', {
          userCreatedAt: userCreatedAt.toISOString(),
          now: now.toISOString(),
          timeDiff,
          isNewUser
        });
        
        if (isNewUser) {
          // Determine signup method
          const signupMethod = currentUser.app_metadata?.provider === 'google' ? 'google' : 'email';
          
          console.log('Sending Discord notification for new user:', {
            email: currentUser.email,
            signupMethod
          });
          
          // Send Discord notification for new signups
          await sendDiscordNotification({
            email: currentUser.email || 'Unknown',
            name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Not provided',
            signup_method: signupMethod
          });
        }
      }
      
      // Don't initialize API usage to avoid 406 errors
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
    // Don't initialize API usage to avoid 406 errors
  }

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    // Don't initialize API usage to avoid 406 errors
  }

  const signOut = async () => {
    try {
      // Backup job applications before logout so they don't get lost
      let jobsBackup = null;
      try {
        // First try user-specific data
        if (user && user.id) {
          const userJobsKey = `${user.id}:interviews`;
          const userJobs = localStorage.getItem(userJobsKey);
          if (userJobs) {
            jobsBackup = userJobs;
            console.log('Backed up user job applications before logout');
          }
        }
        
        // If no user jobs, try generic jobs
        if (!jobsBackup) {
          const genericJobs = localStorage.getItem('interviews');
          if (genericJobs) {
            jobsBackup = genericJobs;
            console.log('Backed up generic job applications before logout');
          }
        }
        
        // If we found any jobs, save them to a special persistent key
        if (jobsBackup) {
          localStorage.setItem('persistent_job_applications', jobsBackup);
          console.log('Saved job applications to persistent storage');
        }
      } catch (backupError) {
        console.error('Error backing up job applications:', backupError);
      }
      
      // First clear user state
      setUser(null);
      
      // Clear local storage items that might cause issues
      localStorage.removeItem('supabase.auth.token');
      
      // Clear other session related localStorage items
      const userPrefix = localStorage.getItem('supabase.auth.token:name');
      if (userPrefix) {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith(userPrefix) || key.includes(':activities') || key.includes('api_usage'))) {
            keysToRemove.push(key);
          }
        }
        
        // Remove all found keys
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
      
      // Now sign out from Supabase
      await supabase.auth.signOut();
      console.log('Successfully signed out');
            
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during sign out:', error);
      
      // Force redirect to login even if there's an error
      window.location.href = '/login';
    }
  }

  const updateUserMetadata = async (metadata: { [key: string]: any }) => {
    const { data, error } = await supabase.auth.updateUser({ data: metadata })
    if (error) throw error
    setUser(data.user)
  }

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, updateUserMetadata }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}