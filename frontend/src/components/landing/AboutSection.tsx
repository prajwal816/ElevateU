import { Users, BookOpen, Clock, Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import aboutImage from "@/assets/about-video-call.jpg";

const features = [
  {
    icon: Users,
    title: "Learn with Experts",
    description:
      "Connect with industry professionals and experienced instructors who guide you through every step of your learning journey.",
    iconColor: "text-secondary", // ✅ This will now be ORANGE
    glowColor: "hover:shadow-secondary/20",
  },
  {
    icon: BookOpen,
    title: "Learn Anything",
    description:
      "Access a vast library of courses covering diverse topics from technology to business, arts to sciences.",
    iconColor: "text-primary", // ✅ This will now be BLUE
    glowColor: "hover:shadow-primary/20",
  },
  {
    icon: Clock,
    title: "Flexible Learning",
    description:
      "Study at your own pace with 24/7 access to course materials. Learn anytime, anywhere that suits your schedule.",
    iconColor: "text-emerald-500", // This is a specific color, so it remains unchanged
    glowColor: "hover:shadow-emerald-500/20",
  },
  {
    icon: Building,
    title: "Industrial Standards",
    description:
      "Gain skills and certifications that meet current industry standards and boost your career prospects.",
    iconColor: "text-secondary", // ✅ This will now be ORANGE
    glowColor: "hover:shadow-secondary/20",
  },
];

const AboutSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-2">
              Find Out More About us,{" "}
              <span className="text-secondary">ElevateU</span>{" "}
              {/* ✅ This will now be ORANGE */}
              insides.
            </h2>
            <div className="mt-8">
              <img
                src={aboutImage}
                alt="Online video learning with expert instructors"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className={`border border-border/50 bg-card/50 backdrop-blur-sm hover:border-border transition-all duration-300 hover:shadow-2xl ${feature.glowColor} group`}
              >
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <feature.icon
                      className={`w-12 h-12 ${feature.iconColor} transition-transform duration-300 group-hover:scale-110`}
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
