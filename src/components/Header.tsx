import { motion } from "framer-motion";
import { Brain, Sparkles, Users, Target, Zap } from "lucide-react";

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent/60 shadow-glow mb-6"
      >
        <Brain className="h-10 w-10 text-accent-foreground" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-5xl font-bold text-foreground mb-4"
      >
        ResumeIQ Pro
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
          { icon: Sparkles, label: "AI-Powered" },
        ].map((item, i) => (
          <div
            key={item.label}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-muted-foreground text-sm font-medium"
          >
            <item.icon className="h-4 w-4 text-accent" />
            {item.label}
          </div>
        ))}
      </motion.div>
    </motion.header>
  );
}
