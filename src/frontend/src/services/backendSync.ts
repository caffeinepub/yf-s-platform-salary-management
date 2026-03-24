// ─── Backend Key-Value Sync Service ─────────────────────────────────────────
// Syncs localStorage data to/from the ICP canister KV store for cross-device persistence.

import { createActorWithConfig } from "../config";

interface KVStore {
  set(key: string, value: string): Promise<void>;
  get(key: string): Promise<string | null>;
  remove(key: string): Promise<void>;
  getAll(): Promise<Array<[string, string]>>;
}

let _kvActor: KVStore | null = null;

async function getKVActor(): Promise<KVStore> {
  if (!_kvActor) {
    const actor = await createActorWithConfig();
    _kvActor = actor as unknown as KVStore;
  }
  return _kvActor;
}

// ─── Sync status observable ──────────────────────────────────────────────────

type SyncStatus = "idle" | "syncing" | "ok" | "error";
type StatusListener = (status: SyncStatus) => void;

const listeners = new Set<StatusListener>();
let _status: SyncStatus = "idle";

export function getSyncStatus(): SyncStatus {
  return _status;
}

export function onSyncStatusChange(fn: StatusListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function setStatus(s: SyncStatus) {
  _status = s;
  for (const fn of listeners) {
    fn(s);
  }
}

// ─── Retry helper ────────────────────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1500,
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
      }
    }
  }
  throw lastErr;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Pull all key-value pairs from the backend canister and write them into localStorage.
 * Call this on app startup to restore data across devices.
 */
export async function syncFromBackend(): Promise<void> {
  setStatus("syncing");
  try {
    const kv = await withRetry(() => getKVActor());
    const entries = await withRetry(() => kv.getAll());
    for (const [key, value] of entries) {
      if (value !== null && value !== undefined) {
        localStorage.setItem(key, value);
      }
    }
    setStatus("ok");
  } catch (err) {
    console.warn("[backendSync] syncFromBackend failed:", err);
    setStatus("error");
  }
}

/**
 * Write a single key-value pair to the backend canister with retries.
 * Shows sync status indicator while saving.
 */
export function syncKeyToBackend(key: string, value: string): void {
  setStatus("syncing");
  withRetry(() => getKVActor().then((kv) => kv.set(key, value)))
    .then(() => setStatus("ok"))
    .catch((err) => {
      console.warn("[backendSync] set failed after retries:", key, err);
      setStatus("error");
    });
}

/**
 * Delete a key from the backend canister with retries.
 */
export function deleteKeyFromBackend(key: string): void {
  withRetry(() => getKVActor().then((kv) => kv.remove(key))).catch((err) =>
    console.warn("[backendSync] remove failed:", key, err),
  );
}

/**
 * Push ALL localStorage keys to backend. Call after login to ensure
 * any data entered before sync is safely persisted.
 */
export async function pushAllToBackend(): Promise<void> {
  setStatus("syncing");
  try {
    const kv = await withRetry(() => getKVActor());
    const SMS_KEYS = [
      "sms_institutes",
      "sms_employees",
      "sms_attendance",
      "sms_salary",
      "sms_daily_workers",
      "sms_next_institute_id",
      "sms_next_employee_id",
      "sms_next_daily_worker_id",
      "sms_settings",
      "sms_employee_creds",
      "tally_transactions",
      "fees_students",
      "fees_structures",
      "fees_payments",
      "fees_categories",
    ];
    const pushPromises: Promise<void>[] = [];
    for (const key of SMS_KEYS) {
      const val = localStorage.getItem(key);
      if (val !== null) {
        pushPromises.push(withRetry(() => kv.set(key, val)));
      }
    }
    await Promise.all(pushPromises);
    setStatus("ok");
  } catch (err) {
    console.warn("[backendSync] pushAllToBackend failed:", err);
    setStatus("error");
  }
}
