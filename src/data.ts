import { UserProfile, Department, SLARule, TemplateField, Ticket, TicketMessage, EmailLogs } from './types';

export const DEFAULT_DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'Technical Support', description: 'Handles complex server side and application issues.' },
  { id: 'dept-2', name: 'Billing & Subscriptions', description: 'Resolves checkout, invoice, and payment portal inquiries.' },
  { id: 'dept-3', name: 'Accounts Security', description: 'Deals with access recovery, dual-factor authentication, and privacy.' }
];

export const MOCK_USERS: UserProfile[] = [
  { id: 'user-admin', name: 'Sarah Connor (Admin)', email: 'sarah.admin@firm.com', role: 'admin', avatar: '💻' },
  { id: 'user-agent-1', name: 'John Doe (Agent)', email: 'john.doe@firm.com', role: 'agent', departmentId: 'dept-1', avatar: '🎯' },
  { id: 'user-agent-2', name: 'Alice Smith (Agent - Senior)', email: 'alice.smith@firm.com', role: 'agent', departmentId: 'dept-1', avatar: '⚡' },
  { id: 'user-agent-3', name: 'Bob Johnson (Agent - Billing Lead)', email: 'bob.billing@firm.com', role: 'agent', departmentId: 'dept-2', avatar: '💳' },
  { id: 'user-client-1', name: 'Utkarsh Rajput (Client)', email: 'utkarshr042@gmail.com', role: 'user', avatar: '👤' },
  { id: 'user-client-demo', name: 'Jane Miller (Client)', email: 'jane.miller@gmail.com', role: 'user', avatar: '🥑' }
];

export const DEFAULT_SLA_RULES: SLARule[] = [
  {
    id: 'sla-urgent',
    name: 'Critical Infrastructure SLA',
    priority: 'urgent',
    responseTimeMin: 15,     // 15 mins for first response
    resolutionTimeMin: 60,    // 1 hr for resolution
    escalationAgentId: 'user-agent-2', // Escalate to Senior Agent Alice
    isActive: true
  },
  {
    id: 'sla-high',
    name: 'Standard High SLA',
    priority: 'high',
    responseTimeMin: 60,     // 1 hr response
    resolutionTimeMin: 240,   // 4 hrs resolution
    escalationAgentId: 'user-agent-2',
    isActive: true
  },
  {
    id: 'sla-medium',
    name: 'General Business SLA',
    priority: 'medium',
    responseTimeMin: 180,    // 3 hrs response
    resolutionTimeMin: 720,   // 12 hrs resolution
    escalationAgentId: 'user-agent-1',
    isActive: true
  },
  {
    id: 'sla-low',
    name: 'Basic Support SLA',
    priority: 'low',
    responseTimeMin: 360,    // 6 hrs response
    resolutionTimeMin: 1440,  // 24 hrs resolution
    escalationAgentId: 'user-agent-3',
    isActive: true
  }
];

export const DEFAULT_TEMPLATE_FIELDS: TemplateField[] = [
  { id: 'field-title', label: 'Ticket Subject', type: 'text', placeholder: 'Enter brief topic...', required: true, isDefault: true },
  { id: 'field-description', label: 'Detailed Description', type: 'textarea', placeholder: 'Describe the issue or request in details...', required: true, isDefault: true },
  { id: 'field-priority', label: 'Issue Urgency', type: 'select', options: ['low', 'medium', 'high', 'urgent'], required: true, isDefault: true },
  { id: 'field-department', label: 'Target Department', type: 'select', options: ['Technical Support', 'Billing & Subscriptions', 'Accounts Security'], required: true, isDefault: true },
  { id: 'field-sys', label: 'Operating System', type: 'select', placeholder: 'Select system', options: ['Windows', 'macOS', 'Linux', 'iOS', 'Android'], required: false },
  { id: 'field-step', label: 'Steps to Reproduce', type: 'textarea', placeholder: '1. Open portal ...', required: false },
  { id: 'field-callback', label: 'Requires Phone Callback', type: 'checkbox', required: false }
];

