import { Toaster } from "@/components/ui/sonner";
import { Building2, FileText, Home, Loader2, LogOut, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import FeesApp from "./fees/FeesApp";
import type { FeesPage } from "./fees/types";
import AttendancePage from "./pages/AttendancePage";
import DailyWorkersPage from "./pages/DailyWorkersPage";
import DashboardPage from "./pages/DashboardPage";
import EmployeeDashboardPage from "./pages/EmployeeDashboardPage";
import EmployeeManagementPage from "./pages/EmployeeManagementPage";
import EmployeeProfilePage from "./pages/EmployeeProfilePage";
import EmployeeSalarySlipsPage from "./pages/EmployeeSalarySlipsPage";
import InstituteManagementPage from "./pages/InstituteManagementPage";
import LoginPage from "./pages/LoginPage";
import PayslipPage from "./pages/PayslipPage";
import ReportsPage from "./pages/ReportsPage";
import SalaryDetailsPage from "./pages/SalaryDetailsPage";
import SalaryProcessingPage from "./pages/SalaryProcessingPage";
import SettingsPage from "./pages/SettingsPage";
import { syncFromBackend } from "./services/backendSync";
import TallyApp from "./tally/TallyApp";
import type { TallyPage } from "./tally/types";

export type PageName =
  | "dashboard"
  | "institutes"
  | "employees"
  | "employeeSalary"
  | "attendance"
  | "salary"
  | "payslip"
  | "dailyWorkers"
  | "reports"
  | "settings";

export type AppSystem = "salary" | "tally" | "fees";

type EmpPage = "dashboard" | "profile" | "salaryslips";

const EMP_NAV = [
  { id: "dashboard" as EmpPage, label: "Dashboard", icon: Home },
  { id: "profile" as EmpPage, label: "My Profile", icon: User },
  { id: "salaryslips" as EmpPage, label: "Salary Slips", icon: FileText },
];

function EmployeeApp() {
  const { username, logout } = useAuth();
  const [page, setPage] = useState<EmpPage>("dashboard");

  useEffect(() => {
    document.title = "Yf's Platform | Salary Management";
  }, []);

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <EmployeeDashboardPage />;
      case "profile":
        return <EmployeeProfilePage />;
      case "salaryslips":
        return <EmployeeSalarySlipsPage />;
      default:
        return <EmployeeDashboardPage />;
    }
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "oklch(0.10 0.04 260)" }}
    >
      <motion.aside
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-56 flex-shrink-0 flex flex-col h-full"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.14 0.06 260) 0%, oklch(0.11 0.05 290) 100%)",
          borderRight: "1px solid oklch(0.28 0.10 260 / 0.5)",
        }}
      >
        <div
          className="p-5 border-b"
          style={{ borderColor: "oklch(0.28 0.10 260 / 0.4)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.50 0.25 260), oklch(0.45 0.28 295))",
              }}
            >
              <img
                src="/assets/uploads/logo-1.png"
                alt="logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  if (e.currentTarget.parentElement)
                    e.currentTarget.parentElement.innerHTML =
                      '<span style="font-size:1rem;font-weight:900;color:white">Yf</span>';
                }}
              />
            </div>
            <div className="min-w-0">
              <p
                className="text-xs font-bold truncate"
                style={{ color: "oklch(0.88 0.10 260)" }}
              >
                {username}
              </p>
              <p
                className="text-[10px]"
                style={{ color: "oklch(0.58 0.12 260)" }}
              >
                Employee Portal
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {EMP_NAV.map((item) => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPage(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: active
                    ? "oklch(0.50 0.25 260 / 0.25)"
                    : "transparent",
                  color: active
                    ? "oklch(0.85 0.15 260)"
                    : "oklch(0.60 0.08 260)",
                  border: active
                    ? "1px solid oklch(0.50 0.25 260 / 0.4)"
                    : "1px solid transparent",
                }}
                data-ocid={`emp_nav.${item.id}.link`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-2">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
            style={{
              background: "oklch(0.20 0.06 260 / 0.5)",
              color: "oklch(0.55 0.08 260)",
            }}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Employee Portal</span>
          </div>
        </div>

        <div
          className="p-3 border-t"
          style={{ borderColor: "oklch(0.28 0.10 260 / 0.4)" }}
        >
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              color: "oklch(0.65 0.20 20)",
              background: "oklch(0.65 0.20 20 / 0.08)",
            }}
            data-ocid="emp_nav.logout_button"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </motion.aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 min-h-full">{renderPage()}</div>
      </main>
    </div>
  );
}

function AppInner() {
  const { isAuthenticated, role } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageName>("dashboard");
  const [appSystem, setAppSystem] = useState<AppSystem>("salary");
  const [tallyPage, setTallyPage] = useState<TallyPage>("dashboard");
  const [feesPage, setFeesPage] = useState<FeesPage>("dashboard");

  useEffect(() => {
    if (!isAuthenticated) {
      document.title = "Yf's Platform";
    } else if (role === "admin") {
      if (appSystem === "tally") {
        document.title = "Yf's Platform | Tally Records";
      } else if (appSystem === "fees") {
        document.title = "Yf's Platform | Fees Manager";
      } else {
        document.title = "Yf's Platform | Salary Management";
      }
    }
  }, [isAuthenticated, role, appSystem]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (role === "employee") {
    return <EmployeeApp />;
  }

  const renderSalaryPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />;
      case "institutes":
        return <InstituteManagementPage />;
      case "employees":
        return <EmployeeManagementPage />;
      case "employeeSalary":
        return <SalaryDetailsPage />;
      case "attendance":
        return <AttendancePage />;
      case "salary":
        return <SalaryProcessingPage />;
      case "payslip":
        return <PayslipPage />;
      case "dailyWorkers":
        return <DailyWorkersPage />;
      case "reports":
        return <ReportsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      appSystem={appSystem}
      onSystemChange={setAppSystem}
      tallyPage={tallyPage}
      onTallyNavigate={setTallyPage}
      feesPage={feesPage}
      onFeesNavigate={setFeesPage}
    >
      {appSystem === "tally" ? (
        <TallyApp currentPage={tallyPage} onNavigate={setTallyPage} />
      ) : appSystem === "fees" ? (
        <FeesApp currentPage={feesPage} onNavigate={setFeesPage} />
      ) : (
        renderSalaryPage()
      )}
    </Layout>
  );
}

function SyncOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4"
      style={{ background: "oklch(0.08 0.03 260 / 0.92)" }}
    >
      <Loader2
        className="w-10 h-10 animate-spin"
        style={{ color: "oklch(0.70 0.20 260)" }}
      />
      <p
        className="text-sm font-medium"
        style={{ color: "oklch(0.75 0.12 260)" }}
      >
        Syncing data...
      </p>
    </div>
  );
}

export default function App() {
  const [syncing, setSyncing] = useState(true);

  useEffect(() => {
    syncFromBackend().finally(() => setSyncing(false));
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <SyncOverlay visible={syncing} />
        {!syncing && <AppInner />}
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  );
}
