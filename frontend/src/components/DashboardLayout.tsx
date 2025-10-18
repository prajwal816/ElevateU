import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { LogOut, User, Bell, Award, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardLayout({
  children,
  userRole = "student",
}: {
  children: React.ReactNode;
  userRole?: "student" | "teacher";
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar userRole={userRole} />

        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-white/10 glass-card flex items-center justify-between px-6">
            <SidebarTrigger />

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {userRole === "teacher" ? "Teacher" : "Student"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => navigate("/settings?section=profile")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/settings?section=notifications")}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/settings?section=badges")}
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Badges & XP
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/settings?section=help")}
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
