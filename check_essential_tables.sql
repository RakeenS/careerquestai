-- Check for essential resume builder tables
SELECT 
    'Essential Tables Check' AS check_type,
    t.table_name,
    'EXISTS' AS status
FROM 
    information_schema.tables t
WHERE 
    t.table_schema = 'public' AND
    t.table_name IN ('resumes', 'job_applications', 'interviews', 'user_goals', 'user_activities', 'user_stats', 'api_usage')
UNION ALL
SELECT 
    'Essential Tables Check' AS check_type,
    missing_table AS table_name,
    'MISSING' AS status
FROM 
    (VALUES 
     ('resumes'), 
     ('job_applications'), 
     ('interviews'), 
     ('user_goals'), 
     ('user_activities'), 
     ('user_stats'), 
     ('api_usage')
    ) AS m(missing_table)
WHERE 
    NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = m.missing_table
    );

-- Check for RLS policies
SELECT
    'RLS Policies Check' AS check_type,
    tablename,
    policyname,
    'EXISTS' AS status
FROM
    pg_policies
WHERE
    schemaname = 'public' AND
    tablename IN ('resumes', 'job_applications', 'interviews', 'user_goals', 'user_activities', 'user_stats', 'api_usage');

-- Check for table indexes
SELECT
    'Index Check' AS check_type,
    tablename,
    indexname,
    'EXISTS' AS status
FROM
    pg_indexes
WHERE
    schemaname = 'public' AND
    tablename IN ('resumes', 'job_applications', 'interviews', 'user_goals', 'user_activities', 'user_stats', 'api_usage');

-- Count rows in each table
SELECT
    'Row Count' AS check_type,
    'resumes' AS table_name,
    COUNT(*) AS row_count
FROM
    resumes
UNION ALL
SELECT
    'Row Count' AS check_type,
    'job_applications' AS table_name,
    COUNT(*) AS row_count
FROM
    job_applications
UNION ALL
SELECT
    'Row Count' AS check_type,
    'interviews' AS table_name,
    COUNT(*) AS row_count
FROM
    interviews
UNION ALL
SELECT
    'Row Count' AS check_type,
    'user_goals' AS table_name,
    COUNT(*) AS row_count
FROM
    user_goals
UNION ALL
SELECT
    'Row Count' AS check_type,
    'user_activities' AS table_name,
    COUNT(*) AS row_count
FROM
    user_activities
UNION ALL
SELECT
    'Row Count' AS check_type,
    'user_stats' AS table_name,
    COUNT(*) AS row_count
FROM
    user_stats
UNION ALL
SELECT
    'Row Count' AS check_type,
    'api_usage' AS table_name,
    COUNT(*) AS row_count
FROM
    api_usage;
