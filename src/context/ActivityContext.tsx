import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getActivities, saveActivity } from '../lib/supabaseStorage';

type Activity = {
  id: string;
  type: 'resume' | 'interview' | 'favorite' | 'application' | 'goal' | string;
  action: string;
  timestamp: number;
  details?: any;
  created_at?: string;
  related_entity_id?: string;
  related_entity_type?: string;
};

type ActivityContextType = {
  activities: Activity[];
  addActivity: (type: 'resume' | 'interview' | 'favorite' | 'application' | 'goal' | string, action: string, details?: any) => void;
  isLoading: boolean;
  refreshActivities: () => Promise<void>;
};

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load activities from Supabase (or localStorage fallback)
  const loadActivities = useCallback(async () => {
    console.log('ActivityContext: loadActivities called, user:', user?.id ? 'logged in' : 'not logged in');
    
    if (!user) {
      console.log('ActivityContext: No user, using localStorage only');
      // When not logged in, use localStorage only
      const savedActivities = localStorage.getItem('recentActivities');
      if (savedActivities) {
        const parsedActivities = JSON.parse(savedActivities);
        console.log('ActivityContext: Loaded activities from localStorage:', parsedActivities.length);
        setActivities(parsedActivities);
      } else {
        console.log('ActivityContext: No activities in localStorage');
      }
      return;
    }

    setIsLoading(true);
    try {
      console.log('ActivityContext: Fetching activities from Supabase for user:', user.id);
      // Get activities from Supabase (will use localStorage as fallback)
      const fetchedActivities = await getActivities(user.id, 10);
      console.log('ActivityContext: Received activities from Supabase:', fetchedActivities?.length || 0);
      
      // Convert to our Activity type format
      const formattedActivities = fetchedActivities.map((activity: any) => ({
        id: activity.id.toString(),
        type: activity.type,
        action: activity.action,
        timestamp: new Date(activity.created_at).getTime(),
        details: activity.details,
        created_at: activity.created_at,
        related_entity_id: activity.related_entity_id,
        related_entity_type: activity.related_entity_type
      }));
      
      console.log('ActivityContext: Setting formatted activities:', formattedActivities.length);
      setActivities(formattedActivities);
    } catch (error) {
      console.error('ActivityContext: Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    console.log('ActivityContext: Initial load effect triggered');
    loadActivities();
  }, [loadActivities]);

  // Save to localStorage as a backup for non-logged in users
  useEffect(() => {
    localStorage.setItem('recentActivities', JSON.stringify(activities));
  }, [activities]);

  // Add a new activity - save to Supabase if logged in
  const addActivity = useCallback(async (type: 'resume' | 'interview' | 'favorite' | 'application' | 'goal' | string, action: string, details: any = {}) => {
    console.log('ActivityContext: Adding new activity', { type, action });
    
    // Create local activity object for immediate UI update
    const newActivity: Activity = {
      id: Date.now().toString(),
      type,
      action,
      timestamp: Date.now(),
      details,
      created_at: new Date().toISOString(),
    };
    
    // Update state with optimistic UI update
    setActivities(prevActivities => {
      console.log('ActivityContext: Updating activities state with new activity');
      return [newActivity, ...prevActivities.slice(0, 9)];
    });
    
    // Save to Supabase if logged in
    if (user && user.id) {
      try {
        console.log('ActivityContext: Saving activity to Supabase for user:', user.id);
        await saveActivity(user.id, type, action, details);
        console.log('ActivityContext: Successfully saved activity to Supabase');
      } catch (error) {
        console.error('ActivityContext: Error saving activity to Supabase:', error);
      }
    } else {
      console.log('ActivityContext: No user logged in, skipping Supabase save');
    }
  }, [user]);

  // Function to manually refresh activities
  const refreshActivities = useCallback(async () => {
    console.log('ActivityContext: Manual refresh triggered');
    await loadActivities();
  }, [loadActivities]);

  return (
    <ActivityContext.Provider value={{ activities, addActivity, isLoading, refreshActivities }}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};