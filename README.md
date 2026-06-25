# CampusFlow AI - Academic & Placement Copilot 🎓

CampusFlow AI is a production-ready, dark-mode-first academic and placement copilot. Styled with a premium hybrid aesthetic (Discord, Notion, Spotify, Linear, LeetCode, and Arc Browser), it helps students manage assignment schedules, study with AI, prepare for placements, and track weekly productivity metrics.

The platform integrates:
- **FastAPI backend** managing REST endpoints, Groq Llama 3 AI computations, and outgoing n8n triggers.
- **Vite + React + TS frontend** featuring custom glassmorphism panels, swipeable flashcards, LeetCode-style quizzes, radar charts, and Spotify Wrapped slideshow reports.
- **Supabase PostgreSQL Schema** containing triggers, seed records, and optimized indexes.
- **n8n Automation Engine blueprints** syncing events to Google Calendar and dispatching alerts to WhatsApp.
- TRY THE APP: campus-ai-pi-amber.vercel.app
Github Repo link: https://github.com/Nevan1705/Campus-AI.git

---

## 📂 Project Structure

```bash
campus/
├── backend/
│   ├── main.py            # FastAPI entry point, routers, CORS, and webhook relays
│   ├── groq_helper.py     # AI integration wrapper (Groq LLM Llama 3 with fallback mock drivers)
│   └── requirements.txt   # Python dependency list
├── frontend/
│   ├── index.html         # Frontend template with dark background and customized Google fonts
│   ├── package.json       # React, Tailwind, Framer Motion, Recharts, and configuration dependencies
│   ├── tailwind.config.js # Customized dark-mode color system values
│   ├── tsconfig.json      # TypeScript compiler rules
│   ├── vite.config.ts     # Vite configurations with backend proxy
│   └── src/
│       ├── main.tsx       # React bootstrap entry point
│       ├── index.css      # Core styles, custom scrollbars, animations, glassmorphism directives
│       ├── App.tsx        # Routing configurations and global layouts (Sidebar, Top nav, activity)
│       ├── context/
│       │   └── StudentContext.tsx # Context state with localStorage fallbacks (allows standalone evaluation)
│       └── pages/
│           ├── LandingPage.tsx    # Animated CTA homepage displaying WhatsApp alerts mockup
│           ├── AuthPage.tsx       # Dark glass login/register panel
│           ├── Dashboard.tsx      # Central student feed (streaks, AI smart cards, schedules)
│           ├── Tasks.tsx          # Kanban status columns, timers, risk analysis drawers
│           ├── StudyBuddy.tsx     # Flashcard swipe decks, LeetCode MCQs, and note interaction chat
│           ├── PlacementCoach.tsx # Placement tracker, conversational interview trainer, weakness radars
│           ├── Reports.tsx        # Spotify Wrapped weekly stories dashboard
│           └── Profile.tsx        # Dossier view with achievement badges, level progress, course loads
├── supabase/
│   └── schema.sql         # Supabase PostgreSQL tables, indexes, and Nevan mock seed data
└── README.md              # Installation guides, DB dictionary, and n8n workflow blueprints
```

---

## 🛠️ Installation & Setup