// Helper to calculate target deadlines based on rules
export function getSLADeadlines(priority: 'low' | 'medium' | 'high' | 'urgent', fromDateStr: string = new Date().toISOString()) {
  const fromDate = new Date(fromDateStr);
  const rule = DEFAULT_SLA_RULES.find(r => r.priority === priority) || DEFAULT_SLA_RULES[2];
  
  const responseDeadline = new Date(fromDate.getTime() + rule.responseTimeMin * 60 * 1000).toISOString();
  const resolutionDeadline = new Date(fromDate.getTime() + rule.resolutionTimeMin * 60 * 1000).toISOString();
  
  return {
    slaRuleId: rule.id,
    responseDeadline,
    resolutionDeadline
  };
}

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TCK-1001',
    title: 'PostgreSQL Database Connection Timeouts',
    description: 'We are receiving frequent connection timeouts inside the active database nodes in our production cluster. Please assist urgently.',
    status: 'investigating',
    priority: 'urgent',
    departmentId: 'dept-1',
    slaRuleId: 'sla-urgent',
    // Generated slightly in the past to show active live countdowns or breaches
    slaResponseDeadline: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes in future
    slaResolutionDeadline: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes in past (Breached!)
    isFirstResponded: true,
    isResponseBreached: false,
    isResolutionBreached: true,
    primaryAgentId: 'user-agent-1',
    secondaryAgentId: 'user-agent-2', // Dual agent parallel support workspace!
    creatorEmail: 'utkarshr042@gmail.com',
    creatorName: 'Utkarsh Rajput',
    customFields: {
      'field-sys': 'Linux',
      'field-step': 'Run backend docker container; check application service logs; notice persistent node crashes.',
      'field-callback': true
    },
    createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: 'TCK-1002',
    title: 'Double Charge on Stripe Invoice #809a',
    description: 'My credit card was charged twice for the monthly subscription renewal. Please reverse the duplicate payment.',
    status: 'new',
    priority: 'high',
    departmentId: 'dept-2',
    slaRuleId: 'sla-high',
    slaResponseDeadline: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    slaResolutionDeadline: new Date(Date.now() + 225 * 60 * 1000).toISOString(),
    isFirstResponded: false,
    isResponseBreached: false,
    isResolutionBreached: false,
    primaryAgentId: 'user-agent-3',
    secondaryAgentId: null,
    creatorEmail: 'jane.miller@gmail.com',
    creatorName: 'Jane Miller',
    customFields: {
      'field-callback': false
    },
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 'TCK-1003',
    title: 'Two-Factor Auth Reset Request',
    description: 'I lost my authenticator device and have no spare backup recovery codes. I need a manual identity check reset.',
    status: 'resolved',
    priority: 'medium',
    departmentId: 'dept-3',
    slaRuleId: 'sla-medium',
    slaResponseDeadline: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
    slaResolutionDeadline: new Date(Date.now() + 620 * 60 * 1000).toISOString(),
    isFirstResponded: true,
    isResponseBreached: false,
    isResolutionBreached: false,
    primaryAgentId: 'user-agent-2',
    secondaryAgentId: null,
    creatorEmail: 'utkarshr042@gmail.com',
    creatorName: 'Utkarsh Rajput',
    customFields: {},
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  }
];

export const INITIAL_MESSAGES: TicketMessage[] = [
  {
    id: 'msg-1',
    ticketId: 'TCK-1001',
    senderId: 'user-client-1',
    senderName: 'Utkarsh Rajput',
    senderRole: 'user',
    message: 'I have attached the logs in the custom reproducible field. This is severely blocking our development team.',
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    isInternalOnly: false
  },
  {
    id: 'msg-2',
    ticketId: 'TCK-1001',
    senderId: 'user-agent-1',
    senderName: 'John Doe (Agent)',
    senderRole: 'agent',
    message: 'Checking the server crash records right now. Adding Alice to the ticket to double check the container networks parallelly.',
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    isInternalOnly: false
  },
  {
    id: 'msg-3',
    ticketId: 'TCK-1001',
    senderId: 'user-agent-1',
    senderName: 'John Doe (Agent)',
    senderRole: 'agent',
    message: 'Hey Alice, our Docker network bridge might be saturated. Could you inspect the virtual interfaces while I rebuild the node cluster logs?',
    createdAt: new Date(Date.now() - 39 * 60 * 1000).toISOString(),
    isInternalOnly: true // Internal discussion chat between assigned agents!
  },
  {
    id: 'msg-4',
    ticketId: 'TCK-1001',
    senderId: 'user-agent-2',
    senderName: 'Alice Smith (Agent - Senior)',
    senderRole: 'agent',
    message: 'Confirmed John, the bridge is dropping frames. I am adjusting the memory pool in our config templates. Setting SLA target notification warnings.',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    isInternalOnly: true // Internal discussion chat
  }
];

export const INITIAL_EMAIL_LOGS: EmailLogs[] = [
  {
    id: 'email-1',
    toEmail: 'support@firm.com',
    fromEmail: 'utkarshr042@gmail.com',
    subject: 'PostgreSQL Database Connection Timeouts',
    body: 'We are receiving frequent connection timeouts inside the active database nodes in our production cluster. Please assist urgently.',
    sentAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    direction: 'inbound'
  },
  {
    id: 'email-2',
    toEmail: 'utkarshr042@gmail.com',
    fromEmail: 'notifications@firm.com',
    subject: '[Created] Re: PostgreSQL Database Connection Timeouts (TCK-1001)',
    body: 'Hi Utkarsh Rajput,\nYour ticket TCK-1001 has been registered in our portal and assigned Critical SLA timelines. You can track progress directly in your customer portal.\n\nBest,\nSupport Ops Team.',
    sentAt: new Date(Date.now() - 54 * 60 * 1000).toISOString(),
    direction: 'outbound'
  }
];
