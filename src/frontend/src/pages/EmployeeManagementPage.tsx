import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  ArrowRightLeft,
  Briefcase,
  Building2,
  Calendar,
  Camera,
  CreditCard,
  DollarSign,
  Download,
  FileUp,
  History,
  Landmark,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Designation,
  type Employee,
  EmploymentType,
  type Institute,
  useAddEmployee,
  useDeleteAllEmployees,
  useDeleteEmployee,
  useGetAllEmployees,
  useGetAllInstitutes,
  useGetEmployeesForInstitute,
  useUpdateEmployee,
} from "../hooks/useQueries";
import { syncKeyToBackend } from "../services/backendSync";
import { formatDate } from "../utils/dateUtils";

const DESIGNATIONS: string[] = [
  "Academic Coordinator",
  "Account Assistant",
  "Accountant",
  "Accounts Manager",
  "Additional Director",
  "Admission Officer",
  "Art & Craft Teacher",
  "Assistant",
  "Assistant General Manager",
  "Assistant Lecturer",
  "Assistant Librarian",
  "Assistant Manager",
  "Assistant Professor",
  "Assistant Section Officer",
  "Assistant Teacher",
  "Assistant Warden",
  "Associate Dean",
  "Associate Professor",
  "Auditor",
  "Billing Clerk",
  "Budget Analyst",
  "CA (Chartered Accountant)",
  "Caretaker",
  "Carpenter",
  "Cashier",
  "Chief Financial Officer",
  "Chief Warden",
  "Clerk",
  "CMA (Cost Accountant)",
  "College Librarian",
  "Computer Operator",
  "Computer Teacher",
  "Cook",
  "Coordinator",
  "Counsellor",
  "Dance Teacher",
  "Data Entry Operator",
  "Dean",
  "Deputy Director",
  "Deputy General Manager",
  "Deputy Headmaster",
  "Deputy Manager",
  "Deputy Warden",
  "Director",
  "Drawing Teacher",
  "Driver",
  "Electrician",
  "Electronics Technician",
  "Examination Controller",
  "Executive",
  "Finance Manager",
  "Finance Officer",
  "Front Desk Officer",
  "Gardener",
  "Gate Keeper",
  "General Manager",
  "Guest Lecturer",
  "Head Cook",
  "Headmaster",
  "Headmistress",
  "Helper",
  "HOD (Head of Department)",
  "HOI (Head of Institution)",
  "Hostel Attendant",
  "Hostel Manager",
  "Hostel Superintendent",
  "Hostel Supervisor",
  "Hostel Warden",
  "HR Assistant",
  "HR Manager",
  "HR Officer",
  "Inspector",
  "Internal Auditor",
  "Inventory Controller",
  "IT Manager",
  "Joint Director",
  "Junior Accountant",
  "Junior Assistant",
  "Junior Clerk",
  "Junior Executive",
  "Kitchen Staff",
  "Lab Assistant",
  "Lab Incharge",
  "Lab Technician",
  "Lecturer",
  "Liaison Officer",
  "Librarian",
  "Library Teacher",
  "Logistics Officer",
  "Manager",
  "Matron",
  "Mechanic",
  "Mess Supervisor",
  "Music Teacher",
  "Network Engineer",
  "NTT (Nursery Teacher)",
  "Office Boy",
  "Officer",
  "Payroll Officer",
  "Peon",
  "Personal Assistant",
  "PET (Physical Education Teacher)",
  "PGT (Post Graduate Teacher)",
  "Physical Education Teacher",
  "Plumber",
  "Primary Teacher",
  "Principal",
  "PRO (Public Relations Officer)",
  "Pro Vice Chancellor",
  "Professor",
  "PRT (Primary Teacher)",
  "Purchase Assistant",
  "Purchase Manager",
  "Purchase Officer",
  "Receptionist",
  "Record Keeper",
  "Recruitment Officer",
  "Registrar",
  "Research Scholar",
  "School Nurse",
  "Section Officer",
  "Security Guard",
  "Security Officer",
  "Senior Accountant",
  "Senior Assistant",
  "Senior Clerk",
  "Senior Executive",
  "Senior Lecturer",
  "Senior Security Guard",
  "Senior Teacher",
  "Software Developer",
  "Special Educator",
  "Store Assistant",
  "Store Keeper",
  "Store Manager",
  "Supervisor",
  "Supply Chain Officer",
  "Sweeper",
  "System Administrator",
  "Tax Consultant",
  "Tax Officer",
  "Teacher",
  "Technical Support Officer",
  "TGT (Trained Graduate Teacher)",
  "Time Keeper",
  "Training Officer",
  "Tutor",
  "Vice Chancellor",
  "Vice Principal",
  "Visiting Faculty",
  "Watchman",
];
const DEPARTMENTS: string[] = [
  "Administration",
  "Academic",
  "Finance & Accounts",
  "Human Resource",
  "Purchase & Store",
  "Hostel Management",
  "Library",
  "IT Department",
  "Technical",
  "Security",
  "Other",
];

// Merge custom designations/departments from settings
function getMergedDesignations(): string[] {
  try {
    const custom: string[] = JSON.parse(
      localStorage.getItem("sms_custom_designations") || "[]",
    );
    const merged = [...new Set([...DESIGNATIONS, ...custom])].sort();
    return merged;
  } catch {
    return DESIGNATIONS;
  }
}

function getMergedDepartments(): string[] {
  try {
    const custom: string[] = JSON.parse(
      localStorage.getItem("sms_custom_departments") || "[]",
    );
    const merged = [...new Set([...DEPARTMENTS, ...custom])].sort();
    return merged;
  } catch {
    return DEPARTMENTS;
  }
}

const BANK_NAMES: string[] = [
  "Bank of India",
  "ICICI Bank",
  "UCO Bank",
  "HDFC Bank",
  "State Bank of India",
];

const BANK_BRANCHES: Record<string, string[]> = {
  "Bank of India": ["Indrapuri"],
  "ICICI Bank": ["Arera Colony"],
  "UCO Bank": ["Piplani"],
  "HDFC Bank": ["Indrapuri"],
  "State Bank of India": ["(HET) Piplani", "(K.H) Habibganj"],
};

function getMergedBankNames(): string[] {
  try {
    const custom: { name: string; branches: string[] }[] = JSON.parse(
      localStorage.getItem("sms_custom_banks") || "[]",
    );
    return [
      ...BANK_NAMES,
      ...custom.map((b) => b.name).filter((n) => !BANK_NAMES.includes(n)),
    ];
  } catch {
    return BANK_NAMES;
  }
}

function getMergedBankBranches(): Record<string, string[]> {
  try {
    const custom: { name: string; branches: string[] }[] = JSON.parse(
      localStorage.getItem("sms_custom_banks") || "[]",
    );
    const merged: Record<string, string[]> = { ...BANK_BRANCHES };
    for (const b of custom) {
      if (b.name && b.branches.length > 0) {
        merged[b.name] = b.branches;
      }
    }
    return merged;
  } catch {
    return BANK_BRANCHES;
  }
}

const COUNTRY_CODES: string[] = [
  "+91",
  "+1",
  "+44",
  "+61",
  "+971",
  "+65",
  "+60",
  "+66",
  "+49",
  "+33",
];

