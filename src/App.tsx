import { useState } from 'react';
import { TicketProvider, useTickets } from './context/TicketContext';
import { Sidebar } from './components/Sidebar';
import { AdminDashboard } from './components/AdminDashboard';
import { AgentWorkspace } from './components/AgentWorkspace';
import { CustomerPortal } from './components/CustomerPortal';
import { EmailSimulator } from './components/EmailSimulator';
import { LoginScreen } from './components/LoginScreen';
import { Activity, ShieldAlert, BadgeInfo, Bell, Menu } from 'lucide-react';

function DashboardLayout() {
  const [activeTab, setActiveTab] = useState('client');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser } = useTickets();

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#020617] text-slate-300 font-sans relative">
      
      {/* Background overlay on mobile when sidebar drawer is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-20 lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Impersonator & Operational view Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Working Desk Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#020617] text-slate-100 min-w-0">
        
        {/* Top bar indicators */}
        <header className="h-16 bg-[#0f172a]/50 border-b border-slate-800 shrink-0 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* Hamburger Menu on Mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl mr-1 border border-slate-800 focus:outline-none"
            >
              <Menu className="h-4 w-4" />
            </button>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)] shrink-0"></span>
            <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-400 tracking-wider uppercase truncate">SSL ACTIVE GATEWAY</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-6 text-xs min-w-0">
            {/* Quick stats indicators */}
            <div className="hidden md:flex items-center gap-2 font-medium bg-slate-800/60 text-slate-350 border border-slate-700/60 py-1.5 px-3 rounded-full">
              <BadgeInfo className="h-4 w-4 text-indigo-400 shrink-0" />
              <span className="truncate">Identity: <span className="font-bold text-white">{currentUser.name}</span></span>
            </div>

            <div className="flex items-center gap-1.5 font-bold font-mono tracking-tight text-slate-400 text-[10px] sm:text-xs shrink-0">
              <span className="opacity-65 hidden xs:inline">SYSTEM UTC:</span>
              <span className="text-indigo-400 font-bold bg-[#1e293b]/50 border border-slate-800 px-2 py-0.5 rounded">2026-05-20</span>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Module Render Pane */}
        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'admin' && <AdminDashboard />}
          {activeTab === 'agent' && <AgentWorkspace />}
          {activeTab === 'client' && <CustomerPortal />}
          {activeTab === 'simulator' && <EmailSimulator />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <TicketProvider>
      <DashboardLayout />
    </TicketProvider>
  );
}
