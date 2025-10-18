import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Award, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getLeaderboard, getMyRank } from "@/lib/apiService";

interface StudentCourseLeaderboardProps {
  courseId: string;
}

export const StudentCourseLeaderboard = ({ courseId }: StudentCourseLeaderboardProps) => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myRank, setMyRank] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [courseId]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const [leaderboardData, rankData] = await Promise.all([
        getLeaderboard(20, "Student"),
        getMyRank(),
      ]);
      setLeaderboard(leaderboardData);
      setMyRank(rankData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load leaderboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Award className="h-5 w-5 text-amber-700" />;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="student-course-leaderboard">
      {myRank && (
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Rank</p>
                <p className="text-2xl font-bold">#{myRank.rank || "N/A"}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Your XP</p>
                <p className="text-2xl font-bold">{myRank.xp || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Course Leaderboard
          </h3>
          
          {leaderboard.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No leaderboard data yet.
            </p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry._id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    index < 3 ? "bg-muted/50" : "bg-background"
                  } border`}
                  data-testid={`leaderboard-entry-${index}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 text-center font-bold">
                      {getRankIcon(index) || <span>#{index + 1}</span>}
                    </div>
                    <div>
                      <p className="font-medium">{entry.name}</p>
                      <p className="text-xs text-muted-foreground">{entry.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{entry.xp || 0} XP</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};