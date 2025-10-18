import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// --- Page Imports ---
import Login from "./pages/Login";
import Register from "./pages/Register";
import GoogleCallback from "./pages/GoogleCallback";
import VerifyEmail from "./pages/VerifyEmail";
import VerifyNotice from "./pages/VerifyNotice";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import CourseList from "./pages/CourseList";
import ExploreCourses from "./pages/ExploreCourses";
import StudentCourseDetail from "./pages/StudentCourseDetail";
import TeacherCourseDetail from "./pages/TeacherCourseDetail";
import Assignments from "./pages/Assignments";
import TeacherAssignments from "./pages/TeacherAssignments";
import TeacherGrading from "./pages/TeacherGrading";
import Grades from "./pages/Grades";
import Forum from "./pages/Forum";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import LandingIndex from "./pages/landing/LandingIndex";
import AboutUs from "./pages/landing/AboutUs";

// --- Layout & Protected Route Imports ---
import LandingLayout from "./components/landing/LandingLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* --- Landing Pages (Public) --- */}
          <Route element={<LandingLayout />}>
            <Route path="/" element={<LandingIndex />} />
            <Route path="/about" element={<AboutUs />} />
          </Route>

          {/* --- Authentication Pages --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<VerifyEmail />} />
          <Route path="/verify/notice" element={<VerifyNotice />} />
          <Route path="/auth/callback" element={<GoogleCallback />} />

          {/* --- Protected Application Pages --- */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute requiredRole="Student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute requiredRole="Teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <CourseList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId"
            element={
              <ProtectedRoute>
                <StudentCourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/courses/:courseId"
            element={
              <ProtectedRoute requiredRole="Teacher">
                <TeacherCourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore-courses"
            element={
              <ProtectedRoute>
                <ExploreCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments"
            element={
              <ProtectedRoute requiredRole="Student">
                <Assignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/assignments"
            element={
              <ProtectedRoute requiredRole="Teacher">
                <TeacherAssignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/grading"
            element={
              <ProtectedRoute requiredRole="Teacher">
                <TeacherGrading />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/courses/:courseId"
            element={
              <ProtectedRoute requiredRole="Student">
                <StudentCourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grades"
            element={
              <ProtectedRoute>
                <Grades />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum"
            element={
              <ProtectedRoute>
                <Forum />
              </ProtectedRoute>
            }
          />

          {/* --- Catch-All Not Found Route --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
