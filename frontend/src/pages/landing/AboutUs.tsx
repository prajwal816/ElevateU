import { Brain, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import aboutImage from "@/assets/about-story-team.png";
import heroBg from "@/assets/hero-bg-2.jpg";

const AboutUs = () => {
  const values = [
    {
      icon: Brain,
      title: "Expert-Led Content",
      description:
        "We collaborate with industry leaders to create courses that are relevant, practical, and up-to-date.",
    },
    {
      icon: Clock,
      title: "Flexible & Accessible Learning",
      description:
        "Learn at your own pace, anytime, anywhere. Our platform is designed to fit your busy schedule.",
    },
    {
      icon: Users,
      title: "A Thriving Community",
      description:
        "Connect with fellow learners and instructors in our forums to share knowledge and grow together.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-[400px] flex items-center justify-center text-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, hsl(var(--hero-overlay)), hsl(var(--hero-overlay))), url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-4 z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            About Our <span className="text-secondary">Platform</span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground/90 max-w-3xl mx-auto">
            Empowering learners with accessible, high-quality education to help
            them achieve their personal and professional goals.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Our <span className="text-secondary">Story</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <img
                src={aboutImage}
                alt="Students collaborating online"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
            <div className="order-1 md:order-2">
              <p className="text-lg text-foreground/80 mb-6">
                Our Learning Management System was built with a simple but
                powerful vision: to make quality education accessible to
                everyone, everywhere. We believe that learning should never be
                limited by geography, schedule, or circumstance.
              </p>
              <p className="text-lg text-foreground/80 mb-6">
                Since our founding, we've partnered with expert instructors and
                industry professionals to create a diverse catalog of courses
                spanning technology, business, creative arts, and personal
                development. Each course is carefully crafted to deliver
                practical knowledge you can apply immediately.
              </p>
              <p className="text-lg text-foreground/80">
                We're committed to providing a flexible, supportive learning
                environment where students can grow at their own pace, connect
                with peers, and achieve their goals. Join thousands of learners
                who are already transforming their careers and lives through our
                platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">
            What We Believe In
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Our core values guide everything we do, from course selection to
            platform design.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={index}
                  className="text-center hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-secondary-foreground">
            Join Our Growing Community
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-secondary-foreground/80">
            Start your learning journey today and discover courses designed to
            help you reach your full potential.
          </p>
          <Link to="/#trending-courses">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-foreground text-background hover:bg-foreground/90"
              onClick={() => {
                setTimeout(() => {
                  document.getElementById("trending-courses")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }, 100);
              }}
            >
              Browse Courses
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
