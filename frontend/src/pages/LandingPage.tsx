import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  MessageSquare, 
  Sparkles, 
  Calendar, 
  Award, 
  ShieldCheck, 
  Zap, 
  Bot, 
  ChevronRight,
  UserCheck
} from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-textMain selection:bg-primaryAccent/30 relative overflow-hidden flex flex-col justify-between">
      
      {/* BACKGROUND GLOW ACCENTS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primaryAccent/10 rounded-full blur-[120px] -translate-y-1/2 -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondaryAccent/10 rounded-full blur-[120px] translate-y-1/2 -z-10" />
      
      {/* 1. TOP HEADER */}
      <header className="container mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="bg-primaryAccent/20 p-2 rounded-xl text-primaryAccent border border-primaryAccent/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg tracking-wider font-sans bg-clip-text text-transparent bg-gradient-to-r from-textMain to-secondaryAccent">
            CAMPUSFLOW AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/auth" className="text-sm font-semibold text-textMuted hover:text-textMain transition-colors">
            Login
          </Link>
          <Link to="/auth?mode=register" className="bg-primaryAccent hover:bg-primaryAccent/90 px-4 py-2 rounded-xl text-xs font-bold shadow-neon-purple transition-all flex items-center gap-1.5">
            Get Started <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <main className="container mx-auto px-6 py-12 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 z-10">
        
        {/* Left Copy */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-primaryAccent/10 border border-primaryAccent/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-primaryAccent">
            <Zap className="w-3.5 h-3.5" /> THE HACKATHON EDITION
          </div>
          
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight font-sans leading-none">
            Never Miss A <br className="hidden md:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primaryAccent via-secondaryAccent to-success">
              Deadline Again.
            </span>
          </h2>
          
          <p className="text-sm md:text-base text-textMuted leading-relaxed max-w-xl mx-auto lg:mx-0">
            CampusFlow AI is your personal academic and placement copilot. We help you manage coursework, generate smart study assets, and simulate real technical interviews using state-of-the-art AI, n8n automations, Google Calendar sync, and direct WhatsApp reminders.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link 
              to="/auth?mode=register" 
              className="w-full sm:w-auto bg-gradient-to-r from-primaryAccent to-secondaryAccent px-8 py-3.5 rounded-2xl font-extrabold text-sm shadow-neon-purple hover:scale-105 transition-all flex items-center justify-center gap-2 group"
            >
              Get Started Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#features" 
              className="w-full sm:w-auto bg-cardBg border border-borderColor hover:border-textMuted px-8 py-3.5 rounded-2xl font-bold text-sm text-textMuted hover:text-textMain transition-colors flex items-center justify-center"
            >
              Explore Copilot Features
            </a>
          </div>

          {/* Quick Statistics Banner */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-borderColor/40 max-w-md mx-auto lg:mx-0">
            <div>
              <p className="text-2xl font-black text-textMain leading-none">94%</p>
              <p className="text-[10px] text-textMuted mt-1 font-bold uppercase tracking-wider">Placement Rate</p>
            </div>
            <div>
              <p className="text-2xl font-black text-textMain leading-none">10x</p>
              <p className="text-[10px] text-textMuted mt-1 font-bold uppercase tracking-wider">Study Speed</p>
            </div>
            <div>
              <p className="text-2xl font-black text-textMain leading-none">0</p>
              <p className="text-[10px] text-textMuted mt-1 font-bold uppercase tracking-wider">Missed Tasks</p>
            </div>
          </div>
        </div>

        {/* Right Feature Interactive Mock Widget */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none">
          <div className="bg-cardBg border border-borderColor/80 shadow-glass rounded-3xl p-6 relative overflow-hidden group">
            {/* Discord Header Style */}
            <div className="flex items-center justify-between pb-4 border-b border-borderColor mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-danger" />
                <div className="w-3.5 h-3.5 rounded-full bg-warning" />
                <div className="w-3.5 h-3.5 rounded-full bg-success" />
              </div>
              <span className="text-[10px] font-mono text-textMuted bg-background px-2.5 py-1 rounded-md">n8n-active-nodes: 5/5</span>
            </div>

            {/* Simulated WhatsApp Notification Mockup Card */}
            <div className="space-y-4">
              
              {/* WhatsApp Notification Bubble */}
              <div className="bg-secBackground border border-success/30 p-4 rounded-2xl flex gap-3 relative shadow-inner">
                <div className="bg-success/20 p-2 h-10 w-10 shrink-0 rounded-xl text-success flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-success">WhatsApp Notification</h5>
                    <span className="text-[9px] text-textMuted">Just now</span>
                  </div>
                  <p className="text-xs text-textMuted leading-snug">
                    "Hey Nevan! 🚀 Your **CN Project Submission** is in 24h. AI Risk analysis shows high risk due to missing UDP socket handlers. We scheduled a 2hr focus block in your Calendar."
                  </p>
                </div>
              </div>

              {/* Study Buddy Card */}
              <div className="bg-secBackground border border-primaryAccent/30 p-4 rounded-2xl flex gap-3 shadow-inner">
                <div className="bg-primaryAccent/20 p-2 h-10 w-10 shrink-0 rounded-xl text-primaryAccent flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-primaryAccent">Study Buddy Copilot</h5>
                    <span className="text-[9px] text-textMuted">Pending Analysis</span>
                  </div>
                  <p className="text-xs text-textMuted leading-snug">
                    "PDF upload completed. Generated **12 Flashcards** and **1 LeetCode-style scheduler challenge**."
                  </p>
                </div>
              </div>

              {/* Placement Prep Card */}
              <div className="bg-secBackground border border-secondaryAccent/30 p-4 rounded-2xl flex gap-3 shadow-inner">
                <div className="bg-secondaryAccent/20 p-2 h-10 w-10 shrink-0 rounded-xl text-secondaryAccent flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-secondaryAccent">Placement Coach</h5>
                    <span className="text-[9px] text-textMuted">Active</span>
                  </div>
                  <p className="text-xs text-textMuted leading-snug">
                    "Amazon SDE mock interview simulated score: **82%**. Strengthen: Graphs. Focus: Starvation loops."
                  </p>
                </div>
              </div>

            </div>

            {/* Hover Background Ring */}
            <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-primaryAccent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover:bg-primaryAccent/10 transition-all duration-500" />
          </div>
        </div>

      </main>

      {/* 3. FEATURES LIST */}
      <section id="features" className="container mx-auto px-6 py-12 border-t border-borderColor/40 z-10">
        <h4 className="text-center text-xs font-bold text-textMuted uppercase tracking-widest mb-10">Platform Integrations</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-cardBg border border-borderColor/50 p-6 rounded-2xl">
            <MessageSquare className="w-6 h-6 text-success mb-3" />
            <h5 className="text-sm font-bold text-textMain mb-1">WhatsApp Reminders</h5>
            <p className="text-xs text-textMuted leading-relaxed">Direct notification alerts for calendar locks, homework items, and daily streak progress.</p>
          </div>

          <div className="bg-cardBg border border-borderColor/50 p-6 rounded-2xl">
            <Sparkles className="w-6 h-6 text-primaryAccent mb-3" />
            <h5 className="text-sm font-bold text-textMain mb-1">AI Study Buddy</h5>
            <p className="text-xs text-textMuted leading-relaxed">Summarize PDF study handouts. Quizlet-style flashcards and LeetCode multiple-choice challenges.</p>
          </div>

          <div className="bg-cardBg border border-borderColor/50 p-6 rounded-2xl">
            <Award className="w-6 h-6 text-secondaryAccent mb-3" />
            <h5 className="text-sm font-bold text-textMain mb-1">Placement Coach</h5>
            <p className="text-xs text-textMuted leading-relaxed">Simulated technical interviews with real-time conversations, score sheets, and feedback.</p>
          </div>

          <div className="bg-cardBg border border-borderColor/50 p-6 rounded-2xl">
            <Calendar className="w-6 h-6 text-warning mb-3" />
            <h5 className="text-sm font-bold text-textMain mb-1">Google Calendar sync</h5>
            <p className="text-xs text-textMuted leading-relaxed">Synchronize academic project deliverables and recovery blocks straight to your agenda.</p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-6 border-t border-borderColor/40 bg-secBackground">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-textMuted gap-4">
          <p>© 2026 CampusFlow AI. Developed for Academic & Placement Success.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-textMain transition-colors">Privacy</a>
            <a href="#" className="hover:text-textMain transition-colors">Terms</a>
            <a href="#" className="hover:text-textMain transition-colors">System Diagnostics</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
