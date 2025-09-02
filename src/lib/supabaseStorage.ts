import { supabase, ensureAuthenticated } from './supabaseClient';
import type { 
  ResumeContent, 
  Interview, 
  JobApplication,
  JobApplicationForUpsert,
  UserStats
} from '../types';
import { saveToLocalStorage } from '../utils/storageUtils';

// Define interfaces for the Supabase response types
interface SupabaseResponse<T> {
  data: T[] | null;
  error: SupabaseError | null;
}

interface SupabaseSingleResponse<T> {
  data: T | null;
  error: SupabaseError | null;
}

// Extend Error interface to include code property from Supabase errors
interface SupabaseError extends Error {
  code?: string;
}

// Improved timeout utility function with proper typing
const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number = 30000, fallback: T | null = null, retryCount: number = 2): Promise<T | null> => {
  let attempts = 0;
  const executeWithRetry = async (): Promise<T | null> => {
    attempts++;
    const timeoutPromise = new Promise<null>((_, reject) => 
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    );
    
    try {
      // Race between the actual operation and the timeout
      return await Promise.race([
        promise,
        timeoutPromise
      ]) as T;
    } catch (error) {
      // If we have retries left, try again
      if (attempts <= retryCount) {
        console.warn(`Operation attempt ${attempts} failed, retrying... (${retryCount - attempts + 1} attempts left)`);
        // Exponential backoff - wait longer between retries
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        return executeWithRetry();
      }
      
      console.warn('Operation timed out or failed after all retry attempts:', error);
      return fallback;
    }
  };
  
  return executeWithRetry();
};

// Supabase PostgrestBuilder to Promise converter helper
const toPromise = <T>(builder: any): Promise<T> => {
  return builder
    .then((res: any) => {
      // If there's an error property, throw it to be caught by the withTimeout wrapper
      if (res.error) {
        throw res.error;
      }
      return res;
    });
};

// Resume functions
export const saveResume = async (
  userId: string, 
  resume: ResumeContent, 
  incrementCounter: boolean = false
): Promise<ResumeContent> => {
  try {
    console.log('Starting saveResume with userId:', userId);
    
    if (!userId) {
      console.error('No userId provided to saveResume');
      throw new Error('User ID is required to save resume');
    }
    
    const resumeId = resume.id || crypto.randomUUID();
    console.log('Using resumeId:', resumeId);
    
    // Remove the fileUrl property if it's a blob URL - it cannot be stored
    const resumeToSave = { ...resume, id: resumeId };
    if (resumeToSave.fileUrl && resumeToSave.fileUrl.startsWith('blob:')) {
      console.log('Removing blob URL from resume data before saving');
      delete resumeToSave.fileUrl;
    }
    
    // Always store in localStorage as primary storage
    console.log('Storing resume in localStorage');
    localStorage.setItem(`resume_${resumeId}`, JSON.stringify(resumeToSave));
    
    // Set a flag indicating we have resume data
    localStorage.setItem('has_resume_data', 'true');
    
    // Attempt to save to Supabase with a timeout
    try {
      // Ensure user is authenticated first
      await ensureAuthenticated();
      
      // Prepare resume for Supabase storage
      const supabaseResume = {
        id: resumeId,
        user_id: userId,
        name: resumeToSave.name,
        content: JSON.stringify(resumeToSave), // Properly stringify the object to JSON
        job_title: resumeToSave.jobTitle || '',
        last_updated: new Date().toISOString()
      };
      
      console.log('Saving resume to Supabase with stringified content');
      
      // Save to Supabase with timeout (30 seconds)
      await withTimeout(
        toPromise(supabase
          .from('resumes')
          .upsert(supabaseResume, { onConflict: 'id' })),
        30000
      );
      
      console.log('Resume successfully saved to Supabase');
    } catch (error) {
      console.warn('Failed to save resume to Supabase (using localStorage only):', error);
      // Continue execution - we've already saved to localStorage
    }
    
    // Only update user stats if explicitly requested (manual save by user)
    if (incrementCounter) {
      console.log('Incrementing resume counter for user', userId);
      updateUserStats(userId, { resumes_created: 1 }).catch(error => 
        console.warn('Failed to update user stats:', error)
      );
    }
    
    return resumeToSave;
  } catch (error) {
    console.error('Error in saveResume:', error);
    throw error;
  }
};

