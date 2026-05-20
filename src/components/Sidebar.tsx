import React from 'react';
import { useTickets } from '../context/TicketContext';
import { Shield, Users, User, Mail, ChevronRight, Activity, X } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  const { currentUser, allUsers, switchUser } = useTickets();

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false); // Close sidebar drawer on mobile
  };

  return (
    <aside className={`w-80 bg-[#090d16] text-slate-100 flex flex-col border-r border-slate-800/80 z-30 transition-transform duration-300 ease-in-out fixed inset-y-0 left-0 lg:static lg:translate-x-0 ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-650 to-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.35)] shrink-0">
            <Activity className="h-5 w-5 text-indigo-100 animate-pulse" />
          </div>
          <div>
            <h1 className="font-sans font-extrabold text-base tracking-tight text-white bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text">Enterprise Hub</h1>
            <p className="font-mono text-[9px] text-slate-400 uppercase tracking-widest font-bold">SLA OPERATIONS DESK</p>
          </div>
        </div>

        {/* Close Toggle on Mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/70 rounded-xl border border-slate-800 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Profile Impersonator Console (For Testing Multi-roles live!) */}
      <div className="p-4 bg-[#111827]/40 border border-slate-800/60 m-4 rounded-xl shadow-inner shrink-0">
        <label className="block font-mono text-[10px] text-slate-400 uppercase tracking-widest mb-1.5 font-bold">
          CURRENT ACTIVE IDENTITY
        </label>
        <div className="relative">
          <select
            value={currentUser.id}
            onChange={(e) => {
              switchUser(e.target.value);
              // Auto-adjust tabs context when role switches to improve UX
              const selectedProfile = allUsers.find(u => u.id === e.target.value);
              if (selectedProfile) {
                if (selectedProfile.role === 'admin') setActiveTab('admin');
                else if (selectedProfile.role === 'agent') setActiveTab('agent');
                else setActiveTab('client');
              }
              setSidebarOpen(false); // Auto close sidebar drawer
            }}
            className="w-full bg-[#1e293b]/70 border border-slate-700/60 rounded-lg py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer pr-10 appearance-none font-medium"
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id} className="bg-[#0f172a] text-slate-200">
                {u.avatar} {u.name} ({u.role.toUpperCase()})
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 text-xs">
            ▼
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          {currentUser.role === 'admin' && (
            <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-500/10 text-emerald-400 font-mono py-0.5 px-2 rounded border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]">
              <Shield className="h-3 w-3" /> Full Controller Access
            </span>
          )}
          {currentUser.role === 'agent' && (
            <span className="inline-flex items-center gap-1.5 text-[10px] bg-amber-500/10 text-amber-400 font-mono py-0.5 px-2 rounded border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.05)]">
              <Users className="h-3 w-3" /> Agent Workspace Active
            </span>
          )}
          {currentUser.role === 'user' && (
            <span className="inline-flex items-center gap-1.5 text-[10px] bg-indigo-500/10 text-indigo-400 font-mono py-0.5 px-2 rounded border border-indigo-500/20">
              <User className="h-3 w-3" /> End-User Client Portal
            </span>
          )}
        </div>
      </div>

      {/* Navigation Modules */}
      <nav className="flex-1 px-4 space-y-1.5 py-2 overflow-y-auto">
        <label className="block font-sans text-[10px] text-slate-500 uppercase font-bold tracking-widest px-2 mb-2">
          OPERATIONAL VIEWS
        </label>
        
        {/* Admin Section (Always visible, but prompts user if not admin) */}
        <button
          onClick={() => handleSelectTab('admin')}
          className={`w-full flex items-center justify-between text-left py-2.5 px-3 rounded-lg text-sm transition-all duration-200 ${
            activeTab === 'admin'
              ? 'bg-indigo-600/90 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] font-semibold border-l-2 border-indigo-400'
              : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Shield className="h-4 w-4 shrink-0 text-indigo-400" />
            <span>Admin Control Panel</span>
          </div>
          {currentUser.role !== 'admin' && (
            <span className="text-[9px] font-mono bg-slate-800 text-slate-400 py-0.5 px-1.5 rounded uppercase font-semibold">
              Locked
            </span>
          )}
        </button>

        {/* Agent Sections */}
        <button
          onClick={() => handleSelectTab('agent')}
          className={`w-full flex items-center justify-between text-left py-2.5 px-3 rounded-lg text-sm transition-all duration-200 ${
            activeTab === 'agent'
              ? 'bg-indigo-600/90 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] font-semibold border-l-2 border-indigo-400'
              : 'text-slate-400 hover:bg-[#111827]/40 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Users className="h-4 w-4 shrink-0 text-indigo-400" />
            <span>Agent Desk (Parallel Ops)</span>
          </div>
          {currentUser.role === 'user' && (
            <span className="text-[9px] font-mono bg-slate-800 text-slate-400 py-0.5 px-1.5 rounded uppercase font-semibold">
              Locked
            </span>
          )}
        </button>

        {/* End-User Portal */}
        <button
          onClick={() => handleSelectTab('client')}
          className={`w-full flex items-center justify-between text-left py-2.5 px-3 rounded-lg text-sm transition-all duration-200 ${
            activeTab === 'client'
              ? 'bg-indigo-600/90 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] font-semibold border-l-2 border-indigo-400'
              : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <User className="h-4 w-4 shrink-0 text-indigo-400" />
            <span>End-User Support Client</span>
          </div>
          <ChevronRight className={`h-3 w-3 opacity-60 transition-transform duration-200 ${activeTab === 'client' ? 'rotate-90 text-white' : ''}`} />
        </button>

        {/* Simulator Labs */}
        <div className="pt-6 border-t border-slate-800/60 my-4">
          <label className="block font-sans text-[10px] text-slate-500 uppercase font-bold tracking-widest px-2 mb-2">
            SIMULATION LABS
          </label>
          <button
            onClick={() => handleSelectTab('simulator')}
            className={`w-full flex items-center justify-between text-left py-2.5 px-3 rounded-lg text-sm transition-all duration-200 ${
              activeTab === 'simulator'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)] font-semibold border-l-2 border-violet-400'
                : 'text-slate-300 hover:bg-slate-800/40 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-violet-400" />
              <span>Email Gateway Router</span>
            </div>
            <span className="text-[9px] font-mono bg-violet-500/20 text-violet-350 py-0.5 px-1.5 rounded uppercase font-bold text-violet-300">
              Interact
            </span>
          </button>
        </div>
      </nav>

      {/* Footer Branding */}
      <div className="p-4 border-t border-slate-800/80 bg-[#060910] text-left font-mono text-[10px] text-slate-500 font-semibold shrink-0">
        <div className="flex items-center justify-between">
          <span>SLA Sweep Daemon</span>
          <span className="text-emerald-400 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
            ACTIVE
          </span>
        </div>
        <p className="mt-1 opacity-70">Interval check: 5s sweep</p>
      </div>
    </aside>
  );
};
