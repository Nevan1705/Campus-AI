import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Setup Groq client if key is available
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = None
if GROQ_API_KEY:
    try:
        client = Groq(api_key=GROQ_API_KEY)
    except Exception as e:
        print(f"Error initializing Groq client: {e}")

def call_llm(system_prompt: str, user_prompt: str, response_format_json: bool = False) -> str:
    """Helper to query Groq Cloud LLM (Llama 3.1 8b) or fallback to static templates."""
    if client:
        try:
            kwargs = {
                "model": "llama-3.1-8b-instant",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.3
            }
            if response_format_json:
                kwargs["response_format"] = {"type": "json_object"}
            
            chat_completion = client.chat.completions.create(**kwargs)
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Groq API Call failed: {e}. Falling back to default responses.")
            
    # Mock implementations if API fails or is not provided
    return ""

def analyze_task_risk(title: str, subject: str, description: str, deadline_str: str) -> dict:
    """Evaluates task deadline risk, returning a score (0-100) and analysis string."""
    system_p = "You are CampusFlow AI Risk Assessor. Evaluate the student task details and provide a JSON response with keys 'risk_score' (int 0-100) and 'analysis' (str brief assessment)."
    user_p = f"Task: {title}\nSubject: {subject}\nDescription: {description}\nDeadline: {deadline_str}"
    
    response = call_llm(system_p, user_p, response_format_json=True)
    if response:
        try:
            return json.loads(response)
        except Exception:
            pass
            
    # Rich mock fallback
    if "Networks" in subject or "UDP" in title or "protocol" in description:
        return {
            "risk_score": 45,
            "analysis": "The project requires extensive socket programming. You have completed the base setup but have not coded the congestion window controls. High risk if postponed past tomorrow."
        }
    elif "DP" in title or "Algorithms" in subject or "Knapsack" in description:
        return {
            "risk_score": 15,
            "analysis": "Low risk. The topics are well-rehearsed, but completing it soon maintains your DAA performance profile."
        }
    else:
        return {
            "risk_score": 30,
            "analysis": "Moderate risk. This task has standard complexity. Getting started early is recommended to ensure you meet the deadline stress-free."
        }

def generate_flashcards_from_text(subject: str, topic: str, content: str) -> list:
    """Generates an array of flashcards with 'question', 'answer', and 'difficulty' keys."""
    system_p = "You are CampusFlow Study Buddy. Generate a list of 4-5 study flashcards based on the provided text in JSON format with key 'flashcards' containing items with 'question', 'answer', 'difficulty' ('easy', 'medium', 'hard')."
    user_p = f"Subject: {subject}\nTopic: {topic}\nText: {content}"
    
    response = call_llm(system_p, user_p, response_format_json=True)
    if response:
        try:
            data = json.loads(response)
            if "flashcards" in data:
                return data["flashcards"]
            return data
        except Exception:
            pass
            
    # Mock flashcards
    return [
        {
            "question": f"What is the primary objective of {topic} in {subject}?",
            "answer": f"To optimize system resource management and guarantee structured flow controls.",
            "difficulty": "easy"
        },
        {
            "question": f"Explain a common bottleneck in {topic}.",
            "answer": "Congestion issues and delays due to synchronization locks or high traffic overhead.",
            "difficulty": "medium"
        },
        {
            "question": f"Detail a design pattern or algorithm used to resolve {topic} failures.",
            "answer": "Implementing sliding window flow checks or backoff algorithms to prevent gridlocks.",
            "difficulty": "hard"
        }
    ]

def generate_quiz_from_text(subject: str, topic: str, content: str) -> list:
    """Generates a LeetCode-style quiz with multiple choice questions."""
    system_p = "You are CampusFlow Study Buddy. Generate a list of 3-4 multiple-choice quiz questions based on the text. Return a JSON response with key 'questions' containing items with 'id', 'question', 'options' (array of 4 strings), and 'correctAnswer' (matching one option exactly)."
    user_p = f"Subject: {subject}\nTopic: {topic}\nText: {content}"
    
    response = call_llm(system_p, user_p, response_format_json=True)
    if response:
        try:
            data = json.loads(response)
            if "questions" in data:
                return data["questions"]
            return data
        except Exception:
            pass
            
    # Mock questions
    return [
        {
            "id": 1,
            "question": f"Which of the following is core to {topic}?",
            "options": ["High latency processing", "Resource optimization", "Stateless loops", "Static buffers"],
            "correctAnswer": "Resource optimization"
        },
        {
            "id": 2,
            "question": f"How is performance measured in a typical {subject} {topic} setup?",
            "options": ["By lines of code written", "Using CPU idle time only", "Throughput, response time, and efficiency", "By the number of databases used"],
            "correctAnswer": "Throughput, response time, and efficiency"
        }
    ]

