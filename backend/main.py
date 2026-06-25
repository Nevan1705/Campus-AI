import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Import Groq helper
try:
    from groq_helper import (
        analyze_task_risk,
        generate_flashcards_from_text,
        generate_quiz_from_text,
        chat_with_notes_response,
        generate_dashboard_insights,
        placement_interview_simulator,
        get_weekly_report_summary
    )
except ImportError:
    pass

app = FastAPI(title="CampusFlow AI Backend API", version="1.0.0")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Optional external connections configuration
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

# =========================================================================
# SUPABASE REST API INTEGRATION CLIENT
# =========================================================================

def get_supabase_headers():
    return {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

async def supabase_get(table: str, query_params: dict = None) -> list:
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        return None
    try:
        async with httpx.AsyncClient() as client:
            url = f"{SUPABASE_URL}/rest/v1/{table}"
            resp = await client.get(url, params=query_params, headers=get_supabase_headers())
            if resp.status_code in [200, 201]:
                return resp.json()
            print(f"Supabase GET error for table {table}: {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"Supabase GET exception: {e}")
    return None

async def supabase_post(table: str, payload: dict) -> list:
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        return None
    try:
        async with httpx.AsyncClient() as client:
            url = f"{SUPABASE_URL}/rest/v1/{table}"
            resp = await client.post(url, json=payload, headers=get_supabase_headers())
            if resp.status_code in [200, 201]:
                return resp.json()
            print(f"Supabase POST error for table {table}: {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"Supabase POST exception: {e}")
    return None

async def supabase_patch(table: str, query_params: dict, payload: dict) -> list:
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        return None
    try:
        async with httpx.AsyncClient() as client:
            url = f"{SUPABASE_URL}/rest/v1/{table}"
            resp = await client.patch(url, params=query_params, json=payload, headers=get_supabase_headers())
            if resp.status_code in [200, 201, 204]:
                # 204 means No Content, check if json is available
                try:
                    return resp.json()
                except Exception:
                    return [{"status": "success"}]
            print(f"Supabase PATCH error for table {table}: {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"Supabase PATCH exception: {e}")
    return None

# =========================================================================
# IN-MEMORY DATA STORE (Cleared - Init Empty)
# =========================================================================

# Clear dummy data - starts blank initially
student_db = {}
tasks_db = []
notes_db = []
flashcards_db = []
quizzes_db = []
placements_db = []
assessments_db = []
activity_logs_db = []

# =========================================================================
# ASYNC N8N TRIGGER HELPER
# =========================================================================
async def trigger_n8n_webhook(workflow_id: int, payload: dict):
    if not N8N_WEBHOOK_URL:
        print(f"[n8n Automation Engine - Simulation Mode] Workflow {workflow_id} triggered with payload: {payload}")
        return
        
    # Format student_phone to ensure it starts with "whatsapp:"
    if "student_phone" in payload:
        phone = payload["student_phone"]
        if phone and not phone.startswith("whatsapp:"):
            payload["student_phone"] = f"whatsapp:{phone}"
            
    try:
        # Map workflow_id to the specific path
        workflow_paths = {
            1: "task-created",
            2: "study-note-processed",
            3: "interview-scheduled",
            5: "task-missed"
        }
        path = workflow_paths.get(workflow_id, f"workflow/{workflow_id}")
        
        # Build the URL based on N8N_WEBHOOK_URL format
        base_url = N8N_WEBHOOK_URL.rstrip('/')
        import re
        match = re.match(r"(https?://[^/]+)/(webhook-test|webhook)/.*", base_url)
        if match:
            domain = match.group(1)
            prefix = match.group(2)
            url = f"{domain}/{prefix}/{path}"
        else:
            if "/webhook" in base_url:
                url = f"{base_url}/{path}"
            else:
                url = f"{base_url}/webhook/{path}"
                
        async with httpx.AsyncClient() as client:
            await client.post(url, json=payload, timeout=5.0)
    except Exception as e:
        print(f"Failed to forward payload to n8n webhook: {e}")

# =========================================================================
# API MODEL REPRESENTATIONS (Pydantic schemas)
# =========================================================================
class TaskCreate(BaseModel):
    title: str
    subject: str
    description: str
    deadline: str
    reminder_time: Optional[str] = None
    add_to_calendar: bool = False

class NotesCreate(BaseModel):
    subject: str
    title: str
    content: str
    pages_count: int

class StudentCreate(BaseModel):
    name: str
    email: str
    branch: str
    year: int
    phone_number: str
    subjects: List[str]

class ChatMessageInput(BaseModel):
    note_id: str
    message: str
    history: List[Dict[str, str]]

class InterviewMessageInput(BaseModel):
    company_name: str
    role: str
    message: str
    history: List[Dict[str, str]]

class PlacementCreate(BaseModel):
    company_name: str
    role: str
    status: str
    interview_date: Optional[str] = None

# =========================================================================
# API ROUTINGS
# =========================================================================

# Session variable to track currently logged-in student
current_student_email = None

async def get_active_student_details() -> dict:
    global current_student_email
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        if current_student_email:
            students = await supabase_get("students", {"email": f"eq.{current_student_email}"})
            if students and len(students) > 0:
                return students[0]
        
        # If no active email session, default to the first student in the table
        students = await supabase_get("students")
        if students and len(students) > 0:
            # Sync the session email to the first student
            current_student_email = students[0]["email"]
            return students[0]
        
        # If table is empty, seed a default student
        default_student = {
            "id": "d3b07384-d113-4ec2-a5d6-d04b6b66d8e2",
            "name": "Nevan",
            "email": "nevan@campusflow.ai",
            "branch": "Computer Science & Engineering",
            "year": 3,
            "phone_number": "+917892713876",
            "subjects": ["Computer Networks", "Operating Systems", "Database Management Systems", "Design and Analysis of Algorithms"],
            "productivity_score": 85,
            "streak": 5,
            "xp": 240,
            "level": 3
        }
        await supabase_post("students", default_student)
        current_student_email = default_student["email"]
        return default_student
    else:
        # In-memory local fallback
        if not student_db:
            student_db.update({
                "id": "d3b07384-d113-4ec2-a5d6-d04b6b66d8e2",
                "name": "Nevan",
                "email": "nevan@campusflow.ai",
                "branch": "Computer Science & Engineering",
                "year": 3,
                "phone_number": "+917892713876",
                "subjects": ["Computer Networks", "Operating Systems", "Database Management Systems", "Design and Analysis of Algorithms"],
                "productivity_score": 0,
                "streak": 0,
                "xp": 0,
                "level": 1
            })
        return student_db

# --- 1. STUDENT PROFILE & DASHBOARD API ---
@app.get("/api/student")
async def get_student():
    student = await get_active_student_details()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student

@app.post("/api/student")
async def register_student(student_in: StudentCreate):
    global student_db, current_student_email
    
    current_student_email = student_in.email
    new_student = {
        "id": str(uuid.uuid4()),
        "name": student_in.name,
        "email": student_in.email,
        "branch": student_in.branch,
        "year": student_in.year,
        "phone_number": student_in.phone_number,
        "subjects": student_in.subjects,
        "productivity_score": 85,
        "streak": 5,
        "xp": 0,
        "level": 1
    }
    
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        existing = await supabase_get("students", {"email": f"eq.{student_in.email}"})
        if existing and len(existing) > 0:
            # Update existing student details
            await supabase_patch("students", {"email": f"eq.{student_in.email}"}, {
                "name": student_in.name,
                "branch": student_in.branch,
                "year": student_in.year,
                "phone_number": student_in.phone_number,
                "subjects": student_in.subjects
            })
            updated = await supabase_get("students", {"email": f"eq.{student_in.email}"})
            return updated[0]
        else:
            # Insert new student details
            await supabase_post("students", new_student)
            return new_student
            
    # Local fallback
    student_db.clear()
    student_db.update(new_student)
    return student_db

@app.post("/api/student/add-xp")
async def add_xp(points: int):
    student = await get_active_student_details()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    student_id = student["id"]
    
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        new_xp = student["xp"] + points
        new_level = student["level"]
        next_level_threshold = new_level * 100
        
        if new_xp >= next_level_threshold:
            new_level += 1
            await supabase_post("activity_logs", {
                "student_id": student_id,
                "action": f"Leveled up to Level {new_level}! 🚀",
                "category": "profile",
                "points_earned": 0
            })
            
        await supabase_patch("students", {"id": f"eq.{student_id}"}, {"xp": new_xp, "level": new_level})
        # Fetch updated student profile
        updated = await supabase_get("students", {"id": f"eq.{student_id}"})
        if updated and len(updated) > 0:
            return updated[0]
        return student

    # In-memory fallback
    student_db["xp"] = student_db.get("xp", 0) + points
    next_level_threshold = student_db.get("level", 1) * 100
    if student_db["xp"] >= next_level_threshold:
        student_db["level"] = student_db.get("level", 1) + 1
        activity_logs_db.append({
            "action": f"Leveled up to Level {student_db['level']}! 🚀",
            "category": "profile",
            "points_earned": 0,
            "created_at": datetime.now().isoformat()
        })
    return student_db

@app.get("/api/dashboard/insights")
async def get_dashboard_insights_route():
    pending_count = 0
    active_placements = 0
    
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        tasks = await supabase_get("tasks", {"status": "eq.pending"})
        if tasks:
            pending_count = len(tasks)
        placements = await supabase_get("placements")
        if placements:
            active_placements = len([p for p in placements if p["status"] != "rejected"])
    else:
        pending_count = len([t for t in tasks_db if t["status"] == "pending"])
        active_placements = len([p for p in placements_db if p["status"] != "rejected"])
        
    days_to_interview = 4
    weakest_topic = "Graphs"
    
    insights = generate_dashboard_insights(pending_count, active_placements, days_to_interview, weakest_topic)
    return insights

@app.get("/api/activity-logs")
async def get_activity_logs():
    student = await get_active_student_details()
    if not student:
        return []
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        logs = await supabase_get("activity_logs", {"student_id": f"eq.{student['id']}"})
        if logs:
            return list(reversed(logs))
        return []
    return list(reversed(activity_logs_db))

# --- 2. TASK MANAGER API ---
@app.get("/api/tasks")
async def get_tasks():
    student = await get_active_student_details()
    if not student:
        return []
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        tasks = await supabase_get("tasks", {"student_id": f"eq.{student['id']}"})
        if tasks:
            return tasks
        return []
    return tasks_db

@app.post("/api/tasks")
async def create_task(task_in: TaskCreate, background_tasks: BackgroundTasks):
    analysis_res = analyze_task_risk(
        task_in.title, 
        task_in.subject, 
        task_in.description, 
        task_in.deadline
    )
    
    student = await get_active_student_details()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    student_id = student["id"]
    student_phone = student["phone_number"]
    student_name = student["name"]
            
    new_task = {
        "id": str(uuid.uuid4()),
        "student_id": student_id,
        "title": task_in.title,
        "subject": task_in.subject,
        "description": task_in.description,
        "deadline": task_in.deadline,
        "reminder_time": task_in.reminder_time or (datetime.now() + timedelta(days=1)).isoformat(),
        "status": "pending",
        "add_to_calendar": task_in.add_to_calendar,
        "calendar_event_id": f"evt_{uuid.uuid4().hex[:8]}" if task_in.add_to_calendar else None,
        "whatsapp_reminder_scheduled": True,
        "ai_risk_score": analysis_res.get("risk_score", 30),
        "ai_risk_analysis": analysis_res.get("analysis", "Moderate risk. Ensure steady development increments.")
    }
    
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        await supabase_post("tasks", new_task)
        await supabase_post("activity_logs", {
            "student_id": student_id,
            "action": f"Created Task: {new_task['title']}",
            "category": "tasks",
            "points_earned": 10
        })
        # Add XP to student
        await supabase_patch("students", {"id": f"eq.{student_id}"}, {"xp": student["xp"] + 10})
    else:
        tasks_db.append(new_task)
        activity_logs_db.append({
            "action": f"Created Task: {new_task['title']}",
            "category": "tasks",
            "points_earned": 10,
            "created_at": datetime.now().isoformat()
        })
        student_db["xp"] = student_db.get("xp", 0) + 10
    
    # Trigger n8n Automation Workflows (Workflow 1: Task Creation + Calendar sync)
    background_tasks.add_task(
        trigger_n8n_webhook, 
        workflow_id=1, 
        payload={
            "action": "task_created",
            "task": new_task,
            "student_phone": student_phone,
            "student_name": student_name
        }
    )
    
    return new_task

@app.put("/api/tasks/{task_id}/status")
async def update_task_status(task_id: str, status: str, background_tasks: BackgroundTasks):
    student = await get_active_student_details()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    student_id = student["id"]
    student_phone = student["phone_number"]
    
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        tasks = await supabase_get("tasks", {"id": f"eq.{task_id}"})
        if tasks and len(tasks) > 0:
            task = tasks[0]
            student_id = task["student_id"]
            
            # Fetch the actual student for this task to compute their correct new XP
            target_students = await supabase_get("students", {"id": f"eq.{student_id}"})
            target_student = target_students[0] if target_students else student
            
            await supabase_patch("tasks", {"id": f"eq.{task_id}"}, {"status": status})
            
            if status == "completed" and task["status"] != "completed":
                await supabase_patch("students", {"id": f"eq.{student_id}"}, {
                    "xp": target_student["xp"] + 30,
                    "productivity_score": min(100, target_student["productivity_score"] + 2)
                })
                await supabase_post("activity_logs", {
                    "student_id": student_id,
                    "action": f"Completed Task: {task['title']}",
                    "category": "tasks",
                    "points_earned": 30
                })
            
            if status == "missed":
                student_phone = target_student["phone_number"]
                background_tasks.add_task(
                    trigger_n8n_webhook,
                    workflow_id=5,
                    payload={
                        "action": "task_missed",
                        "task": task,
                        "student_phone": student_phone
                    }
                )
            return task
            
    # Local fallback
    for task in tasks_db:
        if task["id"] == task_id:
            old_status = task["status"]
            task["status"] = status
            
            if status == "completed" and old_status != "completed":
                student_db["xp"] = student_db.get("xp", 0) + 30
                activity_logs_db.append({
                    "action": f"Completed Task: {task['title']}",
                    "category": "tasks",
                    "points_earned": 30,
                    "created_at": datetime.now().isoformat()
                })
                student_db["productivity_score"] = min(100, student_db.get("productivity_score", 0) + 2)
            
            if status == "missed":
                background_tasks.add_task(
                    trigger_n8n_webhook,
                    workflow_id=5,
                    payload={
                        "action": "task_missed",
                        "task": task,
                        "student_phone": student_db.get("phone_number", "+917892713876")
                    }
                )
            return task
            
    raise HTTPException(status_code=404, detail="Task not found")

# --- 3. STUDY BUDDY NOTES, FLASHCARDS, QUIZZES API ---
@app.get("/api/notes")
async def get_notes():
    student = await get_active_student_details()
    if not student:
        return []
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        notes = await supabase_get("study_notes", {"student_id": f"eq.{student['id']}"})
        if notes:
            return notes
        return []
    return notes_db

@app.post("/api/notes/upload")
async def upload_note(note_in: NotesCreate, background_tasks: BackgroundTasks):
    new_note_id = str(uuid.uuid4())
    student = await get_active_student_details()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    student_id = student["id"]
    student_phone = student["phone_number"]

    summary_text = f"Study guide focusing on core components of {note_in.title}. This document lists definitions, mechanisms, and diagnostic criteria."
    new_note = {
        "id": new_note_id,
        "student_id": student_id,
        "subject": note_in.subject,
        "title": note_in.title,
        "pages_count": note_in.pages_count,
        "upload_date": datetime.now().isoformat(),
        "summary": summary_text
    }
    
    # Generate study materials
    generated_fc = generate_flashcards_from_text(note_in.subject, note_in.title, note_in.content)
    generated_qz = generate_quiz_from_text(note_in.subject, note_in.title, note_in.content)
    
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        # Sync note
        await supabase_post("study_notes", new_note)
        # Sync flashcards
        for fc in generated_fc:
            await supabase_post("flashcards", {
                "id": str(uuid.uuid4()),
                "note_id": new_note_id,
                "student_id": student_id,
                "question": fc.get("question", "Question"),
                "answer": fc.get("answer", "Answer"),
                "difficulty": fc.get("difficulty", "medium")
            })
        # Sync quiz
        await supabase_post("quizzes", {
            "id": str(uuid.uuid4()),
            "student_id": student_id,
            "subject": note_in.subject,
            "title": f"Review Quiz: {note_in.title}",
            "time_limit_minutes": 15,
            "questions": generated_qz
        })
        # Log study event
        await supabase_post("activity_logs", {
            "student_id": student_id,
            "action": f"Uploaded Notes: {note_in.title} & Generated Assets",
            "category": "study",
            "points_earned": 25
        })
        # Add XP
        await supabase_patch("students", {"id": f"eq.{student_id}"}, {"xp": student["xp"] + 25})
    else:
        # Local state fallback
        notes_db.append(new_note)
        for fc in generated_fc:
            flashcards_db.append({
                "id": str(uuid.uuid4()),
                "note_id": new_note_id,
                "question": fc.get("question", "Question"),
                "answer": fc.get("answer", "Answer"),
                "difficulty": fc.get("difficulty", "medium")
            })
        quizzes_db.append({
            "id": str(uuid.uuid4()),
            "subject": note_in.subject,
            "title": f"Review Quiz: {note_in.title}",
            "time_limit_minutes": 15,
            "questions": generated_qz
        })
        activity_logs_db.append({
            "action": f"Uploaded Notes: {note_in.title} & Generated Assets",
            "category": "study",
            "points_earned": 25,
            "created_at": datetime.now().isoformat()
        })
        student_db["xp"] = student_db.get("xp", 0) + 25
        
    # Trigger n8n Workflow 2: Study session generated & notification dispatched
    background_tasks.add_task(
        trigger_n8n_webhook,
        workflow_id=2,
        payload={
            "action": "study_note_processed",
            "subject": note_in.subject,
            "title": note_in.title,
            "flashcard_count": len(generated_fc),
            "student_phone": student_phone
        }
    )
    
    return {"note": new_note, "flashcards": len(generated_fc)}

@app.get("/api/flashcards")
async def get_flashcards(note_id: Optional[str] = None):
    student = await get_active_student_details()
    if not student:
        return []
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        if note_id:
            return await supabase_get("flashcards", {"student_id": f"eq.{student['id']}", "note_id": f"eq.{note_id}"}) or []
        return await supabase_get("flashcards", {"student_id": f"eq.{student['id']}"}) or []
    if note_id:
        return [fc for fc in flashcards_db if fc["note_id"] == note_id]
    return flashcards_db

@app.get("/api/quizzes")
async def get_quizzes():
    student = await get_active_student_details()
    if not student:
        return []
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        return await supabase_get("quizzes", {"student_id": f"eq.{student['id']}"}) or []
    return quizzes_db

@app.post("/api/chat-with-notes")
async def chat_with_notes_endpoint(input_data: ChatMessageInput):
    note = None
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        notes = await supabase_get("study_notes", {"id": f"eq.{input_data.note_id}"})
        if notes and len(notes) > 0:
            note = notes[0]
    else:
        note = next((n for n in notes_db if n["id"] == input_data.note_id), None)
        
    if not note:
        raise HTTPException(status_code=404, detail="Notes resource not found")
        
    response = chat_with_notes_response(
        note["subject"],
        note["title"],
        note["summary"],
        input_data.message,
        input_data.history
    )
    return {"reply": response}

# --- 4. PLACEMENT COACH API ---
@app.get("/api/placements")
async def get_placements():
    student = await get_active_student_details()
    if not student:
        return []
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        return await supabase_get("placements", {"student_id": f"eq.{student['id']}"}) or []
    return placements_db

@app.post("/api/placements")
async def create_placement(placement_in: PlacementCreate, background_tasks: BackgroundTasks):
    student = await get_active_student_details()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    student_id = student["id"]
    student_phone = student["phone_number"]
            
    new_pl = {
        "id": str(uuid.uuid4()),
        "student_id": student_id,
        "company_name": placement_in.company_name,
        "role": placement_in.role,
        "status": placement_in.status,
        "interview_date": placement_in.interview_date,
        "progress": 30 if placement_in.status == "interviewing" else 10,
        "company_logo": placement_in.company_name.lower(),
        "interview_pattern": "Technical Interview and Behavioral Rounds",
        "difficulty": "medium",
        "popular_topics": ["Data Structures", "Algorithms", "Mock Simulator Prep"],
        "roadmap": ["Solve recent interview questions", "Take AI mock simulator sessions"]
    }
    
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        await supabase_post("placements", new_pl)
        await supabase_post("activity_logs", {
            "student_id": student_id,
            "action": f"Added Placement application: {placement_in.company_name}",
            "category": "placement",
            "points_earned": 15
        })
        await supabase_patch("students", {"id": f"eq.{student_id}"}, {"xp": student["xp"] + 15})
    else:
        placements_db.append(new_pl)
        activity_logs_db.append({
            "action": f"Added Placement application: {placement_in.company_name}",
            "category": "placement",
            "points_earned": 15,
            "created_at": datetime.now().isoformat()
        })
        student_db["xp"] = student_db.get("xp", 0) + 15
        
    # n8n workflow trigger (Workflow 3: Calendar blocks and daily alerts)
    if placement_in.interview_date:
        background_tasks.add_task(
            trigger_n8n_webhook,
            workflow_id=3,
            payload={
                "action": "placement_interview_scheduled",
                "company_name": placement_in.company_name,
                "role": placement_in.role,
                "interview_date": placement_in.interview_date,
                "student_phone": student_phone
            }
        )
        
    return new_pl

@app.post("/api/interview-simulator")
def interview_simulator(input_data: InterviewMessageInput):
    response = placement_interview_simulator(
        input_data.company_name,
        input_data.role,
        input_data.message,
        input_data.history
    )
    return {"reply": response}

@app.get("/api/assessments")
async def get_assessments():
    student = await get_active_student_details()
    if not student:
        return []
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        return await supabase_get("assessments", {"student_id": f"eq.{student['id']}"}) or []
    return assessments_db

@app.post("/api/assessments")
async def submit_assessment(type: str, title: str, score: int):
    student = await get_active_student_details()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    student_id = student["id"]
            
    feedback = f"Assessment submitted with a score of {score}%. "
    if score >= 80:
        feedback += "Excellent performance! Focus on advanced algorithmic variations."
    else:
        feedback += "Good effort. Review basic concepts and optimize time-complexities."
        
    new_assess = {
        "id": str(uuid.uuid4()),
        "student_id": student_id,
        "type": type,
        "title": title,
        "score": score,
        "performance_data": {"accuracy": score, "time_spent_min": 30},
        "strengths": ["Basic implementations"],
        "weaknesses": ["Complex Edge cases"],
        "ai_feedback": feedback
    }
    
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        await supabase_post("assessments", new_assess)
        await supabase_post("activity_logs", {
            "student_id": student_id,
            "action": f"Finished Quiz/Mock: {title} ({score}%)",
            "category": "placement",
            "points_earned": 40
        })
        await supabase_patch("students", {"id": f"eq.{student_id}"}, {"xp": student["xp"] + 40})
    else:
        assessments_db.append(new_assess)
        activity_logs_db.append({
            "action": f"Finished Quiz/Mock: {title} ({score}%)",
            "category": "placement",
            "points_earned": 40,
            "created_at": datetime.now().isoformat()
        })
        student_db["xp"] = student_db.get("xp", 0) + 40
        
    return new_assess

# --- 5. SPOTIFY WRAPPED WEEKLY REPORTS API ---
@app.get("/api/reports/wrapped")
async def get_wrapped_report():
    student = await get_active_student_details()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    completed_count = 0
    total_tasks = 0
    
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        tasks = await supabase_get("tasks", {"student_id": f"eq.{student['id']}"})
        if tasks:
            total_tasks = len(tasks)
            completed_count = len([t for t in tasks if t["status"] == "completed"])
    else:
        total_tasks = len(tasks_db)
        completed_count = len([t for t in tasks_db if t["status"] == "completed"])
        
    study_hours = 22.5
    avg_score = 78
    weaknesses = ["Graphs", "Dynamic Programming"]
    
    ai_summary = get_weekly_report_summary(completed_count, study_hours, avg_score, weaknesses)
    
    return {
        "week_start": (datetime.now() - timedelta(days=7)).date().isoformat(),
        "tasks_completed": completed_count,
        "study_time_hours": study_hours,
        "avg_assessment_score": avg_score,
        "interview_readiness": 65,
        "ai_summary": ai_summary,
        "details": {
            "completion_rate": int((completed_count / max(1, total_tasks)) * 100),
            "study_duration_split": {"CN": 8, "OS": 7.5, "DSA": 7},
            "achievements_count": 4
        }
    }

if __name__ == "__main__":
    import uvicorn
    # Read host and port from env
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host=host, port=port)
