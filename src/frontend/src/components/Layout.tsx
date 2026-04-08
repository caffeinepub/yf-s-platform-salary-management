import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  BarChart3,
  BookMarked,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  FileText,
  GraduationCap,
  HardHat,
  IndianRupee,
  LayoutDashboard,
  LayoutGrid,
  ListChecks,
  LogOut,
  Menu,
  Moon,
  Package,
  Receipt,
  RefreshCw,
  Scale,
  Settings,
  Shield,
  ShoppingCart,
  Sun,
  TrendingUp,
  Upload,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { AppSystem, PageName } from "../App";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import type { FeesPage } from "../fees/types";
import { getSyncStatus, pushAllToBackend } from "../services/backendSync";
import type { TallyPage } from "../tally/types";
import SyncIndicator from "./SyncIndicator";

interface NavItem {
  id: PageName;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    id: "institutes",
    label: "Institute Management",
    icon: <Building2 className="w-5 h-5" />,
    adminOnly: true,
  },
  {
    id: "employees",
    label: "Employee Management",
    icon: <Users className="w-5 h-5" />,
    adminOnly: true,
  },
  {
    id: "employeeSalary",
    label: "Salary Details",
    icon: <IndianRupee className="w-5 h-5" />,
    adminOnly: true,
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: <CalendarCheck className="w-5 h-5" />,
    adminOnly: true,
  },
  {
    id: "salary",
    label: "Salary Processing",
    icon: <Banknote className="w-5 h-5" />,
    adminOnly: true,
  },
  {
    id: "payslip",
    label: "Payslip",
    icon: <FileText className="w-5 h-5" />,
    adminOnly: false,
  },
  {
    id: "dailyWorkers",
    label: "Daily Workers",
    icon: <HardHat className="w-5 h-5" />,
    adminOnly: true,
  },
  {
    id: "contractWorkers",
    label: "Contract Workers",
    icon: <Briefcase className="w-5 h-5" />,
    adminOnly: true,
  },
  {
    id: "reports",
    label: "Reports",
    icon: <BarChart3 className="w-5 h-5" />,
    adminOnly: true,
  },
  { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
];

interface TallyNavGroup {
  label: string;
  items: { id: TallyPage; label: string; icon: React.ReactNode }[];
}

const TALLY_NAV_GROUPS: TallyNavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
    ],
  },
  {
    label: "Data Entry",
    items: [
      {
        id: "transactions",
        label: "Transactions",
        icon: <Upload className="w-4 h-4" />,
      },
      {
        id: "journal",
        label: "Journal",
        icon: <BookOpen className="w-4 h-4" />,
      },
    ],
  },
  {
    label: "Books",
    items: [
      {
        id: "daybook",
        label: "Day Book",
        icon: <Calendar className="w-4 h-4" />,
      },
      {
        id: "cashbook",
        label: "Cash Book",
        icon: <Wallet className="w-4 h-4" />,
      },
      {
        id: "bankbook",
        label: "Bank Book",
        icon: <Building2 className="w-4 h-4" />,
      },
      {
        id: "purchase",
        label: "Purchase Register",
        icon: <ShoppingCart className="w-4 h-4" />,
      },
      {
        id: "sales",
        label: "Sales Register",
        icon: <TrendingUp className="w-4 h-4" />,
      },
    ],
  },
  {
    label: "Analysis",
    items: [
      {
        id: "ledger",
        label: "Ledger",
        icon: <BookMarked className="w-4 h-4" />,
      },
      {
        id: "trialbalance",
        label: "Trial Balance",
        icon: <Scale className="w-4 h-4" />,
      },
      {
        id: "balancesheet",
        label: "Balance Sheet",
        icon: <LayoutGrid className="w-4 h-4" />,
      },
      {
        id: "profitloss",
        label: "Profit & Loss",
        icon: <BarChart3 className="w-4 h-4" />,
      },
      {
        id: "receivables",
        label: "Receivables",
        icon: <ArrowDownLeft className="w-4 h-4" />,
      },
      {
        id: "payables",
        label: "Payables",
        icon: <ArrowUpRight className="w-4 h-4" />,
      },
      {
        id: "stock",
        label: "Stock Summary",
        icon: <Package className="w-4 h-4" />,
      },
    ],
  },
];

