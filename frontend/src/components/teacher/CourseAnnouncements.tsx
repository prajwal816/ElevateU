import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getCourseAnnouncements, createAnnouncement, deleteAnnouncement } from "@/lib/apiService";

interface CourseAnnouncementsProps {
  courseId: string;
}

export const CourseAnnouncements = ({ courseId }: CourseAnnouncementsProps) => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
  const [submitting, setSubmitting] = useState(false);

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

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await createAnnouncement(courseId, newAnnouncement);
      toast({ title: "Success", description: "Announcement created successfully" });
      setNewAnnouncement({ title: "", content: "" });
      setShowNew(false);
      loadAnnouncements();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create announcement",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      await deleteAnnouncement(id);
      toast({ title: "Success", description: "Announcement deleted successfully" });
      loadAnnouncements();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete announcement",
        variant: "destructive",
      });
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
    <div className="space-y-4" data-testid="course-announcements">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Announcements</h3>
        <Button onClick={() => setShowNew(!showNew)} data-testid="add-announcement-btn">
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {showNew && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Enter announcement title..."
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                data-testid="new-announcement-title"
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                placeholder="Enter announcement content..."
                rows={4}
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                data-testid="new-announcement-content"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateAnnouncement} disabled={submitting} data-testid="save-announcement-btn">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Post Announcement
              </Button>
              <Button variant="outline" onClick={() => setShowNew(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {announcements.length === 0 && !showNew ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No announcements yet. Click "New Announcement" to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <Card key={announcement._id} data-testid={`announcement-${announcement._id}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{announcement.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      by {announcement.teacher?.name} • {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteAnnouncement(announcement._id)}
                    data-testid={`delete-announcement-btn-${announcement._id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <p className="text-sm whitespace-pre-wrap">{announcement.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};