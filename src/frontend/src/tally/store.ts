import { syncKeyToBackend } from "../services/backendSync";
import type { Transaction } from "./types";

const STORAGE_KEY = "tally_transactions";

export function getTallyTransactions(): Transaction[] {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]",
    ) as Transaction[];
  } catch {
    return [];
  }
}

export function saveTallyTransactions(transactions: Transaction[]): void {
  const json = JSON.stringify(transactions);
  localStorage.setItem(STORAGE_KEY, json);
  syncKeyToBackend(STORAGE_KEY, json);
}

export function getUniqueParties(transactions: Transaction[]): string[] {
  return Array.from(new Set(transactions.map((t) => t.party))).sort();
}

export function getPartyBalance(
  transactions: Transaction[],
  party: string,
): { debit: number; credit: number; net: number } {
  let debit = 0;
  let credit = 0;
  for (const tx of transactions) {
    if (tx.party === party) {
      if (tx.entryType === "debit") debit += tx.amount;
      else credit += tx.amount;
    }
  }
  return { debit, credit, net: debit - credit };
}
