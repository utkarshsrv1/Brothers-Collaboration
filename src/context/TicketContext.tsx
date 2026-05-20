import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ticket, TicketMessage, SLARule, TemplateField, UserProfile, EmailLogs, AuditLog, Department } from '../types';
import {
  DEFAULT_DEPARTMENTS,
  MOCK_USERS,
  DEFAULT_SLA_RULES,
  DEFAULT_TEMPLATE_FIELDS,
  INITIAL_TICKETS,
  INITIAL_MESSAGES,
  INITIAL_EMAIL_LOGS,
  getSLADeadlines
} from '../data';

interface TicketContextType {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  departments: Department[];
  tickets: Ticket[];
  messages: TicketMessage[];
  slaRules: SLARule[];
  templateFields: TemplateField[];
  emailLogs: EmailLogs[];
  auditLogs: AuditLog[];
  switchUser: (userId: string) => void;
  createTicket: (
    title: string,
    description: string,
    priority: Ticket['priority'],
    departmentId: string,
    customFields: Record<string, string | boolean>,
    creatorEmail?: string,
    creatorName?: string
  ) => Ticket;
  updateTicketStatus: (ticketId: string, status: Ticket['status']) => void;
  assignTicketAgents: (ticketId: string, primaryId: string | null, secondaryId: string | null) => void;
  addTicketMessage: (ticketId: string, message: string, isInternal: boolean) => void;
  updateSlaRule: (ruleId: string, updates: Partial<SLARule>) => void;
  addTemplateField: (field: Omit<TemplateField, 'id'>) => void;
  removeTemplateField: (fieldId: string) => void;
  simulateInboundEmail: (senderEmail: string, senderName: string, subject: string, body: string, priority: Ticket['priority']) => void;
  triggerManualEscalation: (ticketId: string, reason: string) => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial data from localStorage if available, else use default data
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('opssla_current_user');
    return saved ? JSON.parse(saved) : MOCK_USERS[4]; // Default to Utkarsh Rajput (Client) for testing client path, easily switchable!
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
    // Generate initial logs
    return [
      { id: 'log-1', ticketId: 'TCK-1001', action: 'Ticket Created', perfomedBy: 'Utkarsh Rajput', createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString() },
      { id: 'log-2', ticketId: 'TCK-1001', action: 'SLA Rule Critical Infrastructure SLA Applied', perfomedBy: 'System', createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString() },
      { id: 'log-3', ticketId: 'TCK-1001', action: 'Assigned John Doe (Primary) and Alice Smith (Secondary)', perfomedBy: 'Sarah Connor (Admin)', createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString() }
    ];
  });

  // Sync state with localStorage on changes
  useEffect(() => {
    localStorage.setItem('opssla_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('opssla_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('opssla_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('opssla_sla_rules', JSON.stringify(slaRules));
  }, [slaRules]);

  useEffect(() => {
    localStorage.setItem('opssla_template_fields', JSON.stringify(templateFields));
  }, [templateFields]);

  useEffect(() => {
    localStorage.setItem('opssla_email_logs', JSON.stringify(emailLogs));
  }, [emailLogs]);

  useEffect(() => {
    localStorage.setItem('opssla_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Periodic simulated check (Every 5 seconds) for SLA Resolution timelines 
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTickets(prevTickets => {
        let changed = false;
        const updated = prevTickets.map(ticket => {
          if (ticket.status === 'resolved' || ticket.status === 'closed') return ticket;
          
          let modified = { ...ticket };
          let updatedSLAState = false;

          // Check first response deadline
          if (!ticket.isFirstResponded && !ticket.isResponseBreached) {
            const respLimit = new Date(ticket.slaResponseDeadline);
            if (now > respLimit) {
              modified.isResponseBreached = true;
              updatedSLAState = true;
              changed = true;
              
              // Log SLA Breach and trigger escalation action
              addAudit(ticket.id, 'SLA RESPONSE BREACH DETECTED!', 'SLA Engine');
              triggerEscalationChain(modified, 'Response Breach escalation');
            }
          }

          // Check resolution SLA limit
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

  // Helper loggers
  const addAudit = (ticketId: string, action: string, performedBy: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
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

  // Trigger auto-escalation based on rule setups
  const triggerEscalationChain = (ticket: Ticket, triggerReason: string) => {
    const rule = slaRules.find(r => r.id === ticket.slaRuleId);
    if (!rule) return;

    // Get escalation expert details
    const targetEscalationAgent = MOCK_USERS.find(u => u.id === rule.escalationAgentId);
    const agentName = targetEscalationAgent ? targetEscalationAgent.name : 'Senior Escalation Ops';

    // Update ticket references to note auto-escalated status & agents
    setTickets(prev => prev.map(t => {
      if (t.id === ticket.id) {
        return {
          ...t,
          escalatedToAgentId: rule.escalationAgentId,
          // If the primary agent was not assigned, or assigning the specialist as primary/secondary
          primaryAgentId: t.primaryAgentId ? t.primaryAgentId : rule.escalationAgentId,
          secondaryAgentId: t.primaryAgentId && t.primaryAgentId !== rule.escalationAgentId ? rule.escalationAgentId : t.secondaryAgentId,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));

    // Trigger alert email out of sandbox updating user of escalation
    dispatchEmail(
      ticket.creatorEmail,
      `[SLA Escalation Alert] Progress update on your Ticket: ${ticket.title} (${ticket.id})`,
      `Hello ${ticket.creatorName},\n\nWe would like to inform you that your ticket has been prioritized and auto-escalated to our senior technical lead agent (${agentName}) due to: ${triggerReason}.\n\nWe are actively working parallelly to conclude your inquiry as fast as possible.\n\nBest Regards,\nSLA Control System Escalations`
    );
  };

  const triggerManualEscalation = (ticketId: string, reason: string) => {
    const t = tickets.find(tck => tck.id === ticketId);
    if (!t) return;
    addAudit(ticketId, `Manual Escalation Triggered: ${reason}`, currentUser.name);
    triggerEscalationChain(t, `Manual Agent Trigger - Reason: ${reason}`);
  };

  const switchUser = (userId: string) => {
    const matched = MOCK_USERS.find(u => u.id === userId);
    if (matched) {
      setCurrentUser(matched);
    }
  };

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
    const calc = getSLADeadlines(priority);

    const email = creatorEmail || currentUser.email;
    const name = creatorName || currentUser.name;

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
      primaryAgentId: null,
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

    // Dispatch automatic confirmation mail to client
    dispatchEmail(
      email,
      `[Created] Ticket Registered: ${title} (${ticketId})`,
      `Hi ${name},\n\nWe have successfully received your ticketing report:\n"${description}"\n\nYour SLA Response Limit is logged as ${new Date(calc.responseDeadline).toLocaleString()}.\nOur engineers will look into it promptly.\n\nBest Regards,\nService Desk Operations Portal`
    );

    return newTicket;
  };

  // Update Status
  const updateTicketStatus = (ticketId: string, status: Ticket['status']) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        let isFirstRes = t.isFirstResponded;
        let auditMsg = `Status changed to: ${status.toUpperCase()}`;
        
        // If transitioning from "new" to "investigating" or adding a message, respond SLA
        if (!isFirstRes && (status === 'investigating' || status === 'resolving' || status === 'resolved')) {
          isFirstRes = true;
          addAudit(ticketId, 'SLA First Response SLA successfully achieved!', 'SLA Engine');
        }

        addAudit(ticketId, auditMsg, currentUser.name);

        // Notify client if resolved
        if (status === 'resolved') {
          dispatchEmail(
            t.creatorEmail,
            `[Resolved] Ticket Resolved: ${t.title} (${t.id})`,
            `Hello ${t.creatorName},\n\nGood news! Your ticket has been marked as RESOLVED by our engineering team.\n\nDescription summary:\n"${t.description}"\n\nPlease let us know if any further assist is required.\n\nSincerely,\nService Desk Operations Portal`
          );
        }

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

  // Dual Agent Assignment
  const assignTicketAgents = (ticketId: string, primaryId: string | null, secondaryId: string | null) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const primName = MOCK_USERS.find(u => u.id === primaryId)?.name || 'Unassigned';
        const secName = MOCK_USERS.find(u => u.id === secondaryId)?.name || 'Unassigned';
        
        let actMsg = `Assigned Agents configured - Primary: ${primName}, Secondary: ${secName}`;
        addAudit(ticketId, actMsg, currentUser.name);

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

  // Conversations inside ticket (Internal Notes Vs Client replies)
  const addTicketMessage = (ticketId: string, text: string, isInternal: boolean) => {
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
    
    // Update response SLA milestones
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

    addAudit(ticketId, `${isInternal ? 'Internal discussion note added' : 'Public client portal update posted'}`, currentUser.name);

    // If client message posted, alert assigned agents via email simulation log
    const t = tickets.find(x => x.id === ticketId);
    if (t) {
      if (currentUser.role === 'user' && !isInternal) {
        if (t.primaryAgentId) {
          const primEmail = MOCK_USERS.find(u => u.id === t.primaryAgentId)?.email;
          if (primEmail) {
            dispatchEmail(
              primEmail,
              `[Client Update] Ticket TCK TCK-${ticketId} received a response`,
              `Hey Agent,\n\nClient ${currentUser.name} added a reply to ticket TCK-${t.id}:\n\n"${text}"\n\nPlease check SLA requirements and respond inside the assigned support portal.`
            );
          }
        }
      } else if ((currentUser.role === 'agent' || currentUser.role === 'admin') && !isInternal) {
        // Agent replied publicly, dispatch email update to client!
        dispatchEmail(
          t.creatorEmail,
          `[Support Reply] Re: ${t.title} (${t.id})`,
          `Hi ${t.creatorName},\n\nAn agent has posted an update on your support inquiry:\n\n"${text}"\n\nYou can track and reply to your ticket on our interactive End-User Portal.\n\nBest Regards,\nSupport Core Desk`
        );
      }
    }
  };

  // Adjust SLA Rules directly (Admin SLA settings panel)
  const updateSlaRule = (ruleId: string, updates: Partial<SLARule>) => {
    setSlaRules(prev => prev.map(rule => {
      if (rule.id === ruleId) {
        return { ...rule, ...updates };
      }
      return rule;
    }));
  };

  // Template Customizer Add/Remove fields
  const addTemplateField = (field: Omit<TemplateField, 'id'>) => {
    const newField: TemplateField = {
      ...field,
      id: `field-${Date.now()}`
    };
    setTemplateFields(prev => [...prev, newField]);
  };

  const removeTemplateField = (fieldId: string) => {
    setTemplateFields(prev => prev.filter(f => f.id !== fieldId || f.isDefault));
  };

  // Inbound Email Simulation Gateway (To satisfy: "mail auto ticket creations are also required")
  const simulateInboundEmail = (
    senderEmail: string,
    senderName: string,
    subject: string,
    body: string,
    priority: Ticket['priority']
  ) => {
    // 1. Log incoming inbound email
    dispatchEmail(senderEmail, subject, body, 'inbound');
    
    // 2. Automatically create ticket from email parameters!
    const targetDept = DEFAULT_DEPARTMENTS[0].id; // Routes to technical department initially
    const custom: Record<string, string | boolean> = {
      'field-sys': 'Unknown',
      'field-step': 'Created automatically via Inbound Support Email routing server.',
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

  return (
    <TicketContext.Provider
      value={{
        currentUser,
        allUsers: MOCK_USERS,
        departments: DEFAULT_DEPARTMENTS,
        tickets,
        messages,
        slaRules,
        templateFields,
        emailLogs,
        auditLogs,
        switchUser,
        createTicket,
        updateTicketStatus,
        assignTicketAgents,
        addTicketMessage,
        updateSlaRule,
        addTemplateField,
        removeTemplateField,
        simulateInboundEmail,
        triggerManualEscalation
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
