import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Bot, Phone, Mail, User, BookOpen, Layers } from 'lucide-react';
import { useStudent } from '../context/StudentContext';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode');
  const isRegisterInitial = modeParam === 'register';

  const [isRegister, setIsRegister] = useState(isRegisterInitial);
  
  // Fields State
  const [name, setName] = useState('Nevan');
  const [email, setEmail] = useState('nevan@campusflow.ai');
  const [password, setPassword] = useState('password123');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [year, setYear] = useState('3');
  const [phone, setPhone] = useState('+917892713876');
  const [subjects, setSubjects] = useState('Computer Networks, Operating Systems, Algorithms');

  const { registerStudent } = useStudent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const subjectList = subjects.split(',').map(s => s.trim()).filter(s => s.length > 0);
    await registerStudent({
      name,
      email,
      branch,
      year: parseInt(year) || 3,
      phone_number: phone,
      subjects: subjectList
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background text-textMain flex items-center justify-center relative overflow-hidden px-4">
      
      {/* Background radial elements */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primaryAccent/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondaryAccent/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Main glass card container */}
      <div className="w-full max-w-xl bg-cardBg border border-borderColor shadow-glass rounded-3xl p-8 relative z-10 overflow-hidden">
        
        {/* Title Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex bg-primaryAccent/20 p-2.5 rounded-2xl text-primaryAccent mb-2 border border-primaryAccent/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black font-sans leading-none tracking-tight">
            {isRegister ? 'Join CampusFlow AI' : 'Welcome Back Student'}
          </h3>
          <p className="text-xs text-textMuted font-medium">
            {isRegister ? 'Set up your Academic & Placement Copilot account' : 'Access your smart academic workspaces'}
          </p>
        </div>

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Student Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full bg-background border border-borderColor rounded-xl pl-10 pr-4 py-2.5 text-xs text-textMain focus:outline-none focus:border-primaryAccent glass-input"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[10px] text-textMuted uppercase font-bold tracking-wider">WhatsApp Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                    required
                    placeholder="+919876543210"
                    className="w-full bg-background border border-borderColor rounded-xl pl-10 pr-4 py-2.5 text-xs text-textMain focus:outline-none focus:border-primaryAccent glass-input"
                  />
                </div>
              </div>

            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Academic Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-background border border-borderColor rounded-xl pl-10 pr-4 py-2.5 text-xs text-textMain focus:outline-none focus:border-primaryAccent glass-input"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-background border border-borderColor rounded-xl px-4 py-2.5 text-xs text-textMain focus:outline-none focus:border-primaryAccent glass-input"
            />
          </div>

          {isRegister && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Branch */}
                <div className="space-y-1">
                  <label className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Academic Branch</label>
                  <div className="relative">
                    <Layers className="w-4 h-4 text-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      value={branch} 
                      onChange={e => setBranch(e.target.value)}
                      className="w-full bg-background border border-borderColor rounded-xl pl-10 pr-4 py-2.5 text-xs text-textMain focus:outline-none focus:border-primaryAccent glass-input"
                    />
                  </div>
                </div>

                {/* Year */}
                <div className="space-y-1">
                  <label className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Study Year</label>
                  <select 
                    value={year} 
                    onChange={e => setYear(e.target.value)}
                    className="w-full bg-background border border-borderColor rounded-xl px-4 py-2.5 text-xs text-textMain focus:outline-none focus:border-primaryAccent glass-input"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

              </div>

              {/* Subjects */}
              <div className="space-y-1">
                <label className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Enrolled Subjects (comma separated)</label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={subjects} 
                    onChange={e => setSubjects(e.target.value)}
                    className="w-full bg-background border border-borderColor rounded-xl pl-10 pr-4 py-2.5 text-xs text-textMain focus:outline-none focus:border-primaryAccent glass-input"
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit button */}
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primaryAccent to-secondaryAccent py-3 rounded-xl font-extrabold text-sm shadow-neon-purple hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isRegister ? 'Complete Signup 🚀' : 'Secure Login 🔒'}
          </button>
        </form>

        {/* Switch mode */}
        <div className="text-center mt-6 text-xs text-textMuted">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={() => setIsRegister(false)}
                className="text-primaryAccent font-bold hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              New student registration?{' '}
              <button 
                type="button" 
                onClick={() => setIsRegister(true)}
                className="text-primaryAccent font-bold hover:underline"
              >
                Create Account
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
