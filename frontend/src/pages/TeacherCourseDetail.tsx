import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { CourseAssignments } from "@/components/teacher/CourseAssignments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  ClipboardList,
  MessageSquare,
  Bell,
  Trophy,
  ArrowLeft,
  Loader2,
  Edit,
  Globe,
  Lock,
} from "lucide-react";
import { getCourseById, updateCourse } from "@/lib/apiService";
import { toast } from "@/hooks/use-toast";
import { CourseContent } from "@/components/teacher/CourseContent";
import { CourseStudents } from "@/components/teacher/CourseStudents";
import { CourseAnnouncements } from "@/components/teacher/CourseAnnouncements";
import { CourseDiscussion } from "@/components/teacher/CourseDiscussion";
import { CourseLeaderboard } from "@/components/teacher/CourseLeaderboard";
import { ManageCourseModal } from "@/components/teacher/ManageCourseModal";

const TeacherCourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const data = await getCourseById(courseId!);
      setCourse(data);
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

  const handleTogglePublish = async () => {
    try {
      setPublishing(true);
      const formData = new FormData();
      formData.append("isPublished", String(!course.isPublished));

      await updateCourse(courseId!, formData);
      toast({
        title: "Success",
        description: `Course ${
          course.isPublished ? "unpublished" : "published"
        } successfully`,
      });
      loadCourse();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update course status",
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="teacher">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout userRole="teacher">
        <div className="text-center p-8">
          <p>Course not found</p>
          <Button
            onClick={() => navigate("/teacher/dashboard")}
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-6">
        {/* Header Section */}
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate("/teacher/dashboard")}
            className="mb-4"
            data-testid="back-to-dashboard-btn"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1
                  className="text-3xl font-bold text-foreground"
                  data-testid="course-title"
                >
                  {course.title}
                </h1>
                <Badge variant={course.isPublished ? "default" : "secondary"}>
                  {course.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {course.description || "No description"}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleTogglePublish}
                disabled={publishing}
                variant={course.isPublished ? "outline" : "default"}
                data-testid="toggle-publish-btn"
              >
                {publishing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {course.isPublished ? "Unpublishing..." : "Publishing..."}
                  </>
                ) : (
                  <>
                    {course.isPublished ? (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4 mr-2" />
                        Publish Course
                      </>
                    )}
                  </>
                )}
              </Button>

              <Button
                onClick={() => setShowEditModal(true)}
                variant="outline"
                data-testid="edit-course-btn"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="content" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="content" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="students" className="gap-2">
              <Users className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="assignments" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Assignments
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
            <CourseContent
              courseId={courseId!}
              units={course.units || []}
              onRefresh={loadCourse}
            />
          </TabsContent>

          <TabsContent value="students">
            <CourseStudents courseId={courseId!} />
          </TabsContent>

          <TabsContent value="assignments">
            <CourseAssignments courseId={courseId!} />
          </TabsContent>

          <TabsContent value="discussion">
            <CourseDiscussion courseId={courseId!} />
          </TabsContent>

          <TabsContent value="announcements">
            <CourseAnnouncements courseId={courseId!} />
          </TabsContent>

          <TabsContent value="leaderboard">
            <CourseLeaderboard courseId={courseId!} />
          </TabsContent>
        </Tabs>
      </div>

      {showEditModal && (
        <ManageCourseModal
          course={course}
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            loadCourse();
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default TeacherCourseDetail;
