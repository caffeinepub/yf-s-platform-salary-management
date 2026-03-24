export interface Transaction {
  slNo: number;
  date: string;
  party: string;
  narration: string;
  chequeNo: string;
  amount: number;
  entryType: "debit" | "credit";
}

export type TallyPage =
  | "dashboard"
  | "transactions"
  | "journal"
  | "daybook"
  | "cashbook"
  | "bankbook"
  | "purchase"
  | "sales"
  | "ledger"
  | "trialbalance"
  | "balancesheet"
  | "profitloss"
  | "receivables"
  | "payables"
  | "stock";
