import { useAuth } from "@/hooks/useAuth";
import CandidateDashboard from "./CandidateDashboard";
import RecruiterDashboard from "./RecruiterDashboard";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { role } = useAuth();

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (role === "recruiter") {
    return <RecruiterDashboard />;
  }

  return <CandidateDashboard />;
};

export default Index;