export const getResumes = async (userId: string): Promise<ResumeContent[]> => {
  try {
    // Get last usage record from localStorage
    const lastResumePull = localStorage.getItem(`${userId}:last_resume_pull`);
    const lastUsageTime = lastResumePull ? new Date(lastResumePull).getTime() : 0;
    const now = new Date().getTime();
    
    // Return cached resumes if we've pulled them recently (last 5 minutes)
    if (now - lastUsageTime < 5 * 60 * 1000) {
      const cachedResumes = localStorage.getItem(`${userId}:resumes`);
      if (cachedResumes) {
        return JSON.parse(cachedResumes);
      }
    }
    
    // Otherwise, get from Supabase
    try {
      // Ensure user is authenticated before querying
      await ensureAuthenticated();
      
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('last_updated', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data && Array.isArray(data)) {
        // Convert from Supabase format to app format with proper structure for the Dashboard
        const resumes = data.map((record: any) => {
          // Parse the content string to get the resume data
          let parsedContent;
          try {
            parsedContent = JSON.parse(record.content);
          } catch (e) {
            console.error('Error parsing resume content:', e);
            parsedContent = {};
          }
          
          // Create a properly structured resume object for the Dashboard
          return {
            id: record.id,
            name: record.name || 'Unnamed Resume',
            // Extract jobTitle from the parsed content since there's no jobTitle column
            jobTitle: parsedContent.jobTitle || parsedContent.personalInfo?.title || 'No Title',
            lastUpdated: record.last_updated || record.created_at || new Date().toISOString(),
            content: record.content,
            // Include parsed content fields directly as needed
            ...parsedContent
          };
        });
        
        console.log('Processed resumes for dashboard:', resumes);
        
        // Cache resumes in localStorage
        localStorage.setItem(`${userId}:resumes`, JSON.stringify(resumes));
        localStorage.setItem(`${userId}:last_resume_pull`, new Date().toISOString());
        
        return resumes;
      } else {
        throw new Error('Failed to get resumes from Supabase');
      }
    } catch (error) {
      console.warn('Supabase getResumes failed, falling back to localStorage:', error);
      
      // Fallback to localStorage
      const cachedResumes = localStorage.getItem(`${userId}:resumes`);
      if (cachedResumes) {
        return JSON.parse(cachedResumes);
      }
      
      return [];
    }
  } catch (error) {
    console.error('Error getting resumes:', error);
    return [];
  }
};

// Job application functions
export const saveJobApplication = async (userId: string, application: any): Promise<any> => {
  try {
    console.log('Saving job application for user:', userId);
    
    const appId = application.id || crypto.randomUUID();
    const appToSave = { ...application, id: appId };
    
    // Always save to localStorage first
    localStorage.setItem(`job_application_${appId}`, JSON.stringify(appToSave));
    
    // Set a flag indicating we have application data
    localStorage.setItem('has_job_application_data', 'true');
    
    // Try to save to Supabase with timeout
    try {
      // Format for Supabase
      const supabaseApp = {
        id: appId,
        user_id: userId,
        company: appToSave.company,
        position: appToSave.position,
        status: appToSave.status,
        date: appToSave.date,
        notes: appToSave.notes || '',
        last_updated: new Date().toISOString()
      };
      
      // Save with 30 second timeout
      await withTimeout(
        toPromise(supabase
          .from('job_applications')
          .upsert(supabaseApp, { onConflict: 'id' })),
        30000
      );
      
      console.log('Job application saved to Supabase');
    } catch (error) {
      console.warn('Failed to save job application to Supabase (using localStorage only):', error);
    }
    
    // Update user stats in the background
    updateUserStats(userId, { applications_submitted: 1 }).catch(error => 
      console.warn('Failed to update user stats for job application:', error)
    );
    
    return appToSave;
  } catch (error) {
    console.error('Error saving job application:', error);
    throw error;
  }
};

