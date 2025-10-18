import { Home, BookOpen, FileText, GraduationCap, MessageSquare, BarChart3, Calendar, Compass, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const studentItems = [
  { title: "Dashboard", url: "/student/dashboard", icon: Home },
  { title: "My Courses", url: "/courses", icon: BookOpen },
  { title: "Explore Courses", url: "/explore-courses", icon: Compass },
  { title: "Assignments", url: "/assignments", icon: FileText },
  { title: "Grades", url: "/grades", icon: BarChart3 },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Forum", url: "/forum", icon: MessageSquare },
  { title: "Settings", url: "/settings", icon: Settings },
];

const teacherItems = [
  { title: "Dashboard", url: "/teacher/dashboard", icon: Home },
  { title: "My Courses", url: "/courses", icon: BookOpen },
  { title: "Assignments", url: "/teacher/assignments", icon: FileText },
  { title: "Grading", url: "/teacher/grading", icon: BarChart3 },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar({ userRole = "student" }: { userRole?: "student" | "teacher" }) {
  const { open } = useSidebar();
  const items = userRole === "teacher" ? teacherItems : studentItems;

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarContent>
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-sidebar-foreground" />
            {open && <span className="font-bold text-xl text-sidebar-foreground">ElevateU</span>}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {userRole === "teacher" ? "Teacher Portal" : "Student Portal"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}