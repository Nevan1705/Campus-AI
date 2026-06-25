import React, { createContext, useContext, useState, useEffect } from 'react';

// Interfaces
export interface Student {
  id: string;
  name: string;
  email: string;
  branch: string;
  year: number;
  phone_number: string;
  subjects: string[];
  productivity_score: number;
  streak: number;
  xp: number;
  level: number;
}

export interface Task {
  id: string;
  student_id: string;
  title: string;
  subject: string;
  description: string;
  deadline: string;
  reminder_time?: string;
  status: 'pending' | 'completed' | 'missed';
  add_to_calendar: boolean;
  calendar_event_id?: string | null;
  whatsapp_reminder_scheduled: boolean;
  ai_risk_score: number;
  ai_risk_analysis: string;
}

export interface StudyNote {
  id: string;
  subject: string;
  title: string;
  pages_count: number;
  upload_date: string;
  summary: string;
  content?: string;
}

export interface Flashcard {
  id: string;
  note_id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  id: string;
  subject: string;
  title: string;
  time_limit_minutes: number;
  questions: QuizQuestion[];
}

export interface Placement {
  id: string;
  company_name: string;
  role: string;
  status: 'applied' | 'interviewing' | 'offered' | 'rejected';
  interview_date?: string | null;
  progress: number;
  company_logo: string;
  interview_pattern: string;
  difficulty: 'easy' | 'medium' | 'hard';
  popular_topics: string[];
  roadmap: string[];
}

export interface Assessment {
  id: string;
  type: 'coding' | 'aptitude' | 'technical' | 'hr';
  title: string;
  score: number;
  performance_data: {
    accuracy: number;
    time_spent_min: number;
    questions_solved?: number;
    total_questions?: number;
  };
  strengths: string[];
  weaknesses: string[];
  ai_feedback: string;
}

export interface ActivityLog {
  action: string;
  category: string;
  points_earned: number;
  created_at: string;
}

interface StudentContextType {
  student: Student;
  tasks: Task[];
  notes: StudyNote[];
  flashcards: Flashcard[];
  quizzes: Quiz[];
  placements: Placement[];
  assessments: Assessment[];
  activityLogs: ActivityLog[];
  loading: boolean;
  updateXP: (points: number) => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'student_id' | 'status' | 'whatsapp_reminder_scheduled' | 'ai_risk_score' | 'ai_risk_analysis'>) => Promise<void>;
  toggleTaskStatus: (taskId: string, currentStatus: string) => Promise<void>;
  uploadNoteAndGenerateAssets: (note: { subject: string; title: string; content: string; pages_count: number }) => Promise<void>;
  createPlacement: (placement: { company_name: string; role: string; status: 'applied' | 'interviewing' | 'offered' | 'rejected'; interview_date?: string }) => Promise<void>;
  submitQuizScore: (type: 'coding' | 'aptitude' | 'technical' | 'hr', title: string, score: number) => Promise<void>;
  chatWithNotes: (noteId: string, message: string, history: Array<{ sender: 'user' | 'ai'; text: string }>) => Promise<string>;
  chatWithInterviewer: (companyName: string, role: string, message: string, history: Array<{ sender: 'user' | 'ai'; text: string }>) => Promise<string>;
  registerStudent: (student: Omit<Student, 'id' | 'productivity_score' | 'streak' | 'xp' | 'level'>) => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

const API_BASE = '/api';

