import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MessageSquare, Reply } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getForumPosts, deleteForumPost } from "@/lib/apiService";

interface CourseDiscussionProps {
  courseId: string;
}

export const CourseDiscussion = ({ courseId }: CourseDiscussionProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await deleteForumPost(postId);
      toast({ title: "Success", description: "Post deleted successfully" });
      loadPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete post",
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
    <div className="space-y-4" data-testid="course-discussion">
      <h3 className="text-lg font-semibold">Discussion Forum ({posts.length} posts)</h3>
      
      {posts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No discussions yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post._id} data-testid={`forum-post-${post._id}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-semibold">{post.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        by {post.author?.name} • {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeletePost(post._id)}
                    data-testid={`delete-post-btn-${post._id}`}
                  >
                    Delete
                  </Button>
                </div>
                <p className="text-sm mb-3">{post.content}</p>
                {post.replies && post.replies.length > 0 && (
                  <div className="pl-6 space-y-2 border-l-2 border-muted">
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};