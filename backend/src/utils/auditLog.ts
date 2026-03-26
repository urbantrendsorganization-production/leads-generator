interface AuditEntry {
  timestamp: string;
  adminEmail: string;
  action: string;
  target: string;
  details: string;
}

const MAX_ENTRIES = 500;
const entries: AuditEntry[] = [];

export const auditLog = {
  record(adminEmail: string, action: string, target: string, details: string = '') {
    entries.unshift({
      timestamp: new Date().toISOString(),
      adminEmail,
      action,
      target,
      details,
    });
    if (entries.length > MAX_ENTRIES) {
      entries.length = MAX_ENTRIES;
    }
  },

  getRecent(limit = 100): AuditEntry[] {
    return entries.slice(0, limit);
  },
};
