// src/components/landing/LandingLayout.tsx

import { Outlet } from "react-router-dom";
import Navigation from "./Navigation"; // Your landing page navbar
import Footer from "./Footer"; // Your landing page footer

const LandingLayout = () => {
  return (
    <div className="landing-theme">
      {/* ✅ ADD THIS WRAPPER */}
      <Navigation />
      <main>
        {/* The Outlet component renders the specific page component for the current route */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default LandingLayout;
