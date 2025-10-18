import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MessageSquare, Plus, Loader2 } from "lucide-react";
import { getEnrolledCourses, replyToPost } from "@/lib/apiService";
import apiClient from "@/lib/apiService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const Forum = () => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Get enrolled courses for students
      const enrolledData = await getEnrolledCourses();
      setCourses(enrolledData);

      // Load forum posts for all enrolled courses
      if (enrolledData.length > 0) {
        const allPosts: any[] = [];
        for (const enrollment of enrolledData) {
          if (enrollment.course?._id) {
            try {
              const posts = await apiClient.get(
                `/forum/${enrollment.course._id}`
              );
              allPosts.push(
                ...posts.data.map((p: any) => ({
                  ...p,
                  courseName: enrollment.course.title,
                }))
              );
            } catch (error) {
              console.error(
                `Failed to load posts for course ${enrollment.course._id}`,
                error
              );
            }
          }
        }
        setDiscussions(allPosts);
      }
    } catch (error) {
      console.error("Failed to load forum data:", error);
      toast({
        title: "Error",
        description: "Failed to load forum discussions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourse) {
      toast({
        title: "Error",
        description: "Please select a course",
        variant: "destructive",
      });
      return;
    }

    if (!newPost.title || !newPost.content) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post(`/forum/${selectedCourse}`, newPost);
      toast({
        title: "Success",
        description: "Discussion posted successfully",
      });
      setShowCreateModal(false);
      setNewPost({ title: "", content: "" });
      setSelectedCourse("");
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleReplies = (postId: string) => {
    setOpenPostId((curr) => (curr === postId ? null : postId));
  };

  const handleSubmitReply = async (postId: string) => {
    const content = (replyText[postId] || "").trim();
    if (!content) {
      toast({
        title: "Error",
        description: "Reply cannot be empty",
        variant: "destructive",
      });
      return;
    }
    try {
      setSubmitting(true);
      await replyToPost(postId, content);
      setReplyText((m) => ({ ...m, [postId]: "" }));
      // refresh forum data to reflect new reply
      await loadData();
      setOpenPostId(postId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add reply",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      userRole={user?.role === "Teacher" ? "teacher" : "student"}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Course Forum
            </h1>
            <p className="text-muted-foreground">
              Discuss topics, ask questions, and collaborate with peers.
            </p>
          </div>
          <Button
            className="gap-2"
            onClick={() => setShowCreateModal(true)}
            data-testid="new-discussion-btn"
          >
            <Plus className="h-4 w-4" />
            New Discussion
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : discussions.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Discussions Yet</h3>
              <p className="text-muted-foreground">
                Be the first to start a discussion! Click "New Discussion" to
                get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <Card
                key={discussion._id}
                className="hover:shadow-lg transition-shadow"
                data-testid="discussion-card"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">
                          {discussion.courseName || "Course"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(discussion.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <CardTitle className="text-lg mb-2 hover:text-primary transition-colors">
                        {discussion.title}
                      </CardTitle>
                      <CardDescription>{discussion.content}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {discussion.author?.name?.charAt(0).toUpperCase() ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {discussion.author?.name || "Anonymous"}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                        onClick={() => handleToggleReplies(discussion._id)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{discussion.replies?.length || 0} replies</span>
                      </button>
                    </div>
                  </div>

                  {openPostId === discussion._id && (
                    <div className="mt-4 space-y-4">
                      <div className="space-y-3">
                        {(discussion.replies || []).map((r: any) => (
                          <div key={r._id} className="rounded-md border p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {r.author?.name?.charAt(0).toUpperCase() ||
                                    "U"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">
                                {r.author?.name || "Anonymous"}
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {new Date(r.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm">{r.content}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-start gap-2">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyText[discussion._id] || ""}
                          onChange={(e) =>
                            setReplyText((m) => ({
                              ...m,
                              [discussion._id]: e.target.value,
                            }))
                          }
                        />
                        <Button
                          disabled={submitting}
                          onClick={() => handleSubmitReply(discussion._id)}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Replying...
                            </>
                          ) : (
                            "Reply"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Discussion Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent data-testid="create-discussion-modal">
          <DialogHeader>
            <DialogTitle>Start a New Discussion</DialogTitle>
            <DialogDescription>
              Share your questions or ideas with the class
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Course</label>
              <select
                className="w-full p-2 border rounded-md bg-background text-foreground border-input focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                required
                data-testid="course-select"
              >
                <option value="">-- Select a course --</option>
                {courses.map((enrollment: any) => (
                  <option
                    key={enrollment.course?._id}
                    value={enrollment.course?._id}
                  >
                    {enrollment.course?.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Discussion title..."
                value={newPost.title}
                onChange={(e) =>
                  setNewPost({ ...newPost, title: e.target.value })
                }
                required
                data-testid="title-input"
              />
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="What would you like to discuss?"
                className="min-h-[150px]"
                value={newPost.content}
                onChange={(e) =>
                  setNewPost({ ...newPost, content: e.target.value })
                }
                required
                data-testid="content-input"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1"
                data-testid="submit-post-btn"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post Discussion"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Forum;
