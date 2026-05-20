import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ticket, TicketMessage, SLARule, TemplateField, UserProfile, EmailLogs, AuditLog, Department, Team, WorkflowState, CustomReport } from '../types';
import {
  DEFAULT_DEPARTMENTS,
  MOCK_USERS,
  DEFAULT_SLA_RULES,
  DEFAULT_TEMPLATE_FIELDS,
  INITIAL_TICKETS,
  INITIAL_MESSAGES,
  INITIAL_EMAIL_LOGS
} from '../data';

interface TicketContextType {
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  departments: Department[];
  teams: Team[];
  workflowStates: WorkflowState[];
  customReports: CustomReport[];
  tickets: Ticket[];
  messages: TicketMessage[];
  slaRules: SLARule[];
  templateFields: TemplateField[];
  emailLogs: EmailLogs[];
  auditLogs: AuditLog[];
  
  // Layout views density
  viewDensity: 'simple' | 'professional';
  setViewDensity: (density: 'simple' | 'professional') => void;
  
  // Custom SLA setups
  assignmentMode: 'manual' | 'round-robin';
  setAssignmentMode: (mode: 'manual' | 'round-robin') => void;
  businessHoursType: '24_7' | 'business_hours';
  setBusinessHoursType: (type: '24_7' | 'business_hours') => void;
  businessHoursStart: string;
  setBusinessHoursStart: (start: string) => void;
  businessHoursEnd: string;
  setBusinessHoursEnd: (end: string) => void;
  
  switchUser: (userId: string | null) => void;
  loginUser: (email: string, password: string) => boolean;
  logoutUser: () => void;
  
  // CRUD Actions
  createTicket: (
    title: string,
    description: string,
    priority: Ticket['priority'],
    departmentId: string,
    customFields: Record<string, string | boolean>,
    creatorEmail?: string,
    creatorName?: string
  ) => Ticket;
  updateTicketStatus: (ticketId: string, status: string, remarks?: string) => void;
  assignTicketAgents: (ticketId: string, primaryId: string | null, secondaryId: string | null) => void;
  addTicketMessage: (ticketId: string, message: string, isInternal: boolean) => void;
  updateSlaRule: (ruleId: string, updates: Partial<SLARule>) => void;
  addTemplateField: (field: Omit<TemplateField, 'id'>) => void;
  removeTemplateField: (fieldId: string) => void;
  simulateInboundEmail: (senderEmail: string, senderName: string, subject: string, body: string, priority: Ticket['priority']) => void;
  triggerManualEscalation: (ticketId: string, reason: string) => void;
  
