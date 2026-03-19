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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRightLeft,
  Briefcase,
  Building2,
  Calendar,
  Camera,
  Car,
  CreditCard,
  DollarSign,
  Download,
  FileUp,
  Filter,
  History,
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
  useDeleteEmployee,
  useGetAllInstitutes,
  useGetEmployeesForInstitute,
  useUpdateEmployee,
} from "../hooks/useQueries";

const DESIGNATIONS_GROUPED: {
  header?: string;
  value?: string;
  label: string;
  disabled?: boolean;
}[] = [
  // ===== SCHOOL =====
  { header: "-- School --", label: "-- School --", disabled: true },
  { value: "Principal", label: "Principal" },
  { value: "Vice Principal", label: "Vice Principal" },
  { value: "HOI (Head of Institution)", label: "HOI (Head of Institution)" },
  { value: "Headmaster", label: "Headmaster" },
  { value: "Headmistress", label: "Headmistress" },
  { value: "Deputy Headmaster", label: "Deputy Headmaster" },
  {
    value: "PGT (Post Graduate Teacher)",
    label: "PGT (Post Graduate Teacher)",
  },
  {
    value: "TGT (Trained Graduate Teacher)",
    label: "TGT (Trained Graduate Teacher)",
  },
  { value: "PRT (Primary Teacher)", label: "PRT (Primary Teacher)" },
  { value: "NTT (Nursery Teacher)", label: "NTT (Nursery Teacher)" },
  { value: "Senior Teacher", label: "Senior Teacher" },
  { value: "Teacher", label: "Teacher" },
  { value: "Assistant Teacher", label: "Assistant Teacher" },
  { value: "Primary Teacher", label: "Primary Teacher" },
  { value: "Physical Education Teacher", label: "Physical Education Teacher" },
  {
    value: "PET (Physical Education Teacher)",
    label: "PET (Physical Education Teacher)",
  },
  { value: "Drawing Teacher", label: "Drawing Teacher" },
  { value: "Music Teacher", label: "Music Teacher" },
  { value: "Art & Craft Teacher", label: "Art & Craft Teacher" },
  { value: "Dance Teacher", label: "Dance Teacher" },
  { value: "Library Teacher", label: "Library Teacher" },
  { value: "Librarian", label: "Librarian" },
  { value: "Assistant Librarian", label: "Assistant Librarian" },
  { value: "Lab Assistant", label: "Lab Assistant" },
  { value: "Computer Teacher", label: "Computer Teacher" },
  { value: "Tutor", label: "Tutor" },
  { value: "Special Educator", label: "Special Educator" },
  { value: "Counsellor", label: "Counsellor" },
  { value: "School Nurse", label: "School Nurse" },
  // ===== COLLEGE =====
  {
    header: "-- College / University --",
    label: "-- College / University --",
    disabled: true,
  },
  { value: "Vice Chancellor", label: "Vice Chancellor" },
  { value: "Pro Vice Chancellor", label: "Pro Vice Chancellor" },
  { value: "Registrar", label: "Registrar" },
  { value: "Dean", label: "Dean" },
  { value: "Associate Dean", label: "Associate Dean" },
  { value: "Professor", label: "Professor" },
  { value: "Associate Professor", label: "Associate Professor" },
  { value: "Assistant Professor", label: "Assistant Professor" },
  { value: "Senior Lecturer", label: "Senior Lecturer" },
  { value: "Lecturer", label: "Lecturer" },
  { value: "Assistant Lecturer", label: "Assistant Lecturer" },
  { value: "Guest Lecturer", label: "Guest Lecturer" },
  { value: "Visiting Faculty", label: "Visiting Faculty" },
  { value: "Research Scholar", label: "Research Scholar" },
  { value: "HOD (Head of Department)", label: "HOD (Head of Department)" },
  { value: "Coordinator", label: "Coordinator" },
  { value: "Academic Coordinator", label: "Academic Coordinator" },
  { value: "Examination Controller", label: "Examination Controller" },
  { value: "Admission Officer", label: "Admission Officer" },
  { value: "College Librarian", label: "College Librarian" },
  { value: "Lab Incharge", label: "Lab Incharge" },
  // ===== HOSTEL =====
  { header: "-- Hostel --", label: "-- Hostel --", disabled: true },
  { value: "Chief Warden", label: "Chief Warden" },
  { value: "Hostel Warden", label: "Hostel Warden" },
  { value: "Assistant Warden", label: "Assistant Warden" },
  { value: "Deputy Warden", label: "Deputy Warden" },
  { value: "Hostel Superintendent", label: "Hostel Superintendent" },
  { value: "Hostel Supervisor", label: "Hostel Supervisor" },
  { value: "Hostel Manager", label: "Hostel Manager" },
  { value: "Caretaker", label: "Caretaker" },
  { value: "Hostel Attendant", label: "Hostel Attendant" },
  { value: "Matron", label: "Matron" },
  { value: "Cook", label: "Cook" },
  { value: "Head Cook", label: "Head Cook" },
  { value: "Assistant Cook", label: "Assistant Cook" },
  { value: "Kitchen Helper", label: "Kitchen Helper" },
  { value: "Housekeeping Staff", label: "Housekeeping Staff" },
  { value: "Night Watchman", label: "Night Watchman" },
  { value: "Mess Manager", label: "Mess Manager" },
  { value: "Mess Supervisor", label: "Mess Supervisor" },
  // ===== OFFICE =====
  {
    header: "-- Office / Administration --",
    label: "-- Office / Administration --",
    disabled: true,
  },
  { value: "Director", label: "Director" },
  { value: "Managing Director", label: "Managing Director" },
  { value: "Chief Executive Officer", label: "Chief Executive Officer" },
  { value: "General Manager", label: "General Manager" },
  { value: "Deputy General Manager", label: "Deputy General Manager" },
  { value: "Assistant General Manager", label: "Assistant General Manager" },
  { value: "Manager", label: "Manager" },
  { value: "Deputy Manager", label: "Deputy Manager" },
  { value: "Assistant Manager", label: "Assistant Manager" },
  { value: "Superintendent", label: "Superintendent" },
  { value: "Section Officer", label: "Section Officer" },
  { value: "Deputy Section Officer", label: "Deputy Section Officer" },
  { value: "Assistant Section Officer", label: "Assistant Section Officer" },
  { value: "Office Superintendent", label: "Office Superintendent" },
  { value: "Administrative Officer", label: "Administrative Officer" },
  { value: "Admin Manager", label: "Admin Manager" },
  { value: "Administrative Assistant", label: "Administrative Assistant" },
  { value: "Office Assistant", label: "Office Assistant" },
  { value: "Assistant", label: "Assistant" },
  { value: "Senior Assistant", label: "Senior Assistant" },
  { value: "Junior Assistant", label: "Junior Assistant" },
  { value: "Supervisor", label: "Supervisor" },
  { value: "Executive", label: "Executive" },
  { value: "Senior Executive", label: "Senior Executive" },
  { value: "Junior Executive", label: "Junior Executive" },
  { value: "Officer", label: "Officer" },
  { value: "Inspector", label: "Inspector" },
  { value: "Personal Assistant", label: "Personal Assistant" },
  { value: "Receptionist", label: "Receptionist" },
  { value: "Front Desk Officer", label: "Front Desk Officer" },
  { value: "Clerk", label: "Clerk" },
  { value: "Senior Clerk", label: "Senior Clerk" },
  { value: "Junior Clerk", label: "Junior Clerk" },
  { value: "Record Keeper", label: "Record Keeper" },
  { value: "Time Keeper", label: "Time Keeper" },
  { value: "Data Entry Operator", label: "Data Entry Operator" },
  { value: "Liaison Officer", label: "Liaison Officer" },
  {
    value: "PRO (Public Relations Officer)",
    label: "PRO (Public Relations Officer)",
  },
  // ===== HR =====
  {
    header: "-- HR & Recruitment --",
    label: "-- HR & Recruitment --",
    disabled: true,
  },
  { value: "HR Manager", label: "HR Manager" },
  { value: "HR Officer", label: "HR Officer" },
  { value: "HR Assistant", label: "HR Assistant" },
  { value: "Recruitment Officer", label: "Recruitment Officer" },
  { value: "Training Officer", label: "Training Officer" },
  { value: "Payroll Officer", label: "Payroll Officer" },
  // ===== FINANCE & ACCOUNTS =====
  {
    header: "-- Finance & Accounts --",
    label: "-- Finance & Accounts --",
    disabled: true,
  },
  { value: "Chief Financial Officer", label: "Chief Financial Officer" },
  { value: "Finance Manager", label: "Finance Manager" },
  { value: "Finance Officer", label: "Finance Officer" },
  { value: "Accounts Manager", label: "Accounts Manager" },
  { value: "Senior Accountant", label: "Senior Accountant" },
  { value: "Accountant", label: "Accountant" },
  { value: "Account Assistant", label: "Account Assistant" },
  { value: "Junior Accountant", label: "Junior Accountant" },
  { value: "Cashier", label: "Cashier" },
  { value: "Auditor", label: "Auditor" },
  { value: "Internal Auditor", label: "Internal Auditor" },
  { value: "CA (Chartered Accountant)", label: "CA (Chartered Accountant)" },
  { value: "CMA (Cost Accountant)", label: "CMA (Cost Accountant)" },
  { value: "Tax Consultant", label: "Tax Consultant" },
  { value: "Tax Officer", label: "Tax Officer" },
  { value: "Billing Clerk", label: "Billing Clerk" },
  { value: "Budget Analyst", label: "Budget Analyst" },
  // ===== PURCHASE & STORE =====
  {
    header: "-- Purchase & Store --",
    label: "-- Purchase & Store --",
    disabled: true,
  },
  { value: "Purchase Manager", label: "Purchase Manager" },
  { value: "Purchase Officer", label: "Purchase Officer" },
  { value: "Purchase Assistant", label: "Purchase Assistant" },
  { value: "Store Manager", label: "Store Manager" },
  { value: "Store Keeper", label: "Store Keeper" },
  { value: "Store Assistant", label: "Store Assistant" },
  { value: "Inventory Controller", label: "Inventory Controller" },
  { value: "Logistics Officer", label: "Logistics Officer" },
  { value: "Supply Chain Officer", label: "Supply Chain Officer" },
  // ===== IT & TECHNICAL =====
  {
    header: "-- IT & Technical --",
    label: "-- IT & Technical --",
    disabled: true,
  },
  { value: "IT Manager", label: "IT Manager" },
  { value: "System Administrator", label: "System Administrator" },
  { value: "Network Engineer", label: "Network Engineer" },
  { value: "Software Developer", label: "Software Developer" },
  { value: "Technical Support Officer", label: "Technical Support Officer" },
  { value: "Computer Operator", label: "Computer Operator" },
  { value: "Lab Technician", label: "Lab Technician" },
  { value: "Electronics Technician", label: "Electronics Technician" },
  { value: "Electrician", label: "Electrician" },
  { value: "Plumber", label: "Plumber" },
  { value: "Carpenter", label: "Carpenter" },
  { value: "Mechanic", label: "Mechanic" },
  // ===== SECURITY & SUPPORT =====
  {
    header: "-- Security & Support --",
    label: "-- Security & Support --",
    disabled: true,
  },
  { value: "Security Officer", label: "Security Officer" },
  { value: "Security Guard", label: "Security Guard" },
  { value: "Watchman", label: "Watchman" },
  { value: "Peon", label: "Peon" },
  { value: "Attender", label: "Attender" },
  { value: "Office Boy", label: "Office Boy" },
  { value: "Driver", label: "Driver" },
  { value: "Sweeper", label: "Sweeper" },
  { value: "Gardner", label: "Gardner" },
  { value: "Sanitation Worker", label: "Sanitation Worker" },
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
  if (finance.includes(d)) return Designation.humanResources;
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
  employeeStatus: "active" | "inactive" | "resigned" | "";
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
  licNo: string;
}

