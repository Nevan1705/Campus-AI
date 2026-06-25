import React, { useState, useEffect } from 'react';
import { useStudent, Task } from '../context/StudentContext';
import { 
  Plus, 
  Calendar, 
  MessageSquare, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  X,
  FileText
} from 'lucide-react';

const Tasks: React.FC = () => {
  const { tasks, createTask, toggleTaskStatus } = useStudent();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Computer Networks');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [addToCalendar, setAddToCalendar] = useState(true);

  // Form submission handler
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deadline) return;

    await createTask({
      title,
      subject,
      description,
      deadline: new Date(deadline).toISOString(),
      reminder_time: reminderTime ? new Date(reminderTime).toISOString() : undefined,
      add_to_calendar: addToCalendar
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setDeadline('');
    setReminderTime('');
    setIsModalOpen(false);
  };

  // Helper to calculate countdown times
  const getCountdownText = (deadlineStr: string, status: string) => {
    if (status === 'completed') return 'Task Completed';
    const diff = new Date(deadlineStr).getTime() - Date.now();
    if (diff < 0) return 'Deadline Missed';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h remaining`;
    return `${hours}h ${Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))}m remaining`;
  };

  // Filter Tasks by Columns
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const missedTasks = tasks.filter(t => {
    if (t.status === 'missed') return true;
    // Auto flag as missed if past deadline and still pending
    return t.status === 'pending' && new Date(t.deadline).getTime() < Date.now();
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Academic Task Manager</h2>
          <p className="text-xs text-textMuted font-medium">Create assignments, track schedules, sync calendar, and check AI risk thresholds.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primaryAccent hover:bg-primaryAccent/90 px-4 py-2.5 rounded-xl text-xs font-bold shadow-neon-purple transition-all flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Task
        </button>
      </div>

      {/* KANBAN BOARD LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1: PENDING */}
        <div className="bg-secBackground/50 border border-borderColor rounded-3xl p-5 flex flex-col h-[70vh]">
          <div className="flex items-center justify-between pb-3 border-b border-borderColor mb-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primaryAccent shadow-neon-purple" />
              <h3 className="font-extrabold text-xs text-textMain uppercase tracking-wider">Pending</h3>
            </div>
            <span className="bg-cardBg px-2 py-0.5 rounded-md text-[10px] text-textMuted font-bold border border-borderColor">
              {pendingTasks.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {pendingTasks.map((task) => (
              <div 
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="bg-cardBg border border-borderColor/60 hover:border-primaryAccent p-4 rounded-2xl cursor-pointer hover:shadow-neon-purple/5 transition-all duration-300 relative group"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="bg-primaryAccent/10 text-primaryAccent border border-primaryAccent/20 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase truncate max-w-[120px]">
                    {task.subject}
                  </span>
                  {task.ai_risk_score > 30 && (
                    <span className="bg-danger/10 text-danger border border-danger/20 px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Risk {task.ai_risk_score}%
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-textMain leading-tight mb-3 group-hover:text-primaryAccent transition-colors">
                  {task.title}
                </h4>

                <div className="flex items-center justify-between text-[10px] text-textMuted border-t border-borderColor/40 pt-3">
                  <div className="flex items-center gap-1.5 font-semibold text-warning">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{getCountdownText(task.deadline, task.status)}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskStatus(task.id, task.status);
                    }}
                    className="bg-secBackground hover:bg-success/20 hover:text-success border border-borderColor p-1.5 rounded-lg text-textMuted transition-colors"
                    title="Mark Completed"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <p className="text-xs text-textMuted italic text-center py-6">All caught up! No pending coursework.</p>
            )}
          </div>
        </div>

        {/* COLUMN 2: COMPLETED */}
        <div className="bg-secBackground/50 border border-borderColor rounded-3xl p-5 flex flex-col h-[70vh]">
          <div className="flex items-center justify-between pb-3 border-b border-borderColor mb-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-success shadow-neon-cyan" />
              <h3 className="font-extrabold text-xs text-textMain uppercase tracking-wider">Completed</h3>
            </div>
            <span className="bg-cardBg px-2 py-0.5 rounded-md text-[10px] text-textMuted font-bold border border-borderColor">
              {completedTasks.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {completedTasks.map((task) => (
              <div 
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="bg-cardBg/70 border border-borderColor/40 hover:border-success/50 p-4 rounded-2xl cursor-pointer hover:shadow-neon-cyan/5 transition-all duration-300 relative group opacity-85"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase truncate">
                    {task.subject}
                  </span>
                  <span className="text-[10px] font-bold text-success flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Done
                  </span>
                </div>

                <h4 className="text-xs font-bold text-textMain leading-tight mb-3 line-through text-textMuted">
                  {task.title}
                </h4>

                <div className="flex items-center justify-between text-[10px] text-textMuted border-t border-borderColor/40 pt-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Completed</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskStatus(task.id, task.status);
                    }}
                    className="bg-secBackground hover:bg-primaryAccent/20 hover:text-primaryAccent border border-borderColor p-1.5 rounded-lg text-textMuted transition-colors"
                    title="Mark Pending"
                  >
                    <Clock className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {completedTasks.length === 0 && (
              <p className="text-xs text-textMuted italic text-center py-6">No completed items. Check off some assignments!</p>
            )}
          </div>
        </div>

        {/* COLUMN 3: MISSED */}
        <div className="bg-secBackground/50 border border-borderColor rounded-3xl p-5 flex flex-col h-[70vh]">
          <div className="flex items-center justify-between pb-3 border-b border-borderColor mb-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-danger" />
              <h3 className="font-extrabold text-xs text-textMain uppercase tracking-wider">Missed</h3>
            </div>
            <span className="bg-cardBg px-2 py-0.5 rounded-md text-[10px] text-textMuted font-bold border border-borderColor">
              {missedTasks.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {missedTasks.map((task) => (
              <div 
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="bg-cardBg border border-borderColor/60 border-l-4 border-l-danger p-4 rounded-2xl cursor-pointer hover:shadow-inner transition-all duration-300 relative group opacity-90"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="bg-danger/10 text-danger border border-danger/20 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase truncate">
                    {task.subject}
                  </span>
                  <span className="text-[10px] font-bold text-danger flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Missed
                  </span>
                </div>

                <h4 className="text-xs font-bold text-textMain leading-tight mb-3">
                  {task.title}
                </h4>

                <div className="flex items-center justify-between text-[10px] text-textMuted border-t border-borderColor/40 pt-3">
                  <div className="flex items-center gap-1 text-danger font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Overdue</span>
                  </div>
                </div>
              </div>
            ))}
            {missedTasks.length === 0 && (
              <p className="text-xs text-textMuted italic text-center py-6">Nice job! Zero deadlines missed.</p>
            )}
          </div>
        </div>

      </div>

      {/* DETAILED TASK VIEW DRAWER / DIALOG */}
      {selectedTask && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cardBg border border-borderColor/80 shadow-glass rounded-3xl p-6 max-w-lg w-full relative">
            <button 
              onClick={() => setSelectedTask(null)}
              className="absolute top-4 right-4 text-textMuted hover:text-textMain p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Task Headers */}
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primaryAccent/15 text-primaryAccent border border-primaryAccent/20 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase">
                {selectedTask.subject}
              </span>
              <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-lg ${
                selectedTask.status === 'completed' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
              }`}>
                {selectedTask.status}
              </span>
            </div>

            <h3 className="text-base font-bold text-textMain leading-snug mb-3">
              {selectedTask.title}
            </h3>

            <p className="text-xs text-textMuted leading-relaxed mb-4 pb-4 border-b border-borderColor">
              {selectedTask.description || 'No detailed description added.'}
            </p>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <span className="text-[9px] text-textMuted font-bold uppercase tracking-wider">DEADLINE</span>
                <p className="text-xs font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primaryAccent" />
                  {new Date(selectedTask.deadline).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-textMuted font-bold uppercase tracking-wider">REMINDER DISPATCH</span>
                <p className="text-xs font-semibold flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-success" />
                  {selectedTask.reminder_time ? new Date(selectedTask.reminder_time).toLocaleString() : 'Not Set'}
                </p>
              </div>
            </div>

            {/* AI Risk Analysis Panel */}
            <div className="bg-secBackground border border-borderColor/60 p-4 rounded-2xl mb-4 relative overflow-hidden group">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primaryAccent animate-spin-slow" />
                <h4 className="text-xs font-extrabold text-textMain uppercase tracking-wider">AI Risk Analysis & Feedback</h4>
              </div>
              
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-background border border-borderColor rounded-xl px-3 py-1.5 text-center">
                  <span className="text-[9px] text-textMuted font-bold block leading-none">RISK SCORE</span>
                  <span className={`text-lg font-black leading-none ${selectedTask.ai_risk_score > 40 ? 'text-danger' : 'text-success'}`}>
                    {selectedTask.ai_risk_score}%
                  </span>
                </div>
                <p className="text-xs text-textMuted leading-relaxed">
                  {selectedTask.ai_risk_analysis}
                </p>
              </div>
            </div>

            {/* n8n Status Timeline */}
            <div className="bg-secBackground/40 border border-borderColor/40 p-4 rounded-2xl">
              <h5 className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-2">AUTOMATION STATUS TIMELINE</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-textMuted">Task added to database</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className={`w-4 h-4 ${selectedTask.add_to_calendar ? 'text-success' : 'text-textMuted'}`} />
                  <span className="text-textMuted">Google Calendar Event {selectedTask.add_to_calendar ? 'Created' : 'Toggled Off'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-textMuted">WhatsApp Reminder Scheduled (n8n node triggered)</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cardBg border border-borderColor shadow-glass rounded-3xl p-6 max-w-md w-full relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-textMuted hover:text-textMain p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black tracking-tight mb-4">Create Academic Task</h3>
            
            <form onSubmit={handleCreate} className="space-y-4">
              
              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Task Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., CN Socket Assignment"
                  required
                  className="w-full bg-background border border-borderColor rounded-xl px-4 py-2.5 text-xs text-textMain focus:outline-none focus:border-primaryAccent glass-input"
                />
              </div>

              {/* Subject & Calendar Toggle */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Subject</label>
                  <select 
                    value={subject} 
                    onChange={e => setSubject(e.target.value)}
                    className="w-full bg-background border border-borderColor rounded-xl px-4 py-2.5 text-xs text-textMain focus:outline-none focus:border-primaryAccent glass-input"
                  >
                    <option value="Computer Networks">Computer Networks</option>
                    <option value="Operating Systems">Operating Systems</option>
                    <option value="Database Management Systems">Database Management</option>
                    <option value="Design and Analysis of Algorithms">DAA (Algorithms)</option>
                  </select>
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 text-xs text-textMain font-semibold cursor-pointer mb-3 select-none">
                    <input 
                      type="checkbox" 
                      checked={addToCalendar} 
                      onChange={e => setAddToCalendar(e.target.checked)}
                      className="rounded border-borderColor text-primaryAccent focus:ring-0 focus:ring-offset-0 bg-background"
                    />
                    Add To Calendar
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Description</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Explain requirements, files, or AI considerations."
                  rows={3}
                  className="w-full bg-background border border-borderColor rounded-xl px-4 py-2.5 text-xs text-textMain focus:outline-none focus:border-primaryAccent glass-input resize-none"
                />
              </div>

              {/* Deadline & Reminder Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Deadline</label>
                  <input 
                    type="datetime-local" 
                    value={deadline} 
                    onChange={e => setDeadline(e.target.value)}
                    required
                    className="w-full bg-background border border-borderColor rounded-xl px-4 py-2 text-xs text-textMain focus:outline-none focus:border-primaryAccent glass-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-textMuted uppercase font-bold tracking-wider">WhatsApp Alert</label>
                  <input 
                    type="datetime-local" 
                    value={reminderTime} 
                    onChange={e => setReminderTime(e.target.value)}
                    className="w-full bg-background border border-borderColor rounded-xl px-4 py-2 text-xs text-textMain focus:outline-none focus:border-primaryAccent glass-input"
                  />
                </div>
              </div>

              {/* Submit */}
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primaryAccent to-secondaryAccent py-3 rounded-xl font-extrabold text-sm shadow-neon-purple hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-4"
              >
                Schedule Task & Dispatch Syncs 🚀
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Tasks;
