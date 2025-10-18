import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getMyGrades } from "@/lib/apiService";
import { useAuth } from "@/hooks/useAuth";

interface StudentCourseGradesProps {
  courseId: string;
}

export const StudentCourseGrades = ({ courseId }: StudentCourseGradesProps) => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [avgGrade, setAvgGrade] = useState(0);

  useEffect(() => {
    if (user?._id) {
      loadGrades();
    }
  }, [courseId, user]);

  const loadGrades = async () => {
    try {
      setLoading(true);
      const allGrades = await getMyGrades(user!._id);
      // Filter grades for this course
      const courseGrades = allGrades.filter(
        (g: any) => g.submission?.assignment?.course === courseId
      );
      setGrades(courseGrades);
      
      // Calculate average
      if (courseGrades.length > 0) {
        const avg = courseGrades.reduce((sum: number, g: any) => sum + g.grade, 0) / courseGrades.length;
        setAvgGrade(Math.round(avg * 10) / 10);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load grades",
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
    <div className="space-y-4" data-testid="student-course-grades">
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Course Average</p>
            <p className="text-4xl font-bold" data-testid="avg-grade">
              {avgGrade}%
            </p>
          </div>
        </CardContent>
      </Card>

      {grades.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No grades available yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Feedback</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((grade) => (
                  <TableRow key={grade._id} data-testid={`grade-row-${grade._id}`}>
                    <TableCell className="font-medium">
                      {grade.submission?.assignment?.title || "Assignment"}
                    </TableCell>
                    <TableCell>
                      {new Date(grade.submission?.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-bold ${
                          grade.grade >= 90
                            ? "text-success"
                            : grade.grade >= 80
                            ? "text-primary"
                            : grade.grade >= 70
                            ? "text-warning"
                            : "text-destructive"
                        }`}
                      >
                        {grade.grade}%
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {grade.feedback || "No feedback"}
                    </TableCell>
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