export const StudentProvider = ({ children }: { children: React.ReactNode }) => {
  const [student, setStudent] = useState<Student>({
    id: "d3b07384-d113-4ec2-a5d6-d04b6b66d8e2",
    name: "Nevan",
    email: "nevan@campusflow.ai",
    branch: "Computer Science & Engineering",
    year: 3,
    phone_number: "+917892713876",
    subjects: ["Computer Networks", "Operating Systems", "Database Management Systems", "Design and Analysis of Algorithms"],
    productivity_score: 84,
    streak: 5,
    xp: 240,
    level: 3
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        // Attempt backend fetch
        const studentRes = await fetch(`${API_BASE}/student`);
        if (studentRes.ok) {
          const studentData = await studentRes.json();
          setStudent(studentData);

          const tasksRes = await fetch(`${API_BASE}/tasks`);
          if (tasksRes.ok) setTasks(await tasksRes.json());

          const notesRes = await fetch(`${API_BASE}/notes`);
          if (notesRes.ok) setNotes(await notesRes.json());

          const flashcardsRes = await fetch(`${API_BASE}/flashcards`);
          if (flashcardsRes.ok) setFlashcards(await flashcardsRes.json());

          const quizzesRes = await fetch(`${API_BASE}/quizzes`);
          if (quizzesRes.ok) setQuizzes(await quizzesRes.json());

          const placementsRes = await fetch(`${API_BASE}/placements`);
          if (placementsRes.ok) setPlacements(await placementsRes.json());

          const assessmentsRes = await fetch(`${API_BASE}/assessments`);
          if (assessmentsRes.ok) setAssessments(await assessmentsRes.json());

          const logsRes = await fetch(`${API_BASE}/activity-logs`);
          if (logsRes.ok) setActivityLogs(await logsRes.json());
        } else {
          throw new Error("Backend not reachable");
        }
      } catch (err) {
        console.warn("FastAPI backend is offline. Loading persistent fallback mock data.", err);
        loadLocalFallbacks();
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  const loadLocalFallbacks = () => {
    // Check localStorage or seed default mock values
    const storedStudent = localStorage.getItem("cf_student");
    const storedTasks = localStorage.getItem("cf_tasks");
    const storedNotes = localStorage.getItem("cf_notes");
    const storedFlashcards = localStorage.getItem("cf_flashcards");
    const storedQuizzes = localStorage.getItem("cf_quizzes");
    const storedPlacements = localStorage.getItem("cf_placements");
    const storedAssessments = localStorage.getItem("cf_assessments");
    const storedLogs = localStorage.getItem("cf_logs");

    if (storedStudent) setStudent(JSON.parse(storedStudent));
    else localStorage.setItem("cf_student", JSON.stringify(student));

    if (storedTasks) setTasks(JSON.parse(storedTasks));
    else {
      const initialTasks: Task[] = [
        {
          id: "1",
          student_id: student.id,
          title: "Computer Networks Course Project Submission",
          subject: "Computer Networks",
          description: "Build a reliable UDP data transmission protocol simulating packet loss and congestion control.",
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: "pending",
          add_to_calendar: true,
          whatsapp_reminder_scheduled: true,
          ai_risk_score: 45,
          ai_risk_analysis: "The project requires extensive socket programming. You have completed the base setup but have not coded congestion control. High risk if postponed past tomorrow."
        },
        {
          id: "2",
          student_id: student.id,
          title: "Dynamic Programming Revision Quiz",
          subject: "Design and Analysis of Algorithms",
          description: "Complete the DP subset sum and knapsack problems quiz review.",
          deadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          status: "pending",
          add_to_calendar: false,
          whatsapp_reminder_scheduled: false,
          ai_risk_score: 15,
          ai_risk_analysis: "Low risk. The topics are well-rehearsed, but completing it soon maintains your DAA performance profile."
        },
        {
          id: "3",
          student_id: student.id,
          title: "Operating Systems Scheduling Algorithms Assignment",
          subject: "Operating Systems",
          description: "Implement FCFS, SJF, SRTF, and Round Robin scheduling animations.",
          deadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: "completed",
          add_to_calendar: true,
          whatsapp_reminder_scheduled: true,
          ai_risk_score: 0,
          ai_risk_analysis: "Completed successfully and on time. Excellent workload management."
        }
      ];
      setTasks(initialTasks);
      localStorage.setItem("cf_tasks", JSON.stringify(initialTasks));
    }

    if (storedNotes) setNotes(JSON.parse(storedNotes));
    else {
      const initialNotes: StudyNote[] = [
        {
          id: "note_1",
          subject: "Computer Networks",
          title: "CN Module 4 - Transport Layer Protocols.pdf",
          pages_count: 24,
          upload_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          summary: "Detailed study notes explaining TCP connection management, 3-way handshake, congestion control algorithms (Tahoe, Reno), and UDP headers."
        },
        {
          id: "note_2",
          subject: "Operating Systems",
          title: "OS Module 2 - Process Management & Scheduling.pdf",
          pages_count: 18,
          upload_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          summary: "Covers process states, context switching, CPU scheduling metrics, preemptive vs non-preemptive logic, and Gantt charts."
        }
      ];
      setNotes(initialNotes);
      localStorage.setItem("cf_notes", JSON.stringify(initialNotes));
    }

    if (storedFlashcards) setFlashcards(JSON.parse(storedFlashcards));
    else {
      const initialFC: Flashcard[] = [
        {
          id: "fc_1",
          note_id: "note_1",
          question: "What is the standard size of a TCP header without options?",
          answer: "20 bytes.",
          difficulty: "easy"
        },
        {
          id: "fc_2",
          note_id: "note_1",
          question: "Explain the difference between TCP Tahoe and TCP Reno during Fast Recovery.",
          answer: "TCP Tahoe drops the congestion window (cwnd) back to 1 MSS on packet loss and starts slow start. TCP Reno performs Fast Recovery, cuts cwnd in half, sets ssthresh to the new cwnd, and increases cwnd linearly (congestion avoidance) rather than returning to slow start.",
          difficulty: "hard"
        },
        {
          id: "fc_3",
          note_id: "note_2",
          question: "What is a context switch?",
          answer: "The process of saving the state of a running process or thread so that it can be paused, and loading the saved state of another process to resume execution.",
          difficulty: "medium"
        }
      ];
      setFlashcards(initialFC);
      localStorage.setItem("cf_flashcards", JSON.stringify(initialFC));
    }

    if (storedQuizzes) setQuizzes(JSON.parse(storedQuizzes));
    else {
      const initialQuizzes: Quiz[] = [
        {
          id: "qz_1",
          subject: "Operating Systems",
          title: "Schedules & Deadlocks Challenge",
          time_limit_minutes: 10,
          questions: [
            {
              id: 1,
              question: "Which of the following scheduling algorithms can result in starvation?",
              options: ["First-Come First-Served (FCFS)", "Round Robin (RR)", "Shortest Job First (SJF)", "Priority Scheduling"],
              correctAnswer: "Shortest Job First (SJF)"
            },
            {
              id: 2,
              question: "What is the necessary condition for a deadlock to occur?",
              options: ["Mutual Exclusion & Hold and Wait", "No Preemption", "Circular Wait", "All of the above"],
              correctAnswer: "All of the above"
            },
            {
              id: 3,
              question: "Beladys anomaly occurs in which page replacement algorithm?",
              options: ["LRU (Least Recently Used)", "Optimal Page Replacement", "FIFO (First-In First-Out)", "MRU (Most Recently Used)"],
              correctAnswer: "FIFO (First-In First-Out)"
            }
          ]
        }
      ];
      setQuizzes(initialQuizzes);
      localStorage.setItem("cf_quizzes", JSON.stringify(initialQuizzes));
    }

    if (storedPlacements) setPlacements(JSON.parse(storedPlacements));
    else {
      const initialPlacements: Placement[] = [
        {
          id: "pl_1",
          company_name: "Amazon",
          role: "Software Development Engineer Intern",
          status: "interviewing",
          interview_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          progress: 60,
          company_logo: "amazon",
          interview_pattern: "1 Online Assessment (Coding + Behavior) + 2 Technical Interviews (DSA, System Design, Leadership Principles)",
          difficulty: "hard",
          popular_topics: ["Graphs", "Dynamic Programming", "Trees", "Leadership Principles"],
          roadmap: ["Solve Top 50 Amazon LeetCode questions", "Complete 3 Mock Coding Interviews on CampusFlow AI", "Review STAR format answers for Leadership Principles"]
        },
        {
          id: "pl_2",
          company_name: "Google",
          role: "STEP Intern",
          status: "applied",
          interview_date: null,
          progress: 25,
          company_logo: "google",
          interview_pattern: "2 Technical Interviews (Data Structures, Algorithms)",
          difficulty: "hard",
          popular_topics: ["Recursion", "Hash Maps", "Sorting and Searching"],
          roadmap: ["Study advanced Graph Traversals", "Practice whiteboarding algorithms"]
        },
        {
          id: "pl_3",
          company_name: "Stripe",
          role: "Frontend Engineering Intern",
          status: "rejected",
          interview_date: null,
          progress: 100,
          company_logo: "stripe",
          interview_pattern: "1 Takehome Project + 1 Live Debugging Interview + 1 System Design",
          difficulty: "medium",
          popular_topics: ["Javascript internals", "React Hooks", "API integration"],
          roadmap: ["Refactor styling patterns", "Learn real-time polling patterns"]
        }
      ];
      setPlacements(initialPlacements);
      localStorage.setItem("cf_placements", JSON.stringify(initialPlacements));
    }

    if (storedAssessments) setAssessments(JSON.parse(storedAssessments));
    else {
      const initialAssessments: Assessment[] = [
        {
          id: "as_1",
          type: "coding",
          title: "DSA Mock Assessment #4 - Graph Traversals",
          score: 82,
          performance_data: { accuracy: 82, time_spent_min: 45, questions_solved: 4, total_questions: 5 },
          strengths: ["Breadth First Search (BFS)", "Dijkstras Shortest Path"],
          weaknesses: ["Tarjans Strongly Connected Components", "Disjoint Set Union (DSU)"],
          ai_feedback: "Solid problem-solving speed. Your DFS backtracking contains minor edge-case failures. Review cycle detection algorithms using DSU."
        },
        {
          id: "as_2",
          type: "technical",
          title: "OS & Network Fundamentals Drill",
          score: 75,
          performance_data: { accuracy: 75, time_spent_min: 20, questions_solved: 15, total_questions: 20 },
          strengths: ["CPU Scheduling", "IP Addressing"],
          weaknesses: ["Virtual Memory Page Faults", "TCP congestion avoidance"],
          ai_feedback: "Great response times on theoretical questions. Re-read the mechanisms of TCP Tahoe vs Reno to avoid confusing fast recovery thresholds."
        }
      ];
      setAssessments(initialAssessments);
      localStorage.setItem("cf_assessments", JSON.stringify(initialAssessments));
    }

    if (storedLogs) setActivityLogs(JSON.parse(storedLogs));
    else {
      const initialLogs: ActivityLog[] = [
        { action: "Completed first assignment", category: "tasks", points_earned: 50, created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
        { action: "Created UDP project task", category: "tasks", points_earned: 10, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { action: "Completed OS Scheduling Assignment", category: "tasks", points_earned: 30, created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
        { action: "Generated Transport Layer Flashcards", category: "study", points_earned: 20, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { action: "Maintained 5-day streak", category: "profile", points_earned: 50, created_at: new Date().toISOString() }
      ];
      setActivityLogs(initialLogs);
      localStorage.setItem("cf_logs", JSON.stringify(initialLogs));
    }
  };

  const updateLocalStateAndStorage = (key: string, data: any, stateSetter: Function) => {
    stateSetter(data);
    localStorage.setItem(key, JSON.stringify(data));
  };

  const updateXP = async (points: number) => {
    try {
      const res = await fetch(`${API_BASE}/student/add-xp?points=${points}`, { method: 'POST' });
      if (res.ok) {
        setStudent(await res.json());
      } else throw new Error();
    } catch {
      // Local fallback logic
      const updated = { ...student };
      updated.xp += points;
      const nextThreshold = updated.level * 100;
      if (updated.xp >= nextThreshold) {
        updated.level += 1;
        const newLog: ActivityLog = {
          action: `Leveled up to Level ${updated.level}! 🚀`,
          category: 'profile',
          points_earned: 0,
          created_at: new Date().toISOString()
        };
        const updatedLogs = [newLog, ...activityLogs];
        updateLocalStateAndStorage("cf_logs", updatedLogs, setActivityLogs);
      }
      updateLocalStateAndStorage("cf_student", updated, setStudent);
    }
  };

  const createTask = async (taskIn: Omit<Task, 'id' | 'student_id' | 'status' | 'whatsapp_reminder_scheduled' | 'ai_risk_score' | 'ai_risk_analysis'>) => {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskIn)
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks(prev => [newTask, ...prev]);
        // Re-load student state to capture new XP
        const studentRes = await fetch(`${API_BASE}/student`);
        if (studentRes.ok) setStudent(await studentRes.json());
      } else throw new Error();
    } catch {
      // Local fallback
      // Simulating AI Risk analysis locally
      let riskScore = 30;
      let riskAnalysis = "Moderate risk. Ensure steady development increments.";
      if (taskIn.subject.includes("Networks") || taskIn.title.toLowerCase().includes("udp")) {
        riskScore = 45;
        riskAnalysis = "The project requires extensive socket programming. You have completed the base setup but have not coded congestion control. High risk if postponed past tomorrow.";
      } else if (taskIn.title.toLowerCase().includes("dp") || taskIn.subject.includes("Algorithms")) {
        riskScore = 15;
        riskAnalysis = "Low risk. The topics are well-rehearsed, but completing it soon maintains your DAA performance profile.";
      }

      const newTask: Task = {
        ...taskIn,
        id: `t_${Math.random().toString(36).substring(2, 9)}`,
        student_id: student.id,
        status: 'pending',
        whatsapp_reminder_scheduled: true,
        ai_risk_score: riskScore,
        ai_risk_analysis: riskAnalysis
      };

      const updatedTasks = [newTask, ...tasks];
      updateLocalStateAndStorage("cf_tasks", updatedTasks, setTasks);

      // Award XP
      await updateXP(10);

      // Log activity
      const newLog: ActivityLog = {
        action: `Created Task: ${newTask.title}`,
        category: 'tasks',
        points_earned: 10,
        created_at: new Date().toISOString()
      };
      updateLocalStateAndStorage("cf_logs", [newLog, ...activityLogs], setActivityLogs);
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/status?status=${nextStatus}`, { method: 'PUT' });
      if (res.ok) {
        const updatedTask = await res.json();
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
        // Refresh student XP
        const studentRes = await fetch(`${API_BASE}/student`);
        if (studentRes.ok) setStudent(await studentRes.json());
      } else throw new Error();
    } catch {
      // Local Fallback
      const updatedTasks = tasks.map(t => {
        if (t.id === taskId) {
          return { ...t, status: nextStatus as any };
        }
        return t;
      });
      updateLocalStateAndStorage("cf_tasks", updatedTasks, setTasks);

      if (nextStatus === 'completed') {
        const updatedStudent = {
          ...student,
          productivity_score: Math.min(100, student.productivity_score + 2)
        };
        updateLocalStateAndStorage("cf_student", updatedStudent, setStudent);
        await updateXP(30);

        const newLog: ActivityLog = {
          action: `Completed Task: ${tasks.find(t => t.id === taskId)?.title}`,
          category: 'tasks',
          points_earned: 30,
          created_at: new Date().toISOString()
        };
        updateLocalStateAndStorage("cf_logs", [newLog, ...activityLogs], setActivityLogs);
      }
    }
  };

  const uploadNoteAndGenerateAssets = async (noteIn: { subject: string; title: string; content: string; pages_count: number }) => {
    try {
      const res = await fetch(`${API_BASE}/notes/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteIn)
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(prev => [data.note, ...prev]);
        // Refresh flashcards and quizzes
        const fcRes = await fetch(`${API_BASE}/flashcards`);
        if (fcRes.ok) setFlashcards(await fcRes.json());
        const qzRes = await fetch(`${API_BASE}/quizzes`);
        if (qzRes.ok) setQuizzes(await qzRes.json());
        // Refresh profile status
        const studentRes = await fetch(`${API_BASE}/student`);
        if (studentRes.ok) setStudent(await studentRes.json());
      } else throw new Error();
    } catch {
      // Local Fallback Mock
      const newNoteId = `n_${Math.random().toString(36).substring(2, 9)}`;
      const newNote: StudyNote = {
        id: newNoteId,
        subject: noteIn.subject,
        title: noteIn.title,
        pages_count: noteIn.pages_count,
        upload_date: new Date().toISOString(),
        summary: `AI generated study guide covering core aspects of ${noteIn.title}. This includes detailed definitions and conceptual flow blocks.`
      };

      // Generate flashcards locally
      const mockFCs: Flashcard[] = [
        {
          id: `fc_${Math.random().toString(36).substring(2, 9)}`,
          note_id: newNoteId,
          question: `Explain the central bottleneck in ${noteIn.title}`,
          answer: "Synchronization overhead or data packets congestion in transport threads.",
          difficulty: "medium"
        },
        {
          id: `fc_${Math.random().toString(36).substring(2, 9)}`,
          note_id: newNoteId,
          question: `What is the standard design pattern for resolving state errors in ${noteIn.subject}?`,
          answer: "Deploying retry handlers, sliding rate parameters, or implementing locks.",
          difficulty: "easy"
        }
      ];

      // Generate quiz locally
      const mockQuiz: Quiz = {
        id: `qz_${Math.random().toString(36).substring(2, 9)}`,
        subject: noteIn.subject,
        title: `Review Quiz: ${noteIn.title}`,
        time_limit_minutes: 15,
        questions: [
          {
            id: 1,
            question: `Which layer handles standard protocol interactions in ${noteIn.subject}?`,
            options: ["Physical Link Layer", "Network Router Layer", "Logic Layer or Application Layer", "None of the above"],
            correctAnswer: "Logic Layer or Application Layer"
          }
        ]
      };

      updateLocalStateAndStorage("cf_notes", [newNote, ...notes], setNotes);
      updateLocalStateAndStorage("cf_flashcards", [...mockFCs, ...flashcards], setFlashcards);
      updateLocalStateAndStorage("cf_quizzes", [mockQuiz, ...quizzes], setQuizzes);

      await updateXP(25);
      const newLog: ActivityLog = {
        action: `Uploaded Notes: ${noteIn.title} & Generated Assets`,
        category: 'study',
        points_earned: 25,
        created_at: new Date().toISOString()
      };
      updateLocalStateAndStorage("cf_logs", [newLog, ...activityLogs], setActivityLogs);
    }
  };

  const createPlacement = async (placementIn: { company_name: string; role: string; status: 'applied' | 'interviewing' | 'offered' | 'rejected'; interview_date?: string }) => {
    try {
      const res = await fetch(`${API_BASE}/placements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(placementIn)
      });
      if (res.ok) {
        const newPl = await res.json();
        setPlacements(prev => [newPl, ...prev]);
        const studentRes = await fetch(`${API_BASE}/student`);
        if (studentRes.ok) setStudent(await studentRes.json());
      } else throw new Error();
    } catch {
      // Local fallback
      const newPl: Placement = {
        id: `pl_${Math.random().toString(36).substring(2, 9)}`,
        company_name: placementIn.company_name,
        role: placementIn.role,
        status: placementIn.status,
        interview_date: placementIn.interview_date || null,
        progress: placementIn.status === 'interviewing' ? 30 : 10,
        company_logo: placementIn.company_name.toLowerCase(),
        interview_pattern: "Online Test + 2 Technical rounds focusing on DSA & Projects",
        difficulty: 'medium',
        popular_topics: ["Data Structures", "Algorithms", "System Design"],
        roadmap: ["Prepare LeetCode top interview queries", "Practice interview simulator chat"]
      };

      updateLocalStateAndStorage("cf_placements", [newPl, ...placements], setPlacements);
      await updateXP(15);

      const newLog: ActivityLog = {
        action: `Added Placement application: ${placementIn.company_name}`,
        category: 'placement',
        points_earned: 15,
        created_at: new Date().toISOString()
      };
      updateLocalStateAndStorage("cf_logs", [newLog, ...activityLogs], setActivityLogs);
    }
  };

  const submitQuizScore = async (type: 'coding' | 'aptitude' | 'technical' | 'hr', title: string, score: number) => {
    try {
      const res = await fetch(`${API_BASE}/assessments?type=${type}&title=${title}&score=${score}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAssessments(prev => [data, ...prev]);
        const studentRes = await fetch(`${API_BASE}/student`);
        if (studentRes.ok) setStudent(await studentRes.json());
      } else throw new Error();
    } catch {
      // Local Fallback
      let feedback = `Assessment completed with score ${score}%. `;
      if (score >= 80) feedback += "Superb accuracy! You have a high readiness factor in this subtopic.";
      else feedback += "Review critical paths, re-test weaknesses, and configure calendar recovery options.";

      const newAssess: Assessment = {
        id: `as_${Math.random().toString(36).substring(2, 9)}`,
        type,
        title,
        score,
        performance_data: { accuracy: score, time_spent_min: 25 },
        strengths: ["Core terminology", "Basic algorithms"],
        weaknesses: ["Complex synchronization logic"],
        ai_feedback: feedback
      };

      updateLocalStateAndStorage("cf_assessments", [newAssess, ...assessments], setAssessments);
      await updateXP(40);

      const newLog: ActivityLog = {
        action: `Completed quiz: ${title} (${score}%)`,
        category: 'placement',
        points_earned: 40,
        created_at: new Date().toISOString()
      };
      updateLocalStateAndStorage("cf_logs", [newLog, ...activityLogs], setActivityLogs);
    }
  };

  const chatWithNotes = async (noteId: string, message: string, history: Array<{ sender: 'user' | 'ai'; text: string }>) => {
    try {
      // Convert UI history format to API format
      const apiHistory = history.map(h => ({
        sender: h.sender === 'user' ? 'user' : 'ai',
        text: h.text
      }));

      const res = await fetch(`${API_BASE}/chat-with-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_id: noteId, message, history: apiHistory })
      });
      if (res.ok) {
        const data = await res.json();
        return data.reply;
      }
      throw new Error();
    } catch {
      // Local fallback simulator responses
      const textLower = message.toLowerCase();
      if (textLower.includes("hello") || textLower.includes("hi")) {
        return "Hi Nevan! I have processed your note uploads. Ask me anything about connection protocols, CPU schedules, and context switching loops!";
      } else if (textLower.includes("tcp") || textLower.includes("udp") || textLower.includes("handshake")) {
        return "TCP uses a 3-way handshake (SYN, SYN-ACK, ACK) to ensure byte-stream packet delivery, whereas UDP drops packets blindly. TCP provides reliability, flow limits, and window sizes. In Transport Protocols, this is vital.";
      } else if (textLower.includes("starvation")) {
        return "Starvation occurs when a scheduling system starves a process of execution time. We fix it using 'aging' rules—increasing process priorities over latency durations.";
      }
      return "That is a great academic concept! Based on the summaries, we should prioritize identifying active loops and caching bottlenecks. Try asking me to generate a 3-question quick drill to test you!";
    }
  };

  const chatWithInterviewer = async (companyName: string, role: string, message: string, history: Array<{ sender: 'user' | 'ai'; text: string }>) => {
    try {
      const apiHistory = history.map(h => ({
        sender: h.sender === 'user' ? 'user' : 'ai',
        text: h.text
      }));

      const res = await fetch(`${API_BASE}/interview-simulator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: companyName, role, message, history: apiHistory })
      });
      if (res.ok) {
        const data = await res.json();
        return data.reply;
      }
      throw new Error();
    } catch {
      // Local fallback dialog tree
      if (history.length <= 1) {
        return `Welcome, Nevan! Thank you for taking the time to speak with us today at ${companyName}. Let's start with a technical query. How do you design a streaming data system that efficiently returns top k queries, and what is its time complexity?`;
      }
      const answer = message.toLowerCase();
      if (answer.includes("heap") || answer.includes("priority queue") || answer.includes("log k")) {
        return "Spot on. A min-heap of size k runs in O(N log k) time. Now, Amazon values ownership. Can you describe a project failure or conflict you navigated, and how you resolved it?";
      } else if (answer.includes("star") || answer.includes("managed") || answer.includes("resolved") || answer.includes("team")) {
        return "Great behavioral answers represent core placement strengths. For our final technical round: explain virtual memory page table operations and the role of the TLB cache.";
      }
      return "I see. Let's delve into optimization: how would you optimize the memory footprint if the streaming system had billions of active nodes?";
    }
  };

  const registerStudent = async (studentIn: Omit<Student, 'id' | 'productivity_score' | 'streak' | 'xp' | 'level'>) => {
    try {
      const res = await fetch(`${API_BASE}/student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentIn)
      });
      if (res.ok) {
        const studentData = await res.json();
        setStudent(studentData);
        localStorage.setItem("cf_student", JSON.stringify(studentData));
      } else throw new Error();
    } catch {
      const newStudent: Student = {
        ...studentIn,
        id: `s_${Math.random().toString(36).substring(2, 9)}`,
        productivity_score: 85,
        streak: 5,
        xp: 0,
        level: 1
      };
      updateLocalStateAndStorage("cf_student", newStudent, setStudent);
    }
  };

  return (
    <StudentContext.Provider value={{
      student,
      tasks,
      notes,
      flashcards,
      quizzes,
      placements,
      assessments,
      activityLogs,
      loading,
      updateXP,
      createTask,
      toggleTaskStatus,
      uploadNoteAndGenerateAssets,
      createPlacement,
      submitQuizScore,
      chatWithNotes,
      chatWithInterviewer,
      registerStudent
    }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (context === undefined) throw new Error("useStudent must be used inside a StudentProvider");
  return context;
};