export const getJobApplications = async (userId: string): Promise<JobApplication[]> => {
  try {
    // Get last usage record from localStorage
    const lastAppPull = localStorage.getItem(`${userId}:last_apps_pull`);
    const lastUsageTime = lastAppPull ? new Date(lastAppPull).getTime() : 0;
    const now = new Date().getTime();
    
    // Return cached applications if we've pulled them recently (last 5 minutes)
    if (now - lastUsageTime < 5 * 60 * 1000) {
      const cachedApps = localStorage.getItem(`${userId}:applications`);
      if (cachedApps) {
        return JSON.parse(cachedApps);
      }
    }
    
    // Try to get from Supabase with timeout
    try {
      const supabaseApps = await withTimeout<SupabaseResponse<JobApplication>>(
        toPromise<SupabaseResponse<JobApplication>>(supabase
          .from('job_applications')
          .select('*')
          .eq('user_id', userId)
          .order('last_updated', { ascending: false })),
        30000,
        { data: [], error: null }  // Default on timeout
      );
      
      if (supabaseApps && supabaseApps.data && Array.isArray(supabaseApps.data)) {
        // Convert IDs to ensure compatibility with app expectations
        const applications = supabaseApps.data.map((record: JobApplication) => {
          return {
            id: record.id,
            company: record.company,
            position: record.position,
            status: record.status,
            date: record.date,
            notes: record.notes,
            salaryMin: record.salaryMin,
            salaryMax: record.salaryMax,
            skills: record.skills || []
          };
        });
        
        // Cache applications in localStorage
        localStorage.setItem(`${userId}:applications`, JSON.stringify(applications));
        localStorage.setItem(`${userId}:last_apps_pull`, new Date().toISOString());
        
        return applications;
      } else {
        throw new Error('Failed to get applications from Supabase');
      }
    } catch (error) {
      console.warn('Supabase getJobApplications failed, falling back to localStorage:', error);
      
      // Fallback to localStorage
      const cachedApps = localStorage.getItem(`${userId}:applications`);
      if (cachedApps) {
        return JSON.parse(cachedApps);
      }
      
      return [];
    }
  } catch (error) {
    console.error('Error getting job applications:', error);
    return [];
  }
};

// User stats functions
export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    // Check localStorage first for immediate response
    const localStatsKey = `user_stats_${userId}`;
    const localStats = localStorage.getItem(localStatsKey);
    let cachedStats = localStats ? JSON.parse(localStats) : null;
    
    // If we have cached stats, return them immediately
    if (cachedStats) {
      return cachedStats;
    }
    
    // Try to get from Supabase with timeout
    try {
      const response = await withTimeout<SupabaseSingleResponse<UserStats>>(
        toPromise<SupabaseSingleResponse<UserStats>>(supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userId)
          .single()),
        30000,
        { data: null, error: null }
      );
      
      if (response) {
        const { data, error } = response;
        
        if (error) {
          if (error.code === 'PGRST116') {
            // No stats found for this user, create default
            const defaultStats: UserStats = {
              resumes_count: 0,
              applications_count: 0,
              interviews_completed: 0,
              job_offers: 0,
              last_login: new Date().toISOString()
            };
            
            // Try to create with timeout
            await withTimeout<SupabaseResponse<any>>(
              toPromise<SupabaseResponse<any>>(supabase
                .from('user_stats')
                .insert({
                  user_id: userId,
                  ...defaultStats
                })),
              30000
            );
            
            // Cache in localStorage
            localStorage.setItem(localStatsKey, JSON.stringify(defaultStats));
            
            return defaultStats;
          }
          
          throw error;
        }
        
        if (data) {
          // Cache in localStorage
          localStorage.setItem(localStatsKey, JSON.stringify(data));
          return data;
        }
      }
    } catch (error) {
      console.warn('Failed to get user stats from Supabase:', error);
    }
    
    // Default stats as fallback
    const defaultStats: UserStats = {
      resumes_count: 0,
      applications_count: 0,
      interviews_completed: 0,
      job_offers: 0,
      last_login: new Date().toISOString()
    };
    
    localStorage.setItem(localStatsKey, JSON.stringify(defaultStats));
    
    return defaultStats;
  } catch (error) {
    console.error('Error in getUserStats:', error);
    
    // Return empty stats
    return {
      resumes_count: 0,
      applications_count: 0,
      interviews_completed: 0,
      job_offers: 0
    };
  }
};

