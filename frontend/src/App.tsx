import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Brain, 
  Briefcase, 
  BarChart3, 
  User, 
  Flame, 
  Award, 
  Search, 
  Bell, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { StudentProvider, useStudent } from './context/StudentContext';

// Import Pages (to be created next)
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import StudyBuddy from './pages/StudyBuddy';
import PlacementCoach from './pages/PlacementCoach';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

// App Layout Wrapper
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { student, activityLogs, placements } = useStudent();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Study Buddy', path: '/study', icon: Brain },
    { name: 'Placement Coach', path: '/placement', icon: Briefcase },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const nextInterview = placements.find(p => p.status === 'interviewing');

  return (
    <div className="min-h-screen bg-background text-textMain flex overflow-hidden">
      
      {/* 1. LEFT SIDEBAR (Discord/Linear Inspired) */}
      <aside className="w-64 bg-secBackground border-r border-borderColor flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Header */}
          <div className="p-6 border-b border-borderColor flex items-center gap-3">
            <div className="bg-primaryAccent/20 p-2 rounded-lg text-primaryAccent">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-wider text-textMain font-sans bg-clip-text text-transparent bg-gradient-to-r from-textMain to-secondaryAccent">
                CAMPUSFLOW
              </h1>
              <span className="text-xs text-textMuted font-medium tracking-widest uppercase">
                AI COPILOT
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-primaryAccent/20 text-textMain border-l-4 border-primaryAccent font-semibold shadow-inner' 
                      : 'text-textMuted hover:bg-cardBg hover:text-textMain'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primaryAccent' : 'text-textMuted group-hover:text-primaryAccent transition-colors'}`} />
                    <span className="text-sm tracking-wide">{item.name}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-primaryAccent' : 'text-textMuted'}`} />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Stats Profile Bar bottom */}
        <div className="p-4 border-t border-borderColor bg-cardBg/40 m-3 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primaryAccent to-secondaryAccent flex items-center justify-center font-bold text-sm text-textMain shadow-neon-purple uppercase">
                {(student?.name || "Student").substring(0, 2)}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-success w-3.5 h-3.5 rounded-full border-2 border-secBackground" />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold truncate leading-tight">{student?.name || "Student"}</h4>
              <p className="text-xs text-textMuted truncate">Level {student?.level || 1} Scholar</p>
            </div>
          </div>
          {/* XP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-textMuted font-semibold">
              <span>XP: {student?.xp || 0}</span>
              <span>{(student?.level || 1) * 100} XP</span>
            </div>
            <div className="w-full h-1.5 bg-borderColor rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primaryAccent to-secondaryAccent transition-all duration-500 rounded-full" 
                style={{ width: `${((student?.xp || 0) / ((student?.level || 1) * 100)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* CENTER & RIGHT AREAS */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 2. TOP NAVIGATION */}
        <header className="h-16 bg-secBackground/80 backdrop-blur-md border-b border-borderColor flex items-center justify-between px-6 z-10 shrink-0">
          {/* Search bar */}
          <div className="relative w-80">
            <Search className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search shortcuts, study logs..." 
              className="w-full bg-background border border-borderColor rounded-xl pl-9 pr-4 py-1.5 text-xs text-textMain focus:outline-none focus:border-primaryAccent transition-all glass-input"
            />
          </div>

          {/* Gamified stats & notifications */}
          <div className="flex items-center gap-6">
            
            {/* Streaks Widget */}
            <div className="flex items-center gap-2 bg-warning/10 border border-warning/20 px-3 py-1 rounded-xl cursor-default group hover:bg-warning/20 transition-all">
              <Flame className="w-4 h-4 text-warning fill-warning animate-bounce" />
              <div className="text-right">
                <p className="text-xs font-extrabold text-warning leading-tight">{student?.streak || 0} Days</p>
                <p className="text-[9px] text-textMuted font-medium uppercase tracking-wider">Streak</p>
              </div>
            </div>

            {/* Productivity Widget */}
            <div className="flex items-center gap-2 bg-secondaryAccent/10 border border-secondaryAccent/20 px-3 py-1 rounded-xl cursor-default hover:bg-secondaryAccent/20 transition-all">
              <TrendingUp className="w-4 h-4 text-secondaryAccent" />
              <div className="text-right">
                <p className="text-xs font-extrabold text-secondaryAccent leading-tight">{student?.productivity_score || 0}%</p>
                <p className="text-[9px] text-textMuted font-medium uppercase tracking-wider">Productivity</p>
              </div>
            </div>

            {/* Notification bell */}
            <button className="relative bg-cardBg border border-borderColor p-2.5 rounded-xl hover:border-primaryAccent hover:text-primaryAccent transition-colors">
              <Bell className="w-4 h-4 text-textMuted hover:text-textMain" />
              {nextInterview && (
                <span className="absolute top-1 right-1 bg-danger w-2 h-2 rounded-full ring-2 ring-background animate-ping" />
              )}
            </button>
          </div>
        </header>

        {/* 3. MAIN SCROLLABLE CONTENT BODY */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Main Panel */}
          <main className="flex-1 overflow-y-auto p-6 bg-background">
            {children}
          </main>

          {/* RIGHT NOTIFICATION/ACTIVITY PANEL (Spotify Inspired - only visible on dashboard & profile views) */}
          {['/dashboard', '/profile'].includes(location.pathname) && (
            <aside className="w-72 border-l border-borderColor bg-secBackground overflow-y-auto p-6 hidden xl:block shrink-0">
              
              {/* Placement Alerts */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-textMuted tracking-wider uppercase mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-secondaryAccent" /> PLACEMENT ALERTS
                </h3>
                {nextInterview ? (
                  <div className="bg-cardBg border border-borderColor p-4 rounded-2xl relative overflow-hidden group hover:border-primaryAccent transition-colors">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primaryAccent/5 rounded-full blur-xl -mr-6 -mt-6 group-hover:bg-primaryAccent/10 transition-colors" />
                    <h4 className="text-xs font-extrabold text-primaryAccent uppercase tracking-widest mb-1">INTERVIEW ACTIVE</h4>
                    <p className="text-sm font-bold text-textMain">{nextInterview.company_name}</p>
                    <p className="text-xs text-textMuted mb-3">{nextInterview.role}</p>
                    <div className="bg-background/80 px-3 py-2 rounded-xl text-xs flex justify-between items-center border border-borderColor">
                      <span className="text-textMuted">Countdown:</span>
                      <span className="font-mono text-warning font-bold">4 Days</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-textMuted italic">No scheduled interviews currently active. Apply to roles via Placement Coach!</p>
                )}
              </div>

              {/* Recent Activity Timeline */}
              <div>
                <h3 className="text-xs font-bold text-textMuted tracking-wider uppercase mb-4">
                  RECENT ACTIVITY
                </h3>
                <div className="relative pl-4 border-l border-borderColor space-y-5">
                  {activityLogs.slice(0, 5).map((log, index) => (
                    <div key={index} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[21px] top-1 bg-primaryAccent w-2.5 h-2.5 rounded-full ring-4 ring-secBackground" />
                      <p className="text-xs font-semibold text-textMain leading-tight">{log.action}</p>
                      <div className="flex justify-between text-[10px] text-textMuted mt-1">
                        <span className="capitalize">{log.category}</span>
                        {log.points_earned > 0 && <span className="text-success">+{log.points_earned} XP</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}

        </div>
      </div>
    </div>
  );
};

// Route Controller
const App: React.FC = () => {
  return (
    <StudentProvider>
      <Router>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth System */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Main Dashboard Pages (Protected by routing wrapper layout) */}
          <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/tasks" element={<DashboardLayout><Tasks /></DashboardLayout>} />
          <Route path="/study" element={<DashboardLayout><StudyBuddy /></DashboardLayout>} />
          <Route path="/placement" element={<DashboardLayout><PlacementCoach /></DashboardLayout>} />
          <Route path="/reports" element={<DashboardLayout><Reports /></DashboardLayout>} />
          <Route path="/profile" element={<DashboardLayout><Profile /></DashboardLayout>} />
        </Routes>
      </Router>
    </StudentProvider>
  );
};

export default App;