function mapDesignationToEnum(d: string): Designation {
  const academic = [
    "Principal",
    "Vice Principal",
    "HOI (Head of Institution)",
    "Headmaster",
    "Headmistress",
    "Deputy Headmaster",
    "PGT (Post Graduate Teacher)",
    "TGT (Trained Graduate Teacher)",
    "PRT (Primary Teacher)",
    "NTT (Nursery Teacher)",
    "Senior Teacher",
    "Teacher",
    "Assistant Teacher",
    "Primary Teacher",
    "Physical Education Teacher",
    "PET (Physical Education Teacher)",
    "Drawing Teacher",
    "Music Teacher",
    "Art & Craft Teacher",
    "Dance Teacher",
    "Library Teacher",
    "Librarian",
    "Assistant Librarian",
    "Lab Assistant",
    "Computer Teacher",
    "Tutor",
    "Special Educator",
    "Counsellor",
    "School Nurse",
    "Chief Warden",
    "Hostel Warden",
    "Assistant Warden",
    "Deputy Warden",
    "Hostel Superintendent",
    "Hostel Supervisor",
    "Hostel Manager",
    "Caretaker",
    "Hostel Attendant",
    "Matron",
    "Mess Manager",
    "Mess Supervisor",
  ];
  const lecture = [
    "Vice Chancellor",
    "Pro Vice Chancellor",
    "Registrar",
    "Dean",
    "Associate Dean",
    "Professor",
    "Associate Professor",
    "Assistant Professor",
    "Senior Lecturer",
    "Lecturer",
    "Assistant Lecturer",
    "Guest Lecturer",
    "Visiting Faculty",
    "Research Scholar",
    "HOD (Head of Department)",
    "Coordinator",
    "Academic Coordinator",
    "Examination Controller",
    "Admission Officer",
    "College Librarian",
    "Lab Incharge",
  ];
  const finance = [
    "Chief Financial Officer",
    "Finance Manager",
    "Finance Officer",
    "Accounts Manager",
    "Senior Accountant",
    "Accountant",
    "Account Assistant",
    "Junior Accountant",
    "Cashier",
    "Auditor",
    "Internal Auditor",
    "CA (Chartered Accountant)",
    "CMA (Cost Accountant)",
    "Tax Consultant",
    "Tax Officer",
    "Billing Clerk",
    "Budget Analyst",
    "Purchase Manager",
    "Purchase Officer",
    "Purchase Assistant",
    "Store Manager",
    "Store Keeper",
    "Store Assistant",
    "Inventory Controller",
    "Logistics Officer",
    "Supply Chain Officer",
    "Payroll Officer",
  ];
  const officer = [
    "Director",
    "Managing Director",
    "Chief Executive Officer",
    "General Manager",
    "Deputy General Manager",
    "Assistant General Manager",
    "Manager",
    "Deputy Manager",
    "Assistant Manager",
    "Superintendent",
    "Section Officer",
    "Deputy Section Officer",
    "Assistant Section Officer",
    "Office Superintendent",
    "Administrative Officer",
    "Admin Manager",
    "Administrative Assistant",
    "Office Assistant",
    "Assistant",
    "Senior Assistant",
    "Junior Assistant",
    "Supervisor",
    "Executive",
    "Senior Executive",
    "Junior Executive",
    "Officer",
    "Inspector",
    "Personal Assistant",
    "Receptionist",
    "Front Desk Officer",
    "Clerk",
    "Senior Clerk",
    "Junior Clerk",
    "Record Keeper",
    "Time Keeper",
    "Data Entry Operator",
    "Liaison Officer",
    "PRO (Public Relations Officer)",
    "HR Manager",
    "HR Officer",
    "HR Assistant",
    "Recruitment Officer",
    "Training Officer",
    "IT Manager",
    "System Administrator",
    "Network Engineer",
    "Software Developer",
    "Technical Support Officer",
    "Computer Operator",
    "Lab Technician",
    "Electronics Technician",
    "Electrician",
    "Plumber",
    "Carpenter",
    "Mechanic",
    "Security Officer",
    "Security Guard",
    "Watchman",
    "Peon",
    "Attender",
    "Office Boy",
    "Driver",
    "Sweeper",
    "Gardner",
    "Sanitation Worker",
    "Cook",
    "Head Cook",
    "Assistant Cook",
    "Kitchen Helper",
    "Housekeeping Staff",
    "Night Watchman",
  ];
  if (lecture.includes(d)) return Designation.lecturer;
  if (academic.includes(d)) return Designation.adminStaff;
  if (finance.includes(d)) return Designation.adminStaff;
  if (officer.includes(d)) return Designation.officer;
  if (Object.values(Designation).includes(d as Designation))
    return d as Designation;
  return Designation.adminStaff;
}

const designationLabel = (d: string) => d || "—";

interface EmpForm {
  name: string;
  employeeId: string;
  designation: string;
  department: string;
  instituteId: string;
  address: string;
  bhelQuarter: "yes" | "no" | "";
  profilePic: string;
  dob: string;
  religion: string;
  gender: "male" | "female" | "other" | "";
  category: string;
  employeeType: EmploymentType | "";
  employeeStatus:
    | "active"
    | "inactive"
    | "resigned"
    | "retired"
    | "relieved"
    | "";
  countryCode: string;
  phone: string;
  emailId: string;
  joiningDate: string;
  // Salary & Banking
  basicSalary: string;
  ta: string;
  bankName: string;
  bankBranch: string;
  bankAccountNo: string;
  ifscCode: string;
  panNo: string;
  pfNumber: string;
  esiNumber: string;
  aadhaarNo: string;
  uanNo: string;
  licNos: string[];
}

const EMPTY_FORM: EmpForm = {
  name: "",
  employeeId: "",
  designation: "",
  department: "",
  instituteId: "",
  address: "",
  bhelQuarter: "no",
  profilePic: "",
  dob: "",
  religion: "",
  gender: "",
  category: "",
  employeeType: "",
  employeeStatus: "active",
  countryCode: "+91",
  phone: "",
  emailId: "",
  joiningDate: "",
  basicSalary: "",
  ta: "",
  bankName: "",
  bankBranch: "",
  bankAccountNo: "",
  ifscCode: "",
  panNo: "",
  pfNumber: "",
  esiNumber: "",
  aadhaarNo: "",
  uanNo: "",
  licNos: [],
};

function getEmpExtra(employeeId: string): any {
  try {
    return JSON.parse(localStorage.getItem(`empExtra_${employeeId}`) || "{}");
  } catch {
    return {};
  }
}
function saveEmpExtra(employeeId: string, data: any) {
  const serialized = JSON.stringify(data);
  localStorage.setItem(`empExtra_${employeeId}`, serialized);
  syncKeyToBackend(`empExtra_${employeeId}`, serialized);
}

function parseDateToISO(val: string | number | undefined | null): string {
  if (val === null || val === undefined || val === "") return "";
  const s = String(val).trim();
  // Handle Excel serial numbers (numeric > 40000)
  if (/^\d+$/.test(s) && Number(s) > 40000) {
    const d = new Date((Number(s) - 25569) * 86400 * 1000);
    return d.toISOString().split("T")[0];
  }
  // Handle "dd-Mmm,YYYY" or "dd-Mmm YYYY" or "dd/mm/yyyy"
  const match = s.match(/(\d{1,2})[-/](\w{3})[,\s]+(\d{4})/);
  if (match) {
    const months: Record<string, string> = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };
    return `${match[3]}-${months[match[2]] || "01"}-${match[1].padStart(2, "0")}`;
  }
  // Handle YYYY-MM-DD already
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // Fallback: try Date parse
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().split("T")[0];
  return "";
}