def chat_with_notes_response(subject: str, title: str, summary: str, user_message: str, chat_history: list) -> str:
    """Answers student queries contextually based on note details and previous messages."""
    system_p = f"You are CampusFlow Study Buddy, an interactive tutor. Answer the student's question relative to the note details.\nNote Subject: {subject}\nNote Title: {title}\nNote Summary: {summary}"
    
    formatted_history = ""
    for msg in chat_history[-6:]:
        role = "Student" if msg["sender"] == "user" else "Study Buddy"
        formatted_history += f"{role}: {msg['text']}\n"
        
    user_p = f"{formatted_history}Student: {user_message}\nStudy Buddy:"
    
    response = call_llm(system_p, user_p)
    if response:
        return response
        
    # Simulated contextual response
    user_msg_lower = user_message.lower()
    if "hello" in user_msg_lower or "hi " in user_msg_lower or user_msg_lower == "hi":
        return f"Hey! I'm ready to help you study '{title}'. Ask me any questions about CPU scheduling, congestion control, or whatever you need to revise!"
    elif "tcp" in user_msg_lower or "udp" in user_msg_lower or "handshake" in user_msg_lower:
        return f"Regarding your question, TCP uses a 3-way handshake (SYN, SYN-ACK, ACK) to establish connection state, which provides reliability, whereas UDP is connectionless and sends datagrams without checks. In the context of your notes on '{title}', this is why congestion controls are implemented over TCP."
    elif "scheduling" in user_msg_lower or "starvation" in user_msg_lower:
        return f"In process management scheduling, starvation occurs when a process is perpetually denied CPU time because higher-priority processes keep arriving. We can solve this with 'Aging', which gradually increases the priority of processes waiting in the queue."
    else:
        return f"That's an interesting question about {subject}! Based on '{title}', we should note how resources are bounded and structured. Let me know if you want me to generate a 3-question quick quiz or break down this concept into bite-sized summaries."

def generate_dashboard_insights(tasks_pending: int, placement_count: int, days_to_interview: int, weakest_topic: str) -> dict:
    """Generates AI insights for the dashboard smart card."""
    system_p = "You are CampusFlow Personal Coach. Analyze the student's academic status and output a JSON response containing 'insights' (list of 3 bullet strings) and 'recommendations' (list of 3 task actions)."
    user_p = f"Pending Tasks: {tasks_pending}\nPlacements Active: {placement_count}\nDays until next big interview: {days_to_interview}\nWeakest placement assessment topic: {weakest_topic}"
    
    response = call_llm(system_p, user_p, response_format_json=True)
    if response:
        try:
            return json.loads(response)
        except Exception:
            pass
            
    # Mock dashboard insights
    return {
        "insights": [
            f"You have {tasks_pending} pending tasks that require focus this week.",
            f"Your Amazon interview is in {days_to_interview} days. Preparation is key!",
            f"Recent mock assessments suggest reviewing {weakest_topic} to boost score averages."
        ],
        "recommendations": [
            "Complete CN Course Project (Due in 3 days)",
            f"Schedule a Mock {weakest_topic} coding sprint",
            "Revise Operating Systems Scheduling algorithms"
        ]
    }

def placement_interview_simulator(company_name: str, role: str, message: str, chat_history: list) -> str:
    """Simulates a LeetCode-style or HR interview based on user answers and role description."""
    system_p = f"You are a Senior Engineer interviewing the student for the {role} position at {company_name}. Ask technical questions (coding, algorithms, architecture) and behavioral questions. Keep responses short and conversational. Give constructive feedback on user answers when appropriate, then ask the next question."
    
    formatted_history = ""
    for msg in chat_history[-6:]:
        role_label = "Student" if msg["sender"] == "user" else "Interviewer"
        formatted_history += f"{role_label}: {msg['text']}\n"
        
    user_p = f"{formatted_history}Student: {message}\nInterviewer:"
    
    response = call_llm(system_p, user_p)
    if response:
        return response
        
    # Simulated Interview dialogue
    if len(chat_history) <= 1:
        return f"Welcome, Nevan! Thank you for taking the time to speak with us today. Let's start with a standard data structure question. Can you tell me how you would design an efficient system to find the top k elements in a streaming data source, and what the time complexity would be?"
    
    msg_lower = message.lower()
    if "heap" in msg_lower or "priority queue" in msg_lower or "k log" in msg_lower:
        return "That's exactly correct. Using a min-heap of size k allows you to process elements in O(log k) time. Now, let's pivot. Amazon values leadership principles. Tell me about a time you faced a difficult coding block during a group project, and how you navigated it with your team?"
    elif "star" in msg_lower or "situation" in msg_lower or "managed" in msg_lower or "conflict" in msg_lower:
        return "Excellent application of ownership and delivering results. For the final technical question: in an operating system, how does a virtual memory page table work, and what is the role of the Translation Lookaside Buffer (TLB)?"
    else:
        return "Interesting response. Heaps or sorting would indeed be key. Let's dig deeper: how would you optimize the memory footprint if the stream contained billions of elements and memory was highly constrained?"

def get_weekly_report_summary(completed_count: int, study_hours: float, accuracy: int, weaknesses: list) -> str:
    """Generates a Spotify Wrapped style weekly productivity wrap summary."""
    system_p = "You are CampusFlow Analyst. Create a Spotify Wrapped style summary (2-3 sentences max) celebrating the student's accomplishments, highlighting key statistics, and urging them to focus on weaker areas."
    user_p = f"Tasks Completed: {completed_count}\nStudy Hours: {study_hours}\nMock Assessment Accuracy: {accuracy}%\nWeaknesses: {', '.join(weaknesses)}"
    
    response = call_llm(system_p, user_p)
    if response:
        return response
        
    # Mock Spotify Wrapped style report summary
    return f"This week you completed {completed_count} tasks and logged {study_hours} study hours with a stellar {accuracy}% mock assessment score! You crushed graph traversals, but keep focusing on {', '.join(weaknesses)} to level up your score next week."
