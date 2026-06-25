import React from 'react';
import { useStudent } from '../context/StudentContext';
import { 
  Award, 
  Flame, 
  BookOpen, 
  CheckSquare, 
  Mail, 
  Layers, 
  Calendar, 
  Phone, 
  Lock,
  CheckCircle,
  TrendingUp,
  UserCheck
} from 'lucide-react';

const Profile: React.FC = () => {
  const { student, tasks, placements } = useStudent();

  // Achievement Badges
  const badges = [
    { 
      id: 'b1', 
      title: 'First Blood', 
      description: 'Completed your first academic task assignment.', 
      unlocked: true,
      icon: CheckSquare,
      color: 'text-success bg-success/15 border-success/30'
    },
    { 
      id: 'b2', 
      title: 'Task Slayer', 
      description: 'Checked off 10 academic tasks successfully.', 
      unlocked: true,
      icon: Flame,
      color: 'text-warning bg-warning/15 border-warning/30'
    },
    { 
      id: 'b3', 
      title: 'Academic Genius', 
      description: 'Completed your first AI Study Buddy quiz challange.', 
      unlocked: true,
      icon: BookOpen,
      color: 'text-primaryAccent bg-primaryAccent/15 border-primaryAccent/30'
    },
    { 
      id: 'b4', 
      title: 'Amazon Prep Hero', 
      description: 'Simulated SDE mock interview on Placement Coach.', 
      unlocked: true,
      icon: Award,
      color: 'text-secondaryAccent bg-secondaryAccent/15 border-secondaryAccent/30'
    },
    { 
      id: 'b5', 
      title: 'Elite Grad', 
      description: 'Log 50+ hours study logs and maintain average assessment accuracy >90%.', 
      unlocked: false,
      icon: Lock,
      color: 'text-textMuted bg-secBackground border-borderColor'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. STUDENT HERO COVER CARD */}
      <div className="bg-cardBg border border-borderColor rounded-3xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primaryAccent/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primaryAccent/10 transition-all" />
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar Icon */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primaryAccent to-secondaryAccent flex items-center justify-center font-black text-2xl text-textMain shadow-neon-purple uppercase shrink-0">
            {(student?.name || "Student").substring(0, 2)}
          </div>
          
          <div className="space-y-1.5 text-center md:text-left flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight truncate">{student?.name || "Student"}</h2>
              <span className="bg-primaryAccent/10 text-primaryAccent border border-primaryAccent/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit mx-auto md:mx-0">
                Level {student?.level || 1} Scholar
              </span>
            </div>
            
            <p className="text-xs text-textMuted font-medium truncate flex items-center justify-center md:justify-start gap-1">
              <Layers className="w-3.5 h-3.5" /> {student?.branch || "Computer Science"} | Year {student?.year || 1}
            </p>
          </div>
        </div>

        {/* Level Stats breakdown */}
        <div className="mt-6 pt-6 border-t border-borderColor grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-secBackground p-4 rounded-2xl border border-borderColor/60 text-center">
            <span className="text-[9px] text-textMuted font-bold uppercase block">STREAK STATS</span>
            <span className="text-lg font-black text-warning flex justify-center items-center gap-1 mt-1">
              <Flame className="w-5 h-5 fill-warning text-warning" /> {student?.streak || 0} Days
            </span>
          </div>

          <div className="bg-secBackground p-4 rounded-2xl border border-borderColor/60 text-center">
            <span className="text-[9px] text-textMuted font-bold uppercase block">TOTAL XP LOGGED</span>
            <span className="text-lg font-black text-primaryAccent block mt-1">
              {student?.xp || 0} Points
            </span>
          </div>

          <div className="bg-secBackground p-4 rounded-2xl border border-borderColor/60 text-center">
            <span className="text-[9px] text-textMuted font-bold uppercase block">TASKS COMPLETED</span>
            <span className="text-lg font-black text-success block mt-1">
              {tasks.filter(t => t.status === 'completed').length} Tasks
            </span>
          </div>

          <div className="bg-secBackground p-4 rounded-2xl border border-borderColor/60 text-center">
            <span className="text-[9px] text-textMuted font-bold uppercase block">MOCK READINESS</span>
            <span className="text-lg font-black text-secondaryAccent block mt-1">
              {student?.productivity_score || 0}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. PROFILE DETAILS & ENROLLED SUBJECTS */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* General Information card */}
          <div className="bg-cardBg border border-borderColor rounded-3xl p-6">
            <h3 className="font-extrabold text-sm text-textMain uppercase tracking-wider mb-4 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primaryAccent" /> STUDENT DOSSIER
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-textMuted shrink-0" />
                <div className="min-w-0">
                  <span className="text-[9px] text-textMuted font-bold block">EMAIL ADDRESS</span>
                  <p className="text-xs font-semibold text-textMain truncate">{student?.email || "nevan@campusflow.ai"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-textMuted shrink-0" />
                <div className="min-w-0">
                  <span className="text-[9px] text-textMuted font-bold block">WHATSAPP DISPATCH</span>
                  <p className="text-xs font-semibold text-textMain">{student?.phone_number || "+917892713876"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-textMuted shrink-0" />
                <div className="min-w-0">
                  <span className="text-[9px] text-textMuted font-bold block">ACADEMIC ENROLLMENT</span>
                  <p className="text-xs font-semibold text-textMain">3rd Year Computer Science</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subjects Card */}
          <div className="bg-cardBg border border-borderColor rounded-3xl p-6">
            <h3 className="font-extrabold text-sm text-textMain uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-secondaryAccent" /> ENROLLED COURSES
            </h3>
            
            <div className="space-y-2">
              {student.subjects.map((sub, idx) => (
                <div key={idx} className="bg-secBackground border border-borderColor/60 px-4 py-2.5 rounded-xl text-xs font-bold text-textMain flex items-center justify-between">
                  <span>{sub}</span>
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 3. GAMIFIED ACHIEVEMENT BADGES SYSTEM */}
        <div className="lg:col-span-2 bg-cardBg border border-borderColor rounded-3xl p-6">
          <h3 className="font-extrabold text-sm text-textMain uppercase tracking-wider mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-primaryAccent" /> BADGES & SCHOLASTIC ACHIEVEMENTS
          </h3>

          <p className="text-xs text-textMuted leading-relaxed mb-6">
            Gain experience points (XP) across platform tasks, interactive quiz challenges, and simulated interviews to unlock premium achievements.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div 
                  key={badge.id} 
                  className={`border p-4 rounded-2xl flex gap-4 items-center relative overflow-hidden transition-all ${
                    badge.unlocked 
                      ? 'bg-secBackground/40 border-borderColor/80 hover:border-primaryAccent' 
                      : 'bg-secBackground/10 border-borderColor/30 opacity-60'
                  }`}
                >
                  {/* Badge icon */}
                  <div className={`p-3 rounded-xl shrink-0 flex items-center justify-center border ${badge.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Details */}
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-textMain">{badge.title}</h4>
                      {badge.unlocked && (
                        <CheckCircle className="w-3.5 h-3.5 text-success fill-success/15" />
                      )}
                    </div>
                    <p className="text-[10px] text-textMuted leading-snug">{badge.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Profile;
