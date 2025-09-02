import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Edit2, Trash2, Briefcase, Calendar, Clock, DollarSign, StickyNote, 
  Filter, ChevronDown, ArrowUp, ArrowDown, Grid, List, BarChart2, Star, StarOff,
  CheckSquare, AlertCircle, Building, Search, CheckCircle, CircleSlash, Send, X, Check
} from 'lucide-react';
import { useActivity } from '../context/ActivityContext';
import { useAuth } from '../context/AuthContext'; 
import useDataPersistence from '../hooks/useDataPersistence';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { fixStatusForDragDrop } from '../lib/fixDragDrop';
import { deepClone } from '../utils/objectUtils';
import { LogCategory, useLogger } from '../utils/loggerService';

// Define the job status categories for the Kanban board
const JOB_STATUSES = {
  TO_APPLY: 'to_apply',
  APPLIED: 'applied',
  INTERVIEWING: 'interviewing',
  OFFER: 'offer',
  REJECTED: 'rejected'
};

// The visible labels for each status
const STATUS_LABELS = {
  [JOB_STATUSES.TO_APPLY]: 'To Apply',
  [JOB_STATUSES.APPLIED]: 'Applied',
  [JOB_STATUSES.INTERVIEWING]: 'Interviewing',
  [JOB_STATUSES.OFFER]: 'Offer',
  [JOB_STATUSES.REJECTED]: 'Rejected'
};

