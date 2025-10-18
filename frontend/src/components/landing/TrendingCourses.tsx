import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Users, Heart } from "lucide-react";
import { courses } from "@/data/courses";

const TrendingCourses = () => {
  return (
    <section id="trending-courses" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-2">
            Our <span className="text-secondary">Trending</span> Courses
          </h2>
          <p className="text-muted-foreground flex items-center gap-2">
            Check out most 🔥 courses in the market
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="group overflow-hidden border-border hover:shadow-xl transition-all duration-300"
            >
              <div className="relative overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white"
                >
                  <Heart className="w-4 h-4" />
                </Button>
                <Badge className="absolute top-4 left-4 bg-primary">
                  {course.level}
                </Badge>
              </div>

              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.students.toLocaleString()}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(course.rating)
                            ? "fill-secondary text-secondary"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">{course.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({course.reviews.toLocaleString()})
                  </span>
                </div>

                <div className="pt-4 border-t border-border">
                  <span className="text-sm text-muted-foreground">
                    by {course.instructor}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          {/*<Button variant="outline" size="lg" className="gap-2">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l5.35 5.35 10.035-10.035M16.023 9.348L10.674 14.697"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>*/}
        </div>
      </div>
    </section>
  );
};

export default TrendingCourses;
