import { supabase } from './supabaseClient';

export interface JobApplication {
  id: string;
  user_id: string;
  company: string;
  position: string;
  date: string;
  status: string;
  salary_min?: string;
  salary_max?: string;
  notes?: string;
  skills?: string[];
  favorite?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Get all job applications for a user with enhanced error handling and localStorage fallback/sync
export async function getUserJobApplications(userId: string): Promise<JobApplication[]> {
  console.log('jobApplicationService: Getting job applications for user:', userId);
  
  // Create an array to collect all jobs from different sources
  let allJobs: JobApplication[] = [];
  let loadedFromSupabase = false;
  
  try {
    // STEP 1: Make sure the table exists
    console.log('jobApplicationService: Ensuring table exists...');
    const { error: tableError } = await supabase
      .from('job_applications')
      .select('id')
      .limit(1);
      
    if (tableError) {
      console.error('jobApplicationService: Table check failed, running setup...', tableError);
      
      // Run table setup
      try {
        const { setupSupabaseTables } = await import('./setupSupabaseTables');
        await setupSupabaseTables();
      } catch (setupError) {
        console.error('jobApplicationService: Table setup failed:', setupError);
      }
    } else {
      console.log('jobApplicationService: Table exists and is accessible');
    }

    // STEP 2: Try to directly load from Supabase with retries
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`jobApplicationService: Loading from Supabase (attempt ${attempt})...`);
        
        // Use a more direct query approach
        const { data, error } = await supabase
          .from('job_applications')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error(`jobApplicationService: Supabase load failed (attempt ${attempt}):`, error);
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait before retry
        } else if (data && data.length > 0) {
          console.log(`jobApplicationService: Successfully loaded ${data.length} jobs from Supabase`);
          allJobs = [...data];
          loadedFromSupabase = true;
          break; // Success, exit retry loop
        } else {
          console.log('jobApplicationService: No job applications found in Supabase');
          loadedFromSupabase = true; // We successfully queried, just found 0 results
          break;
        }
      } catch (loadError) {
        console.error(`jobApplicationService: Exception during Supabase load (attempt ${attempt}):`, loadError);
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait before retry
      }
    }
    
    // STEP 3: Try to load from localStorage as fallback if Supabase query failed or returned no results
    if (!loadedFromSupabase || allJobs.length === 0) {
      console.log('jobApplicationService: Checking localStorage for jobs...');
      const localStorageKeys = [
        `${userId}:interviews`, 
        'interviews', 
        `${userId}:job_applications`, 
        'job_applications',
        'persistent_job_applications'
      ];
      
      // Try to get jobs from any localStorage key that might have them
      for (const key of localStorageKeys) {
        try {
          const savedJobs = localStorage.getItem(key);
          if (savedJobs) {
            const parsedJobs = JSON.parse(savedJobs);
            if (Array.isArray(parsedJobs) && parsedJobs.length > 0) {
              console.log(`jobApplicationService: Found ${parsedJobs.length} jobs in localStorage key ${key}`);
              
              // Only use jobs that belong to this user
              const userJobs = parsedJobs.filter((job: any) => job.user_id === userId);
              if (userJobs.length > 0) {
                console.log(`jobApplicationService: ${userJobs.length} jobs belong to current user`);
                allJobs = [...allJobs, ...userJobs];
                break; // Use first valid source
              }
            }
          }
        } catch (e) {
          console.warn(`jobApplicationService: Error parsing jobs from localStorage key ${key}:`, e);
        }
      }
    }
    
    // STEP 4: Deduplicate jobs by ID (in case we got jobs from both sources)
    if (allJobs.length > 0) {
      const jobMap = new Map<string, JobApplication>();
      allJobs.forEach((job: JobApplication) => {
        if (job.id) {
          jobMap.set(job.id, job);
        }
      });
      
      allJobs = Array.from(jobMap.values());
      console.log(`jobApplicationService: Final count after deduplication: ${allJobs.length} jobs`);
      
      // STEP 5: Save to Supabase for persistence if we got jobs from localStorage
      if (!loadedFromSupabase && allJobs.length > 0) {
        console.log('jobApplicationService: Syncing localStorage jobs to Supabase...');
        try {
          // Use batch save to efficiently save multiple jobs
          await batchSaveJobApplications(allJobs, userId);
          console.log('jobApplicationService: Successfully synced jobs to Supabase');
        } catch (syncError) {
          console.error('jobApplicationService: Failed to sync jobs to Supabase:', syncError);
        }
      }
    }
    
    // Return the jobs we found
    return allJobs;
  } catch (error) {
    console.error('jobApplicationService: Error getting job applications:', error);
    return [];
  }
}

// Create a new job application
export async function createJobApplication(jobApplication: Omit<JobApplication, 'id'>): Promise<JobApplication | null> {
  console.log('jobApplicationService: Creating new job application:', {
    company: jobApplication.company,
    position: jobApplication.position,
    status: jobApplication.status
  });
  
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .insert([jobApplication])
      .select()
      .single();

    if (error) {
      console.error('jobApplicationService: Error creating job application:', error);
      console.error('jobApplicationService: Full error details:', JSON.stringify(error, null, 2));
      return null;
    }

    console.log('jobApplicationService: Successfully created job application with ID:', data?.id);
    return data;
  } catch (error) {
    console.error('jobApplicationService: Exception creating job application:', error);
    return null;
  }
}

