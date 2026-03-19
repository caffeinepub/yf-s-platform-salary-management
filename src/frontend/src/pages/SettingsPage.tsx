import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bell,
  Building2,
  ChevronRight,
  Database,
  Key,
  Palette,
  Settings,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";

const SETTINGS_SECTIONS = [
  {
    icon: <Building2 className="w-5 h-5" />,
    title: "Institute Settings",
    description: "Configure institutes, branches, and organizational hierarchy",
    badge: "Phase 2",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: <Key className="w-5 h-5" />,
    title: "User & Password Management",
    description:
      "Manage admin and employee credentials, roles, and permissions",
    badge: "Phase 2",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: "Salary Structure Configuration",
    description: "Set up DA, HRA, TA, PT slabs and salary components",
    badge: "Phase 2",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Security & Access Control",
    description:
      "Configure role-based access, session timeouts, and audit logs",
    badge: "Phase 2",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: <Bell className="w-5 h-5" />,
    title: "Notifications",
    description:
      "Manage email alerts, salary processing reminders, and system notifications",
    badge: "Phase 2",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  {
    icon: <Palette className="w-5 h-5" />,
    title: "Appearance",
    description: "Customize theme, color scheme, and display preferences",
    badge: "Phase 2",
    color: "text-muted-foreground",
    bg: "bg-muted/30",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6" data-ocid="settings.page">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-gradient">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            System configuration and preferences
          </p>
        </div>
        <Settings className="w-6 h-6 text-muted-foreground/50" />
      </motion.div>

      {/* Phase banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3"
      >
        <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-primary">
            Phase 1 — Foundation Complete
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Core features (Login, Dashboard, Institute & Employee Management)
            are live. Advanced settings will be available in Phase 2, including
            salary structure configuration, professional tax slabs, user
            management, and more.
          </p>
        </div>
      </motion.div>

      {/* Settings grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SETTINGS_SECTIONS.map((section, idx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + idx * 0.06 }}
          >
            <Card
              className="gradient-card cursor-pointer hover:scale-[1.02] transition-transform duration-200"
              data-ocid={`settings.item.${idx + 1}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${section.bg} ${section.color}`}
                    >
                      {section.icon}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-display">
                        {section.title}
                      </CardTitle>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs bg-muted/40">
                      {section.badge}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-xs">
                  {section.description}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
