import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, Clock, TrendingUp, Loader2 } from "lucide-react";
import { StudyHoursChart } from "@/components/dashboard/StudyHoursChart";
import { WeekCalendar } from "@/components/dashboard/WeekCalendar";
import { Timetable } from "@/components/dashboard/Timetable";
import { TodoList } from "@/components/dashboard/TodoList";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { useStudySessionTracker } from "@/hooks/useStudySessionTracker";
import { getEnrolledCourses, getAssignments, getMyGrades, getMyRank } from "@/lib/apiService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<any[]>([]);
  const [recentGrades, setRecentGrades] = useState<any[]>([]);
  const [stats, setStats] = useState({
    coursesCount: 0,
    assignmentsDue: 0,
    avgGrade: 0,
    studyHours: 0,
    xp: 0,
  });
  const [loading, setLoading] = useState(true);

  // Start study session tracking
  useStudySessionTracker();

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [coursesData, assignmentsData, gradesData, rankData] = await Promise.all([
        getEnrolledCourses().catch(() => []),
        getAssignments().catch(() => []),
        user?._id ? getMyGrades(user._id).catch(() => []) : Promise.resolve([]),
        getMyRank().catch(() => ({ xp: 0 })),
      ]);

      setEnrolledCourses(coursesData);
      
      // Filter upcoming assignments (not submitted yet)
      const upcoming = assignmentsData
        .filter((a: any) => new Date(a.dueDate) > new Date())
        .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);
      setUpcomingAssignments(upcoming);

      // Recent grades
      const recent = gradesData.slice(0, 5);
      setRecentGrades(recent);

      // Calculate stats
      const avgGrade = gradesData.length > 0
        ? gradesData.reduce((sum: number, g: any) => sum + (g.grade || 0), 0) / gradesData.length
        : 0;
      
      const assignmentsDueThisWeek = assignmentsData.filter((a: any) => {
        const dueDate = new Date(a.dueDate);
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return dueDate >= new Date() && dueDate <= weekFromNow;
      }).length;

      setStats({
        coursesCount: coursesData.length,
        assignmentsDue: assignmentsDueThisWeek,
        avgGrade: Math.round(avgGrade * 10) / 10,
        studyHours: 0, // Will be shown in chart
        xp: rankData.xp || 0,
      });
    } catch (error) {
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
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="dashboard-title">
            Welcome back, {user?.name || "Student"}! 👋
          </h1>
          <p className="text-muted-foreground">Here's what's happening with your courses today.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card 
            className="stat-card-orange border-white/10 cursor-pointer hover:border-primary/50 transition-colors" 
            onClick={() => navigate("/courses")}
            data-testid="enrolled-courses-card"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="enrolled-courses-count">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.coursesCount}
              </div>
              <p className="text-xs text-muted-foreground">Active this semester</p>
            </CardContent>
          </Card>

          <Card 
            className="stat-card-orange border-white/10 cursor-pointer hover:border-primary/50 transition-colors" 
            onClick={() => navigate("/assignments")}
            data-testid="assignments-due-card"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Assignments Due</CardTitle>
              <FileText className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="assignments-due-count">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.assignmentsDue}
              </div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card 
            className="stat-card-orange border-white/10 cursor-pointer hover:border-primary/50 transition-colors" 
            onClick={() => navigate("/grades")}
            data-testid="avg-grade-card"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Grade</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="avg-grade">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${stats.avgGrade}%`}
              </div>
              <p className="text-xs text-success">Keep it up!</p>
            </CardContent>
          </Card>

          <Card 
            className="stat-card-orange border-white/10 cursor-pointer hover:border-primary/50 transition-colors" 
            onClick={() => navigate("/calendar")}
            data-testid="total-xp-card"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total XP</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-xp">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.xp}
              </div>
              <p className="text-xs text-muted-foreground">Experience points</p>
            </CardContent>
          </Card>
        </div>

        {/* Study Hours Chart */}
        <StudyHoursChart />

        {/* Calendar and Timetable */}
        <div className="grid gap-6 md:grid-cols-2">
          <WeekCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          <Timetable selectedDate={selectedDate} />
        </div>

        {/* Todo List and Leaderboard */}
        <div className="grid gap-6 md:grid-cols-2">
          <TodoList />
          <Leaderboard />
        </div>
        {/* Enrolled Courses */}
        {!loading && enrolledCourses.length > 0 && (
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
            <CardDescription>Track your progress in enrolled courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enrolledCourses.map((enrollment: any) => (
                <div
                  key={enrollment._id}
                  className="glass-card-orange border-white/5 rounded-lg p-4 cursor-pointer"
                  data-testid="course-item"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {enrollment.course?.title || "Untitled Course"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {enrollment.course?.teacher?.name || "Unknown Instructor"}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-primary/20 border-primary/30 text-primary-foreground">
                      Active
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{enrollment.progress || 0}%</span>
                    </div>
                    <Progress value={enrollment.progress || 0} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming Assignments */}
          {!loading && upcomingAssignments.length > 0 && (
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>Upcoming Assignments</CardTitle>
              <CardDescription>Assignments due soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingAssignments.map((assignment: any) => (
                  <div
                    key={assignment._id}
                    className="glass-card-orange border-white/5 rounded-lg p-3 cursor-pointer"
                    data-testid="assignment-item"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm">{assignment.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {assignment.course?.title || "Unknown Course"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="default">Pending</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
          {/* Recent Grades */}
          {!loading && recentGrades.length > 0 && (
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>Recent Grades</CardTitle>
              <CardDescription>Your latest assignment results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentGrades.map((grade: any) => (
                  <div
                    key={grade._id}
                    className="glass-card-orange border-white/5 rounded-lg p-3 cursor-pointer"
                    data-testid="grade-item"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm">
                          {grade.submission?.assignment?.title || "Assignment"}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {grade.submission?.assignment?.course?.title || "Course"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(grade.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div
                        className={`text-2xl font-bold ${
                          grade.grade >= 90
                            ? "text-success"
                            : grade.grade >= 80
                            ? "text-primary"
                            : "text-warning"
                        }`}
                      >
                        {grade.grade}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