// Update user stats incrementally
export const updateUserStats = async (userId: string, updates: Record<string, number>): Promise<void> => {
  try {
    if (!userId) return;
    
    const localStatsKey = `user_stats_${userId}`;
    
    // Get current stats
    let currentStats: UserStats = {};
    try {
      const localStats = localStorage.getItem(localStatsKey);
      currentStats = localStats ? JSON.parse(localStats) : {};
    } catch (e) {
      console.warn('Error parsing local stats for update:', e);
    }
    
    // Update stats with correct column names
    const updatedStats: UserStats = { ...currentStats };
    
    // Map the updates to the correct column names if needed
    const columnMappings: Record<string, string> = {
      'resumes_created': 'resumes_count',
      'applications_created': 'applications_count'
    };
    
    Object.entries(updates).forEach(([key, increment]) => {
      // Use the mapped column name if it exists, otherwise use the original key
      const mappedKey = columnMappings[key] || key;
      updatedStats[mappedKey] = (updatedStats[mappedKey] || 0) + increment;
    });
    
    // Always update last login
    updatedStats.last_login = new Date().toISOString();
    
    // Save to localStorage
    localStorage.setItem(localStatsKey, JSON.stringify(updatedStats));
    
    // Try to update Supabase with timeout
    try {
      // Ensure user is authenticated first
      await ensureAuthenticated();
      
      await withTimeout(
        toPromise(supabase
          .from('user_stats')
          .upsert({
            user_id: userId,
            resumes_count: updatedStats.resumes_count || 0,
            applications_count: updatedStats.applications_count || 0,
            interviews_completed: updatedStats.interviews_completed || 0,
            job_offers: updatedStats.job_offers || 0,
            last_login: updatedStats.last_login,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' })),
        30000
      );
    } catch (error) {
      console.warn('Failed to update user stats in Supabase:', error);
    }
  } catch (error) {
    console.error('Error in updateUserStats:', error);
  }
};

// Activity tracking
interface SupabaseUserActivity {
  id?: string | number;
  user_id: string;
  type: string;
  action: string;
  details?: any;
  created_at?: string;
  related_entity_id?: string;
  related_entity_type?: string;
}

export const saveActivityDetails = async (activityId: number | string, details: any): Promise<any> => {
  try {
    // Try to update Supabase with timeout
    try {
      await withTimeout(
        toPromise(supabase
          .from('user_activities')
          .update({
            details: details
          })
          .eq('id', activityId)),
        30000
      );
    } catch (error) {
      console.warn('Failed to save activity details in Supabase:', error);
    }
  } catch (error) {
    console.error('Error saving activity details:', error);
  }
};

export const getActivities = async (userId: string, limit: number = 10): Promise<any[]> => {
  console.log('supabaseStorage: getActivities called for user', userId, 'with limit', limit);
  try {
    // Get last usage record from localStorage
    const lastActivityPull = localStorage.getItem(`${userId}:last_activity_pull`);
    const lastUsageTime = lastActivityPull ? new Date(lastActivityPull).getTime() : 0;
    const now = new Date().getTime();
    const cacheAge = now - lastUsageTime;
    
    console.log('supabaseStorage: Last activity pull:', lastActivityPull || 'never', 
                'Cache age:', Math.round(cacheAge/1000), 'seconds');
    
    // Return cached activities if we've pulled them recently (last 5 minutes)
    if (cacheAge < 5 * 60 * 1000) {
      console.log('supabaseStorage: Cache is recent, checking localStorage');
      const cachedActivities = localStorage.getItem(`${userId}:activities`);
      if (cachedActivities) {
        const parsed = JSON.parse(cachedActivities);
        console.log('supabaseStorage: Using cached activities from localStorage:', parsed.length);
        return parsed;
      }
      console.log('supabaseStorage: No cached activities found despite recent pull time');
    }
    
    console.log('supabaseStorage: Cache expired or empty, fetching from Supabase');
    
    // Try to get from Supabase with timeout
    try {
      console.log('supabaseStorage: Querying Supabase user_activities table for user_id:', userId);
      
      const supabaseActivities = await withTimeout<SupabaseResponse<any>>(
        toPromise<SupabaseResponse<SupabaseUserActivity>>(supabase
          .from('user_activities')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)),
        30000,
        { data: [], error: null }
      );
      
      console.log('supabaseStorage: Supabase query response:', 
                  supabaseActivities?.error ? 'ERROR' : 'SUCCESS', 
                  'Data records:', supabaseActivities?.data?.length || 0);
      
      if (supabaseActivities?.error) {
        console.error('supabaseStorage: Error from Supabase:', supabaseActivities.error);
      }
      
      if (supabaseActivities && supabaseActivities.data && Array.isArray(supabaseActivities.data)) {
        const activities = supabaseActivities.data.map((record: any) => {
          console.log('supabaseStorage: Processing activity record:', record.id, record.type, record.action);
          return {
            id: record.id,
            user_id: record.user_id,
            type: record.type,
            action: record.action,
            details: record.details || {},
            created_at: record.created_at,
            related_entity_id: record.related_entity_id,
            related_entity_type: record.related_entity_type
          };
        });
        
        // Cache activities in localStorage
        localStorage.setItem(`${userId}:activities`, JSON.stringify(activities));
        localStorage.setItem(`${userId}:last_activity_pull`, new Date().toISOString());
        
        console.log(`supabaseStorage: Retrieved ${activities.length} activities from Supabase`);
        console.log('supabaseStorage: First few activities:', activities.slice(0, 3));
        return activities;
      } else {
        console.warn('supabaseStorage: No activities found in Supabase or invalid response');
        throw new Error('Failed to get activities from Supabase');
      }
    } catch (error) {
      console.warn('supabaseStorage: Supabase getActivities failed, falling back to localStorage:', error);
      
      // Fallback to localStorage
      const cachedActivities = localStorage.getItem(`${userId}:activities`);
      if (cachedActivities) {
        const parsed = JSON.parse(cachedActivities);
        console.log('supabaseStorage: Using fallback activities from localStorage:', parsed.length);
        return parsed;
      }
      
      console.log('supabaseStorage: No activities in localStorage fallback, returning empty array');
      return [];
    }
  } catch (error) {
    console.error('supabaseStorage: Error getting activities:', error);
    console.log('supabaseStorage: Returning empty activities array due to error');
    return [];
  }
};

// User goals
interface SupabaseUserGoal {
  id?: string | number;
  user_id: string;
  title: string;
  target: number;
  current: number;
  due_date?: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export const getGoals = async (userId: string): Promise<SupabaseUserGoal[]> => {
  try {
    // Get last usage record from localStorage
    const lastGoalsPull = localStorage.getItem(`${userId}:last_goals_pull`);
    const lastUsageTime = lastGoalsPull ? new Date(lastGoalsPull).getTime() : 0;
    const now = new Date().getTime();
    
    // Return cached goals if we've pulled them recently (last 5 minutes)
    if (now - lastUsageTime < 5 * 60 * 1000) {
      const cachedGoals = localStorage.getItem(`${userId}:goals`);
      if (cachedGoals) {
        return JSON.parse(cachedGoals);
      }
    }
    
    // Try to get from Supabase with timeout
    try {
      const supabaseGoals = await withTimeout<SupabaseResponse<any>>(
        toPromise<SupabaseResponse<any>>(supabase
          .from('user_goals')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })),
        30000,
        { data: [], error: null }
      );
      
      if (supabaseGoals && supabaseGoals.data && Array.isArray(supabaseGoals.data)) {
        const goals = supabaseGoals.data.map((record: SupabaseUserGoal) => ({
          id: record.id,
          user_id: record.user_id,
          title: record.title,
          target: record.target,
          current: record.current,
          due_date: record.due_date,
          completed: record.completed,
          created_at: record.created_at,
          updated_at: record.updated_at
        }));
        
        // Filter out goals that might not be fully formed
        const validGoals = goals.filter(g => g.id && g.title);
        
        // Cache goals in localStorage
        localStorage.setItem(`${userId}:goals`, JSON.stringify(validGoals));
        localStorage.setItem(`${userId}:last_goals_pull`, new Date().toISOString());
        
        return validGoals;
      } else {
        throw new Error('Failed to get goals from Supabase');
      }
    } catch (error) {
      console.warn('Supabase getGoals failed, falling back to localStorage:', error);
      
      // Fallback to localStorage
      const cachedGoals = localStorage.getItem(`${userId}:goals`);
      if (cachedGoals) {
        return JSON.parse(cachedGoals);
      }
      
      return [];
    }
  } catch (error) {
    console.error('Error getting goals:', error);
    return [];
  }
};

// Job interview tracking with comprehensive debugging and fallback mechanisms
export const getInterviews = async (userId: string): Promise<Interview[]> => {
  console.log('getInterviews: Loading job applications for user', userId);
  try {
    // Get last usage record from localStorage
    const lastInterviewsPull = localStorage.getItem(`${userId}:last_interviews_pull`);
    const lastUsageTime = lastInterviewsPull ? new Date(lastInterviewsPull).getTime() : 0;
    const now = new Date().getTime();
    const cacheAge = Math.round((now - lastUsageTime) / 1000);
    
    console.log(`getInterviews: Last pull: ${lastInterviewsPull || 'never'}, Cache age: ${cacheAge} seconds`);
    
    // Check table exists first
    try {
      console.log('getInterviews: Checking if job_applications table exists');
      const { data: tableCheck, error: tableError } = await supabase
        .from('job_applications')
        .select('id')
        .limit(1);
      
      if (tableError) {
        console.error('getInterviews: Error checking job_applications table:', tableError);
        // If there's a table error, go straight to localStorage checks
        throw new Error('Table check failed, trying localStorage');
      }
      
      console.log(`getInterviews: Table check successful, table exists: ${!!tableCheck}`);
    } catch (tableCheckError) {
      console.error('getInterviews: Exception checking job_applications table:', tableCheckError);
      // Continue to try the main query anyway
    }
    
    // Always try Supabase first, regardless of cache timing
    console.log('getInterviews: Querying job_applications from Supabase');
    
    // Try to get from Supabase with timeout
    try {
      const supabaseInterviews = await withTimeout<SupabaseResponse<Interview>>(
        toPromise<SupabaseResponse<Interview>>(supabase
          .from('job_applications')  // Use job_applications table instead of interviews
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })),
        30000,
        { data: [], error: null }
      );
      
      if (supabaseInterviews && supabaseInterviews.error) {
        console.error('getInterviews: Supabase query error:', supabaseInterviews.error);
        throw new Error(`Supabase query failed: ${supabaseInterviews.error.message}`);
      }
      
      if (supabaseInterviews && supabaseInterviews.data && Array.isArray(supabaseInterviews.data)) {
        const interviews = supabaseInterviews.data;
        console.log(`getInterviews: Successfully loaded ${interviews.length} job applications from Supabase`);
        
        if (interviews.length > 0) {
          console.log('getInterviews: Sample job application from Supabase:', {
            id: interviews[0].id,
            company: interviews[0].company,
            position: interviews[0].position,
            status: interviews[0].status
          });
          
          // Cache interviews in multiple localStorage keys for redundancy
          localStorage.setItem('interviews', JSON.stringify(interviews));
          localStorage.setItem(`${userId}:interviews`, JSON.stringify(interviews));
          localStorage.setItem('job_applications', JSON.stringify(interviews));
          localStorage.setItem(`${userId}:job_applications`, JSON.stringify(interviews));
          localStorage.setItem(`${userId}:last_interviews_pull`, new Date().toISOString());
          
          return interviews;
        } else {
          console.log('getInterviews: No job applications found in Supabase, checking localStorage');
        }
      } else {
        console.warn('getInterviews: Invalid response format from Supabase');
        throw new Error('Invalid Supabase response format');
      }
    } catch (supabaseError) {
      console.warn('getInterviews: Supabase query failed, falling back to localStorage:', supabaseError);
    }
    
    // If we get here, we need to try localStorage (either cache expiry or Supabase error or empty result)
    console.log('getInterviews: Checking localStorage for job applications');
    
    // Try multiple localStorage keys for redundancy
    const localStorageKeys = [
      `${userId}:interviews`,
      'interviews', 
      `${userId}:job_applications`, 
      'job_applications'
    ];
    
    for (const key of localStorageKeys) {
      const cachedData = localStorage.getItem(key);
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            console.log(`getInterviews: Found ${parsedData.length} job applications in localStorage key: ${key}`);
            
            // Now try to save this to Supabase for future use
            try {
              console.log(`getInterviews: Syncing ${parsedData.length} jobs from localStorage to Supabase`);
              await saveInterviews(userId, parsedData);
              console.log('getInterviews: Successfully synced jobs to Supabase from localStorage');
            } catch (syncError) {
              console.warn('getInterviews: Failed to sync localStorage jobs to Supabase:', syncError);
            }
            
            return parsedData;
          }
        } catch (parseError) {
          console.warn(`getInterviews: Error parsing localStorage key ${key}:`, parseError);
        }
      }
    }
    
    console.log('getInterviews: No valid job applications found in any localStorage location');
    return [];
  } catch (globalError) {
    console.error('getInterviews: Unhandled error:', globalError);
    return [];
  }
};


