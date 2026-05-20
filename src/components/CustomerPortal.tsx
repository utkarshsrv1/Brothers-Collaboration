import React, { useState } from 'react';
import { useTickets } from '../context/TicketContext';
import { Ticket } from '../types';
import { Plus, CheckSquare, MessageSquare, Clock, ArrowRight, ShieldAlert, BadgeInfo, ChevronLeft } from 'lucide-react';

export const CustomerPortal: React.FC = () => {
  const {
    currentUser,
    tickets,
    messages,
    departments,
    templateFields,
    createTicket,
    addTicketMessage
  } = useTickets();

  // Create ticket form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority, setTicketPriority] = useState<Ticket['priority']>('low');
  const [ticketDeptId, setTicketDeptId] = useState('');
  
  // Custom Dynamic Field response states
  const [customResponses, setCustomResponses] = useState<Record<string, string | boolean>>({});

  // View Ticket focus
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Filter tickets to only those belonging to the current user email!
  const myTickets = tickets.filter(t => t.creatorEmail.toLowerCase() === currentUser.email.toLowerCase());

  // Setup default active ticket
  const activeTicket = myTickets.find(t => t.id === activeTicketId) || (myTickets.length > 0 ? myTickets[0] : null);
  const activeMessages = messages.filter(m => m.ticketId === (activeTicket?.id || '') && !m.isInternalOnly);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle.trim() || !ticketDesc.trim() || !ticketDeptId) return;

    // Build values mapping using schema
    const data: Record<string, string | boolean> = {};
    templateFields.forEach(f => {
      if (!f.isDefault) {
        data[f.id] = customResponses[f.id] !== undefined ? customResponses[f.id] : (f.type === 'checkbox' ? false : '');
      }
    });

    createTicket(
      ticketTitle,
      ticketDesc,
      ticketPriority,
      ticketDeptId,
      data
    );

    // Reset form
    setTicketTitle('');
    setTicketDesc('');
    setTicketPriority('low');
    setTicketDeptId('');
    setCustomResponses({});
    setShowCreateForm(false);
  };

  const handlePostReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    addTicketMessage(activeTicket.id, replyText, false);
    setReplyText('');
  };

  const updateCustomVal = (fId: string, value: string | boolean) => {
    setCustomResponses(prev => ({
      ...prev,
      [fId]: value
    }));
  };

  // Status mapping to steps in track dashboard
  const getProgressStateStep = (status: Ticket['status']): number => {
    switch (status) {
      case 'new': return 1;
      case 'investigating': return 2;
      case 'resolving': return 3;
      case 'resolved': return 4;
      case 'closed': return 5;
      default: return 1;
    }
  };

  const stepsList = [
    { num: 1, name: 'Ticket Received', label: 'Support queue' },
    { num: 2, name: 'Assessing', label: 'Core Diagnostics' },
    { num: 3, name: 'Investigating', label: 'Engineering fix' },
    { num: 4, name: 'Resolving', label: 'Resolution tests' },
    { num: 5, name: 'Successfully Resolved', label: 'Finished log' }
  ];

  const currentStepNum = activeTicket ? getProgressStateStep(activeTicket.status) : 0;

  return (
    <div className="flex-1 flex overflow-hidden bg-[#020617]">
      
      {/* List Queue Column */}
      <div className={`w-full lg:w-80 border-r border-slate-800 bg-[#070b13] flex flex-col shrink-0 ${activeTicketId || showCreateForm ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-white text-sm font-sans tracking-tight">Active Tickets</h3>
            <span className="text-[10px] font-mono bg-indigo-505/10 bg-indigo-500/10 text-indigo-400 py-0.5 px-2 rounded-full font-bold border border-indigo-500/20">
              {myTickets.length} logged
            </span>
          </div>

          <button
            onClick={() => {
              // Ensure reasonable defaults
              setTicketDeptId(departments[0]?.id || '');
              setShowCreateForm(true);
            }}
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(99,102,241,0.25)] transition-all duration-200"
          >
            <Plus className="h-4 w-4" /> Open Support Case
          </button>
        </div>

        {/* Scroll items panel */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-900 text-left">
          {myTickets.length > 0 ? (
            myTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  setActiveTicketId(t.id);
                  setShowCreateForm(false);
                }}
                className={`p-5 cursor-pointer border-l-4 transition-all ${
                  activeTicket?.id === t.id && !showCreateForm
                    ? 'bg-slate-800/25 border-indigo-500'
                    : 'hover:bg-slate-800/10 border-transparent'
                }`}
              >
                <div className="flex justify-between gap-2 items-center mb-1">
                  <span className="font-mono text-[10px] bg-slate-800 border border-slate-700 text-slate-350 font-bold px-1.5 py-0.2 rounded">
                    {t.id}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                    t.status === 'resolved' || t.status === 'closed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    t.status === 'new' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-400/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {t.status}
                  </span>
                </div>

                <h4 className="font-bold text-slate-205 text-slate-200 text-xs truncate leading-tight">{t.title}</h4>
                <p className="text-[10px] text-slate-450 mt-1">Logged: {new Date(t.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              You do not have any active support cases logged.
            </div>
          )}
        </div>
      </div>

      {/* Workspace Display Area */}
      <div className={`flex-1 overflow-hidden flex flex-col min-w-0 ${activeTicketId || showCreateForm ? 'flex' : 'hidden lg:flex'}`}>
        {showCreateForm ? (
          /* Case Creator Form Component configured dynamically depending on admin schema! */
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[#040810]">
            <div className="max-w-xl mx-auto space-y-6">
              
              {/* Back button for mobile */}
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="lg:hidden flex items-center gap-1 text-xs font-bold text-slate-450 text-slate-400 hover:text-white mb-2"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Case List
              </button>

              <div>
                <h3 className="text-lg font-extrabold font-sans text-white leading-tight">Create Professional Support Ticket</h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">Custom fields are mapped dynamically to custom schema setups.</p>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Ticket Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter short summarizing subject..."
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                    className="w-full border border-slate-850 bg-[#0e1726]/80 text-white p-2.5 text-xs rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-850"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Detailed Description *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide exact details of operational failure or question..."
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    className="w-full border border-slate-855 bg-[#0e1726]/80 text-white p-2.5 text-xs rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-850"
                  />
                </div>

                {/* Grid attributes */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Target Department *</label>
                    <select
                      required
                      value={ticketDeptId}
                      onChange={(e) => setTicketDeptId(e.target.value)}
                      className="w-full border border-slate-855 bg-[#0e1726]/80 rounded-lg text-slate-200 p-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="" className="bg-[#0f172a]">-- Choose department --</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id} className="bg-[#0f172a]">{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Issue Priority *</label>
                    <select
                      required
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value as Ticket['priority'])}
                      className="w-full border border-slate-855 bg-[#0e1726]/80 rounded-lg text-slate-200 p-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="low" className="bg-[#0f172a]">Low Support SLA</option>
                      <option value="medium" className="bg-[#0f172a]">Medium Standard SLA</option>
                      <option value="high" className="bg-[#0f172a]">High Executive SLA</option>
                      <option value="urgent" className="bg-[#0f172a]">Critical Infrastructure SLA</option>
                    </select>
                  </div>
                </div>

                {/* Dynamically build customization fields defined by admin schema! */}
                {templateFields.filter(f => !f.isDefault).length > 0 && (
                  <div className="pt-4 border-t border-slate-800 space-y-4">
                    <h4 className="text-[10px] font-bold text-indigo-400 tracking-widest font-mono uppercase">Dynamic Service Questions</h4>
                    
                    {templateFields.filter(f => !f.isDefault).map((field) => {
                      const val = customResponses[field.id] !== undefined ? customResponses[field.id] : '';
                      return (
                        <div key={field.id} className="text-xs">
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>

                          {field.type === 'text' && (
                            <input
                              type="text"
                              required={field.required}
                              placeholder={field.placeholder || 'Enter value...'}
                              value={val as string}
                              onChange={(e) => updateCustomVal(field.id, e.target.value)}
                              className="w-full border border-slate-800 p-2 text-xs rounded-lg bg-[#0e1726]/80 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-[#0e1726]"
                            />
                          )}

                          {field.type === 'textarea' && (
                            <textarea
                              required={field.required}
                              placeholder={field.placeholder || 'Explain details...'}
                              value={val as string}
                              onChange={(e) => updateCustomVal(field.id, e.target.value)}
                              className="w-full border border-slate-800 p-2 text-xs rounded-lg bg-[#0e1726]/80 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-[#0e1726]"
                              rows={3}
                            />
                          )}

                          {field.type === 'select' && (
                            <select
                              required={field.required}
                              value={val as string}
                              onChange={(e) => updateCustomVal(field.id, e.target.value)}
                              className="w-full border border-slate-800 p-2 text-xs rounded-lg bg-[#0e1726]/85 text-white focus:outline-none focus:ring-1 focus:ring-indigo-550 focus:bg-[#0e1726]"
                            >
                              <option value="" className="bg-[#0f172a]">-- Choose Option --</option>
                              {field.options?.map((opt, i) => (
                                <option key={i} value={opt} className="bg-[#0f172a]">{opt}</option>
                              ))}
                            </select>
                          )}

                          {field.type === 'checkbox' && (
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`check-${field.id}`}
                                checked={!!val}
                                onChange={(e) => updateCustomVal(field.id, e.target.checked)}
                                className="rounded text-indigo-650 focus:ring-indigo-500 h-4 w-4 bg-[#0e1726] border-slate-800"
                              />
                              <label htmlFor={`check-${field.id}`} className="text-xs text-slate-350 font-medium font-semibold">Yes / Enabled</label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex gap-4 pt-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs"
                  >
                    Discard Case
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold rounded-lg text-xs shadow-lg shadow-indigo-606/15"
                  >
                    Launch Priority Support Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : activeTicket ? (
          /* Ticket tracker interactive dashboard detail */
          <div className="flex-1 flex flex-col overflow-hidden bg-[#02050c] text-left">
            
            {/* Upper Interactive progress timeline tracking breadcrumb */}
            <div className="bg-[#090d16]/80 p-4 sm:p-6 border-b shrink-0 border-slate-800">
              <div className="max-w-4xl mx-auto">
                
                {/* Back button on mobile */}
                <button
                  type="button"
                  onClick={() => setActiveTicketId(null)}
                  className="lg:hidden flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 mb-4 px-3 py-1.5 bg-[#0e1726]/80 rounded-lg border border-slate-800/85"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Back to Case List
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 shadow-[0_0_8px_rgba(99,102,241,0.1)]">
                      {activeTicket.id}
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-white font-sans mt-1">{activeTicket.title}</h3>
                  </div>
                  
                  {/* Priority and category labels */}
                  <span className={`self-start sm:self-center text-[10px] font-sans font-bold uppercase py-1 px-3.5 rounded border ${
                    activeTicket.priority === 'urgent' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    activeTicket.priority === 'high' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    activeTicket.priority === 'medium' ? 'bg-indigo-500/10 text-indigo-400' :
                    'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {activeTicket.priority} Priority SLA
                  </span>
                </div>

                {/* Visual Stepper Tracker */}
                <div className="flex items-center justify-between relative mt-4">
                  {/* Timeline progress line bar */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-800 -z-10 rounded"></div>
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 -z-10 rounded transition-all duration-300 shadow-[0_0_8px_rgba(99,102,241,0.55)] cursor-pointer"
                    style={{ width: `${((currentStepNum - 1) / (stepsList.length - 1)) * 100}%` }}
                  ></div>

                  {stepsList.map((st) => {
                    const isPassed = st.num <= currentStepNum;
                    const isCurrent = st.num === currentStepNum;

                    return (
                      <div key={st.num} className="flex flex-col items-center">
                        <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs shadow border transition-all duration-300 ${
                          isPassed 
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.4)] scale-105' 
                            : 'bg-slate-900 text-slate-500 border-slate-800'
                        }`}>
                          {st.num}
                        </div>
                        <span className={`text-[8px] sm:text-[10px] font-bold mt-2 ${isCurrent ? 'text-indigo-400 font-extrabold' : 'text-slate-400 font-medium'}`}>
                          {st.name}
                        </span>
                        <span className="text-[7px] sm:text-[8px] text-slate-500 mt-0.5 block tracking-wider sm:tracking-widest uppercase font-mono">{st.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Split Screen Details vs Support Chat timeline */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
              {/* Context side cards */}
              <div className="w-full lg:w-80 bg-[#090d16]/30 border-b lg:border-b-0 lg:border-r p-6 overflow-y-visible lg:overflow-y-auto space-y-6 shrink-0 text-left border-slate-800">
                
                {/* SLA target update */}
                <div className="bg-[#0f172a]/50 p-4 rounded-xl border border-slate-800/80 space-y-3">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                    Target Resolution Goal
                  </span>
                  
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span className="font-bold text-slate-200">
                      {new Date(activeTicket.slaResolutionDeadline).toLocaleString()}
                    </span>
                  </div>

                  {activeTicket.isResolutionBreached ? (
                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded text-[10px] font-semibold flex items-center gap-1.5 shadow-[0_0_8px_rgba(244,63,94,0.15)] animate-pulse">
                      <ShieldAlert className="h-3.5 w-3.5 text-rose-400" /> High priority breach escalation applied.
                    </div>
                  ) : (
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-emerald-400 rounded text-[9px] font-bold font-mono text-center">
                      ✓ SLA COMPLIANT STATUS
                    </div>
                  )}
                </div>

                {/* Submited Template Details preview */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono">Case Details</h4>
                  
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <span className="text-slate-450 font-mono text-[9px] block">PROBLEM SUMMARY</span>
                      <p className="text-slate-205 text-slate-200 mt-1.5 bg-[#0a0f1d] p-3 rounded-lg border border-slate-800/80 leading-relaxed font-sans">{activeTicket.description}</p>
                    </div>

                    {Object.entries(activeTicket.customFields).map(([key, value]) => {
                      const matchedField = templateFields.find(f => f.id === key);
                      const label = matchedField ? matchedField.label : key;
                      return (
                        <div key={key} className="border-t border-slate-800 pt-3">
                          <span className="text-slate-450 font-mono text-[9px] block uppercase">{label}</span>
                          <span className="font-bold text-slate-250 block mt-1 bg-[#0a0f1d]/50 p-2 rounded border border-slate-850">
                            {typeof value === 'boolean' ? (value ? 'YES ✓' : 'NO ✗') : value.toString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Chat timeline message thread */}
              <div className="flex-1 flex flex-col min-w-0 bg-[#02050c] min-h-[450px] lg:min-h-0">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  
                  {/* Alert banner summarizing client-facing */}
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-mono text-indigo-300 flex items-center gap-2">
                    <BadgeInfo className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Every reply posted below sends dynamic triggers to your registered email updates.</span>
                  </div>

                  {activeMessages.length > 0 ? (
                    activeMessages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex gap-3 max-w-[80%] ${
                          m.senderId === currentUser.id ? 'ml-auto flex-row-reverse' : ''
                        }`}
                      >
                        <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-xs shrink-0 font-medium font-bold text-slate-205 text-slate-100">
                          {m.senderRole === 'user' ? '👤' : '⚡'}
                        </div>

                        <div>
                          <div className={`text-[10px] text-slate-400 mb-1 font-mono flex items-center gap-1 ${
                            m.senderId === currentUser.id ? 'justify-end' : ''
                          }`}>
                            <span className="font-bold text-slate-250">{m.senderName}</span>
                            <span>•</span>
                            <span>{new Date(m.createdAt).toLocaleTimeString()}</span>
                          </div>

                          <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                            m.senderId === currentUser.id
                              ? 'bg-gradient-to-tr from-indigo-650 to-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.15)] border-l border-indigo-400'
                              : 'bg-[#0f172a] text-slate-205 text-slate-200 border border-slate-800'
                          }`}>
                            {m.message}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-500 text-xs font-mono">
                      No updates written. Submit a query below to prompt the staff.
                    </div>
                  )}
                </div>

                {/* Reply panel form */}
                <form onSubmit={handlePostReply} className="p-4 bg-[#060a12] border-t border-slate-800 shrink-0 flex gap-3">
                  <input
                    type="text"
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Comment to message assigned operators of this support desk..."
                    className="flex-1 border bg-[#0d1322] border-slate-850 p-2.5 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-5 rounded-xl flex items-center gap-1 shrink-0"
                  >
                    Post Reply
                  </button>
                </form>

              </div>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 bg-[#02050c] text-slate-505 text-slate-500 text-xs font-mono font-bold tracking-widest">
            CHOOSE CUSTOM SUPPORT TICKET ABOVE OR OPEN A NEW SUPPORT CASE.
          </div>
        )}
      </div>

    </div>
  );
};
