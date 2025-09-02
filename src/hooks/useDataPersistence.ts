import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getResumes, 
  saveResume as saveResumeToSupabase,
  getJobApplications, 
  saveJobApplication as saveJobApplicationToSupabase,
  getUserStats,
  updateUserStats,
  getActivities,
  saveActivity as saveActivityToSupabase,
  initializeApiUsage,
  saveGoal as saveGoalToSupabase,
  getGoals,
  saveInterviews,
  getInterviews
} from '../lib/supabaseStorage';
import { ResumeContent } from '../types';

// Define the Interview type locally
interface Interview {
  id: string | number;
  company: string;
  position: string;
  status: string;
  date?: string;
  notes?: string;
  userId?: string;
  salaryMin?: string;
  salaryMax?: string;
  salary_min?: string;
  salary_max?: string;
  last_updated?: string;
  skills?: string[];
  favorite?: boolean;
}

// Add type definition for user data
export interface UserData {
  resumes: ResumeContent[];
  applications: Interview[];
  stats: Record<string, any>;
  activities: any[];
  goals: any[];
}

// Hook for data persistence with both local and cloud storage
const useDataPersistence = () => {
  const { user } = useAuth();
  const userId = user?.id;
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserData>({ resumes: [], applications: [], stats: {}, activities: [], goals: [] });
  const [lastRefresh, setLastRefresh] = useState<number | null>(null);
  
  // Use refs to track loading state and prevent multiple concurrent loads
  const isLoadingRef = useRef<boolean>(false);
  const lastRefreshRef = useRef<number | null>(null);

  // Load user data from Supabase
  const loadUserData = useCallback(async (forceRefresh = false): Promise<UserData | null> => {
    // Don't try to load if already loading or no user ID
    if (!userId || isLoadingRef.current) return data;
    
    // Track last load time to prevent too frequent loading, but allow forced refreshes
    const now = Date.now();
    if (!forceRefresh && lastRefreshRef.current && (now - lastRefreshRef.current < 10000)) {
      console.log('Skipping load, too soon since last load. Use forceRefresh=true to bypass.');
      return data;
    }
    
    isLoadingRef.current = true;
    setIsLoading(true);
    
    try {
      setError(null);
      console.log('Loading user data from Supabase...');
      
      // Initialize API usage record (this function is disabled but kept for API compatibility)
      await initializeApiUsage();
      
      // Get all user data
      console.log('useDataPersistence: Getting all user data from Supabase for user:', userId);
      const resumes = await getResumes(userId);
      console.log(`useDataPersistence: Loaded ${resumes.length} resumes from Supabase`);
      
      // Get job applications from both sources to ensure we don't miss any
      const applications = await getJobApplications(userId);
      const interviews = await getInterviews(userId);
      console.log(`useDataPersistence: Loaded ${applications.length} applications and ${interviews.length} interviews from Supabase`);
      
      const stats = await getUserStats(userId);
      const activities = await getActivities(userId, 15);
      const goals = await getGoals(userId);
      
      // Check for locally saved resumes that might not be synced yet
      let finalResumes = [...resumes];
      try {
        const localResumes = localStorage.getItem('savedResumes');
        if (localResumes) {
          const parsedLocalResumes = JSON.parse(localResumes);
          if (Array.isArray(parsedLocalResumes) && parsedLocalResumes.length > 0) {
            // Create a map of existing resume IDs for quick lookup
            const existingResumeIds = new Set(finalResumes.map(r => r.id));
            
            // Add local resumes that aren't in the Supabase list
            for (const localResume of parsedLocalResumes) {
              if (!existingResumeIds.has(localResume.id)) {
                finalResumes.push(localResume);
                // Try to save to Supabase for future syncing, but don't increment counter
                try {
                  // Use saveResumeToSupabase with incrementCounter explicitly set to false
                  await saveResumeToSupabase(userId, localResume, false);
                  console.log(`Synced local resume ${localResume.id} to Supabase without incrementing counter`);
                } catch (syncErr) {
                  console.warn('Could not sync local resume to Supabase:', syncErr);
                }
              }
            }
            
            console.log(`Added ${finalResumes.length - resumes.length} locally saved resumes`);
          }
        }
      } catch (err) {
        console.error('Error processing localStorage resumes:', err);
      }
      
      // Process applications - combine all possible job application sources to ensure none are lost
      console.log('useDataPersistence: Processing job applications', {
        supabaseApplicationsCount: applications.length,
        supabaseInterviewsCount: interviews.length
      });
      
      // Keep track of the original data if we already have some
      const currentApplications = data?.applications || [];
      console.log(`useDataPersistence: Current application count before refresh: ${currentApplications.length}`);
      
      // Create a map to deduplicate jobs by ID (prioritize newer sources)
      const jobMap = new Map();
      
      // Collect all possible job sources in priority order (newer sources override older)
      const jobSources = [
        { source: 'current', jobs: currentApplications },
        { source: 'localStorage', jobs: [] },
        { source: 'applications', jobs: applications },
        { source: 'interviews', jobs: interviews }
      ];
      
      // Try to load jobs from localStorage as another potential source
      try {
        // First check for specially preserved jobs from previous logout
        const persistentJobs = localStorage.getItem('persistent_job_applications');
        if (persistentJobs) {
          try {
            const parsedJobs = JSON.parse(persistentJobs);
            if (Array.isArray(parsedJobs) && parsedJobs.length > 0) {
              console.log(`useDataPersistence: Found ${parsedJobs.length} jobs in persistent storage!`);
              jobSources[1].jobs = parsedJobs; // Add to localStorage source
              
              // Restore these jobs to regular keys to ensure they're accessible after refresh
              localStorage.setItem(`${userId}:interviews`, persistentJobs);
              localStorage.setItem('interviews', persistentJobs);
              localStorage.setItem(`${userId}:job_applications`, persistentJobs);
              localStorage.setItem('job_applications', persistentJobs);
              
              console.log('useDataPersistence: Restored persistent jobs to regular localStorage keys');
            }
          } catch (e) {
            console.warn('useDataPersistence: Error parsing jobs from persistent storage:', e);
          }
        }
        
        // If we didn't find persistent jobs, check regular storage locations
        if (jobSources[1].jobs.length === 0) {
          const localStorageKeys = [
            `${userId}:interviews`, 
            'interviews', 
            `${userId}:job_applications`, 
            'job_applications',
            'jobApplications'
          ];
          
          for (const key of localStorageKeys) {
            const savedJobs = localStorage.getItem(key);
            if (savedJobs) {
              try {
                const parsedJobs = JSON.parse(savedJobs);
                if (Array.isArray(parsedJobs) && parsedJobs.length > 0) {
                  console.log(`useDataPersistence: Found ${parsedJobs.length} jobs in localStorage key ${key}`);
                  jobSources[1].jobs = parsedJobs; // Add to localStorage source
                  break; // Use first non-empty source found
                }
              } catch (e) {
                console.warn(`useDataPersistence: Error parsing jobs from localStorage key ${key}:`, e);
              }
            }
          }
        }
      } catch (localStorageError) {
        console.error('useDataPersistence: Error checking localStorage:', localStorageError);
      }
      
      // Process all job sources in priority order
      for (const { source, jobs } of jobSources) {
        if (Array.isArray(jobs) && jobs.length > 0) {
          console.log(`useDataPersistence: Processing ${jobs.length} jobs from source: ${source}`);
          
          // Add each job to the map, newer sources will override older ones with same ID
          for (const job of jobs) {
            if (job && job.id) {
              jobMap.set(job.id, job);
            }
          }
        }
      }
      
      // Convert the map back to an array
      let finalApplications = Array.from(jobMap.values());
      console.log(`useDataPersistence: Combined and deduplicated to ${finalApplications.length} total job applications`);
      
      // If we have jobs from any source, make sure they're saved to Supabase for persistence
      if (finalApplications.length > 0) {
        try {
          console.log(`useDataPersistence: Ensuring ${finalApplications.length} jobs are saved to Supabase`);
          await saveInterviews(userId, finalApplications);
          console.log('useDataPersistence: Successfully synchronized jobs to Supabase');
          
          // Also save to multiple localStorage keys as backup
          const jobsJson = JSON.stringify(finalApplications);
          localStorage.setItem('interviews', jobsJson);
          localStorage.setItem(`${userId}:interviews`, jobsJson);
          localStorage.setItem('job_applications', jobsJson);
          localStorage.setItem(`${userId}:job_applications`, jobsJson);
        } catch (syncErr) {
          console.error('useDataPersistence: Failed to sync applications to Supabase:', syncErr);
        }
      }
      
      console.log(`useDataPersistence: Final applications count: ${finalApplications.length}`);
      
      // Debug print some application data if available
      if (finalApplications.length > 0) {
        console.log('useDataPersistence: Sample application:', {
          id: finalApplications[0].id,
          company: finalApplications[0].company,
          position: finalApplications[0].position,
          status: finalApplications[0].status
        });
      }
      
      console.log(`Loaded ${finalResumes.length} resumes, ${finalApplications.length} applications, ${activities.length} activities, and ${goals.length} goals`);
      
      // Update data state
      setData({
        resumes: finalResumes,
        applications: finalApplications,
        stats,
        activities,
        goals
      });
      
      lastRefreshRef.current = Date.now();
      setLastRefresh(lastRefreshRef.current);
      
      return {
        resumes: finalResumes,
        applications: finalApplications,
        stats,
        activities,
        goals
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading user data';
      setError(errorMessage);
      console.error('Error loading user data:', err);
      return null;
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [userId, data]); // Only depend on userId and data, not on any state that might change frequently
  
  // Refresh data from Supabase
  const refreshData = useCallback(async (forceRefresh = true): Promise<void> => {
    try {
      console.log(`Refreshing data with forceRefresh=${forceRefresh}`);
      await loadUserData(forceRefresh);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, [loadUserData]);

  // Save a resume to both local storage and Supabase
  const saveResumeLocally = async (resume: ResumeContent): Promise<ResumeContent> => {
    if (!userId) {
      throw new Error('Must be logged in to save resume');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Save to storage (localStorage + Supabase)
      const savedResume = await saveResumeToSupabase(userId, resume);
      
      // Update local state with the saved resume
      setData(prevData => {
        const newResumes = [...prevData.resumes];
        const existingIndex = newResumes.findIndex(r => r.id === savedResume.id);
        
        if (existingIndex >= 0) {
          newResumes[existingIndex] = savedResume;
        } else {
          newResumes.unshift(savedResume);
        }
        
        return { ...prevData, resumes: newResumes };
      });
      
      // Record activity
      await saveActivityToSupabase(userId, 'resume', 'updated', {
        resumeName: resume.name,
        resumeId: savedResume.id
      });
      
      return savedResume;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save resume';
      setError(errorMessage);
      console.error('Error saving resume:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save job application to both local storage and Supabase
  const saveJobApplicationLocally = async (application: any): Promise<any> => {
    if (!userId) {
      throw new Error('Must be logged in to save application');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Save to storage
      const savedApplication = await saveJobApplicationToSupabase(userId, application);
      
      // Update local state
      setData(prevData => {
        const newApplications = [...prevData.applications];
        const existingIndex = newApplications.findIndex(a => a.id === savedApplication.id);
        
        if (existingIndex >= 0) {
          newApplications[existingIndex] = savedApplication;
        } else {
          newApplications.unshift(savedApplication);
        }
        
        return { ...prevData, applications: newApplications };
      });
      
      // Record activity
      await saveActivityToSupabase(userId, 'application', 'submitted', {
        company: application.company,
        position: application.position
      });
      
      return savedApplication;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save application';
      setError(errorMessage);
      console.error('Error saving application:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save activity
  const saveActivityLocally = async (type: string, action: string, details: any = {}): Promise<void> => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Save activity using the correct parameter count (3 args: userId, type, action, with optional 4th arg details)
      await saveActivityToSupabase(userId, type, action, details);
      
      // Refresh activities to get the latest
      const activities = await getActivities(userId, 15);
      
      // Update local state
      setData(prevData => ({ ...prevData, activities }));
    } catch (err) {
      console.error('Error saving activity:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save user goal
  const saveUserGoalLocally = async (goal: any): Promise<any> => {
    if (!userId) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Save to storage
      const savedGoal = await saveGoalToSupabase(userId, goal);
      
      // Update local state
      setData(prevData => {
        const newGoals = [...prevData.goals];
        const existingIndex = newGoals.findIndex(g => g.id === savedGoal.id);
        
        if (existingIndex >= 0) {
          newGoals[existingIndex] = savedGoal;
        } else {
          newGoals.unshift(savedGoal);
        }
        
        return { ...prevData, goals: newGoals };
      });
      
      // Record activity
      await saveActivityToSupabase(userId, 'goal', 'created', {
        goalTitle: goal.title,
        goalId: savedGoal.id
      });
      
      return savedGoal;
    } catch (err) {
      console.error('Error saving goal:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update a single job application (for real-time Kanban updates)
  const updateSingleJob = async (jobUpdate: Partial<Interview & { salaryMin?: string; salaryMax?: string; salary_min?: string; salary_max?: string }> & { id: string | number; user_id: string }): Promise<boolean> => {
    if (!userId) {
      console.log('useDataPersistence.updateSingleJob: No userId available, aborting');
      return false;
    }
    
    console.log('useDataPersistence.updateSingleJob: Updating job', {
      id: jobUpdate.id,
      company: jobUpdate.company,
      position: jobUpdate.position,
      status: jobUpdate.status
    });
    
    try {
      // Use the supabaseStorage functions to update a single job application
      console.log('useDataPersistence.updateSingleJob: Importing updateJobApplication function');
      const { updateJobApplication } = await import('../lib/jobApplicationService');
      
      // Convert to snake_case if needed for backend compatibility
      const formattedUpdate: any = {
        ...jobUpdate,
        // Ensure id is a string as required by Supabase
        id: String(jobUpdate.id),
        // Ensure these fields use snake_case for Supabase
        user_id: jobUpdate.user_id || userId
      };
      
      console.log('useDataPersistence.updateSingleJob: Formatted update:', formattedUpdate);
      
      // Handle salary fields conversion from camelCase to snake_case
      if ('salaryMin' in jobUpdate) {
        formattedUpdate.salary_min = jobUpdate.salaryMin;
        delete formattedUpdate.salaryMin;
      }
      
      if ('salaryMax' in jobUpdate) {
        formattedUpdate.salary_max = jobUpdate.salaryMax;
        delete formattedUpdate.salaryMax;
      }
      
      console.log('useDataPersistence.updateSingleJob: Calling updateJobApplication');
      const updatedJob = await updateJobApplication(formattedUpdate);
      
      if (updatedJob) {
        console.log('useDataPersistence.updateSingleJob: Job updated successfully, updating local state');
        // Update local state with the updated job
        setData(prev => {
          const updatedApplications = prev.applications.map(app => 
            app.id === jobUpdate.id ? { ...app, ...jobUpdate } : app
          );
          
          // Save to localStorage as backup
          try {
            localStorage.setItem('interviews', JSON.stringify(updatedApplications));
            localStorage.setItem(`${userId}:interviews`, JSON.stringify(updatedApplications));
            console.log('useDataPersistence.updateSingleJob: Saved updated applications to localStorage');
          } catch (localStorageErr) {
            console.error('useDataPersistence.updateSingleJob: Failed to save to localStorage:', localStorageErr);
          }
          
          return {
            ...prev,
            applications: updatedApplications
          };
        });
        
        return true;
      }
      console.log('useDataPersistence.updateSingleJob: updateJobApplication returned null');
      return false;
    } catch (error) {
      console.error('Error updating single job application:', error);
      return false;
    }
  };
  
  // Save interview data (Job Tracker)
  const saveInterviewLocally = useCallback(async (interviews: Interview[]): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      const success = await saveInterviews(userId, interviews);
      
      if (success) {
        // Update local data
        setData(prev => ({
          ...prev,
          applications: interviews
        }));
        
        // Update user stats
        await updateUserStats(userId, {
          interviews_count: 1
        });
        
        // Log activity
        const activityType = 'interview';
        const actionText = `Updated interview records (${interviews.length} total)`;
        await saveActivityToSupabase(userId, activityType, actionText);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving interviews:', error);
      return false;
    }
  }, [userId]);

  // Stats update function
  const updateStatsLocally = useCallback(async (stats: Record<string, number>): Promise<boolean> => {
    if (!userId) return false;

    try {
      await updateUserStats(userId, stats);
      return true;
    } catch (error) {
      console.error('Failed to update user stats:', error);
      return false;
    }
  }, [userId]);

  // Initial data load when user logs in
  useEffect(() => {
    if (userId) {
      loadUserData().catch(error => {
        console.error('Error in initial data load:', error);
        setError('Failed to load data');
      });
    } else {
      // Reset data when user logs out
      setData({
        resumes: [],
        applications: [],
        stats: {},
        activities: [],
        goals: []
      });
      setIsLoading(false);
    }
  }, [userId, loadUserData]);

  // Auto refresh data every 5 minutes when the app is active - with protection for job data
  useEffect(() => {
    if (!userId) return;
    
    // Save current jobs to localStorage as a backup before any auto-refresh
    const saveJobsToLocalStorage = () => {
      try {
        if (data.applications && data.applications.length > 0) {
          console.log(`Saving ${data.applications.length} jobs to localStorage before auto-refresh`);
          localStorage.setItem('interviews', JSON.stringify(data.applications));
          localStorage.setItem(`${userId}:interviews`, JSON.stringify(data.applications));
          localStorage.setItem('job_applications', JSON.stringify(data.applications));
          localStorage.setItem(`${userId}:job_applications`, JSON.stringify(data.applications));
        }
      } catch (err) {
        console.error('Failed to save jobs to localStorage:', err);
      }
    };
    
    // Modified refresh function that preserves job data
    const safeRefreshData = async () => {
      // Save current job data first
      saveJobsToLocalStorage();
      
      // Get current job count for comparison later
      const currentJobCount = data.applications?.length || 0;
      
      // Call the regular refresh
      await refreshData().catch(error => {
        console.error('Auto-refresh error:', error);
      });
      
      // After refresh, check if we lost job data and restore if needed
      const newJobCount = data.applications?.length || 0;
      if (currentJobCount > 0 && newJobCount === 0) {
        console.log('Auto-refresh lost job data! Restoring from localStorage backup...');
        // Restore jobs from localStorage
        try {
          // Try multiple storage keys
          let restored = false;
          const keys = ['interviews', `${userId}:interviews`, 'job_applications', `${userId}:job_applications`];
          
          for (const key of keys) {
            const savedJobs = localStorage.getItem(key);
            if (savedJobs) {
              try {
                const parsedJobs = JSON.parse(savedJobs);
                if (Array.isArray(parsedJobs) && parsedJobs.length > 0) {
                  console.log(`Restored ${parsedJobs.length} jobs from localStorage key: ${key}`);
                  setData(prev => ({ ...prev, applications: parsedJobs }));
                  restored = true;
                  break;
                }
              } catch (parseErr) {
                console.warn(`Error parsing jobs from ${key}:`, parseErr);
              }
            }
          }
          
          if (!restored) {
            console.error('Failed to restore jobs from any localStorage key');
          }
        } catch (err) {
          console.error('Error restoring jobs from localStorage:', err);
        }
      }
    };
    
    // Set up auto-refresh interval with the safer refresh function
    const refreshInterval = setInterval(() => {
      // Only refresh if the user has been inactive for less than 30 minutes
      const inactiveTime = new Date().getTime() - (lastRefreshRef.current || 0);
      if (inactiveTime < 30 * 60 * 1000) {
        safeRefreshData();
      }
    }, 5 * 60 * 1000); // Still refresh every 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, [userId, refreshData, lastRefreshRef]);

  return {
    isLoading,
    error,
    data,
    lastRefresh,
    loadUserData,
    refreshData,
    saveResume: saveResumeLocally,
    saveJobApplication: saveJobApplicationLocally,
    saveActivity: saveActivityLocally,
    saveGoal: saveUserGoalLocally,
    saveInterview: saveInterviewLocally,
    updateSingleJob, // Export the new function for updating a single job
    updateStats: updateStatsLocally
  };
};

export default useDataPersistence;