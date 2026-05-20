import React, { useState } from 'react';
import { useTickets } from '../context/TicketContext';
import { Shield, Users, User, Activity, AlertTriangle, Key } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { allUsers, loginUser } = useTickets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    const success = loginUser(email, password);
    if (!success) {
      setErrorMsg('Invalid credentials! Check spelling or use a preset user demo card below.');
    }
  };

  const handleApplyPreset = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-505/10 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      <div className="w-full max-w-md bg-[#090d16] border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(99,102,241,0.08)]">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2.5 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-650 to-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.35)] shrink-0 animate-pulse">
            <Activity className="h-6 w-6 text-indigo-100" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl sm:text-2xl text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text">Enterprise Hub</h1>
            <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1">SLA OPERATIONS DESK</p>
          </div>
        </div>

        {/* Action Title */}
        <div className="border-b border-slate-800/60 pb-3 mb-5">
          <h2 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5 uppercase font-mono">
            <Key className="h-4 w-4 text-indigo-400" /> Sign In to Workspace
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-normal">Enter your work email and password as defined by your administrator ruleset.</p>
        </div>

        {/* Notification Banner */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold flex items-center gap-2 animate-pulse leading-normal">
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-350 mb-1 font-mono uppercase">Work Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. sarah.admin@firm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0d1322] border border-slate-800/80 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-500 leading-normal"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-350 font-mono uppercase">Password</label>
              <span className="text-[10px] text-slate-500 font-medium">Standard auth mode</span>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0d1322] border border-slate-800/80 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-500 leading-normal"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/10 transition-all duration-200 uppercase tracking-wider font-mono"
          >
            Authenticate Credentials & Proceed
          </button>
        </form>

        {/* Interactive Demo Presets Selector Panel */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <label className="block font-mono text-[9px] text-slate-400 uppercase tracking-widest font-black mb-3">
            EVALUATION PRESETS (TAP TO PREFILL)
          </label>
          
          <div className="space-y-2">
            
            {/* Admin Preset */}
            <div 
              onClick={() => handleApplyPreset('sarah.admin@firm.com', 'admin123')}
              className="p-3 bg-slate-900/40 hover:bg-[#111827]/80 border border-slate-800/50 rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 hover:border-slate-700/80 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
                  <Shield className="h-3.5 w-3.5" />
                </div>
                <div className="text-left">
                  <h4 className="text-[10px] font-bold text-white leading-tight">Sarah Connor</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5">sarah.admin@firm.com</p>
                </div>
              </div>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-750 text-emerald-450 text-emerald-400 uppercase font-bold">
                Admin
              </span>
            </div>

            {/* Agent Preset */}
            <div 
              onClick={() => handleApplyPreset('john.doe@firm.com', 'agent123')}
              className="p-3 bg-slate-900/40 hover:bg-[#111827]/80 border border-slate-800/50 rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 hover:border-slate-700/80 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform">
                  <Users className="h-3.5 w-3.5" />
                </div>
                <div className="text-left">
                  <h4 className="text-[10px] font-bold text-white leading-tight">John Doe (Technical Agent)</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5">john.doe@firm.com</p>
                </div>
              </div>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-750 text-amber-450 text-amber-400 uppercase font-bold">
                Agent
              </span>
            </div>

            {/* Customer Preset */}
            <div 
              onClick={() => handleApplyPreset('utkarshr042@gmail.com', 'client123')}
              className="p-3 bg-slate-900/40 hover:bg-[#111827]/80 border border-slate-800/50 rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 hover:border-slate-700/80 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-105 transition-transform">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div className="text-left">
                  <h4 className="text-[10px] font-bold text-white leading-tight">Utkarsh Rajput</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5">utkarshr042@gmail.com</p>
                </div>
              </div>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-755 text-indigo-455 text-indigo-400 uppercase font-bold">
                Client
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
