import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  FileText,
  CheckCircle,
  Plus,
  Loader2,
} from "lucide-react";
import { CreateCourseModal } from "@/components/teacher/CreateCourseModal";
import { getTeacherCourses } from "@/lib/apiService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    activeCourses: 0,
    totalStudents: 0,
    pendingGrading: 0,
    gradedThisWeek: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const coursesData = await getTeacherCourses();
      setMyCourses(coursesData);

      // Calculate stats - enrolledCount is now returned from API
      const totalStudents = coursesData.reduce((sum: number, course: any) => {
        return sum + (course.enrolledCount || 0);
      }, 0);

      setStats({
        activeCourses: coursesData.filter((c: any) => c.isPublished).length,
        totalStudents,
        pendingGrading: 0, // Would need assignment/submission data
        gradedThisWeek: 0,
      });
    } catch (error: any) {
      console.error("Failed to load dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load some dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1
              className="text-3xl font-bold text-foreground mb-2"
              data-testid="teacher-dashboard-title"
            >
              Welcome back, {user?.name || "Teacher"}! 👨‍🏫
            </h1>
            <p className="text-muted-foreground">
              Manage your courses and student progress.
            </p>
          </div>
          <Button
            className="gap-2"
            onClick={() => setShowCreateModal(true)}
            data-testid="create-course-btn"
          >
            <Plus className="h-4 w-4" />
            Create New Course
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="stat-card-orange border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Active Courses
              </CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold"
                data-testid="active-courses-count"
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stats.activeCourses
                )}
              </div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>

          <Card className="stat-card-orange border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold"
                data-testid="total-students-count"
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stats.totalStudents
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all courses
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card-orange border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Grading
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-warning" />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold"
                data-testid="pending-grading-count"
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stats.pendingGrading
                )}
              </div>
              <p className="text-xs text-warning">Needs attention</p>
            </CardContent>
          </Card>

          <Card className="stat-card-orange border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Graded This Week
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold"
                data-testid="graded-week-count"
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stats.gradedThisWeek
                )}
              </div>
              <p className="text-xs text-success">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* My Courses */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
            <CardDescription>Courses you're currently teaching</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : myCourses.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No courses yet. Click "Create New Course" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myCourses.map((course) => (
                  <div
                    key={course._id}
                    className="glass-card-orange border-white/5 rounded-lg p-4"
                    data-testid={`course-item-${course._id}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {course.description || "No description"}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {course.enrolledCount || 0} students
                          </span>
                          <span>
                            {course.duration
                              ? `${course.duration} weeks`
                              : "N/A"}
                          </span>
                          <span>{course.level || "Beginner"}</span>
                        </div>
                      </div>
                      <Badge
                        variant={course.isPublished ? "default" : "outline"}
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate(`/teacher/courses/${course._id}`)
                        }
                        data-testid={`manage-course-btn-${course._id}`}
                      >
                        Manage Course
                      </Button>
                    </div>
                  </div>
                ))}{" "}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Modals */}
      <CreateCourseModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCourseCreated={loadDashboardData}
      />
    </DashboardLayout>
  );
};

export default TeacherDashboard;