const EMPTY_FORM: EmpForm = {
  name: "",
  employeeId: "",
  designation: "",
  department: "",
  instituteId: "",
  address: "",
  bhelQuarter: "",
  profilePic: "",
  dob: "",
  religion: "",
  gender: "",
  category: "",
  employeeType: "",
  employeeStatus: "active",
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
  licNo: "",
};

function getEmpExtra(employeeId: string): any {
  try {
    return JSON.parse(localStorage.getItem(`empExtra_${employeeId}`) || "{}");
  } catch {
    return {};
  }
}
function saveEmpExtra(employeeId: string, data: any) {
  localStorage.setItem(`empExtra_${employeeId}`, JSON.stringify(data));
}

export default function EmployeeManagementPage() {
  const { data: institutes = [], isLoading: loadingInstitutes } =
    useGetAllInstitutes();
  const [selectedInstId, setSelectedInstId] = useState<bigint | null>(
    institutes.length > 0 ? institutes[0].id : null,
  );
  const { data: employees = [], isLoading: loadingEmps } =
    useGetEmployeesForInstitute(selectedInstId ?? institutes[0]?.id ?? null);

  const addMutation = useAddEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();

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
  const [activeTab, setActiveTab] = useState("personal");

  const effectiveInstId = selectedInstId ?? institutes[0]?.id ?? null;

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditTarget(null);
    setActiveTab("personal");
    setForm({ ...EMPTY_FORM, instituteId: effectiveInstId?.toString() ?? "" });
    setFormOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditTarget(emp);
    setActiveTab("personal");
    const extra = getEmpExtra(emp.employeeId);
    setForm({
      name: emp.name,
      employeeId: emp.employeeId,
      designation: emp.designation,
      department: extra.department || "",
      instituteId: emp.instituteId.toString(),
      address: emp.address,
      bhelQuarter: extra.bhelQuarter || "",
      profilePic: extra.profilePic || "",
      dob: emp.dob,
      religion: extra.religion || "",
      gender: extra.gender || "",
      category: extra.category || "",
      employeeType: emp.employmentType as EmploymentType | "",
      employeeStatus: extra.employeeStatus || "",
      phone: extra.phone || "",
      emailId: extra.emailId || extra.email || "",
      joiningDate: emp.joiningDate,
      basicSalary: emp.basicSalary.toString(),
      bankName: extra.bankName || "",
      bankBranch: extra.bankBranch || "",
      bankAccountNo: extra.bankAccountNo || extra.bankAccount || "",
      ifscCode: extra.ifscCode || "",
      panNo: extra.panNo || extra.panNumber || "",
      pfNumber: extra.pfNumber || extra.pfAccount || "",
      esiNumber: extra.esiNumber || extra.esicNumber || "",
      aadhaarNo: extra.aadhaarNo || extra.aadharNumber || "",
      uanNo: extra.uanNo || "",
      licNo: extra.licNo || "",
      ta: String(extra.ta || "0"),
    });
    setFormOpen(true);
  };

  const xlsxFileRef = useRef<HTMLInputElement>(null);

  const downloadSampleFile = useCallback(() => {
    const rows = [
      ["slno", "staffno", "name", "designation", "institute", "status"],
      ["1", "EMP001", "John Doe", "Manager", "Institute A", "regular"],
      ["2", "EMP002", "Jane Smith", "Lecturer", "Institute B", "temporary"],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
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
        let failed = 0;
        for (const row of rows) {
          const staffno = String(row.staffno || row.id || "").trim();
          const name = String(row.name || "").trim();
          const designation = String(row.designation || "").trim();
          const institute = String(row.institute || "").trim();
          const status = String(row.status || "regular")
            .trim()
            .toLowerCase();
          if (!staffno || !name) {
            failed++;
            continue;
          }
          // Find matching institute
          const matchedInstitute = institutes.find(
            (i: Institute) =>
              i.name.toLowerCase().includes(institute.toLowerCase()) ||
              institute.toLowerCase().includes(i.name.toLowerCase()),
          );
          const instId = matchedInstitute?.id ?? institutes[0]?.id;
          if (!instId) {
            failed++;
            continue;
          }
          // Map designation string to enum
          const desigMap: Record<string, Designation> = {
            "research engineer": Designation.researchEngineer,
            professor: Designation.professor,
            lecturer: Designation.lecturer,
            "human resources": Designation.humanResources,
            "admin staff": Designation.adminStaff,
            officer: Designation.officer,
            scientist: Designation.scientist,
            manager: Designation.officer,
          };
          const desigKey = designation.toLowerCase();
          const mappedDesig =
            Object.entries(desigMap).find(([k]) => desigKey.includes(k))?.[1] ??
            Designation.officer;
          const empType =
            status === "regular"
              ? EmploymentType.regular
              : EmploymentType.temporary;
          try {
            await addMutation.mutateAsync({
              name,
              employeeId: staffno,
              instituteId: BigInt(instId),
              designation: mappedDesig,
              employmentType: empType,
              joiningDate: new Date().toISOString().split("T")[0],
              address: "-",
              dob: "2000-01-01",
              basicSalary: BigInt(0),
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
            `Added ${added} employee${added > 1 ? "s" : ""} successfully${failed > 0 ? `, ${failed} failed` : ""}`,
          );
        else
          toast.error(
            `Failed to add employees${failed > 0 ? ` (${failed} rows had errors)` : ""}`,
          );
      } catch {
        toast.error("Failed to parse file. Please check the format.");
      }
    },
    [institutes, addMutation],
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
        licNo: form.licNo,
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-gradient">
            Employee Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all staff and personnel
          </p>
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
          <Button
            variant="outline"
            className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
            onClick={() => xlsxFileRef.current?.click()}
            data-ocid="employees.upload_button"
          >
            <FileUp className="w-4 h-4" /> Upload Excel
          </Button>
          <Button
            onClick={openAdd}
            className="gradient-primary text-white border-0 glow-primary gap-2"
            data-ocid="employees.add_button"
          >
            <Plus className="w-4 h-4" /> Add Employee
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
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
        <div className="flex items-center gap-2 w-full sm:w-60">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Select
            value={effectiveInstId?.toString() ?? ""}
            onValueChange={(v) => setSelectedInstId(BigInt(v))}
          >
            <SelectTrigger
              className="bg-card/60 border-border/60"
              data-ocid="employees.institute.select"
            >
              <SelectValue placeholder="Select Institute" />
            </SelectTrigger>
            <SelectContent>
              {institutes.map((i: Institute) => (
                <SelectItem key={i.id.toString()} value={i.id.toString()}>
                  {i.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-primary/60" />
                        <span className="truncate">
                          {designationLabel(emp.designation)}
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
                        <span>{emp.joiningDate}</span>
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
                            fromDesignation: designationLabel(emp.designation),
                            toDesignation: "",
                            fromInstitute: getInstName(emp.instituteId),
                            toInstitute: "",
                            effectiveDate: new Date()
                              .toISOString()
                              .split("T")[0],
                            remarks: "",
                          });
                        }}
                        className="flex-1 gap-1.5 text-blue-400 hover:bg-blue-500/10"
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full mb-5 grid grid-cols-2">
                <TabsTrigger
                  value="personal"
                  className="gap-2"
                  data-ocid="employees.personal.tab"
                >
                  <User className="w-3.5 h-3.5" /> Personal Details
                </TabsTrigger>
                <TabsTrigger
                  value="salary"
                  className="gap-2"
                  data-ocid="employees.salary.tab"
                >
                  <DollarSign className="w-3.5 h-3.5" /> Salary &amp; Work
                </TabsTrigger>
              </TabsList>

              {/* PERSONAL DETAILS */}
              <TabsContent value="personal">
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
                        <SelectContent>
                          {DESIGNATIONS_GROUPED.map((d) =>
                            d.disabled ? (
                              <SelectItem
                                key={d.label}
                                value={d.label}
                                disabled
                                className="font-bold text-xs text-muted-foreground uppercase py-1"
                              >
                                {d.label}
                              </SelectItem>
                            ) : (
                              <SelectItem key={d.value} value={d.value!}>
                                {d.label}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Department</Label>
                      <Input
                        value={form.department}
                        onChange={(e) => setField("department", e.target.value)}
                        placeholder="e.g., Engineering"
                        className={inputCls}
                        data-ocid="employees.department.input"
                      />
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
                        <SelectContent>
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
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs">
                        <Calendar className="w-3 h-3" />
                        Date of Birth
                      </Label>
                      <Input
                        type="date"
                        value={form.dob}
                        onChange={(e) => setField("dob", e.target.value)}
                        className={inputCls}
                        data-ocid="employees.dob.input"
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
                        <SelectContent>
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
                        <SelectContent>
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
                        <SelectContent>
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
                        <SelectContent>
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
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="resigned">Resigned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs">
                        <Phone className="w-3 h-3" />
                        Phone
                      </Label>
                      <Input
                        value={form.phone}
                        onChange={(e) => setField("phone", e.target.value)}
                        placeholder="e.g., 9876543210"
                        className={inputCls}
                        data-ocid="employees.phone.input"
                      />
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
                      <Input
                        type="date"
                        value={form.joiningDate}
                        onChange={(e) =>
                          setField("joiningDate", e.target.value)
                        }
                        className={inputCls}
                        data-ocid="employees.joiningdate.input"
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

                  <div className="flex justify-end pt-2">
                    <Button
                      type="button"
                      onClick={() => setActiveTab("salary")}
                      className="gradient-primary text-white border-0 gap-2"
                    >
                      Next: Salary &amp; Work Details →
                    </Button>
                  </div>
                </motion.div>
              </TabsContent>

              {/* SALARY & WORK DETAILS */}
              <TabsContent value="salary">
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs">
                        <DollarSign className="w-3 h-3" />
                        Basic Salary (₹)
                      </Label>
                      <Input
                        type="number"
                        value={form.basicSalary}
                        onChange={(e) =>
                          setField("basicSalary", e.target.value)
                        }
                        placeholder="e.g., 25000"
                        className={inputCls}
                        data-ocid="employees.salary.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs">
                        <Car className="w-3 h-3" />
                        TA - Travel Allowance (₹)
                      </Label>
                      <Input
                        type="number"
                        value={form.ta}
                        onChange={(e) => setField("ta", e.target.value)}
                        placeholder="e.g., 1500"
                        className={inputCls}
                        data-ocid="employees.ta.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs">
                        <CreditCard className="w-3 h-3" />
                        Bank Name
                      </Label>
                      <Input
                        value={form.bankName}
                        onChange={(e) => setField("bankName", e.target.value)}
                        placeholder="e.g., State Bank of India"
                        className={inputCls}
                        data-ocid="employees.bank_name.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Bank Branch</Label>
                      <Input
                        value={form.bankBranch}
                        onChange={(e) => setField("bankBranch", e.target.value)}
                        placeholder="e.g., Anand Branch"
                        className={inputCls}
                        data-ocid="employees.bank_branch.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs">
                        <CreditCard className="w-3 h-3" />
                        Bank Account No
                      </Label>
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
                    <div className="space-y-1.5">
                      <Label className="text-xs">LIC No</Label>
                      <Input
                        value={form.licNo}
                        onChange={(e) => setField("licNo", e.target.value)}
                        placeholder="e.g., 123456789"
                        className={inputCls}
                        data-ocid="employees.lic.input"
                      />
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>

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
                <SelectContent>
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
                        <span className="text-muted-foreground">{h.date}</span>
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
