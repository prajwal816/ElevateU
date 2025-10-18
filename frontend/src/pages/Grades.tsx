import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getMyGrades, getEnrolledCourses } from "@/lib/apiService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Award,
  FileText,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Grades = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [grades, setGrades] = useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<any>(null);
  const [stats, setStats] = useState({
    overallAvg: 0,
    coursesCount: 0,
    gradedAssignments: 0,
  });

  useEffect(() => {
    if (user?._id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gradesData, coursesData] = await Promise.all([
        getMyGrades(user!._id),
        getEnrolledCourses(),
      ]);

      setGrades(gradesData);
      setEnrolledCourses(coursesData);

      // Calculate stats
      const avgGrade =
        gradesData.length > 0
          ? gradesData.reduce((sum: number, g: any) => sum + g.grade, 0) /
            gradesData.length
          : 0;

      setStats({
        overallAvg: Math.round(avgGrade * 10) / 10,
        coursesCount: coursesData.length,
        gradedAssignments: gradesData.length,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load grades",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Group grades by course
  const gradesByCourse = enrolledCourses.map((enrollment) => {
    const courseGrades = grades.filter(
      (g: any) =>
        g.submission?.assignment?.course?._id === enrollment.course?._id ||
        g.submission?.assignment?.course === enrollment.course?._id
    );

    const avgGrade =
      courseGrades.length > 0
        ? courseGrades.reduce((sum: number, g: any) => sum + g.grade, 0) /
          courseGrades.length
        : 0;

    return {
      course: enrollment.course,
      grades: courseGrades,
      avgGrade: Math.round(avgGrade * 10) / 10,
    };
  });

  if (loading) {
    return (
      <DashboardLayout userRole="student">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        <div>
          <h1
            className="text-3xl font-bold text-foreground mb-2"
            data-testid="grades-title"
          >
            Grades & Feedback
          </h1>
          <p className="text-muted-foreground">
            Track your academic performance and view feedback.
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Average Grade
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className="text-3xl font-bold text-primary"
                data-testid="overall-avg-grade"
              >
                {stats.overallAvg}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all courses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Enrolled Courses
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="courses-count">
                {stats.coursesCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This semester
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Graded Assignments
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className="text-3xl font-bold"
                data-testid="graded-assignments"
              >
                {stats.gradedAssignments}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Course Grades Overview */}
        {gradesByCourse.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Grades Yet</h3>
              <p className="text-muted-foreground mb-4">
                Your grades will appear here once assignments are graded.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Course Grades</CardTitle>
                <CardDescription>
                  Your current standing in each course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {gradesByCourse.map((courseData, index) => {
                    if (!courseData.course) return null;
                    return (
                      <div
                        key={index}
                        className="border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() =>
                          navigate(`/courses/${courseData.course._id}`)
                        }
                        data-testid={`course-grade-${index}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {courseData.course.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {courseData.grades.length} assignments graded
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              {courseData.avgGrade}%
                            </div>
                            <Badge variant="secondary" className="mt-1">
                              {courseData.avgGrade >= 90
                                ? "A"
                                : courseData.avgGrade >= 80
                                ? "B"
                                : courseData.avgGrade >= 70
                                ? "C"
                                : courseData.avgGrade >= 60
                                ? "D"
                                : "F"}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Course Average
                            </span>
                            <span className="font-medium">
                              {courseData.avgGrade}%
                            </span>
                          </div>
                          <Progress value={courseData.avgGrade} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Grades Table */}
            {grades.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>All Grades</CardTitle>
                  <CardDescription>
                    Complete list of graded assignments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Assignment</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Feedback</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grades.map((grade, index) => (
                        <TableRow
                          key={grade._id || index}
                          data-testid={`grade-row-${index}`}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedGrade(grade)}
                        >
                          <TableCell className="font-medium">
                            {grade.submission?.assignment?.title ||
                              "Assignment"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {grade.submission?.assignment?.course?.title ||
                              "Unknown Course"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`font-semibold ${
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
                            {new Date(grade.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-2">
                              {grade.feedback ? (
                                <>
                                  <MessageSquare className="h-4 w-4 text-primary" />
                                  <span className="text-muted-foreground max-w-xs truncate">
                                    {grade.feedback}
                                  </span>
                                </>
                              ) : (
                                <span className="text-muted-foreground">
                                  No feedback
                                </span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
      {/* Grade Details Dialog */}
      {selectedGrade && (
        <Dialog
          open={!!selectedGrade}
          onOpenChange={() => setSelectedGrade(null)}
        >
          <DialogContent
            className="max-w-2xl"
            data-testid="grade-details-dialog"
          >
            <DialogHeader>
              <DialogTitle>Grade Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Assignment Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Assignment</p>
                  <p className="font-medium">
                    {selectedGrade.submission?.assignment?.title ||
                      "Assignment"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-medium">
                    {selectedGrade.submission?.assignment?.course?.title ||
                      "Unknown Course"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Graded On</p>
                  <p className="font-medium">
                    {new Date(selectedGrade.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Grade</p>
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-2xl font-bold ${
                        selectedGrade.grade >= 90
                          ? "text-success"
                          : selectedGrade.grade >= 80
                          ? "text-primary"
                          : selectedGrade.grade >= 70
                          ? "text-warning"
                          : "text-destructive"
                      }`}
                    >
                      {selectedGrade.grade}%
                    </p>
                    <Badge variant="secondary">
                      {selectedGrade.grade >= 90
                        ? "A"
                        : selectedGrade.grade >= 80
                        ? "B"
                        : selectedGrade.grade >= 70
                        ? "C"
                        : selectedGrade.grade >= 60
                        ? "D"
                        : "F"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Feedback Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Teacher's Feedback</h3>
                </div>
                <div className="p-4 bg-muted rounded-lg min-h-[100px]">
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedGrade.feedback || "No feedback provided"}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setSelectedGrade(null)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default Grades;
