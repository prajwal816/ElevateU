import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getLeaderboard } from "@/lib/apiService";

interface CourseLeaderboardProps {
  courseId: string;
}

export const CourseLeaderboard = ({ courseId }: CourseLeaderboardProps) => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [courseId]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await getLeaderboard(20, "Student");
      setLeaderboard(data);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="course-leaderboard">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Trophy className="h-5 w-5" />
        Course Leaderboard
      </h3>
      
      {leaderboard.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No leaderboard data yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>XP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry, index) => (
                  <TableRow key={entry._id} data-testid={`leaderboard-row-${index}`}>
                    <TableCell className="font-medium">
                      {index === 0 && <Trophy className="inline h-4 w-4 text-yellow-500 mr-1" />}
                      {index + 1}
                    </TableCell>
                    <TableCell>{entry.name}</TableCell>
                    <TableCell>{entry.xp || 0} XP</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};