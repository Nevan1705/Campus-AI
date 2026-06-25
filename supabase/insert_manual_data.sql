-- CampusFlow AI - Manual Data Insertion SQL Script
-- Execute this query inside your Supabase SQL Editor to seed the database
-- with manual items that will instantly sync with the application.

-- 1. Insert Student Profile (Nevan)
-- Change variables here to customize your own profile details.
INSERT INTO public.students (id, name, email, branch, year, phone_number, subjects, productivity_score, streak, xp, level)
VALUES (
    'd3b07384-d113-4ec2-a5d6-d04b6b66d8e2',
    'Nevan',
    'nevan@campusflow.ai',
    'Computer Science & Engineering',
    3,
    '+917892713876',
    ARRAY['Computer Networks', 'Operating Systems', 'Database Management Systems', 'Design and Analysis of Algorithms'],
    85,
    5,
    240,
    3
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    branch = EXCLUDED.branch,
    year = EXCLUDED.year,
    phone_number = EXCLUDED.phone_number,
    productivity_score = EXCLUDED.productivity_score,
    streak = EXCLUDED.streak,
    xp = EXCLUDED.xp,
    level = EXCLUDED.level;

-- 2. Insert Custom Manual Tasks
INSERT INTO public.tasks (student_id, title, subject, description, deadline, status, add_to_calendar, ai_risk_score, ai_risk_analysis)
VALUES
(
    'd3b07384-d113-4ec2-a5d6-d04b6b66d8e2',
    'Database Transaction Locking Lab Exercise',
    'Database Management Systems',
    'Write SQL scripts to demonstrate shared vs exclusive locks, deadlock scenarios, and ACID transaction isolation.',
    CURRENT_TIMESTAMP + INTERVAL '5 days',
    'pending',
    TRUE,
    25,
    'Low risk. You have already completed transaction theories, just code lock schedules early.'
),
(
    'd3b07384-d113-4ec2-a5d6-d04b6b66d8e2',
    'Revision on Greedy Algorithms',
    'Design and Analysis of Algorithms',
    'Revise Kruskals and Prims minimum spanning tree complexity optimizations.',
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    'pending',
    FALSE,
    35,
    'Moderate risk. Ensure review of edge-case cycles is completed before online mock assessment.'
)
ON CONFLICT DO NOTHING;

-- 3. Insert Study Notes
INSERT INTO public.study_notes (id, student_id, subject, title, pages_count, summary)
VALUES
(
    'a53f06b6-8dfb-4ec5-9dcd-e018d96b9978',
    'd3b07384-d113-4ec2-a5d6-d04b6b66d8e2',
    'Database Management Systems',
    'DBMS Module 5 - Transaction & Concurrency Controls.pdf',
    15,
    'Comprehensive overview of database transaction states, lock levels, 2-Phase Locking (2PL) protocol, and serializability tests.'
)
ON CONFLICT DO NOTHING;

-- 4. Insert Flashcards linked to study note
INSERT INTO public.flashcards (note_id, student_id, question, answer, difficulty)
VALUES
(
    'a53f06b6-8dfb-4ec5-9dcd-e018d96b9978',
    'd3b07384-d113-4ec2-a5d6-d04b6b66d8e2',
    'Explain the strict 2-Phase Locking (Strict 2PL) protocol rules.',
    'A transaction must obtain locks during its growing phase and cannot release locks until the transaction completes (Commit or Abort). This avoids cascading aborts.',
    'hard'
),
(
    'a53f06b6-8dfb-4ec5-9dcd-e018d96b9978',
    'd3b07384-d113-4ec2-a5d6-d04b6b66d8e2',
    'What does ACID stand for?',
    'Atomicity, Consistency, Isolation, and Durability.',
    'easy'
)
ON CONFLICT DO NOTHING;

-- 5. Insert Placement Applications
INSERT INTO public.placements (student_id, company_name, role, status, interview_date, progress, company_logo, interview_pattern, difficulty, popular_topics, roadmap)
VALUES
(
    'd3b07384-d113-4ec2-a5d6-d04b6b66d8e2',
    'Netflix',
    'Core Systems Software Engineer Intern',
    'interviewing',
    CURRENT_TIMESTAMP + INTERVAL '7 days',
    40,
    'netflix',
    '1 online coding screen + 1 core system drill (concurrency, caching) + 1 behavioral review.',
    'hard',
    ARRAY['Distributed Systems', 'Caching (Redis)', 'Concurrency and Thread Locks'],
    ARRAY['Complete LeetCode Top Caching questions', 'Practice mock interview simulators', 'Review locking schemes']
)
ON CONFLICT DO NOTHING;

-- 6. Insert Mock Assessment
INSERT INTO public.assessments (student_id, type, title, score, performance_data, strengths, weaknesses, ai_feedback)
VALUES
(
    'd3b07384-d113-4ec2-a5d6-d04b6b66d8e2',
    'technical',
    'DBMS Locking Protocols Practice Drill',
    90,
    '{"accuracy": 90, "time_spent_min": 15, "questions_solved": 9, "total_questions": 10}'::jsonb,
    ARRAY[' ACID criteria', '2PL protocol logic'],
    ARRAY['Cascade-less scheduling edge cases'],
    'Excellent understanding of database lock transitions. Review strict serializability definitions to score perfectly.'
)
ON CONFLICT DO NOTHING;

-- 7. Log XP points for Nevan
INSERT INTO public.activity_logs (student_id, action, category, points_earned)
VALUES
('d3b07384-d113-4ec2-a5d6-d04b6b66d8e2', 'Completed DBMS Lab Assignment', 'tasks', 30),
('d3b07384-d113-4ec2-a5d6-d04b6b66d8e2', 'Finished transaction challenge', 'study', 40)
ON CONFLICT DO NOTHING;
