import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  BarChart3,
  MessageSquare,
  Bell,
  Trophy,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import {
  getCourseById,
  getCourseAnnouncements,
  getForumPosts,
  getEnrolledCourses,
} from "@/lib/apiService";
import { toast } from "@/hooks/use-toast";
import { StudentCourseContent } from "@/components/student/StudentCourseContent";
import { StudentCourseGrades } from "@/components/student/StudentCourseGrades";
import { StudentCourseDiscussion } from "@/components/student/StudentCourseDiscussion";
import { StudentCourseAnnouncements } from "@/components/student/StudentCourseAnnouncements";
import { StudentCourseLeaderboard } from "@/components/student/StudentCourseLeaderboard";

const StudentCourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const [courseData, enrollmentsData] = await Promise.all([
        getCourseById(courseId!),
        getEnrolledCourses(),
      ]);
      setCourse(courseData);

      // Find the enrollment for this course
      const enrollment = enrollmentsData.find(
        (enrollment: any) => enrollment.course?._id === courseId
      );
      if (enrollment) {
        setEnrollmentId(enrollment._id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load course",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="student">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout userRole="student">
        <div className="text-center p-8">
          <p>Course not found</p>
          <Button onClick={() => navigate("/courses")} className="mt-4">
            Back to Courses
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate("/courses")}
            className="mb-4"
            data-testid="back-to-courses-btn"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Courses
          </Button>
          <h1
            className="text-3xl font-bold text-foreground mb-2"
            data-testid="course-title"
          >
            {course.title}
          </h1>
          <p className="text-muted-foreground">
            Taught by {course.teacher?.name || "Unknown Instructor"}
          </p>
        </div>

        <Tabs defaultValue="content" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="content" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="grades" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Grades
            </TabsTrigger>
            <TabsTrigger value="discussion" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Discussion
            </TabsTrigger>
            <TabsTrigger value="announcements" className="gap-2">
              <Bell className="h-4 w-4" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <StudentCourseContent
              courseId={courseId!}
              units={course.units || []}
              enrollmentId={enrollmentId || undefined}
            />
          </TabsContent>
          <TabsContent value="grades">
            <StudentCourseGrades courseId={courseId!} />
          </TabsContent>
          <TabsContent value="discussion">
            <StudentCourseDiscussion courseId={courseId!} />
          </TabsContent>
          <TabsContent value="announcements">
            <StudentCourseAnnouncements courseId={courseId!} />
          </TabsContent>
          <TabsContent value="leaderboard">
            <StudentCourseLeaderboard courseId={courseId!} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default StudentCourseDetail;
