import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getLeaderboard, getMyRank } from "@/lib/apiService";
import { Trophy, Medal, Award, Loader2 } from "lucide-react";

interface LeaderboardUser {
  rank: number;
  _id: string;
  name: string;
  email: string;
  xp: number;
  avatar?: string;
  role: string;
  badges: any[];
}

interface MyRank {
  rank: number;
  xp: number;
  name: string;
  badges: any[];
}

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [myRank, setMyRank] = useState<MyRank | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leaderboardData, rankData] = await Promise.all([
        getLeaderboard(10, "Student"),
        getMyRank(),
      ]);
      setLeaderboard(leaderboardData);
      setMyRank(rankData);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>Top students by XP</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>Top students by XP</CardDescription>
      </CardHeader>
      <CardContent>
        {/* My Rank */}
        {myRank && (
          <div className="glass-card-orange border-primary/30 rounded-lg p-4 mb-4" data-testid="my-rank-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                  {getRankIcon(myRank.rank)}
                </div>
                <div>
                  <p className="font-semibold">Your Rank</p>
                  <p className="text-sm text-muted-foreground\">{myRank.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{myRank.xp}</p>
                <p className="text-xs text-muted-foreground">XP</p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {leaderboard.map((user) => (
            <div
              key={user._id}
              className={`glass-card-orange border-white/5 rounded-lg p-3 hover:border-white/20 transition-colors ${
                user.rank <= 3 ? "border-primary/30" : ""
              }`}
              data-testid="leaderboard-item"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(user.rank)}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{user.xp}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </div>
              {user.badges && user.badges.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {user.badges.slice(0, 3).map((badge: any, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {badge.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};