// Update an existing job application with robust error handling and upsert fallback
export async function updateJobApplication(
  jobApplication: Partial<JobApplication> & { id: string; user_id: string }
): Promise<JobApplication | null> {
  console.log('jobApplicationService: Updating job application:', {
    id: jobApplication.id,
    company: jobApplication.company,
    position: jobApplication.position,
    status: jobApplication.status
  });
  
  // Ensure updated_at is set
  const jobWithTimestamp = {
    ...jobApplication,
    updated_at: new Date().toISOString()
  };
  
  // Create a safer version of the job app for local storage backup
  const safeJobApp = { ...jobWithTimestamp };
  
  // Save to localStorage as a backup before attempting Supabase operation
  try {
    // Get current jobs from localStorage
    const localKey = `${jobApplication.user_id}:job_applications`;
    let localJobs: any[] = [];
    const savedJobs = localStorage.getItem(localKey);
    
    if (savedJobs) {
      try {
        const parsed = JSON.parse(savedJobs);
        if (Array.isArray(parsed)) {
          localJobs = parsed;
        }
      } catch (e) {
        console.warn('jobApplicationService: Failed to parse local jobs', e);
      }
    }
    
    // Update the job in the local array
    const updatedLocalJobs = localJobs.map(job => 
      job.id === jobApplication.id ? { ...job, ...safeJobApp } : job
    );
    
    // If job wasn't found, add it
    if (!updatedLocalJobs.some(job => job.id === jobApplication.id)) {
      updatedLocalJobs.push(safeJobApp);
    }
    
    // Save back to localStorage under multiple keys for redundancy
    localStorage.setItem(localKey, JSON.stringify(updatedLocalJobs));
    localStorage.setItem('job_applications', JSON.stringify(updatedLocalJobs));
    localStorage.setItem('interviews', JSON.stringify(updatedLocalJobs));
    console.log('jobApplicationService: Saved backup of job application to localStorage');
  } catch (backupError) {
    console.warn('jobApplicationService: Failed to save job backup to localStorage', backupError);
  }
  
  // First try normal update
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .update(jobWithTimestamp)
      .eq('id', jobApplication.id)
      .eq('user_id', jobApplication.user_id)
      .select()
      .single();

    if (error) {
      console.error('jobApplicationService: Error during update, trying upsert fallback:', error);
      
      // If update fails, try upsert as a fallback
      try {
        const { data: upsertData, error: upsertError } = await supabase
          .from('job_applications')
          .upsert(jobWithTimestamp, { onConflict: 'id', ignoreDuplicates: false })
          .select()
          .single();
          
        if (upsertError) {
          console.error('jobApplicationService: Upsert fallback also failed:', upsertError);
          console.error('jobApplicationService: Full upsert error details:', JSON.stringify(upsertError, null, 2));
          // Return the local copy as last resort
          return safeJobApp as JobApplication;
        }
        
        console.log('jobApplicationService: Successfully upserted job application with ID:', upsertData?.id);
        return upsertData;
      } catch (upsertException) {
        console.error('jobApplicationService: Exception during upsert fallback:', upsertException);
        // Return the local copy as last resort
        return safeJobApp as JobApplication;
      }
    }

    console.log('jobApplicationService: Successfully updated job application with ID:', data?.id);
    return data;
  } catch (error) {
    console.error('jobApplicationService: Exception updating job application:', error);
    // Return the local copy as last resort
    return safeJobApp as JobApplication;
  }
}

// Update favorite status
export async function updateFavoriteStatus(
  jobId: string,
  userId: string,
  favorite: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('job_applications')
      .update({ favorite })
      .eq('id', jobId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating favorite status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception updating favorite status:', error);
    return false;
  }
}

// Delete a job application
export async function deleteJobApplication(jobId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', jobId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting job application:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception deleting job application:', error);
    return false;
  }
}

// Batch save multiple job applications
export async function batchSaveJobApplications(
  jobApplications: (Omit<JobApplication, 'id'> | JobApplication)[],
  userId: string
): Promise<boolean> {
  try {
    // First, get existing applications
    const { data: existingData, error: fetchError } = await supabase
      .from('job_applications')
      .select('id')
      .eq('user_id', userId);
    
    if (fetchError) {
      console.error('Error fetching existing job applications:', fetchError);
      return false;
    }
    
    const existingIds = new Set((existingData || []).map(item => item.id));
    
    // Split applications into those to update and those to insert
    const toUpdate: JobApplication[] = [];
    const toInsert: Omit<JobApplication, 'id'>[] = [];
    
    jobApplications.forEach(job => {
      // Make sure all jobs have user_id
      const jobWithUserId = { 
        ...job, 
        user_id: userId 
      };
      
      // If it has an ID and exists in the database, update it
      if ('id' in job && existingIds.has(job.id)) {
        toUpdate.push(jobWithUserId as JobApplication);
      } else {
        // Otherwise insert a new record
        // If it has an id but doesn't exist in DB, we'll still use that id
        toInsert.push(jobWithUserId);
      }
    });
    
    // Perform inserts if needed
    if (toInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('job_applications')
        .insert(toInsert);
      
      if (insertError) {
        console.error('Error inserting job applications:', insertError);
        return false;
      }
    }
    
    // Perform updates if needed
    if (toUpdate.length > 0) {
      // We need to update one by one since Supabase doesn't support bulk updates
      for (const job of toUpdate) {
        const { error: updateError } = await supabase
          .from('job_applications')
          .update(job)
          .eq('id', job.id)
          .eq('user_id', job.user_id);
        
        if (updateError) {
          console.error('Error updating job application:', updateError);
          // Continue with the next update anyway
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Exception in batch saving job applications:', error);
    return false;
  }
}
