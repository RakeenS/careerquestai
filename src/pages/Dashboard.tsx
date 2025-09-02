import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ChevronRight, 
  CheckSquare, Square,
  FileText, Briefcase, Target, Activity,
  Eye, Edit2, X, ExternalLink, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useActivity } from '../context/ActivityContext';
import { supabase } from '../lib/supabaseClient';
import { 
  getResumes, 
  getJobApplications, 
  getInterviews, 
  getUserStats
} from '../lib/supabaseStorage';
import { getUserGoals, createGoal, updateGoal, Goal as GoalType } from '../lib/goalService';

// Interface for activity item - aligning with ActivityContext type
interface ActivityItem {
  id?: string;
  type: 'resume' | 'interview' | 'favorite' | 'application' | 'goal' | string;
  action: string;
  target?: string;
  timestamp?: string | number;
}

// Interface for resume data - streamlined for dashboard UI
interface Resume {
  id: string;
  name: string;
  lastUpdated: string;
  jobTitle?: string;
  content?: string;
  // Resume content structure
  personalInfo?: {
    fullName: string;
    title: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    summary?: string;
  };
  experience?: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate: string;
    description?: string;
    current?: boolean;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    location?: string;
    startDate: string;
    endDate: string;
    description?: string;
    current?: boolean;
  }>;
  skills?: Array<{
    name: string;
    level?: number;
  }>;
  sectionOrder?: string[];
  metadata?: {
    lastModified: string;
    template: string;
  };
}

// Interface for interview data
interface Interview {
  id: string;
  company: string;
  position: string;
  date: string;
  status: 'upcoming' | '1st round completed' | 'waiting on final results' | 'did not get' | 'offer received';
  notes: string;
  skills: string[];
}

