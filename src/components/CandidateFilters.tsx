import { motion } from "framer-motion";
import { Filter, SortAsc, SortDesc, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CandidateFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (order: "asc" | "desc") => void;
  minScore: number;
  onMinScoreChange: (score: number) => void;
}

export function CandidateFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  minScore,
  onMinScoreChange,
}: CandidateFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border/50"
    >
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search candidates..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sort By */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jobFitScore">Job Fit Score</SelectItem>
            <SelectItem value="semanticScore">Semantic Score</SelectItem>
            <SelectItem value="skillMatchScore">Skill Match</SelectItem>
            <SelectItem value="matchedSkills">Skills Matched</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
        >
          {sortOrder === "desc" ? (
            <SortDesc className="h-4 w-4" />
          ) : (
            <SortAsc className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Min Score Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Min Score:</span>
        <Select value={String(minScore)} onValueChange={(v) => onMinScoreChange(Number(v))}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">All</SelectItem>
            <SelectItem value="50">50%+</SelectItem>
            <SelectItem value="60">60%+</SelectItem>
            <SelectItem value="70">70%+</SelectItem>
            <SelectItem value="80">80%+</SelectItem>
            <SelectItem value="90">90%+</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  );
}
