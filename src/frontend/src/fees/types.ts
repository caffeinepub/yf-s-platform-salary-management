export interface Student {
  id: number;
  name: string;
  rollNo: string;
  className: string;
  phone: string;
  address: string;
  status: "active" | "inactive";
}

export interface FeeCategory {
  id: number;
  name: string;
  description: string;
}

export interface FeeStructure {
  id: number;
  className: string;
  categoryId: number;
  amount: number;
  frequency: "monthly" | "quarterly" | "annually" | "one-time";
}

export interface Payment {
  id: number;
  studentId: number;
  feeStructureId: number;
  categoryName: string;
  amount: number;
  paymentDate: string;
  method: "cash" | "cheque" | "online" | "dd";
  chequeNo: string;
  receiptNo: string;
  remarks: string;
}

export type FeesPage =
  | "dashboard"
  | "students"
  | "feestructure"
  | "collectfee"
  | "payments"
  | "reports";
