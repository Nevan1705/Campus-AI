-- CAMPUSFLOW AI - SUPABASE DATABASE SCHEMA
-- This SQL script creates all required tables, relationships, and triggers for the platform.
-- Run this in your Supabase SQL Editor.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. STUDENTS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    branch VARCHAR(100),
    year INTEGER,
    phone_number VARCHAR(20),
    subjects TEXT[] DEFAULT '{}',
    productivity_score INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 2. TASKS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100),
    description TEXT,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    reminder_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, missed
    add_to_calendar BOOLEAN DEFAULT FALSE,
    calendar_event_id VARCHAR(255),
    whatsapp_reminder_scheduled BOOLEAN DEFAULT FALSE,
    ai_risk_score INTEGER DEFAULT 0, -- AI calculated risk of missing the task (0-100)
    ai_risk_analysis TEXT, -- AI feedback on the task risk
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 3. STUDY NOTES TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.study_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    pages_count INTEGER DEFAULT 0,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    file_url TEXT,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 4. FLASHCARDS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID REFERENCES public.study_notes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'medium', -- easy, medium, hard
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 5. QUIZZES TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of questions with options and answers
    time_limit_minutes INTEGER DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 6. PLACEMENTS TABLE (APPLICATIONS)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.placements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'applied', -- applied, interviewing, offered, rejected
    interview_date TIMESTAMP WITH TIME ZONE,
    progress INTEGER DEFAULT 0, -- application progress percentage (0-100)
    company_logo VARCHAR(255), -- icon or initials identifier
    interview_pattern TEXT, -- interview round details
    difficulty VARCHAR(50), -- easy, medium, hard
    popular_topics TEXT[] DEFAULT '{}',
    roadmap TEXT[] DEFAULT '{}', -- preparation roadmap steps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 7. ASSESSMENTS TABLE (MOCK RESULTS)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- coding, aptitude, technical, hr
    title VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL, -- percentage score (0-100)
    performance_data JSONB DEFAULT '{}'::jsonb, -- detailed score splitups
    strengths TEXT[] DEFAULT '{}',
    weaknesses TEXT[] DEFAULT '{}',
    ai_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 8. REPORTS TABLE (WEEKLY SPOTIFY WRAPPED STYLE)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    tasks_completed INTEGER DEFAULT 0,
    study_time_hours NUMERIC(5,2) DEFAULT 0.00,
    avg_assessment_score INTEGER DEFAULT 0,
    interview_readiness INTEGER DEFAULT 0, -- score percentage
    ai_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 9. ACTIVITY LOGS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL, -- e.g., 'completed_task', 'finished_quiz'
    category VARCHAR(100), -- e.g., 'tasks', 'study', 'placement', 'profile'
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 10. PREPARATION PLANS TABLE (AI MOCK RECOVERY OR STUDY INTERACTIVE PATHS)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.preparation_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- DB INDEXES FOR PERFORMANCE
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_tasks_student ON public.tasks(student_id);
CREATE INDEX IF NOT EXISTS idx_notes_student ON public.study_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_student ON public.flashcards(student_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_student ON public.quizzes(student_id);
CREATE INDEX IF NOT EXISTS idx_placements_student ON public.placements(student_id);
CREATE INDEX IF NOT EXISTS idx_assessments_student ON public.assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_activity_student ON public.activity_logs(student_id);

-- =========================================================================
-- SEED MOCK DATA
-- =========================================================================

-- Seed Single Student (Nevan)
INSERT INTO public.students (id, name, email, branch, year, phone_number, subjects, productivity_score, streak, xp, level)
VALUES (
    'd3b07384-d113-4ec2-a5d6-d04b6b66d8e2',
    'Nevan',
    'nevan@campusflow.ai',
    'Computer Science & Engineering',
    3,
    '+917892713876',
    ARRAY['Computer Networks', 'Operating Systems', 'Database Management Systems', 'Design and Analysis of Algorithms'],
    84,
    5,
    240,
    3
) ON CONFLICT (email) DO NOTHING;

-- Seed Tasks for Nevan
INSERT INTO public.tasks (student_id, title, subject, description, deadline, reminder_time, status, add_to_calendar, whatsapp_reminder_scheduled, ai_risk_score, ai_risk_analysis)
VALUES
(
    'd3b07384-d113-4ec2-a5d6-d04b6b66d8e2',
    'Computer Networks Course Project Submission',
    'Computer Networks',
    'Build a reliable UDP data transmission protocol simulating packet loss and congestion control.',
    CURRENT_TIMESTAMP + INTERVAL '3 days',
    CURRENT_TIMESTAMP + INTERVAL '2 days',
    'pending',
    TRUE,
    TRUE,
    45,
    'The project requires extensive socket programming. You have completed the base setup but have not coded the congestion window controls. High risk if postponed past tomorrow.'
),
(
    'd3b07384-d113-4ec2-a5d6-d04b6b66d8e2',
    'Dynamic Programming Revision Quiz',
    'Design and Analysis of Algorithms',
    'Complete the DP subset sum and knapsack problems quiz review.',
    CURRENT_TIMESTAMP + INTERVAL '12 hours',
    CURRENT_TIMESTAMP + INTERVAL '6 hours',
    'pending',
    FALSE,
    FALSE,
    15,
    'Low risk. The topics are well-rehearsed, but completing it soon maintains your DAA performance profile.'
),
(
    'd3b07384-d113-4ec2-a5d6-d04b6b66d8e2',
    'Operating Systems Scheduling Algorithms Assignment',
    'Operating Systems',
    'Implement FCFS, SJF, SRTF, and Round Robin scheduling animations.',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    CURRENT_TIMESTAMP - INTERVAL '1 day 2 hours',
    'completed',
    TRUE,
    TRUE,
    0,
    'Completed successfully and on time. Excellent workload management.'
)
ON CONFLICT DO NOTHING;

-- Seed Study Notes for Nevan
INSERT INTO public.study_notes (id, student_id, subject, title, pages_count, summary)
VALUES
(
    '44d47c4e-fa02-4b20-b0ff-27e16dfd0f81',
    'd3b07384-d113-4ec2-a5d6-d04b6b66d8e2',
    'Computer Networks',
    'CN Module 4 - Transport Layer Protocols.pdf',
    24,
    'Detailed study notes explaining TCP connection management, 3-way handshake, congestion control algorithms (Tahoe, Reno), and UDP headers.'
),
(
    'c21fa56b-8dfb-4ec5-9dcd-e018d96b9978',
    'd3b07384-d113-4ec2-a5d6-d04b6b66d8e2',
    'Operating Systems',
    'OS Module 2 - Process Management & Scheduling.pdf',
    18,
    'Covers process states, context switching, CPU scheduling metrics, preemptive vs non-preemptive logic, and Gantt charts.'
)
ON CONFLICT DO NOTHING;

-- Seed Flashcards
INSERT INTO public.flashcards (note_id, student_id, question, answer, difficulty)
VALUES
(
    '44d47c4e-fa02-4b20-b0ff-27e16dfd0f81',
    'd3b07384-d113-4ec2-a5d6-d04b6b66d8e2',
    'What is the standard size of a TCP header without options?',
    '20 bytes.',
    'easy'
),
(
    '44d47c4e-fa02-4b20-b0ff-27e16dfd0f81',
    'd3b07384-d113-4ec2-a5d6-d04b6b66d8e2',
    'Explain the difference between TCP Tahoe and TCP Reno during Fast Recovery.',
    'TCP Tahoe drops the congestion window (cwnd) back to 1 MSS on packet loss and starts slow start. TCP Reno performs Fast Recovery, cuts cwnd in half, sets ssthresh to the new cwnd, and increases cwnd linearly (congestion avoidance) rather than returning to slow start.',
    'hard'
),
(
    'c21fa56b-8dfb-4ec5-9dcd-e018d96b9978',
    'd3b07384-d113-4ec2-a5d6-d04b6b66d8e2',
    'What is a context switch?',
    'The process of saving the state (registers, program counter, CPU flags) of a running process or thread so that it can be paused, and loading the saved state of another process to resume execution.',
    'medium'
)
ON CONFLICT DO NOTHING;

-- Seed Quizzes
INSERT INTO public.quizzes (student_id, subject, title, questions, time_limit_minutes)
VALUES (
    'd3b07384-d113-4ec2-a5d6-d04b6b66d8e2',
    'Operating Systems',
    'Schedules & Deadlocks Challenge',
    '[
        {
            "id": 1,
            "question": "Which of the following scheduling algorithms can result in starvation?",
            "options": ["First-Come First-Served (FCFS)", "Round Robin (RR)", "Shortest Job First (SJF)", "Priority Scheduling"],
            "correctAnswer": "Shortest Job First (SJF)"
        },
        {
            "id": 2,
            "question": "What is the necessary condition for a deadlock to occur?",
            "options": ["Mutual Exclusion & Hold and Wait", "No Preemption", "Circular Wait", "All of the above"],
            "correctAnswer": "All of the above"
        },
        {
            "id": 3,
            "question": "Beladys anomaly occurs in which page replacement algorithm?",
            "options": ["LRU (Least Recently Used)", "Optimal Page Replacement", "FIFO (First-In First-Out)", "MRU (Most Recently Used)"],
            "correctAnswer": "FIFO (First-In First-Out)"
        }
    ]'::jsonb,
    10
) ON CONFLICT DO NOTHING;

