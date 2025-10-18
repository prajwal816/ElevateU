import { Mail, Phone, MapPin, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom"; // ✅ Import the Link component

const Footer = () => {
  const handleScrollToCourses = () => {
    // This function will scroll to the trending courses section on the homepage
    setTimeout(() => {
      document.getElementById("trending-courses")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100); // A small delay ensures the page navigates first
  };

  return (
    <footer className="bg-[--landing-background] border-t border-[--landing-border]">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[--landing-secondary] rounded-lg flex items-center justify-center">
                {/* ✅ Replaced the 'E' span with the GraduationCap icon */}
                <GraduationCap className="h-6 w-6 text-[--landing-secondary-foreground]" />
              </div>
              <h3 className="text-xl font-bold">ElevateU</h3>
            </div>
            <p className="text-[--landing-muted-foreground] text-sm mb-6 leading-relaxed">
              Your premier platform for online learning. Connecting students
              worldwide through quality education and expert instruction.
            </p>

            {/* ✅ Social media icons section has been removed */}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/"
                  onClick={handleScrollToCourses}
                  className="text-[--landing-muted-foreground] hover:text-[--landing-foreground] transition-colors"
                >
                  Courses
                </Link>
              </li>
              {/* "Events" link is removed */}
              <li>
                <a
                  href="#"
                  className="text-[--landing-muted-foreground] hover:text-[--landing-foreground] transition-colors"
                >
                  Instructors
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Tools */}
          <div>
            <h4 className="font-bold text-lg mb-4">Support & Tools</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-[--landing-muted-foreground] hover:text-[--landing-foreground] transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[--landing-muted-foreground] hover:text-[--landing-foreground] transition-colors"
                >
                  FAQs
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[--landing-muted-foreground] hover:text-[--landing-foreground] transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Get In Touch */}
          <div>
            <h4 className="font-bold text-lg mb-4">Get In Touch</h4>
            <ul className="space-y-4 text-sm mb-6">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:elevateu570@gmail.com"
                  className="text-[--landing-muted-foreground] hover:text-[--landing-foreground] transition-colors"
                >
                  elevateu570@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <a
                  href="tel:+919245661111"
                  className="text-[--landing-muted-foreground] hover:text-[--landing-foreground] transition-colors"
                >
                  +919245661111
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-[--landing-muted-foreground]">
                  Andhra Pradesh, India
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[--landing-border] flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[--landing-muted-foreground]">
          <p>
            © 2025 ElevateU. All rights reserved. Made with ❤️ for education.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="hover:text-[--landing-foreground] transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-[--landing-foreground] transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
