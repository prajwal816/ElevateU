import Hero from "@/components/landing/Hero";
import AboutSection from "@/components/landing/AboutSection";
import TrendingCourses from "@/components/landing/TrendingCourses";
import StudyAnywhere from "@/components/landing/StudyAnywhere";
import UpcomingEvents from "@/components/landing/UpcomingEvents";
import Newsletter from "@/components/landing/Newsletter";
import Chatbot from "@/components/landing/Chatbot";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <AboutSection />
      <TrendingCourses />
      <StudyAnywhere />
      {/*
      <UpcomingEvents />
      <Newsletter />
      */}
      <Chatbot />
    </div>
  );
};

export default Index;
