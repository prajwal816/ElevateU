import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import heroImage1 from "@/assets/hero-bg.jpg";
import heroImage2 from "@/assets/hero-bg-2.jpg";
import heroImage3 from "@/assets/hero-bg-3.jpg";
import { useEffect, useState } from "react";

const slides = [
  {
    image: heroImage1,
    title: "Start Learning From Best Institutions",
    description:
      "Access thousands of courses from top universities and industry experts. Learn at your own pace with our flexible online learning platform.",
  },
  {
    image: heroImage2,
    title: "Advance Your Career with In-Demand Skills",
    description:
      "Master the skills employers are looking for. Get certified in technology, business, and creative fields with our comprehensive course library.",
  },
  {
    image: heroImage3,
    title: "Unlock Your Potential Today",
    description:
      "Join millions of learners worldwide. Track your progress, earn certificates, and achieve your educational goals with our cutting-edge platform.",
  },
];

const Hero = () => {
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });

    // Auto-play functionality
    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <section className="relative">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="relative h-[600px] flex items-center">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="absolute inset-0 bg-[hsl(var(--hero-overlay))]" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                  <div className="max-w-3xl">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
                      {slide.title.split(" ").map((word, i, arr) => {
                        if (
                          (index === 0 && i >= arr.length - 2) ||
                          (index === 1 && i >= arr.length - 2) ||
                          (index === 2 && i >= arr.length - 2)
                        ) {
                          return (
                            <span key={i} className="text-secondary">
                              {word}{" "}
                            </span>
                          );
                        }
                        return word + " ";
                      })}
                    </h1>

                    <p className="text-lg text-foreground/90 mb-8 max-w-2xl">
                      {slide.description}
                    </p>

                    <Button size="lg" variant="secondary">
                      Enroll Now
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="absolute bottom-8 right-8 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              current === index ? "bg-primary" : "bg-foreground/30"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