  // Dynamic setups
  addDepartment: (name: string, description: string) => void;
  deleteDepartment: (id: string) => void;
  addTeam: (name: string, departmentId: string, description?: string) => void;
  deleteTeam: (id: string) => void;
  addUser: (name: string, email: string, role: 'admin' | 'agent' | 'user', password?: string, departmentId?: string, teamId?: string, whStart?: string, whEnd?: string) => void;
  deleteUser: (id: string) => void;
  addWorkflowState: (name: string, category: WorkflowState['category'], color?: string) => void;
  deleteWorkflowState: (id: string) => void;
  addCustomReport: (name: string, metricType: CustomReport['metricType'], timeframe: CustomReport['timeframe'], departmentId?: string) => void;
  deleteCustomReport: (id: string) => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

// Seeds with initial defaults
const DEFAULT_USERS: UserProfile[] = [
  { id: 'user-admin', name: 'Sarah Connor (Admin)', email: 'sarah.admin@firm.com', role: 'admin', avatar: '💻', password: 'admin123' },
  { id: 'user-agent-1', name: 'John Doe (Agent)', email: 'john.doe@firm.com', role: 'agent', departmentId: 'dept-1', teamId: 'team-1', avatar: '🎯', password: 'agent123', workingHoursStart: '09:00', workingHoursEnd: '17:00', timezone: 'GMT+5:30', status: 'online' },
  { id: 'user-agent-2', name: 'Alice Smith (Agent - Senior)', email: 'alice.smith@firm.com', role: 'agent', departmentId: 'dept-1', teamId: 'team-2', avatar: '⚡', password: 'agent123', workingHoursStart: '08:00', workingHoursEnd: '16:00', timezone: 'GMT+5:30', status: 'online' },
  { id: 'user-agent-3', name: 'Bob Johnson (Agent - Billing Lead)', email: 'bob.billing@firm.com', role: 'agent', departmentId: 'dept-2', teamId: 'team-3', avatar: '💳', password: 'agent123', workingHoursStart: '10:00', workingHoursEnd: '18:00', timezone: 'GMT-8:00', status: 'online' },
  { id: 'user-client-1', name: 'Utkarsh Rajput (Client)', email: 'utkarshr042@gmail.com', role: 'user', avatar: '👤', password: 'client123' },
  { id: 'user-client-demo', name: 'Jane Miller (Client)', email: 'jane.miller@gmail.com', role: 'user', avatar: '🥑', password: 'client123' }
];

const DEFAULT_TEAMS: Team[] = [
  { id: 'team-1', name: 'L1 Technical Triage', departmentId: 'dept-1', description: 'Initial diagnostics and standard software fixes' },
  { id: 'team-2', name: 'Tier 3 Infrastructure', departmentId: 'dept-1', description: 'Complex database clusters and server recovery' },
  { id: 'team-3', name: 'Billing Disputes Group', departmentId: 'dept-2', description: 'Invoice reviews, reversals, and processor diagnostics' }
];

const DEFAULT_WORKFLOWS: WorkflowState[] = [
  { id: 'new', name: 'New', category: 'open', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(99,102,241,0.1)]' },
  { id: 'investigating', name: 'Investigating', category: 'in-progress', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 px-2 py-0.5 rounded' },
  { id: 'resolving', name: 'Resolving', category: 'in-progress', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 px-2 py-0.5 rounded' },
  { id: 'on-hold', name: 'On Hold', category: 'on-hold', color: 'bg-red-500/10 text-red-500 border-red-500/20 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(239,68,68,0.1)]' },
  { id: 'resolved', name: 'Resolved', category: 'resolved', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-2 py-0.5 rounded' },
  { id: 'closed', name: 'Closed', category: 'closed', color: 'bg-slate-800 text-slate-400 border-slate-700 font-bold px-2 py-0.5 rounded' }
];

const DEFAULT_REPORTS: CustomReport[] = [
  { id: 'rep-1', name: 'SLA Response & Resolution Breach Report', metricType: 'sla_breach', timeframe: 'week', createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString() },
  { id: 'rep-2', name: 'Technical Support Workload Performance', metricType: 'agent_load', departmentId: 'dept-1', timeframe: 'month', createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString() }
];

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication session
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('opssla_current_user');
    return saved ? JSON.parse(saved) : null; // Starts as null to trigger dedicated Credentials Login Overlay!
  });

  // Dynamic lists in Storage
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('opssla_users_list');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem('opssla_departments_list');
    return saved ? JSON.parse(saved) : DEFAULT_DEPARTMENTS;
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('opssla_teams_list');
    return saved ? JSON.parse(saved) : DEFAULT_TEAMS;
  });

  const [workflowStates, setWorkflowStates] = useState<WorkflowState[]>(() => {
    const saved = localStorage.getItem('opssla_workflows_list');
    return saved ? JSON.parse(saved) : DEFAULT_WORKFLOWS;
  });

  const [customReports, setCustomReports] = useState<CustomReport[]>(() => {
    const saved = localStorage.getItem('opssla_reports_list');
    return saved ? JSON.parse(saved) : DEFAULT_REPORTS;
  });

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('opssla_tickets');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [messages, setMessages] = useState<TicketMessage[]>(() => {
    const saved = localStorage.getItem('opssla_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [slaRules, setSlaRules] = useState<SLARule[]>(() => {
    const saved = localStorage.getItem('opssla_sla_rules');
    return saved ? JSON.parse(saved) : DEFAULT_SLA_RULES;
  });

  const [templateFields, setTemplateFields] = useState<TemplateField[]>(() => {
    const saved = localStorage.getItem('opssla_template_fields');
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATE_FIELDS;
  });

  const [emailLogs, setEmailLogs] = useState<EmailLogs[]>(() => {
    const saved = localStorage.getItem('opssla_email_logs');
    return saved ? JSON.parse(saved) : INITIAL_EMAIL_LOGS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('opssla_audit_logs');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'log-1', ticketId: 'TCK-1001', action: 'Ticket Created', perfomedBy: 'Utkarsh Rajput', createdAt: new Date(Date.now() - 55 * 60 * 1050).toISOString() },
      { id: 'log-2', ticketId: 'TCK-1001', action: 'SLA Rule Critical Infrastructure SLA Applied', perfomedBy: 'System', createdAt: new Date(Date.now() - 55 * 60 * 1050).toISOString() },
      { id: 'log-3', ticketId: 'TCK-1001', action: 'Assigned John Doe (Primary) and Alice Smith (Secondary)', perfomedBy: 'Sarah Connor (Admin)', createdAt: new Date(Date.now() - 40 * 60 * 1050).toISOString() }
    ];
  });

  // Layout View Preferences
  const [viewDensity, setViewDensity] = useState<'simple' | 'professional'>(() => {
    const saved = localStorage.getItem('opssla_view_density');
    return (saved === 'simple' || saved === 'professional') ? saved : 'professional';
  });

  // SLA Calculation system hours
  const [assignmentMode, setAssignmentMode] = useState<'manual' | 'round-robin'>(() => {
    const saved = localStorage.getItem('opssla_assignment_mode');
    return saved === 'round-robin' ? 'round-robin' : 'manual';
  });

  const [businessHoursType, setBusinessHoursType] = useState<'24_7' | 'business_hours'>(() => {
    const saved = localStorage.getItem('opssla_business_hours_type');
    return saved === 'business_hours' ? 'business_hours' : '24_7';
  });

  const [businessHoursStart, setBusinessHoursStart] = useState(() => {
    return localStorage.getItem('opssla_business_hours_start') || '09:00';
  });

  const [businessHoursEnd, setBusinessHoursEnd] = useState(() => {
    return localStorage.getItem('opssla_business_hours_end') || '17:00';
  });

  // Sync state helpers
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('opssla_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('opssla_current_user');
    }
  }, [currentUser]);

  useEffect(() => { localStorage.setItem('opssla_users_list', JSON.stringify(allUsers)); }, [allUsers]);
  useEffect(() => { localStorage.setItem('opssla_departments_list', JSON.stringify(departments)); }, [departments]);
  useEffect(() => { localStorage.setItem('opssla_teams_list', JSON.stringify(teams)); }, [teams]);
  useEffect(() => { localStorage.setItem('opssla_workflows_list', JSON.stringify(workflowStates)); }, [workflowStates]);
  useEffect(() => { localStorage.setItem('opssla_reports_list', JSON.stringify(customReports)); }, [customReports]);
  useEffect(() => { localStorage.setItem('opssla_tickets', JSON.stringify(tickets)); }, [tickets]);
  useEffect(() => { localStorage.setItem('opssla_messages', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem('opssla_sla_rules', JSON.stringify(slaRules)); }, [slaRules]);
  useEffect(() => { localStorage.setItem('opssla_template_fields', JSON.stringify(templateFields)); }, [templateFields]);
  useEffect(() => { localStorage.setItem('opssla_email_logs', JSON.stringify(emailLogs)); }, [emailLogs]);
  useEffect(() => { localStorage.setItem('opssla_audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem('opssla_view_density', viewDensity); }, [viewDensity]);
  useEffect(() => { localStorage.setItem('opssla_assignment_mode', assignmentMode); }, [assignmentMode]);
  useEffect(() => { localStorage.setItem('opssla_business_hours_type', businessHoursType); }, [businessHoursType]);
  useEffect(() => { localStorage.setItem('opssla_business_hours_start', businessHoursStart); }, [businessHoursStart]);
  useEffect(() => { localStorage.setItem('opssla_business_hours_end', businessHoursEnd); }, [businessHoursEnd]);

  // Periodic SLA Sweep check
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTickets(prevTickets => {
        let changed = false;
        const updated = prevTickets.map(ticket => {
          if (ticket.status === 'resolved' || ticket.status === 'closed') return ticket;
          
          let modified = { ...ticket };
          let updatedSLAState = false;

          // Response deadline check
          if (!ticket.isFirstResponded && !ticket.isResponseBreached) {
            const respLimit = new Date(ticket.slaResponseDeadline);
            if (now > respLimit) {
              modified.isResponseBreached = true;
              updatedSLAState = true;
              changed = true;
              addAudit(ticket.id, 'SLA RESPONSE BREACH DETECTED!', 'SLA Engine');
              triggerEscalationChain(modified, 'Response SLA Breach auto-escalation');
            }
          }

          // Resolution deadline check
          if (!ticket.isResolutionBreached) {
            const resolLimit = new Date(ticket.slaResolutionDeadline);
            if (now > resolLimit) {
              modified.isResolutionBreached = true;
              updatedSLAState = true;
              changed = true;
              addAudit(ticket.id, 'SLA RESOLUTION BREACH DETECTED!', 'SLA Engine');
              triggerEscalationChain(modified, 'Resolution SLA Breach auto-escalation');
            }
          }

          return updatedSLAState ? modified : ticket;
        });

        return changed ? updated : prevTickets;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [slaRules, emailLogs]);

  // SLA helpers
  const addAudit = (ticketId: string, action: string, performedBy: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ticketId,
      action,
      perfomedBy: performedBy,
      createdAt: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const dispatchEmail = (to: string, subject: string, body: string, direction: 'inbound' | 'outbound' = 'outbound') => {
    const newEmail: EmailLogs = {
      id: `email-${Date.now()}`,
      toEmail: to,
      fromEmail: direction === 'outbound' ? 'notifications@firm.com' : to,
      subject,
      body,
      sentAt: new Date().toISOString(),
      direction
    };
    setEmailLogs(prev => [newEmail, ...prev]);
  };

  // Auto-escalation routing
  const triggerEscalationChain = (ticket: Ticket, triggerReason: string) => {
    const rule = slaRules.find(r => r.id === ticket.slaRuleId);
    if (!rule) return;

    const targetEscalationAgent = allUsers.find(u => u.id === rule.escalationAgentId);
    const agentName = targetEscalationAgent ? targetEscalationAgent.name : 'Senior Specialist';

    setTickets(prev => prev.map(t => {
      if (t.id === ticket.id) {
        return {
          ...t,
          escalatedToAgentId: rule.escalationAgentId,
          primaryAgentId: t.primaryAgentId ? t.primaryAgentId : rule.escalationAgentId,
          secondaryAgentId: t.primaryAgentId && t.primaryAgentId !== rule.escalationAgentId ? rule.escalationAgentId : t.secondaryAgentId,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));

    dispatchEmail(
      ticket.creatorEmail,
      `[SLA Escalation Alert] Progress update on your Ticket: ${ticket.title} (${ticket.id})`,
      `Hello ${ticket.creatorName},\n\nWe would like to inform you that your ticket has been prioritized and auto-escalated to our senior technical lead agent (${agentName}) due to: ${triggerReason}.\n\nWe are actively working parallelly to conclude your inquiry as fast as possible.\n\nBest Regards,\nSLA Control System Escalations`
    );
  };

  const triggerManualEscalation = (ticketId: string, reason: string) => {
    const t = tickets.find(tck => tck.id === ticketId);
    if (!t) return;
    addAudit(ticketId, `Manual Escalation Triggered: ${reason}`, currentUser?.name || 'Agent');
    triggerEscalationChain(t, `Manual Agent Trigger - Reason: ${reason}`);
  };

  // Authentication handlers
  const switchUser = (userId: string | null) => {
    if (!userId) {
      setCurrentUser(null);
      return;
    }
    const matched = allUsers.find(u => u.id === userId);
    if (matched) {
      setCurrentUser(matched);
    }
  };

  const loginUser = (email: string, password: string): boolean => {
    const matched = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    // In our prototype, if they exist, match password or accept standard password
    if (matched && (!matched.password || matched.password === password)) {
      setCurrentUser(matched);
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  // Dynamic SLA calculations
  const calcSLADeadlines = (priority: 'low' | 'medium' | 'high' | 'urgent', fromDateStr: string = new Date().toISOString()) => {
    const fromDate = new Date(fromDateStr);
    const rule = slaRules.find(r => r.priority === priority) || slaRules[2];
    
    const responseDeadline = new Date(fromDate.getTime() + rule.responseTimeMin * 60 * 1000).toISOString();
    const resolutionDeadline = new Date(fromDate.getTime() + rule.resolutionTimeMin * 60 * 1000).toISOString();
    
    return {
      slaRuleId: rule.id,
      responseDeadline,
      resolutionDeadline
    };
  };

  // Standard Create ticket with Automated Round-robin capabilities!
  const createTicket = (
    title: string,
    description: string,
    priority: Ticket['priority'],
    departmentId: string,
    customFields: Record<string, string | boolean>,
    creatorEmail?: string,
    creatorName?: string
  ): Ticket => {
    const ticketId = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
    const calc = calcSLADeadlines(priority);

    const email = creatorEmail || currentUser?.email || 'customer@client.com';
    const name = creatorName || currentUser?.name || 'Customer';

    // Round Robin routing choice
    let assignedPrimaryId: string | null = null;
    let routingAuditMessage = '';

    if (assignmentMode === 'round-robin') {
      // Find agents assigned to department
      const deptAgents = allUsers.filter(u => u.role === 'agent' && u.departmentId === departmentId);
      // Online ones take priority, else all
      const onlineAgents = deptAgents.filter(u => u.status === 'online');
      const candidates = onlineAgents.length > 0 ? onlineAgents : (deptAgents.length > 0 ? deptAgents : allUsers.filter(u => u.role === 'agent'));
      
      if (candidates.length > 0) {
        // Calculate the current active backlog counts for each available agent
        const loadList = candidates.map(ag => {
          const loadNum = tickets.filter(t => 
            (t.primaryAgentId === ag.id || t.secondaryAgentId === ag.id) && 
            t.status !== 'resolved' && t.status !== 'closed'
          ).length;
          return { ag, loadNum };
        });
        
        // Least loaded agent gets the ticket
        loadList.sort((a, b) => a.loadNum - b.loadNum);
        const bestCandidate = loadList[0];
        
        assignedPrimaryId = bestCandidate.ag.id;
        routingAuditMessage = `Round-Robin auto-routing allocated SLA ticket to agent: ${bestCandidate.ag.name} (Online load: ${bestCandidate.loadNum} cases)`;
      }
    }

    const newTicket: Ticket = {
      id: ticketId,
      title,
      description,
      status: 'new',
      priority,
      departmentId,
      slaRuleId: calc.slaRuleId,
      slaResponseDeadline: calc.responseDeadline,
      slaResolutionDeadline: calc.resolutionDeadline,
      isFirstResponded: false,
      isResponseBreached: false,
      isResolutionBreached: false,
      primaryAgentId: assignedPrimaryId,
      secondaryAgentId: null,
      creatorEmail: email,
      creatorName: name,
      customFields,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTickets(prev => [newTicket, ...prev]);
    addAudit(ticketId, `Ticket Created via ${creatorEmail ? 'Email Parser' : 'Web Portal'}`, name);
    addAudit(ticketId, `SLA configuration rules instantiated for priority: ${priority}`, 'SLA Engine');
    
    if (assignedPrimaryId) {
      addAudit(ticketId, routingAuditMessage, 'Routing Director');
    }

    // Confirmation dispatch
    dispatchEmail(
      email,
      `[Created] Ticket Registered: ${title} (${ticketId})`,
      `Hi ${name},\n\nWe have successfully received your ticketing report:\n"${description}"\n\nYour SLA Response Limit is logged as ${new Date(calc.responseDeadline).toLocaleString()}.\nOur engineers will look into it promptly.\n\nBest Regards,\nService Desk Operations Portal`
    );

    return newTicket;
  };

  // State Transition logic with dynamic status remarks and notifications!
  const updateTicketStatus = (ticketId: string, status: string, remarks?: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        let isFirstRes = t.isFirstResponded;
        let actionHeading = status.toUpperCase();
        let auditMsg = `Status changed to: ${actionHeading}${remarks ? ` (Remark: ${remarks})` : ''}`;
        
        if (!isFirstRes && (status === 'investigating' || status === 'resolving' || status === 'resolved')) {
          isFirstRes = true;
          addAudit(ticketId, 'SLA First Response SLA successfully achieved!', 'SLA Engine');
        }

        addAudit(ticketId, auditMsg, currentUser?.name || 'System');

        // Email notifications on status update
        dispatchEmail(
          t.creatorEmail,
          `[Status Update] Ticket TCK TCK-${ticketId} is now ${actionHeading}`,
          `Hello ${t.creatorName},\n\nYour ticket TCK-${t.id} status has been updated to "${actionHeading}" by support specialist ${currentUser?.name || 'Agent'}.\n\nOperator Remarks:\n"${remarks || 'No remarks provided.'}"\n\nYou can view progress and talk directly inside your support dashboard.\n\nBest Regards,\nCore Support Operations`
        );

        return {
          ...t,
          status,
          isFirstResponded: isFirstRes,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
  };

  const assignTicketAgents = (ticketId: string, primaryId: string | null, secondaryId: string | null) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const primName = allUsers.find(u => u.id === primaryId)?.name || 'Unassigned';
        const secName = allUsers.find(u => u.id === secondaryId)?.name || 'Unassigned';
        
        addAudit(ticketId, `Assigned Operators Configured - Primary: ${primName}, Secondary: ${secName}`, currentUser?.name || 'Manager');

        return {
          ...t,
          primaryAgentId: primaryId,
          secondaryAgentId: secondaryId,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
  };

  const addTicketMessage = (ticketId: string, text: string, isInternal: boolean) => {
    if (!currentUser) return;
    
    const newMsg: TicketMessage = {
      id: `msg-${Date.now()}`,
      ticketId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      message: text,
      createdAt: new Date().toISOString(),
      isInternalOnly: isInternal
    };

    setMessages(prev => [...prev, newMsg]);
    
    // SLA Resolution checklist matching
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        let updatedState = { ...t };
        if (!t.isFirstResponded && (currentUser.role === 'agent' || currentUser.role === 'admin') && !isInternal) {
          updatedState.isFirstResponded = true;
          addAudit(ticketId, 'SLA First Response SLA successfully achieved with client reply message!', 'SLA Engine');
        }
        updatedState.updatedAt = new Date().toISOString();
        return updatedState;
      }
      return t;
    }));

    addAudit(ticketId, `${isInternal ? 'Internal confidential note added' : 'Public customer reply posted'}`, currentUser.name);

    // Email dispatch simulation
    const t = tickets.find(x => x.id === ticketId);
    if (t) {
      if (currentUser.role === 'user' && !isInternal) {
        if (t.primaryAgentId) {
          const primEmail = allUsers.find(u => u.id === t.primaryAgentId)?.email;
          if (primEmail) {
            dispatchEmail(
              primEmail,
              `[Client Response] Ticket TCK-${ticketId} has new customer message`,
              `Hey Agent,\n\nCustomer ${currentUser.name} added a query response inside ticket TCK-${t.id}:\n\n"${text}"\n\nPlease check SLA requirements and reply back inside the agent desk.`
            );
          }
        }
      } else if ((currentUser.role === 'agent' || currentUser.role === 'admin') && !isInternal) {
        dispatchEmail(
          t.creatorEmail,
          `[Support Update] Re: ${t.title} (${t.id})`,
          `Hi ${t.creatorName},\n\nAn agent has posted an official response on your support inquiry:\n\n"${text}"\n\nYou can track and reply to your ticket on our interactive End-User Portal.\n\nBest Regards,\nOperations Support Desk`
        );
      }
    }
  };

  const updateSlaRule = (ruleId: string, updates: Partial<SLARule>) => {
    setSlaRules(prev => prev.map(rule => rule.id === ruleId ? { ...rule, ...updates } : rule));
  };

  const addTemplateField = (field: Omit<TemplateField, 'id'>) => {
    setTemplateFields(prev => [...prev, { ...field, id: `field-${Date.now()}` }]);
  };

  const removeTemplateField = (fieldId: string) => {
    setTemplateFields(prev => prev.filter(f => f.id !== fieldId || f.isDefault));
  };

  const simulateInboundEmail = (
    senderEmail: string,
    senderName: string,
    subject: string,
    body: string,
    priority: Ticket['priority']
  ) => {
    dispatchEmail(senderEmail, subject, body, 'inbound');
    
    const targetDept = departments[0]?.id || 'dept-1';
    const custom: Record<string, string | boolean> = {
      'field-sys': 'Unknown',
      'field-step': 'Inbound email gateway auto-routing parser initiated.',
      'field-callback': false
    };

    createTicket(
      subject,
      body,
      priority,
      targetDept,
      custom,
      senderEmail,
      senderName
    );
  };

  // Dynamic CRUD operations for Freshworks systems
  const addDepartment = (name: string, description: string) => {
    const newDept: Department = { id: `dept-${Date.now()}`, name, description };
    setDepartments(prev => [...prev, newDept]);
  };

  const deleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
  };

  const addTeam = (name: string, departmentId: string, description?: string) => {
    const newTeam: Team = { id: `team-${Date.now()}`, name, departmentId, description };
    setTeams(prev => [...prev, newTeam]);
  };

  const deleteTeam = (id: string) => {
    setTeams(prev => prev.filter(t => t.id !== id));
  };

  const addUser = (
    name: string,
    email: string,
    role: 'admin' | 'agent' | 'user',
    password?: string,
    departmentId?: string,
    teamId?: string,
    whStart: string = '09:00',
    whEnd: string = '17:00'
  ) => {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      avatar: role === 'admin' ? '💻' : role === 'agent' ? '🎯' : '👤',
      password: password || 'password123',
      departmentId,
      teamId,
      workingHoursStart: whStart,
      workingHoursEnd: whEnd,
      timezone: 'GMT+5:30',
      status: 'online'
    };
    setAllUsers(prev => [...prev, newUser]);
  };

  const deleteUser = (id: string) => {
    setAllUsers(prev => prev.filter(u => u.id !== id));
  };

  const addWorkflowState = (name: string, category: WorkflowState['category'], color?: string) => {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const newState: WorkflowState = {
      id,
      name,
      category,
      color: color || 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded shadow-sm'
    };
    setWorkflowStates(prev => [...prev, newState]);
  };

  const deleteWorkflowState = (id: string) => {
    setWorkflowStates(prev => prev.filter(w => w.id !== id));
  };

  const addCustomReport = (name: string, metricType: CustomReport['metricType'], timeframe: CustomReport['timeframe'], departmentId?: string) => {
    const newRep: CustomReport = {
      id: `rep-${Date.now()}`,
      name,
      metricType,
      timeframe,
      departmentId,
      createdAt: new Date().toISOString()
    };
    setCustomReports(prev => [...prev, newRep]);
  };

  const deleteCustomReport = (id: string) => {
    setCustomReports(prev => prev.filter(r => r.id !== id));
  };

  return (
    <TicketContext.Provider
      value={{
        currentUser,
        allUsers,
        departments,
        teams,
        workflowStates,
        customReports,
        tickets,
        messages,
        slaRules,
        templateFields,
        emailLogs,
        auditLogs,
        viewDensity,
        setViewDensity,
        assignmentMode,
        setAssignmentMode,
        businessHoursType,
        setBusinessHoursType,
        businessHoursStart,
        setBusinessHoursStart,
        businessHoursEnd,
        setBusinessHoursEnd,
        switchUser,
        loginUser,
        logoutUser,
        createTicket,
        updateTicketStatus,
        assignTicketAgents,
        addTicketMessage,
        updateSlaRule,
        addTemplateField,
        removeTemplateField,
        simulateInboundEmail,
        triggerManualEscalation,
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
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) throw new Error('useTickets must be used inside TicketProvider');
  return context;
};
