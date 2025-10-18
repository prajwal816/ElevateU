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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Clock,
  Users,
  Star,
  BookOpen,
  CheckCircle,
  Target,
  Loader2,
} from "lucide-react";
import { getCourses, enrollInCourse, submitReview } from "@/lib/apiService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// Review Form Component
const ReviewForm = ({
  courseId,
  onReviewSubmitted,
}: {
  courseId: string;
  onReviewSubmitted: () => void;
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await submitReview(courseId, { rating, comment });
      toast({
        title: "Success",
        description: "Review submitted successfully",
      });
      setRating(0);
      setComment("");
      onReviewSubmitted();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || user.role !== "Student") {
    return null; // Only students can write reviews
  }

  return (
    <div className="border rounded-lg p-4 bg-muted/50">
      <h4 className="font-semibold mb-3">Write a Review</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground hover:text-yellow-400"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Comment (Optional)
          </label>
          <textarea
            className="w-full p-2 border rounded-md bg-background text-foreground"
            placeholder="Share your thoughts about this course..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          type="submit"
          disabled={submitting || rating === 0}
          className="w-full"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </Button>
      </form>
    </div>
  );
};

const ExploreCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [levelFilter, setLevelFilter] = useState<string>("all");

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchQuery, levelFilter, courses]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses({ published: true });
      setCourses(data);
      setFilteredCourses(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          course.teacher?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Level filter
    if (levelFilter !== "all") {
      filtered = filtered.filter((course) => course.level === levelFilter);
    }

    setFilteredCourses(filtered);
  };

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrolling(true);
      await enrollInCourse(courseId);
      toast({
        title: "Success",
        description: "Successfully enrolled in the course!",
      });
      setSelectedCourse(null);
      loadCourses();
      navigate("/courses");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to enroll",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <DashboardLayout
      userRole={user?.role === "Teacher" ? "teacher" : "student"}
    >
      <div className="space-y-6">
        <div>
          <h1
            className="text-3xl font-bold text-foreground mb-2"
            data-testid="explore-courses-title"
          >
            Explore Courses
          </h1>
          <p className="text-muted-foreground">
            Discover and enroll in new courses to expand your knowledge.
          </p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses by name, instructor, or topic..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="search-input"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={levelFilter === "all" ? "default" : "outline"}
                  onClick={() => setLevelFilter("all")}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={levelFilter === "Beginner" ? "default" : "outline"}
                  onClick={() => setLevelFilter("Beginner")}
                  size="sm"
                >
                  Beginner
                </Button>
                <Button
                  variant={
                    levelFilter === "Intermediate" ? "default" : "outline"
                  }
                  onClick={() => setLevelFilter("Intermediate")}
                  size="sm"
                >
                  Intermediate
                </Button>
                <Button
                  variant={levelFilter === "Advanced" ? "default" : "outline"}
                  onClick={() => setLevelFilter("Advanced")}
                  size="sm"
                >
                  Advanced
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">
                No courses found matching your criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <Card
                key={course._id}
                className="hover:shadow-lg transition-shadow"
                data-testid="course-card"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">
                      {course.level || "Beginner"}
                    </Badge>
                    <Badge variant="outline">
                      {course.category || "General"}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>
                    {course.teacher?.name || "Unknown Instructor"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{course.enrolledCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {course.duration ? `${course.duration} weeks` : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{course.averageRating?.toFixed(1) || "N/A"}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => setSelectedCourse(course)}
                    data-testid="preview-btn"
                  >
                    Preview Course
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Course Preview Modal */}
      {selectedCourse && (
        <Dialog
          open={!!selectedCourse}
          onOpenChange={() => setSelectedCourse(null)}
        >
          <DialogContent
            className="max-w-4xl max-h-[90vh] overflow-y-auto"
            data-testid="course-preview-modal"
          >
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {selectedCourse.title}
              </DialogTitle>
              <DialogDescription>
                By {selectedCourse.teacher?.name}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="about" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="outcomes">Learning Outcomes</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Course Description</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCourse.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Level</p>
                    <Badge>{selectedCourse.level || "Beginner"}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCourse.duration
                        ? `${selectedCourse.duration} weeks`
                        : "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Students Enrolled</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCourse.enrolledCount || 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Category</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCourse.category || "General"}
                    </p>
                  </div>
                </div>

                {selectedCourse.prerequisites &&
                  selectedCourse.prerequisites.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Prerequisites</h3>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {selectedCourse.prerequisites.map(
                          (prereq: string, idx: number) => (
                            <li key={idx}>{prereq}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </TabsContent>

              <TabsContent value="outcomes" className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    What You'll Learn
                  </h3>
                  {selectedCourse.outcomes &&
                  selectedCourse.outcomes.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedCourse.outcomes.map(
                        (outcome: string, idx: number) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm"
                          >
                            <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            <span>{outcome}</span>
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No learning outcomes specified for this course.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {selectedCourse.averageRating?.toFixed(1) || "N/A"}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= (selectedCourse.averageRating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedCourse.reviewCount || 0} reviews
                    </p>
                  </div>
                </div>

                {/* Review Form */}
                <ReviewForm
                  courseId={selectedCourse._id}
                  onReviewSubmitted={() => {
                    // Reload course data to get updated reviews
                    loadCourses();
                  }}
                />

                {selectedCourse.reviews && selectedCourse.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {selectedCourse.reviews.map((review: any, idx: number) => (
                      <div key={idx} className="border-b pb-4 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">
                              {review.student?.name || "Anonymous"}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${
                                    star <= review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-muted"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No reviews yet for this course.
                  </p>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setSelectedCourse(null)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => handleEnroll(selectedCourse._id)}
                disabled={enrolling}
                className="flex-1"
                data-testid="enroll-btn"
              >
                {enrolling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  "Enroll Now"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default ExploreCourses;
