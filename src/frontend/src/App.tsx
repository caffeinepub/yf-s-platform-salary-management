import { Toaster } from "@/components/ui/sonner";
import {
  BarChart3,
  FileText,
  Home,
  Loader2,
  LogOut,
  Moon,
  Sun,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import SyncIndicator from "./components/SyncIndicator";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
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
  const { theme, toggleTheme } = useTheme();
  const [page, setPage] = useState<EmpPage>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.title = "Yf's Platform | Salary Management";
  }, []);

  // Listen for nav events from child components
  useEffect(() => {
    const handler = (e: CustomEvent) => setPage(e.detail as EmpPage);
    window.addEventListener("emp-nav", handler as EventListener);
    return () =>
      window.removeEventListener("emp-nav", handler as EventListener);
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

  const activeLabel = EMP_NAV.find((n) => n.id === page)?.label ?? "Dashboard";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg overflow-hidden border border-primary/30 flex-shrink-0">
          <img
            src="/assets/uploads/file_0000000098e07208a686dfee13498f2c-1.png"
            alt="Logo"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        <div>
          <p className="text-sm font-display font-bold text-gradient leading-tight">
            Yf&apos;s Platform
          </p>
          <p className="text-[10px] text-muted-foreground">Employee Portal</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {EMP_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = page === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setPage(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "gradient-primary text-white glow-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
              data-ocid={`emp_nav.${item.id}.link`}
            >
              <span
                className={`flex-shrink-0 ${
                  isActive ? "" : "group-hover:scale-110 transition-transform"
                }`}
              >
                <Icon className="w-5 h-5" />
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Reports quick link */}
      <div className="px-2 pb-2">
        <button
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Employee Portal</span>
        </button>
      </div>

      {/* User info + logout */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white uppercase">
              {username.slice(0, 2)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-sidebar-foreground">
              {username}
            </p>
            <p className="text-xs text-muted-foreground">Employee</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          data-ocid="emp_nav.logout_button"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <motion.aside
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="hidden md:flex w-56 flex-shrink-0 flex-col h-full bg-sidebar border-r border-sidebar-border"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/60 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-56 bg-sidebar border-r border-sidebar-border z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-border/40 bg-card/30 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(true)}
            >
              <Home className="w-5 h-5" />
            </button>
            <h2 className="font-display font-semibold text-foreground/90">
              {activeLabel}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={
                theme === "dark" ? "Switch to Day mode" : "Switch to Dark mode"
              }
              className="w-9 h-9 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all duration-200"
            >
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.span
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-4 h-4" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-4 h-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <SyncIndicator />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="border-t border-border/30 px-6 py-2 flex-shrink-0">
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()}. Built with{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
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
