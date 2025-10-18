import { Search, Star, Clock, Users, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { courses } from "@/data/courses";

const Navigation = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = courses.filter((course) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      course.title.toLowerCase().includes(query) ||
      course.instructor.toLowerCase().includes(query) ||
      course.level.toLowerCase().includes(query)
    );
  });

  return (
    <nav className="bg-background/50 backdrop-blur-md border-b border-border/30 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-orange-600 flex items-center justify-center">
                {/* ✅ Replaced the 'e' span with the GraduationCap icon */}
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">
                <span className="text-secondary">Ele</span>
                <span className="text-foreground">vateU</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Button
                variant="ghost"
                onClick={() => {
                  document.getElementById("trending-courses")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                Browse Courses
              </Button>
              <Link to="/login?role=teacher">
                <Button variant="ghost">For Teachers</Button>
              </Link>
              <Link to="/about">
                <Button variant="ghost">About Us</Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* ✅ FIXED LINKS */}
            <Link to="/login">
              <Button variant="secondary" className="hover:bg-secondary/90">
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary">Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Search Courses</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <Input
              placeholder="Search by course name, instructor, or level..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No courses found matching "{searchQuery}"
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredCourses.map((course) => (
                  <Card
                    key={course.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      setIsSearchOpen(false);
                      document
                        .getElementById("trending-courses")
                        ?.scrollIntoView({
                          behavior: "smooth",
                        });
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-32 h-24 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg line-clamp-2">
                              {course.title}
                            </h3>
                            <Badge className="ml-2">{course.level}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            by {course.instructor}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-secondary text-secondary" />
                              <span>{course.rating}</span>
                              <span>({course.reviews.toLocaleString()})</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{course.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{course.students.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navigation;
