-- Comprehensive Supabase Database Verification Script
-- Run this in the Supabase SQL Editor to verify your database setup

-- Part 1: Check if all required tables exist
SELECT 
    'Table Check' AS check_type,
    table_name,
    CASE 
        WHEN table_name IN ('resumes', 'job_applications', 'user_stats', 'activities', 'user_goals', 'interviews') THEN 'OK' 
        ELSE 'Missing'
    END AS status
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public' AND
    table_name IN ('resumes', 'job_applications', 'user_stats', 'activities', 'user_goals', 'interviews')
UNION ALL
SELECT 
    'Table Check' AS check_type,
    missing_table AS table_name,
    'MISSING - NEEDS CREATION' AS status
FROM 
    (VALUES ('resumes'), ('job_applications'), ('user_stats'), ('activities'), ('user_goals'), ('interviews')) AS t(missing_table)
WHERE 
    missing_table NOT IN (
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    )
ORDER BY 
    table_name;

-- Part 2: Verify table structures
-- This shows the columns for each table so you can verify they match what your app expects

-- Check resumes table structure
SELECT 'resumes table columns' AS check_type, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'resumes'
ORDER BY ordinal_position;

-- Check job_applications table structure
SELECT 'job_applications table columns' AS check_type, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'job_applications'
ORDER BY ordinal_position;

-- Check user_stats table structure
SELECT 'user_stats table columns' AS check_type, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_stats'
ORDER BY ordinal_position;

-- Check activities table structure
SELECT 'activities table columns' AS check_type, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'activities'
ORDER BY ordinal_position;

-- Check user_goals table structure (if exists)
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'user_goals'
        ) 
        THEN 'user_goals table columns'
        ELSE 'user_goals table does not exist'
    END AS check_type,
    COALESCE(column_name, 'N/A') AS column_name,
    COALESCE(data_type, 'N/A') AS data_type,
    COALESCE(is_nullable, 'N/A') AS is_nullable
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' AND table_name = 'user_goals'
ORDER BY ordinal_position;

-- Check interviews table structure (if exists)
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'interviews'
        ) 
        THEN 'interviews table columns'
        ELSE 'interviews table does not exist'
    END AS check_type,
    COALESCE(column_name, 'N/A') AS column_name,
    COALESCE(data_type, 'N/A') AS data_type,
    COALESCE(is_nullable, 'N/A') AS is_nullable
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' AND table_name = 'interviews'
ORDER BY ordinal_position;

-- Part 3: Check Row Level Security (RLS) Policies
SELECT 
    'RLS Check' AS check_type,
    tablename AS table_name,
    policyname AS policy_name,
    permissive,
    roles,
    cmd AS command,
    CASE WHEN permissive = 'PERMISSIVE' THEN 'OK' ELSE 'RESTRICTIVE' END AS status
FROM 
    pg_policies
WHERE 
    schemaname = 'public' AND
    tablename IN ('resumes', 'job_applications', 'user_stats', 'activities', 'user_goals', 'interviews')
ORDER BY 
    tablename, cmd;

-- Part 4: Check for tables without RLS enabled (security risk)
SELECT 
    'RLS Enabled Check' AS check_type,
    t.tablename AS table_name,
    CASE WHEN rls.rls_enabled THEN 'RLS ENABLED' ELSE 'RLS DISABLED - SECURITY RISK' END AS status
FROM 
    pg_tables t
LEFT JOIN (
    SELECT t.tablename, true AS rls_enabled
    FROM pg_tables t
    WHERE t.schemaname = 'public'
    AND t.tablename IN (
        SELECT tablename FROM pg_policies WHERE schemaname = 'public'
    )
) rls ON rls.tablename = t.tablename
WHERE 
    t.schemaname = 'public' AND
    t.tablename IN ('resumes', 'job_applications', 'user_stats', 'activities', 'user_goals', 'interviews')
ORDER BY 
    t.tablename;

-- Part 5: Check Primary Keys (every table should have one)
SELECT 
    'Primary Key Check' AS check_type,
    t.table_name,
    kc.column_name AS primary_key_column,
    CASE WHEN kc.column_name IS NOT NULL THEN 'OK' ELSE 'MISSING PRIMARY KEY' END AS status
