import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Banknote,
  Briefcase,
  Building2,
  Calendar,
  Camera,
  CreditCard,
  Loader2,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

function getEmployees(): any[] {
  try {
    return JSON.parse(localStorage.getItem("employees") || "[]");
  } catch {
    return [];
  }
}
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
function saveEmployees(data: any[]) {
  localStorage.setItem("employees", JSON.stringify(data));
}

function ReadOnlyField({
  label,
  value,
  icon: Icon,
}: { label: string; value: string; icon?: any }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </Label>
      <div
        className="px-3 py-2 rounded-lg text-sm font-medium"
        style={{
          background: "oklch(0.18 0.06 260 / 0.5)",
          border: "1px solid oklch(0.28 0.08 260 / 0.4)",
          color: "oklch(0.80 0.06 260)",
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

export default function EmployeeProfilePage() {
  const { employeeId, username } = useAuth();
  const employees = getEmployees();
  const emp = employees.find(
    (e: any) =>
      e.employeeId === employeeId ||
      (
        e.name.toLowerCase().replace(/\s/g, "").slice(0, 4) + e.employeeId
      ).toLowerCase() === username.toLowerCase(),
  );
  const extra = emp ? getEmpExtra(emp.employeeId) : {};

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const picRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: emp?.name ?? "",
    address: emp?.address ?? "",
    phone: extra.phone ?? "",
    emailId: extra.emailId ?? extra.email ?? "",
    dob: emp?.dob ?? "",
    religion: extra.religion ?? "",
    gender: extra.gender ?? "",
    profilePic: extra.profilePic ?? "",
  });

  if (!emp) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Employee profile not found. Contact your administrator.
        </p>
      </div>
    );
  }

  const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, profilePic: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    // Update employees array
    const updated = employees.map((e: any) => {
      if (e.employeeId === emp.employeeId) {
        return { ...e, name: form.name, address: form.address, dob: form.dob };
      }
      return e;
    });
    saveEmployees(updated);
    // Save extra fields
    saveEmpExtra(emp.employeeId, {
      ...extra,
      phone: form.phone,
      emailId: form.emailId,
      religion: form.religion,
      gender: form.gender,
      profilePic: form.profilePic,
    });
    setSaving(false);
    setEditing(false);
    toast.success("Profile updated successfully!");
  };

  const inputCls =
    "bg-input/60 border-border/60 text-foreground placeholder:text-muted-foreground";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-gradient">
            My Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and update your personal information
          </p>
        </div>
        {!editing ? (
          <Button
            onClick={() => setEditing(true)}
            className="gradient-primary text-white border-0 gap-2"
            data-ocid="emp_profile.edit_button"
          >
            <Pencil className="w-4 h-4" /> Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setEditing(false)}
              data-ocid="emp_profile.cancel_button"
            >
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gradient-primary text-white border-0 gap-2"
              data-ocid="emp_profile.save_button"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Avatar section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-glass">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="relative mb-4">
                {form.profilePic ? (
                  <img
                    src={form.profilePic}
                    alt="Profile"
                    className="w-24 h-24 rounded-2xl object-cover"
                    style={{ border: "2px solid oklch(0.50 0.25 260 / 0.5)" }}
                  />
                ) : (
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center text-white font-bold text-3xl"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.50 0.25 260), oklch(0.45 0.28 295))",
                    }}
                  >
                    {emp.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {editing && (
                  <button
                    type="button"
                    onClick={() => picRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: "oklch(0.50 0.25 260)",
                      border: "2px solid oklch(0.14 0.06 260)",
                    }}
                    data-ocid="emp_profile.upload_button"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                )}
                <input
                  ref={picRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePicChange}
                />
              </div>
              <p className="font-display font-bold text-foreground text-center">
                {emp.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                {extra.designation || emp.designation || "—"}
              </p>
              <p
                className="text-xs mt-1 text-center"
                style={{ color: "oklch(0.60 0.15 260)" }}
              >
                ID: {emp.employeeId}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Personal Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2"
        >
          <Card className="card-glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Personal Details
                {editing && (
                  <span className="text-xs font-normal text-muted-foreground ml-auto">
                    (Editable)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {editing ? (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Full Name
                    </Label>
                    <Input
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className={inputCls}
                      data-ocid="emp_profile.name.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Phone
                    </Label>
                    <Input
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      className={inputCls}
                      data-ocid="emp_profile.phone.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email ID</Label>
                    <Input
                      value={form.emailId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, emailId: e.target.value }))
                      }
                      className={inputCls}
                      data-ocid="emp_profile.email.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Date of Birth
                    </Label>
                    <Input
                      type="date"
                      value={form.dob}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, dob: e.target.value }))
                      }
                      className={inputCls}
                      data-ocid="emp_profile.dob.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Religion</Label>
                    <Input
                      value={form.religion}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, religion: e.target.value }))
                      }
                      className={inputCls}
                      data-ocid="emp_profile.religion.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Gender</Label>
                    <Select
                      value={form.gender}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, gender: v }))
                      }
                    >
                      <SelectTrigger
                        className={inputCls}
                        data-ocid="emp_profile.gender.select"
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
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs">Address</Label>
                    <Textarea
                      value={form.address}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, address: e.target.value }))
                      }
                      className={inputCls}
                      rows={2}
                      data-ocid="emp_profile.address.textarea"
                    />
                  </div>
                </>
              ) : (
                <>
                  <ReadOnlyField
                    label="Full Name"
                    value={emp.name}
                    icon={User}
                  />
                  <ReadOnlyField
                    label="Phone"
                    value={extra.phone || "—"}
                    icon={Phone}
                  />
                  <ReadOnlyField
                    label="Email ID"
                    value={extra.emailId || extra.email || "—"}
                  />
                  <ReadOnlyField
                    label="Date of Birth"
                    value={emp.dob || "—"}
                    icon={Calendar}
                  />
                  <ReadOnlyField
                    label="Religion"
                    value={extra.religion || "—"}
                  />
                  <ReadOnlyField label="Gender" value={extra.gender || "—"} />
                  <div className="sm:col-span-2">
                    <ReadOnlyField label="Address" value={emp.address || "—"} />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Official / Banking Details (read-only) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="card-glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Official &amp;
              Banking Details
              <span className="text-xs font-normal text-muted-foreground ml-auto">
                Read-only
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <ReadOnlyField
              label="Employee ID"
              value={emp.employeeId}
              icon={Briefcase}
            />
            <ReadOnlyField
              label="Designation"
              value={extra.designation || emp.designation || "—"}
              icon={Briefcase}
            />
            <ReadOnlyField
              label="Department"
              value={extra.department || emp.department || "—"}
              icon={Building2}
            />
            <ReadOnlyField
              label="Institute"
              value={extra.institute || emp.institute || "—"}
              icon={Building2}
            />
            <ReadOnlyField label="Category" value={extra.category || "—"} />
            <ReadOnlyField
              label="Employee Type"
              value={extra.employeeType || emp.employmentType || "—"}
            />
            <ReadOnlyField
              label="Employee Status"
              value={extra.employeeStatus || "Active"}
            />
            <ReadOnlyField
              label="BHEL Quarter"
              value={extra.bhelQuarter || "—"}
            />
            <ReadOnlyField
              label="Bank Name"
              value={extra.bankName || "—"}
              icon={Banknote}
            />
            <ReadOnlyField
              label="Bank Branch"
              value={extra.bankBranch || "—"}
            />
            <ReadOnlyField
              label="Bank Account No"
              value={extra.bankAccountNo || extra.bankAccount || "—"}
              icon={CreditCard}
            />
            <ReadOnlyField label="IFSC Code" value={extra.ifscCode || "—"} />
            <ReadOnlyField
              label="PAN No"
              value={extra.panNo || extra.panNumber || "—"}
              icon={ShieldCheck}
            />
            <ReadOnlyField
              label="PF Number"
              value={extra.pfNumber || extra.pfAccount || "—"}
            />
            <ReadOnlyField
              label="ESI Number"
              value={extra.esiNumber || extra.esicNumber || "—"}
            />
            <ReadOnlyField
              label="Aadhaar No"
              value={extra.aadhaarNo || extra.aadharNumber || "—"}
            />
            <ReadOnlyField label="UAN No" value={extra.uanNo || "—"} />
            <ReadOnlyField label="LIC No" value={extra.licNo || "—"} />
            <ReadOnlyField
              label="Joining Date"
              value={emp.joiningDate || "—"}
              icon={Calendar}
            />
            <ReadOnlyField
              label="Basic Salary"
              value={
                emp.basicSalary
                  ? `₹${Number(emp.basicSalary).toLocaleString("en-IN")}`
                  : "—"
              }
              icon={Banknote}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
