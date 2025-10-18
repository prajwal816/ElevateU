import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Reply, Send, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getForumPosts, createForumPost, replyToPost } from "@/lib/apiService";
import { useAuth } from "@/hooks/useAuth";

interface StudentCourseDiscussionProps {
  courseId: string;
}

export const StudentCourseDiscussion = ({ courseId }: StudentCourseDiscussionProps) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [courseId]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await getForumPosts(courseId);
      setPosts(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load discussions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await createForumPost(courseId, newPost);
      toast({ title: "Success", description: "Post created successfully" });
      setNewPost({ title: "", content: "" });
      setShowNewPost(false);
      loadPosts();
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

  const handleReply = async (postId: string) => {
    if (!replyContent.trim()) {
      toast({
        title: "Error",
        description: "Reply content is required",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await replyToPost(postId, replyContent);
      toast({ title: "Success", description: "Reply posted successfully" });
      setReplyContent("");
      setReplyTo(null);
      loadPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to post reply",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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
    <div className="space-y-4" data-testid="student-course-discussion">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Discussion Forum</h3>
        <Button onClick={() => setShowNewPost(!showNewPost)} data-testid="new-post-btn">
          <MessageSquare className="h-4 w-4 mr-2" />
          New Discussion
        </Button>
      </div>

      {showNewPost && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Discussion title..."
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                data-testid="new-post-title"
              />
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Share your thoughts..."
                rows={4}
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                data-testid="new-post-content"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreatePost} disabled={submitting} data-testid="submit-post-btn">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Post Discussion
              </Button>
              <Button variant="outline" onClick={() => setShowNewPost(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {posts.length === 0 && !showNewPost ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No discussions yet. Start one by clicking "New Discussion"!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post._id} data-testid={`forum-post-${post._id}`}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{post.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      by {post.author?.name} • {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm mb-3 ml-13">{post.content}</p>
                
                {post.replies && post.replies.length > 0 && (
                  <div className="ml-13 pl-4 border-l-2 border-muted space-y-2 mb-3">
                    {post.replies.map((reply: any) => (
                      <div key={reply._id} className="text-sm" data-testid={`reply-${reply._id}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Reply className="h-3 w-3" />
                          <span className="font-medium">{reply.author?.name}</span>
                          <span className="text-muted-foreground">
                            • {new Date(reply.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="ml-5">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {replyTo === post._id ? (
                  <div className="ml-13 space-y-2">
                    <Textarea
                      placeholder="Write your reply..."
                      rows={3}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      data-testid="reply-input"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReply(post._id)}
                        disabled={submitting}
                        data-testid="submit-reply-btn"
                      >
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Send className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setReplyTo(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setReplyTo(post._id)}
                    className="ml-13"
                    data-testid={`reply-btn-${post._id}`}
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};