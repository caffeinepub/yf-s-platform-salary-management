import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Banknote,
  BookOpen,
  Cpu,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  LogIn,
  ShieldCheck,
  User,
  UserCog,
} from "lucide-react";
import { AnimatePresence, type Variants, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { pushAllToBackend } from "../services/backendSync";

const ADMIN_CREDENTIALS = { username: "admin", password: "admin123" };

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        id: i,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120, 160, 255, ${p.opacity})`;
        ctx.fill();

        for (const p2 of particles) {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(120, 160, 255, ${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

function getEmployeeCredentials(): Array<{
  username: string;
  password: string;
  employeeId: string;
  name: string;
}> {
  try {
    return JSON.parse(localStorage.getItem("employeeCredentials") || "[]");
  } catch {
    return [];
  }
}

function getEmployees(): Array<{ name: string; employeeId: string }> {
  try {
    return JSON.parse(localStorage.getItem("employees") || "[]");
  } catch {
    return [];
  }
}

export default function LoginPage() {
  const { login } = useAuth();
  const [role, setRole] = useState<"admin" | "employee">("employee");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 900));

    if (role === "admin") {
      if (
        username === ADMIN_CREDENTIALS.username &&
        password === ADMIN_CREDENTIALS.password
      ) {
        toast.success("Welcome back, Admin!");
        login("admin", username);
        pushAllToBackend();
      } else {
        toast.error("Invalid admin credentials");
      }
    } else {
      // Employee login — check stored credentials first
      const storedCreds = getEmployeeCredentials();
      let matched = storedCreds.find(
        (c) => c.username === username && c.password === password,
      );

      if (!matched) {
        // Fallback: check auto-generated credentials from employees list
        const employees = getEmployees();
        const emp = employees.find((e) => {
          const autoUser = (
            e.name.toLowerCase().replace(/\s/g, "").slice(0, 4) + e.employeeId
          ).toLowerCase();
          return autoUser === username.toLowerCase();
        });
        if (emp) {
          const autoPass = (
            emp.name.toLowerCase().replace(/\s/g, "").slice(0, 4) +
            emp.employeeId
          ).toLowerCase();
          if (autoPass === password.toLowerCase()) {
            matched = {
              username,
              password,
              employeeId: emp.employeeId,
              name: emp.name,
            };
          }
        }
      }

      if (!matched) {
        toast.error("Invalid credentials. Please contact your administrator.");
        setIsLoading(false);
        return;
      }

      toast.success(`Welcome, ${matched.name}!`);
      login("employee", matched.username, matched.employeeId);
      pushAllToBackend();
    }
    setIsLoading(false);
  };

  const fieldVariants: Variants = {
    hidden: { opacity: 0, x: -18, filter: "blur(4px)" },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: {
        delay: 0.3 + i * 0.1,
        duration: 0.45,
        ease: "easeOut" as const,
      },
    }),
  };

  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.12 0.04 260) 0%, oklch(0.10 0.06 290) 50%, oklch(0.08 0.03 220) 100%)",
      }}
      data-ocid="login.page"
    >
      <style>{`
        @keyframes blobPulse1 {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.15); opacity: 0.25; }
        }
        @keyframes blobPulse2 {
          0%, 100% { transform: scale(1); opacity: 0.10; }
          50% { transform: scale(1.2); opacity: 0.20; }
        }
        @keyframes rotateBorder {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        @keyframes logoScale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
      <FloatingParticles />

      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{
          background: "oklch(0.55 0.25 260)",
          zIndex: 0,
          animation: "blobPulse1 6s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{
          background: "oklch(0.55 0.26 295)",
          zIndex: 0,
          animation: "blobPulse2 8s ease-in-out 2s infinite",
        }}
      />

      {/* Left panel - desktop only */}
      <div
        className="hidden md:flex md:w-1/2 flex-col items-center justify-center p-12 relative"
        style={{ zIndex: 1 }}
      >
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative mb-5">
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background:
                    "radial-gradient(circle, oklch(0.65 0.28 260 / 0.6) 0%, transparent 70%)",
                  transform: "scale(1.4)",
                  animation: "logoPulse 2.5s ease-in-out infinite",
                }}
              />
              <div
                className="w-20 h-20 rounded-2xl overflow-hidden relative"
                style={{
                  boxShadow:
                    "0 0 30px oklch(0.60 0.28 260 / 0.5), 0 0 60px oklch(0.60 0.28 260 / 0.25)",
                  border: "2px solid oklch(0.55 0.22 260 / 0.5)",
                  animation: "logoScale 3s ease-in-out 0.5s infinite",
                }}
              >
                <img
                  src="/assets/uploads/logo-1.png"
                  alt="Yf's Platform Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const el = e.currentTarget;
                    el.style.display = "none";
                    const parent = el.parentElement;
                    if (parent) {
                      parent.innerHTML =
                        '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,oklch(0.35 0.18 260),oklch(0.30 0.20 295))"><span style="font-size:2rem;font-weight:900;color:white">Yf</span></div>';
                    }
                  }}
                />
              </div>
            </div>
            <h1
              className="text-3xl font-display font-bold leading-tight text-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.90 0.10 260), oklch(0.80 0.20 295))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome to Yf&apos;s Platform
            </h1>
            <p
              className="text-sm text-center mt-2 leading-relaxed"
              style={{ color: "oklch(0.60 0.07 260)" }}
            >
              All-in-one management suite for your organization
            </p>
          </div>

          {/* System cards */}
          <div className="space-y-3">
            {[
              {
                icon: Banknote,
                title: "Salary Management",
                desc: "Payroll, attendance, HR & compliance for multiple institutes",
                color: "oklch(0.55 0.25 260)",
              },
              {
                icon: BookOpen,
                title: "Tally Records",
                desc: "Full accounting suite — journal, ledger, balance sheet & more",
                color: "oklch(0.55 0.22 200)",
              },
              {
                icon: GraduationCap,
                title: "Fees Manager",
                desc: "Student fee collection, structures, payments & receipts",
                color: "oklch(0.60 0.22 295)",
              },
            ].map((sys, i) => (
              <motion.div
                key={sys.title}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.45 }}
                className="flex items-start gap-3 rounded-xl p-3.5"
                style={{
                  background: "oklch(0.16 0.06 260 / 0.6)",
                  border: "1px solid oklch(0.30 0.10 260 / 0.5)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${sys.color}22`,
                    border: `1px solid ${sys.color}44`,
                  }}
                >
                  <sys.icon className="w-5 h-5" style={{ color: sys.color }} />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "oklch(0.88 0.06 260)" }}
                  >
                    {sys.title}
                  </p>
                  <p
                    className="text-xs mt-0.5 leading-relaxed"
                    style={{ color: "oklch(0.58 0.05 260)" }}
                  >
                    {sys.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel - full width on mobile, half on desktop */}
      <div
        className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 relative"
        style={{ zIndex: 1 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md relative"
        >
          <div
            className="absolute -inset-[2px] rounded-2xl pointer-events-none"
            style={{
              background:
                "conic-gradient(from 0deg, oklch(0.65 0.28 260), oklch(0.60 0.30 295), oklch(0.65 0.25 200), oklch(0.65 0.28 260))",
              zIndex: -1,
              animation: "rotateBorder 10s linear infinite",
            }}
          />

          <div
            className="rounded-2xl p-8 shadow-2xl relative"
            style={{
              background:
                "linear-gradient(145deg, oklch(0.16 0.05 260 / 0.95), oklch(0.13 0.04 290 / 0.98))",
              backdropFilter: "blur(20px)",
              border: "1px solid oklch(0.35 0.12 260 / 0.4)",
            }}
          >
            {/* Logo (mobile only) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: 0.15,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex flex-col items-center mb-8"
            >
              <div className="relative mb-4">
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background:
                      "radial-gradient(circle, oklch(0.65 0.28 260 / 0.6) 0%, transparent 70%)",
                    transform: "scale(1.4)",
                    animation: "logoPulse 2.5s ease-in-out infinite",
                  }}
                />
                <div
                  className="w-24 h-24 rounded-2xl overflow-hidden relative"
                  style={{
                    boxShadow:
                      "0 0 30px oklch(0.60 0.28 260 / 0.5), 0 0 60px oklch(0.60 0.28 260 / 0.25)",
                    border: "2px solid oklch(0.55 0.22 260 / 0.5)",
                    animation: "logoScale 3s ease-in-out 0.5s infinite",
                  }}
                >
                  <img
                    src="/assets/uploads/logo-1.png"
                    alt="Yf's Platform Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const el = e.currentTarget;
                      el.style.display = "none";
                      const parent = el.parentElement;
                      if (parent) {
                        parent.innerHTML =
                          '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,oklch(0.35 0.18 260),oklch(0.30 0.20 295))"><span style="font-size:2rem;font-weight:900;color:white">Yf</span></div>';
                      }
                    }}
                  />
                </div>
              </div>

              <h1
                className="text-2xl font-display font-bold leading-tight text-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.90 0.10 260), oklch(0.80 0.20 295))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Welcome to Yf&apos;s Platform
              </h1>
              <p
                className="text-sm text-center mt-1.5 leading-relaxed"
                style={{ color: "oklch(0.65 0.08 260)" }}
              >
                Salary Management &middot; Tally Records &middot; Fees Manager
              </p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Role — side-by-side segmented control */}
              <motion.div
                custom={0}
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                className="space-y-1.5"
              >
                <Label
                  className="text-sm font-medium flex items-center gap-1.5"
                  style={{ color: "oklch(0.75 0.10 260)" }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> User Type
                </Label>
                <div
                  className="flex rounded-lg p-1 gap-1"
                  style={{
                    background: "oklch(0.14 0.05 260 / 0.9)",
                    border: "1px solid oklch(0.32 0.12 260 / 0.5)",
                  }}
                >
                  {/* Admin button */}
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    data-ocid="login.admin_toggle"
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-semibold transition-all duration-200"
                    style={
                      role === "admin"
                        ? {
                            background:
                              "linear-gradient(135deg, oklch(0.48 0.24 260), oklch(0.44 0.27 295))",
                            color: "oklch(0.96 0.03 260)",
                            boxShadow: "0 2px 12px oklch(0.50 0.25 260 / 0.45)",
                          }
                        : {
                            background: "transparent",
                            color: "oklch(0.58 0.08 260)",
                          }
                    }
                  >
                    <UserCog className="w-3.5 h-3.5" />
                    Administrator
                  </button>

                  {/* Employee button */}
                  <button
                    type="button"
                    onClick={() => setRole("employee")}
                    data-ocid="login.employee_toggle"
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-semibold transition-all duration-200"
                    style={
                      role === "employee"
                        ? {
                            background:
                              "linear-gradient(135deg, oklch(0.48 0.24 260), oklch(0.44 0.27 295))",
                            color: "oklch(0.96 0.03 260)",
                            boxShadow: "0 2px 12px oklch(0.50 0.25 260 / 0.45)",
                          }
                        : {
                            background: "transparent",
                            color: "oklch(0.58 0.08 260)",
                          }
                    }
                  >
                    <User className="w-3.5 h-3.5" />
                    Employee
                  </button>
                </div>
              </motion.div>

              {/* Username */}
              <motion.div
                custom={1}
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                className="space-y-1.5"
              >
                <Label
                  className="text-sm font-medium flex items-center gap-1.5"
                  style={{ color: "oklch(0.75 0.10 260)" }}
                >
                  <User className="w-3.5 h-3.5" /> Username
                </Label>
                <AnimatePresence>
                  <motion.div
                    animate={{
                      boxShadow:
                        focusedField === "username"
                          ? "0 0 0 2px oklch(0.60 0.25 260 / 0.6), 0 0 20px oklch(0.60 0.25 260 / 0.2)"
                          : "none",
                    }}
                    className="rounded-md"
                  >
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onFocus={() => setFocusedField("username")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter your username"
                      className="font-medium"
                      style={{
                        background: "oklch(0.20 0.06 260 / 0.8)",
                        border: "1px solid oklch(0.38 0.14 260 / 0.5)",
                        color: "oklch(0.92 0.04 260)",
                      }}
                      data-ocid="login.input"
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Password */}
              <motion.div
                custom={2}
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                className="space-y-1.5"
              >
                <Label
                  className="text-sm font-medium flex items-center gap-1.5"
                  style={{ color: "oklch(0.75 0.10 260)" }}
                >
                  <Lock className="w-3.5 h-3.5" /> Password
                </Label>
                <motion.div
                  animate={{
                    boxShadow:
                      focusedField === "password"
                        ? "0 0 0 2px oklch(0.60 0.25 260 / 0.6), 0 0 20px oklch(0.60 0.25 260 / 0.2)"
                        : "none",
                  }}
                  className="relative rounded-md"
                >
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your password"
                    className="font-medium pr-10"
                    style={{
                      background: "oklch(0.20 0.06 260 / 0.8)",
                      border: "1px solid oklch(0.38 0.14 260 / 0.5)",
                      color: "oklch(0.92 0.04 260)",
                    }}
                    data-ocid="login.password_input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "oklch(0.60 0.10 260)" }}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </motion.div>
              </motion.div>

              {/* Forgot password */}
              <motion.div
                custom={3}
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                className="flex justify-end"
              >
                <button
                  type="button"
                  className="text-xs transition-colors hover:underline"
                  style={{ color: "oklch(0.65 0.20 260)" }}
                  onClick={() =>
                    toast.info("Please contact your system administrator.")
                  }
                >
                  Forgot Password?
                </button>
              </motion.div>

              {/* Login button */}
              <motion.div
                custom={4}
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full font-bold py-2.5 border-0 relative overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.50 0.25 260), oklch(0.45 0.28 295))",
                      color: "white",
                      boxShadow:
                        "0 4px 20px oklch(0.55 0.26 260 / 0.4), 0 0 40px oklch(0.55 0.26 260 / 0.15)",
                    }}
                    data-ocid="login.submit_button"
                  >
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatDelay: 1.5,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                        width: "60%",
                      }}
                    />
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 animate-spin" />
                        Authenticating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <LogIn className="w-4 h-4" />
                        Login
                      </span>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </form>

            {/* Copyright */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-5 pt-4 text-center"
              style={{ borderTop: "1px solid oklch(0.35 0.10 260 / 0.3)" }}
            >
              <p
                className="text-xs font-medium"
                style={{ color: "oklch(0.68 0.10 260)" }}
              >
                &copy; {new Date().getFullYear()} Yf&apos;s Platform &mdash;
                All-in-One Management Suite
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "oklch(0.62 0.14 295)" }}
              >
                ✦ Author:{" "}
                <span
                  className="font-semibold"
                  style={{ color: "oklch(0.72 0.18 295)" }}
                >
                  Sachin Patel
                </span>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