export const saveInterviews = async (userId: string, interviews: Interview[]): Promise<boolean> => {
  console.log(`saveInterviews: Saving ${interviews.length} job applications for user ${userId}`);
  try {
    // Use our centralized storage utility instead of multiple direct localStorage calls
    saveToLocalStorage('interviews', interviews, userId, {
      userScoped: true,
      saveToAllLegacyKeys: true // Maintain backward compatibility
    });
    
    // Add or update the last update timestamp and ensure proper snake_case mapping
    const interviewsWithTimestamp = interviews.map(interview => {
      // Convert camelCase to snake_case for Supabase
      const { 
        id,
        company, 
        position, 
        date, 
        status, 
        notes,
        skills = [],
        salaryMin,  // camelCase in JS
        salaryMax,  // camelCase in JS
        favorite
      } = interview;
      
      return {
        id,
        user_id: userId,
        company,
        position,
        date,
        status,
        notes,
        skills,
        salary_min: salaryMin,  // map to snake_case for PostgreSQL
        salary_max: salaryMax,  // map to snake_case for PostgreSQL
        favorite,
        updated_at: new Date().toISOString()
      };
    });
    
    // Save to Supabase with timeout - use UPSERT approach instead of delete+insert
    try {
      console.log(`saveInterviews: Upserting ${interviewsWithTimestamp.length} job applications to Supabase`);
      
      // Process in smaller batches to avoid request size limits (max 20 per batch)
      const BATCH_SIZE = 20;
      let successCount = 0;
      
      // Process job applications in batches
      for (let i = 0; i < interviewsWithTimestamp.length; i += BATCH_SIZE) {
        const batch = interviewsWithTimestamp.slice(i, i + BATCH_SIZE);
        console.log(`saveInterviews: Processing batch ${i/BATCH_SIZE + 1} with ${batch.length} jobs`);
        
        // Use upsert (insert with conflict resolution) instead of delete+insert approach
        // Create a filtered batch that only includes columns that exist in the database
        const filteredBatch = batch.map(job => {
          // Generate a valid UUID if the id is not already a UUID (checking a simple pattern)
          const isValidUUID = typeof job.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(job.id);
          const id = isValidUUID ? job.id : crypto.randomUUID(); // Generate a new UUID if needed
          
          console.log(`Converting job ID from ${job.id} to ${id}, isValid: ${isValidUUID}`);
          
          // Create a safe object that includes ALL required fields for the database
          // We need to explicitly handle the updated_at field separately to avoid errors
          const now = new Date().toISOString();
          
          // Use our JobApplicationForUpsert type to ensure correct typing
          const safeJob: JobApplicationForUpsert = {
            id: id, // Use the validated/converted UUID
            user_id: job.user_id,
            company: job.company,
            position: job.position,
            date: job.date,
            status: job.status,
            notes: job.notes || '',
            skills: job.skills || [],
            // Add these fields even if they cause errors - we'll catch and handle exceptions
            salary_min: job.salary_min || null,
            salary_max: job.salary_max || null,
            favorite: job.favorite || false,
            // Use created_at if available or default to now
            created_at: job.created_at || now,
            // For tracking the last update time (may be different from updated_at in DB)
            last_updated: job.last_updated || now,
            // For internal reference, not necessarily used in final DB call
            updated_at: now
          };
          
          return safeJob;
        });
        
        // Try multiple approaches to handle different Supabase schema issues
        let batchSuccessful = false; // Track success of this batch
        
        // First try with the direct upsert - this should work if everything is set up correctly
        try {
          const response = await withTimeout<SupabaseResponse<any>>(
            toPromise<SupabaseResponse<any>>(supabase
              .from('job_applications')
              .upsert(filteredBatch, { 
                onConflict: 'id', 
                ignoreDuplicates: false,
                count: 'exact'
              })),
            15000 // Shorter timeout for first attempt
          );
          
          if (response && !response.error) {
            console.log(`saveInterviews: Successfully saved batch ${i/BATCH_SIZE + 1} (first attempt)`);
            successCount += batch.length;
            batchSuccessful = true;
            continue; // Go to next batch if successful
          }
          
          // If we get the "updated_at" error, try alternative approach
          if (response?.error?.message?.includes('has no field "updated_at"')) {
            console.log('Detected updated_at field error, trying alternative approach...');
            throw new Error('Try alternative approach');
          }
          
          // General error response - log and continue to fallback
          if (response && response.error) {
            console.error(`saveInterviews: Error in batch ${i/BATCH_SIZE + 1}:`, response.error);
          }
          
        } catch (err) {
          // Alternative approach: use insert + update
          console.log('Using alternative approach for batch', i/BATCH_SIZE + 1);
          
          try {
            // Try simple insert first - this just ensures records exist
            await withTimeout<SupabaseResponse<any>>(
              toPromise<SupabaseResponse<any>>(supabase
                .from('job_applications')
                .upsert(filteredBatch.map(job => ({
                  id: job.id,
                  user_id: job.user_id,
                  company: job.company,
                  position: job.position,
                  date: job.date,
                  status: job.status,
                  notes: job.notes || '',
                  skills: job.skills || [],
                })), { 
                  onConflict: 'id', 
                  ignoreDuplicates: true, // Just ignore duplicates in insert
                })),
              15000
            );
            
            // Now update each item individually to avoid the updated_at trigger issue
            let itemsSuccessful = 0;
            
            for (const job of filteredBatch) {
              try {
                const updateResponse = await withTimeout<SupabaseResponse<any>>(
                  toPromise<SupabaseResponse<any>>(supabase
                    .from('job_applications')
                    .update({
                      company: job.company,
                      position: job.position,
                      date: job.date,
                      status: job.status,
                      notes: job.notes || '',
                      skills: job.skills || [],
                      // These fields are problematic, so we'll try them but catch errors
                      salary_min: job.salary_min || null,
                      salary_max: job.salary_max || null,
                      favorite: job.favorite || false
                    })
                    .eq('id', job.id)
                    .eq('user_id', job.user_id)),
                  10000
                );
                
                if (!updateResponse?.error) {
                  itemsSuccessful++;
                }
              } catch (individualError) {
                console.error(`Error updating individual job ${job.id}:`, individualError);
              }
            }
            
            // If we updated at least some of the items, consider the batch partially successful
            if (itemsSuccessful > 0) {
              console.log(`saveInterviews: Partially saved batch ${i/BATCH_SIZE + 1} (${itemsSuccessful}/${batch.length} items)`);
              successCount += itemsSuccessful;
              batchSuccessful = true;
            }
          } catch (fallbackError) {
            console.error(`Complete failure on fallback approach for batch ${i/BATCH_SIZE + 1}:`, fallbackError);
          }
        }
        
        // Log the overall batch result
        if (!batchSuccessful) {
          console.error(`saveInterviews: Failed to save batch ${i/BATCH_SIZE + 1} after all attempts`);
        }
      }
      
      console.log(`saveInterviews: Successfully saved ${successCount}/${interviewsWithTimestamp.length} job applications`);
      return successCount > 0;
    } catch (supabaseError) {
      console.error('saveInterviews: Error saving jobs to Supabase:', supabaseError);
      return false;
    }
  } catch (error) {
    console.error('Error saving interviews:', error);
    return false;
  }
};

