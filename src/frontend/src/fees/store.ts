import { syncKeyToBackend } from "../services/backendSync";
import type { FeeCategory, FeeStructure, Payment, Student } from "./types";

const KEYS = {
  students: "fees_students",
  categories: "fees_categories",
  structures: "fees_structures",
  payments: "fees_payments",
};

function load<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as T[];
  } catch {
    return [];
  }
}

function save(key: string, data: unknown[]) {
  const json = JSON.stringify(data);
  localStorage.setItem(key, json);
  syncKeyToBackend(key, json);
}

export function getStudents(): Student[] {
  return load<Student>(KEYS.students);
}
export function saveStudents(s: Student[]) {
  save(KEYS.students, s);
}

export function getCategories(): FeeCategory[] {
  const cats = load<FeeCategory>(KEYS.categories);
  if (cats.length === 0) {
    const defaults: FeeCategory[] = [
      { id: 1, name: "Tuition Fee", description: "Monthly tuition charges" },
      { id: 2, name: "Transport Fee", description: "School transport charges" },
      { id: 3, name: "Library Fee", description: "Library usage charges" },
      {
        id: 4,
        name: "Sports Fee",
        description: "Sports and activities charges",
      },
      { id: 5, name: "Exam Fee", description: "Examination charges" },
    ];
    save(KEYS.categories, defaults);
    return defaults;
  }
  return cats;
}
export function saveCategories(c: FeeCategory[]) {
  save(KEYS.categories, c);
}

export function getFeeStructures(): FeeStructure[] {
  return load<FeeStructure>(KEYS.structures);
}
export function saveFeeStructures(s: FeeStructure[]) {
  save(KEYS.structures, s);
}

export function getPayments(): Payment[] {
  return load<Payment>(KEYS.payments);
}
export function savePayments(p: Payment[]) {
  save(KEYS.payments, p);
}
