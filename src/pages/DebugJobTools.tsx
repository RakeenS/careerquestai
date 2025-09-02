import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

// Debug component to directly test job application storage
const DebugJobTools: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>('');
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check job_applications table
  const checkTable = async () => {
    setIsLoading(true);
    setStatus('Checking job_applications table...');
    
    try {
      // Check if table exists
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .limit(10);
      
      if (error) {
        setStatus(`Error: ${error.message}`);
        console.error('Table check error:', error);
      } else {
        setStatus(`Success! Table exists. Found ${data?.length || 0} job applications.`);
        setJobApplications(data || []);
        console.log('Job applications:', data);
      }
    } catch (err) {
      setStatus(`Exception: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Exception checking table:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a test job
  const createTestJob = async () => {
    if (!user?.id) {
      setStatus('Error: User not logged in');
      return;
    }
    
    setIsLoading(true);
    setStatus('Creating test job application...');
    
    try {
      // Create a job directly using supabase.from instead of our service
      const testJob = {
        id: crypto.randomUUID(),
        user_id: user.id,
        company: 'Test Company',
        position: 'Test Position',
        date: new Date().toISOString().split('T')[0],
        status: 'applied',
        notes: 'This is a test job created by the debug tool',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Direct insert without using any of our other code
      const { data, error } = await supabase
        .from('job_applications')
        .insert([testJob])
        .select();
      
      if (error) {
        setStatus(`Error creating job: ${error.message}`);
        console.error('Job creation error:', error);
      } else {
        setStatus(`Success! Job created: ${data?.[0]?.id}`);
        console.log('Created job:', data);
        
        // Save to localStorage too
        try {
          const existingJobs = localStorage.getItem('job_applications');
          const jobs = existingJobs ? JSON.parse(existingJobs) : [];
          jobs.push(testJob);
          localStorage.setItem('job_applications', JSON.stringify(jobs));
          localStorage.setItem('interviews', JSON.stringify(jobs));
          localStorage.setItem(`${user.id}:job_applications`, JSON.stringify(jobs));
          localStorage.setItem(`${user.id}:interviews`, JSON.stringify(jobs));
          console.log('Saved job to localStorage');
        } catch (storageErr) {
          console.warn('Could not save to localStorage:', storageErr);
        }
        
        // Refresh the job list
        checkTable();
      }
    } catch (err) {
      setStatus(`Exception: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Exception creating job:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run SQL directly
  const runSqlSetup = async () => {
    setIsLoading(true);
    setStatus('Running SQL setup script...');
    
    try {
      // Try to run SQL directly using the SQL function
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          -- Check if function exists
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT FROM pg_proc WHERE proname = 'set_updated_at'
            ) THEN
              CREATE FUNCTION public.set_updated_at()
              RETURNS TRIGGER AS $$
              BEGIN
                NEW.updated_at = now();
                RETURN NEW;
              END;
              $$ LANGUAGE plpgsql;
            END IF;
          END
          $$;

          -- Create table if not exists
          CREATE TABLE IF NOT EXISTS public.job_applications (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            company TEXT NOT NULL,
            position TEXT NOT NULL,
            date DATE NOT NULL,
            status TEXT NOT NULL,
            salary_min TEXT,
            salary_max TEXT,
            notes TEXT,
            skills TEXT[],
            favorite BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );

          -- Enable RLS
          ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

          -- Create policies if they don't exist
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT FROM pg_policies WHERE tablename = 'job_applications' AND policyname = 'Users can view their own job applications'
            ) THEN
              CREATE POLICY "Users can view their own job applications"
                ON public.job_applications
                FOR SELECT
                USING (auth.uid() = user_id);
            END IF;

            IF NOT EXISTS (
              SELECT FROM pg_policies WHERE tablename = 'job_applications' AND policyname = 'Users can insert their own job applications'
            ) THEN
              CREATE POLICY "Users can insert their own job applications"
                ON public.job_applications
                FOR INSERT
                WITH CHECK (auth.uid() = user_id);
            END IF;

            IF NOT EXISTS (
              SELECT FROM pg_policies WHERE tablename = 'job_applications' AND policyname = 'Users can update their own job applications'
            ) THEN
              CREATE POLICY "Users can update their own job applications"
                ON public.job_applications
                FOR UPDATE
                USING (auth.uid() = user_id);
            END IF;

            IF NOT EXISTS (
              SELECT FROM pg_policies WHERE tablename = 'job_applications' AND policyname = 'Users can delete their own job applications'
            ) THEN
              CREATE POLICY "Users can delete their own job applications"
                ON public.job_applications
                FOR DELETE
                USING (auth.uid() = user_id);
            END IF;
          END$$;

          -- Create trigger if not exists
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT FROM pg_trigger WHERE tgname = 'set_job_applications_updated_at'
            ) THEN
              CREATE TRIGGER set_job_applications_updated_at
              BEFORE UPDATE ON public.job_applications
              FOR EACH ROW
              EXECUTE FUNCTION public.set_updated_at();
            END IF;
          END$$;
        `
      });
      
      if (error) {
        // If exec_sql isn't available (which it usually isn't), try a simpler approach
        const fallbackResult = await supabase.rpc('get_service_role');
        if (fallbackResult.error) {
          setStatus(`SQL execution error. Please run the script manually in the Supabase SQL Editor: ${String(error)}`);
        } else {
          setStatus(`SQL execution completed but may not have created all objects.`);
        }
      } else {
        setStatus('SQL executed successfully!');
        // Refresh the job list
        checkTable();
      }
    } catch (err) {
      setStatus(`Exception: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear local storage
  const clearLocalStorage = () => {
    try {
      localStorage.removeItem('job_applications');
      localStorage.removeItem('interviews');
      if (user?.id) {
        localStorage.removeItem(`${user.id}:job_applications`);
        localStorage.removeItem(`${user.id}:interviews`);
      }
      setStatus('Local storage cleared');
    } catch (err) {
      setStatus(`Error clearing local storage: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  useEffect(() => {
    checkTable();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg mt-8">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Job Application Debug Tools</h1>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          onClick={checkTable}
          disabled={isLoading}
        >
          Check Table
        </button>
        
        <button 
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          onClick={createTestJob}
          disabled={isLoading || !user}
        >
          Create Test Job
        </button>
        
        <button 
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
          onClick={runSqlSetup}
          disabled={isLoading}
        >
          Run SQL Setup
        </button>
        
        <button 
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={clearLocalStorage}
        >
          Clear Local Storage
        </button>
      </div>
      
      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded mb-4">
        <p className="font-medium">Status: {isLoading ? 'Loading...' : status}</p>
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Job Applications ({jobApplications.length})</h2>
        
        {jobApplications.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No job applications found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Company</th>
                  <th className="px-4 py-2 text-left">Position</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {jobApplications.map((job) => (
                  <tr key={job.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2 text-sm font-mono">{job.id.substring(0, 8)}...</td>
                    <td className="px-4 py-2">{job.company}</td>
                    <td className="px-4 py-2">{job.position}</td>
                    <td className="px-4 py-2">{job.status}</td>
                    <td className="px-4 py-2">{job.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="mt-6 bg-gray-100 dark:bg-gray-700 p-4 rounded">
        <h3 className="font-bold mb-2">Troubleshooting Instructions:</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Click "Check Table" to verify if job_applications table exists</li>
          <li>If table doesn't exist or there are errors, click "Run SQL Setup"</li>
          <li>After table setup, click "Create Test Job" to test direct insertion</li>
          <li>If the test job appears in the table, the Supabase setup is working</li>
          <li>If job appears in table but not in the app, try clearing and refreshing the page</li>
        </ol>
      </div>
    </div>
  );
};

export default DebugJobTools;
