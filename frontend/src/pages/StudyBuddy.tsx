import React, { useState, useEffect, useRef } from 'react';
import { useStudent, StudyNote, Flashcard, Quiz } from '../context/StudentContext';
import { 
  BookOpen, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  RefreshCw, 
  Play, 
  Send, 
  Bot, 
  User, 
  UploadCloud, 
  FolderPlus,
  Brain,
  CheckCircle,
  Clock,
  HelpCircle,
  BadgeAlert
} from 'lucide-react';

const StudyBuddy: React.FC = () => {
  const { 
    student,
    notes, 
    flashcards, 
    quizzes, 
    uploadNoteAndGenerateAssets, 
    submitQuizScore, 
    chatWithNotes 
  } = useStudent();

  const [activeTab, setActiveTab] = useState<'notes' | 'flashcards' | 'quizzes' | 'chat'>('notes');
  const [selectedNote, setSelectedNote] = useState<StudyNote | null>(null);

  // Notes Upload States
  const [uploadSubject, setUploadSubject] = useState('Computer Networks');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Flashcards States
  const [currentFCIndex, setCurrentFCIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz States
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizTimeLeft, setQuizTimeLeft] = useState(600); // 10 mins in seconds
  const timerRef = useRef<any>(null);

  // Chat States
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hey Nevan! Select a note file from the library, and we can start chatting about it.' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize chat greeting dynamically
  useEffect(() => {
    setChatHistory([
      { sender: 'ai', text: `Hey ${student?.name || "Student"}! Select a note file from the library, and we can start chatting about it.` }
    ]);
  }, [student?.name]);

  // Reset states when note shifts
  useEffect(() => {
    if (selectedNote) {
      setChatHistory([
        { sender: 'ai', text: `Study notes '${selectedNote.title}' successfully loaded! Ask me anything about this topic.` }
      ]);
      setCurrentFCIndex(0);
      setIsFlipped(false);
    }
  }, [selectedNote]);

  // Quiz Timer Effect
  useEffect(() => {
    if (activeQuiz && !quizFinished) {
      timerRef.current = setInterval(() => {
        setQuizTimeLeft(prev => {
          if (prev <= 1) {
            handleFinishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeQuiz, quizFinished]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, chatLoading]);

  // Upload handler
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle || !uploadContent) return;

    setIsUploading(true);
    // Simulate short network delay
    setTimeout(async () => {
      await uploadNoteAndGenerateAssets({
        subject: uploadSubject,
        title: uploadTitle,
        content: uploadContent,
        pages_count: Math.ceil(uploadContent.length / 800)
      });
      setIsUploading(false);
      setUploadTitle('');
      setUploadContent('');
    }, 1000);
  };

  // Flashcards navigation
  const filteredFCs = selectedNote 
    ? flashcards.filter(fc => fc.note_id === selectedNote.id)
    : flashcards;

  const handleNextFC = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentFCIndex(prev => (prev + 1) % filteredFCs.length);
    }, 150);
  };

  const handlePrevFC = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentFCIndex(prev => (prev - 1 + filteredFCs.length) % filteredFCs.length);
    }, 150);
  };

  // Quiz submission actions
  const handleStartQuiz = (qz: Quiz) => {
    setActiveQuiz(qz);
    setCurrentQIndex(0);
    setSelectedAnswer('');
    setQuizScore(0);
    setQuizFinished(false);
    setQuizTimeLeft(qz.time_limit_minutes * 60);
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;
    const currentQ = activeQuiz.questions[currentQIndex];
    
    // Check answer correctness
    if (selectedAnswer === currentQ.correctAnswer) {
      setQuizScore(prev => prev + 1);
    }

    if (currentQIndex + 1 < activeQuiz.questions.length) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedAnswer('');
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = () => {
    if (!activeQuiz) return;
    setQuizFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);

    // Calculate percent score
    const finalPercent = Math.round((quizScore / activeQuiz.questions.length) * 100);
    
    // Pushes mock results database score
    submitQuizScore(
      'technical', 
      activeQuiz.title, 
      finalPercent
    );
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  // Chat message submission
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedNote) return;

    const userText = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setChatLoading(true);

    const reply = await chatWithNotes(selectedNote.id, userText, chatHistory);
    setChatHistory(prev => [...prev, { sender: 'ai', text: reply }]);
    setChatLoading(false);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER TABS NAVBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-borderColor pb-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">🧠 AI Study Buddy</h2>
          <p className="text-xs text-textMuted font-medium">ChatGPT-style note interaction, card reviews, and LeetCode multi-choice tests.</p>
        </div>
        
        {/* TAB CONTROLS */}
        <div className="flex bg-secBackground p-1.5 rounded-2xl border border-borderColor shrink-0">
          {(['notes', 'flashcards', 'quizzes', 'chat'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
                activeTab === tab 
                  ? 'bg-primaryAccent text-textMain shadow-neon-purple' 
                  : 'text-textMuted hover:text-textMain'
              }`}
            >
              {tab === 'chat' ? 'Chat With Notes' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* VIEWPORT CONTROLLERS */}

      {/* 1. NOTES TAB */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Notes Uploader */}
          <div className="bg-cardBg border border-borderColor rounded-3xl p-6 h-fit">
            <h3 className="font-extrabold text-sm text-textMain uppercase tracking-wider mb-4 flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-primaryAccent" /> UPLOAD STUDY NOTES
            </h3>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Subject</label>
                <select 
                  value={uploadSubject} 
                  onChange={e => setUploadSubject(e.target.value)}
                  className="w-full bg-background border border-borderColor rounded-xl px-4 py-2.5 text-xs text-textMain focus:outline-none focus:border-primaryAccent glass-input"
                >
                  <option value="Computer Networks">Computer Networks</option>
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="Database Management Systems">Database Management</option>
                  <option value="Design and Analysis of Algorithms">DAA (Algorithms)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Note Document Title</label>
                <input 
                  type="text" 
                  value={uploadTitle} 
                  onChange={e => setUploadTitle(e.target.value)}
                  placeholder="e.g., DNS Resolution Notes.txt"
                  required
                  className="w-full bg-background border border-borderColor rounded-xl px-4 py-2.5 text-xs text-textMain focus:outline-none focus:border-primaryAccent glass-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Paste Core Content (for AI parsing)</label>
                <textarea 
                  value={uploadContent} 
                  onChange={e => setUploadContent(e.target.value)}
                  placeholder="Paste textbook details or outline summaries here to let AI generate study cards & test challenges."
                  rows={6}
                  required
                  className="w-full bg-background border border-borderColor rounded-xl px-4 py-2.5 text-xs text-textMain focus:outline-none focus:border-primaryAccent glass-input resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={isUploading}
                className="w-full bg-gradient-to-r from-primaryAccent to-secondaryAccent py-3 rounded-xl font-extrabold text-sm shadow-neon-purple hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing Note Data...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" /> Upload & Generate Assets
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Notes Library Cards list */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-extrabold text-sm text-textMain uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-secondaryAccent" /> NOTE HANDOUT LIBRARY
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map((note) => {
                const isSelected = selectedNote?.id === note.id;
                return (
                  <div 
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    className={`bg-cardBg border p-5 rounded-2xl cursor-pointer transition-all duration-300 relative group ${
                      isSelected ? 'border-primaryAccent ring-1 ring-primaryAccent' : 'border-borderColor hover:border-textMuted'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-primaryAccent/10 text-primaryAccent border border-primaryAccent/20 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase truncate max-w-[150px]">
                        {note.subject}
                      </span>
                      <span className="text-[10px] text-textMuted font-medium">
                        {new Date(note.upload_date).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-textMain mb-2 group-hover:text-primaryAccent transition-colors">
                      {note.title}
                    </h4>

                    <p className="text-[10px] text-textMuted line-clamp-3 mb-4 leading-relaxed">
                      {note.summary}
                    </p>

                    <div className="flex items-center justify-between text-[9px] text-textMuted pt-3 border-t border-borderColor/40 font-semibold uppercase tracking-wider">
                      <span>Pages: {note.pages_count}</span>
                      <span className="text-secondaryAccent">⚡ AI Assets Loaded</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* 2. FLASHCARDS TAB */}
      {activeTab === 'flashcards' && (
        <div className="max-w-xl mx-auto flex flex-col items-center gap-6">
          
          {/* Note selection alert */}
          <div className="w-full text-center">
            <span className="text-xs text-textMuted font-medium">
              Reviewing Cards for:{' '}
              <strong className="text-primaryAccent">
                {selectedNote ? selectedNote.title : 'All Topics'}
              </strong>
            </span>
          </div>

          {filteredFCs.length > 0 ? (
            <div className="w-full space-y-6">
              
              {/* Swipe Card Deck */}
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full h-72 bg-cardBg border border-borderColor rounded-3xl shadow-glass flex items-center justify-center p-8 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group select-none hover:border-primaryAccent/50"
              >
                {/* Background flare */}
                <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-primaryAccent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                
                {/* Flip State Wrapper */}
                <div className="space-y-4 max-w-md">
                  <span className="text-[9px] font-bold text-textMuted uppercase tracking-widest bg-secBackground px-2.5 py-1 rounded-md border border-borderColor">
                    {isFlipped ? 'Answer Key' : 'Question'}
                  </span>
                  
                  <p className="text-sm md:text-base font-extrabold text-textMain leading-relaxed">
                    {isFlipped 
                      ? filteredFCs[currentFCIndex].answer 
                      : filteredFCs[currentFCIndex].question
                    }
                  </p>
                  
                  <p className="text-[10px] text-textMuted italic pt-4">
                    Click card to flip
                  </p>
                </div>
              </div>

              {/* Progress and controls */}
              <div className="flex items-center justify-between">
                <button 
                  onClick={handlePrevFC}
                  className="bg-cardBg hover:bg-secBackground border border-borderColor p-3 rounded-2xl text-textMain transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="text-center font-bold text-xs text-textMuted">
                  <span>{currentFCIndex + 1} / {filteredFCs.length} Flashcards</span>
                  <div className="w-32 h-1 bg-borderColor rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className="h-full bg-primaryAccent transition-all duration-300"
                      style={{ width: `${((currentFCIndex + 1) / filteredFCs.length) * 100}%` }}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleNextFC}
                  className="bg-cardBg hover:bg-secBackground border border-borderColor p-3 rounded-2xl text-textMain transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
            <div className="text-center bg-cardBg border border-borderColor rounded-3xl p-8 w-full">
              <BadgeAlert className="w-8 h-8 text-warning mx-auto mb-2" />
              <p className="text-xs text-textMuted">No flashcards available. Upload notes to let AI generate resources!</p>
            </div>
          )}

        </div>
      )}

      {/* 3. QUIZZES TAB */}
      {activeTab === 'quizzes' && (
        <div className="max-w-3xl mx-auto space-y-6">
          
          {!activeQuiz ? (
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-textMain uppercase tracking-wider flex items-center gap-2">
                <Brain className="w-4 h-4 text-primaryAccent" /> ACTIVE LEETCODE-STYLE CHALLENGES
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizzes.map((qz) => (
                  <div key={qz.id} className="bg-cardBg border border-borderColor p-5 rounded-3xl flex justify-between items-center group hover:border-primaryAccent transition-colors">
                    <div className="space-y-1">
                      <span className="bg-secondaryAccent/10 text-secondaryAccent border border-secondaryAccent/20 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase truncate">
                        {qz.subject}
                      </span>
                      <h4 className="text-xs font-bold text-textMain mt-1">{qz.title}</h4>
                      <p className="text-[10px] text-textMuted">{qz.questions.length} Multiple Choice | {qz.time_limit_minutes} Mins</p>
                    </div>

                    <button 
                      onClick={() => handleStartQuiz(qz)}
                      className="bg-primaryAccent hover:bg-primaryAccent/90 p-3 rounded-2xl text-textMain font-bold shadow-neon-purple transition-all flex items-center gap-1 text-xs"
                    >
                      <Play className="w-4 h-4 fill-textMain" /> Start
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // ACTIVE QUIZ INTERFACE (LeetCode Style)
            <div className="bg-cardBg border border-borderColor rounded-3xl overflow-hidden shadow-glass">
              
              {/* LeetCode Header bar */}
              <div className="bg-secBackground px-6 py-4 flex items-center justify-between border-b border-borderColor shrink-0">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-textMain">{activeQuiz.title}</h4>
                  <p className="text-[10px] text-textMuted">Question {currentQIndex + 1} of {activeQuiz.questions.length}</p>
                </div>
                
                {/* Timer Clock */}
                <div className="flex items-center gap-2 bg-background border border-borderColor px-3.5 py-1.5 rounded-xl text-mono text-xs font-bold">
                  <Clock className="w-4 h-4 text-warning" />
                  <span className="text-warning font-semibold">{formatTime(quizTimeLeft)}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 bg-secBackground">
                <div 
                  className="h-full bg-gradient-to-r from-primaryAccent to-secondaryAccent transition-all duration-300"
                  style={{ width: `${((currentQIndex) / activeQuiz.questions.length) * 100}%` }}
                />
              </div>

              {/* Quiz Body */}
              <div className="p-6 space-y-6">
                
                {!quizFinished ? (
                  <>
                    {/* Question block */}
                    <div className="space-y-3">
                      <span className="text-[10px] text-primaryAccent font-extrabold tracking-widest uppercase">QUESTION CONTEXT</span>
                      <p className="text-xs md:text-sm font-extrabold text-textMain leading-relaxed bg-secBackground p-4 rounded-2xl border border-borderColor/60">
                        {activeQuiz.questions[currentQIndex].question}
                      </p>
                    </div>

                    {/* Options list */}
                    <div className="space-y-2.5">
                      {activeQuiz.questions[currentQIndex].options.map((opt, idx) => {
                        const isSelected = selectedAnswer === opt;
                        return (
                          <div 
                            key={idx}
                            onClick={() => setSelectedAnswer(opt)}
                            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer select-none transition-colors ${
                              isSelected 
                                ? 'bg-primaryAccent/15 border-primaryAccent text-textMain font-semibold' 
                                : 'bg-secBackground/40 border-borderColor/60 text-textMuted hover:border-textMuted hover:text-textMain'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                              isSelected ? 'border-primaryAccent bg-primaryAccent text-textMain' : 'border-borderColor text-textMuted'
                            }`}>
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <span className="text-xs">{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center pt-4 border-t border-borderColor/40">
                      <button 
                        onClick={() => {
                          if (timerRef.current) clearInterval(timerRef.current);
                          setActiveQuiz(null);
                        }}
                        className="text-xs font-bold text-textMuted hover:text-textMain hover:underline"
                      >
                        Cancel Quiz
                      </button>

                      <button 
                        onClick={handleNextQuestion}
                        disabled={!selectedAnswer}
                        className="bg-primaryAccent hover:bg-primaryAccent/90 disabled:opacity-50 px-5 py-2.5 rounded-xl font-bold text-xs shadow-neon-purple transition-all flex items-center gap-1 text-textMain"
                      >
                        {currentQIndex + 1 === activeQuiz.questions.length ? 'Submit Quiz 🚀' : 'Next Question'}
                      </button>
                    </div>
                  </>
                ) : (
                  // SCORE RESULTS PANEL
                  <div className="text-center py-6 space-y-6 max-w-md mx-auto">
                    <CheckCircle className="w-16 h-16 text-success mx-auto" />
                    <div>
                      <h4 className="text-lg font-black text-textMain">Challenge Submitted!</h4>
                      <p className="text-xs text-textMuted mt-1">Your performance score is logged. XP awarded.</p>
                    </div>

                    {/* Score badge details */}
                    <div className="bg-secBackground p-4 rounded-2xl border border-borderColor flex justify-around">
                      <div>
                        <span className="text-[9px] text-textMuted font-bold block">SCORE PERCENT</span>
                        <span className="text-2xl font-black text-success">
                          {Math.round((quizScore / activeQuiz.questions.length) * 100)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-textMuted font-bold block">ACCURACY</span>
                        <span className="text-2xl font-black text-textMain">
                          {quizScore} / {activeQuiz.questions.length} Correct
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setActiveQuiz(null)}
                      className="bg-primaryAccent hover:bg-primaryAccent/90 px-6 py-2.5 rounded-xl font-bold text-xs shadow-neon-purple transition-all"
                    >
                      Return to Quiz Deck
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      )}

      {/* 4. CHAT WITH NOTES TAB */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[72vh]">
          
          {/* Notes Sidebar Selector */}
          <div className="bg-secBackground/50 border border-borderColor rounded-3xl p-5 flex flex-col hidden lg:flex">
            <h4 className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-4">Select Source note</h4>
            <div className="space-y-2 overflow-y-auto flex-1">
              {notes.map((note) => {
                const isSelected = selectedNote?.id === note.id;
                return (
                  <div 
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    className={`p-3 rounded-xl cursor-pointer border text-left transition-colors ${
                      isSelected 
                        ? 'bg-primaryAccent/10 border-primaryAccent text-textMain font-semibold' 
                        : 'bg-cardBg border-borderColor/60 text-textMuted hover:text-textMain'
                    }`}
                  >
                    <p className="text-[10px] font-bold uppercase text-primaryAccent">{note.subject}</p>
                    <p className="text-xs truncate font-bold text-textMain mt-0.5">{note.title}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Chat Console */}
          <div className="lg:col-span-3 bg-cardBg border border-borderColor rounded-3xl flex flex-col h-full overflow-hidden">
            
            {/* Chat Header */}
            <div className="bg-secBackground px-6 py-3.5 border-b border-borderColor flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primaryAccent" />
                <div>
                  <h4 className="text-xs font-bold text-textMain">Study Buddy Chatbot</h4>
                  <p className="text-[9px] text-textMuted">
                    Active Handout Context:{' '}
                    <strong className="text-primaryAccent">
                      {selectedNote ? selectedNote.title : 'None Selected'}
                    </strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Message Bubble Streams */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatHistory.map((msg, index) => {
                const isAI = msg.sender === 'ai';
                return (
                  <div key={index} className={`flex gap-3 max-w-xl ${isAI ? '' : 'ml-auto flex-row-reverse'}`}>
                    {/* Icon bubble */}
                    <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
                      isAI ? 'bg-primaryAccent/20 text-primaryAccent' : 'bg-gradient-to-br from-primaryAccent to-secondaryAccent text-textMain'
                    }`}>
                      {isAI ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4 h-4" />}
                    </div>

                    {/* Chat Text Bubble */}
                    <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                      isAI 
                        ? 'bg-secBackground/50 border-borderColor/60 text-textMain' 
                        : 'bg-primaryAccent/10 border-primaryAccent/20 text-textMain'
                    }`}>
                      <p>{msg.text}</p>
                      
                      {/* Simulated Source references */}
                      {isAI && selectedNote && index > 1 && (
                        <div className="mt-3 pt-2 border-t border-borderColor/40 flex items-center gap-1.5 text-[9px] text-textMuted font-bold uppercase tracking-wider select-none">
                          <CheckCircle className="w-3.5 h-3.5 text-success" />
                          Source Ref: {selectedNote.title}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {chatLoading && (
                <div className="flex gap-3 max-w-xs">
                  <div className="w-8 h-8 rounded-xl bg-primaryAccent/20 text-primaryAccent flex items-center justify-center shrink-0">
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                  <div className="bg-secBackground/50 border border-borderColor/60 p-4 rounded-2xl text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-textMuted rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-textMuted rounded-full animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 bg-textMuted rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Chat Inputs */}
            <form onSubmit={handleSendChat} className="p-4 bg-secBackground border-t border-borderColor shrink-0 flex gap-2">
              <input 
                type="text" 
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                disabled={!selectedNote || chatLoading}
                placeholder={selectedNote ? "Ask study questions, request flashcards summaries..." : "Select note source to initiate chatbot"}
                className="flex-1 bg-background border border-borderColor rounded-xl px-4 py-2.5 text-xs text-textMain focus:outline-none focus:border-primaryAccent disabled:opacity-50 glass-input"
              />
              <button 
                type="submit"
                disabled={!chatMessage.trim() || chatLoading}
                className="bg-primaryAccent hover:bg-primaryAccent/90 disabled:opacity-50 p-2.5 rounded-xl text-textMain shadow-neon-purple transition-all flex items-center justify-center"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default StudyBuddy;
