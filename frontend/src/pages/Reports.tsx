import React, { useState, useEffect } from 'react';
import { useStudent } from '../context/StudentContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Play, 
  Pause, 
  Flame, 
  Award, 
  TrendingUp, 
  Clock, 
  BookOpen 
} from 'lucide-react';

const Reports: React.FC = () => {
  const { student, tasks } = useStudent();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [aiReportText, setAiReportText] = useState(
    "This week you completed 14 tasks and improved your coding assessment score by 12%. Keep focusing on Graphs and Dynamic Programming ahead of your Amazon interview!"
  );

  // Fetch AI Report Summary
  useEffect(() => {
    const fetchWrappedReport = async () => {
      try {
        const res = await fetch('/api/reports/wrapped');
        if (res.ok) {
          const data = await res.json();
          setAiReportText(data.ai_summary);
        }
      } catch (err) {
        console.warn("AI Reports API failed. Falling back to default wrap description.");
      }
    };
    fetchWrappedReport();
  }, [tasks]);

  // Autoplay slides
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % 4);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Slide Data
  const slideColors = [
    'from-purple-900 to-indigo-950', // Slide 1: Welcome / Productivity Summary
    'from-emerald-900 to-teal-950',   // Slide 2: Study Time
    'from-cyan-900 to-blue-950',     // Slide 3: Assessments
    'from-amber-900 to-rose-950'      // Slide 4: Readiness Summary
  ];

  // Recharts Bar Data representing hours logged
  const studySplitData = [
    { subject: 'Networks', hours: 8, color: '#7C3AED' },
    { subject: 'OS', hours: 7.5, color: '#06B6D4' },
    { subject: 'Algorithms', hours: 7, color: '#22C55E' },
  ];

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentSlide(prev => (prev + 1) % 4);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentSlide(prev => (prev - 1 + 4) % 4);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* HEADER CONTROLS */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">🎓 CampusFlow Wrapped</h2>
          <p className="text-xs text-textMuted font-medium">Your weekly academic & placement analytics digest.</p>
        </div>

        {/* Player controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-cardBg border border-borderColor hover:border-textMuted px-3 py-1.5 rounded-xl text-xs text-textMain transition-colors flex items-center gap-1.5"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause Autoplay
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-textMain" /> Play Stories
              </>
            )}
          </button>
        </div>
      </div>

      {/* STORY WRAP CONTAINER (Vibrant colorful Spotify Wrapped cards) */}
      <div className={`w-full h-[55vh] rounded-3xl bg-gradient-to-br ${slideColors[currentSlide]} border border-borderColor/50 p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-700 shadow-glass`}>
        
        {/* Top Progress indicators */}
        <div className="absolute top-4 left-6 right-6 flex gap-1.5 z-10">
          {[0, 1, 2, 3].map((idx) => (
            <div key={idx} className="h-1 flex-1 bg-textMuted/20 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-textMain transition-all duration-300 ${
                  currentSlide > idx ? 'w-full' : currentSlide === idx ? 'w-full duration-[5000ms] ease-linear' : 'w-0'
                }`}
                style={{ transitionDuration: isPlaying && currentSlide === idx ? '5000ms' : '150ms' }}
              />
            </div>
          ))}
        </div>

        {/* Slide 1: Welcome & Productivity Stats */}
        {currentSlide === 0 && (
          <div className="flex-1 flex flex-col justify-between pt-4">
            <div className="space-y-4">
              <span className="text-[10px] text-purple-300 font-extrabold tracking-widest uppercase">WEEKLY SUMMARY</span>
              <h3 className="text-2xl md:text-3xl font-black text-textMain leading-tight">
                You log progress <br />
                like a <span className="text-purple-300 underline underline-offset-4 decoration-wavy">Slayer.</span>
              </h3>
              <p className="text-sm text-textMuted leading-relaxed max-w-md">
                This week was highly productive. You logged academic checkmarks, simulated code sprints, and expanded your scholarship records!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-black/35 p-5 rounded-2xl border border-white/5">
              <div>
                <span className="text-[9px] text-purple-300 font-extrabold block">TASKS COMPLETED</span>
                <span className="text-2xl font-black text-textMain">14 Completed</span>
              </div>
              <div>
                <span className="text-[9px] text-purple-300 font-extrabold block">STREAK STATUS</span>
                <span className="text-2xl font-black text-warning">5 Days 🔥</span>
              </div>
            </div>
          </div>
        )}

        {/* Slide 2: Study Duration split graph */}
        {currentSlide === 1 && (
          <div className="flex-1 flex flex-col justify-between pt-4">
            <div className="space-y-1">
              <span className="text-[10px] text-emerald-300 font-extrabold tracking-widest uppercase">STUDY DISTRIBUTION</span>
              <h3 className="text-xl md:text-2xl font-black text-textMain">Your time breakdown</h3>
              <p className="text-xs text-textMuted leading-relaxed">
                Here is how you distributed 22.5 hours of revision across subjects this week.
              </p>
            </div>

            {/* Simple Bar Chart */}
            <div className="w-full h-40 font-sans my-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studySplitData} layout="vertical">
                  <XAxis type="number" stroke="#94a3b8" fontSize={9} hide />
                  <YAxis dataKey="subject" type="category" stroke="#94a3b8" fontSize={10} width={70} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#111827', border: '1px solid #2a3144' }} />
                  <Bar dataKey="hours" radius={[0, 8, 8, 0]} barSize={16}>
                    {studySplitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-between items-center text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
              <span>TOTAL STUDY HOURS: 22.5 hrs</span>
              <span>Top: Networks (8h)</span>
            </div>
          </div>
        )}

        {/* Slide 3: Mock Performance Assessment results */}
        {currentSlide === 2 && (
          <div className="flex-1 flex flex-col justify-between pt-4">
            <div className="space-y-3">
              <span className="text-[10px] text-cyan-300 font-extrabold tracking-widest uppercase">ACCREDITATION METRICS</span>
              <h3 className="text-xl md:text-2xl font-black text-textMain">
                Test accuracies are <br />
                looking <span className="text-cyan-300">solid.</span>
              </h3>
              <p className="text-xs text-textMuted leading-relaxed">
                Your performance in multiple-choice scheduling drills and graph traversals placed you in the top 10% of class averages!
              </p>
            </div>

            <div className="flex gap-6 items-center my-4 bg-black/25 p-4 rounded-2xl border border-white/5">
              <div className="w-20 h-20 rounded-full border-4 border-cyan-400 border-r-transparent flex items-center justify-center font-black text-lg text-cyan-300 shadow-neon-cyan">
                78%
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-textMain">Average Assessment Score</p>
                <p className="text-[10px] text-textMuted">Strengths: Breadth First Search (BFS), IP Addressing</p>
                <p className="text-[10px] text-warning font-semibold">Focus area: Strongly Connected components</p>
              </div>
            </div>

            <div className="text-[9px] text-textMuted font-bold uppercase tracking-widest">
              Aggregate accuracy based on recent mock assessments
            </div>
          </div>
        )}

        {/* Slide 4: Placement Readiness evaluation metrics */}
        {currentSlide === 3 && (
          <div className="flex-1 flex flex-col justify-between pt-4">
            <div className="space-y-2">
              <span className="text-[10px] text-rose-300 font-extrabold tracking-widest uppercase">PLACEMENT READINESS</span>
              <h3 className="text-xl md:text-2xl font-black text-textMain">Amazon Target SDE Intern</h3>
              <p className="text-xs text-textMuted leading-relaxed">
                With your tech mock score at 82% and Graph skills solidifying, you have a strong likelihood of matching recruitment filters.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center my-4">
              <div className="bg-black/35 p-3 rounded-xl border border-white/5">
                <span className="text-[8px] text-textMuted font-bold block">INTERVIEW DAY</span>
                <span className="text-xs font-black text-warning">4 Days Left</span>
              </div>
              <div className="bg-black/35 p-3 rounded-xl border border-white/5">
                <span className="text-[8px] text-textMuted font-bold block">ROADMAP TASKS</span>
                <span className="text-xs font-black text-emerald-300">60% Complete</span>
              </div>
              <div className="bg-black/35 p-3 rounded-xl border border-white/5">
                <span className="text-[8px] text-textMuted font-bold block">READINESS RATE</span>
                <span className="text-xs font-black text-rose-300">High Risk 45%</span>
              </div>
            </div>

            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 text-xs">
              <p className="text-rose-200 font-medium italic text-[11px] leading-relaxed">
                "{aiReportText}"
              </p>
            </div>
          </div>
        )}

      </div>

      {/* STORY BOTTOM NAVIGATION */}
      <div className="flex items-center justify-between bg-cardBg border border-borderColor p-4 rounded-2xl shrink-0">
        <button 
          onClick={handlePrev}
          className="bg-secBackground hover:bg-borderColor p-2.5 rounded-xl text-textMain transition-colors flex items-center gap-1 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>

        <span className="text-xs font-mono font-bold text-textMuted">
          Slide {currentSlide + 1} of 4
        </span>

        <button 
          onClick={handleNext}
          className="bg-secBackground hover:bg-borderColor p-2.5 rounded-xl text-textMain transition-colors flex items-center gap-1 text-xs font-bold"
        >
          Next <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

export default Reports;
