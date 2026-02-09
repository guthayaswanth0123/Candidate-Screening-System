import { motion } from "framer-motion";
import {
  LayoutDashboard, PlusCircle, BarChart3,
  ChevronLeft, ChevronRight, Brain, LogOut, User,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface RecruiterSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  hasResults: boolean;
}

const navItems = [
  { id: "home", label: "Dashboard", icon: LayoutDashboard },
  { id: "analyze", label: "New Analysis", icon: PlusCircle },
  { id: "results", label: "Results", icon: BarChart3, requiresResults: true },
];

export function RecruiterSidebar({ currentView, onViewChange, hasResults }: RecruiterSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Recruiter";

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen sticky top-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col overflow-hidden shrink-0"
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border flex items-center gap-3 min-h-[65px]">
        <div className="w-10 h-10 min-w-[40px] rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/60 flex items-center justify-center">
          <Brain className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h1 className="font-bold text-sm text-sidebar-foreground leading-tight">Candidate</h1>
            <h1 className="font-bold text-sm text-sidebar-primary leading-tight">Screening System</h1>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 mt-2">
        <div className="mb-4">
          {!collapsed && (
            <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-semibold px-3 mb-2">
              Menu
            </p>
          )}
        </div>
        {navItems.map((item) => {
          if (item.requiresResults && !hasResults) return null;
          const isActive = currentView === item.id;
          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="h-5 w-5 min-w-[20px]" />
              {!collapsed && <span>{item.label}</span>}
              {item.id === "results" && hasResults && !collapsed && (
                <span className="ml-auto w-2 h-2 rounded-full bg-success animate-pulse" />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-xs"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 min-w-[32px] rounded-full bg-sidebar-accent flex items-center justify-center">
            <User className="h-4 w-4 text-sidebar-foreground" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{userName}</p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">{user?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-sidebar-foreground/50 hover:text-destructive hover:bg-sidebar-accent transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