export default function EmployeeManagementPage() {
  const { data: institutes = [], isLoading: loadingInstitutes } =
    useGetAllInstitutes();
  const [selectedInstId, setSelectedInstId] = useState<string>("all");
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] =
    useState<string>("all");
  const { data: allEmployees = [], isLoading: loadingEmps } =
    useGetAllEmployees();
  const employees =
    selectedInstId === "all"
      ? allEmployees
      : allEmployees.filter((e) => e.instituteId.toString() === selectedInstId);

  // Fix 4: Auto-select if only one institute exists
  // Using direct comparison instead of useEffect to avoid lint issues
  if (institutes.length === 1 && selectedInstId === "all") {
    setSelectedInstId(institutes[0].id.toString());
  }

  const addMutation = useAddEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();
  const deleteAllMutation = useDeleteAllEmployees();
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"excel" | "pdf">(
    "excel",
  );

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [promoTarget, setPromoTarget] = useState<Employee | null>(null);
  const [promoForm, setPromoForm] = useState({
    type: "promotion",
    fromDesignation: "",
    toDesignation: "",
    fromInstitute: "",
    toInstitute: "",
    effectiveDate: "",
    remarks: "",
  });
  const picRef = useRef<HTMLInputElement>(null);

  function getPromoHistory(empId: string): Array<{
    type: string;
    from: string;
    to: string;
    date: string;
    remarks: string;
  }> {
    try {
      return JSON.parse(localStorage.getItem(`promoHistory_${empId}`) || "[]");
    } catch {
      return [];
    }
  }
  function savePromoHistory(
    empId: string,
    record: {
      type: string;
      from: string;
      to: string;
      date: string;
      remarks: string;
    },
  ) {
    const history = getPromoHistory(empId);
    history.push(record);
    localStorage.setItem(`promoHistory_${empId}`, JSON.stringify(history));
  }
  function handlePromoSave() {
    if (!promoTarget) return;
    savePromoHistory(promoTarget.employeeId, {
      type: promoForm.type,
      from:
        promoForm.type === "promotion"
          ? promoForm.fromDesignation
          : promoForm.fromInstitute,
      to:
        promoForm.type === "promotion"
          ? promoForm.toDesignation
          : promoForm.toInstitute,
      date: promoForm.effectiveDate,
      remarks: promoForm.remarks,
    });
    toast.success(
      promoForm.type === "promotion"
        ? "Promotion recorded."
        : "Transfer recorded.",
    );
    setPromoTarget(null);
    setPromoForm({
      type: "promotion",
      fromDesignation: "",
      toDesignation: "",
      fromInstitute: "",
      toInstitute: "",
      effectiveDate: "",
      remarks: "",
    });
  }

  const [form, setForm] = useState<EmpForm>(EMPTY_FORM);

  const filtered = employees.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchesEmpFilter =
      selectedEmployeeFilter === "all" ||
      e.employeeId === selectedEmployeeFilter;
    return matchesSearch && matchesEmpFilter;
  });

  const openAdd = () => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, instituteId: "" });
    setFormOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditTarget(emp);
    const extra = getEmpExtra(emp.employeeId);
    setForm({
      name: emp.name,
      employeeId: emp.employeeId,
      designation: emp.designation,
      department: extra.department || "",
      instituteId: emp.instituteId.toString(),
      address: emp.address,
      bhelQuarter: extra.bhelQuarter || "no",
      profilePic: extra.profilePic || "",
      dob: emp.dob,
      religion: extra.religion || "",
      gender: extra.gender || "",
      category: extra.category || "",
      employeeType: emp.employmentType as EmploymentType | "",
      employeeStatus: extra.employeeStatus || "",
      countryCode: extra.countryCode || "+91",
      phone: extra.phone || "",
      emailId: extra.emailId || extra.email || "",
      joiningDate: emp.joiningDate,
      basicSalary: emp.basicSalary.toString(),
      bankName: extra.bankName || "",
      bankBranch: (() => {
        const bn = extra.bankName || "";
        const existingBranch = extra.bankBranch || "";
        if (existingBranch) return existingBranch;
        const branches = getMergedBankBranches()[bn] || [];
        return branches.length === 1 ? branches[0] : "";
      })(),
      bankAccountNo: String(extra.bankAccountNo || extra.bankAccount || ""),
      ifscCode: extra.ifscCode || "",
      panNo: extra.panNo || extra.panNumber || "",
      pfNumber: extra.pfNumber || extra.pfAccount || "",
      esiNumber: extra.esiNumber || extra.esicNumber || "",
      aadhaarNo: extra.aadhaarNo || extra.aadharNumber || "",
      uanNo: extra.uanNo || "",
      licNos:
        Array.isArray(extra.licNos) && extra.licNos.length > 0
          ? extra.licNos
          : extra.licNo
            ? [extra.licNo]
            : [],
      ta: String(extra.ta || "0"),
    });
    setFormOpen(true);
  };

  const xlsxFileRef = useRef<HTMLInputElement>(null);

  const downloadSampleFile = useCallback(() => {
    const headers = [
      "slno",
      "staffno",
      "name",
      "designation",
      "department",
      "dob",
      "joiningDate",
      "status",
      "institute",
      "gender",
      "religion",
      "pan",
      "pfNo",
      "esicNo",
      "aadhaar",
      "uan",
      "phone",
      "email",
      "bankName",
      "bankBranch",
      "bankAccountNo",
      "licNos",
      "address",
      "employmentType",
    ];
    const rows = [
      headers,
      [
        "1",
        "EMP001",
        "John Doe",
        "Account Assistant",
        "Finance & Accounts",
        "01-Jan,1990",
        "01-Apr,2020",
        "Active",
        "BSM",
        "Male",
        "Hindu",
        "ABCDE1234F",
        "12345678901",
        "1234567890123456",
        "123456789012",
        "100123456789",
        "+919876543210",
        "john@example.com",
        "Bank of India",
        "Indrapuri",
        "0012345678901",
        "123456789",
        "123 Main Street",
        "regular",
      ],
      [
        "2",
        "EMP002",
        "Jane Smith",
        "Lecturer",
        "Teaching Staff",
        "15-Mar,1988",
        "01-Jul,2018",
        "Active",
        "VHSS",
        "Female",
        "Christian",
        "FGHIJ5678K",
        "98765432101",
        "9876543210987654",
        "987654321098",
        "200987654321",
        "+919812345678",
        "jane@example.com",
        "State Bank of India",
        "(HET) Piplani",
        "9876543210123",
        "",
        "456 Park Avenue",
        "temporary",
      ],
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_employees.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleBulkUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";
      try {
        const text = await file.text();
        const lines = text
          .trim()
          .split("\n")
          .map((l: string) => l.replace(/\r$/, ""));
        if (lines.length < 2) {
          toast.error("No data found in file");
          return;
        }
        const headers = lines[0]
          .split(",")
          .map((h) => h.trim().replace(/^"|"$/g, ""));
        const rows: any[] = lines.slice(1).map((line) => {
          const vals = line
            .split(",")
            .map((v) => v.trim().replace(/^"|"$/g, ""));
          const obj: any = {};
          headers.forEach((h, i) => {
            obj[h] = vals[i] || "";
          });
          return obj;
        });
        if (!rows.length) {
          toast.error("No data found in file");
          return;
        }
        let added = 0;
        let skipped = 0;
        let failed = 0;
        // Build set of existing staffnos for duplicate detection
        const existingStaffNos = new Set(
          (allEmployees as any[]).map((e: any) =>
            String(e.employeeId || "").trim(),
          ),
        );
        for (const row of rows) {
          const staffno = String(row.staffno || row.id || "").trim();
          const name = String(row.name || "").trim();
          const designation = String(row.designation || "").trim();
          const institute = String(row.institute || "").trim();
          const rawStatus = String(row.status || "regular")
            .trim()
            .toLowerCase();
          const dob = parseDateToISO(row.dob) || "2000-01-01";
          const joiningDate =
            parseDateToISO(row.joiningDate) ||
            new Date().toISOString().split("T")[0];
          const gender = String(row.gender || "").trim();
          const religion = String(row.religion || "").trim();
          const pan = String(row.pan || "").trim();
          const pfNo = String(row.pfNo || "").trim();
          const esicNo = String(row.esicNo || "").trim();
          const aadhaar = String(row.aadhaar || "").trim();
          const uan = String(row.uan || "").trim();
          const phone = String(row.phone || "").trim();
          const email = String(row.email || "").trim();
          const bankName = String(row.bankName || "").trim();
          const bankBranch = String(row.bankBranch || "").trim();
          const rawAcct = row.bankAccountNo ?? row.accountNo;
          const bankAccountNo =
            rawAcct !== undefined && rawAcct !== null && rawAcct !== ""
              ? typeof rawAcct === "number" ||
                (typeof rawAcct === "string" &&
                  (rawAcct.includes("e") || rawAcct.includes("E")))
                ? String(Math.round(Number(rawAcct)))
                : String(rawAcct).trim()
              : "";
          const licNosRaw = String(row.licNos || "").trim();
          const licNos = licNosRaw
            ? licNosRaw
                .split(";")
                .map((l: string) => l.trim())
                .filter(Boolean)
            : [];
          const address = String(row.address || "-").trim();
          const employmentType = String(
            row.employmentType || rawStatus || "regular",
          )
            .trim()
            .toLowerCase();
          const department = String(row.department || "").trim();

          if (!staffno || !name) {
            failed++;
            continue;
          }
          // Fix 1A: Skip duplicates
          if (existingStaffNos.has(staffno)) {
            skipped++;
            continue;
          }
          // Fix 1B: Match institute by shortCode first, then by name
          const matchedInstitute =
            institutes.find(
              (i: Institute) =>
                (i as any).shortCode &&
                (i as any).shortCode.toLowerCase() === institute.toLowerCase(),
            ) ||
            institutes.find(
              (i: Institute) =>
                i.name.toLowerCase().includes(institute.toLowerCase()) ||
                institute.toLowerCase().includes(i.name.toLowerCase()),
            );
          const instId = matchedInstitute?.id ?? institutes[0]?.id;
          if (!instId) {
            failed++;
            continue;
          }
          // Fix 1C: Handle custom designations - add to DESIGNATIONS list if not found
          const normalizedDesig = designation.trim();
          if (normalizedDesig && !DESIGNATIONS.includes(normalizedDesig)) {
            // add dynamically so it can be used going forward
            DESIGNATIONS.push(normalizedDesig);
            DESIGNATIONS.sort();
          }
          const mappedDesig = mapDesignationToEnum(
            normalizedDesig || "Officer",
          );
          const empType =
            employmentType === "regular"
              ? EmploymentType.regular
              : EmploymentType.temporary;
          try {
            await addMutation.mutateAsync({
              name,
              employeeId: staffno,
              instituteId: BigInt(instId),
              designation: mappedDesig,
              employmentType: empType,
              joiningDate:
                joiningDate || new Date().toISOString().split("T")[0],
              address: address || "-",
              dob: dob || "2000-01-01",
              basicSalary: BigInt(
                Math.round(
                  Number(row.basicPay || row.basicSalary || row.basic || 0) ||
                    0,
                ),
              ),
            });
            // Save extra fields
            saveEmpExtra(staffno, {
              designation: normalizedDesig || "",
              department: department || String(row.dept || "").trim(),
              gender: gender || String(row.gender || "").trim(),
              religion: religion || String(row.religion || "").trim(),
              category: String(row.category || "").trim(),
              fatherName: String(row.fatherName || row.father || "").trim(),
              panNo: pan || String(row.pan || row.panNo || "").trim(),
              pfNumber: pfNo || String(row.pf || row.pfNo || "").trim(),
              esiNumber: esicNo || String(row.esi || row.esicNo || "").trim(),
              aadhaarNo:
                aadhaar || String(row.aadhaar || row.aadhaarNo || "").trim(),
              uanNo: uan || String(row.uan || row.uanNo || "").trim(),
              phone: phone || String(row.phone || row.mobile || "").trim(),
              emailId: email || String(row.email || "").trim(),
              bankName: bankName || String(row.bankName || "").trim(),
              bankBranch: bankBranch || String(row.bankBranch || "").trim(),
              bankAccountNo:
                bankAccountNo ||
                String(row.accountNo || row.bankAccountNo || "").trim(),
              ifscCode: String(row.ifsc || row.ifscCode || "").trim(),
              licNos: licNos.length
                ? licNos
                : String(row.lic || row.licNos || "").trim()
                  ? String(row.lic || row.licNos || "")
                      .split(";")
                      .map((l: string) => l.trim())
                      .filter(Boolean)
                  : [],
              address,
              employeeType: employmentType,
              employeeStatus:
                String(row.status || row.employeeStatus || "active")
                  .trim()
                  .toLowerCase() || "active",
              ta: Number(row.ta || 0) || 0,
              vpfValue: Number(row.vpf || 0) || 0,
              institute: matchedInstitute?.name || "",
            });
            // Auto-generate credentials
            const autoUser = (
              name.toLowerCase().replace(/\s/g, "").slice(0, 4) + staffno
            ).toLowerCase();
            let creds: any[] = [];
            try {
              creds = JSON.parse(
                localStorage.getItem("employeeCredentials") || "[]",
              );
            } catch {
              creds = [];
            }
            const idx = creds.findIndex((c: any) => c.employeeId === staffno);
            const credObj = {
              username: autoUser,
              password: autoUser,
              employeeId: staffno,
              name,
            };
            if (idx >= 0) creds[idx] = credObj;
            else creds.push(credObj);
            localStorage.setItem("employeeCredentials", JSON.stringify(creds));
            added++;
          } catch {
            failed++;
          }
        }
        if (added > 0)
          toast.success(
            `Added ${added} employee${added > 1 ? "s" : ""} successfully${skipped > 0 ? `, ${skipped} skipped (duplicate)` : ""}${failed > 0 ? `, ${failed} failed` : ""}`,
          );
        else if (skipped > 0)
          toast.info(
            `All ${skipped} employees already exist (skipped duplicates).`,
          );
        else
          toast.error(
            `Failed to add employees${failed > 0 ? ` (${failed} rows had errors)` : ""}`,
          );
      } catch {
        toast.error("Failed to parse file. Please check the format.");
      }
    },
    [institutes, addMutation, allEmployees],
  );

  const setField = (field: keyof EmpForm, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setField("profilePic", ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.employeeId ||
      !form.instituteId ||
      !form.designation ||
      !form.employeeType
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    const payload = {
      name: form.name,
      employeeId: form.employeeId,
      instituteId: BigInt(form.instituteId),
      designation: mapDesignationToEnum(form.designation),
      employmentType: form.employeeType as EmploymentType,
      joiningDate: form.joiningDate || new Date().toISOString().split("T")[0],
      address: form.address || "-",
      dob: form.dob || "2000-01-01",
      basicSalary: BigInt(form.basicSalary || "0"),
    };
    try {
      if (editTarget) {
        await updateMutation.mutateAsync({ id: editTarget.id, ...payload });
      } else {
        await addMutation.mutateAsync(payload);
      }
      // Save extra fields to localStorage
      saveEmpExtra(form.employeeId, {
        department: form.department,
        bhelQuarter: form.bhelQuarter,
        profilePic: form.profilePic,
        religion: form.religion,
        gender: form.gender,
        category: form.category,
        employeeType: form.employeeType,
        employeeStatus: form.employeeStatus,
        countryCode: form.countryCode,
        phone: form.phone,
        emailId: form.emailId,
        bankName: form.bankName,
        bankBranch: form.bankBranch,
        bankAccountNo: form.bankAccountNo,
        ifscCode: form.ifscCode,
        panNo: form.panNo,
        pfNumber: form.pfNumber,
        esiNumber: form.esiNumber,
        aadhaarNo: form.aadhaarNo,
        uanNo: form.uanNo,
        licNos: form.licNos,
        ta: Number(form.ta) || 0,
        designation: form.designation,
        institute:
          institutes.find(
            (i: Institute) => i.id.toString() === form.instituteId,
          )?.name || "",
      });
      // Auto-generate credentials
      const autoUser = (
        form.name.toLowerCase().replace(/\s/g, "").slice(0, 4) + form.employeeId
      ).toLowerCase();
      const autoPass = autoUser;
      const credsKey = "employeeCredentials";
      let creds: Array<{
        username: string;
        password: string;
        employeeId: string;
        name: string;
      }> = [];
      try {
        creds = JSON.parse(localStorage.getItem(credsKey) || "[]");
      } catch {
        creds = [];
      }
      const existing = creds.findIndex(
        (c: any) => c.employeeId === form.employeeId,
      );
      if (existing >= 0) {
        creds[existing] = {
          username: autoUser,
          password: autoPass,
          employeeId: form.employeeId,
          name: form.name,
        };
      } else {
        creds.push({
          username: autoUser,
          password: autoPass,
          employeeId: form.employeeId,
          name: form.name,
        });
      }
      localStorage.setItem(credsKey, JSON.stringify(creds));
      toast.success(
        editTarget
          ? "Employee updated successfully"
          : `Employee added! Login: ${autoUser} / ${autoPass}`,
      );
      setFormOpen(false);
    } catch {
      toast.error("Operation failed. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Employee deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Delete failed");
    }
  };

  const isBusy = addMutation.isPending || updateMutation.isPending;
  const isLoading = loadingInstitutes || loadingEmps;
  const getInstName = (id: bigint) =>
    institutes.find((i: Institute) => i.id === id)?.name ?? "—";

  const inputCls =
    "bg-input/60 border-border/60 text-foreground placeholder:text-muted-foreground";

  return (
    <div className="space-y-6" data-ocid="employees.page">
      {/* No institutes warning */}
      {!loadingInstitutes && institutes.length === 0 && (
        <div
          className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4"
          data-ocid="employees.empty_state"
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-300">
              No Institute Found
            </p>
            <p className="text-xs text-amber-400/80 mt-0.5">
              Please go to{" "}
              <span className="font-medium text-amber-300">
                Institute Management
              </span>{" "}
              and add an institute before adding employees.
            </p>
          </div>
        </div>
      )}
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-gradient">
              Employee Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage all staff and personnel
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            ref={xlsxFileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleBulkUpload}
            data-ocid="employees.upload_button"
          />
          <Button
            variant="outline"
            className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
            onClick={downloadSampleFile}
            data-ocid="employees.secondary_button"
          >
            <Download className="w-4 h-4" /> Sample File
          </Button>
          <div
            className="flex items-center rounded-lg border border-border/60 overflow-hidden bg-card/60 h-9"
            data-ocid="employees.download_toggle"
          >
            {/* Left: icon toggle - click to switch format */}
            <button
              type="button"
              onClick={() =>
                setDownloadFormat(downloadFormat === "excel" ? "pdf" : "excel")
              }
              className="flex items-center justify-center px-2.5 h-full border-r border-border/60 bg-muted/40 hover:bg-muted/70 transition-colors"
              title={`Currently: ${downloadFormat === "excel" ? "Excel" : "PDF"} — click to switch`}
            >
              {downloadFormat === "excel" ? (
                <img
                  src="/assets/icons8-excel-100-019d61e2-4dd2-757d-bda6-75b5b55d7b42.png"
                  className="w-5 h-5"
                  alt="Excel"
                />
              ) : (
                <img
                  src="/assets/icons8-pdf-100-019d61e2-4dd8-759b-ad23-e6e539020f73.png"
                  className="w-5 h-5"
                  alt="PDF"
                />
              )}
            </button>
            {/* Right: download action */}
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 h-full text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-500/10 transition-colors whitespace-nowrap"
              onClick={() => {
                // Build CSV from filtered employees
                const headers = [
                  "staffno",
                  "name",
                  "fatherName",
                  "dob",
                  "gender",
                  "religion",
                  "category",
                  "designation",
                  "department",
                  "employeeType",
                  "status",
                  "joiningDate",
                  "address",
                  "phone",
                  "email",
                  "bankName",
                  "bankBranch",
                  "accountNo",
                  "ifsc",
                  "licNos",
                  "basicSalary",
                  "ta",
                  "vpf",
                  "institute",
                ];
                const rows = employees.map((emp: any) => {
                  const ex = getEmpExtra(emp.employeeId);
                  return [
                    emp.employeeId,
                    emp.name,
                    ex.fatherName || "",
                    emp.dob || "",
                    ex.gender || "",
                    ex.religion || "",
                    ex.category || "",
                    ex.designation || emp.designation || "",
                    ex.department || "",
                    String(emp.employmentType),
                    ex.employeeStatus || "active",
                    emp.joiningDate || "",
                    (emp.address || "").replace(/,/g, ";"),
                    ex.phone || "",
                    ex.emailId || "",
                    ex.bankName || "",
                    ex.bankBranch || "",
                    String(ex.bankAccountNo || ""),
                    ex.ifscCode || "",
                    Array.isArray(ex.licNos)
                      ? ex.licNos.join(";")
                      : ex.licNo || "",
                    Number(emp.basicSalary) || 0,
                    ex.ta || 0,
                    ex.vpfValue || 0,
                    (() => {
                      const inst = institutes.find(
                        (i: any) =>
                          i.id.toString() === emp.instituteId.toString(),
                      );
                      return (
                        (inst as any)?.shortCode ||
                        inst?.name ||
                        ex.institute ||
                        ""
                      );
                    })(),
                  ]
                    .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                    .join(",");
                });
                if (downloadFormat === "pdf") {
                  // PDF download via print window — landscape with all columns
                  const tableRows = employees
                    .map((emp: any) => {
                      const ex = getEmpExtra(emp.employeeId);
                      return `<tr>
                    <td>${emp.employeeId}</td>
                    <td>${emp.name}</td>
                    <td>${ex.designation || emp.designation || ""}</td>
                    <td>${ex.department || ""}</td>
                    <td>${String(emp.employmentType)}</td>
                    <td>${ex.employeeStatus || "active"}</td>
                    <td>${emp.joiningDate || ""}</td>
                    <td>${emp.dob || ""}</td>
                    <td>${ex.phone || ""}</td>
                    <td>${ex.emailId || ""}</td>
                    <td>${ex.bankName || ""}</td>
                    <td>${ex.bankBranch || ""}</td>
                    <td>${String(ex.bankAccountNo || "")}</td>
                    <td>${ex.ifscCode || ""}</td>
                    <td>${ex.panNo || ""}</td>
                    <td>${ex.pfNumber || ""}</td>
                    <td>${(() => {
                      const inst = institutes.find(
                        (i) => i.id.toString() === emp.instituteId.toString(),
                      );
                      return inst?.shortCode || inst?.name || "";
                    })()}</td>
                  </tr>`;
                    })
                    .join("");
                  const html = `<!DOCTYPE html><html><head><title>Employee Details</title>
                <style>@page{size:A4 landscape;margin:10mm;}body{font-family:Arial,sans-serif;font-size:8px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:3px 4px;text-align:left;word-break:break-all;}th{background:#f5f5f5;font-weight:bold;}h2{margin-bottom:6px;font-size:12px;}</style></head>
                <body><h2>Employee Details — ${new Date().toLocaleDateString("en-IN")}</h2>
                <table><thead><tr>
                  <th>Staff No</th><th>Name</th><th>Designation</th><th>Dept</th><th>Type</th><th>Status</th>
                  <th>DOJ</th><th>DOB</th><th>Phone</th><th>Email</th>
                  <th>Bank Name</th><th>Branch</th><th>A/C No</th><th>IFSC</th><th>PAN No</th><th>PF No</th><th>Institute</th>
                </tr></thead>
                <tbody>${tableRows}</tbody></table></body></html>`;
                  const w = window.open("", "_blank");
                  if (w) {
                    w.document.write(html);
                    w.document.close();
                    w.print();
                  }
                } else {
                  const csv = [headers.join(","), ...rows].join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `employees_${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }
              }}
              data-ocid="employees.download_button"
            >
              <Download className="w-4 h-4" />
              Employee Detail's
            </button>
          </div>
          <Button
            variant="outline"
            className="gap-2 border-primary/40 text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => xlsxFileRef.current?.click()}
            disabled={institutes.length === 0 && !loadingInstitutes}
            data-ocid="employees.upload_button"
          >
            <FileUp className="w-4 h-4" /> Upload Excel
          </Button>
          <Button
            onClick={openAdd}
            disabled={institutes.length === 0 && !loadingInstitutes}
            className="gradient-primary text-white border-0 glow-primary gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            data-ocid="employees.add_button"
          >
            <Plus className="w-4 h-4" /> Add Employee
          </Button>
          {employees.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteAllDialog(true)}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete All
            </Button>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row sm:items-center gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees..."
            className="pl-9 bg-card/60 border-border/60"
            data-ocid="employees.search_input"
          />
          {search && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch("")}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:justify-end">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={selectedInstId}
              onValueChange={(v) => {
                setSelectedInstId(v);
                setSelectedEmployeeFilter("all");
              }}
            >
              <SelectTrigger
                className="bg-card/60 border-border/60"
                data-ocid="employees.institute.select"
              >
                <Building2 className="w-4 h-4 mr-1 text-muted-foreground flex-shrink-0" />
                <SelectValue placeholder="All Institutes" />
              </SelectTrigger>
              <SelectContent className="max-h-72 overflow-y-auto">
                <SelectItem value="all">All Institutes</SelectItem>
                {institutes.map((i: Institute) => (
                  <SelectItem key={i.id.toString()} value={i.id.toString()}>
                    {(i as any).shortCode || i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-60">
            <Select
              value={selectedEmployeeFilter}
              onValueChange={(v) => setSelectedEmployeeFilter(v)}
            >
              <SelectTrigger
                className="bg-card/60 border-border/60"
                data-ocid="employees.employee.select"
              >
                <Users className="w-4 h-4 mr-1 text-muted-foreground flex-shrink-0" />
                <SelectValue placeholder="All Employees" />
              </SelectTrigger>
              <SelectContent className="max-h-72 overflow-y-auto">
                <SelectItem value="all">All Employees</SelectItem>
                {employees
                  .filter(
                    (emp) =>
                      selectedInstId === "all" ||
                      emp.instituteId.toString() === selectedInstId,
                  )
                  .map((emp) => (
                    <SelectItem key={emp.employeeId} value={emp.employeeId}>
                      {emp.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div
          className="flex items-center justify-center py-20"
          data-ocid="employees.loading_state"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
          data-ocid="employees.empty_state"
        >
          <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-display font-semibold text-muted-foreground">
            {search ? "No employees found" : "No employees yet"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {search
              ? "Try a different search term"
              : institutes.length === 0
                ? "Add an institute first"
                : 'Click "Add Employee" to get started'}
          </p>
        </motion.div>
      ) : (
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          data-ocid="employees.list"
        >
          {filtered.map((emp, idx) => {
            const extra = getEmpExtra(emp.employeeId);
            return (
              <motion.div
                key={emp.id.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                data-ocid={`employees.item.${idx + 1}`}
              >
                <Card className="gradient-card hover:scale-[1.01] transition-transform duration-200">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          {extra.profilePic ? (
                            <img
                              src={extra.profilePic}
                              alt={emp.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full gradient-primary flex items-center justify-center">
                              <span className="text-sm font-bold text-white uppercase">
                                {emp.name.slice(0, 2)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-display font-semibold text-foreground">
                            {emp.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {emp.employeeId}
                          </p>
                          {extra.department && (
                            <p className="text-xs text-muted-foreground">
                              {extra.department}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge
                          className={`text-xs flex-shrink-0 ${
                            emp.employmentType === EmploymentType.regular
                              ? "bg-success/20 text-success border-success/30"
                              : "bg-warning/20 text-warning border-warning/30"
                          }`}
                          variant="outline"
                        >
                          {emp.employmentType === EmploymentType.regular
                            ? "Regular"
                            : "Temporary"}
                        </Badge>
                        {extra.employeeStatus &&
                          extra.employeeStatus !== "active" && (
                            <Badge
                              className={`text-xs flex-shrink-0 ${
                                extra.employeeStatus === "retired"
                                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                  : extra.employeeStatus === "relieved"
                                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                                    : "bg-muted/50 text-muted-foreground"
                              }`}
                              variant="outline"
                            >
                              {(extra.employeeStatus as string)
                                .charAt(0)
                                .toUpperCase() +
                                (extra.employeeStatus as string).slice(1)}
                            </Badge>
                          )}
                        {(!extra.employeeStatus ||
                          extra.employeeStatus === "active") && (
                          <Badge
                            className="text-xs flex-shrink-0 bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            variant="outline"
                          >
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-primary/60" />
                        <span className="truncate">
                          {designationLabel(
                            extra.designation || emp.designation,
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-accent/60" />
                        <span className="truncate">
                          {getInstName(emp.instituteId)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-success/60" />
                        <span>{formatDate(emp.joiningDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-warning/60" />
                        <span>
                          ₹{Number(emp.basicSalary).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(emp)}
                        className="flex-1 gap-1.5 text-primary hover:bg-primary/10 hover:text-primary"
                        data-ocid={`employees.edit_button.${idx + 1}`}
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPromoTarget(emp);
                          setPromoForm({
                            type: "promotion",
                            fromDesignation: designationLabel(
                              extra.designation || emp.designation,
                            ),
                            toDesignation: "",
                            fromInstitute: getInstName(emp.instituteId),
                            toInstitute: "",
                            effectiveDate: new Date()
                              .toISOString()
                              .split("T")[0],
                            remarks: "",
                          });
                        }}
                        className="flex-1 gap-1.5 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
                      >
                        <TrendingUp className="w-3.5 h-3.5" /> Promote
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(emp)}
                        className="flex-1 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        data-ocid={`employees.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent
          className="bg-card border-border/60 sm:max-w-2xl max-h-[90vh] overflow-y-auto"
          data-ocid="employees.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-gradient">
              {editTarget ? "Edit Employee" : "Add New Employee"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {editTarget
                ? "Update employee details below"
                : "Fill in all required fields to add a new employee"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-2">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Profile Pic */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {form.profilePic ? (
                      <img
                        src={form.profilePic}
                        alt="Profile"
                        className="w-16 h-16 rounded-xl object-cover"
                        style={{
                          border: "2px solid oklch(0.50 0.25 260 / 0.5)",
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-xl">
                        {form.name ? (
                          form.name.slice(0, 2).toUpperCase()
                        ) : (
                          <User className="w-6 h-6" />
                        )}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => picRef.current?.click()}
                      className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{
                        background: "oklch(0.50 0.25 260)",
                        border: "2px solid oklch(0.14 0.06 260)",
                      }}
                      data-ocid="employees.profile_pic.upload_button"
                    >
                      <Camera className="w-3 h-3 text-white" />
                    </button>
                    <input
                      ref={picRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePicChange}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium">Profile Picture</p>
                    <p>Click the camera icon to upload</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-xs">
                      <Briefcase className="w-3 h-3" />
                      Employee ID *
                    </Label>
                    <Input
                      value={form.employeeId}
                      onChange={(e) => setField("employeeId", e.target.value)}
                      placeholder="e.g., 433"
                      className={inputCls}
                      data-ocid="employees.employeeid.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-xs">
                      <User className="w-3 h-3" />
                      Full Name *
                    </Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      placeholder="e.g., Sachin Patel"
                      className={inputCls}
                      data-ocid="employees.name.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Designation *</Label>
                    <Select
                      value={form.designation}
                      onValueChange={(v) => setField("designation", v)}
                    >
                      <SelectTrigger
                        className={inputCls}
                        data-ocid="employees.designation.select"
                      >
                        <SelectValue placeholder="Select designation" />
                      </SelectTrigger>
                      <SelectContent className="max-h-56 overflow-y-auto">
                        {getMergedDesignations().map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Department</Label>
                    <Select
                      value={form.department}
                      onValueChange={(v) => setField("department", v)}
                    >
                      <SelectTrigger
                        className={inputCls}
                        data-ocid="employees.department.select"
                      >
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent className="max-h-56 overflow-y-auto">
                        {getMergedDepartments().map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-xs">
                      <Building2 className="w-3 h-3" />
                      Institute *
                    </Label>
                    <Select
                      value={form.instituteId}
                      onValueChange={(v) => setField("instituteId", v)}
                    >
                      <SelectTrigger
                        className={inputCls}
                        data-ocid="employees.institute_select.select"
                      >
                        <SelectValue placeholder="Select institute" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[250px] overflow-y-auto">
                        {institutes.map((i: Institute) => (
                          <SelectItem
                            key={i.id.toString()}
                            value={i.id.toString()}
                          >
                            {i.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">BHEL Quarter</Label>
                    <Select
                      value={form.bhelQuarter}
                      onValueChange={(v) => setField("bhelQuarter", v)}
                    >
                      <SelectTrigger
                        className={inputCls}
                        data-ocid="employees.bhelquarter.select"
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[250px] overflow-y-auto">
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-xs">
                      <Calendar className="w-3 h-3" />
                      Date of Birth
                    </Label>
                    <input
                      type="date"
                      value={form.dob || ""}
                      onChange={(e) => setField("dob", e.target.value)}
                      data-ocid="employees.dob.input"
                      className="w-full h-9 px-3 rounded-md border border-border/60 bg-input/60 text-foreground text-sm cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Religion</Label>
                    <Select
                      value={form.religion}
                      onValueChange={(v) => setField("religion", v)}
                    >
                      <SelectTrigger
                        className={inputCls}
                        data-ocid="employees.religion.select"
                      >
                        <SelectValue placeholder="Select religion" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[250px] overflow-y-auto">
                        {[
                          "Hindu",
                          "Muslim",
                          "Christian",
                          "Sikh",
                          "Buddhist",
                          "Jain",
                          "Zoroastrian (Parsi)",
                          "Jewish",
                          "Bahá'í",
                          "Tribal Religion",
                          "Other",
                        ].map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Gender</Label>
                    <Select
                      value={form.gender}
                      onValueChange={(v) => setField("gender", v)}
                    >
                      <SelectTrigger
                        className={inputCls}
                        data-ocid="employees.gender.select"
                      >
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[250px] overflow-y-auto">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Category</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setField("category", v)}
                    >
                      <SelectTrigger
                        className={inputCls}
                        data-ocid="employees.category.select"
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[250px] overflow-y-auto">
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="obc">OBC</SelectItem>
                        <SelectItem value="sc">SC</SelectItem>
                        <SelectItem value="st">ST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Employee Type *</Label>
                    <Select
                      value={form.employeeType}
                      onValueChange={(v) => setField("employeeType", v)}
                    >
                      <SelectTrigger
                        className={inputCls}
                        data-ocid="employees.employmenttype.select"
                      >
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[250px] overflow-y-auto">
                        <SelectItem value={EmploymentType.regular}>
                          Regular
                        </SelectItem>
                        <SelectItem value={EmploymentType.temporary}>
                          Temporary
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Employee Status</Label>
                    <Select
                      value={form.employeeStatus}
                      onValueChange={(v) => setField("employeeStatus", v)}
                    >
                      <SelectTrigger
                        className={inputCls}
                        data-ocid="employees.status.select"
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[250px] overflow-y-auto">
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="resigned">Resigned</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                        <SelectItem value="relieved">Relived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-xs">
                      <Phone className="w-3 h-3" />
                      Phone
                    </Label>
                    <div className="flex items-center">
                      <Select
                        value={form.countryCode}
                        onValueChange={(v) => setField("countryCode", v)}
                      >
                        <SelectTrigger
                          className={`${inputCls} w-20 rounded-r-none border-r-0 flex-shrink-0`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[250px] overflow-y-auto">
                          {COUNTRY_CODES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={form.phone}
                        onChange={(e) => setField("phone", e.target.value)}
                        placeholder="e.g., 9876543210"
                        className={`${inputCls} rounded-l-none flex-1`}
                        data-ocid="employees.phone.input"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email ID</Label>
                    <Input
                      type="email"
                      value={form.emailId}
                      onChange={(e) => setField("emailId", e.target.value)}
                      placeholder="e.g., sachin@example.com"
                      className={inputCls}
                      data-ocid="employees.email.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-xs">
                      <Calendar className="w-3 h-3" />
                      Joining Date
                    </Label>
                    <input
                      type="date"
                      value={form.joiningDate || ""}
                      onChange={(e) => setField("joiningDate", e.target.value)}
                      data-ocid="employees.joiningdate.input"
                      className="w-full h-9 px-3 rounded-md border border-border/60 bg-input/60 text-foreground text-sm cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-xs">
                    <MapPin className="w-3 h-3" />
                    Address
                  </Label>
                  <Textarea
                    value={form.address}
                    onChange={(e) => setField("address", e.target.value)}
                    placeholder="Full address"
                    className={inputCls}
                    rows={2}
                    data-ocid="employees.address.input"
                  />
                </div>

                {/* Bank & ID Details */}
                <div className="mt-6 pt-4 border-t border-border/40">
                  <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    Bank &amp; ID Details
                  </p>
                  <div className="mb-3 p-3 rounded-lg border border-border/40 bg-muted/20">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">
                      Bank Account
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Bank Name</Label>
                        <Select
                          value={form.bankName}
                          onValueChange={(v) => {
                            setField("bankName", v);
                            const branches = getMergedBankBranches()[v] || [];
                            setField(
                              "bankBranch",
                              branches.length === 1 ? branches[0] : "",
                            );
                          }}
                        >
                          <SelectTrigger
                            className={inputCls}
                            data-ocid="employees.bank_name.select"
                          >
                            <Landmark className="w-3.5 h-3.5 mr-1 text-muted-foreground flex-shrink-0" />
                            <SelectValue placeholder="Select bank" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[250px] overflow-y-auto">
                            {getMergedBankNames().map((b) => (
                              <SelectItem key={b} value={b}>
                                {b}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Branch</Label>
                        <Select
                          value={form.bankBranch}
                          onValueChange={(v) => setField("bankBranch", v)}
                        >
                          <SelectTrigger
                            className={inputCls}
                            data-ocid="employees.bank_branch.select"
                          >
                            <MapPin className="w-3.5 h-3.5 mr-1 text-muted-foreground flex-shrink-0" />
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[250px] overflow-y-auto">
                            {(getMergedBankBranches()[form.bankName] || []).map(
                              (b) => (
                                <SelectItem key={b} value={b}>
                                  {b}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">A/C No.</Label>
                        <Input
                          value={form.bankAccountNo}
                          onChange={(e) =>
                            setField("bankAccountNo", e.target.value)
                          }
                          placeholder="e.g., 0012345678901"
                          className={inputCls}
                          data-ocid="employees.bank_account.input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">IFSC Code</Label>
                    <Input
                      value={form.ifscCode}
                      onChange={(e) =>
                        setField("ifscCode", e.target.value.toUpperCase())
                      }
                      placeholder="e.g., SBIN0001234"
                      className={inputCls}
                      data-ocid="employees.ifsc.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-xs">
                      <ShieldCheck className="w-3 h-3" />
                      PAN No
                    </Label>
                    <Input
                      value={form.panNo}
                      onChange={(e) =>
                        setField("panNo", e.target.value.toUpperCase())
                      }
                      placeholder="e.g., ABCDE1234F"
                      className={inputCls}
                      data-ocid="employees.pan.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">PF Number</Label>
                    <Input
                      value={form.pfNumber}
                      onChange={(e) => setField("pfNumber", e.target.value)}
                      placeholder="e.g., MH/BAN/001234"
                      className={inputCls}
                      data-ocid="employees.pf_account.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">ESI Number</Label>
                    <Input
                      value={form.esiNumber}
                      onChange={(e) => setField("esiNumber", e.target.value)}
                      placeholder="e.g., 4100012345"
                      className={inputCls}
                      data-ocid="employees.esic.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-xs">
                      <ShieldCheck className="w-3 h-3" />
                      Aadhaar No
                    </Label>
                    <Input
                      value={form.aadhaarNo}
                      onChange={(e) => setField("aadhaarNo", e.target.value)}
                      placeholder="e.g., 1234 5678 9012"
                      className={inputCls}
                      data-ocid="employees.aadhar.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">UAN No</Label>
                    <Input
                      value={form.uanNo}
                      onChange={(e) => setField("uanNo", e.target.value)}
                      placeholder="e.g., 100123456789"
                      className={inputCls}
                      data-ocid="employees.uan.input"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs">LIC No(s)</Label>
                    <div className="space-y-2">
                      {form.licNos.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => setField("licNos", [""] as any)}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add LIC No
                        </button>
                      ) : (
                        <>
                          {form.licNos.map((licNo, idx) => (
                            <div
                              // biome-ignore lint/suspicious/noArrayIndexKey: LIC entries may be empty
                              key={`lic-${idx}`}
                              className="flex items-center gap-2"
                            >
                              <Input
                                value={licNo}
                                onChange={(e) => {
                                  const updated = [...form.licNos];
                                  updated[idx] = e.target.value;
                                  setField("licNos", updated as any);
                                }}
                                placeholder="e.g., 123456789"
                                className={inputCls}
                                data-ocid={`employees.lic.input.${idx + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = form.licNos.filter(
                                    (_, i) => i !== idx,
                                  );
                                  setField("licNos", updated as any);
                                }}
                                className="shrink-0 text-destructive hover:text-destructive/80 transition-colors"
                                title="Remove this LIC No"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              setField("licNos", [...form.licNos, ""] as any)
                            }
                            className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                          >
                            + Add another LIC No
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <DialogFooter className="gap-2 pt-4 mt-2 border-t border-border/40">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setFormOpen(false)}
                className="text-muted-foreground"
                data-ocid="employees.cancel_button"
              >
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
              <Button
                type="submit"
                disabled={isBusy}
                className="gradient-primary text-white border-0"
                data-ocid="employees.save_button"
              >
                {isBusy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : editTarget ? (
                  "Update Employee"
                ) : (
                  "Add Employee"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent
          className="bg-card border-border/60"
          data-ocid="employees.delete_dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-destructive">
              Delete Employee?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong> (ID:{" "}
              {deleteTarget?.employeeId})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border/60"
              data-ocid="employees.delete_dialog.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="employees.delete_dialog.confirm_button"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Employees Dialog */}
      <AlertDialog
        open={showDeleteAllDialog}
        onOpenChange={setShowDeleteAllDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader data-ocid="employees.delete_all_dialog">
            <AlertDialogTitle className="font-display text-destructive">
              Delete All Employees?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>all {employees.length} employees</strong>. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                try {
                  await deleteAllMutation.mutateAsync();
                  toast.success("All employees deleted");
                  setShowDeleteAllDialog(false);
                } catch {
                  toast.error("Failed to delete employees");
                }
              }}
            >
              {deleteAllMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete All"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Promotion/Transfer Dialog */}
      <Dialog
        open={!!promoTarget}
        onOpenChange={(o) => !o && setPromoTarget(null)}
      >
        <DialogContent className="bg-card border-border/60 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <TrendingUp className="w-4 h-4 text-primary" />
              Promotion / Transfer — {promoTarget?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type</Label>
              <Select
                value={promoForm.type}
                onValueChange={(v) => setPromoForm((f) => ({ ...f, type: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[250px] overflow-y-auto">
                  <SelectItem value="promotion">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Promotion
                    </span>
                  </SelectItem>
                  <SelectItem value="transfer">
                    <span className="flex items-center gap-2">
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      Transfer
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {promoForm.type === "promotion" ? (
              <>
                <div>
                  <Label>From Designation</Label>
                  <Input
                    className="mt-1"
                    value={promoForm.fromDesignation}
                    onChange={(e) =>
                      setPromoForm((f) => ({
                        ...f,
                        fromDesignation: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>To Designation (New)</Label>
                  <Input
                    className="mt-1"
                    placeholder="New designation"
                    value={promoForm.toDesignation}
                    onChange={(e) =>
                      setPromoForm((f) => ({
                        ...f,
                        toDesignation: e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>From Institute</Label>
                  <Input
                    className="mt-1"
                    value={promoForm.fromInstitute}
                    onChange={(e) =>
                      setPromoForm((f) => ({
                        ...f,
                        fromInstitute: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>To Institute</Label>
                  <Input
                    className="mt-1"
                    placeholder="Destination institute"
                    value={promoForm.toInstitute}
                    onChange={(e) =>
                      setPromoForm((f) => ({
                        ...f,
                        toInstitute: e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            )}
            <div>
              <Label>Effective Date</Label>
              <Input
                type="date"
                className="mt-1"
                value={promoForm.effectiveDate}
                onChange={(e) =>
                  setPromoForm((f) => ({ ...f, effectiveDate: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Remarks</Label>
              <Input
                className="mt-1"
                placeholder="Optional remarks"
                value={promoForm.remarks}
                onChange={(e) =>
                  setPromoForm((f) => ({ ...f, remarks: e.target.value }))
                }
              />
            </div>
            {promoTarget &&
              getPromoHistory(promoTarget.employeeId).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <History className="w-3 h-3" />
                    History
                  </p>
                  <div className="space-y-1">
                    {getPromoHistory(promoTarget.employeeId).map((h) => (
                      <div
                        key={h.date + h.type}
                        className="text-xs rounded-lg bg-card/40 border border-border/30 px-3 py-2 flex justify-between"
                      >
                        <span className="font-medium capitalize">
                          {h.type}: {h.from} → {h.to}
                        </span>
                        <span className="text-muted-foreground">
                          {formatDate(h.date)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setPromoTarget(null)}>
              Cancel
            </Button>
            <Button className="gradient-primary" onClick={handlePromoSave}>
              Save Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