interface FeesNavGroup {
  label: string;
  items: { id: FeesPage; label: string; icon: React.ReactNode }[];
}

const FEES_NAV_GROUPS: FeesNavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        id: "students",
        label: "Students",
        icon: <Users className="w-4 h-4" />,
      },
      {
        id: "feestructure",
        label: "Fee Structure",
        icon: <ListChecks className="w-4 h-4" />,
      },
    ],
  },
  {
    label: "Transactions",
    items: [
      {
        id: "collectfee",
        label: "Collect Fee",
        icon: <IndianRupee className="w-4 h-4" />,
      },
      {
        id: "payments",
        label: "Payments",
        icon: <Receipt className="w-4 h-4" />,
      },
    ],
  },
  {
    label: "Reports",
    items: [
      {
        id: "reports",
        label: "Reports",
        icon: <BarChart3 className="w-4 h-4" />,
      },
    ],
  },
];

interface LayoutProps {
  currentPage: PageName;
  onNavigate: (page: PageName) => void;
  appSystem: AppSystem;
  onSystemChange: (system: AppSystem) => void;
  tallyPage: TallyPage;
  onTallyNavigate: (page: TallyPage) => void;
  feesPage: FeesPage;
  onFeesNavigate: (page: FeesPage) => void;
  children: React.ReactNode;
}

