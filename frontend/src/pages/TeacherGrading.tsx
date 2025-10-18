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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  User,
  Calendar,
  Loader2,
  ExternalLink,
  AlertTriangle,
  Shield,
} from "lucide-react";
import apiClient, {
  checkPlagiarism,
  getPlagiarismReports,
} from "@/lib/apiService";
import { toast } from "@/hooks/use-toast";

const TeacherGrading = () => {
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [checkingPlagiarism, setCheckingPlagiarism] = useState(false);
  const [plagiarismReports, setPlagiarismReports] = useState<any[]>([]);
  const [showPlagiarismDialog, setShowPlagiarismDialog] = useState(false);
  const [gradeData, setGradeData] = useState({
    grade: "",
    feedback: "",
  });

  useEffect(() => {
    loadPendingSubmissions();
  }, []);

  const loadPendingSubmissions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/grades/pending");
      setPendingSubmissions(response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load pending submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Check if selectedSubmission exists and has an _id
    if (!selectedSubmission || !selectedSubmission._id) {
      toast({
        title: "Error",
        description: "Invalid submission. Please try again.",
        variant: "destructive",
      });
      return;
    }
    if (
      !gradeData.grade ||
      parseFloat(gradeData.grade) < 0 ||
      parseFloat(gradeData.grade) > 100
    ) {
      toast({
        title: "Error",
        description: "Please enter a valid grade between 0 and 100",
        variant: "destructive",
      });
      return;
    }

    try {
      setGrading(true);
      await apiClient.post(`/grades/submission/${selectedSubmission._id}`, {
        grade: parseFloat(gradeData.grade),
        feedback: gradeData.feedback,
      });

      toast({
        title: "Success",
        description: "Assignment graded successfully",
      });

      setSelectedSubmission(null);
      setGradeData({ grade: "", feedback: "" });
      loadPendingSubmissions();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to grade submission",
        variant: "destructive",
      });
    } finally {
      setGrading(false);
    }
  };
  const handleCheckPlagiarism = async (assignmentId: string) => {
    try {
      setCheckingPlagiarism(true);
      await checkPlagiarism(assignmentId);
      toast({
        title: "Success",
        description: "Plagiarism check completed successfully",
      });
      loadPendingSubmissions();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to check plagiarism",
        variant: "destructive",
      });
    } finally {
      setCheckingPlagiarism(false);
    }
  };

  const handleViewPlagiarismReports = async (assignmentId: string) => {
    try {
      const reports = await getPlagiarismReports(assignmentId);
      setPlagiarismReports(reports);
      setShowPlagiarismDialog(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load plagiarism reports",
        variant: "destructive",
      });
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
        <div>
          <h1
            className="text-3xl font-bold text-foreground mb-2"
            data-testid="grading-title"
          >
            Grading
          </h1>
          <p className="text-muted-foreground">
            Review and grade student submissions.
          </p>
        </div>

        {pendingSubmissions.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                No Pending Submissions
              </h3>
              <p className="text-muted-foreground">
                All submissions have been graded. Great work!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingSubmissions.map((submission) => (
              <Card
                key={submission._id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedSubmission(submission)}
                data-testid={`submission-card-${submission._id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">Pending</Badge>
                    <Badge variant="outline">
                      {submission.assignment?.course?.title || "Course"}
                    </Badge>
                  </div>
                  {submission.plagiarismData?.hasPlagiarism && (
                    <div className="flex items-center gap-1 text-xs text-destructive mb-2">
                      <AlertTriangle className="h-3 w-3" />
                      <span>
                        Plagiarism detected (
                        {submission.plagiarismData.maxSimilarity}%)
                      </span>
                    </div>
                  )}
                  <CardTitle className="text-base">
                    {submission.assignment?.title || "Assignment"}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-2">
                    <User className="h-3 w-3" />
                    {submission.student?.name || "Unknown Student"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Submitted:{" "}
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Grading Dialog */}
      {selectedSubmission && (
        <Dialog
          open={!!selectedSubmission}
          onOpenChange={() => setSelectedSubmission(null)}
        >
          <DialogContent className="max-w-2xl" data-testid="grading-dialog">
            <DialogHeader>
              <DialogTitle>Grade Submission</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Student</p>
                  <p className="font-medium">
                    {selectedSubmission?.student?.name || "Unknown Student"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">
                    {selectedSubmission?.student?.email || "No email"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assignment</p>
                  <p className="font-medium">
                    {selectedSubmission?.assignment?.title ||
                      "Unknown Assignment"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-medium">
                    {selectedSubmission?.assignment?.course?.title ||
                      "Unknown Course"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="font-medium">
                    {selectedSubmission?.createdAt
                      ? new Date(
                          selectedSubmission.createdAt
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              {selectedSubmission.fileUrl && (
                <div>
                  <Label>Submitted File</Label>
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() =>
                      window.open(selectedSubmission.fileUrl, "_blank")
                    }
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Submission
                  </Button>
                </div>
              )}
              {/* Plagiarism Status */}
              <div className="space-y-2">
                <Label>Plagiarism Check</Label>
                {selectedSubmission.plagiarismChecked ? (
                  <div className="space-y-2">
                    {selectedSubmission.plagiarismData?.hasPlagiarism ? (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-destructive">
                            Plagiarism Detected (
                            {selectedSubmission.plagiarismData.maxSimilarity}%)
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Similar content found in other submissions
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-success/10 border border-success/20 rounded-lg p-3 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-success" />
                        <p className="text-sm font-medium text-success">
                          No plagiarism detected
                        </p>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPlagiarismReports(
                          selectedSubmission.assignment._id
                        );
                      }}
                    >
                      View Detailed Report
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCheckPlagiarism(selectedSubmission.assignment._id);
                    }}
                    disabled={checkingPlagiarism}
                  >
                    {checkingPlagiarism ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Run Plagiarism Check
                      </>
                    )}
                  </Button>
                )}
              </div>
              <form onSubmit={handleGradeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade (0-100) *</Label>
                  <Input
                    id="grade"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={gradeData.grade}
                    onChange={(e) =>
                      setGradeData({ ...gradeData, grade: e.target.value })
                    }
                    placeholder="Enter grade"
                    required
                    data-testid="grade-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback</Label>
                  <Textarea
                    id="feedback"
                    value={gradeData.feedback}
                    onChange={(e) =>
                      setGradeData({ ...gradeData, feedback: e.target.value })
                    }
                    placeholder="Provide feedback to the student..."
                    className="min-h-[120px]"
                    data-testid="feedback-input"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedSubmission(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={grading}
                    className="flex-1"
                    data-testid="submit-grade-btn"
                  >
                    {grading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Grading...
                      </>
                    ) : (
                      "Submit Grade"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* Plagiarism Reports Dialog */}
      {showPlagiarismDialog && (
        <Dialog
          open={showPlagiarismDialog}
          onOpenChange={() => setShowPlagiarismDialog(false)}
        >
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Plagiarism Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {plagiarismReports.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No plagiarism detected in the submissions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {plagiarismReports.map((report, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <p className="font-medium">{report.student}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {report.studentEmail}
                            </p>
                          </div>
                          <Badge
                            variant={
                              report.similarity > 50
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {report.similarity.toFixed(1)}% similar
                          </Badge>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm">
                            <span className="text-muted-foreground">
                              Matched with:
                            </span>{" "}
                            <span className="font-medium">
                              {report.matchedStudent}
                            </span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              <div className="flex justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowPlagiarismDialog(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default TeacherGrading;