// Function to handle the api_usage table (if needed)
export const initializeApiUsage = async () => {
  // We're completely disabling this functionality to prevent 406 errors
  // This function now does nothing but is kept for API compatibility
  return null;
};

// Activity tracking functions
export const saveActivity = async (userId: string, type: string, action: string, details: any = {}): Promise<{ success: boolean }> => {
  try {
    if (!userId) return { success: false };
    
    const activityId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    
    // Extract related entity info if available in details
    const relatedEntityId = details.resumeId || details.jobId || details.goalId || details.interviewId || null;
    const relatedEntityType = relatedEntityId ? (
      details.resumeId ? 'resume' :
      details.jobId ? 'job' :
      details.goalId ? 'goal' :
      details.interviewId ? 'interview' : null
    ) : null;
    
    // Format activity record for Supabase
    const activity: Record<string, any> = {
      id: activityId,
      user_id: userId,
      type, // Using the correct field name as per our table schema
      action,
      details, // This will be stored as JSONB
      created_at: timestamp
    };
    
    // Only add related entity fields if they exist
    if (relatedEntityId) {
      activity.related_entity_id = relatedEntityId;
    }
    
    if (relatedEntityType) {
      activity.related_entity_type = relatedEntityType;
    }
    
    console.log('Activity being saved:', activity);
    
    // Save to localStorage first (optimistic update)
    const localActivitiesKey = `${userId}:activities`;
    const localActivities = localStorage.getItem(localActivitiesKey);
    const activities = localActivities ? JSON.parse(localActivities) : [];
    activities.unshift(activity); // Add to beginning
    
    // Keep only the latest 50 activities
    const trimmedActivities = activities.slice(0, 50);
    localStorage.setItem(localActivitiesKey, JSON.stringify(trimmedActivities));
    
    // Update last pull timestamp to avoid immediate re-fetch
    localStorage.setItem(`${userId}:last_activity_pull`, timestamp);
    
    // Save to Supabase with timeout
    try {
      const result = await withTimeout<SupabaseResponse<SupabaseUserActivity>>(
        toPromise<SupabaseResponse<SupabaseUserActivity>>(supabase
          .from('user_activities') // Using the correct table name
          .insert(activity)
          .select()),
        30000,
        { data: null, error: new Error('Timeout saving activity') }
      );
      
      if (result && result.error) {
        throw result.error;
      }
      
      console.log('Activity saved to Supabase successfully:', { type, action });
      return { success: true };
    } catch (error) {
      console.warn('Failed to save activity to Supabase (will retry on next load):', error);
      // Still return success since we saved to localStorage
      return { success: true };
    }
  } catch (error) {
    console.error('Error saving activity:', error);
    return { success: false };
  }
};

// Goals functions
export const saveGoal = async (userId: string, goal: any): Promise<any> => {
  try {
    if (!userId) return goal;
    
    const goalId = goal.id || crypto.randomUUID();
    const goalToSave = { ...goal, id: goalId };
    
    // Save to localStorage
    localStorage.setItem(`goal_${goalId}`, JSON.stringify(goalToSave));
    
    // Try to save to Supabase with timeout
    try {
      const supabaseGoal = {
        id: goalId,
        user_id: userId,
        title: goalToSave.title,
        target: goalToSave.target,
        current: goalToSave.current || 0,
        due_date: goalToSave.dueDate,
        completed: goalToSave.completed || false,
        updated_at: new Date().toISOString()
      };
      
      await withTimeout(
        toPromise(supabase
          .from('user_goals')
          .upsert(supabaseGoal, { onConflict: 'id' })),
        30000
      );
    } catch (error) {
      console.warn('Failed to save goal to Supabase:', error);
    }
    
    return goalToSave;
  } catch (error) {
    console.error('Error saving goal:', error);
    throw error;
  }
};