-- Seed Placements for Nevan
INSERT INTO public.placements (student_id, company_name, role, status, interview_date, progress, company_logo, interview_pattern, difficulty, popular_topics, roadmap)
VALUES
(
    'd3b07384-d113-4ec2-a5d6-d04b6b66d8e2',
    'Amazon',
    'Software Development Engineer Intern',
    'interviewing',
    CURRENT_TIMESTAMP + INTERVAL '4 days',
    60,
    'amazon',
    '1 Online Assessment (Coding + Behavior) + 2 Technical Interviews (DSA, System Design, Leadership Principles)',
    'hard',
    ARRAY['Graphs', 'Dynamic Programming', 'Trees', 'Leadership Principles'],
    ARRAY['Solve Top 50 Amazon LeetCode questions', 'Complete 3 Mock Coding Interviews on CampusFlow AI', 'Review STAR format answers for Leadership Principles']
),
(
    'd3b07384-d113-4ec2-a5d6-d04b6b66d8e2',
    'Google',
    'STEP Intern',
    'applied',
    NULL,
    25,
    'google',
    '2 Technical Interviews (Data Structures, Algorithms)',
    'hard',
    ARRAY['Recursion', 'Hash Maps', 'Sorting and Searching'],
    ARRAY['Study advanced Graph Traversals', 'Practice whiteboarding algorithms']
),
(
    'd3b07384-d113-4ec2-a5d6-d04b6b66d8e2',
    'Stripe',
    'Frontend Engineering Intern',
    'rejected',
    NULL,
    100,
    'stripe',
    '1 Takehome Project + 1 Live Debugging Interview + 1 System Design',
    'medium',
    ARRAY['Javascript internals', 'React Hooks', 'API integration'],
    ARRAY['Refactor styling patterns', 'Learn real-time polling patterns']
)
ON CONFLICT DO NOTHING;

