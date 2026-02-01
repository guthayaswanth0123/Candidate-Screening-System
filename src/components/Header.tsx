import { motion } from "framer-motion";
import { Brain, Sparkles, Users, Target, Zap, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Get user's name from metadata or email
  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "User";

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-8"
    >
      {/* Top Bar with User Menu */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
            <Brain className="h-5 w-5 text-accent-foreground" />
          </div>
          <span className="font-bold text-xl text-foreground">ResumeIQ Pro</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="hidden sm:inline text-sm font-medium">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Hero Section */}
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold text-foreground mb-4"
        >
          Resume Analyzer
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
        >
          Intelligent Resume Analysis & Candidate Ranking System for Modern Recruiters
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {[
            { icon: Zap, label: "Smart Analysis" },
            { icon: Target, label: "Skill Matching" },
            { icon: Users, label: "Candidate Ranking" },
            { icon: Sparkles, label: "Intelligent Scoring" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-muted-foreground text-sm font-medium"
            >
              <item.icon className="h-4 w-4 text-accent" />
              {item.label}
            </div>
          ))}
        </motion.div>
      </div>
    </motion.header>
  );
}
