import { useState, useEffect } from "react";
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
  BookOpen,
} from "lucide-react";
import { codePracticeApi } from "@/lib/api";

interface CodeProgressProps {
  stats: {
    problemsSolved: number;
    totalProblems: number;
    streak: number;
    totalTime: number;
  };
}

export const CodeProgress = ({ stats }: CodeProgressProps) => {
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const response = await codePracticeApi.getUserProgress();
      setProgressData(response.data);
    } catch (error) {
      console.error("Failed to load progress data:", error);
    } finally {
      setLoading(false);
    }
  };

  const completionPercentage =
    stats.totalProblems > 0
      ? Math.round((stats.problemsSolved / stats.totalProblems) * 100)
      : 0;

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

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categoryStats = progressData?.categoryStats || [];
  const difficultyStats = progressData?.difficultyStats || [
    { difficulty: "Easy", solved: 0, total: 0, percentage: 0 },
    { difficulty: "Medium", solved: 0, total: 0, percentage: 0 },
    { difficulty: "Hard", solved: 0, total: 0, percentage: 0 },
  ];
  const dailyActivity = progressData?.dailyActivity || [];
  const achievements = progressData?.achievements || [];

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
      {categoryStats.length > 0 ? (
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
              {categoryStats.map((category: any) => (
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
      ) : (
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Progress by Category
            </CardTitle>
            <CardDescription>
              Start solving problems to see your category progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No problems solved yet</p>
              <p className="text-sm">
                Solve your first problem to start tracking progress!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
          {difficultyStats.some((d: any) => d.total > 0) ? (
            <div className="space-y-4">
              {difficultyStats.map((difficulty: any) => (
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No difficulty progress yet</p>
              <p className="text-sm">
                Start with Easy problems and work your way up!
              </p>
            </div>
          )}
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
          {dailyActivity.length > 0 ? (
            <div className="space-y-3">
              {dailyActivity.slice(0, 7).map((activity: any) => (
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">
                Start solving problems to see your activity here!
              </p>
            </div>
          )}
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
          {achievements.length > 0 ? (
            <div className="grid gap-3">
              {achievements.map((achievement: any) => (
                <div
                  key={achievement.achievementId}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    achievement.earnedAt
                      ? "bg-primary/20 border border-primary/30"
                      : "bg-muted/30 border border-border opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        achievement.earnedAt ? "bg-primary/30" : "bg-muted/50"
                      }`}
                    >
                      {achievement.earnedAt ? (
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
                  {achievement.earnedAt ? (
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No achievements yet</p>
              <p className="text-sm">
                Solve problems to unlock your first achievement!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
