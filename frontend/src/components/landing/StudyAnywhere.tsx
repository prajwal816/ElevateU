import studyImage from "@/assets/study-anywhere.jpg";

const StudyAnywhere = () => {
  return (
    <section className="py-20 bg-muted/30 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-4 h-4 rounded-full bg-secondary opacity-60" />
      <div className="absolute bottom-40 left-1/4 w-4 h-4 rounded-full bg-primary opacity-60" />
      <div className="absolute bottom-20 right-20 w-4 h-4 rounded-full bg-secondary opacity-60" />

      {/* Wavy lines */}
      <svg
        className="absolute top-1/2 right-0 -translate-y-1/2 opacity-30"
        width="600"
        height="400"
        viewBox="0 0 600 400"
        fill="none"
      >
        <path
          d="M600 200 Q 500 100, 400 200 T 200 200"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          fill="none"
        />
      </svg>
      <svg
        className="absolute bottom-0 left-0 opacity-30"
        width="400"
        height="200"
        viewBox="0 0 400 200"
        fill="none"
      >
        <path
          d="M0 100 Q 100 50, 200 100 T 400 100"
          stroke="hsl(var(--secondary))"
          strokeWidth="2"
          fill="none"
        />
      </svg>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="w-12 h-12 rounded-full bg-secondary mb-6" />
            <h2 className="text-5xl font-bold mb-8 leading-tight">
              Study whenever you want, from any place in the world.
            </h2>
          </div>

          <div className="relative">
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
              <img
                src={studyImage}
                alt="Student studying from home with headphones and laptop"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudyAnywhere;