// Badge colors for each status
const BADGE_COLORS = {
  [JOB_STATUSES.TO_APPLY]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  [JOB_STATUSES.APPLIED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  [JOB_STATUSES.INTERVIEWING]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
  [JOB_STATUSES.OFFER]: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  [JOB_STATUSES.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
};

// Column colors for the Kanban board
const COLUMN_COLORS = {
  [JOB_STATUSES.TO_APPLY]: 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700',
  [JOB_STATUSES.APPLIED]: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30',
  [JOB_STATUSES.INTERVIEWING]: 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/30',
  [JOB_STATUSES.OFFER]: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30',
  [JOB_STATUSES.REJECTED]: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30'
};

// Status icons for better visual representation
const STATUS_ICONS = {
  [JOB_STATUSES.TO_APPLY]: <Send size={16} />,
  [JOB_STATUSES.APPLIED]: <CheckCircle size={16} />,
  [JOB_STATUSES.INTERVIEWING]: <Calendar size={16} />,
  [JOB_STATUSES.OFFER]: <CheckSquare size={16} />,
  [JOB_STATUSES.REJECTED]: <CircleSlash size={16} />
};

export interface Job {
  id: string | number;
  company: string;
  position: string;
  date: string;
  status: string; // Using our new status constants
  salaryMin?: string;
  salaryMax?: string;
  notes?: string;
  skills?: string[];
  last_updated?: string;
  favorite?: boolean;
}

// For migration compatibility with old data structure
const mapOldStatusToNew = (oldStatus: string): string => {
  // Only map legacy statuses, preserve valid modern ones
  if (
    oldStatus === JOB_STATUSES.TO_APPLY ||
    oldStatus === JOB_STATUSES.APPLIED ||
    oldStatus === JOB_STATUSES.INTERVIEWING ||
    oldStatus === JOB_STATUSES.OFFER ||
    oldStatus === JOB_STATUSES.REJECTED
  ) {
    return oldStatus;
  }

  // Convert various older formats to standardized versions
  const normalized = oldStatus.toLowerCase().trim();
  
  if (normalized.includes('to apply') || normalized === 'to_apply' || normalized === '[to_apply]') {
    return JOB_STATUSES.TO_APPLY;
  } else if (normalized.includes('applied') || normalized === '[applied]') {
    return JOB_STATUSES.APPLIED;
  } else if (normalized.includes('interview') || normalized === '[interviewing]') {
    return JOB_STATUSES.INTERVIEWING;
  } else if (normalized.includes('rejected') || normalized === '[rejected]') {
    return JOB_STATUSES.REJECTED;
  } else if (normalized.includes('offer') || normalized === '[offer]') {
    return JOB_STATUSES.OFFER;
  }
  
  switch(normalized) {
    case 'interested':
    case 'wishlist':
    case 'bookmark':
    case 'saved':
      return JOB_STATUSES.TO_APPLY;
    case 'submit':
    case 'submitted':
    case 'application sent':
      return JOB_STATUSES.APPLIED;
    case 'interview scheduled':
    case 'phone screen':
    case 'technical':
    case 'onsite':
      return JOB_STATUSES.INTERVIEWING;
    case 'rejected':
    case 'declined':
      return JOB_STATUSES.REJECTED;
    case 'offer':
    case 'offer received':
      return JOB_STATUSES.OFFER;
    default:
      // Use a plain console.log here as this is outside component context
      console.log(`Unrecognized status '${oldStatus}', defaulting to APPLIED`);
      return JOB_STATUSES.APPLIED;
  }
};

const JobTracker: React.FC = () => {
  // Initialize our logger for this component
  const logger = useLogger(LogCategory.UI);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [newJob, setNewJob] = useState<Omit<Job, 'id'>>({
    company: '',
    position: '',
    date: new Date().toISOString().substring(0, 10),  // Today's date
    status: JOB_STATUSES.APPLIED,
    salaryMin: '',
    salaryMax: '',
    notes: '',
    skills: [],
  });
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortKey, setSortKey] = useState<keyof Job>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState<Array<string | number>>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Context hooks
  const { addActivity } = useActivity();
  const { user } = useAuth();
  const dataPersistence = useDataPersistence();
  
  // Ensure Supabase tables exist when component loads
  useEffect(() => {
    const setupTables = async () => {
      if (user && user.id) {
        try {
          logger.info('JobTracker: Setting up Supabase tables for job applications...');
          const { setupSupabaseTables } = await import('../lib/setupSupabaseTables');
          await setupSupabaseTables();
          logger.info('JobTracker: Supabase tables setup completed');
        } catch (error) {
          logger.error('Error setting up Supabase tables:', error);
        }
      }
    };
    
    setupTables();
  }, [user]);

  // Load jobs from localStorage or API with enhanced debugging and fallback mechanisms
  useEffect(() => {
    const fetchJobs = async () => {
      logger.info('JobTracker: Fetching jobs...');
      let initialJobs: Job[] = [];
      
      // If user is logged in, always force refresh from Supabase first to ensure we have latest data
      if (user && user.id) {
        try {
          logger.info('JobTracker: User is logged in, forcing refresh from Supabase first');
          
          // Force a refresh only if it's not too soon after a drag operation
          if (dataPersistence.refreshData && !dataPersistence.isLoading && !shouldSkipDataRefresh()) {
            logger.info('JobTracker: Explicitly refreshing data from Supabase');
            try {
              await dataPersistence.refreshData();
              logger.info('JobTracker: Supabase refresh completed, checking for data');
            } catch (refreshError) {
              logger.error('JobTracker: Error refreshing data from Supabase:', refreshError);
            }
          } else {
            logger.info('JobTracker: Skipping refresh to prevent snap-back after recent drag');
          }
          
          // Now check if we have jobs in dataPersistence context after refresh
          if (dataPersistence.data && dataPersistence.data.applications && dataPersistence.data.applications.length > 0) {
            logger.info(`JobTracker: Found ${dataPersistence.data.applications.length} applications in Supabase`);
            
            // Map the jobs and ensure we honor any recent drag operations before applying the data
            initialJobs = dataPersistence.data.applications.map(job => {
              // Check if this job was just dragged - if so, preserve its new status
              const jobId = job.id.toString();
              const wasDragged = recentDragOperationsRef.current.has(jobId);
              
              // If this job was recently dragged, use that status; otherwise normalize from DB
              const finalStatus = wasDragged ? 
                recentDragOperationsRef.current.get(jobId)! : 
                mapOldStatusToNew(job.status);
            
              return {
                ...job,
                // Use the dragged status if available, otherwise normalize from DB
                status: finalStatus,
                // Ensure required fields have defaults if missing
                date: job.date || new Date().toISOString().substring(0, 10),
                company: job.company || '',
                position: job.position || ''
              };
            });
          } else {
            logger.info('JobTracker: No applications found in Supabase');
            logger.info('JobTracker: No applications found in dataPersistence or empty array');
            
            // If dataPersistence didn't have jobs, check if we need to force a refresh
            if (dataPersistence.refreshData && !dataPersistence.isLoading) {
              logger.info('JobTracker: Forcing data refresh to load jobs from Supabase');
              try {
                await dataPersistence.refreshData();
                logger.info('JobTracker: Data refresh completed');
                
                // Now check if we got applications after the refresh
                if (dataPersistence.data?.applications?.length > 0) {
                  logger.info(`JobTracker: Found ${dataPersistence.data.applications.length} applications after refresh`);
                  initialJobs = dataPersistence.data.applications.map(job => ({
                    ...job,
                    status: mapOldStatusToNew(job.status),
                    date: job.date || new Date().toISOString().substring(0, 10),
                    company: job.company || '',
                    position: job.position || ''
                  }));
                } else {
                  logger.info('JobTracker: Still no applications after refresh');
                }
              } catch (refreshError) {
                logger.error('JobTracker: Error refreshing data:', refreshError);
              }
            }
          }
        } catch (error) {
          logger.error("JobTracker: Failed to fetch jobs from dataPersistence:", error);
        }
      }
      
      // If still no jobs from Supabase, try localStorage as fallback
      if (initialJobs.length === 0) {
        logger.info('JobTracker: No jobs from dataPersistence, checking localStorage');
        
        // Try multiple localStorage keys for maximum chance of recovery
        const localStorageKeys = [
          'interviews',
          `${user?.id}:interviews`,
          'job_applications',
          `${user?.id}:job_applications`,
          'jobs'
        ];
        
        for (const key of localStorageKeys) {
          try {
            const storedJobs = localStorage.getItem(key);
            if (storedJobs) {
              const parsedJobs = JSON.parse(storedJobs);
              if (Array.isArray(parsedJobs) && parsedJobs.length > 0) {
                logger.info(`JobTracker: Found ${parsedJobs.length} jobs in localStorage key: ${key}`);
                initialJobs = parsedJobs.map(job => ({
                  ...job,
                  status: mapOldStatusToNew(job.status),
                  date: job.date || new Date().toISOString().substring(0, 10),
                  company: job.company || '',
                  position: job.position || ''
                }));
                
                // If user is logged in, try to sync these jobs to Supabase
                if (user && user.id && dataPersistence.saveInterview) {
                  logger.info('JobTracker: Syncing localStorage jobs to Supabase');
                  try {
                    await dataPersistence.saveInterview(initialJobs);
                    logger.info('JobTracker: Successfully synced jobs to Supabase');
                  } catch (syncError) {
                    logger.error('JobTracker: Failed to sync jobs to Supabase:', syncError);
                  }
                }
                
                break; // Use first valid source found
              }
            }
          } catch (parseError) {
            logger.warn(`JobTracker: Error parsing localStorage key ${key}:`, parseError);
          }
        }
      }
      
      logger.info(`JobTracker: Final job count: ${initialJobs.length}`);
      if (initialJobs.length > 0) {
        logger.info('JobTracker: Sample job:', {
          id: initialJobs[0].id,
          company: initialJobs[0].company,
          position: initialJobs[0].position,
          status: initialJobs[0].status
        });
      }
      
      // Load favorites
      const storedFavorites = localStorage.getItem('jobFavorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
      
      setJobs(initialJobs);
    };
    
    fetchJobs();
  }, [user, dataPersistence.data]);

  // Toggle favorite status
  const toggleFavorite = (id: string | number) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter(favId => favId !== id)
      : [...favorites, id];
    
    setFavorites(newFavorites);
    localStorage.setItem('jobFavorites', JSON.stringify(newFavorites));
  };

  // Save jobs to localStorage and Supabase if user is logged in
  const saveJobs = useCallback((updatedJobs: Job[]) => {
    // Always save to multiple localStorage keys for redundancy
    if (updatedJobs.length > 0) {
      const jobsJson = JSON.stringify(updatedJobs);
      localStorage.setItem('jobs', jobsJson);
      localStorage.setItem('interviews', jobsJson);
      localStorage.setItem('job_applications', jobsJson);
      
      // If user is logged in, also save user-specific keys
      if (user?.id) {
        localStorage.setItem(`${user.id}:interviews`, jobsJson);
        localStorage.setItem(`${user.id}:job_applications`, jobsJson);
      }
      
      logger.info(`JobTracker: Saved ${updatedJobs.length} jobs to localStorage`);
      
      // If user is logged in, sync to Supabase
      if (user?.id) {
        logger.info('JobTracker: Syncing job updates to Supabase');
        dataPersistence.saveInterview(updatedJobs)
          .catch((error: Error) => {
            logger.error("Failed to save jobs to Supabase:", error);
          });
      }
    }
  }, [user, dataPersistence]);

  const addJob = () => {
    if (newJob.company && newJob.position && newJob.date) {
      const newJobWithId = { ...newJob, id: Date.now().toString() } as Job;
      const updatedJobs = [...jobs, newJobWithId];
      setJobs(updatedJobs);
      saveJobs(updatedJobs);
      
      setNewJob({
        company: '',
        position: '',
        date: new Date().toISOString().substring(0, 10),  // Today's date
        status: JOB_STATUSES.APPLIED,
        salaryMin: '',
        salaryMax: '',
        notes: '',
        skills: [],
      });
      
      // Log activity
      addActivity('interview', `Added job for ${newJob.position} at ${newJob.company}`);
    }
  };

  const updateJob = async (id: string | number, updates: Partial<Job>) => {
    // Optimistic update in the UI first (for responsiveness)
    const jobToUpdate = jobs.find(job => job.id === id);
    if (!jobToUpdate) return;
    
    const updatedJob = { ...jobToUpdate, ...updates };
    
    // Update local state immediately (optimistic update)
    const updatedJobs = jobs.map(job => job.id === id ? updatedJob : job);
    setJobs(updatedJobs);
    
    // Always update localStorage for fallback
    localStorage.setItem('jobs', JSON.stringify(updatedJobs));
    
    // If user is logged in, update the specific job in Supabase directly
    if (user && user.id) {
      try {
        logger.info(`Updating job ${id} in Supabase with status: ${updates.status || jobToUpdate.status}`);
        
        // Use the new updateSingleJob function from dataPersistence
        const success = await dataPersistence.updateSingleJob({
          id: id.toString(),
          user_id: user.id,
          ...updates,
          // Add timestamp for tracking
          last_updated: new Date().toISOString()
        });
        
        if (success) {
          logger.info(`Successfully updated job ${id} in Supabase`);
          // Record activity
          addActivity('interview', `Updated job for ${updatedJob.position} at ${updatedJob.company}`);
        } else {
          logger.warn(`Failed to update job ${id} in Supabase, but UI is updated`);
        }
      } catch (error) {
        logger.error("Failed to update job in Supabase:", error);
        // If Supabase update fails, we already have the update in localStorage
      }
    } else {
      // For users not logged in, fall back to full array save
      saveJobs(updatedJobs);
      addActivity('interview', `Updated job for ${updates.position || updatedJob.position} at ${updates.company || updatedJob.company}`);
    }
  };

  const deleteJob = (id: string | number) => {
    const jobToDelete = jobs.find(job => job.id === id);
    const updatedJobs = jobs.filter(job => job.id !== id);
    setJobs(updatedJobs);
    saveJobs(updatedJobs);
    if (jobToDelete) {
      addActivity('interview', `Deleted job for ${jobToDelete.position} at ${jobToDelete.company}`);
    }
  };

  // Filter and sort jobs
  const filteredAndSortedJobs = () => {
    let filtered = [...jobs];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job => 
        job.company.toLowerCase().includes(query) ||
        job.position.toLowerCase().includes(query) ||
        (job.notes && job.notes.toLowerCase().includes(query)) ||
        (job.skills && job.skills.some(skill => skill.toLowerCase().includes(query)))
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'favorites') {
        filtered = filtered.filter(job => favorites.includes(job.id));
      } else {
        filtered = filtered.filter(job => job.status === filterStatus);
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let valueA = a[sortKey];
      let valueB = b[sortKey];
      
      // Special handling for date strings
      if (sortKey === 'date') {
        valueA = new Date(valueA as string).getTime();
        valueB = new Date(valueB as string).getTime();
      } else {
        // Convert to strings for comparison
        valueA = String(valueA || '').toLowerCase();
        valueB = String(valueB || '').toLowerCase();
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  };

  // Calculated metrics for the analytics section
  const calculateStatusCounts = () => {
    const counts: Record<string, number> = {
      [JOB_STATUSES.TO_APPLY]: 0,
      [JOB_STATUSES.APPLIED]: 0,
      [JOB_STATUSES.INTERVIEWING]: 0,
      [JOB_STATUSES.OFFER]: 0,
      [JOB_STATUSES.REJECTED]: 0
    };
    
    jobs.forEach(job => {
      const status = job.status;
      if (counts[status] !== undefined) {
        counts[status]++;
      } else {
        // For legacy data
        const mappedStatus = mapOldStatusToNew(status);
        counts[mappedStatus]++;
      }
    });
    
    return counts;
  };

  // Get company counts for analytics
  const getCompanyLocationCounts = () => {
    const companyCount: Record<string, number> = {};
    
    jobs.forEach(job => {
      if (companyCount[job.company]) {
        companyCount[job.company]++;
      } else {
        companyCount[job.company] = 1;
      }
    });
    
    // Sort companies by application count (descending)
    return Object.entries(companyCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Show top 5
  };

  // Function to check if a date is in the past
  const isDatePassed = (date: string) => {
    return new Date(date) < new Date();
  };

  // Format salary amounts for display
  const formatSalary = (num: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(parseInt(num));
  };

  // Keep track of all recent drag operations to prevent refresh issues
  // This map stores the most recent status for each job ID to ensure they don't snap back
  const recentDragOperationsRef = React.useRef<Map<string, string>>(new Map());
  
  // Track when the last drag operation was performed
  const lastDragTimeRef = React.useRef<number>(0);
  
  // Disable data refresh if it's too soon after a drag operation
  const shouldSkipDataRefresh = () => {
    const now = Date.now();
    const timeSinceLastDrag = now - lastDragTimeRef.current;
    // Skip refresh if less than 2 seconds have passed since the last drag
    return timeSinceLastDrag < 2000;
  };
  
  // Function to handle drag and drop with robust persistence
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // If there's no destination, the item was dropped outside a valid droppable area
    if (!destination) {
      logger.debug('No destination found for drag operation');
      return;
    }
    
    // Log drag operation details for debugging
    logger.debug('Drag details:', {
      sourceId: source.droppableId,
      sourceNormalized: fixStatusForDragDrop(source.droppableId),
      sourceIndex: source.index,
      destinationId: destination.droppableId,
      destinationNormalized: fixStatusForDragDrop(destination.droppableId),
      destinationIndex: destination.index,
      itemId: draggableId
    });
    
    // If the item was dropped in its original position, no need to update
    if (destination.droppableId === source.droppableId && 
        destination.index === source.index) {
      logger.debug('Item dropped in the same position, no update needed');
      return;
    }
    
    // Find the job being dragged in our current state
    const jobId = draggableId;
    const jobToUpdate = jobs.find(job => job.id.toString() === jobId);
    
    if (!jobToUpdate) {
      logger.error(`Job with ID ${jobId} not found in current state`);
      return;
    }
    
    // IMPORTANT: Normalize the destination status to ensure consistent values
    // This is critical for cards dragged to/from the rejected section
    const normalizedStatus = fixStatusForDragDrop(destination.droppableId);
    logger.info(`Updating job ${jobId} status from ${jobToUpdate.status} to: ${normalizedStatus}`);
    
    // Store the drag operation details in our Map to prevent race conditions
    // This allows us to track multiple jobs independently
    recentDragOperationsRef.current.set(jobId.toString(), normalizedStatus);
    
    // Update the last drag time to prevent unwanted refreshes
    lastDragTimeRef.current = Date.now();
    
    // Create a deep clone of the current jobs array using our efficient utility
    // This ensures we don't have reference issues when updating state
    const currentJobs = deepClone(jobs);
    
    // Update the job's status in our cloned array with the normalized status
    const updatedJobs = currentJobs.map(job => 
      job.id.toString() === jobId 
        ? { 
            ...job, 
            status: normalizedStatus, // Use normalized status here
            last_updated: new Date().toISOString() 
          } 
        : job
    );
    
    // Immediately update UI state for a responsive feel
    // This critical line ensures the UI reflects the change immediately
    setJobs(updatedJobs);
    
    // Persist to localStorage for immediate fallback
    // Using multiple storage locations for redundancy
    const jobsJson = JSON.stringify(updatedJobs);
    localStorage.setItem('jobs', jobsJson);
    localStorage.setItem('interviews', jobsJson);
    localStorage.setItem('job_applications', jobsJson);
    
    // If user is logged in, store user-specific data as well
    if (user?.id) {
      localStorage.setItem(`${user.id}:interviews`, jobsJson);
      localStorage.setItem(`${user.id}:job_applications`, jobsJson);
    }
    
    logger.info(`JobTracker: Optimistically updated job status in UI and localStorage`);
    
    // Now update in Supabase (in the background, doesn't block UI)
    if (user?.id) {
      try {
        // Update immediately without refreshing data afterwards
        // This prevents the problem of refreshes causing snapping back
        logger.info(`Updating job ${jobId} status to ${normalizedStatus} in Supabase directly`);
        
        // Use the direct job update function to update the status without triggering a refresh
        dataPersistence.updateSingleJob({
          id: jobId,
          user_id: user.id,
          status: normalizedStatus,
          last_updated: new Date().toISOString()
        })
        .then(() => {
          console.log(`Successfully updated job ${jobId} in Supabase with status: ${normalizedStatus}`);
          // We intentionally DON'T refresh data here to prevent snap-back issues
        })
        .catch((error) => {
          console.error("Failed to update single job in Supabase:", error);
          
          // If the single job update fails, try the batch update as fallback
          console.log("Attempting batch update as fallback...");
          dataPersistence.saveInterview(updatedJobs)
          .then(() => {
            console.log('Successfully updated batch in Supabase');
            // Again, we don't refresh data here to prevent snap-back
          })
          .catch((batchError) => {
            console.error("Batch update also failed:", batchError);
            // Even if backend persistence fails, the UI is still updated
            // LocalStorage will serve as a backup until connectivity is restored
          });
        });
        
        // Record activity regardless of Supabase success (UI is already updated)
        addActivity('interview', `Changed status of ${jobToUpdate.position} at ${jobToUpdate.company} to ${STATUS_LABELS[normalizedStatus as keyof typeof STATUS_LABELS]}`);
      } catch (error) {
        // Error already logged in the Promise catch above
        // UI already updated, database will sync on next successful operation
      }
    } else {
      // For users not logged in, we already saved to localStorage
      console.log("User not logged in, changes saved to localStorage only");
    }
  };

  // Group jobs by status for Kanban board
  const getJobsByStatus = () => {
    const columns: Record<string, Job[]> = {
      [JOB_STATUSES.TO_APPLY]: [],
      [JOB_STATUSES.APPLIED]: [],
      [JOB_STATUSES.INTERVIEWING]: [],
      [JOB_STATUSES.OFFER]: [],
      [JOB_STATUSES.REJECTED]: [],
    };
    
    // If we're searching/filtering, only show matching jobs
    const jobsToDisplay = searchQuery || filterStatus !== 'all' ? filteredAndSortedJobs() : jobs;
    
    // Group jobs by status
    jobsToDisplay.forEach(job => {
      if (columns[job.status]) {
        columns[job.status].push(job);
      } else {
        // Handle legacy data
        const mappedStatus = mapOldStatusToNew(job.status);
        columns[mappedStatus].push({ ...job, status: mappedStatus });
      }
    });
    
    // Sort jobs within each column by date (newest first)
    Object.keys(columns).forEach(status => {
      columns[status].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    });
    
    return columns;
  };

  return (
    <div className="max-w-full mx-auto p-4">
      {/* Header with stats */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <Briefcase className="mr-3" />
              Job Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and manage your job applications in one place
            </p>
          </div>
          
          {/* Quick stats */}
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center space-x-2 border border-gray-100 dark:border-gray-700">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium">{jobs.length} Applications</span>
            </div>
            <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center space-x-2 border border-gray-100 dark:border-gray-700">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium">{calculateStatusCounts()[JOB_STATUSES.OFFER]} Offers</span>
            </div>
            <button 
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg shadow-sm flex items-center space-x-2 border border-purple-100 dark:border-purple-800/30 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <BarChart2 size={16} />
              <span className="text-sm font-medium">{showAnalytics ? 'Hide Analytics' : 'Show Analytics'}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Add Button (that expands to form) */}
      <div className="mb-8">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <Plus size={20} />
            <span>Add New Job Application</span>
          </button>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 relative">
            <button 
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          
            <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900 dark:text-white">
              <Plus className="mr-2 text-blue-600 dark:text-blue-400" />
              Add New Job Application
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Company</label>
                <input
                  type="text"
                  placeholder="e.g. Google"
                  value={newJob.company}
                  onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                  className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Position</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Developer"
                  value={newJob.position}
                  onChange={(e) => setNewJob({...newJob, position: e.target.value})}
                  className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Date Applied</label>
                <input
                  type="date"
                  value={newJob.date}
                  onChange={(e) => setNewJob({...newJob, date: e.target.value})}
                  className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Status</label>
                <select
                  value={newJob.status}
                  onChange={(e) => setNewJob({...newJob, status: e.target.value as Job['status']})}
                  className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {Object.entries(JOB_STATUSES).map(([key, value]) => (
                    <option key={value} value={value}>
                      {STATUS_LABELS[value]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Salary Range</label>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <DollarSign size={16} />
                      </span>
                      <input
                        type="number"
                        placeholder="Min"
                        value={newJob.salaryMin}
                        onChange={(e) => setNewJob({...newJob, salaryMin: e.target.value})}
                        className="p-3 pl-9 w-full border rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <DollarSign size={16} />
                      </span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={newJob.salaryMax}
                        onChange={(e) => setNewJob({...newJob, salaryMax: e.target.value})}
                        className="p-3 pl-9 w-full border rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Notes</label>
                <textarea
                  placeholder="Add any relevant details about the application..."
                  value={newJob.notes}
                  onChange={(e) => setNewJob({...newJob, notes: e.target.value})}
                  className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-full"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Skills Required</label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 min-h-12">
                  {newJob.skills?.map((skill, index) => (
                    <div key={index} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full flex items-center">
                      <span>{skill}</span>
                      <button
                        onClick={() => setNewJob({
                          ...newJob,
                          skills: newJob.skills?.filter((_, i) => i !== index)
                        })}
                        className="ml-2 p-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/30"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    placeholder="Type skill and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                        setNewJob({
                          ...newJob,
                          skills: [...(newJob.skills || []), (e.target as HTMLInputElement).value.trim()]
                        });
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="outline-none bg-transparent flex-grow min-w-[120px]"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  addJob();
                  setShowAddForm(false);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
                disabled={!newJob.company || !newJob.position}
              >
                <Plus size={20} className="mr-2" />
                Add Job
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Search and Filter Controls */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
            <div className="relative">
              <button
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className="flex items-center space-x-2 p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Filter size={18} />
                <span className="text-sm font-medium">Filter</span>
                <ChevronDown size={18} className={`transform transition-transform ${isFilterMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isFilterMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-10 border dark:border-gray-700">
                  <div className="p-4">
                    <h3 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Status</h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={filterStatus === 'all'}
                          onChange={() => setFilterStatus('all')}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span>All</span>
                      </label>
                      {Object.entries(JOB_STATUSES).map(([key, value]) => (
                        <label key={value} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={filterStatus === value}
                            onChange={() => setFilterStatus(value)}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="flex items-center gap-1.5">
                            <span className={`inline-block w-2 h-2 rounded-full ${BADGE_COLORS[value as keyof typeof BADGE_COLORS].split(' ')[0]}`}></span>
                            {STATUS_LABELS[value as keyof typeof STATUS_LABELS]}
                          </span>
                        </label>
                      ))}
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={filterStatus === 'favorites'}
                          onChange={() => setFilterStatus('favorites')}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="flex items-center gap-1.5">
                          <Star size={14} className="text-yellow-500" />
                          Favorites
                        </span>
                      </label>
                    </div>
                    
                    <h3 className="font-medium mb-2 mt-4 text-gray-700 dark:text-gray-300">Sort By</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={sortKey === 'date'}
                            onChange={() => setSortKey('date')}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span>Date</span>
                        </label>
                        <button 
                          onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={sortKey === 'company'}
                            onChange={() => setSortKey('company')}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span>Company</span>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={sortKey === 'status'}
                            onChange={() => setSortKey('status')}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span>Status</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-300' 
                    : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title="List View"
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'kanban' 
                    ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-300' 
                    : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title="Kanban View"
              >
                <Grid size={20} />
              </button>
            </div>
            
            {favorites.length > 0 && (
              <button 
                onClick={() => setFilterStatus(filterStatus === 'favorites' ? 'all' : 'favorites')}
                className={`px-3 py-2 rounded-lg flex items-center text-sm ${
                  filterStatus === 'favorites' 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                } hover:bg-opacity-80 transition-colors`}
              >
                <Star size={16} className={`mr-1.5 ${filterStatus === 'favorites' ? 'text-yellow-500' : ''}`} />
                {filterStatus === 'favorites' ? 'Show All' : 'Favorites'}
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-4">
          <div>
            Showing {filteredAndSortedJobs().length} of {jobs.length} applications
          </div>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="text-blue-500 hover:underline flex items-center"
            >
              <X size={14} className="mr-1" />
              Clear search
            </button>
          )}
        </div>
      </div>
      
      {/* Analytics Section */}
      {showAnalytics && (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900 dark:text-white">
              <BarChart2 className="mr-2 text-purple-600 dark:text-purple-400" />
              Application Analytics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Status Breakdown */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/60 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-5 text-gray-800 dark:text-gray-200 flex items-center">
                  <CheckSquare className="mr-2 text-purple-600 dark:text-purple-400" size={18} />
                  Application Status
                </h3>
                <div className="space-y-5">
                  {Object.entries(calculateStatusCounts()).map(([status, count]) => (
                    <div key={status} className="flex items-center">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-lg ${BADGE_COLORS[status as keyof typeof BADGE_COLORS].split(' ')[0]} flex items-center justify-center mr-3`}>
                              {STATUS_ICONS[status as keyof typeof STATUS_ICONS]}
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 px-2 py-1 rounded shadow-sm border border-gray-200 dark:border-gray-600">
                            {count}
                          </span>
                        </div>
                        <div className="relative">
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${BADGE_COLORS[status as keyof typeof BADGE_COLORS].split(' ')[0]}`}
                              style={{ width: `${jobs.length > 0 ? (count / jobs.length) * 100 : 0}%` }}
                            ></div>
                          </div>
                          {/* Percentage indicator */}
                          <div className="absolute -right-1 -top-1 text-[10px] text-gray-500 dark:text-gray-400">
                            {jobs.length > 0 ? Math.round((count / jobs.length) * 100) : 0}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Top Companies and Metrics */}
              <div className="flex flex-col gap-6">
                {/* Top Companies */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-2xl p-6 shadow-sm border border-blue-200 dark:border-blue-800/30">
                  <h3 className="text-lg font-semibold mb-5 text-gray-800 dark:text-gray-200 flex items-center">
                    <Building className="mr-2 text-blue-600 dark:text-blue-400" size={18} />
                    Top Companies
                  </h3>
                  <div className="space-y-4">
                    {getCompanyLocationCounts().length > 0 ? (
                      getCompanyLocationCounts().map(([company, count], index) => (
                        <div key={company} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-white dark:bg-gray-700 rounded-lg shadow-sm flex items-center justify-center mr-3 text-sm font-bold text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600">
                              {index + 1}
                            </div>
                            <span className="text-gray-800 dark:text-gray-200 font-medium">{company}</span>
                          </div>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 rounded-full text-xs font-medium">
                            {count} {count === 1 ? 'application' : 'applications'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-gray-500 dark:text-gray-400">
                        <Building size={40} className="mb-3 opacity-40" />
                        <p>No company data available yet</p>
                        <p className="text-sm mt-1">Add job applications to see statistics</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-2xl p-5 shadow-sm border border-green-200 dark:border-green-800/30">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center mb-3">
                        <CheckSquare className="text-green-600 dark:text-green-400" size={24} />
                      </div>
                      <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Offers Received</h3>
                      <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                        {calculateStatusCounts()[JOB_STATUSES.OFFER]}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-2xl p-5 shadow-sm border border-purple-200 dark:border-purple-800/30">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center mb-3">
                        <Calendar className="text-purple-600 dark:text-purple-400" size={24} />
                      </div>
                      <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Interviews</h3>
                      <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                        {calculateStatusCounts()[JOB_STATUSES.INTERVIEWING]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Overall Stats */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow border border-gray-200 dark:border-gray-600 flex items-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-800/50 mr-4">
                  <Briefcase size={20} className="text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <h4 className="text-xs text-gray-500 dark:text-gray-400">Total Applications</h4>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{jobs.length}</p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow border border-gray-200 dark:border-gray-600 flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-800/50 mr-4">
                  <CheckSquare size={20} className="text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <h4 className="text-xs text-gray-500 dark:text-gray-400">Success Rate</h4>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {jobs.length > 0 
                      ? `${Math.round((calculateStatusCounts()[JOB_STATUSES.OFFER] / jobs.length) * 100)}%` 
                      : '0%'}
                  </p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow border border-gray-200 dark:border-gray-600 flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-800/50 mr-4">
                  <Clock size={20} className="text-yellow-600 dark:text-yellow-300" />
                </div>
                <div>
                  <h4 className="text-xs text-gray-500 dark:text-gray-400">Pending</h4>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {calculateStatusCounts()[JOB_STATUSES.TO_APPLY] + calculateStatusCounts()[JOB_STATUSES.APPLIED]}
                  </p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow border border-gray-200 dark:border-gray-600 flex items-center">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-800/50 mr-4">
                  <AlertCircle size={20} className="text-red-600 dark:text-red-300" />
                </div>
                <div>
                  <h4 className="text-xs text-gray-500 dark:text-gray-400">Rejected</h4>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {calculateStatusCounts()[JOB_STATUSES.REJECTED]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Grid className="mr-2 text-blue-600 dark:text-blue-400" />
              Job Applications Board
            </h2>
            
            {favorites.length > 0 && (
              <button 
                onClick={() => setFilterStatus(filterStatus === 'favorites' ? 'all' : 'favorites')}
                className={`px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-all ${
                  filterStatus === 'favorites' 
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-md' 
                    : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/30'
                }`}
              >
                <Star size={16} className="mr-1.5" />
                {filterStatus === 'favorites' ? 'Show All Applications' : 'Show Favorites'}
              </button>
            )}
          </div>
          
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 2xl:grid-cols-5 xl:grid-cols-3 lg:grid-cols-2 gap-5 overflow-x-auto">
              {Object.entries(getJobsByStatus()).map(([status, statusJobs]) => (
                <Droppable droppableId={fixStatusForDragDrop(status)} key={fixStatusForDragDrop(status)} type="group">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`${COLUMN_COLORS[status as keyof typeof COLUMN_COLORS]} p-4 rounded-xl border min-h-[500px] flex flex-col transition-shadow ${
                        snapshot.isDraggingOver ? 'shadow-lg ring-2 ring-blue-300 dark:ring-blue-600' : 'shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 ${BADGE_COLORS[status as keyof typeof BADGE_COLORS].split(' ')[0]} rounded-lg flex items-center justify-center mr-3 shadow-sm`}>
                            {STATUS_ICONS[status as keyof typeof STATUS_ICONS]}
                          </div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                          </h3>
                        </div>
                        <span className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-sm font-medium shadow-sm border border-gray-200 dark:border-gray-600">
                          {statusJobs.length}
                        </span>
                      </div>
                      
                      <div className="space-y-3 flex-grow overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                        {statusJobs.map((job, index) => (
                          <Draggable draggableId={String(job.id)} index={index} key={job.id}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white dark:bg-gray-800 p-4 rounded-lg transition-all ${
                                  snapshot.isDragging 
                                    ? 'shadow-xl ring-2 ring-blue-400 dark:ring-blue-500 rotate-1 scale-105' 
                                    : 'shadow-md hover:shadow-lg'
                                }`}
                                style={{
                                  ...provided.draggableProps.style,
                                }}
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{job.company}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{job.position}</p>
                                  </div>
                                  <div className="flex">
                                    <button
                                      onClick={() => toggleFavorite(job.id)}
                                      className={`p-1.5 rounded-full transition-colors ${favorites.includes(job.id) 
                                        ? 'bg-yellow-50 dark:bg-yellow-900/30' 
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    >
                                      {favorites.includes(job.id) 
                                        ? <Star size={18} className="text-yellow-500" /> 
                                        : <StarOff size={18} className="text-gray-400 dark:text-gray-500" />}
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center">
                                  <Calendar size={12} className="mr-1.5" />
                                  {new Date(job.date).toLocaleDateString(undefined, { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </div>
                                
                                {job.salaryMin && job.salaryMax && (
                                  <div className="mb-3 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs flex items-center">
                                    <DollarSign size={12} className="mr-1.5 text-green-600 dark:text-green-400" />
                                    {formatSalary(job.salaryMin)} - {formatSalary(job.salaryMax)}
                                  </div>
                                )}
                                
                                {job.skills && job.skills.length > 0 && (
                                  <div className="mb-3">
                                    <div className="flex flex-wrap gap-1.5">
                                      {job.skills.slice(0, 3).map((skill, i) => (
                                        <span key={i} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs">
                                          {skill}
                                        </span>
                                      ))}
                                      {job.skills.length > 3 && (
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                                          +{job.skills.length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="flex gap-1 mt-3 border-t dark:border-gray-700 pt-3">
                                  <button
                                    onClick={() => setEditingId(job.id)}
                                    className="flex-1 py-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors flex items-center justify-center text-sm"
                                  >
                                    <Edit2 size={14} className="mr-1" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteJob(job.id)}
                                    className="flex-1 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors flex items-center justify-center text-sm"
                                  >
                                    <Trash2 size={14} className="mr-1" />
                                    Remove
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {statusJobs.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500 h-32">
                            <div className="mb-3 p-3 rounded-full bg-gray-100 dark:bg-gray-700">
                              {STATUS_ICONS[status as keyof typeof STATUS_ICONS]}
                            </div>
                            <p className="text-sm">No applications here</p>
                            <p className="text-xs mt-1">Drag items or add new ones</p>
                          </div>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => {
                          setNewJob({...newJob, status: status as Job['status']});
                          setShowAddForm(true);
                          // Scroll to the add form
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="mt-4 w-full py-2.5 bg-white dark:bg-gray-700 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Plus size={16} className="mr-1.5" />
                        Add {STATUS_LABELS[status as keyof typeof STATUS_LABELS]} Application
                      </button>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </div>
      )}
      
      {/* Traditional Card View (shown when not in Kanban view) */}
      {viewMode === 'list' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <List className="mr-2 text-blue-600 dark:text-blue-400" />
              Job Applications
            </h2>
          </div>
          
          {filteredAndSortedJobs().length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden p-10">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                  <Briefcase size={36} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No job applications found</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                  {searchQuery 
                    ? "No applications match your search criteria. Try adjusting your filters or search terms."
                    : "Start tracking your job applications by adding your first job application."}
                </p>
                <button
                  onClick={() => {
                    setShowAddForm(true);
                    setSearchQuery('');
                    setFilterStatus('all');
                  }}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus size={18} className="mr-2" />
                  Add Your First Application
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedJobs().map((job) => (
                <div 
                  key={job.id} 
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-200 dark:border-gray-700 ${
                    isDatePassed(job.date) ? 'border-l-4 border-l-red-500 dark:border-l-red-600' : ''
                  } ${favorites.includes(job.id) ? 'ring-2 ring-yellow-300 dark:ring-yellow-500' : ''}`}
                >
                  {editingId === job.id ? (
                    <div className="p-5 space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Application</h3>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Company</label>
                          <input
                            type="text"
                            value={job.company}
                            onChange={(e) => updateJob(job.id, { company: e.target.value })}
                            className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Position</label>
                          <input
                            type="text"
                            value={job.position}
                            onChange={(e) => updateJob(job.id, { position: e.target.value })}
                            className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Date</label>
                            <input
                              type="date"
                              value={job.date}
                              onChange={(e) => updateJob(job.id, { date: e.target.value })}
                              className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label>
                            <select
                              value={job.status}
                              onChange={(e) => updateJob(job.id, { status: e.target.value as Job['status'] })}
                              className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                            >
                              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Min Salary</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <DollarSign size={16} />
                              </span>
                              <input
                                type="number"
                                value={job.salaryMin}
                                onChange={(e) => updateJob(job.id, { salaryMin: e.target.value })}
                                className="w-full p-2.5 pl-9 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Max Salary</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <DollarSign size={16} />
                              </span>
                              <input
                                type="number"
                                value={job.salaryMax}
                                onChange={(e) => updateJob(job.id, { salaryMax: e.target.value })}
                                className="w-full p-2.5 pl-9 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Notes</label>
                          <textarea
                            value={job.notes}
                            onChange={(e) => updateJob(job.id, { notes: e.target.value })}
                            className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Skills</label>
                          <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 min-h-12">
                            {job.skills?.map((skill, index) => (
                              <div key={index} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full flex items-center">
                                <span>{skill}</span>
                                <button
                                  onClick={() => updateJob(job.id, {
                                    skills: job.skills?.filter((_, i) => i !== index)
                                  })}
                                  className="ml-2 p-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/30"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                            <input
                              type="text"
                              placeholder="Type skill and press Enter"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                                  updateJob(job.id, {
                                    skills: [...(job.skills || []), (e.target as HTMLInputElement).value.trim()]
                                  });
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }}
                              className="outline-none bg-transparent flex-grow min-w-[120px]"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-3 mt-6">
                        <button 
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow transition-colors flex items-center"
                        >
                          <Check size={18} className="mr-1.5" />
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white group flex items-center">
                            {job.company}
                            {favorites.includes(job.id) && (
                              <Star size={16} className="ml-2 text-yellow-500" />
                            )}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">{job.position}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${BADGE_COLORS[job.status]}`}>
                          {STATUS_ICONS[job.status as keyof typeof STATUS_ICONS]}
                          {STATUS_LABELS[job.status as keyof typeof STATUS_LABELS]}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-5">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Calendar className="flex-shrink-0 w-4 h-4 mr-2" />
                          <span>Applied on {new Date(job.date).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        
                        {(job.salaryMin || job.salaryMax) && (
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <DollarSign className="flex-shrink-0 w-4 h-4 mr-2" />
                            <span>
                              {job.salaryMin && formatSalary(job.salaryMin)}
                              {job.salaryMin && job.salaryMax && ' - '}
                              {job.salaryMax && formatSalary(job.salaryMax)}
                              {job.salaryMin || job.salaryMax ? ' per year' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {job.skills && job.skills.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {job.skills.map((skill, index) => (
                              <div key={index} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                                {skill}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {job.notes && (
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center text-gray-700 dark:text-gray-300 mb-2">
                            <StickyNote className="w-4 h-4 mr-2" />
                            <span className="font-medium">Notes</span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">
                            {job.notes}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-5 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <button
                          onClick={() => setEditingId(job.id)}
                          className="flex-1 py-2 px-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center"
                        >
                          <Edit2 size={16} className="mr-1.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => toggleFavorite(job.id)}
                          className={`flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center ${
                            favorites.includes(job.id)
                              ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                              : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                        >
                          {favorites.includes(job.id) ? (
                            <>
                              <Star size={16} className="mr-1.5" />
                              Favorite
                            </>
                          ) : (
                            <>
                              <StarOff size={16} className="mr-1.5" />
                              Add to Favorites
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => deleteJob(job.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobTracker;