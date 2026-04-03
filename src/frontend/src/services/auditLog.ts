// ─── Audit Log Service ───────────────────────────────────────────────────────
// Stores last 30 days of admin activity in localStorage under "sms_audit_log"

export type AuditEntry = {
  id: string;
  timestamp: string; // ISO string
  action: string;
  user: string;
  details: string;
  device: string;
  ip: string;
};

const AUDIT_KEY = "sms_audit_log";
const MAX_DAYS = 30;

function loadLog(): AuditEntry[] {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]");
  } catch {
    return [];
  }
}

function pruneOld(entries: AuditEntry[]): AuditEntry[] {
  const cutoff = Date.now() - MAX_DAYS * 24 * 60 * 60 * 1000;
  return entries.filter((e) => new Date(e.timestamp).getTime() >= cutoff);
}

function saveLog(entries: AuditEntry[]): void {
  localStorage.setItem(AUDIT_KEY, JSON.stringify(entries));
}

let _ip = "";
async function getIP(): Promise<string> {
  if (_ip) return _ip;
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    _ip = data.ip || "";
  } catch {
    _ip = "";
  }
  return _ip;
}

function getDeviceInfo(): string {
  const ua = navigator.userAgent;
  // Detect mobile
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad/i.test(ua)) return "iOS";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac/i.test(ua)) return "Mac";
  if (/Linux/i.test(ua)) return "Linux";
  return "Unknown";
}

export async function recordAudit(
  action: string,
  user: string,
  details = "",
): Promise<void> {
  const ip = await getIP();
  const entry: AuditEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    timestamp: new Date().toISOString(),
    action,
    user,
    details,
    device: getDeviceInfo(),
    ip: ip || "Unknown",
  };
  const entries = pruneOld(loadLog());
  entries.unshift(entry);
  // Keep max 500 entries
  saveLog(entries.slice(0, 500));
}

export function getAuditLog(): AuditEntry[] {
  return pruneOld(loadLog());
}

export function clearAuditLog(): void {
  saveLog([]);
}