### 1. Database Setup (Supabase)
1. Head to your [Supabase Dashboard](https://supabase.com) and create a new project.
2. Navigate to the **SQL Editor** tab from the left panel.
3. Open a new query file, copy the entire contents of [supabase/schema.sql](file:///c:/Users/nevan/OneDrive/Desktop/campus/supabase/schema.sql), paste it, and click **Run**.
4. This will create all 10 tables (`students`, `tasks`, `study_notes`, etc.), add query optimization indexes, and seed it with realistic data for the student **Nevan** (Streak: 5 days, Level: 3).

### 2. Backend Setup (FastAPI)
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend/` folder:
   ```env
   GROQ_API_KEY=your_groq_cloud_api_key
   N8N_WEBHOOK_URL=http://your-n8n-instance.com
   ```
   *Note: If no keys are provided, the API automatically triggers intelligent offline fallback templates so the application remains fully functional for demo/hackathon evaluations.*
5. Launch the backend server:
   ```bash
   python main.py
   ```
   The API will start running on `http://127.0.0.1:8000`.

### 3. Frontend Setup (React)
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the node packages:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`. You will see the animated Landing Page. Click **Get Started** to access the workspaces.

---

## 🧠 Database Dictionary (Supabase Tables)

Here is a summary of the database schema created in `supabase/schema.sql`:

| Table Name | Key Purpose | Primary Fields | Relationships |
| :--- | :--- | :--- | :--- |
| **`students`** | Stores profile details, gamification variables, streaks. | `id` (UUID), `name`, `email`, `branch`, `year`, `phone_number`, `subjects` (text[]), `productivity_score`, `streak`, `xp`, `level`. | |
| **`tasks`** | Stores student assignment details, deadlines, and risk metrics. | `id` (UUID), `title`, `subject`, `deadline`, `status` (`pending`/`completed`/`missed`), `add_to_calendar` (bool), `ai_risk_score`, `ai_risk_analysis`. | `student_id` ➔ `students.id` |
| **`study_notes`** | Academic uploads metadata. | `id` (UUID), `subject`, `title`, `pages_count`, `summary`. | `student_id` ➔ `students.id` |
| **`flashcards`** | AI generated Quizlet-style flashcards. | `id` (UUID), `question`, `answer`, `difficulty` (`easy`/`medium`/`hard`). | `note_id` ➔ `study_notes.id` |
| **`quizzes`** | LeetCode-style study review challenges. | `id` (UUID), `subject`, `title`, `questions` (JSONB), `time_limit_minutes`. | `student_id` ➔ `students.id` |
| **`placements`** | Placement application records. | `id` (UUID), `company_name`, `role`, `status` (`applied`/`interviewing`/`offered`/`rejected`), `interview_date`, `progress`, `roadmap` (text[]). | `student_id` ➔ `students.id` |
| **`assessments`** | Mock performance scores and evaluation notes. | `id` (UUID), `type` (`coding`/`aptitude`/`technical`/`hr`), `title`, `score`, `strengths` (text[]), `weaknesses` (text[]), `ai_feedback`. | `student_id` ➔ `students.id` |
| **`reports`** | Spotify-wrapped productivity slides data. | `id` (UUID), `week_start`, `tasks_completed`, `study_time_hours`, `avg_assessment_score`, `ai_summary`. | `student_id` ➔ `students.id` |
| **`activity_logs`** | Gamified experience tracking history. | `id` (UUID), `action`, `category`, `points_earned`. | `student_id` ➔ `students.id` |

---

## 🤖 n8n Workflow Automation Architecture

To configure the 5 core automations in n8n, create a new workflow canvas in your n8n workspace and set up the nodes described below. The backend sends webhook payloads to n8n webhook nodes which drive Google Calendar and WhatsApp (using Twilio or Meta WhatsApp Business API).

### Workflow 1: Task Creation (Calendar Sync & Reminders)
This workflow triggers when a task is created, creates a calendar event, and schedules reminder notices.
- **Node 1: Webhook Trigger**
  - **Path**: `/task-created`
  - **Method**: `POST`
  - **Expected Fields**: `student_name`, `student_phone`, `task: { title, subject, deadline, reminder_time }`
- **Node 2: Google Calendar (Create Event)**
  - **Calendar**: `Primary`
  - **Summary**: `[CampusFlow] {task.subject}: {task.title}`
  - **Start Time**: `{task.deadline}` (set end time to 1 hour after start)
- **Node 3: Twilio (Send WhatsApp SMS)**
  - **Sender**: Twilio WhatsApp Number (`whatsapp:+14155238886`)
  - **Receiver**: `{student_phone}`
  - **Message**: *"Hey {student_name}! 🚀 A new calendar block is scheduled for your '{task.title}' task. Deadline: {task.deadline}."*
- **Node 4: n8n Wait Node (24h Reminder)**
  - **Wait Amount**: Duration relative to `{task.deadline}` minus 24 hours.
  - **Action**: Trigger subsequent Twilio node warning: *"Hey! '{task.title}' is due in 24 hours. Start working to protect your streak!"*
- **Node 5: n8n Wait Node (1h Reminder)**
  - **Wait Amount**: Duration relative to `{task.deadline}` minus 1 hour.
  - **Action**: Trigger Twilio node warning: *"Final sprint! '{task.title}' is due in 1 hour."*

### Workflow 2: Study Session Generated (Flashcard Dispatches)
Triggers when notes are uploaded and assets are created.
- **Node 1: Webhook Trigger**
  - **Path**: `/study-note-processed`
  - **Expected Fields**: `student_phone`, `subject`, `title`, `flashcard_count`
- **Node 2: Google Calendar (Create Focus Event)**
  - **Summary**: `[CampusFlow Focus] Study session: {subject}`
  - **Start Time**: `Current Time + 1 hour`
- **Node 3: Twilio (Send WhatsApp SMS)**
  - **Message**: *"Hey! We processed your notes on '{title}'. AI created {flashcard_count} flashcards for revision. Let's study! 🧠"*

### Workflow 3: Placement Prep (Interview Block & Daily Alerts)
Triggers when an interview is added, blocks calendar time, and schedules daily preparation questions.
- **Node 1: Webhook Trigger**
  - **Path**: `/interview-scheduled`
  - **Expected Fields**: `company_name`, `role`, `interview_date`, `student_phone`
- **Node 2: Google Calendar (Create Event Block)**
  - **Summary**: `[Placement Prep] Mock session for {company_name} ({role})`
  - **Start Time**: `{interview_date}` (creates a 2-hour blocking slot)
- **Node 3: Cron Trigger (Daily Loop)**
  - **Trigger**: Run daily at 9:00 AM until interview date.
  - **Action**: Call OpenAI/Groq node to generate a top DSA question for `{company_name}`, then call Twilio to send to `{student_phone}`: *"Daily Amazon SDE prep: Can you solve the maximum path sum in a binary tree? Respond in CampusFlow mock coach!"*

### Workflow 4: Weekly Productivity Wrap (Spotify Wrapped Alert)
Generates weekly insights and texts a summary.
- **Node 1: Cron Trigger (Weekly)**
  - **Schedule**: Every Sunday at 6:00 PM.
- **Node 2: Supabase (Query Tasks & Scores)**
  - **Query**: Select count of completed tasks and assessment scores logged this week for the student.
- **Node 3: AI Groq Node (Summary Synthesis)**
  - **Prompt**: *"Analyze these weekly metrics (Tasks: {tasks}, Avg Score: {score}%) and compile a 2-sentence Spotify Wrapped style text."*
- **Node 4: Twilio (Send WhatsApp SMS)**
  - **Message**: *"CampusFlow Wrapped is ready! 🏆 You completed {tasks} tasks this week with a {score}% mock accuracy score. Keep it up!"*

### Workflow 5: Missed Task Recovery
Triggers when a task deadline passes without completion.
- **Node 1: Webhook Trigger**
  - **Path**: `/task-missed`
  - **Expected Fields**: `task: { title, subject, id }`, `student_phone`
- **Node 2: AI Groq Node (Recovery Plan)**
  - **Prompt**: *"Student missed the deadline for {title} in {subject}. Synthesize a 1-sentence recovery study session details."*
- **Node 3: Google Calendar (Block Recovery Event)**
  - **Summary**: `[CampusFlow Recovery] {title}`
  - **Start Time**: `Current Time + 4 hours` (blocks out 1 hour)
- **Node 4: Twilio (Send WhatsApp SMS)**
  - **Message**: *"Oh no! You missed the deadline for '{title}'. ⚠️ We blocked a 1-hour recovery block in your calendar. Check your dashboard for the AI Recovery plan!"*


