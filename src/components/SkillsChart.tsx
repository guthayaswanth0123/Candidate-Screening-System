import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import type { AnalysisResult } from "@/types/resume";

interface SkillsChartProps {
  result: AnalysisResult;
}

export function SkillsChart({ result }: SkillsChartProps) {
  // JD Required Skills - coverage across candidates
  const jdSkillCoverage = result.requiredSkills.map((skill) => {
    const matchCount = result.candidates.filter((c) =>
      c.matchedSkills.some((s) => s.toLowerCase() === skill.toLowerCase())
    ).length;
    return {
      skill,
      coverage: Math.round((matchCount / result.candidates.length) * 100),
      type: "JD Required",
    };
  });

  // Extra CV skills (skills present in CVs but NOT in JD)
  const allExtraSkills = new Map<string, number>();
  result.candidates.forEach((candidate) => {
    const extras = candidate.extraSkills || [];
    extras.forEach((skill) => {
      const key = skill.toLowerCase();
      allExtraSkills.set(key, (allExtraSkills.get(key) || 0) + 1);
    });
  });

  const extraSkillData = Array.from(allExtraSkills.entries())
    .map(([skill, count]) => ({
      skill: skill.charAt(0).toUpperCase() + skill.slice(1),
      count,
      coverage: Math.round((count / result.candidates.length) * 100),
      type: "Extra CV Skill",
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Score distribution pie chart
  const scoreDistribution = [
    {
      range: "90-100%",
      count: result.candidates.filter((c) => c.jobFitScore >= 90).length,
      color: "hsl(173, 80%, 40%)",
    },
    {
      range: "70-89%",
      count: result.candidates.filter((c) => c.jobFitScore >= 70 && c.jobFitScore < 90).length,
      color: "hsl(158, 64%, 52%)",
    },
    {
      range: "50-69%",
      count: result.candidates.filter((c) => c.jobFitScore >= 50 && c.jobFitScore < 70).length,
      color: "hsl(38, 92%, 50%)",
    },
    {
      range: "Below 50%",
      count: result.candidates.filter((c) => c.jobFitScore < 50).length,
      color: "hsl(0, 72%, 51%)",
    },
  ].filter((d) => d.count > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-6">Analytics Dashboard</h3>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Score Distribution Pie Chart */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4 text-center">
            Score Distribution
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="range"
                  label={({ range, count }) => `${range}: ${count}`}
                  labelLine={false}
                >
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* JD Required Skills Coverage - Bar Chart */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4 text-center">
            JD Required Skills — Candidate Coverage
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jdSkillCoverage.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                <YAxis
                  type="category"
                  dataKey="skill"
                  width={100}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value}%`, "Coverage"]}
                />
                <Bar dataKey="coverage" fill="hsl(173, 80%, 40%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Extra CV Skills Bar Chart */}
      {extraSkillData.length > 0 && (
        <div className="mt-8">
          <h4 className="text-sm font-medium text-muted-foreground mb-4 text-center">
            Additional Skills Found in CVs (Not in JD)
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={extraSkillData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="skill" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [value, "Candidates"]}
                />
                <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Skill Matrix */}
      <div className="mt-8">
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Skill Matrix — JD Skills vs Candidates</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-medium text-foreground">Candidate</th>
                {result.requiredSkills.slice(0, 6).map((skill) => (
                  <th key={skill} className="text-center py-2 px-2 font-medium text-foreground">
                    <span className="text-xs">{skill}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.candidates.map((candidate) => (
                <tr key={candidate.id} className="border-b border-border/50">
                  <td className="py-2 px-3 font-medium text-foreground">{candidate.name}</td>
                  {result.requiredSkills.slice(0, 6).map((skill) => (
                    <td key={skill} className="text-center py-2 px-2">
                      {candidate.matchedSkills.some(
                        (s) => s.toLowerCase() === skill.toLowerCase()
                      ) ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-success/20 text-success">
                          ✓
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-destructive/20 text-destructive">
                          ✗
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
