import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

export type UserRole = "admin" | "employee" | null;

interface AuthContextType {
  isAuthenticated: boolean;
  role: UserRole;
  username: string;
  employeeId: string;
  login: (role: UserRole, username: string, employeeId?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole>(null);
  const [username, setUsername] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  const login = useCallback(
    (userRole: UserRole, user: string, empId?: string) => {
      setIsAuthenticated(true);
      setRole(userRole);
      setUsername(user);
      setEmployeeId(empId ?? "");
    },
    [],
  );

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setRole(null);
    setUsername("");
    setEmployeeId("");
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, role, username, employeeId, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
