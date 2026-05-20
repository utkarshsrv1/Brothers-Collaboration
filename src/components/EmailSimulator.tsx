import React, { useState } from 'react';
import { useTickets } from '../context/TicketContext';
import { Mail, Send, Award, ArrowRight, CornerDownRight, CheckCircle, ShieldAlert } from 'lucide-react';
import { Ticket } from '../types';

export const EmailSimulator: React.FC = () => {
  const {
    currentUser,
    emailLogs,
    simulateInboundEmail
  } = useTickets();

  // Email composer values
  const [senderName, setSenderName] = useState(currentUser.name);
  const [senderEmail, setSenderEmail] = useState(currentUser.email);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<Ticket['priority']>('low');

  const [notificationMsg, setNotificationMsg] = useState('');

  const handleSendCompose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim() || !senderEmail.trim()) return;

    // Simulate inbound trigger
    simulateInboundEmail(
      senderEmail,
      senderName,
      subject,
      body,
      priority
    );

    // Reset fields
    setSubject('');
    setBody('');
    setNotificationMsg(`Success! Email successfully routed to support@firm.com. A ticket has been parsed and auto-created! Go to Support Client or Agent workspace tabs to view it.`);
    setTimeout(() => setNotificationMsg(''), 6050);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden bg-[#020617]">
      
      {/* Left Pane: Compose Incoming Support Mail */}
      <div className="w-full lg:w-1/2 p-6 sm:p-10 bg-[#070b13] border-b lg:border-b-0 lg:border-r overflow-y-visible lg:overflow-y-auto text-left border-slate-800">
        <div className="max-w-md mx-auto space-y-6">
          <div>
            <span className="text-[10px] font-mono text-purple-400 font-bold bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded shadow-[0_0_12px_rgba(168,85,247,0.1)]">
              SMTP ROUTER TEST LABS
            </span>
            <h3 className="text-lg font-extrabold text-white font-sans mt-3 leading-tight">Mail-to-Ticket Gateway</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Test "auto-ticket creation via email" by composing a support message below. Our routing parser will process its configurations and register it.
            </p>
          </div>

          {notificationMsg && (
            <div className="p-3 bg-purple-500/10 text-purple-300 border border-purple-550/20 rounded-xl text-xs font-semibold animate-fadeIn leading-relaxed shadow-[0_0_12px_rgba(168,85,247,0.15)]">
              {notificationMsg}
            </div>
          )}

          <form onSubmit={handleSendCompose} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Your Sender Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liam Smith"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full border border-slate-800 p-2 text-xs rounded-lg bg-[#131b2ef0] text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Your Sender Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. liam@gmail.com"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full border border-slate-800 p-2 text-xs rounded-lg bg-[#131b2ef0] text-slate-200 font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">To Support Gateway Address</label>
                <input
                  type="text"
                  disabled
                  value="support@firm.com (Mailed auto-trigger)"
                  className="w-full border border-slate-800 p-2 text-xs rounded-lg bg-slate-900/55 font-bold text-purple-300 cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Proposed Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Ticket['priority'])}
                className="w-full border border-slate-800 p-2 text-xs rounded-lg bg-[#131b2ef5] text-slate-205 text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="low" className="bg-[#0f172a]">Low priority (Basic SLA routing)</option>
                <option value="medium" className="bg-[#0f172a]">Medium priority (Business SLA routing)</option>
                <option value="high" className="bg-[#0f172a]">High priority (Standard High SLA routing)</option>
                <option value="urgent" className="bg-[#0f172a]">Urgent priority (Critical Infrastructure SLA routing)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Email Subject Line *</label>
              <input
                type="text"
                required
                placeholder="e.g. API Access key issue on production server"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-slate-800 p-2.5 text-xs rounded-lg bg-[#131b2e]/90 text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder-slate-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Email Body Details *</label>
              <textarea
                required
                rows={5}
                placeholder="Tell us what you need in detail so SLA schedules can instantiate..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full border border-slate-800 p-2.5 text-xs rounded-lg bg-[#131b2e]/90 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.22)] transition-all duration-200"
            >
              <Send className="h-4 w-4" /> Ship Inbound Email
            </button>
          </form>
        </div>
      </div>

      {/* Right Pane: Logs of all transactional notices (Outbound SMTP logs) */}
      <div className="w-full lg:w-1/2 p-6 sm:p-10 bg-[#020617] border-none overflow-y-visible lg:overflow-y-auto text-left relative">
        <div className="max-w-md mx-auto space-y-6">
          <div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              NOTIFICATION EXCHANGE LOOPS
            </span>
            <h3 className="text-xl font-bold text-white font-sans mt-2.5">User Email Notification Logs</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Review real-time updates dispatched to clients such as Ticket Intake logs, SLA Escalation warning letters, and Solved Reports notifications.
            </p>
          </div>

          <div className="space-y-4">
            {emailLogs.length > 0 ? (
              emailLogs.map((log) => {
                const isInbound = log.direction === 'inbound';
                return (
                  <div 
                    key={log.id} 
                    className={`p-4 rounded-xl border border-slate-800/80 text-xs flex flex-col gap-2 relative ${
                      isInbound 
                        ? 'bg-purple-950/20 border-purple-900/40 text-purple-100' 
                        : 'bg-[#0f172a]/60 text-slate-100'
                    }`}
                  >
                    {/* Direction Indicators */}
                    <div className="flex items-center justify-between font-mono text-[9px] text-slate-400 border-b border-slate-800/80 pb-1.5">
                      <div className="flex items-center gap-1">
                        <Mail className={`h-3 w-3 ${isInbound ? 'text-purple-400' : 'text-slate-400'}`} />
                        <span>{isInbound ? 'INBOUND EMAIL RECEIVED' : 'OUTBOUND TRANSACTION REPORT'}</span>
                      </div>
                      <span className="opacity-80">{new Date(log.sentAt).toLocaleTimeString()}</span>
                    </div>

                    <div className="space-y-1 font-mono text-[10px] text-slate-350">
                      <div><span className="text-slate-500">FROM:</span> {log.fromEmail}</div>
                      <div><span className="text-slate-500">TO: </span> {log.toEmail}</div>
                      <div><span className="text-slate-300 font-bold">SUBJ:</span> {log.subject}</div>
                    </div>

                    <div className="bg-[#070b13] p-2.5 rounded border border-slate-800/50 text-slate-300 leading-relaxed font-sans text-[11px] whitespace-pre-wrap shadow-inner">
                      {log.body}
                    </div>

                    {/* Badge alert for SLA Escalations */}
                    {log.subject.includes('[SLA Escalation Alert]') && (
                      <div className="absolute top-2 right-2 bg-red-500/10 text-red-400 border border-red-500/20 text-[8px] font-mono py-0.5 px-1.5 rounded inline-flex items-center gap-1 uppercase font-bold shadow-[0_0_8px_rgba(239,68,68,0.2)] animate-pulse">
                        <ShieldAlert className="h-3 w-3 text-red-400" /> Urgent Escalation
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                No notification logs are recorded. Use the operations portal to dispatch messages or test and send composing scripts.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
