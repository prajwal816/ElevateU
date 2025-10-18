import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, BookOpen, Loader2, Plus } from "lucide-react";
import { getAssignments } from "@/lib/apiService";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const TeacherAssignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await getAssignments();
      setAssignments(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="teacher">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="teacher">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="teacher-assignments-title">
              My Assignments
            </h1>
            <p className="text-muted-foreground">View and manage all assignments across your courses.</p>
          </div>
          <Button onClick={() => navigate("/teacher/courses")} data-testid="create-assignment-btn">
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </div>

        {assignments.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Assignments</h3>
              <p className="text-muted-foreground">
                You haven't created any assignments yet. Go to your courses to create one.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <Card
                key={assignment._id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/teacher/courses/${assignment.course?._id}`)}
                data-testid={`assignment-card-${assignment._id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {assignment.course?.title || "Unknown Course"}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {assignment.description || "No description provided"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="font-medium">{assignment.maxPoints || 100}</span> points
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherAssignments;