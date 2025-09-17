// Audit logging system for authentication events

import { AUDIT_EVENT_TYPES } from './config';
import type { AuthAuditEvent, User } from '@/types/auth';

/**
 * Audit logger interface
 */
interface AuditLogger {
  log(event: AuthAuditEvent): void;
  getEvents(filters?: AuditFilters): AuthAuditEvent[];
  clearEvents(): void;
}

/**
 * Audit event filters
 */
interface AuditFilters {
  userId?: string;
  type?: string;
  severity?: string;
  startDate?: number;
  endDate?: number;
  limit?: number;
}

/**
 * In-memory audit logger for development
 */
class MemoryAuditLogger implements AuditLogger {
  private events: AuthAuditEvent[] = [];
  private maxEvents: number = 1000; // Keep last 1000 events

  log(event: AuthAuditEvent): void {
    // Add event to memory
    this.events.unshift(event);
    
    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Audit Event:', {
        type: event.type,
        userId: event.userId,
        timestamp: new Date(event.timestamp).toISOString(),
        severity: event.severity,
        details: event.details,
      });
    }
  }

  getEvents(filters?: AuditFilters): AuthAuditEvent[] {
    let filteredEvents = [...this.events];
    
    if (filters) {
      if (filters.userId) {
        filteredEvents = filteredEvents.filter(event => event.userId === filters.userId);
      }
      
      if (filters.type) {
        filteredEvents = filteredEvents.filter(event => event.type === filters.type);
      }
      
      if (filters.severity) {
        filteredEvents = filteredEvents.filter(event => event.severity === filters.severity);
      }
      
      if (filters.startDate) {
        filteredEvents = filteredEvents.filter(event => event.timestamp >= filters.startDate!);
      }
      
      if (filters.endDate) {
        filteredEvents = filteredEvents.filter(event => event.timestamp <= filters.endDate!);
      }
      
      if (filters.limit) {
        filteredEvents = filteredEvents.slice(0, filters.limit);
      }
    }
    
    return filteredEvents;
  }

  clearEvents(): void {
    this.events = [];
  }
}

/**
 * Local storage audit logger for persistence
 */
class LocalStorageAuditLogger implements AuditLogger {
  private storageKey = 'deyor_audit_events';
  private maxEvents: number = 500; // Keep last 500 events in localStorage

  private getStoredEvents(): AuthAuditEvent[] {
    try {
      const events = localStorage.getItem(this.storageKey);
      return events ? JSON.parse(events) : [];
    } catch (error) {
      console.error('Failed to retrieve audit events:', error);
      return [];
    }
  }

  private saveEvents(events: AuthAuditEvent[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(events));
    } catch (error) {
      console.error('Failed to save audit events:', error);
    }
  }

  log(event: AuthAuditEvent): void {
    const events = this.getStoredEvents();
    events.unshift(event);
    
    // Keep only the most recent events
    if (events.length > this.maxEvents) {
      events.splice(this.maxEvents);
    }
    
    this.saveEvents(events);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Audit Event:', {
        type: event.type,
        userId: event.userId,
        timestamp: new Date(event.timestamp).toISOString(),
        severity: event.severity,
        details: event.details,
      });
    }
  }

  getEvents(filters?: AuditFilters): AuthAuditEvent[] {
    let filteredEvents = this.getStoredEvents();
    
    if (filters) {
      if (filters.userId) {
        filteredEvents = filteredEvents.filter(event => event.userId === filters.userId);
      }
      
      if (filters.type) {
        filteredEvents = filteredEvents.filter(event => event.type === filters.type);
      }
      
      if (filters.severity) {
        filteredEvents = filteredEvents.filter(event => event.severity === filters.severity);
      }
      
      if (filters.startDate) {
        filteredEvents = filteredEvents.filter(event => event.timestamp >= filters.startDate!);
      }
      
      if (filters.endDate) {
        filteredEvents = filteredEvents.filter(event => event.timestamp <= filters.endDate!);
      }
      
      if (filters.limit) {
        filteredEvents = filteredEvents.slice(0, filters.limit);
      }
    }
    
    return filteredEvents;
  }

  clearEvents(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear audit events:', error);
    }
  }
}

/**
 * Audit logger factory
 */
function createAuditLogger(): AuditLogger {
  if (typeof window === 'undefined') {
    // Server-side: use memory logger
    return new MemoryAuditLogger();
  }
  
  // Client-side: use localStorage logger
  return new LocalStorageAuditLogger();
}

/**
 * Audit service for authentication events
 */
export class AuthAuditService {
  private static instance: AuthAuditService;
  private logger: AuditLogger;

  constructor() {
    this.logger = createAuditLogger();
  }

  static getInstance(): AuthAuditService {
    if (!AuthAuditService.instance) {
      AuthAuditService.instance = new AuthAuditService();
    }
    return AuthAuditService.instance;
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get client information
   */
  private getClientInfo(): { ipAddress?: string; userAgent?: string } {
    if (typeof window === 'undefined') {
      return {};
    }
    
    return {
      userAgent: navigator.userAgent,
      // Note: IP address would need to be obtained from server-side
    };
  }

  /**
   * Log login success
   */
  logLoginSuccess(user: User, details?: Record<string, any>): void {
    const event: AuthAuditEvent = {
      id: this.generateEventId(),
      type: AUDIT_EVENT_TYPES.LOGIN_SUCCESS,
      userId: user.id,
      timestamp: Date.now(),
      ...this.getClientInfo(),
      details: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        ...details,
      },
      severity: 'info',
    };
    
    this.logger.log(event);
  }

  /**
   * Log login failure
   */
  logLoginFailure(email: string, reason: string, details?: Record<string, any>): void {
    const event: AuthAuditEvent = {
      id: this.generateEventId(),
      type: AUDIT_EVENT_TYPES.LOGIN_FAILED,
      timestamp: Date.now(),
      ...this.getClientInfo(),
      details: {
        email,
        reason,
        ...details,
      },
      severity: 'warning',
    };
    
    this.logger.log(event);
  }

  /**
   * Log logout
   */
  logLogout(user: User, details?: Record<string, any>): void {
    const event: AuthAuditEvent = {
      id: this.generateEventId(),
      type: AUDIT_EVENT_TYPES.LOGOUT,
      userId: user.id,
      timestamp: Date.now(),
      ...this.getClientInfo(),
      details: {
        email: user.email,
        ...details,
      },
      severity: 'info',
    };
    
    this.logger.log(event);
  }

  /**
   * Log signup success
   */
  logSignupSuccess(user: User, details?: Record<string, any>): void {
    const event: AuthAuditEvent = {
      id: this.generateEventId(),
      type: AUDIT_EVENT_TYPES.SIGNUP_SUCCESS,
      userId: user.id,
      timestamp: Date.now(),
      ...this.getClientInfo(),
      details: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        ...details,
      },
      severity: 'info',
    };
    
    this.logger.log(event);
  }

  /**
   * Log signup failure
   */
  logSignupFailure(email: string, reason: string, details?: Record<string, any>): void {
    const event: AuthAuditEvent = {
      id: this.generateEventId(),
      type: AUDIT_EVENT_TYPES.SIGNUP_FAILED,
      timestamp: Date.now(),
      ...this.getClientInfo(),
      details: {
        email,
        reason,
        ...details,
      },
      severity: 'warning',
    };
    
    this.logger.log(event);
  }

  /**
   * Log token refresh
   */
  logTokenRefresh(userId: string, success: boolean, details?: Record<string, any>): void {
    const event: AuthAuditEvent = {
      id: this.generateEventId(),
      type: success ? AUDIT_EVENT_TYPES.TOKEN_REFRESH : AUDIT_EVENT_TYPES.TOKEN_REFRESH_FAILED,
      userId,
      timestamp: Date.now(),
      ...this.getClientInfo(),
      details: details || {},
      severity: success ? 'info' : 'warning',
    };
    
    this.logger.log(event);
  }

  /**
   * Log session expired
   */
  logSessionExpired(userId: string, details?: Record<string, any>): void {
    const event: AuthAuditEvent = {
      id: this.generateEventId(),
      type: AUDIT_EVENT_TYPES.SESSION_EXPIRED,
      userId,
      timestamp: Date.now(),
      ...this.getClientInfo(),
      details: details || {},
      severity: 'warning',
    };
    
    this.logger.log(event);
  }

  /**
   * Log account locked
   */
  logAccountLocked(email: string, reason: string, details?: Record<string, any>): void {
    const event: AuthAuditEvent = {
      id: this.generateEventId(),
      type: AUDIT_EVENT_TYPES.ACCOUNT_LOCKED,
      timestamp: Date.now(),
      ...this.getClientInfo(),
      details: {
        email,
        reason,
        ...(details || {}),
      },
      severity: 'error',
    };
    
    this.logger.log(event);
  }

  /**
   * Log security violation
   */
  logSecurityViolation(type: string, userId?: string, details?: Record<string, any>): void {
    const event: AuthAuditEvent = {
      id: this.generateEventId(),
      type: AUDIT_EVENT_TYPES.SECURITY_VIOLATION,
      userId,
      timestamp: Date.now(),
      ...this.getClientInfo(),
      details: {
        violationType: type,
        ...(details || {}),
      },
      severity: 'critical',
    };
    
    this.logger.log(event);
  }

  /**
   * Get audit events
   */
  getEvents(filters?: AuditFilters): AuthAuditEvent[] {
    return this.logger.getEvents(filters);
  }

  /**
   * Clear audit events
   */
  clearEvents(): void {
    this.logger.clearEvents();
  }

  /**
   * Get audit statistics
   */
  getAuditStats(): Record<string, any> {
    const events = this.getEvents();
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    const last7Days = now - (7 * 24 * 60 * 60 * 1000);
    
    const recentEvents = events.filter(event => event.timestamp >= last24Hours);
    const weeklyEvents = events.filter(event => event.timestamp >= last7Days);
    
    const stats = {
      totalEvents: events.length,
      recentEvents: recentEvents.length,
      weeklyEvents: weeklyEvents.length,
      eventsByType: {} as Record<string, number>,
      eventsBySeverity: {} as Record<string, number>,
      recentFailures: recentEvents.filter(event => 
        event.type.includes('FAILED') || event.severity === 'error' || event.severity === 'critical'
      ).length,
    };
    
    // Count events by type
    events.forEach(event => {
      stats.eventsByType[event.type] = (stats.eventsByType[event.type] || 0) + 1;
      stats.eventsBySeverity[event.severity] = (stats.eventsBySeverity[event.severity] || 0) + 1;
    });
    
    return stats;
  }
}

// Export singleton instance
export const authAuditService = AuthAuditService.getInstance();
