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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Calendar, Loader2, CheckCircle } from "lucide-react";
import {
  getAssignments,
  submitAssignment,
  updateSubmission,
} from "@/lib/apiService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [comments, setComments] = useState("");
  const [draftSubmission, setDraftSubmission] = useState<any>(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await getAssignments();
      setAssignments(data);
      if (data.length > 0) {
        setSelectedAssignment(data[0]);
        // Check for existing draft submission
        checkForDraftSubmission(data[0]);
      }
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

  const checkForDraftSubmission = async (assignment: any) => {
    try {
      // This would need to be implemented in the backend to get draft submissions
      // For now, we'll assume no draft exists
      setDraftSubmission(null);
    } catch (error) {
      console.error("Error checking for draft submission:", error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAssignment) {
      toast({
        title: "Error",
        description: "Please select an assignment",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("assignmentId", selectedAssignment._id);
      formData.append("isDraft", "false");
      if (comments) {
        formData.append("comments", comments);
      }

      await submitAssignment(formData);

      toast({
        title: "Success",
        description: "Assignment submitted successfully",
      });

      setSelectedFile(null);
      setComments("");
      setDraftSubmission(null);
      loadAssignments();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to submit assignment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedAssignment) {
      toast({
        title: "Error",
        description: "Please select an assignment",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingDraft(true);
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      formData.append("assignmentId", selectedAssignment._id);
      formData.append("isDraft", "true");
      if (comments) {
        formData.append("comments", comments);
      }

      const result = await submitAssignment(formData);
      setDraftSubmission(result);

      toast({
        title: "Success",
        description: "Draft saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save draft",
        variant: "destructive",
      });
    } finally {
      setSavingDraft(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="student">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        <div>
          <h1
            className="text-3xl font-bold text-foreground mb-2"
            data-testid="assignments-title"
          >
            Assignments
          </h1>
          <p className="text-muted-foreground">
            View and submit your course assignments.
          </p>
        </div>

        {assignments.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Assignments</h3>
              <p className="text-muted-foreground">
                You don't have any assignments yet. They will appear here once
                your instructors create them.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Assignment List */}
            <div className="lg:col-span-1 space-y-3">
              <h2 className="text-lg font-semibold">All Assignments</h2>
              {assignments.map((assignment) => (
                <Card
                  key={assignment._id}
                  className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedAssignment?._id === assignment._id
                      ? "border-primary"
                      : ""
                  }`}
                  onClick={() => setSelectedAssignment(assignment)}
                  data-testid={`assignment-card-${assignment._id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm">
                        {assignment.title}
                      </CardTitle>
                      <Badge
                        variant={assignment.submitted ? "secondary" : "default"}
                      >
                        {assignment.submitted ? "Submitted" : "Pending"}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      {assignment.course?.title || "Unknown Course"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Due:{" "}
                        {assignment.dueDate
                          ? new Date(assignment.dueDate).toLocaleDateString()
                          : "No due date"}
                      </span>
                    </div>
                    <div className="mt-2 text-xs">
                      <span className="font-medium">
                        {assignment.maxPoints || 100}
                      </span>{" "}
                      points
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Assignment Details & Submission */}
            <div className="lg:col-span-2 space-y-6">
              {selectedAssignment && (
                <>
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{selectedAssignment.title}</CardTitle>
                          <CardDescription>
                            {selectedAssignment.course?.title || "Course"}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            selectedAssignment.submitted
                              ? "secondary"
                              : "default"
                          }
                        >
                          {selectedAssignment.submitted
                            ? "Submitted"
                            : "Pending"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Due Date:
                          </span>
                          <p className="font-medium">
                            {selectedAssignment.dueDate
                              ? new Date(
                                  selectedAssignment.dueDate
                                ).toLocaleDateString()
                              : "No due date"}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Total Points:
                          </span>
                          <p className="font-medium">
                            {selectedAssignment.maxPoints || 100}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedAssignment.description ||
                            "No description provided"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {!selectedAssignment.submitted && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Submit Assignment</CardTitle>
                        <CardDescription>
                          Upload your assignment files
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="file-upload">Upload Files *</Label>
                            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
                              <input
                                id="file-upload"
                                type="file"
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.zip"
                              />
                              <label
                                htmlFor="file-upload"
                                className="cursor-pointer"
                              >
                                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground mb-1">
                                  {selectedFile
                                    ? selectedFile.name
                                    : "Click to upload or drag and drop"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  PDF, DOC, ZIP up to 10MB
                                </p>
                              </label>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="comments">
                              Additional Comments
                            </Label>
                            <Textarea
                              id="comments"
                              placeholder="Any additional notes or explanations..."
                              className="min-h-[80px]"
                              value={comments}
                              onChange={(e) => setComments(e.target.value)}
                              data-testid="assignment-comments"
                            />
                          </div>

                          <div className="flex gap-3">
                            <Button
                              type="submit"
                              className="flex-[2]"
                              disabled={submitting || !selectedFile}
                              data-testid="submit-assignment-btn"
                            >
                              {submitting ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Submit Assignment
                                </>
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleSaveDraft}
                              disabled={savingDraft}
                              className="flex-1"
                              data-testid="save-draft-btn"
                            >
                              {savingDraft ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                "Save Draft"
                              )}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {selectedAssignment.submitted && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Submission Status</CardTitle>
                        <CardDescription>
                          Your assignment has been submitted
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                          <p className="text-sm font-medium text-success flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Successfully submitted
                          </p>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          Your assignment is being reviewed. You'll receive
                          feedback and grade soon.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Assignments;