export default function Dashboard() {
  // State
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [userStats, setUserStats] = useState<any>({});
  const [goals, setGoals] = useState<GoalType[]>([]);
  const [newGoal, setNewGoal] = useState({ title: '', target: 0, current: 0, dueDate: new Date().toISOString().split('T')[0] });
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  // We'll handle errors through individual component states rather than a global error
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<Resume | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activities, refreshActivities, isLoading: isLoadingActivities, addActivity } = useActivity();

  // Log an activity using the ActivityContext
  const logActivity = async (activity: ActivityItem) => {
    if (!user) return;
    
    // Use the addActivity function from ActivityContext
    try {
      // Add the activity to the context
      addActivity(activity.type, activity.action, {
        target: activity.target,
        timestamp: activity.timestamp
      });
      // No need to refresh immediately as addActivity updates the context
    } catch (error) {
      console.warn('Failed to log activity:', error);
    }
  };

  // Load dashboard data from Supabase with localStorage as fallback
  // State for tracking fetch errors
  // Error state is managed at component level rather than globally
  const [, setFetchError] = useState<string | null>(null);

  // Function to fetch data with timeout
  const fetchWithTimeout = async (promiseFn: () => Promise<any>, timeoutMs: number = 10000) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), timeoutMs);
    });
    return Promise.race([promiseFn(), timeoutPromise]);
  };

  // Retry logic is implemented directly in the useEffect where needed

  // Effect to load goals from Supabase
  useEffect(() => {
    const fetchGoals = async () => {
      if (!user) return;
      
      setIsLoadingGoals(true);
      try {
        const goalsData = await getUserGoals(user.id);
        setGoals(goalsData);
        console.log(`Loaded ${goalsData.length} goals from Supabase`);
      } catch (error) {
        console.error('Error fetching goals:', error);
      } finally {
        setIsLoadingGoals(false);
      }
    };
    
    fetchGoals();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setFetchError(null);
      
      // Set default empty data in case of errors
      try {
        // Get resumes from Supabase with timeout
        const resumesData = await fetchWithTimeout(
          () => getResumes(user.id),
          15000
        ).catch(err => {
          console.error('Resume fetch failed:', err);
          return []; // Return empty array on failure
        });
        
        console.log(`Loaded ${resumesData.length} resumes from Supabase`);
        
        // Format resumes for the dashboard
        const formattedResumes = (resumesData || []).map((resume: any) => ({
          id: resume.id || '',
          name: resume.name || 'Unnamed Resume',
          lastUpdated: resume.metadata?.lastModified || new Date().toISOString(),
          jobTitle: resume.jobTitle || 'No Job Title',
          content: JSON.stringify(resume)
        }));
        
        setResumes(formattedResumes);
        
        // Get job applications with timeout
        const applicationsData = await fetchWithTimeout(
          () => getJobApplications(user.id),
          15000
        ).catch(err => {
          console.error('Applications fetch failed:', err);
          return []; // Return empty array on failure
        });
        
        console.log(`Loaded ${applicationsData?.length || 0} job applications`);
        
        // Get interviews if available - with timeout
        try {
          const interviewsData = await fetchWithTimeout(
            () => getInterviews(user.id),
            10000
          ).catch(err => {
            console.warn('Interview fetch failed:', err);
            return [];
          });
          
          console.log(`Loaded ${interviewsData?.length || 0} interviews`);
          setInterviews(interviewsData || []);
        } catch (error) {
          console.warn('Could not load interviews:', error);
          setInterviews([]);
        }
        
        // Get user stats with timeout
        try {
          const stats = await fetchWithTimeout(
            () => getUserStats(user.id),
            10000
          ).catch(err => {
            console.warn('Stats fetch failed:', err);
            return {};
          });
          
          setUserStats(stats || {});
          console.log('User stats loaded successfully');
        } catch (error) {
          console.warn('Could not load user stats:', error);
          setUserStats({});
        }
        
        // Refresh activities from the ActivityContext
        try {
          await refreshActivities();
        } catch (error) {
          console.warn('Could not refresh activities:', error);
        }
        
        // If we get here, we've managed to load at least some data
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setFetchError('Could not load dashboard data. Please try again.');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Add an effect to debug loading state changes
  useEffect(() => {
    console.log("Dashboard render - isLoading:", isLoading);
  }, [isLoading]);

  // Function to handle goal form submission
  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      console.error('No user found');
      return;
    }
    
    // Create goal in Supabase
    const goalData = {
      user_id: user.id,
      title: newGoal.title,
      target: newGoal.target,
      current: 0,
      due_date: newGoal.dueDate,
      completed: false
    };
    
    try {
      const createdGoal = await createGoal(goalData);
      
      if (createdGoal) {
        // Update local state
        setGoals(prevGoals => [...prevGoals, createdGoal]);
        
        // Log the activity
        logActivity({
          type: 'goal',
          action: 'created',
          target: newGoal.title,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    }
    
    // Reset form
    setNewGoal({
      title: '',
      target: 0,
      current: 0,
      dueDate: new Date().toISOString().split('T')[0]
    });
    setIsAddingGoal(false);
  };
  
  // Function to toggle goal completion
  const toggleGoalCompletion = async (id: string) => {
    if (!user) return;
    
    const goalToUpdate = goals.find(goal => goal.id === id);
    if (!goalToUpdate) return;
    
    const updatedGoalData = { ...goalToUpdate, completed: !goalToUpdate.completed };
    
    try {
      // Update goal in Supabase
      const updatedGoal = await updateGoal(updatedGoalData);
      
      if (updatedGoal) {
        // Update local state
        setGoals(prevGoals => 
          prevGoals.map(goal => 
            goal.id === id ? updatedGoal : goal
          )
        );
        
        // Log the activity
        logActivity({
          type: 'goal',
          action: updatedGoal.completed ? 'completed' : 'uncompleted',
          target: goalToUpdate.title,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  // Display upcoming interviews in a modern card layout
  const renderUpcomingInterviews = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Interviews</h2>
          <button 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            onClick={() => navigate('/interviews')}
          >
            View All
          </button>
        </div>
        
        <div className="p-3">
          {interviews.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 dark:text-gray-400">No upcoming interviews scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {interviews.slice(0, 3).map((interview) => {
                const interviewDate = new Date(interview.date);
                const isToday = new Date().toDateString() === interviewDate.toDateString();
                
                return (
                  <motion.div 
                    key={interview.id}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{interview.position}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{interview.company}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          {isToday ? 'Today' : interviewDate.toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-500">
                          {interviewDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    {interview.notes && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        <div className="font-medium mb-1">Notes:</div>
                        {interview.notes}
                      </div>
                    )}
                    <div className="mt-3 flex justify-end space-x-2">
                      <button 
                        className="text-sm px-3 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800"
                        onClick={() => navigate('/preparation')}
                      >
                        Prepare
                      </button>
                      <button 
                        className="text-sm px-3 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                        onClick={() => navigate(`/interviews/${interview.id}/edit`)}
                      >
                        Edit
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Function to display the recent activities
  const renderRecentActivities = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
          <button 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
            onClick={() => navigate('/activities')}
          >
            <span className="mr-1">View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
          
          {/* Activity items */}
          <div className="space-y-6 ml-2">
            {isLoadingActivities ? (
              <div className="text-center py-6 pl-8">
                <p className="text-gray-500 dark:text-gray-400">Loading activities...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-6 pl-8">
                <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
              </div>
            ) : (
              activities.slice(0, 5).map((activity: any, index) => {
                // Convert timestamp to Date object, handling both string and number formats
                const date = new Date(typeof activity.timestamp === 'string' 
                  ? activity.timestamp 
                  : Number(activity.timestamp));
                const isToday = new Date().toDateString() === date.toDateString();
                
                // Icon based on activity type
                let icon;
                let bgColor;
                
                // Safe type check for activity types
                const activityType = activity.type || 'default';
                
                switch (activityType) {
                  case 'resume':
                    icon = <FileText className="h-4 w-4 text-blue-500" />;
                    bgColor = 'bg-blue-100 dark:bg-blue-900';
                    break;
                  case 'application':
                    icon = <Briefcase className="h-4 w-4 text-purple-500" />;
                    bgColor = 'bg-purple-100 dark:bg-purple-900';
                    break;
                  case 'interview':
                    icon = <Activity className="h-4 w-4 text-green-500" />;
                    bgColor = 'bg-green-100 dark:bg-green-900';
                    break;
                  case 'goal':
                    icon = <Target className="h-4 w-4 text-orange-500" />;
                    bgColor = 'bg-orange-100 dark:bg-orange-900';
                    break;
                  default:
                    icon = <ChevronRight className="h-4 w-4 text-gray-500" />;
                    bgColor = 'bg-gray-100 dark:bg-gray-700';
                }
                
                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start ml-5"
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${bgColor} -ml-11 z-10`}>
                      {icon}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.action} {activity.type} {activity.target && `- ${activity.target}`}
                        </p>
                        <span className={`text-xs ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'} mt-1 sm:mt-0`}>
                          {isToday 
                            ? `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
                            : date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {getActivityDescription(activity)}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // Helper function to get a human-readable description of activities
  const getActivityDescription = (activity: ActivityItem) => {
    const target = activity.target || '';
    
    switch (activity.type) {
      case 'resume':
        return `You ${activity.action} your resume ${target ? `'${target}'` : ''}`;
      case 'application':
        return `You ${activity.action} a job application ${target ? `for ${target}` : ''}`;
      case 'interview':
        return `You ${activity.action} an interview ${target ? `with ${target}` : ''}`;
      case 'goal':
        return `You ${activity.action} your goal ${target ? `'${target}'` : ''}`;
      default:
        return `You ${activity.action} ${activity.type} ${target}`;
    }
  };

  // Function to display goals
  const renderGoals = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8 mt-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Goal Tracking</h2>
          <button
            onClick={() => setIsAddingGoal(!isAddingGoal)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </button>
        </div>

        {/* Goal Form */}
        <AnimatePresence>
          {isAddingGoal && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6"
            >
              <h3 className="font-medium mb-4 text-gray-800 dark:text-gray-200">Add New Goal</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Goal Title
                  </label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., Applications Per Week"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Number
                  </label>
                  <input
                    type="number"
                    value={newGoal.target || ''}
                    onChange={(e) => setNewGoal({...newGoal, target: parseInt(e.target.value) || 0})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., 10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newGoal.dueDate}
                    onChange={(e) => setNewGoal({...newGoal, dueDate: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={() => setIsAddingGoal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGoalSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  Add Goal
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goals List */}
        <div className="space-y-4">
          {isLoadingGoals ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              Loading goals...
            </p>
          ) : goals.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No goals set yet. Add a goal to start tracking your job search progress.
            </p>
          ) : (
            goals.map((goal) => {
              const progress = calculateProgress(goal);
              const isOverdue = goal.dueDate ? new Date(goal.dueDate) < new Date() : false;
              const isCompleted = goal.completed;
              const currentValue = goal.current || 0;
              
              return (
                <motion.div 
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border ${
                    isOverdue && !isCompleted ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div className="mb-2 md:mb-0">
                      <h3 className="text-md font-medium text-gray-900 dark:text-white">{goal.title}</h3>
                      <div className="flex items-center mt-2 md:mt-0">
                        <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Due: {goal.dueDate ? new Date(goal.dueDate).toLocaleDateString() : 'No date'}</span>
                        <button 
                          onClick={() => toggleGoalCompletion(goal.id)}
                          className={`mt-0.5 ${
                            isCompleted ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-gray-500'
                          }`}
                          title="Toggle Goal Status"
                        >
                          {isCompleted ? <CheckSquare size={18} /> : <Square size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 md:mt-0 w-full md:max-w-xs">
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400 mr-4">Progress: <span className="font-medium">{currentValue}</span> of <span className="font-medium">{goal.target || 0}</span></span>
                        <span className="font-medium text-gray-800 dark:text-gray-200 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md ml-2">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            isCompleted 
                              ? 'bg-green-500 dark:bg-green-600' 
                              : isOverdue 
                                ? 'bg-orange-400 dark:bg-orange-600' 
                                : 'bg-blue-500 dark:bg-blue-600'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => updateGoalProgress(goal.id, currentValue - 1)}
                        className={`mt-0.5 ${
                          currentValue <= 0 ? 'text-gray-400' : 'text-gray-600 hover:text-gray-700 dark:hover:text-gray-500'
                        }`}
                        disabled={currentValue <= 0}
                      >
                        <span className="text-xl font-bold">-</span>
                      </button>
                      <input
                        type="number"
                        value={currentValue}
                        onChange={(e) => updateGoalProgress(goal.id, parseInt(e.target.value) || 0)}
                        className="w-16 p-1 text-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                      <button
                        onClick={() => updateGoalProgress(goal.id, currentValue + 1)}
                        className="p-1 text-gray-600 hover:text-gray-700 dark:hover:text-gray-500"
                      >
                        <span className="text-xl font-bold">+</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    );
  };

  // Function to calculate progress - fixed to cap at 100%
  const calculateProgress = (goal: any) => {
    const current = goal.current || 0;
    const target = goal.target || 1; // Prevent division by zero
    return Math.min(Math.round((current / target) * 100), 100);
  };

  // Function to update goal progress
  const updateGoalProgress = async (id: string, newValue: number) => {
    if (!user) return;
    
    const goalToUpdate = goals.find(goal => goal.id === id);
    if (!goalToUpdate) return;
    
    const sanitizedValue = Math.max(0, newValue);
    let updatedGoalData = { ...goalToUpdate, current: sanitizedValue };
    
    // Check if goal is completed based on progress
    if (sanitizedValue >= (goalToUpdate.target || 0) && !goalToUpdate.completed) {
      updatedGoalData.completed = true;
    }
    
    try {
      // Update goal in Supabase
      const updatedGoal = await updateGoal(updatedGoalData);
      
      if (updatedGoal) {
        // Update local state
        setGoals(prevGoals => 
          prevGoals.map(goal => 
            goal.id === id ? updatedGoal : goal
          )
        );
        
        // Log completion activity if newly completed
        if (updatedGoal.completed && !goalToUpdate.completed) {
          logActivity({
            type: 'goal',
            action: 'completed',
            target: goalToUpdate.title,
            timestamp: Date.now()
          });
        }
      }
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  // Function to handle clicking outside modal to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowResumeModal(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // This function was moved below - see the implementation with content parsing

  /**
   * Parse resume content from string to structured object
   */
  const parseResumeContent = (resume: Resume): Resume => {
    // If the resume already has parsed content fields, return it as is
    if (resume.personalInfo || resume.experience || resume.education) {
      return resume;
    }
    
    // Create a copy to avoid mutating the original
    let parsedResume = { ...resume };
    
    // Try to parse content if it's a string
    if (resume.content && typeof resume.content === 'string') {
      try {
        // Parse the JSON content
        const parsedContent = JSON.parse(resume.content);
        
        // Merge the parsed content with the resume object
        parsedResume = {
          ...resume,
          personalInfo: parsedContent.personalInfo,
          experience: parsedContent.experience,
          education: parsedContent.education,
          skills: parsedContent.skills,
          sectionOrder: parsedContent.sectionOrder,
          metadata: parsedContent.metadata
        };
        
        console.log('Successfully parsed resume content');
      } catch (e) {
        console.error('Error parsing resume content:', e);
      }
    }
    
    return parsedResume;
  };
  
  // Function for viewing a resume
  const handleViewResume = (resume: Resume) => {
    // Parse the content first
    const parsedResume = parseResumeContent(resume);
    setSelectedResume(parsedResume);
    setShowResumeModal(true);
    
    // Log the activity
    logActivity({
      type: 'resume',
      action: 'viewed',
      target: resume.name,
      timestamp: Date.now()
    });
  };

  // Function to edit resume in builder
  const handleEditResume = (resume: Resume) => {
    // Close modal
    setShowResumeModal(false);
    
    // Log the activity
    logActivity({
      type: 'resume',
      action: 'edited',
      target: resume.name,
      timestamp: Date.now()
    });
    
    // Navigate to builder with resume data
    if (resume.content) {
      localStorage.setItem('resumeToEdit', resume.content);
      navigate('/resume-builder');
    }
  };

  // Function to show delete confirmation modal
  const handleShowDeleteConfirm = (resume: Resume) => {
    setResumeToDelete(resume);
    setShowDeleteConfirmModal(true);
  };

  // Function to delete a resume
  const handleDeleteResume = async () => {
    if (!resumeToDelete || !user) return;
    
    try {
      setIsDeleting(true);
      
      // Display the ID we're working with for debugging
      console.log('Attempting to delete resume with ID:', resumeToDelete.id);
      
      // Important: Looking at your Supabase screenshot, I can see the correct DB IDs 
      // which don't match what our app is tracking. Let's add extra debugging to identify them.
      try {
        // Get all resumes for this user to examine IDs
        const { data: allResumes, error: listError } = await supabase
          .from('resumes')
          .select('id, name, content')
          .eq('user_id', user.id);
          
        if (listError) {
          console.error('Error listing all resumes:', listError);
        } else {
          console.log('All user resumes in Supabase:', allResumes);
          
          // Look for a matching resume by name
          const matchingResume = allResumes?.find(r => r.name === resumeToDelete.name);
          
          if (matchingResume) {
            console.log('Found matching resume in database:', matchingResume);
            
            // Delete using the correct Supabase ID
            const { data, error } = await supabase
              .from('resumes')
              .delete()
              .eq('id', matchingResume.id)
              .select();
              
            if (error) {
              console.error('Error deleting resume:', error);
              console.error('Error details:', JSON.stringify(error, null, 2));
              throw error;
            }
            
            console.log('Delete operation result:', data);
          } else {
            console.error('Could not find a matching resume in the database');
            throw new Error('Resume not found in database');
          }
        }
      } catch (innerError) {
        console.error('Error in resume lookup:', innerError);
        
        // Fallback: try to delete with the ID we have
        const { data, error } = await supabase
          .from('resumes')
          .delete()
          .eq('id', resumeToDelete.id)
          .select();
          
        if (error) {
          console.error('Error in fallback delete:', error);
          throw error;
        }
        
        console.log('Fallback delete result:', data);
      }
      
      // Remove from local state
      setResumes(prev => prev.filter(r => r.id !== resumeToDelete.id));
      
      // Update localStorage cache
      const cachedResumes = localStorage.getItem(`${user.id}:resumes`);
      if (cachedResumes) {
        const parsedResumes = JSON.parse(cachedResumes);
        localStorage.setItem(
          `${user.id}:resumes`,
          JSON.stringify(parsedResumes.filter((r: any) => r.id !== resumeToDelete.id))
        );
      }
      
      // Log the activity
      logActivity({
        type: 'resume',
        action: 'deleted',
        target: resumeToDelete.name,
        timestamp: Date.now()
      });
      
      // Close the modal
      setShowDeleteConfirmModal(false);
      setResumeToDelete(null);
      
    } catch (error) {
      console.error('Failed to delete resume:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Render saved resumes in a modern card layout
  const renderSavedResumes = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Saved Resumes</h2>
          <Link 
            to="/resume-builder"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Resume
          </Link>
        </div>
        
        <div className="p-3">
          {resumes.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 dark:text-gray-400">No resumes saved yet</p>
              <Link 
                to="/resume-builder"
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Resume
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {resumes.map((resume: Resume) => (
                <motion.div
                  key={resume.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">{resume.name}</h3>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(resume.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 truncate">
                    {resume.jobTitle || 'No job title specified'}
                  </p>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleViewResume(resume)}
                      className="p-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors"
                      title="View Resume"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditResume(resume)}
                      className="p-1.5 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-md hover:bg-green-100 dark:hover:bg-green-800/40 transition-colors"
                      title="Edit Resume"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShowDeleteConfirm(resume)}
                      className="p-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-md hover:bg-red-100 dark:hover:bg-red-800/40 transition-colors"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Render the user stats section
  const renderStatsSection = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Resumes Created</h3>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {userStats?.resumes_count || resumes.length || 0}
            </span>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">total</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Job Applications</h3>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {userStats?.applications_count || 0}
            </span>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">submitted</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Interviews</h3>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {userStats?.interviews_completed || 0}
            </span>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">completed</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Job Offers</h3>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {userStats?.job_offers || 0}
            </span>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">received</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Debug loading state */}
      {/* {console.log("Dashboard render - isLoading:", isLoading)} */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-3 text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Section */}
            {renderStatsSection()}
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Column 1: Recent Activity, Goals, and Upcoming Interviews (spans 2 columns on larger screens) */}
              <div className="lg:col-span-2">
                {/* Recent Activity */}
                <div className="mb-8">
                  {renderRecentActivities()}
                </div>
                
                {renderGoals()}
                
                {/* Upcoming Interviews */}
                <div className="mt-8">
                  {renderUpcomingInterviews()}
                </div>
              </div>
              
              {/* Column 2: Quick Actions */}
              <div className="space-y-8">
                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-3">
                      <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
                  </div>
                  
                  <div className="space-y-3">
                    <Link
                      to="/job-tracker"
                      className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 border border-gray-100 dark:border-gray-600"
                    >
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mr-3">
                        <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-gray-800 dark:text-gray-200">Track Applications</span>
                    </Link>
                    <Link
                      to="/preparation"
                      className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 border border-gray-100 dark:border-gray-600"
                    >
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3">
                        <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-gray-800 dark:text-gray-200">Practice Interview</span>
                    </Link>
                    <Link 
                      to="/resume-builder"
                      className="flex items-center mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Resume
                    </Link>
                  </div>
                </motion.div>
                
                {/* Saved Resumes */}
                <div className="mt-8">
                  {renderSavedResumes()}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Resume View Modal */}
      <AnimatePresence>
        {showResumeModal && selectedResume && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedResume.name}
                </h2>
                <button 
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setShowResumeModal(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-auto p-4">
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Job Title</p>
                  <p className="text-gray-900 dark:text-white">{selectedResume.jobTitle || 'No job title specified'}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
                  <p className="text-gray-900 dark:text-white">{new Date(selectedResume.lastUpdated).toLocaleString()}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Resume Preview</p>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 dark:border-gray-600 max-h-[450px] overflow-auto shadow-sm">
                    {/* Formatted Resume Preview */}
                    <div className="resume-preview">
                      {/* Header */}
                      <div className="mb-6 pb-4 border-b border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">{selectedResume.personalInfo?.fullName}</h1>
                        <p className="text-lg text-gray-700">{selectedResume.personalInfo?.title}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                          {selectedResume.personalInfo?.email && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                              {selectedResume.personalInfo.email}
                            </span>
                          )}
                          {selectedResume.personalInfo?.phone && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                              {selectedResume.personalInfo.phone}
                            </span>
                          )}
                          {selectedResume.personalInfo?.location && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                              {selectedResume.personalInfo.location}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Summary */}
                      {selectedResume.personalInfo?.summary && (
                        <div className="mb-6">
                          <h2 className="text-lg font-semibold text-gray-900 mb-2">Professional Summary</h2>
                          <p className="text-gray-700">{selectedResume.personalInfo.summary}</p>
                        </div>
                      )}
                      
                      {/* Experience */}
                      {selectedResume.experience && selectedResume.experience.length > 0 && (
                        <div className="mb-6">
                          <h2 className="text-lg font-semibold text-gray-900 mb-3">Experience</h2>
                          {selectedResume.experience.map((exp: any, index: number) => (
                            <div key={index} className="mb-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium text-gray-900">{exp.title}</h3>
                                  <p className="text-gray-700">{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                                </div>
                                <p className="text-sm text-gray-600">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                              </div>
                              {exp.description && (
                                <div className="mt-2 text-sm text-gray-700 whitespace-pre-line">{exp.description}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Education */}
                      {selectedResume.education && selectedResume.education.length > 0 && (
                        <div className="mb-6">
                          <h2 className="text-lg font-semibold text-gray-900 mb-3">Education</h2>
                          {selectedResume.education.map((edu: any, index: number) => (
                            <div key={index} className="mb-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                                  <p className="text-gray-700">{edu.institution}{edu.location ? `, ${edu.location}` : ''}</p>
                                </div>
                                <p className="text-sm text-gray-600">{edu.startDate} - {edu.current ? 'Present' : edu.endDate}</p>
                              </div>
                              {edu.description && (
                                <div className="mt-2 text-sm text-gray-700">{edu.description}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Skills */}
                      {selectedResume.skills && selectedResume.skills.length > 0 && (
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills</h2>
                          <div className="flex flex-wrap gap-2">
                            {selectedResume.skills.map((skill: any, index: number) => (
                              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                {skill.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <button
                  onClick={() => setShowResumeModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleEditResume(selectedResume)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit in Builder
                </button>
                <a 
                  href={`/resume/${selectedResume.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Full View
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirmModal && resumeToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Delete Resume</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete <span className="font-semibold">{resumeToDelete?.name || 'this resume'}</span>? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteResume}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>Delete</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}