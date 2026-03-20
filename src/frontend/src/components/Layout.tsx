import { Button } from "@/components/ui/button";
import {
  Banknote,
  BarChart3,
  Bell,
  Building2,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  FileText,
  HardHat,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { PageName } from "../App";
import { useAuth } from "../context/AuthContext";

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
    id: "reports",
    label: "Reports",
    icon: <BarChart3 className="w-5 h-5" />,
    adminOnly: true,
  },
  { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
];

interface LayoutProps {
  currentPage: PageName;
  onNavigate: (page: PageName) => void;
  children: React.ReactNode;
}

export default function Layout({
  currentPage,
  onNavigate,
  children,
}: LayoutProps) {
  const { role, username, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.adminOnly && role !== "admin") return false;
    return true;
  });

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div
        className={`flex items-center gap-3 px-4 py-5 border-b border-sidebar-border ${
          collapsed ? "justify-center" : ""
        }`}
      >
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
        {!collapsed && (
          <div>
            <p className="text-sm font-display font-bold text-gradient leading-tight">
              Yf&apos;s Platform
            </p>
            <p className="text-[10px] text-muted-foreground">
              Salary Management
            </p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileOpen(false);
              }}
              data-ocid={`nav.${item.id}.link`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "gradient-primary text-white glow-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
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
      </nav>

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
        {/* Collapse toggle */}
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
            <h2 className="font-display font-semibold text-foreground/90 capitalize">
              {NAV_ITEMS.find((i) => i.id === currentPage)?.label ??
                "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="w-8 h-8 rounded-lg bg-card/60 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-xs font-bold text-white uppercase">
                  {username.slice(0, 2)}
                </span>
              </div>
              <span className="hidden sm:block text-sm font-medium text-foreground/80">
                {username}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-muted-foreground hover:text-destructive text-xs gap-1"
              data-ocid="topnav.logout.button"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/30 px-6 py-2 flex-shrink-0">
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()}. Built with love using{" "}
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
