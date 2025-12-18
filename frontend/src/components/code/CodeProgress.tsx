import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Code,
  CheckCircle,
  Clock,
  Zap,
} from "lucide-react";

interface CodeProgressProps {
  stats: {
    problemsSolved: number;
    totalProblems: number;
    streak: number;
    totalTime: number;
  };
}

const mockProgressData = {
  recentActivity: [
    { date: "2024-12-18", problemsSolved: 3, timeSpent: 45 },
    { date: "2024-12-17", problemsSolved: 2, timeSpent: 30 },
    { date: "2024-12-16", problemsSolved: 1, timeSpent: 20 },
    { date: "2024-12-15", problemsSolved: 4, timeSpent: 60 },
    { date: "2024-12-14", problemsSolved: 2, timeSpent: 35 },
    { date: "2024-12-13", problemsSolved: 1, timeSpent: 15 },
    { date: "2024-12-12", problemsSolved: 3, timeSpent: 50 },
  ],
  categoryProgress: [
    { category: "Array", solved: 8, total: 15, percentage: 53 },
    { category: "String", solved: 6, total: 12, percentage: 50 },
    { category: "Dynamic Programming", solved: 3, total: 10, percentage: 30 },
    { category: "Tree", solved: 4, total: 8, percentage: 50 },
    { category: "Linked List", solved: 2, total: 6, percentage: 33 },
    { category: "Stack", solved: 5, total: 7, percentage: 71 },
  ],
  difficultyProgress: [
    { difficulty: "Easy", solved: 15, total: 25, percentage: 60 },
    { difficulty: "Medium", solved: 8, total: 20, percentage: 40 },
    { difficulty: "Hard", solved: 1, total: 5, percentage: 20 },
  ],
  achievements: [
    {
      id: 1,
      title: "First Steps",
      description: "Solved your first problem",
      earned: true,
      date: "2024-12-10",
    },
    {
      id: 2,
      title: "Problem Solver",
      description: "Solved 10 problems",
      earned: true,
      date: "2024-12-15",
    },
    {
      id: 3,
      title: "Streak Master",
      description: "5-day solving streak",
      earned: true,
      date: "2024-12-18",
    },
    {
      id: 4,
      title: "Speed Demon",
      description: "Solved a problem in under 5 minutes",
      earned: false,
      date: null,
    },
    {
      id: 5,
      title: "Category Expert",
      description: "Solved 10 problems in one category",
      earned: false,
      date: null,
    },
    {
      id: 6,
      title: "Hard Worker",
      description: "Solved a hard problem",
      earned: true,
      date: "2024-12-16",
    },
  ],
};

export const CodeProgress = ({ stats }: CodeProgressProps) => {
  const completionPercentage = Math.round(
    (stats.problemsSolved / stats.totalProblems) * 100
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400";
      case "Medium":
        return "text-yellow-400";
      case "Hard":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Overall Progress
          </CardTitle>
          <CardDescription>Your coding journey so far</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Problems Solved</span>
              <span className="font-medium">
                {stats.problemsSolved} / {stats.totalProblems}
              </span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {completionPercentage}% complete
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.streak}
              </div>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {Math.floor(stats.totalTime / 60)}h
              </div>
              <p className="text-xs text-muted-foreground">Total Time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Progress */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Progress by Category
          </CardTitle>
          <CardDescription>
            Track your progress across different problem categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockProgressData.categoryProgress.map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{category.category}</span>
                  <span className="font-medium">
                    {category.solved} / {category.total}
                  </span>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Progress */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progress by Difficulty
          </CardTitle>
          <CardDescription>
            Challenge yourself with harder problems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockProgressData.difficultyProgress.map((difficulty) => (
              <div key={difficulty.difficulty} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={getDifficultyColor(difficulty.difficulty)}>
                    {difficulty.difficulty}
                  </span>
                  <span className="font-medium">
                    {difficulty.solved} / {difficulty.total}
                  </span>
                </div>
                <Progress value={difficulty.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your coding activity over the past week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockProgressData.recentActivity.map((activity) => (
              <div
                key={activity.date}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">
                    {new Date(activity.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CheckCircle className="h-3 w-3" />
                    {activity.problemsSolved} problems
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {activity.timeSpent}m
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
          <CardDescription>Unlock badges as you progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {mockProgressData.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  achievement.earned
                    ? "bg-primary/20 border border-primary/30"
                    : "bg-muted/30 border border-border opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      achievement.earned ? "bg-primary/30" : "bg-muted/50"
                    }`}
                  >
                    {achievement.earned ? (
                      <Trophy className="h-4 w-4 text-primary" />
                    ) : (
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      {achievement.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {achievement.description}
                    </div>
                  </div>
                </div>
                {achievement.earned ? (
                  <Badge variant="default" className="text-xs">
                    Earned
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Locked
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
