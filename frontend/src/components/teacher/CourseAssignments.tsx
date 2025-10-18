import { useState, useEffect } from "react";
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
  CheckCircle2,
  Clock,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  getCourseAssignments,
  getSubmissionsByAssignment,
  checkPlagiarism,
  getPlagiarismReports,
} from "@/lib/apiService";
import apiClient from "@/lib/apiService";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CourseAssignmentsProps {
  courseId: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  xpReward: number;
}

interface Submission {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  fileUrl: string;
  createdAt: string;
  plagiarismChecked: boolean;
  isDraft: boolean;
  comments: string;
  grade?: {
    grade: number;
    feedback: string;
    createdAt: string;
  };
}

export const CourseAssignments = ({ courseId }: CourseAssignmentsProps) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<{
    [key: string]: Submission[];
  }>({});
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [grading, setGrading] = useState(false);
  const [checkingPlagiarism, setCheckingPlagiarism] = useState(false);
  const [plagiarismReports, setPlagiarismReports] = useState<any[]>([]);
  const [showPlagiarismDialog, setShowPlagiarismDialog] = useState(false);
  const [gradeData, setGradeData] = useState({
    grade: "",
    feedback: "",
  });

  useEffect(() => {
    loadAssignments();
  }, [courseId]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await getCourseAssignments(courseId);
      setAssignments(data);

      // Load submissions for each assignment
      for (const assignment of data) {
        loadSubmissions(assignment._id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to load assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (assignmentId: string) => {
    try {
      const subs = await getSubmissionsByAssignment(assignmentId);

      // Fetch grades for each submission
      const subsWithGrades = await Promise.all(
        subs.map(async (sub: Submission) => {
          try {
            const gradeResponse = await apiClient.get(`/grades/pending`);
            // We'll check if this submission has a grade by checking the pending list
            const isPending = gradeResponse.data.some(
              (p: any) => p._id === sub._id
            );

            if (!isPending) {
              // Try to fetch the grade
              try {
                const studentGrades = await apiClient.get(
                  `/grades/student/${sub.student._id}`
                );
                const grade = studentGrades.data.find(
                  (g: any) => g.submission._id === sub._id
                );
                return { ...sub, grade: grade || null };
              } catch {
                return { ...sub, grade: null };
              }
            }
            return { ...sub, grade: null };
          } catch {
            return { ...sub, grade: null };
          }
        })
      );

      setSubmissions((prev) => ({ ...prev, [assignmentId]: subsWithGrades }));
    } catch (error: any) {
      console.error("Failed to load submissions:", error);
    }
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Safety: ensure we have a selected submission with a valid id
    if (!selectedSubmission || !selectedSubmission._id) {
      toast({
        title: "Error",
        description: "No submission selected to grade",
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

      // Reload all assignments and submissions
      loadAssignments();
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
      loadSubmissions(assignmentId);
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

  const getGradingStats = (assignmentId: string) => {
    const subs = submissions[assignmentId] || [];
    const graded = subs.filter((s) => s.grade).length;
    const total = subs.length;
    return {
      graded,
      total,
      percentage: total > 0 ? (graded / total) * 100 : 0,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="course-assignments">
      {assignments.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Assignments</h3>
            <p className="text-muted-foreground">
              No assignments have been created for this course yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {assignments.map((assignment) => {
            const stats = getGradingStats(assignment._id);
            const assignmentSubmissions = submissions[assignment._id] || [];

            return (
              <AccordionItem
                key={assignment._id}
                value={assignment._id}
                className="border rounded-lg"
              >
                <AccordionTrigger
                  className="px-6 hover:no-underline"
                  data-testid={`assignment-${assignment._id}`}
                >
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex flex-col items-start text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">
                          {assignment.title}
                        </h3>
                        {stats.total > 0 && (
                          <Badge
                            variant={
                              stats.graded === stats.total
                                ? "default"
                                : "secondary"
                            }
                          >
                            {stats.graded}/{stats.total} Graded
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due:{" "}
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                        <span>{assignment.maxPoints} points</span>
                        <span>
                          {assignmentSubmissions.length} submission
                          {assignmentSubmissions.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {stats.total > 0 && (
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <Progress value={stats.percentage} className="h-2" />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {Math.round(stats.percentage)}%
                        </span>
                      </div>
                    )}
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-6 pb-4">
                  <div className="space-y-3 mt-4">
                    {assignment.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {assignment.description}
                      </p>
                    )}

                    {assignmentSubmissions.length > 0 && (
                      <div className="flex gap-2 mb-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCheckPlagiarism(assignment._id)}
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleViewPlagiarismReports(assignment._id)
                          }
                        >
                          View Plagiarism Reports
                        </Button>
                      </div>
                    )}

                    {assignmentSubmissions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No submissions yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm mb-3">
                          Student Submissions
                        </h4>
                        {assignmentSubmissions.map((submission) => (
                          <Card
                            key={submission._id}
                            className="hover:shadow-md transition-shadow"
                            data-testid={`submission-${submission._id}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <User className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium">
                                        {submission.student.name}
                                      </span>
                                      {submission.isDraft && (
                                        <Badge variant="outline">Draft</Badge>
                                      )}
                                      {submission.plagiarismChecked && (
                                        <Badge variant="secondary">
                                          <Shield className="h-3 w-3 mr-1" />
                                          Checked
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {submission.student.email}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      Submitted:{" "}
                                      {new Date(
                                        submission.createdAt
                                      ).toLocaleString()}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {submission.fileUrl && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          window.open(
                                            submission.fileUrl,
                                            "_blank"
                                          )
                                        }
                                      >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View File
                                      </Button>
                                    )}

                                    {submission.grade ? (
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant="default"
                                          className="gap-1"
                                        >
                                          <CheckCircle2 className="h-3 w-3" />
                                          Graded: {submission.grade.grade}/100
                                        </Badge>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            setSelectedSubmission(submission);
                                            setGradeData({
                                              grade:
                                                submission.grade?.grade.toString() ||
                                                "",
                                              feedback:
                                                submission.grade?.feedback ||
                                                "",
                                            });
                                          }}
                                        >
                                          Edit Grade
                                        </Button>
                                      </div>
                                    ) : (
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          setSelectedSubmission(submission);
                                          setGradeData({
                                            grade: "",
                                            feedback: "",
                                          });
                                        }}
                                        data-testid={`grade-btn-${submission._id}`}
                                      >
                                        <Clock className="h-4 w-4 mr-2" />
                                        Grade Now
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      {/* Grading Dialog */}
      {selectedSubmission && (
        <Dialog
          open={!!selectedSubmission}
          onOpenChange={() => setSelectedSubmission(null)}
        >
          <DialogContent className="max-w-2xl" data-testid="grading-dialog">
            <DialogHeader>
              <DialogTitle>
                {selectedSubmission.grade ? "Edit Grade" : "Grade Submission"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Student</p>
                  <p className="font-medium">
                    {selectedSubmission.student?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">
                    {selectedSubmission.student?.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="font-medium">
                    {new Date(selectedSubmission.createdAt).toLocaleString()}
                  </p>
                </div>
                {selectedSubmission.comments && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">
                      Student Comments
                    </p>
                    <p className="font-medium">{selectedSubmission.comments}</p>
                  </div>
                )}
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
                        {selectedSubmission.grade
                          ? "Updating..."
                          : "Grading..."}
                      </>
                    ) : selectedSubmission.grade ? (
                      "Update Grade"
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
    </div>
  );
};
