import React, { useState, useEffect, useRef } from 'react';
import { useStudent, Placement, Assessment } from '../context/StudentContext';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Briefcase, 
  Calendar, 
  Sparkles, 
  Play, 
  Send, 
  Bot, 
  User, 
  TrendingUp, 
  Plus, 
  CheckCircle,
  XCircle,
  HelpCircle,
  BookmarkPlus,
  Compass,
  LayoutGrid,
  ChevronRight,
  TrendingDown
} from 'lucide-react';

const PlacementCoach: React.FC = () => {
  const { 
    student,
    placements, 
    assessments, 
    createPlacement, 
    submitQuizScore, 
    chatWithInterviewer 
  } = useStudent();

  const [activeSubTab, setActiveSubTab] = useState<'applications' | 'simulator' | 'insights' | 'assessments'>('applications');
  const [selectedPlacement, setSelectedPlacement] = useState<Placement | null>(null);

  // Application creation state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<'applied' | 'interviewing' | 'offered' | 'rejected'>('applied');
  const [interviewDate, setInterviewDate] = useState('');

  // Simulator state
  const [simMessage, setSimMessage] = useState('');
  const [simHistory, setSimHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Welcome Nevan! Select an active placement company, and click "Initiate Simulator" to start your mock interview.' }
  ]);
  const [simLoading, setSimLoading] = useState(false);
  const simBottomRef = useRef<HTMLDivElement>(null);

  // Initialize simulator greeting dynamically
  useEffect(() => {
    setSimHistory([
      { sender: 'ai', text: `Welcome ${student?.name || "Student"}! Select an active placement company, and click "Initiate Simulator" to start your mock interview.` }
    ]);
  }, [student?.name]);

  // Auto-scroll simulator chat
  useEffect(() => {
    simBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [simHistory, simLoading]);

  // Set default selection
  useEffect(() => {
    if (placements.length > 0 && !selectedPlacement) {
      setSelectedPlacement(placements[0]);
    }
  }, [placements]);

  // Sync simulator context on placement change
  const handleInitiateSimulator = () => {
    if (!selectedPlacement) return;
    setSimHistory([
      { sender: 'ai', text: `Initiating simulated tech interview for SDE role at ${selectedPlacement.company_name}. We will review algorithms, engineering systems, and behavioral scenarios. Ready to begin?` }
    ]);
  };

  // Add Placement application
  const handleAddPlacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !role) return;

    await createPlacement({
      company_name: companyName,
      role,
      status,
      interview_date: interviewDate || undefined
    });

    setCompanyName('');
    setRole('');
    setInterviewDate('');
    setIsAddOpen(false);
  };

  // Simulator Message Dispatcher
  const handleSendSim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simMessage.trim() || !selectedPlacement) return;

    const userText = simMessage;
    setSimMessage('');
    setSimHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setSimLoading(true);

    const reply = await chatWithInterviewer(selectedPlacement.company_name, selectedPlacement.role, userText, simHistory);
    setSimHistory(prev => [...prev, { sender: 'ai', text: reply }]);
    setSimLoading(false);
  };

  // Mock coding assessment triggers
  const handleLaunchAssessment = (type: 'coding' | 'aptitude' | 'technical' | 'hr', title: string) => {
    // Simulate assessment completion immediately with a mock score (e.g. random 75-95%)
    const randomScore = Math.floor(Math.random() * (95 - 75 + 1)) + 75;
    submitQuizScore(type, title, randomScore);
  };

  // Radar Data representing Weakness Tracker
  const radarData = [
    { subject: 'Technical', score: 85, fullMark: 100 },
    { subject: 'Communication', score: 75, fullMark: 100 },
    { subject: 'Confidence', score: 80, fullMark: 100 },
    { subject: 'Problem Solving', score: 90, fullMark: 100 },
    { subject: 'Leadership', score: 70, fullMark: 100 },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER OVERVIEW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-borderColor pb-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">💼 Placement Coach</h2>
          <p className="text-xs text-textMuted font-medium">Manage corporate applications, study company roadmaps, and chat with mock interview simulators.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-secBackground p-1.5 rounded-2xl border border-borderColor shrink-0">
          {(['applications', 'insights', 'assessments', 'simulator'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
                activeSubTab === tab 
                  ? 'bg-primaryAccent text-textMain shadow-neon-purple' 
                  : 'text-textMuted hover:text-textMain'
              }`}
            >
              {tab === 'simulator' ? 'Interview Simulator' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-cardBg border border-borderColor p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[9px] font-bold text-textMuted uppercase tracking-wider">APPLICATIONS</span>
          <div className="flex justify-between items-baseline mt-2">
            <h4 className="text-2xl font-black">{placements.length}</h4>
            <span className="text-xs text-primaryAccent font-bold">1 Interviewing</span>
          </div>
        </div>

        <div className="bg-cardBg border border-borderColor p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[9px] font-bold text-textMuted uppercase tracking-wider">INTERVIEWS PLANNED</span>
          <div className="flex justify-between items-baseline mt-2">
            <h4 className="text-2xl font-black">{placements.filter(p => p.interview_date).length}</h4>
            <span className="text-xs text-warning font-bold">Amazon in 4d</span>
          </div>
        </div>

        <div className="bg-cardBg border border-borderColor p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[9px] font-bold text-textMuted uppercase tracking-wider">MOCK ASSESSMENTS</span>
          <div className="flex justify-between items-baseline mt-2">
            <h4 className="text-2xl font-black">{assessments.length}</h4>
            <span className="text-xs text-success font-bold">2 Taken</span>
          </div>
        </div>

        <div className="bg-cardBg border border-borderColor p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[9px] font-bold text-textMuted uppercase tracking-wider">AVERAGE SCORE</span>
          <div className="flex justify-between items-baseline mt-2">
            <h4 className="text-2xl font-black">
              {assessments.length > 0 
                ? Math.round(assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length)
                : 0}%
            </h4>
            <span className="text-xs text-secondaryAccent font-bold">Readiness High</span>
          </div>
        </div>

      </div>

      {/* 2. SUB-TAB ROUTERS */}

      {/* APPLICATIONS LIST & RADAR CHART WEAKNESSES */}
      {activeSubTab === 'applications' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Applications list */}
          <div className="lg:col-span-2 bg-cardBg border border-borderColor rounded-3xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-textMain uppercase tracking-wider">Applications Tracker</h3>
              <button 
                onClick={() => setIsAddOpen(true)}
                className="bg-secBackground hover:bg-borderColor px-3 py-1.5 rounded-xl text-xs font-bold text-textMain border border-borderColor flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Application
              </button>
            </div>

            {/* Applications Table */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-borderColor text-textMuted font-bold uppercase tracking-wider">
                    <th className="pb-3">Company</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Interview Date</th>
                    <th className="pb-3">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderColor/40">
                  {placements.map((pl) => (
                    <tr 
                      key={pl.id}
                      onClick={() => setSelectedPlacement(pl)}
                      className={`cursor-pointer group hover:bg-secBackground/30 ${selectedPlacement?.id === pl.id ? 'bg-secBackground/50' : ''}`}
                    >
                      <td className="py-4 font-bold text-textMain flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-background border border-borderColor flex items-center justify-center text-xs font-black uppercase text-secondaryAccent">
                          {pl.company_name.substring(0, 2)}
                        </div>
                        {pl.company_name}
                      </td>
                      <td className="py-4 text-textMuted">{pl.role}</td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          pl.status === 'interviewing' ? 'bg-warning/15 text-warning border border-warning/10' :
                          pl.status === 'offered' ? 'bg-success/15 text-success border border-success/10' :
                          pl.status === 'rejected' ? 'bg-danger/15 text-danger border border-danger/10' :
                          'bg-primaryAccent/15 text-primaryAccent border border-primaryAccent/10'
                        }`}>
                          {pl.status}
                        </span>
                      </td>
                      <td className="py-4 text-textMuted">{pl.interview_date ? new Date(pl.interview_date).toLocaleDateString() : 'Not set'}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-borderColor rounded-full overflow-hidden">
                            <div className="h-full bg-secondaryAccent" style={{ width: `${pl.progress}%` }} />
                          </div>
                          <span className="font-mono text-[10px] font-bold">{pl.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Radar Chart Weakness Tracker */}
          <div className="bg-cardBg border border-borderColor rounded-3xl p-6 flex flex-col items-center justify-between">
            <div className="w-full flex justify-between items-start mb-4">
              <div>
                <h3 className="font-extrabold text-sm text-textMain uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-secondaryAccent" /> WEAKNESS TRACKER
                </h3>
                <p className="text-[10px] text-textMuted mt-0.5">Aggregate evaluations from simulator tasks</p>
              </div>
            </div>

            {/* Radar diagram container */}
            <div className="w-full h-56 flex items-center justify-center font-sans">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#2a3144" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#2a3144" tick={false} />
                  <Radar name={student.name} dataKey="score" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full bg-secBackground p-4 rounded-2xl border border-borderColor text-left">
              <span className="text-[9px] text-textMuted font-bold uppercase tracking-wider">AI EVALUATION FEEDBACK</span>
              <p className="text-[11px] text-textMuted mt-1 leading-relaxed">
                "Your problem-solving speed (90) is placement-ready. Focus prep cycles on leadership principles and communications (70) to clear final behavioral rounds."
              </p>
            </div>
          </div>

        </div>
      )}

      {/* COMPANY INSIGHTS ROADMAPS */}
      {activeSubTab === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {selectedPlacement ? (
            <>
              {/* Pattern detail */}
              <div className="lg:col-span-2 bg-cardBg border border-borderColor rounded-3xl p-6 space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-textMain flex items-center gap-2">
                    <Compass className="w-5 h-5 text-primaryAccent" /> {selectedPlacement.company_name} Interview pattern
                  </h3>
                  <p className="text-xs text-textMuted mt-1">{selectedPlacement.role}</p>
                </div>

                <div className="bg-secBackground/50 border border-borderColor p-4 rounded-2xl">
                  <span className="text-[10px] text-primaryAccent font-bold uppercase tracking-wider">INTERVIEW COMPOSITION</span>
                  <p className="text-xs text-textMain mt-1 leading-relaxed">{selectedPlacement.interview_pattern}</p>
                </div>

                {/* Popular topics list */}
                <div className="space-y-2">
                  <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider">Core Evaluation Areas</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlacement.popular_topics.map((top, idx) => (
                      <span key={idx} className="bg-secBackground border border-borderColor px-3 py-1.5 rounded-xl text-xs font-semibold text-textMain">
                        {top}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Roadmap Checklist */}
                <div className="space-y-3">
                  <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider block">Preparation Roadmap checklist</span>
                  {selectedPlacement.roadmap.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-secBackground/40 p-4 rounded-xl border border-borderColor/60">
                      <div className="w-5 h-5 rounded-md border border-borderColor flex items-center justify-center text-[10px] font-black text-secondaryAccent">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-textMain font-medium">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar detail */}
              <div className="bg-cardBg border border-borderColor rounded-3xl p-6 h-fit space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-textMuted">Insights Selector</h4>
                <div className="space-y-2">
                  {placements.map((pl) => (
                    <div 
                      key={pl.id}
                      onClick={() => setSelectedPlacement(pl)}
                      className={`p-4 rounded-2xl border cursor-pointer text-left transition-colors ${
                        selectedPlacement.id === pl.id 
                          ? 'bg-primaryAccent/10 border-primaryAccent' 
                          : 'bg-secBackground border-borderColor hover:border-textMuted'
                      }`}
                    >
                      <h5 className="text-xs font-bold text-textMain">{pl.company_name}</h5>
                      <span className="text-[10px] text-textMuted">{pl.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-textMuted italic text-center col-span-3 py-8">Select or create placement application to view roadmaps.</p>
          )}
        </div>
      )}

      {/* ASSESSMENT DRIVER HUB */}
      {activeSubTab === 'assessments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Assessment Cards */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-extrabold text-sm text-textMain uppercase tracking-wider flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-primaryAccent" /> ASSESSMENT SPRINT CHALLENGES
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-cardBg border border-borderColor p-5 rounded-3xl flex flex-col justify-between gap-4">
                <div>
                  <span className="bg-primaryAccent/10 text-primaryAccent border border-primaryAccent/20 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase w-fit">CODING SPRINT</span>
                  <h4 className="text-xs font-extrabold mt-2 text-textMain">DSA Mock Graph Traversals</h4>
                  <p className="text-[10px] text-textMuted mt-1">5 LeetCode-style questions on Trees & DFS.</p>
                </div>
                <button 
                  onClick={() => handleLaunchAssessment('coding', 'DSA Mock Assessment - Graph Traversals')}
                  className="w-full bg-primaryAccent hover:bg-primaryAccent/90 py-2.5 rounded-xl text-xs font-bold text-textMain shadow-neon-purple flex items-center justify-center gap-1"
                >
                  <Play className="w-4 h-4 fill-textMain" /> Launch Coding Mock
                </button>
              </div>

              <div className="bg-cardBg border border-borderColor p-5 rounded-3xl flex flex-col justify-between gap-4">
                <div>
                  <span className="bg-secondaryAccent/10 text-secondaryAccent border border-secondaryAccent/20 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase w-fit">SYSTEM DRILLS</span>
                  <h4 className="text-xs font-extrabold mt-2 text-textMain">OS Memory & Scheduling Drill</h4>
                  <p className="text-[10px] text-textMuted mt-1">20 Multiple-choice core systems review challenges.</p>
                </div>
                <button 
                  onClick={() => handleLaunchAssessment('technical', 'OS & Network Fundamentals Drill')}
                  className="w-full bg-secondaryAccent hover:bg-secondaryAccent/90 py-2.5 rounded-xl text-xs font-bold text-textMain shadow-neon-cyan flex items-center justify-center gap-1"
                >
                  <Play className="w-4 h-4 fill-textMain" /> Launch Tech Drill
                </button>
              </div>

            </div>
          </div>

          {/* Historical Assessment Results */}
          <div className="bg-cardBg border border-borderColor rounded-3xl p-6 space-y-4">
            <h3 className="font-extrabold text-sm text-textMain uppercase tracking-wider">Assessment History</h3>
            
            <div className="space-y-3">
              {assessments.map((item, idx) => (
                <div key={idx} className="bg-secBackground/50 border border-borderColor/60 p-4 rounded-2xl flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h5 className="text-xs font-bold text-textMain max-w-[170px] truncate">{item.title}</h5>
                    <span className="text-xs font-mono font-bold text-success">{item.score}%</span>
                  </div>
                  <p className="text-[10px] text-textMuted leading-relaxed italic">
                    "{item.ai_feedback?.substring(0, 100) ?? ''}..."
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* MOCK INTERVIEW SIMULATOR */}
      {activeSubTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[70vh]">
          
          {/* Company Side Panel */}
          <div className="bg-secBackground/50 border border-borderColor rounded-3xl p-5 flex flex-col hidden lg:flex">
            <h4 className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-4">ACTIVE SIMULATORS</h4>
            <div className="space-y-2 overflow-y-auto flex-1 mb-4">
              {placements.filter(p => p.status === 'interviewing').map((pl) => {
                const isSelected = selectedPlacement?.id === pl.id;
                return (
                  <div 
                    key={pl.id}
                    onClick={() => setSelectedPlacement(pl)}
                    className={`p-3 rounded-xl cursor-pointer border text-left transition-all ${
                      isSelected 
                        ? 'bg-primaryAccent/15 border-primaryAccent text-textMain font-semibold' 
                        : 'bg-cardBg border-borderColor/60 text-textMuted hover:text-textMain'
                    }`}
                  >
                    <p className="text-xs font-bold text-textMain leading-tight">{pl.company_name}</p>
                    <p className="text-[10px] text-textMuted">{pl.role}</p>
                  </div>
                );
              })}
            </div>
            <button 
              onClick={handleInitiateSimulator}
              disabled={!selectedPlacement}
              className="w-full bg-primaryAccent hover:bg-primaryAccent/90 disabled:opacity-50 py-2.5 rounded-xl text-xs font-bold text-textMain shadow-neon-purple"
            >
              Initiate Simulator
            </button>
          </div>

          {/* Simulator Chat Console */}
          <div className="lg:col-span-3 bg-cardBg border border-borderColor rounded-3xl flex flex-col h-full overflow-hidden">
            
            <div className="bg-secBackground px-6 py-4 border-b border-borderColor flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-secondaryAccent animate-bounce" />
                <div>
                  <h4 className="text-xs font-bold text-textMain">AI Placement Interview Simulator</h4>
                  <p className="text-[9px] text-textMuted">
                    Simulating rounds for:{' '}
                    <strong className="text-secondaryAccent">
                      {selectedPlacement ? selectedPlacement.company_name : 'No Company Active'}
                    </strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Simulated Chat Interface messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {simHistory.map((msg, index) => {
                const isAI = msg.sender === 'ai';
                return (
                  <div key={index} className={`flex gap-3 max-w-xl ${isAI ? '' : 'ml-auto flex-row-reverse'}`}>
                    <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
                      isAI ? 'bg-secondaryAccent/25 text-secondaryAccent' : 'bg-gradient-to-br from-primaryAccent to-secondaryAccent text-textMain'
                    }`}>
                      {isAI ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4 h-4" />}
                    </div>

                    <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                      isAI 
                        ? 'bg-secBackground/50 border-borderColor/60 text-textMain' 
                        : 'bg-primaryAccent/15 border-primaryAccent/20 text-textMain'
                    }`}>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                );
              })}

              {simLoading && (
                <div className="flex gap-3 max-w-xs">
                  <div className="w-8 h-8 rounded-xl bg-secondaryAccent/25 text-secondaryAccent flex items-center justify-center shrink-0">
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                  <div className="bg-secBackground/50 border border-borderColor/60 p-4 rounded-2xl text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-textMuted rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-textMuted rounded-full animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 bg-textMuted rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              )}

              <div ref={simBottomRef} />
            </div>

            {/* Inputs */}
            <form onSubmit={handleSendSim} className="p-4 bg-secBackground border-t border-borderColor shrink-0 flex gap-2">
              <input 
                type="text" 
                value={simMessage}
                onChange={e => setSimMessage(e.target.value)}
                disabled={!selectedPlacement || simLoading}
                placeholder={selectedPlacement ? "Respond to the interviewer technical/behavioral query..." : "Please initiate simulated mock session"}
                className="flex-1 bg-background border border-borderColor rounded-xl px-4 py-2.5 text-xs text-textMain focus:outline-none focus:border-primaryAccent disabled:opacity-50 glass-input"
              />
              <button 
                type="submit"
                disabled={!simMessage.trim() || simLoading}
                className="bg-secondaryAccent hover:bg-secondaryAccent/90 disabled:opacity-50 p-2.5 rounded-xl text-textMain shadow-neon-cyan transition-all flex items-center justify-center"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>

          </div>
        </div>
      )}

      {/* ADD PLACEMENT APPLICATION MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cardBg border border-borderColor shadow-glass rounded-3xl p-6 max-w-md w-full relative">
            <button 
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 text-textMuted hover:text-textMain p-1 rounded-lg"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black tracking-tight mb-4">Add Placement Application</h3>

            <form onSubmit={handleAddPlacement} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Company Name</label>
                <input 
                  type="text" 
                  value={companyName} 
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Netflix, Microsoft"
                  required
                  className="w-full bg-background border border-borderColor rounded-xl px-4 py-2.5 text-xs text-textMain focus:outline-none focus:border-primaryAccent glass-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Role Title</label>
                <input 
                  type="text" 
                  value={role} 
                  onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Software Engineer Intern"
                  required
                  className="w-full bg-background border border-borderColor rounded-xl px-4 py-2.5 text-xs text-textMain focus:outline-none focus:border-primaryAccent glass-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Application Status</label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-background border border-borderColor rounded-xl px-4 py-2.5 text-xs text-textMain focus:outline-none focus:border-primaryAccent glass-input"
                  >
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offered">Offered</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Interview Date</label>
                  <input 
                    type="date" 
                    value={interviewDate} 
                    onChange={e => setInterviewDate(e.target.value)}
                    className="w-full bg-background border border-borderColor rounded-xl px-4 py-2 text-xs text-textMain focus:outline-none focus:border-primaryAccent glass-input"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primaryAccent to-secondaryAccent py-3 rounded-xl font-extrabold text-sm shadow-neon-purple hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-4"
              >
                Log Application & Track 🚀
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PlacementCoach;
