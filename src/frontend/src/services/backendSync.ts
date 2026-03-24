// ─── Backend Key-Value Sync Service ─────────────────────────────────────────
// Uses a custom IDL to call the KV store methods (set/get/remove) which were
// added to main.mo after the typed bindings were generated.

import { Actor, HttpAgent } from "@icp-sdk/core/agent";
import { loadConfig } from "../config";

// Minimal Candid IDL factory for KV store operations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const kvIdlFactory = ({ IDL }: any) =>
  IDL.Service({
    set: IDL.Func([IDL.Text, IDL.Text], [], []),
    get: IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ["query"]),
    remove: IDL.Func([IDL.Text], [], []),
  });

// Keys managed by this sync service
const SYNC_KEYS = [
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

// ─── Sync status observable ───────────────────────────────────────────────────

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
  for (const fn of listeners) fn(s);
}

// ─── Actor singleton ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _actor: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getActor(): Promise<any> {
  if (!_actor) {
    const config = await loadConfig();
    const agent = new HttpAgent({ host: config.backend_host });
    // Fetch root key for local replica only
    if (config.backend_host?.includes("localhost")) {
      try {
        await agent.fetchRootKey();
      } catch {
        // ignore in production
      }
    }
    _actor = Actor.createActor(kvIdlFactory, {
      agent,
      canisterId: config.backend_canister_id,
    });
  }
  return _actor;
}

export function resetActor(): void {
  _actor = null;
}

// ─── Retry helper ─────────────────────────────────────────────────────────────

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
      if (i < retries - 1)
        await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastErr;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Pull all known keys from the backend canister and restore into localStorage.
 * Called on startup to hydrate data across devices.
 */
export async function syncFromBackend(): Promise<void> {
  setStatus("syncing");
  try {
    const actor = await withRetry(getActor);
    const results = await Promise.all(
      SYNC_KEYS.map(async (key) => {
        try {
          const result = await actor.get(key);
          // Candid opt returns [] for None, [value] for Some
          const value =
            Array.isArray(result) && result.length > 0 ? result[0] : null;
          return { key, value };
        } catch {
          return { key, value: null };
        }
      }),
    );
    for (const { key, value } of results) {
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
 * Write a single key-value pair to the backend canister.
 */
export function syncKeyToBackend(key: string, value: string): void {
  setStatus("syncing");
  withRetry(async () => {
    const actor = await getActor();
    await actor.set(key, value);
  })
    .then(() => setStatus("ok"))
    .catch((err) => {
      console.warn("[backendSync] set failed after retries:", key, err);
      setStatus("error");
    });
}

/**
 * Delete a key from the backend canister.
 */
export function deleteKeyFromBackend(key: string): void {
  withRetry(async () => {
    const actor = await getActor();
    await actor.remove(key);
  }).catch((err) => console.warn("[backendSync] remove failed:", key, err));
}

/**
 * Push ALL known localStorage keys to the backend canister.
 * Call after login to ensure any data entered before sync is persisted.
 */
export async function pushAllToBackend(): Promise<void> {
  setStatus("syncing");
  try {
    resetActor();
    const actor = await withRetry(getActor);
    await Promise.all(
      SYNC_KEYS.map(async (key) => {
        const val = localStorage.getItem(key);
        if (val !== null) {
          await withRetry(() => actor.set(key, val));
        }
      }),
    );
    setStatus("ok");
  } catch (err) {
    console.warn("[backendSync] pushAllToBackend failed:", err);
    setStatus("error");
  }
}
