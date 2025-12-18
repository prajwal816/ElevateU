import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Clock, Search, Filter, Loader2 } from "lucide-react";
import { codePracticeApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  solved: boolean;
  timeLimit: number;
  memoryLimit: number;
  example: {
    input: string;
    output: string;
  };
  templates: {
    [key: string]: string;
  };
}

interface ProblemListProps {
  onSelectProblem: (problem: Problem) => void;
  selectedProblem: Problem | null;
}

export const ProblemList = ({
  onSelectProblem,
  selectedProblem,
}: ProblemListProps) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const categories = Array.from(new Set(problems.map((p) => p.category)));

  useEffect(() => {
    loadProblems();
  }, [searchTerm, difficultyFilter, categoryFilter, statusFilter]);

  const loadProblems = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (searchTerm) params.search = searchTerm;
      if (difficultyFilter !== "all") params.difficulty = difficultyFilter;
      if (categoryFilter !== "all") params.category = categoryFilter;
      if (statusFilter !== "all") params.status = statusFilter;

      const response = await codePracticeApi.getProblems(params);
      setProblems(response.data.problems || []);
    } catch (error: any) {
      console.error("Failed to load problems:", error);
      toast({
        title: "Error",
        description: "Failed to load coding problems",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Hard":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search problems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="solved">Solved</SelectItem>
              <SelectItem value="unsolved">Unsolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Problems List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {problems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No problems found matching your criteria.</p>
          </div>
        ) : (
          problems.map((problem) => (
            <div
              key={problem.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedProblem?.id === problem.id
                  ? "bg-primary/20 border-primary/50"
                  : "bg-muted/30 border-border hover:bg-muted/50"
              }`}
              onClick={() => onSelectProblem(problem)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {problem.solved && (
                    <CheckCircle className="h-4 w-4 text-success" />
                  )}
                  <h4 className="font-medium text-sm">{problem.title}</h4>
                </div>
                <Badge className={getDifficultyColor(problem.difficulty)}>
                  {problem.difficulty}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {problem.description}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="bg-muted/50 px-2 py-1 rounded">
                  {problem.category}
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {problem.timeLimit / 1000}s
                  </span>
                  <span>{problem.memoryLimit}MB</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
        Showing {problems.length} problems
      </div>
    </div>
  );
};
