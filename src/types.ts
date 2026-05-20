export type UserRole = 'admin' | 'agent' | 'user';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  avatar?: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
}

export interface SLARule {
  id: string;
  name: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  responseTimeMin: number; // minutes for first response
  resolutionTimeMin: number; // minutes for full resolution
  escalationAgentId: string; // Auto-escalate to this agent if breached
  isActive: boolean;
}

export interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox';
  placeholder?: string;
  options?: string[]; // For select type
  required: boolean;
  isDefault?: boolean; // Default fields like Title or Description cannot be removed
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'new' | 'investigating' | 'resolving' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  departmentId: string;
  
  // Custom SLA values linked
  slaRuleId: string;
  slaResponseDeadline: string; // ISO string
  slaResolutionDeadline: string; // ISO string
  isFirstResponded: boolean;
  isResolutionBreached: boolean;
  isResponseBreached: boolean;
  escalatedToAgentId?: string; // Escalated agent
  
  // Assigned Agents (Concurrent two-agent collaboration)
  primaryAgentId: string | null;
  secondaryAgentId: string | null;
  
  // Creator profile details
  creatorEmail: string;
  creatorName: string;
  
  // Custom Dynamic Template properties
  customFields: Record<string, string | boolean>;
  
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  createdAt: string;
  isInternalOnly: boolean; // true for internal team discussions, false for client portal visibility too
}

export interface EmailLogs {
  id: string;
  toEmail: string;
  fromEmail: string;
  subject: string;
  body: string;
  sentAt: string;
  direction: 'inbound' | 'outbound'; // outbound are notifications to end user, inbound is mail auto-creation
}

export interface AuditLog {
  id: string;
  ticketId: string;
  action: string;
  perfomedBy: string;
  createdAt: string;
}