FROM 
    information_schema.tables t
LEFT JOIN 
    information_schema.table_constraints tc ON tc.table_schema = t.table_schema 
    AND tc.table_name = t.table_name 
    AND tc.constraint_type = 'PRIMARY KEY'
LEFT JOIN 
    information_schema.key_column_usage kc ON kc.table_schema = tc.table_schema 
    AND kc.table_name = tc.table_name 
    AND kc.constraint_name = tc.constraint_name
WHERE 
    t.table_schema = 'public' AND
    t.table_name IN ('resumes', 'job_applications', 'user_stats', 'activities', 'user_goals', 'interviews')
ORDER BY 
    t.table_name;

-- Part 6: Check Foreign Keys to auth.users (important for RLS policies)
SELECT 
    'Foreign Key to auth.users Check' AS check_type,
    t.table_name,
    COALESCE(kcu.column_name, 'no_user_id_column') AS fk_column,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.key_column_usage kcu2
            JOIN information_schema.constraint_column_usage ccu2 ON kcu2.constraint_name = ccu2.constraint_name
            JOIN information_schema.table_constraints tc2 ON tc2.constraint_name = kcu2.constraint_name
            WHERE tc2.constraint_type = 'FOREIGN KEY'
            AND kcu2.table_schema = 'public' AND kcu2.table_name = t.table_name
            AND kcu2.column_name = 'user_id'
            AND ccu2.table_schema = 'auth' AND ccu2.table_name = 'users' AND ccu2.column_name = 'id'
        ) THEN 'OK' 
        ELSE 'MISSING or INCORRECT FK to auth.users' 
    END AS status
FROM 
    information_schema.tables t
LEFT JOIN 
    information_schema.columns kcu ON kcu.table_schema = t.table_schema 
    AND kcu.table_name = t.table_name 
    AND kcu.column_name = 'user_id'
WHERE 
    t.table_schema = 'public' AND
    t.table_name IN ('resumes', 'job_applications', 'user_stats', 'activities', 'user_goals', 'interviews')
ORDER BY 
    t.table_name;

-- Part 7: Check indexes for common query patterns (user_id lookup will be common)
SELECT 
    'Index Check for user_id' AS check_type,
    t.tablename AS table_name,
    CASE 
        WHEN (
            EXISTS (
                SELECT 1 FROM pg_indexes 
                WHERE schemaname = 'public' 
                AND tablename = t.tablename 
                AND indexdef LIKE '%user_id%'
            )
        ) THEN 'OK' 
        ELSE 'CONSIDER ADDING INDEX ON user_id' 
    END AS status
FROM 
    pg_tables t
JOIN 
    information_schema.columns c ON c.table_schema = 'public' 
    AND c.table_name = t.tablename 
    AND c.column_name = 'user_id'
WHERE 
    t.schemaname = 'public' AND
    t.tablename IN ('resumes', 'job_applications', 'user_stats', 'activities', 'user_goals', 'interviews')
ORDER BY 
    t.tablename;

-- Part 8: Overall Database Health Check
SELECT 
    'Database Health Check' AS check_type,
    'Total Tables' AS metric,
    COUNT(*)::text AS value
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public'
UNION ALL
SELECT 
    'Database Health Check' AS check_type,
    'Tables with RLS' AS metric,
    COUNT(DISTINCT tablename)::text AS value
FROM 
    pg_policies
WHERE 
    schemaname = 'public'
UNION ALL
SELECT 
    'Database Health Check' AS check_type,
    'Total RLS Policies' AS metric,
    COUNT(*)::text AS value
FROM 
    pg_policies
WHERE 
    schemaname = 'public'
UNION ALL
SELECT 
    'Database Health Check' AS check_type,
    'Average Policies Per Table' AS metric,
    ROUND((COUNT(*)::numeric / NULLIF(COUNT(DISTINCT tablename), 0)::numeric), 2)::text AS value
FROM 
    pg_policies
WHERE 
    schemaname = 'public';
