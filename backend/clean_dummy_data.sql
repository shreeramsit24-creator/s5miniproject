-- ==============================================================================
-- CLEAN DUMMY DATA SCRIPT FOR SMART ATTENDANCE (SUPABASE POSTGRESQL)
-- ==============================================================================
-- This script removes demo/seeded students, demo faculty, and legacy demo courses
-- while preserving:
-- 1. All real users (e.g. abisiva1822007@gmail.com, sivagokulc18@gmail.com, etc.)
-- 2. All 76 real timetable slots uploaded via multi-sheet Excel sync
-- 3. All real courses (e.g. 22HS004, 22IT301, 22AD301, 22CS301, etc.)
-- 4. The primary institutional admin user
-- ==============================================================================

BEGIN;

-- 1. Remove attendance records and sessions linked to demo accounts
DELETE FROM attendance_records
WHERE student_id IN (
    SELECT s.id FROM students s
    JOIN users u ON s.user_id = u.id
    WHERE u.email LIKE '%@campus.edu' AND u.role != 'admin'
);

DELETE FROM attendance_records
WHERE session_id IN (
    SELECT sess.id FROM attendance_sessions sess
    JOIN faculty f ON sess.faculty_id = f.id
    JOIN users u ON f.user_id = u.id
    WHERE u.email LIKE '%@campus.edu' AND u.role != 'admin'
);

DELETE FROM attendance_sessions
WHERE faculty_id IN (
    SELECT f.id FROM faculty f
    JOIN users u ON f.user_id = u.id
    WHERE u.email LIKE '%@campus.edu' AND u.role != 'admin'
);

-- 2. Remove leave requests created by or assigned to demo accounts
DELETE FROM leave_requests
WHERE student_id IN (
    SELECT s.id FROM students s
    JOIN users u ON s.user_id = u.id
    WHERE u.email LIKE '%@campus.edu' AND u.role != 'admin'
);

DELETE FROM faculty_leave_requests
WHERE faculty_id IN (
    SELECT f.id FROM faculty f
    JOIN users u ON f.user_id = u.id
    WHERE u.email LIKE '%@campus.edu' AND u.role != 'admin'
);

-- 3. Remove section-subject-faculty mappings for demo faculty
DELETE FROM section_subject_faculty
WHERE faculty_id IN (
    SELECT f.id FROM faculty f
    JOIN users u ON f.user_id = u.id
    WHERE u.email LIKE '%@campus.edu' AND u.role != 'admin'
);

-- 4. Remove demo student rows
DELETE FROM students
WHERE user_id IN (
    SELECT id FROM users
    WHERE email LIKE '%@campus.edu' AND role != 'admin'
);

-- 5. Remove demo faculty rows
DELETE FROM faculty
WHERE user_id IN (
    SELECT id FROM users
    WHERE email LIKE '%@campus.edu' AND role != 'admin'
);

-- 6. Remove demo users from the users table (preserving admin)
DELETE FROM users
WHERE email LIKE '%@campus.edu' AND role != 'admin';

-- 7. Remove legacy demo courses (keeping all real courses from Excel like 22IT301, 22AD301, 22CS301, 22HS004)
DELETE FROM courses
WHERE id IN ('crs-cs301-7e6d', 'crs-cs302-91b6')
  AND code IN ('CS301', 'CS302');

COMMIT;
