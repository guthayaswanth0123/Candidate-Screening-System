import { motion } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";

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
        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/60 shadow-glow mb-6"
      >
        <Brain className="h-8 w-8 text-accent-foreground" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-5xl font-bold text-foreground mb-4"
      >
        AI Resume Analyzer
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6"
      >
        Upload resumes and job descriptions to automatically evaluate candidate fit
        using advanced AI-powered semantic analysis
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium"
      >
        <Sparkles className="h-4 w-4" />
        Powered by AI • Semantic Matching • Skill Analysis
      </motion.div>
    </motion.header>
  );
}