export default function Layout({
  currentPage,
  onNavigate,
  appSystem,
  onSystemChange,
  tallyPage,
  onTallyNavigate,
  feesPage,
  onFeesNavigate,
  children,
}: LayoutProps) {
  const { role, username, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const [syncing, setSyncing] = useState(false);

  const visibleSalaryItems = NAV_ITEMS.filter((item) => {
    if (item.adminOnly && role !== "admin") return false;
    return true;
  });

  const handleForceSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      await pushAllToBackend();
      const status = getSyncStatus();
      if (status === "ok") {
        toast.success("All data synced to server successfully.");
      } else {
        toast.error("Sync failed. Check your connection and try again.");
      }
    } catch {
      toast.error("Sync failed. Check your connection and try again.");
    } finally {
      setSyncing(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div
        className={`flex items-center gap-3 px-4 py-5 border-b border-sidebar-border ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <div className="w-9 h-9 rounded-lg overflow-hidden border border-primary/30 flex-shrink-0 bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <img
            src="/assets/uploads/logo-1.png"
            alt="Logo"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-display font-bold text-gradient leading-tight">
              Yf&apos;s Platform
            </p>
            <p className="text-[10px] text-muted-foreground">
              {appSystem === "tally"
                ? "Tally Records"
                : appSystem === "fees"
                  ? "Fees Manager"
                  : "Salary Management"}
            </p>
          </div>
        )}
      </div>

      {/* Nav — Salary (grouped) */}
      {appSystem === "salary" &&
        (() => {
          const salaryGroups = [
            {
              label: "Overview",
              items: visibleSalaryItems.filter((i) => i.id === "dashboard"),
            },
            {
              label: "HR",
              items: visibleSalaryItems.filter((i) =>
                ["institutes", "employees", "employeeSalary"].includes(i.id),
              ),
            },
            {
              label: "Payroll",
              items: visibleSalaryItems.filter((i) =>
                ["attendance", "salary", "payslip"].includes(i.id),
              ),
            },
            {
              label: "Workers",
              items: visibleSalaryItems.filter((i) =>
                ["dailyWorkers", "contractWorkers"].includes(i.id),
              ),
            },
            {
              label: "Admin",
              items: visibleSalaryItems.filter((i) =>
                ["reports", "settings"].includes(i.id),
              ),
            },
          ].filter((g) => g.items.length > 0);
          return (
            <nav className="flex-1 py-2 px-2 overflow-y-auto">
              {salaryGroups.map((group) => (
                <div key={group.label} className="mb-2">
                  {!collapsed && (
                    <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                      {group.label}
                    </p>
                  )}
                  {group.items.map((item) => {
                    const isActive = currentPage === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => {
                          onNavigate(item.id);
                          mainRef.current?.scrollTo(0, 0);
                          setMobileOpen(false);
                        }}
                        data-ocid={`nav.${item.id}.link`}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                          isActive
                            ? "gradient-primary text-white glow-primary"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        } ${collapsed ? "justify-center" : ""}`}
                      >
                        <span
                          className={`flex-shrink-0 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`}
                        >
                          {item.icon}
                        </span>
                        {!collapsed && (
                          <span className="text-sm font-medium truncate">
                            {item.label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
          );
        })()}

      {/* Nav — Tally */}
      {appSystem === "tally" && (
        <nav className="flex-1 py-2 px-2 overflow-y-auto">
          {TALLY_NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-2">
              {!collapsed && (
                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const isActive = tallyPage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onTallyNavigate(item.id);
                      mainRef.current?.scrollTo(0, 0);
                      setMobileOpen(false);
                    }}
                    data-ocid={`tally.nav.${item.id}.link`}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                      collapsed ? "justify-center" : ""
                    } ${
                      isActive
                        ? "gradient-primary text-white glow-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 ${
                        isActive
                          ? ""
                          : "group-hover:scale-110 transition-transform"
                      }`}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      )}

      {/* Nav — Fees */}
      {appSystem === "fees" && (
        <nav className="flex-1 py-2 px-2 overflow-y-auto">
          {FEES_NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-2">
              {!collapsed && (
                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const isActive = feesPage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onFeesNavigate(item.id);
                      mainRef.current?.scrollTo(0, 0);
                      setMobileOpen(false);
                    }}
                    data-ocid={`fees.nav.${item.id}.link`}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                      collapsed ? "justify-center" : ""
                    } ${
                      isActive
                        ? "gradient-primary text-white glow-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 ${
                        isActive
                          ? ""
                          : "group-hover:scale-110 transition-transform"
                      }`}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      )}

      {/* Bottom: user info + logout */}
      <div className="border-t border-sidebar-border p-3">
        <div
          className={`flex items-center gap-2 mb-2 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-sidebar-foreground">
                {username}
              </p>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={logout}
          data-ocid="nav.logout.button"
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.12, ease: "easeOut" }}
        className="hidden md:flex flex-col bg-sidebar border-r border-sidebar-border relative flex-shrink-0 overflow-hidden"
      >
        <SidebarContent />
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full gradient-primary flex items-center justify-center shadow-glow z-10 hover:scale-110 transition-transform"
          data-ocid="nav.sidebar.toggle"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3 text-white" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-white" />
          )}
        </button>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
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
              className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border z-50"
            >
              <button
                type="button"
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
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
              <Menu className="w-5 h-5" />
            </button>

            {/* System Switcher */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              <button
                type="button"
                onClick={() => onSystemChange("salary")}
                data-ocid="topnav.salary_system.tab"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                  appSystem === "salary"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <IndianRupee className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salary Management</span>
              </button>
              <button
                type="button"
                onClick={() => onSystemChange("tally")}
                data-ocid="topnav.tally_system.tab"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                  appSystem === "tally"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tally Records</span>
              </button>
              <button
                type="button"
                onClick={() => onSystemChange("fees")}
                data-ocid="topnav.fees_system.tab"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                  appSystem === "fees"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Fees Manager</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              data-ocid="topnav.theme.toggle"
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
            {/* Force Sync button — click to manually push all data to server */}
            <button
              type="button"
              onClick={handleForceSync}
              disabled={syncing}
              title="Force sync all data to server now"
              data-ocid="topnav.force_sync.button"
              className="w-8 h-8 rounded-lg bg-card/60 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={appSystem}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
