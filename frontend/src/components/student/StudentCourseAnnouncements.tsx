import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getCourseAnnouncements } from "@/lib/apiService";

interface StudentCourseAnnouncementsProps {
  courseId: string;
}

export const StudentCourseAnnouncements = ({ courseId }: StudentCourseAnnouncementsProps) => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, [courseId]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await getCourseAnnouncements(courseId);
      setAnnouncements(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load announcements",
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
    <div className="space-y-4" data-testid="student-course-announcements">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Bell className="h-5 w-5" />
        Course Announcements
      </h3>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No announcements yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <Card key={announcement._id} data-testid={`announcement-${announcement._id}`}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Bell className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{announcement.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {announcement.teacher?.name} • {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{announcement.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};