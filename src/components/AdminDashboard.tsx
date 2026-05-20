import React, { useState } from 'react';
import { useTickets } from '../context/TicketContext';
import { SLARule, TemplateField, UserProfile } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Trash, Clock, ShieldAlert, Award, FileText, Settings, Users, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    tickets,
    slaRules,
    templateFields,
    allUsers,
    departments,
    updateSlaRule,
    addTemplateField,
    removeTemplateField
  } = useTickets();

  // Template Creator states
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<TemplateField['type']>('text');
  const [newRequired, setNewRequired] = useState(false);
  const [newOptsStr, setNewOptsStr] = useState(''); // COMMA-separated list

  // Active Admin Sub-Tab
  const [adminTab, setAdminTab] = useState<'metrics' | 'sla' | 'template' | 'access'>('metrics');

  if (currentUser.role !== 'admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#020617]">
        <div className="max-w-md p-8 bg-[#070b13] border border-red-500/20 rounded-2xl shadow-[0_0_24px_rgba(239,68,68,0.15)] flex flex-col items-center">
          <div className="p-4 bg-red-500/10 rounded-full text-red-400 border border-red-500/20 mb-4 animate-pulse">
            <ShieldAlert className="h-10 w-10 animate-pulse" />
          </div>
          <h3 className="text-lg font-extrabold font-sans text-white uppercase tracking-wider">Access Restricted</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-3 leading-relaxed">
            Your active persona is currently set to <span className="font-mono text-red-300 font-bold">{currentUser.name} ({currentUser.role.toUpperCase()})</span>. Use the dropdown in the sidebar to impersonate <span className="text-slate-100 font-bold">Sarah Connor (Admin)</span> to configure SLA metrics.
          </p>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const totalTickets = tickets.length;
  const newTickets = tickets.filter((t) => t.status === 'new').length;
  const inProgressTickets = tickets.filter((t) => t.status === 'investigating' || t.status === 'resolving').length;
  const resolvedTickets = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;
  
  // Breached tickers
  const responseBreaches = tickets.filter((t) => t.isResponseBreached).length;
  const resolutionBreaches = tickets.filter((t) => t.isResolutionBreached).length;
  const activeBreaches = tickets.filter((t) => (t.isResolutionBreached || t.isResponseBreached) && t.status !== 'resolved' && t.status !== 'closed').length;

  // Pie chart data: Status breakdown - matching vibrant glowing colors
  const statusChartData = [
    { name: 'New/Unassigned', value: newTickets, color: '#6366f1' },
    { name: 'Active Working', value: inProgressTickets, color: '#f59e0b' },
    { name: 'Resolved/Concluded', value: '#10b981' }
  ].filter(d => d.value > 0);

  // SLA breaches by priority Bar chart
  const priorityChartData = ['low', 'medium', 'high', 'urgent'].map(prio => {
    const matching = tickets.filter(t => t.priority === prio);
    const breached = matching.filter(t => t.isResolutionBreached || t.isResponseBreached).length;
    return {
      name: prio.toUpperCase(),
      Total: matching.length,
      Breached: breached
    };
  });

  // Agent Performance Calculations
  const agents = allUsers.filter(u => u.role === 'agent');
  const agentPerformanceData = agents.map(agent => {
    // Ticket primary or secondary assigned
    const assignedTickets = tickets.filter(t => t.primaryAgentId === agent.id || t.secondaryAgentId === agent.id);
    const resolved = assignedTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
    const breached = assignedTickets.filter(t => t.isResolutionBreached || t.isResponseBreached).length;
    
    return {
      name: agent.name.split(' ')[0], // First name for label density
      Assigned: assignedTickets.length,
      Resolved: resolved,
      Breached: breached
    };
  });

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

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#020617] text-left">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-6 mb-8 gap-4 border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold font-sans text-white tracking-tight">Admin System Operations</h2>
          <p className="text-xs text-slate-400 mt-0.5">Configure SLA rules, customize support templates, and monitor ticket breaches.</p>
        </div>
        
        {/* Sub Navigation */}
        <div className="flex bg-[#070b13] rounded-xl p-1 border border-slate-800">
          {(['metrics', 'sla', 'template', 'access'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setAdminTab(tab)}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-all capitalize ${
                adminTab === tab
                  ? 'bg-indigo-650 text-white shadow-[0_0_12px_rgba(99,102,241,0.3)] font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
              }`}
            >
              {tab === 'access' ? 'Team Access' : tab}
            </button>
          ))}
        </div>
      </div>

      {adminTab === 'metrics' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active SLA Breaches</span>
                <span className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg"><Clock className="h-4 w-4" /></span>
              </div>
              <p className="text-3xl font-extrabold font-sans text-red-500 shadow-red-500/10">{activeBreaches}</p>
              <div className="mt-2 text-[10px] text-red-400 flex items-center gap-1.5 font-bold font-mono uppercase">
                <span>Incomplete breached state</span>
              </div>
            </div>

            <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Incoming Backlog</span>
                <span className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg"><ArrowUpRight className="h-4 w-4" /></span>
              </div>
              <p className="text-3xl font-extrabold font-sans text-indigo-400">{newTickets}</p>
              <div className="mt-2 text-[10px] text-indigo-400 font-bold font-mono uppercase">unassigned cases waiting</div>
            </div>

            <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Throughput Output</span>
                <span className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg"><CheckCircle2 className="h-4 w-4" /></span>
              </div>
              <p className="text-3xl font-extrabold font-sans text-emerald-450 text-emerald-400">{resolvedTickets} <span className="text-xs text-slate-500">/ {totalTickets}</span></p>
              <div className="mt-2 text-[10px] text-emerald-450 text-emerald-400 font-bold font-mono">
                {totalTickets > 0 ? ((resolvedTickets / totalTickets) * 105).toFixed(0) : 0}% success rate
              </div>
            </div>

            <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Dual Agency Coverage</span>
                <span className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/25 rounded-lg"><Users className="h-4 w-4" /></span>
              </div>
              <p className="text-3xl font-extrabold font-sans text-blue-400">
                {tickets.filter(t => t.primaryAgentId && t.secondaryAgentId).length}
              </p>
              <div className="mt-2 text-[10px] text-blue-400 font-bold font-mono uppercase">parallel assigned task loads</div>
            </div>
          </div>

          {/* Visual Recharts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Status Breakdown */}
            <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-lg">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono mb-4">Realtime Ticket Progression Balance</h3>
              <div className="h-64 flex flex-col items-center justify-center">
                {statusChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                        itemStyle={{ color: '#f8fafc' }}
                        labelStyle={{ color: '#94a3b8' }}
                        formatter={(value) => [`${value} Tickets`, 'Status Count']} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-500 text-xs font-mono">No live tickets logged in workspace.</p>
                )}
                <div className="flex gap-6 mt-4 justify-center text-[10px]">
                  {statusChartData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 font-bold font-mono text-slate-300">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                      <span>{d.name}: {d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SLA Breaches Chart */}
            <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-lg">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono mb-4">SLA Breach Incidents by Priority</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityChartData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Bar dataKey="Total" fill="#334155" name="Volume" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Breached" fill="#f87171" name="Breaches" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Agent performance details */}
            <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-lg lg:col-span-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono mb-4">Interactive Agent Workloads & Outcomes</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agentPerformanceData} layout="vertical" barGap={2}>
                    <XAxis type="number" stroke="#64748b" fontSize={11} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={80} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Bar dataKey="Assigned" fill="#6366f1" name="Total Assigned" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Resolved" fill="#10b981" name="Resolved" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Breached" fill="#f87171" name="Breached" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SLA Configuration tab */}
      {adminTab === 'sla' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md">
            <h3 className="text-md font-bold text-white mb-1.5 font-sans">SLA Action Schedules</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Establish deadlines for customer requests and allocate Senior Support Leads to trigger automated escalations if the clock breaches.
            </p>

            <div className="space-y-6">
              {slaRules.map((rule) => {
                const escalationAgent = allUsers.find(u => u.id === rule.escalationAgentId);
                return (
                  <div key={rule.id} className="p-6 bg-[#0c1221] rounded-xl border border-slate-800/80 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className={`uppercase text-[9px] font-bold font-mono px-2 py-0.5 rounded border ${
                          rule.priority === 'urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.15)]' :
                          rule.priority === 'high' ? 'bg-amber-500/10 text-amber-450 text-amber-400 border-amber-500/20' :
                          rule.priority === 'medium' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                          'bg-slate-800 text-slate-400 border-slate-705'
                        }`}>
                          {rule.priority}
                        </span>
                        <h4 className="font-extrabold text-[#f1f5f9] text-xs uppercase tracking-wider font-mono">{rule.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-450">
                        Response Goal: <span className="font-bold text-indigo-400">{rule.responseTimeMin} mins</span> | Resolution Goal: <span className="font-bold text-[#10b981]">{rule.resolutionTimeMin} mins</span>
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                      {/* Configuration input for Response Mins */}
                      <div className="w-32">
                        <label className="block text-[9px] font-mono font-bold text-slate-400 mb-1 uppercase tracking-wider">Response Target (Mins)</label>
                        <input
                          type="number"
                          value={rule.responseTimeMin}
                          onChange={(e) => updateSlaRule(rule.id, { responseTimeMin: Number(e.target.value) })}
                          className="w-full bg-[#131b2e] border border-slate-800 rounded p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Configuration input for Resolution Mins */}
                      <div className="w-32">
                        <label className="block text-[9px] font-mono font-bold text-slate-400 mb-1 uppercase tracking-wider">Resolve Target (Mins)</label>
                        <input
                          type="number"
                          value={rule.resolutionTimeMin}
                          onChange={(e) => updateSlaRule(rule.id, { resolutionTimeMin: Number(e.target.value) })}
                          className="w-full bg-[#131b2e] border border-slate-800 rounded p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-505"
                        />
                      </div>

                      {/* Escalation Target selection */}
                      <div className="w-56">
                        <label className="block text-[9px] font-mono font-bold text-slate-400 mb-1 uppercase tracking-wider">Escalation Backup Expert</label>
                        <select
                          value={rule.escalationAgentId}
                          onChange={(e) => updateSlaRule(rule.id, { escalationAgentId: e.target.value })}
                          className="w-full bg-[#131b2e] border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {allUsers.filter(u => u.role === 'agent').map(ag => (
                            <option key={ag.id} value={ag.id} className="bg-[#0f172a]">
                              {ag.name}
                            </option>
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

      {/* Ticket form customization */}
      {adminTab === 'template' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
          {/* List of active fields */}
          <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md lg:col-span-2">
            <h3 className="text-md font-bold text-white mb-2">Live Template Schema Fields</h3>
            <p className="text-xs text-slate-400 mb-6">These parameters form the input questions customer submits. Default items are hard-mapped to core services.</p>
            
            <div className="divide-y divide-slate-850">
              {templateFields.map((field) => (
                <div key={field.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-[#131b2e] rounded border border-slate-800 text-indigo-400"><FileText className="h-4 w-4" /></span>
                    <div>
                      <h4 className="font-bold text-slate-200 text-xs">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-450 uppercase mt-0.5">
                        Type: {field.type} {field.options ? `[Choices: ${field.options.join(', ')}]` : ''}
                      </p>
                    </div>
                  </div>

                  <div>
                    {field.isDefault ? (
                      <span className="text-[9px] font-mono bg-slate-800 text-slate-450 border border-slate-850 py-1 px-2 rounded font-bold tracking-widest uppercase">
                        Core Locked
                      </span>
                    ) : (
                      <button
                        onClick={() => removeTemplateField(field.id)}
                        className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition-all"
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
            <h3 className="text-md font-bold text-white mb-1">Add Customized Schema</h3>
            <p className="text-xs text-slate-450 mb-5 leading-normal">Instantly extend input fields with new support specifications.</p>

            <form onSubmit={handleCreateField} className="space-y-4">
              <div>
                <label className="block text-[10px] font-sans font-extrabold text-slate-300 mb-1.5 uppercase tracking-wider">Field Header Label *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Host Server Address"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full border border-slate-800 p-2 text-xs rounded bg-[#131b2e]/90 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans font-extrabold text-slate-300 mb-1.5 uppercase tracking-wider">Input Format / Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as TemplateField['type'])}
                  className="w-full border border-slate-800 p-2 text-xs rounded bg-[#131b2e] text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="text" className="bg-[#0f172a]">Single Line Text</option>
                  <option value="textarea" className="bg-[#0f172a]">Paragraph Block</option>
                  <option value="select" className="bg-[#0f172a]">Dropdown Choices</option>
                  <option value="checkbox" className="bg-[#0f172a]">Boolean Toggle Checkbox</option>
                </select>
              </div>

              {newType === 'select' && (
                <div>
                  <label className="block text-[10px] font-sans font-bold text-slate-350 mb-1 uppercase">Options list (Comma-separated)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Windows, Mac, Linux"
                    value={newOptsStr}
                    onChange={(e) => setNewOptsStr(e.target.value)}
                    className="w-full border border-slate-800 text-xs p-2 rounded bg-[#131b2e] text-slate-100 placeholder-slate-500"
                  />
                  <p className="text-[9px] text-slate-500 mt-1 font-mono">Provide options separated by comma.</p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="req_box"
                  checked={newRequired}
                  onChange={(e) => setNewRequired(e.target.checked)}
                  className="rounded text-indigo-500 h-4 w-4 bg-[#131b2e] border-slate-800 focus:ring-indigo-500"
                />
                <label htmlFor="req_box" className="text-xs text-slate-350 font-medium">Field submission is required</label>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(99,102,241,0.2)] mt-4 transition-all"
              >
                <Plus className="h-4 w-4" /> Save Template Schema
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Team Access and Permissions control panel */}
      {adminTab === 'access' && (
        <div className="bg-[#070b13] p-6 rounded-2xl border border-slate-800 shadow-md">
          <h3 className="text-md font-bold text-white mb-1">Company Staff Directory & Support Allocations</h3>
          <p className="text-xs text-slate-400 mb-6">Manage organizational support permissions, specialty departments, and assigned role levels.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-850 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Individual Profile</th>
                  <th className="py-3 px-4">Registered Mail</th>
                  <th className="py-3 px-4">Assigned Department</th>
                  <th className="py-3 px-4">Authorized Role</th>
                  <th className="py-3 px-4">SLA Escalate Lead</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {allUsers.map((user) => {
                  const dept = departments.find(d => d.id === user.departmentId)?.name || 'N/A';
                  const isBackupExpert = slaRules.some(r => r.escalationAgentId === user.id);
                  return (
                    <tr key={user.id} className="hover:bg-slate-800/15">
                      <td className="py-4 px-4 font-bold text-slate-200 flex items-center gap-2">
                        <span className="text-lg">{user.avatar}</span>
                        <span>{user.name}</span>
                      </td>
                      <td className="py-4 px-4 text-slate-400 font-mono text-xs">{user.email}</td>
                      <td className="py-4 px-4 text-slate-300 font-medium">{dept}</td>
                      <td className="py-4 px-4">
                        <span className={`text-[9px] font-bold font-mono py-1 px-2 rounded border uppercase tracking-wider ${
                          user.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                          user.role === 'agent' ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {isBackupExpert ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-sans text-emerald-400 font-bold">
                            <Award className="h-3 w-3 text-emerald-400" /> Designated specialist
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">Regular Staff</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
