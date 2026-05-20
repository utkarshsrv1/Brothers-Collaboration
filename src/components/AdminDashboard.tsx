import React, { useState } from 'react';
import { useTickets } from '../context/TicketContext';
import { SLARule, TemplateField, UserProfile, Department, Team, WorkflowState, CustomReport } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { 
  Plus, Trash, Clock, ShieldAlert, Award, FileText, Settings, Users, 
  ArrowUpRight, CheckCircle2, Building, Layers, RotateCcw, Calendar, 
  HelpCircle, Sparkles, Filter, FileBarChart2 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    tickets,
    allUsers,
    departments,
    teams,
    workflowStates,
    customReports,
    slaRules,
    templateFields,
    viewDensity,
    assignmentMode,
    setAssignmentMode,
    businessHoursType,
    setBusinessHoursType,
    businessHoursStart,
    setBusinessHoursStart,
    businessHoursEnd,
    setBusinessHoursEnd,
    updateSlaRule,
    addTemplateField,
    removeTemplateField,
    addDepartment,
    deleteDepartment,
    addTeam,
    deleteTeam,
    addUser,
    deleteUser,
    addWorkflowState,
    deleteWorkflowState,
    addCustomReport,
    deleteCustomReport
  } = useTickets();

  // Active Admin Sub-Tab
  const [adminTab, setAdminTab] = useState<'metrics' | 'sla' | 'departments' | 'workflow' | 'users' | 'template' | 'reports'>('metrics');

  // New Department States
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  // New Team States
  const [teamName, setTeamName] = useState('');
  const [teamDeptId, setTeamDeptId] = useState('');
  const [teamDesc, setTeamDesc] = useState('');

  // New User Invite States
  const [invName, setInvName] = useState('');
  const [invEmail, setInvEmail] = useState('');
  const [invPassword, setInvPassword] = useState('password123');
  const [invRole, setInvRole] = useState<'admin' | 'agent' | 'user'>('agent');
  const [invDeptId, setInvDeptId] = useState('');
  const [invTeamId, setInvTeamId] = useState('');
  const [invWHStart, setInvWHStart] = useState('09:00');
  const [invWHEnd, setInvWHEnd] = useState('17:00');

  // New Workflow State Options
  const [wfName, setWfName] = useState('');
  const [wfCategory, setWfCategory] = useState<WorkflowState['category']>('in-progress');
  const [wfColor, setWfColor] = useState('bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded');

  // New Custom Report State Option
  const [repName, setRepName] = useState('');
  const [repType, setRepType] = useState<CustomReport['metricType']>('sla_breach');
  const [repTimeframe, setRepTimeframe] = useState<CustomReport['timeframe']>('week');
  const [repDeptId, setRepDeptId] = useState('');

  // Custom Template Field Creator states
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<TemplateField['type']>('text');
  const [newRequired, setNewRequired] = useState(false);
  const [newOptsStr, setNewOptsStr] = useState(''); // COMMA-separated list

  // Access Guard
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#020617] font-sans">
        <div className="max-w-md p-8 bg-[#070b13] border border-red-500/20 rounded-2xl shadow-[0_0_24px_rgba(239,68,68,0.12)] flex flex-col items-center">
          <div className="p-4 bg-red-500/10 rounded-full text-red-400 border border-red-500/20 mb-4 animate-pulse">
            <ShieldAlert className="h-10 w-10 text-red-500" />
          </div>
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Access Restricted to Administrator</h3>
          <p className="text-xs text-slate-400 mt-3 leading-normal">
            Your active identity is currently set to <span className="font-mono text-red-300 font-bold">{currentUser?.name || 'Anonymous'} ({currentUser?.role?.toUpperCase() || 'USER'})</span>. Use the workspace switcher in the sidebar to impersonate <span className="text-slate-100 font-bold">Sarah Connor (Admin)</span> to open the administrator config.
          </p>
        </div>
      </div>
    );
  }

  // Calculations for Metrics
  const totalTickets = tickets.length;
  const newTickets = tickets.filter((t) => t.status === 'new').length;
  const inProgressTickets = tickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed' && t.status !== 'new').length;
  const resolvedTickets = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;
  
  const responseBreaches = tickets.filter((t) => t.isResponseBreached).length;
  const resolutionBreaches = tickets.filter((t) => t.isResolutionBreached).length;
  const activeBreaches = tickets.filter((t) => (t.isResolutionBreached || t.isResponseBreached) && t.status !== 'resolved' && t.status !== 'closed').length;

  // Pie chart status breakdown data
  const statusChartData = [
    { name: 'New/Waiting', value: newTickets || 1, color: '#6366f1' },
    { name: 'Active Backlog', value: inProgressTickets || 1, color: '#f59e0b' },
    { name: 'Completed SLA', value: resolvedTickets || 1, color: '#10b981' }
  ];

  // priority chart
  const priorityChartData = ['low', 'medium', 'high', 'urgent'].map(prio => {
    const matching = tickets.filter(t => t.priority === prio);
    const breached = matching.filter(t => t.isResolutionBreached || t.isResponseBreached).length;
    return {
      name: prio.toUpperCase(),
      Total: matching.length,
      Breached: breached
    };
  });

  // Agents performance chart
  const agents = allUsers.filter(u => u.role === 'agent');
  const agentPerformanceData = agents.map(agent => {
    const assignedTickets = tickets.filter(t => t.primaryAgentId === agent.id || t.secondaryAgentId === agent.id);
    const resolved = assignedTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
    const breached = assignedTickets.filter(t => t.isResolutionBreached || t.isResponseBreached).length;
    
    return {
      name: agent.name.split(' ')[0],
      Assigned: assignedTickets.length,
      Resolved: resolved,
      Breached: breached
    };
  });

  // Action Handlers
  const handleCreateField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    const options = newOptsStr ? newOptsStr.split(',').map(o => o.trim()).filter(Boolean) : undefined;
    addTemplateField({
      label: newLabel,
      type: newType,
      required: newRequired,
      placeholder: `Enter ${newLabel.toLowerCase()}...`,
      options
    });
    setNewLabel('');
    setNewOptsStr('');
    setNewRequired(false);
  };

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;
    addDepartment(deptName, deptDesc);
    setDeptName('');
    setDeptDesc('');
  };

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !teamDeptId) return;
    addTeam(teamName, teamDeptId, teamDesc);
    setTeamName('');
    setTeamDeptId('');
    setTeamDesc('');
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName.trim() || !invEmail.trim()) return;
    addUser(
      invName,
      invEmail,
      invRole,
      invPassword,
      invDeptId || undefined,
      invTeamId || undefined,
      invWHStart,
      invWHEnd
    );
    setInvName('');
    setInvEmail('');
    setInvPassword('password123');
    setInvDeptId('');
    setInvTeamId('');
  };

  const handleAddWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wfName.trim()) return;
    addWorkflowState(wfName, wfCategory, wfColor);
    setWfName('');
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repName.trim()) return;
    addCustomReport(repName, repType, repTimeframe, repDeptId || undefined);
    setRepName('');
    setRepDeptId('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#020617] text-left">
      
      {/* Header operations bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b pb-6 mb-8 gap-4 border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold font-sans text-white tracking-tight flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-400 rotate-45" /> SLA Administration Center
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Define workflows, assign teams, edit dynamic SLA thresholds, and view customized reports.</p>
        </div>
        
        {/* Navigation Selector Tabs */}
        <div className="flex flex-wrap bg-[#070b13] rounded-xl p-1 border border-slate-800/80 gap-0.5 max-w-fit">
          {(['metrics', 'sla', 'departments', 'workflow', 'users', 'template', 'reports'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setAdminTab(tab)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all capitalize ${
                adminTab === tab
                  ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.25)] font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
              }`}
            >
              {tab === 'sla' ? 'SLA Rules' : tab === 'departments' ? 'Depts & Teams' : tab === 'workflow' ? 'Workflows' : tab === 'template' ? 'Case Fields' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW DENSITY BANNER DETECTED */}
      {viewDensity === 'simple' && (
        <div className="mb-6 p-3 bg-indigo-505/10 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-xs text-slate-400 font-mono flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-bold uppercase"><Sparkles className="h-4 w-4 text-indigo-400 shrink-0" /> Minimalist Layout Mode Enabled</span>
          <span>(Toggle layout theme inside Sidebar to show full telemetry dashboards)</span>
        </div>
      )}

      {/* METRICS & ANALYSIS PANEL */}
      {adminTab === 'metrics' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Main counts grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-[#070b13] p-5 rounded-2xl border border-slate-800 shadow-md">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Breached Cases</span>
              <p className="text-2xl sm:text-3xl font-extrabold font-sans text-red-500 mt-2">{activeBreaches}</p>
              <div className="text-[9px] text-red-400/80 font-bold font-mono mt-1 uppercase">SLA Breach Warnings Active</div>
            </div>

            <div className="bg-[#070b13] p-5 rounded-2xl border border-slate-800 shadow-md">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Incoming Queue</span>
              <p className="text-2xl sm:text-3xl font-extrabold font-sans text-indigo-400 mt-2">{newTickets}</p>
              <div className="text-[9px] text-indigo-400/80 font-bold font-mono mt-1 uppercase">Unassigned Tickets</div>
            </div>

            <div className="bg-[#070b13] p-5 rounded-2xl border border-slate-800 shadow-md">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">SLA Resolved Ratio</span>
              <p className="text-2xl sm:text-3xl font-extrabold font-sans text-emerald-400 mt-2">{resolvedTickets} <span className="text-xs text-slate-500 font-medium">/ {totalTickets}</span></p>
              <div className="text-[9px] text-emerald-400/80 font-bold font-mono mt-1 uppercase">
                {totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(0) : 0}% compliance output
              </div>
            </div>

            <div className="bg-[#070b13] p-5 rounded-2xl border border-slate-800 shadow-md">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Round-Robin Logic</span>
              <p className="text-xl sm:text-2xl font-extrabold font-sans text-blue-400 mt-2 truncate uppercase">{assignmentMode === 'round-robin' ? 'AUTOMATED' : 'MANUAL'}</p>
              <div className="text-[9px] text-blue-400/80 font-bold font-mono mt-1 uppercase">Auto routing dispatch</div>
            </div>
          </div>

          {/* TELEMETRY CHARTS (Visible when density is professional) */}
          {viewDensity === 'professional' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6sm:gap-8">
              
              {/* Pie status */}
              <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
                <h3 className="text-xs font-bold text-slate-350 uppercase tracking-widest font-mono mb-4">Ticket Fulfillment Status Map</h3>
                <div className="h-60 flex flex-col items-center justify-center">
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#090e1a', borderColor: '#1e293b' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex gap-4 mt-2 text-[9px] font-mono font-bold">
                    {statusChartData.map((d, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-slate-300">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                        <span>{d.name} ({d.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bar priority */}
              <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md">
                <h3 className="text-xs font-bold text-slate-350 uppercase tracking-widest font-mono mb-4">SLA Breaches against Priority Volume</h3>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priorityChartData}>
                      <XAxis dataKey="name" stroke="#475569" fontSize={10} />
                      <YAxis stroke="#475569" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#090e1a', borderColor: '#1e293b' }} />
                      <Bar dataKey="Total" fill="#1e293b" radius={[4, 4, 0, 0]} name="Ticket Vol" />
                      <Bar dataKey="Breached" fill="#f87171" radius={[4, 4, 0, 0]} name="SLA Breached" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Agent assignment chart */}
              <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md lg:col-span-2">
                <h3 className="text-xs font-bold text-slate-350 uppercase tracking-widest font-mono mb-4">Workforce SLA Assignments & Outcomes</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agentPerformanceData} layout="vertical">
                      <XAxis type="number" stroke="#475569" fontSize={10} />
                      <YAxis dataKey="name" type="category" stroke="#475569" fontSize={10} width={80} />
                      <Tooltip contentStyle={{ backgroundColor: '#090e1a', borderColor: '#1e293b' }} />
                      <Bar dataKey="Assigned" fill="#6366f1" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="Resolved" fill="#10b981" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="Breached" fill="#ef4444" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center bg-[#070b13] border border-slate-800/80 rounded-2xl text-xs text-slate-400 font-mono">
              Charts and advanced visual telemetry are hidden in Minimalist Layout. Toggle Professional view for full visual graphs.
            </div>
          )}
        </div>
      )}

      {/* SLA CALCULATION & ALGORITHMS */}
      {adminTab === 'sla' && (
        <div className="space-y-6 sm:space-y-8 animate-fadeIn">
          {/* Dispatch Logic Switch & Availability Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Dispatch Engine */}
            <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
                  <RotateCcw className="h-5 w-5 rotate-180" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest font-mono text-white">SLA Dispatcher Assignment Mode</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Determine how new incoming help requests are channeled. Direct or load-balanced.</p>
                </div>
              </div>

              <div className="pt-2">
                <select
                  value={assignmentMode}
                  onChange={(e) => setAssignmentMode(e.target.value as 'manual' | 'round-robin')}
                  className="w-full bg-[#1e293b]/70 border border-slate-750 rounded-xl p-3 text-xs text-slate-100 font-bold focus:outline-none"
                >
                  <option value="manual" className="bg-[#090d16]">Manual Queue Assignment (Self-Service desk)</option>
                  <option value="round-robin" className="bg-[#090d16]">Dynamic Round-Robin Auto Routing (Load-Balanced dispatcher)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                  {assignmentMode === 'round-robin' 
                    ? "✓ Automatic Routing is ACTIVE. New support cases belong to the selected department will be auto-assigned to the online/online agent with the lowest active casework load." 
                    : "✗ Manual Assignment is ACTIVE. Tickets will land at the general inbox where supervisors must manually drag-and-drop specialists."
                  }
                </p>
              </div>
            </div>

            {/* Business hours schedule clock */}
            <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest font-mono text-white">Service SLA Calendar Hours</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Adjust how deadline clocks run. Continuous or restricted backends.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase mb-1">Calendar Mode</label>
                  <select
                    value={businessHoursType}
                    onChange={(e) => setBusinessHoursType(e.target.value as '24_7' | 'business_hours')}
                    className="w-full bg-[#1e293b]/70 border border-slate-750 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="24_7">24/7/365 Continuous SLA</option>
                    <option value="business_hours">Business Hours Calendar</option>
                  </select>
                </div>

                {businessHoursType === 'business_hours' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-mono text-slate-400 mb-1">Start Hour</label>
                      <input
                        type="text"
                        value={businessHoursStart}
                        onChange={(e) => setBusinessHoursStart(e.target.value)}
                        placeholder="e.g. 09:00"
                        className="w-full bg-[#1e293b]/50 border border-slate-700 p-2 text-xs rounded text-slate-100 text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-slate-400 mb-1">End Hour</label>
                      <input
                        type="text"
                        value={businessHoursEnd}
                        onChange={(e) => setBusinessHoursEnd(e.target.value)}
                        placeholder="e.g. 17:00"
                        className="w-full bg-[#1e293b]/50 border border-slate-700 p-2 text-xs rounded text-slate-100 text-center"
                      />
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Determines operational calculation constraints for response breach times vs resolution limits.
              </p>
            </div>
          </div>

          {/* Dynamic priority rules table */}
          <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md">
            <h3 className="text-sm font-bold text-white mb-1.5">SLA SLA Escalation Policies</h3>
            <p className="text-xs text-slate-400 mb-6">Modify calculations targets and select designated technical specialists to auto-escalate breached tickets.</p>

            <div className="space-y-4">
              {slaRules.map((rule) => {
                return (
                  <div key={rule.id} className="p-4 sm:p-5 bg-[#0c1221] rounded-xl border border-slate-800/80 flex flex-col md:flex-row gap-4 md:gap-6 justify-between items-start md:items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`uppercase text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-transparent ${
                          rule.priority === 'urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          rule.priority === 'high' ? 'bg-amber-500/10 text-amber-400' :
                          rule.priority === 'medium' ? 'bg-indigo-500/10 text-indigo-400' :
                          'bg-slate-850'
                        }`}>
                          {rule.priority}
                        </span>
                        <h4 className="font-bold text-white text-xs">{rule.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        First Response Target: <span className="text-indigo-400 font-bold">{rule.responseTimeMin} mins</span> | Full Resolution Target: <span className="text-emerald-450 text-emerald-400 font-semibold">{rule.resolutionTimeMin} mins</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                      <div>
                        <label className="block text-[8px] font-mono text-slate-400 uppercase">Resp (Mins)</label>
                        <input
                          type="number"
                          value={rule.responseTimeMin}
                          onChange={(e) => updateSlaRule(rule.id, { responseTimeMin: Number(e.target.value) })}
                          className="w-20 bg-[#131b2e] border border-slate-750 rounded p-1.5 text-xs text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-mono text-slate-400 uppercase font-medium">Resolv (Mins)</label>
                        <input
                          type="number"
                          value={rule.resolutionTimeMin}
                          onChange={(e) => updateSlaRule(rule.id, { resolutionTimeMin: Number(e.target.value) })}
                          className="w-20 bg-[#131b2e] border border-slate-750 rounded p-1.5 text-xs text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-mono text-slate-400 uppercase">Escalate Backup</label>
                        <select
                          value={rule.escalationAgentId}
                          onChange={(e) => updateSlaRule(rule.id, { escalationAgentId: e.target.value })}
                          className="bg-[#131b2e] border border-slate-750 rounded p-1.5 text-xs text-slate-205 text-slate-200"
                        >
                          {allUsers.filter(u => u.role === 'agent').map(ag => (
                            <option key={ag.id} value={ag.id}>{ag.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DEPARTMENTS, TEAMS AND GROUPS */}
      {adminTab === 'departments' && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Departments Controller */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md lg:col-span-2">
              <h3 className="text-sm font-bold text-white mb-1">Company Specialty Departments</h3>
              <p className="text-xs text-slate-400 mb-6">Departments serve as the highest organizational taxonomy layer inside your Freshworks workspace.</p>

              <div className="space-y-3.5">
                {departments.map(dept => {
                  const deptTeams = teams.filter(t => t.departmentId === dept.id);
                  const deptAgents = allUsers.filter(u => u.departmentId === dept.id);

                  return (
                    <div key={dept.id} className="p-4 bg-[#0c1221] rounded-xl border border-slate-800/80 flex justify-between items-center text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-indigo-400" />
                          <h4 className="font-bold text-slate-100 text-xs">{dept.name}</h4>
                        </div>
                        <p className="text-slate-400 mt-1">{dept.description}</p>
                        <div className="mt-2 text-[10px] text-slate-500 font-mono flex gap-4">
                          <span>👤 {deptAgents.length} Agents Logged</span>
                          <span>🏢 {deptTeams.length} Operational Teams</span>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteDepartment(dept.id)}
                        className="text-rose-400 hover:text-rose-300 p-2 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/20 transition-all font-semibold"
                        title="Delete Department"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add department form */}
            <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md h-fit">
              <h3 className="text-xs font-bold text-white mb-1 uppercase font-mono tracking-widest text-indigo-400">Fresh Department</h3>
              <p className="text-xs text-slate-450 mb-4 leading-normal">Register a dynamic operational department category.</p>

              <form onSubmit={handleAddDept} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Dept Identifier name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sales Diagnostics"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    className="w-full bg-[#131b2e] border border-slate-750 p-2.5 rounded text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">General Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description..."
                    value={deptDesc}
                    onChange={(e) => setDeptDesc(e.target.value)}
                    className="w-full bg-[#131b2e] border border-slate-750 p-2 rounded text-white focus:outline-none"
                  />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded font-bold text-xs text-white">
                  Add Department Category
                </button>
              </form>
            </div>
          </div>

          {/* Teams Controller */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md lg:col-span-2">
              <h3 className="text-sm font-bold text-white mb-2">Internal Department Working Teams</h3>
              <p className="text-xs text-slate-400 mb-6">Operational Teams organize agents within a department into sub-disciplinary cohorts (e.g. Tier 2, Billing).</p>

              <div className="space-y-3.5">
                {teams.length > 0 ? (
                  teams.map(team => {
                    const deptName = departments.find(d => d.id === team.departmentId)?.name || 'N/A';
                    const teamAgents = allUsers.filter(u => u.teamId === team.id);

                    return (
                      <div key={team.id} className="p-4 bg-[#0c1221] rounded-xl border border-slate-800/80 flex justify-between items-center text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-amber-400" />
                            <h4 className="font-bold text-slate-150 text-slate-200 text-xs">{team.name}</h4>
                            <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase font-semibold">
                              {deptName}
                            </span>
                          </div>
                          {team.description && <p className="text-slate-400 mt-1">{team.description}</p>}
                          <div className="mt-2 text-[10px] text-slate-500 font-mono">
                            <span>👥 {teamAgents.length} Agents Assigned</span>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteTeam(team.id)}
                          className="text-rose-455 text-rose-450 hover:text-rose-300 p-2 hover:bg-rose-500/10 rounded-lg transition-all"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="p-6 text-center text-slate-500 text-xs font-mono">No operational subteams configured.</p>
                )}
              </div>
            </div>

            {/* Add Team Custom */}
            <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md h-fit">
              <h3 className="text-xs font-bold text-white mb-1 uppercase font-mono tracking-widest text-amber-400">Define Team</h3>
              <p className="text-xs text-slate-455 mb-4 leading-normal">Configure a sub-disciplinary squad for specific routing logic.</p>

              <form onSubmit={handleAddTeam} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 col">Squad / Team Identifier Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Accounts Escalation Desk"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full bg-[#131b2e] border border-slate-750 p-2.5 rounded text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-200 font-bold mb-1">Target Department *</label>
                  <select
                    required
                    value={teamDeptId}
                    onChange={(e) => setTeamDeptId(e.target.value)}
                    className="w-full bg-[#1e293b]/70 border border-slate-750 p-2.5 rounded text-white text-xs focus:outline-none"
                  >
                    <option value="">-- Choose target department --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Specialization Description</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Billing disputes tier 2 checks..."
                    value={teamDesc}
                    onChange={(e) => setTeamDesc(e.target.value)}
                    className="w-full bg-[#131b2e] border border-slate-750 p-2 rounded text-white focus:outline-none"
                  />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-amber-500/80 to-amber-600/95 hover:from-amber-600 hover:to-amber-700 py-2.5 rounded font-bold text-xs text-white">
                  Add Operational Team
                </button>
              </form>
            </div>
          </div>

        </div>
      )}

      {/* TICKET WORKFLOW states BOARD */}
      {adminTab === 'workflow' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md lg:col-span-2">
              <h3 className="text-sm font-bold text-white mb-1">Ticket Ticketing Workflow States</h3>
              <p className="text-xs text-slate-400 mb-6">Manage the state cycles of customer cases. Agents can choose from these statuses with operators' remarks.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {workflowStates.map(wf => {
                  const ticketsInState = tickets.filter(t => t.status === wf.id).length;
                  return (
                    <div key={wf.id} className="p-4 bg-[#0c1221] rounded-xl border border-slate-800/80 flex items-center justify-between">
                      <div className="text-left">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${wf.color}`}>
                          {wf.name}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-2 font-mono uppercase">Category Group: {wf.category}</p>
                        <p className="text-[10px] text-slate-500 font-bold mt-1 font-mono">{ticketsInState} tickets currently active</p>
                      </div>

                      {/* Prevent deleting default states to avoid compilation bugs */}
                      {!['new', 'investigating', 'resolving', 'resolved', 'closed', 'on-hold'].includes(wf.id) ? (
                        <button
                          onClick={() => deleteWorkflowState(wf.id)}
                          className="text-red-400 hover:text-red-350 p-2 hover:bg-slate-800 rounded-lg transition-all"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-[8px] font-mono text-slate-500 bg-slate-850 px-1.5 py-0.5 rounded">Core state</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Custom State Form */}
            <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md h-fit">
              <h3 className="text-xs font-bold text-white mb-1 uppercase font-mono tracking-widest text-indigo-400">Extend Workflow</h3>
              <p className="text-xs text-slate-455 mb-4 leading-normal font-sans">Build customized state triggers for your desk.</p>

              <form onSubmit={handleAddWorkflow} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Workflow Status Display Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pending Third-party fix"
                    value={wfName}
                    onChange={(e) => setWfName(e.target.value)}
                    className="w-full bg-[#131b2e] border border-slate-750 p-2.5 rounded text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category Group Map *</label>
                  <select
                    value={wfCategory}
                    onChange={(e) => setWfCategory(e.target.value as WorkflowState['category'])}
                    className="w-full bg-[#1e293b]/75 border border-slate-750 p-2.5 rounded text-white"
                  >
                    <option value="open">Open (Awaiting triage)</option>
                    <option value="in-progress">In Progress (Active diagnostics)</option>
                    <option value="on-hold">On Hold (Pending feedback block)</option>
                    <option value="resolved">Resolved (Fix implemented)</option>
                    <option value="closed">Closed (Completely finished log)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Visual Label Color Scheme</label>
                  <select
                    value={wfColor}
                    onChange={(e) => setWfColor(e.target.value)}
                    className="w-full bg-[#1e293b]/75 border border-slate-750 p-2.5 rounded text-white"
                  >
                    <option value="bg-violet-500/10 text-violet-400 border border-violet-505/20 px-2 py-0.5 rounded">Vivid Purple Accent</option>
                    <option value="bg-indigo-500/10 text-indigo-400 border border-indigo-505/20 px-2 py-0.5 rounded">Vibrant Indigo Accent</option>
                    <option value="bg-pink-500/10 text-pink-400 border border-pink-500/20 px-2 py-0.5 rounded">Fuchsia Pink Accent</option>
                    <option value="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">Golden Amber Accent</option>
                    <option value="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">Emerald Green Accent</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-indigo-650 hover:bg-indigo-700 py-2.5 rounded font-bold text-xs text-white">
                  Add Dynamic Workflow Status
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED USER DIRECTORY & CREATE TEAM-MEMBERS PANEL */}
      {adminTab === 'users' && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Create User/agent profile section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md lg:col-span-2">
              <h3 className="text-sm font-bold text-white mb-1.5">Official Workforce Directory & Coverage Logs</h3>
              <p className="text-xs text-slate-400 mb-6">Create, configure profiles, and see real-time working hours parameters for active specialists.</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-450 uppercase tracking-widest">
                      <th className="py-2.5 px-3">Specialist Identity</th>
                      <th className="py-2.5 px-3">Role Grade</th>
                      <th className="py-2.5 px-3">Group Department</th>
                      <th className="py-2.5 px-3">SLA Working Hours</th>
                      <th className="py-2.5 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-200">
                    {allUsers.map(user => {
                      const dName = departments.find(d => d.id === user.departmentId)?.name || 'General';
                      const tName = teams.find(t => t.id === user.teamId)?.name || '';

                      return (
                        <tr key={user.id} className="hover:bg-slate-800/10">
                          <td className="py-3 px-3 flex items-center gap-2">
                            <span className="text-lg">{user.avatar || '🎯'}</span>
                            <div className="text-left">
                              <h5 className="font-bold font-sans text-xs">{user.name}</h5>
                              <p className="font-mono text-[10px] text-slate-400">{user.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border uppercase text-center ${
                              user.role === 'admin' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              user.role === 'agent' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              'bg-indigo-500/10 text-indigo-400 border-indigo-400/20'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <p className="font-bold">{dName}</p>
                            {tName && <p className="text-[9px] text-slate-500 font-medium tracking-wide font-mono uppercase">{tName}</p>}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-400 leading-tight">
                            {user.workingHoursStart ? (
                              <div>
                                <span className="font-bold text-white">{user.workingHoursStart} - {user.workingHoursEnd}</span>
                                <p className="text-[9px] text-slate-500 font-medium">({user.timezone || 'GMT+5:30'})</p>
                              </div>
                            ) : (
                              <span className="text-slate-505 font-medium text-slate-500">24/7 Available</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {user.id !== 'user-admin' && user.id !== currentUser.id ? (
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="text-[10px] font-mono text-rose-450 text-rose-400 hover:text-red-300 font-bold uppercase hover:underline"
                              >
                                Revoke
                              </button>
                            ) : (
                              <span className="text-[8px] font-mono text-slate-500">Self/Core</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Profile Invitation Form */}
            <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md h-fit">
              <h3 className="text-xs font-bold text-white mb-1 uppercase font-mono tracking-widest text-indigo-400">Invite Specialist</h3>
              <p className="text-xs text-slate-455 mb-4 leading-normal">Register password authorized users (agents / end users).</p>

              <form onSubmit={handleInviteUser} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Wick"
                    value={invName}
                    onChange={(e) => setInvName(e.target.value)}
                    className="w-full bg-[#131b2e] border border-slate-750 p-2.5 rounded text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Authorized Register Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. wick@consortium.com"
                    value={invEmail}
                    onChange={(e) => setInvEmail(e.target.value)}
                    className="w-full bg-[#131b2e] border border-slate-750 p-2.5 rounded text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-350 font-bold mb-1 font-mono uppercase">Temporary Login Password</label>
                  <input
                    type="password"
                    required
                    value={invPassword}
                    onChange={(e) => setInvPassword(e.target.value)}
                    className="w-full bg-[#131b2e] border border-slate-750 p-2.5 rounded text-white focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1 col">Role Level *</label>
                    <select
                      value={invRole}
                      onChange={(e) => setInvRole(e.target.value as 'admin' | 'agent' | 'user')}
                      className="w-full bg-[#1e293b]/80 border border-slate-750 p-2 rounded text-white"
                    >
                      <option value="admin">Administrator</option>
                      <option value="agent">Support Agent</option>
                      <option value="user">End-User Client</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Grade Dept *</label>
                    <select
                      value={invDeptId}
                      onChange={(e) => setInvDeptId(e.target.value)}
                      className="w-full bg-[#1e293b]/80 border border-slate-750 p-2 rounded text-white"
                    >
                      <option value="">-- Choose Dept --</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {invRole === 'agent' && (
                  <>
                    <div>
                      <label className="block text-slate-350 font-bold mb-1 font-sans">Assign Sub-discipinary Team Squad</label>
                      <select
                        value={invTeamId}
                        onChange={(e) => setInvTeamId(e.target.value)}
                        className="w-full bg-[#1e293b]/80 border border-slate-750 p-2.5 rounded text-white"
                      >
                        <option value="">-- Choose squad --</option>
                        {teams.filter(t => t.departmentId === invDeptId).map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-medium">Duty Start *</label>
                        <input
                          type="text"
                          required
                          value={invWHStart}
                          onChange={(e) => setInvWHStart(e.target.value)}
                          placeholder="e.g. 09:00"
                          className="w-full bg-[#131b2e] border border-slate-750 p-2 text-center text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-medium font-semibold">Duty End *</label>
                        <input
                          type="text"
                          required
                          value={invWHEnd}
                          onChange={(e) => setInvWHEnd(e.target.value)}
                          placeholder="e.g. 17:00"
                          className="w-full bg-[#131b2e] border border-slate-750 p-2 text-center text-white"
                        />
                      </div>
                    </div>
                  </>
                )}

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl font-bold uppercase tracking-wider text-white">
                  Establish User Credentials
                </button>
              </form>
            </div>
          </div>

        </div>
      )}

      {/* CASE FORM schema fields EDIT (Keeps original, fully functional) */}
      {adminTab === 'template' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
          {/* List of active fields */}
          <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md lg:col-span-2">
            <h3 className="text-sm font-bold text-white mb-2">Live Template Schema Fields</h3>
            <p className="text-xs text-slate-400 mb-6">These parameters form the inputs dynamic forms parse. Core default items are globally locked.</p>
            
            <div className="divide-y divide-slate-850">
              {templateFields.map((field) => (
                <div key={field.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-[#131b2e] rounded border border-slate-800 text-indigo-455 text-indigo-400"><FileText className="h-4 w-4" /></span>
                    <div>
                      <h4 className="font-bold text-slate-200">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-450 uppercase mt-0.5">
                        Format: {field.type} {field.options ? `[Options: ${field.options.join(', ')}]` : ''}
                      </p>
                    </div>
                  </div>

                  <div>
                    {field.isDefault ? (
                      <span className="text-[9px] font-mono bg-slate-800 text-slate-450 border border-slate-750 py-1 px-2 rounded font-bold uppercase text-slate-500">
                        Locked Core
                      </span>
                    ) : (
                      <button
                        onClick={() => removeTemplateField(field.id)}
                        className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add custom parameter schema builder */}
          <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md h-fit">
            <h3 className="text-xs font-bold text-white mb-1 uppercase font-mono tracking-widest text-indigo-400">Add Customized Schema</h3>
            <p className="text-xs text-slate-455 mb-5 leading-normal">Instantly extend input fields with support queries.</p>

            <form onSubmit={handleCreateField} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Field Label Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Host Server Address"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full bg-[#131b2e] border border-slate-800 p-2.5 rounded text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 col">Input Type Format</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as TemplateField['type'])}
                  className="w-full bg-[#1e293b]/70 border border-slate-800 p-2.5 rounded text-white text-xs"
                >
                  <option value="text">Single Line Text</option>
                  <option value="textarea">Paragraph Block</option>
                  <option value="select">Dropdown Choices</option>
                  <option value="checkbox">Boolean Toggle Checkbox</option>
                </select>
              </div>

              {newType === 'select' && (
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Choices (Comma-Separated) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MacOS, Windows, Linux"
                    value={newOptsStr}
                    onChange={(e) => setNewOptsStr(e.target.value)}
                    className="w-full bg-[#131b2e] border border-slate-800 p-2 rounded text-white"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="req_box_admin"
                  checked={newRequired}
                  onChange={(e) => setNewRequired(e.target.checked)}
                  className="rounded text-indigo-550 focus:ring-indigo-500 h-4 w-4 bg-[#131b2e] border-slate-800"
                />
                <label htmlFor="req_box_admin" className="text-xs text-slate-350 font-bold font-semibold">User input mandatory</label>
              </div>

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded font-bold text-white">
                Save Dynamic Field State
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM REPORTS BUILDER CONSOLE */}
      {adminTab === 'reports' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md lg:col-span-2">
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <FileBarChart2 className="h-4.5 w-4.5 text-indigo-400" /> Custom Analytics Report Desk
              </h3>
              <p className="text-xs text-slate-400 mb-6">Compile and generate dynamic telemetry records based on current ticket and resolution loads.</p>

              <div className="space-y-4">
                {customReports.map(rep => {
                  // Compile dynamic real values for display based on report filter attributes!
                  const targetDeptName = departments.find(d => d.id === rep.departmentId)?.name || 'All Departments';
                  
                  // Compute mock stats that correspond directly to active state:
                  let matchingTickets = tickets;
                  if (rep.departmentId) {
                    matchingTickets = tickets.filter(t => t.departmentId === rep.departmentId);
                  }

                  // Group calculations for the specific metric
                  let mathPrimaryNumber = 0;
                  let computedSubtitle = '';
                  let chartData: { item: string, count: number }[] = [];

                  if (rep.metricType === 'sla_breach') {
                    const breached = matchingTickets.filter(t => t.isResponseBreached || t.isResolutionBreached).length;
                    mathPrimaryNumber = breached;
                    computedSubtitle = 'Active SLA Breach Incidents';
                    chartData = [
                      { item: 'SLA Breached', count: breached },
                      { item: 'SLA Compliant', count: matchingTickets.length - breached }
                    ];
                  } else if (rep.metricType === 'agent_load') {
                    mathPrimaryNumber = matchingTickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length;
                    computedSubtitle = 'Active Unresolved Cases';
                    
                    chartData = agents.map(ag => {
                      const count = tickets.filter(t => (t.primaryAgentId === ag.id || t.secondaryAgentId === ag.id) && t.status !== 'resolved' && t.status !== 'closed').length;
                      return { item: ag.name.split(' ')[0], count };
                    });
                  } else if (rep.metricType === 'volume') {
                    mathPrimaryNumber = matchingTickets.length;
                    computedSubtitle = 'Total Service Case Volume';

                    chartData = departments.map(d => {
                      const count = tickets.filter(t => t.departmentId === d.id).length;
                      return { item: d.name.substring(0, 8), count };
                    });
                  } else {
                    const resolved = matchingTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
                    mathPrimaryNumber = resolved;
                    computedSubtitle = 'Successfully Resolved Tickets';
                    
                    chartData = [
                      { item: 'Completed', count: resolved },
                      { item: 'Active Backlog', count: matchingTickets.length - resolved }
                    ];
                  }

                  return (
                    <div key={rep.id} className="p-5 bg-[#0c1221] rounded-xl border border-slate-800/80 space-y-4 text-xs shadow-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-slate-100 text-xs sm:text-sm font-sans">{rep.name}</h4>
                          <span className="text-[10px] text-indigo-400 font-mono flex items-center gap-2 mt-1">
                            <span>📅 Schedule: {rep.timeframe.toUpperCase()}LY UPDATE</span>
                            <span>•</span>
                            <span>🎯 Constraint: {targetDeptName}</span>
                          </span>
                        </div>

                        <button
                          onClick={() => deleteCustomReport(rep.id)}
                          className="text-rose-450 hover:text-rose-350 p-1.5 hover:bg-slate-800 rounded transition-all"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Display calculations outputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800/60 items-center">
                        <div className="bg-[#070b13] p-3 rounded-xl border border-slate-850 text-left">
                          <span className="text-[9px] font-mono text-slate-450 block uppercase font-bold">{computedSubtitle}</span>
                          <span className="text-xl sm:text-2xl font-black text-rose-400 mt-1 block">{mathPrimaryNumber}</span>
                          <span className="text-[8px] text-slate-500 font-mono">Real-time dynamic metric value</span>
                        </div>

                        {/* Charts (Rendered when density is professional) */}
                        {viewDensity === 'professional' ? (
                          <div className="sm:col-span-2 h-20">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData}>
                                <XAxis dataKey="item" fontSize={8} stroke="#475569" />
                                <Tooltip contentStyle={{ backgroundColor: '#090e1a', fontSize: 10 }} />
                                <Bar dataKey="count" fill="#4f46e5" radius={[2, 2, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="sm:col-span-2 text-center text-slate-550 text-[10px] font-mono p-3 bg-slate-900/50 rounded-lg text-slate-500 font-bold">
                            VISUAL GRAPH HIDDEN IN MINIMALIST VIEW
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom analytics rules generator */}
            <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md h-fit">
              <h3 className="text-xs font-bold text-white mb-1 uppercase font-mono tracking-widest text-[#10b981]">Create Report</h3>
              <p className="text-xs text-slate-455 mb-4 leading-normal">Instantly construct a dynamic custom data compiler.</p>

              <form onSubmit={handleCreateReport} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 col">Report Custom Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Weekly Escalation Outflow"
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    className="w-full bg-[#131b2e] border border-slate-755 p-2.5 rounded text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Analytical Formula *</label>
                  <select
                    value={repType}
                    onChange={(e) => setRepType(e.target.value as CustomReport['metricType'])}
                    className="w-full bg-[#1e293b]/75 border border-slate-755 p-2.5 rounded text-white"
                  >
                    <option value="sla_breach">SLA Response/Resolution Breaches (Bar)</option>
                    <option value="agent_load">Workforce caseload distribution (Bar)</option>
                    <option value="volume">Overall ticket volume grouping (Bar)</option>
                    <option value="resolution_time">Resolution speed success output (Pace)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-305 font-bold mb-1">Timeframe *</label>
                    <select
                      value={repTimeframe}
                      onChange={(e) => setRepTimeframe(e.target.value as CustomReport['timeframe'])}
                      className="w-full bg-[#1e293b]/75 border border-slate-755 p-2 rounded text-white"
                    >
                      <option value="day">Daily</option>
                      <option value="week">Weekly</option>
                      <option value="month">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-305 font-bold mb-1">Filter Dept</label>
                    <select
                      value={repDeptId}
                      onChange={(e) => setRepDeptId(e.target.value)}
                      className="w-full bg-[#1e293b]/75 border border-slate-755 p-2 rounded text-white"
                    >
                      <option value="">All Depts</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 rounded-xl font-bold uppercase tracking-wider text-white transition-all shadow-[0_4px_12px_rgba(16,185,129,0.15)]">
                  Save Dynamic Report State
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