-- Seed Assessments
INSERT INTO public.assessments (student_id, type, title, score, performance_data, strengths, weaknesses, ai_feedback)
VALUES
(
    'd3b07384-d113-4ec2-a5d6-d04b6b66d8e2',
    'coding',
    'DSA Mock Assessment #4 - Graph Traversals',
    82,
    '{"accuracy": 82, "time_spent_min": 45, "questions_solved": 4, "total_questions": 5}'::jsonb,
    ARRAY['Breadth First Search (BFS)', 'Dijkstras Shortest Path'],
    ARRAY['Tarjans Strongly Connected Components', 'Disjoint Set Union (DSU)'],
    'Solid problem-solving speed. Your DFS backtracking contains minor edge-case failures. Review cycle detection algorithms using DSU.'
),
(
    'd3b07384-d113-4ec2-a5d6-d04b6b66d8e2',
    'technical',
    'OS & Network Fundamentals Drill',
    75,
    '{"accuracy": 75, "time_spent_min": 20, "questions_solved": 15, "total_questions": 20}'::jsonb,
    ARRAY['CPU Scheduling', 'IP Addressing'],
    ARRAY['Virtual Memory Page Faults', 'TCP congestion avoidance'],
    'Great response times on theoretical questions. Re-read the mechanisms of TCP Tahoe vs Reno to avoid confusing fast recovery thresholds.'
)
ON CONFLICT DO NOTHING;

-- Seed Reports
INSERT INTO public.reports (student_id, week_start, tasks_completed, study_time_hours, avg_assessment_score, interview_readiness, ai_summary)
VALUES
(
    'd3b07384-d113-4ec2-a5d6-d04b6b66d8e2',
    CURRENT_DATE - INTERVAL '7 days',
    14,
    22.5,
    78,
    65,
    'This week you completed 14 tasks and improved your coding assessment score by 12%. Keep focusing on Graphs and Dynamic Programming ahead of your Amazon interview!'
)
ON CONFLICT DO NOTHING;

-- Seed Activity Logs
INSERT INTO public.activity_logs (student_id, action, category, points_earned)
VALUES
('d3b07384-d113-4ec2-a5d6-d04b6b66d8e2', 'Completed first assignment', 'tasks', 50),
('d3b07384-d113-4ec2-a5d6-d04b6b66d8e2', 'Created UDP project task', 'tasks', 10),
('d3b07384-d113-4ec2-a5d6-d04b6b66d8e2', 'Completed OS Scheduling Assignment', 'tasks', 30),
('d3b07384-d113-4ec2-a5d6-d04b6b66d8e2', 'Generated Transport Layer Flashcards', 'study', 20),
('d3b07384-d113-4ec2-a5d6-d04b6b66d8e2', 'Maintained 5-day streak', 'profile', 50)
ON CONFLICT DO NOTHING;
