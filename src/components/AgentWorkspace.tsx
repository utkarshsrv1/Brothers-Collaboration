import React, { useState, useEffect } from 'react';
import { useTickets } from '../context/TicketContext';
import { Ticket } from '../types';
import { ShieldAlert, Send, Clock, UserCheck, MessageSquare, AlertTriangle, CheckSquare, Sparkles, ChevronLeft } from 'lucide-react';

export const AgentWorkspace: React.FC = () => {
  const {
    currentUser,
    tickets,
    messages,
    allUsers,
    departments,
    templateFields,
    updateTicketStatus,
    assignTicketAgents,
    addTicketMessage,
    triggerManualEscalation
  } = useTickets();

  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [chatType, setChatType] = useState<'public' | 'internal'>('public');
  const [draftMessage, setDraftMessage] = useState('');
  
  // Escalation prompt modal
  const [showEscModal, setShowEscModal] = useState(false);
  const [escReason, setEscReason] = useState('');

  // Dropdown states for interactive assignments change
  const [tempPrimary, setTempPrimary] = useState<string>('');
  const [tempSecondary, setTempSecondary] = useState<string>('');

  // Refresh countdown timer labels on active screen
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Filter lists
  const [filterMode, setFilterMode] = useState<'assigned' | 'unassigned' | 'all'>('assigned');

  if (currentUser.role !== 'agent' && currentUser.role !== 'admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#020617]">
        <div className="max-w-md p-8 bg-[#070b13] border border-red-500/20 rounded-2xl shadow-[0_0_24px_rgba(239,68,68,0.15)] flex flex-col items-center">
          <div className="p-4 bg-amber-500/10 rounded-full text-amber-500 border border-amber-500/20 mb-4 animate-bounce">
            <AlertTriangle className="h-10 w-10 text-amber-400" />
          </div>
          <h3 className="text-lg font-extrabold font-sans text-white uppercase tracking-wider">Support Desk Restricted</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-3 leading-relaxed">
            Your active persona is set to <span className="font-mono text-amber-300 font-bold">{currentUser.name} ({currentUser.role.toUpperCase()})</span>. Switch to agents like <span className="text-slate-105 font-bold">John Doe (Agent)</span> or <span className="text-slate-105 font-bold">Alice Smith (Senior Agent)</span> via the sidebar identity selector to experience the dual-assigned collaborative support space.
          </p>
        </div>
      </div>
    );
  }

  // Active Ticket
  const activeTicket = tickets.find(t => t.id === activeTicketId) || (tickets.length > 0 ? tickets[0] : null);

  useEffect(() => {
    if (activeTicket) {
      setTempPrimary(activeTicket.primaryAgentId || '');
      setTempSecondary(activeTicket.secondaryAgentId || '');
    }
  }, [activeTicketId, activeTicket]);

  const filteredTickets = tickets.filter(t => {
    if (filterMode === 'assigned') {
      return t.primaryAgentId === currentUser.id || t.secondaryAgentId === currentUser.id;
    }
    if (filterMode === 'unassigned') {
      return !t.primaryAgentId;
    }
    return true; // All tickets
  });

  const activeMessages = messages.filter(m => m.ticketId === (activeTicket?.id || ''));

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftMessage.trim() || !activeTicket) return;

    addTicketMessage(activeTicket.id, draftMessage, chatType === 'internal');
    setDraftMessage('');
  };

  const handleApplyAgents = () => {
    if (!activeTicket) return;
    assignTicketAgents(activeTicket.id, tempPrimary || null, tempSecondary || null);
  };

  const handleTriggerEscalationForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !escReason.trim()) return;

    triggerManualEscalation(activeTicket.id, escReason);
    setEscReason('');
    setShowEscModal(false);
  };

  // Helper to calculate countdown time remaining
  const renderRemainingSLA = (deadlineISO: string) => {
    const diff = new Date(deadlineISO).getTime() - now;
    if (diff <= 0) {
      return <span className="text-red-500 font-bold tracking-wide uppercase font-sans">BREACHED ⚠️</span>;
    }
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return (
      <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-amber-500/10 rounded text-amber-400 border border-amber-500/20 animate-pulse">
        {mins}m {secs}s remaining
      </span>
    );
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#020617] relative">
      
      {/* Sidebar Listing Queue */}
      <div className={`w-full lg:w-80 flex flex-col bg-[#070b13] border-r border-slate-800 shrink-0 ${activeTicketId ? 'hidden lg:flex' : 'flex'}`}>
        {/* Workspace Title & Filters */}
        <div className="p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider font-sans">Support Queues</h3>
            <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 py-0.5 px-2 rounded-full font-bold">
              {filteredTickets.length} ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 bg-[#02050c] p-1 rounded-lg">
            {(['assigned', 'unassigned', 'all'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`text-[9px] font-bold py-1.5 px-2 rounded transition-all capitalize ${
                  filterMode === mode
                    ? 'bg-slate-800 text-white shadow-sm font-black border border-slate-700'
                    : 'text-slate-400 hover:text-slate-100/90'
                }`}
              >
                {mode === 'assigned' ? 'My Desk' : mode}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets Scroll Panel */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-900 border-none">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => {
              const isLead = ticket.primaryAgentId === currentUser.id;
              const isBackup = ticket.secondaryAgentId === currentUser.id;
              const hasBreached = ticket.isResolutionBreached || ticket.isResponseBreached;
              const activeSLA = new Date(ticket.slaResolutionDeadline).getTime() - now;

              return (
                <div
                  key={ticket.id}
                  onClick={() => {
                    setActiveTicketId(ticket.id);
                  }}
                  className={`p-5 text-left cursor-pointer transition-all border-l-4 ${
                    activeTicket?.id === ticket.id
                      ? 'bg-slate-800/25 border-indigo-500'
                      : 'hover:bg-slate-800/10 border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <span className="text-[10px] font-mono bg-slate-800 border border-slate-750 text-slate-350 px-1.5 py-0.5 rounded font-bold">
                      {ticket.id}
                    </span>
                    <span className={`uppercase font-mono text-[9px] px-1.5 py-0.5 rounded font-bold border ${
                      ticket.priority === 'urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      ticket.priority === 'high' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      ticket.priority === 'medium' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-slate-850 text-slate-400 border-slate-750'
                    }`}>
                      {ticket.priority}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-200 text-xs truncate leading-tight mt-1">{ticket.title}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 mb-2">
                    {ticket.description}
                  </p>

                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500 font-medium">
                    <div className="flex items-center gap-1">
                      {isLead && <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded text-[9px] font-bold">Primary</span>}
                      {isBackup && <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1 py-0.2 rounded text-[9px] font-bold">Secondary</span>}
                      {!ticket.primaryAgentId && <span className="text-indigo-400 font-bold font-mono">Unassigned</span>}
                    </div>

                    <div className="flex items-center gap-1 font-bold">
                      {hasBreached ? (
                        <span className="text-red-500">Breached ⚠️</span>
                      ) : (
                        <span className={activeSLA < 15 * 60 * 1050 ? 'text-amber-400 font-bold animate-pulse' : 'text-slate-500 font-mono text-[9px]'}>
                          SLA ACTIVE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-550 text-xs font-mono">
              No tickets match selection.
            </div>
          )}
        </div>
      </div>

      {/* Main Ticket Work Desk */}
      {activeTicket ? (
        <div className={`flex-1 flex flex-col overflow-hidden bg-[#02050c] min-w-0 text-left ${activeTicketId ? 'flex' : 'hidden lg:flex'}`}>
          
          {/* Ticket Workbench Header */}
          <div className="p-6 bg-[#090d16] border-b border-slate-800 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              
              {/* Back button on mobile */}
              <button
                type="button"
                onClick={() => setActiveTicketId(null)}
                className="lg:hidden flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 mb-4 px-3 py-1.5 bg-[#0e1726]/80 rounded-lg border border-slate-800/85 self-start"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Back to Queue List
              </button>

              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(99,102,241,0.1)]">
                  {activeTicket.id}
                </span>
                <span className="text-xs text-slate-400 font-mono">Created by {activeTicket.creatorName} ({activeTicket.creatorEmail})</span>
              </div>
              <h2 className="text-base font-extrabold text-white font-sans tracking-tight leading-normal">{activeTicket.title}</h2>
            </div>

            {/* Status transitions control */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-400 lowercase font-mono">STATE:</label>
              <select
                value={activeTicket.status}
                onChange={(e) => updateTicketStatus(activeTicket.id, e.target.value as Ticket['status'])}
                className="bg-[#131b2e] border border-slate-800 rounded-lg py-1.5 px-3 text-xs font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="new" className="bg-[#0f172a]">New</option>
                <option value="investigating" className="bg-[#0f172a]">Investigating</option>
                <option value="resolving" className="bg-[#0f172a]">Resolving</option>
                <option value="resolved" className="bg-[#0f172a]">Resolved</option>
                <option value="closed" className="bg-[#0f172a]">Closed</option>
              </select>

              <button
                onClick={() => setShowEscModal(true)}
                className="bg-red-500/10 border border-red-550/25 text-red-400 hover:bg-red-500/20 font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 shadow-md shadow-red-500/10 transition"
              >
                <ShieldAlert className="h-3.5 w-3.5" /> Escalate
              </button>
            </div>
          </div>

          {/* Ticket Information Panel and Collaborative Chat */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden min-h-0">
            {/* Left Column: Ticket attributes, Custom Template Values, SLA Clocks, and assignments */}
            <div className="w-full lg:w-80 bg-[#090d16]/30 border-b lg:border-b-0 lg:border-r border-[#0f172a] p-6 overflow-y-visible lg:overflow-y-auto space-y-6 shrink-0">
              
              {/* SLA Targets & Countdown timers */}
              <div className="bg-[#0f172a]/40 p-4 rounded-xl border border-slate-800/80">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8] font-mono mb-3.5 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-indigo-400 shrink-0" /> Live Timelines
                </h4>
                
                <div className="space-y-4 text-xs">
                  <div>
                    <p className="text-slate-500 font-mono text-[9px] mb-1">RESPONSE SLA TARGET</p>
                    <div className="flex justify-between items-center bg-[#070b13] p-2.5 rounded border border-slate-800">
                      <span className="font-mono text-slate-300 text-[11px]">{new Date(activeTicket.slaResponseDeadline).toLocaleTimeString()}</span>
                      {activeTicket.isFirstResponded ? (
                        <span className="text-emerald-450 text-emerald-400 font-bold">ACHIEVED ✓</span>
                      ) : (
                        renderRemainingSLA(activeTicket.slaResponseDeadline)
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-slate-500 font-mono text-[9px] mb-1">RESOLUTION SLA TARGET</p>
                    <div className="flex justify-between items-center bg-[#070b13] p-2.5 rounded border border-slate-800">
                      <span className="font-mono text-slate-300 text-[11px]">{new Date(activeTicket.slaResolutionDeadline).toLocaleTimeString()}</span>
                      {activeTicket.status === 'resolved' || activeTicket.status === 'closed' ? (
                        <span className="text-emerald-450 text-emerald-400 font-bold">ACHIEVED ✓</span>
                      ) : (
                        renderRemainingSLA(activeTicket.slaResolutionDeadline)
                      )}
                    </div>
                  </div>
                </div>

                {activeTicket.escalatedToAgentId && (
                  <div className="mt-4 p-2.5 bg-red-500/10 text-red-400 rounded border border-red-500/20 text-[11px] font-semibold flex items-center gap-1.5 shadow-[0_0_8px_rgba(239,68,68,0.15)] animate-pulse">
                    <Sparkles className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span>Escalated to expert lead.</span>
                  </div>
                )}
              </div>

              {/* Parallel Support Multi-Agent Assignments */}
              <div className="bg-[#0f172a]/30 p-4 rounded-xl border border-slate-800/80 space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8] font-mono flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-indigo-400 shrink-0" /> Dual-Agent assignments
                </h4>
                
                <p className="text-[10px] text-slate-450 leading-relaxed">Specify lead operator and parallel backup assistants to collaborate concurrently.</p>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold text-[10px] mb-1">Primary Agent (Lead)</label>
                    <select
                      value={tempPrimary}
                      onChange={(e) => setTempPrimary(e.target.value)}
                      className="w-full bg-[#131b2e] border border-slate-800 p-2 text-slate-200 text-xs rounded focus:outline-none"
                    >
                      <option value="" className="bg-[#0f172a]">-- Unassigned --</option>
                      {allUsers.filter(u => u.role === 'agent').map(ag => (
                        <option key={ag.id} value={ag.id} className="bg-[#0f172a]">
                          {ag.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold text-[10px] mb-1">Secondary Agent (Parallel Backup)</label>
                    <select
                      value={tempSecondary}
                      onChange={(e) => setTempSecondary(e.target.value)}
                      className="w-full bg-[#131b2e] border border-slate-800 p-2 text-slate-205 text-slate-202 text-slate-200 text-xs rounded focus:outline-none"
                    >
                      <option value="" className="bg-[#0f172a]">-- Unassigned --</option>
                      {allUsers.filter(u => u.role === 'agent').map(ag => (
                        <option key={ag.id} value={ag.id} className="bg-[#0f172a]">
                          {ag.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleApplyAgents}
                    className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white py-2 rounded-lg text-xs px-4 font-bold shadow-[0_0_12px_rgba(99,102,241,0.2)] transition duration-200"
                  >
                    Apply Concurrent Assignments
                  </button>
                </div>
              </div>

              {/* Custom Ticket details customFields */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono">Custom Field Submissions</h4>
                <div className="divide-y divide-slate-850 text-xs">
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-450 font-mono text-[9px]">TARGET DEPARTMENT</span>
                    <span className="font-bold text-slate-200">
                      {departments.find(d => d.id === activeTicket.departmentId)?.name || 'Default Technical'}
                    </span>
                  </div>

                  {Object.entries(activeTicket.customFields).map(([key, value]) => {
                    const matchedField = templateFields.find(f => f.id === key);
                    const label = matchedField ? matchedField.label : key;
                    return (
                      <div key={key} className="py-2.5 flex flex-col">
                        <span className="text-slate-500 font-mono text-[9px] uppercase tracking-wider mb-1">{label}</span>
                        <div className="font-bold text-slate-200 break-all leading-normal">
                          {typeof value === 'boolean' ? (value ? 'YES ✓' : 'NO ✗') : value.toString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Splitted Column: Chat Boards for Public vs Teams Channels */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#02050c] min-h-[450px] lg:min-h-0">
              
              {/* Channels selector: Public Portal Vs Internal agent notes */}
              <div className="bg-[#090d16] px-6 border-b border-[#0f172a] flex shrink-0">
                <button
                  onClick={() => setChatType('public')}
                  className={`py-3.5 px-4 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
                    chatType === 'public'
                      ? 'border-indigo-500 text-indigo-400 font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" /> Client Facing updates (Updates customer email & portal)
                </button>

                <button
                  onClick={() => setChatType('internal')}
                  className={`py-3.5 px-4 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
                    chatType === 'internal'
                      ? 'border-amber-500 text-amber-400 font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <AlertTriangle className="h-4 w-4" /> Internal Department Discussion (Invisible to Client)
                </button>
              </div>

              {/* Chat Feed Messages list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {activeMessages.length > 0 ? (
                  activeMessages.map((msg) => {
                    if (msg.isInternalOnly && chatType === 'public') return null; // Hide internal notes in public channel
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 max-w-[85%] ${
                          msg.senderId === currentUser.id ? 'ml-auto flex-row-reverse' : ''
                        }`}
                      >
                        {/* Avatar */}
                        <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-xs shrink-0 font-bold text-slate-200">
                          {allUsers.find(u => u.id === msg.senderId)?.avatar || '👤'}
                        </div>

                        {/* Speech Bubble */}
                        <div>
                          <div className={`text-[10px] mb-1 text-slate-400 font-mono flex items-center gap-1 ${
                            msg.senderId === currentUser.id ? 'justify-end' : ''
                          }`}>
                            <span className="font-bold text-slate-200">{msg.senderName}</span>
                            <span>•</span>
                            <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                            {msg.isInternalOnly && (
                              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[8px] px-1 rounded font-bold uppercase">
                                INTERNAL NOTE
                              </span>
                            )}
                          </div>

                          <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                            msg.isInternalOnly ? 'bg-amber-550/10 bg-amber-500/5 text-amber-300 border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.08)]' :
                            msg.senderId === currentUser.id
                              ? 'bg-gradient-to-tr from-indigo-650 to-indigo-600 text-white border-l border-indigo-400 font-medium'
                              : 'bg-[#0f172a] text-slate-205 text-slate-200 border border-slate-800/80 shadow-sm'
                          }`}>
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 font-mono">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">No discussions posted yet.</p>
                    <p className="text-[10px] mt-1 text-slate-500">Post a reply above to update core timelines.</p>
                  </div>
                )}
              </div>

              {/* Input field compose block */}
              <form onSubmit={handleSendMessage} className="p-4 bg-[#060a12] border-t border-[#0f172a] shrink-0 flex gap-3">
                <input
                  type="text"
                  required
                  value={draftMessage}
                  onChange={(e) => setDraftMessage(e.target.value)}
                  placeholder={
                    chatType === 'internal'
                      ? "Post a confidential internal message for collaborating agents..."
                      : "Send professional comment to update customer ticket and email notices..."
                  }
                  className="flex-1 border bg-[#0d1322] border-slate-850 p-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-500"
                />
                <button
                  type="submit"
                  className={`p-2.5 px-5 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition ${
                    chatType === 'internal' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  <Send className="h-3.5 w-3.5" /> Send
                </button>
              </form>

            </div>
          </div>
        </div>
      ) : (
        <div className={`flex-1 flex flex-col items-center justify-center p-8 bg-[#02050c] text-center text-slate-500 font-mono font-bold uppercase tracking-widest text-xs ${activeTicketId ? 'flex' : 'hidden lg:flex'}`}>
          Select work Queue Tickets above to open support desk.
        </div>
      )}

      {/* Manual Immediate Escalation details Modal */}
      {showEscModal && activeTicket && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scaleUp text-left">
            <h3 className="text-base font-extrabold text-white mb-1.5 flex items-center gap-1.5 text-red-500">
              <ShieldAlert className="h-5 w-5 text-red-500" /> Trigger Instant SLA Escalation
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              This process overrides existing operators, assigns configured Senior Specialists specialist Alice, and shoots immediate high priority updates to customer email logs.
            </p>

            <form onSubmit={handleTriggerEscalationForm} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-extrabold text-slate-350 mb-1.5 uppercase tracking-wider">Reason of SLA Breach *</label>
                <textarea
                  required
                  placeholder="Explain why standard operation limits require manual priority override..."
                  value={escReason}
                  onChange={(e) => setEscReason(e.target.value)}
                  className="w-full border border-slate-800 text-xs p-2.5 rounded-lg bg-[#131b2ef0] text-slate-200 focus:outline-none placeholder-slate-500"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEscModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-xl text-slate-300 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-xs hover:from-red-650 font-bold shadow-[0_4px_12px_-2px_rgba(239,68,68,0.25)]"
                >
                  Confirm Escalation Setup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
