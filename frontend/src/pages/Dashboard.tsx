import React, { useEffect, useState } from 'react';
import { useStudent } from '../context/StudentContext';
import { 
  Sparkles, 
  Flame, 
  CheckSquare, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  Briefcase, 
  Clock, 
  ChevronRight,
  TrendingDown,
  Award
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { student, tasks, placements, assessments, loading } = useStudent();
  const [aiInsights, setAiInsights] = useState<{ insights: string[]; recommendations: any[] }>({
    insights: [
      "You have 2 pending tasks that require focus this week.",
      "Your Amazon interview is in 4 days. Preparation is key!",
      "Recent mock assessments suggest reviewing Graphs to boost score averages."
    ],
    recommendations: [
      "CN Project Submission",
      "Amazon DSA Graph traversals",
      "OS Revision cpu schedules"
    ]
  });

  const [insightsLoading, setInsightsLoading] = useState(true);

  // Fetch AI Insights
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setInsightsLoading(true);
        const res = await fetch('/api/dashboard/insights');
        if (res.ok) {
          const data = await res.json();
          setAiInsights(data);
        }
      } catch (err) {
        console.warn("AI Insights backend lookup failed. Render defaults.");
      } finally {
        setInsightsLoading(false);
      }
    };
    fetchInsights();
  }, [tasks, placements]);

  // Aggregate stats
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const interviewTasks = placements.filter(p => p.status === 'interviewing');

  // Streak Calendar Dates (Mock)
  const currentWeekDays = [
    { day: 'Mon', active: true, label: 'Completed' },
    { day: 'Tue', active: true, label: 'Completed' },
    { day: 'Wed', active: true, label: 'Completed' },
    { day: 'Thu', active: true, label: 'Today' },
    { day: 'Fri', active: false, label: 'Upcoming' },
    { day: 'Sat', active: false, label: 'Upcoming' },
    { day: 'Sun', active: false, label: 'Upcoming' }
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. WELCOME HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome Back, {student?.name || "Student"} 👋
          </h2>
          <p className="text-xs text-textMuted font-medium">
            Here is your personalized academic status and AI coaching guidelines for today.
          </p>
        </div>
        
        {/* Level Banner badge */}
        <div className="bg-gradient-to-r from-primaryAccent to-secondaryAccent p-[1px] rounded-2xl w-fit">
          <div className="bg-background px-4 py-2 rounded-2xl flex items-center gap-3">
            <span className="text-xs font-bold text-textMuted uppercase tracking-wider">Level Status</span>
            <div className="bg-primaryAccent/20 px-2.5 py-1 rounded-lg text-primaryAccent font-black text-sm">
              Lvl {student?.level || 1}
            </div>
          </div>
        </div>
      </div>

      {/* 2. GRID - AI INSIGHTS CARD & STREAK WIDGET */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI SMART CARD (Glassmorphism layout) */}
        <div className="lg:col-span-2 bg-cardBg border border-borderColor/80 shadow-glass rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primaryAccent/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primaryAccent/10 transition-all" />
          
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-primaryAccent/15 p-2 rounded-xl text-primaryAccent">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <h3 className="font-extrabold text-sm text-textMain uppercase tracking-wider">⚡ AI Copilot Insights</h3>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-textMuted font-bold mb-2">CURRENT OVERVIEW</p>
              <ul className="space-y-2">
                {(aiInsights?.insights || []).map((insight, idx) => (
                  <li key={idx} className="text-xs text-textMain flex items-start gap-2.5 leading-relaxed">
                    <span className="text-primaryAccent font-bold">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-borderColor">
              <p className="text-xs text-textMuted font-bold mb-2">RECOMMENDED DAILY FOCUS</p>
              <div className="flex flex-wrap gap-2">
                {(aiInsights?.recommendations || []).map((rec: any, idx) => (
                  <span 
                    key={idx}
                    className="bg-secBackground border border-borderColor hover:border-primaryAccent px-3 py-1.5 rounded-xl text-xs font-semibold text-textMain flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-secondaryAccent" />
                    {typeof rec === 'object' && rec !== null ? (
                      <span className="flex items-center gap-1.5">
                        <span>{rec.task}</span>
                        {rec.urgency && (
                          <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            rec.urgency.toLowerCase() === 'high' 
                              ? 'bg-danger/25 text-danger border border-danger/10' 
                              : 'bg-warning/25 text-warning border border-warning/10'
                          }`}>
                            {rec.urgency}
                          </span>
                        )}
                      </span>
                    ) : (
                      rec
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* STREAK CALENDAR & GAMIFIED STATS */}
        <div className="bg-cardBg border border-borderColor/80 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-textMain uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-warning fill-warning" /> STREAK CALENDAR
              </h3>
              <span className="text-[10px] text-warning bg-warning/10 border border-warning/20 px-2.5 py-0.5 rounded-full font-bold">
                5 DAY STREAK
              </span>
            </div>
            
            <p className="text-xs text-textMuted leading-relaxed mb-4">
              Maintain your streak by completing at least one academic task or quiz session daily!
            </p>

            {/* Streak Grid Days */}
            <div className="grid grid-cols-7 gap-2">
              {currentWeekDays.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border ${
                    day.active 
                      ? 'bg-warning/20 border-warning text-warning shadow-inner' 
                      : day.label === 'Today'
                      ? 'bg-cardBg border-primaryAccent text-primaryAccent border-2 animate-pulse'
                      : 'bg-secBackground border-borderColor text-textMuted'
                  }`}>
                    {day.day.substring(0, 1)}
                  </div>
                  <span className="text-[9px] text-textMuted font-medium">{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-borderColor mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primaryAccent" />
              <div>
                <p className="text-xs font-bold">Today's Schedule</p>
                <p className="text-[10px] text-textMuted">2 Revision topics planned</p>
              </div>
            </div>
            <button className="bg-secBackground hover:bg-borderColor p-2 rounded-xl text-textMain transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 3. QUICK STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Pending tasks */}
        <div className="bg-cardBg border border-borderColor p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1">Pending Tasks</p>
            <h4 className="text-2xl font-black text-textMain leading-none">{pendingTasks.length}</h4>
          </div>
          <div className="bg-primaryAccent/10 p-2.5 rounded-xl text-primaryAccent">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Completed tasks */}
        <div className="bg-cardBg border border-borderColor p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1">Completed Tasks</p>
            <h4 className="text-2xl font-black text-textMain leading-none">{completedTasks.length}</h4>
          </div>
          <div className="bg-success/10 p-2.5 rounded-xl text-success">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Study Sessions */}
        <div className="bg-cardBg border border-borderColor p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1">Study Notes</p>
            <h4 className="text-2xl font-black text-textMain leading-none">2</h4>
          </div>
          <div className="bg-secondaryAccent/10 p-2.5 rounded-xl text-secondaryAccent">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Mock Interviews */}
        <div className="bg-cardBg border border-borderColor p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1">Active Placements</p>
            <h4 className="text-2xl font-black text-textMain leading-none">{interviewTasks.length}</h4>
          </div>
          <div className="bg-warning/10 p-2.5 rounded-xl text-warning">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        {/* Productivity Percentage */}
        <div className="bg-cardBg border border-borderColor p-4 rounded-2xl flex items-center justify-between col-span-2 md:col-span-1">
          <div>
            <p className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1">Productivity Score</p>
            <h4 className="text-2xl font-black text-textMain leading-none">{student?.productivity_score || 0}%</h4>
          </div>
          <div className="bg-success/10 p-2.5 rounded-xl text-success">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 4. TODAY'S STUDY PLAN & TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Today's study plan */}
        <div className="bg-cardBg border border-borderColor rounded-3xl p-6">
          <h3 className="font-extrabold text-sm text-textMain uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primaryAccent" /> TODAY'S STUDY PLAN
          </h3>
          
          <div className="space-y-3">
            <div className="bg-secBackground border-l-4 border-primaryAccent p-4 rounded-r-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-primaryAccent font-bold uppercase">9:00 AM - 11:30 AM</span>
                <h4 className="text-xs font-extrabold text-textMain mt-1">Computer Networks Project Implementation</h4>
                <p className="text-[10px] text-textMuted">Solve congestion control UDP mock testing loops.</p>
              </div>
              <span className="text-xs font-bold text-primaryAccent bg-primaryAccent/10 px-2.5 py-1 rounded-lg">CN</span>
            </div>

            <div className="bg-secBackground border-l-4 border-secondaryAccent p-4 rounded-r-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-secondaryAccent font-bold uppercase">2:00 PM - 3:30 PM</span>
                <h4 className="text-xs font-extrabold text-textMain mt-1">Operating Systems Scheduling Review</h4>
                <p className="text-[10px] text-textMuted">Complete starvation and process scheduling exercises.</p>
              </div>
              <span className="text-xs font-bold text-secondaryAccent bg-secondaryAccent/10 px-2.5 py-1 rounded-lg">OS</span>
            </div>
          </div>
        </div>

        {/* Recent assessments summary */}
        <div className="bg-cardBg border border-borderColor rounded-3xl p-6">
          <h3 className="font-extrabold text-sm text-textMain uppercase tracking-wider mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-secondaryAccent" /> RECENT ASSESSMENT SCORES
          </h3>

          <div className="space-y-4">
            {assessments.slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-secBackground/50 p-4 rounded-2xl border border-borderColor/60">
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-textMain">{item.title}</h4>
                  <p className="text-[10px] text-textMuted">Type: {item.type.toUpperCase()} | Solved: {item.performance_data?.questions_solved ?? 4} questions</p>
                </div>
                <div className={`text-right px-3 py-1.5 rounded-xl ${item.score >= 80 ? 'bg-success/10 text-success border border-success/20' : 'bg-warning/10 text-warning border border-warning/20'}`}>
                  <span className="text-sm font-black">{item.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
