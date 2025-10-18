import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Mail,
  Bell,
  Award,
  HelpCircle,
  LogOut,
  Camera,
  Loader2,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { getMyRank } from "@/lib/apiService";
import apiClient from "@/lib/apiService";

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSection = (searchParams.get("section") || "profile") as
    | "profile"
    | "notifications"
    | "badges"
    | "help";
  const [xpData, setXpData] = useState<any>(null);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    assignmentReminders: true,
    gradeNotifications: true,
    forumReplies: true,
    courseAnnouncements: true,
  });

  useEffect(() => {
    loadXpData();
  }, []);

  const loadXpData = async () => {
    try {
      const data = await getMyRank();
      setXpData(data);
    } catch (error) {
      console.error("Failed to load XP data", error);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      await apiClient.put("/api/auth/profile", profileData);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      setLoading(true);
      await apiClient.put("/api/auth/notifications", notificationSettings);
      toast({
        title: "Success",
        description: "Notification settings updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Mock badges data
  const badges = [
    {
      id: 1,
      name: "Early Adopter",
      icon: "🚀",
      description: "Joined the platform early",
      earned: true,
    },
    {
      id: 2,
      name: "Top Scorer",
      icon: "🏆",
      description: "Achieved 90+ in 5 assignments",
      earned: true,
    },
    {
      id: 3,
      name: "Consistent Learner",
      icon: "📚",
      description: "7-day study streak",
      earned: true,
    },
    {
      id: 4,
      name: "Course Completer",
      icon: "✅",
      description: "Completed 3 courses",
      earned: false,
    },
    {
      id: 5,
      name: "Helpful Peer",
      icon: "🤝",
      description: "Helped 10 classmates in forums",
      earned: false,
    },
    {
      id: 6,
      name: "Perfect Attendance",
      icon: "📅",
      description: "Attended all live classes",
      earned: false,
    },
  ];

  return (
    <DashboardLayout
      userRole={user?.role === "Teacher" ? "teacher" : "student"}
    >
      <div className="space-y-6">
        <div>
          <h1
            className="text-3xl font-bold text-foreground mb-2"
            data-testid="settings-title"
          >
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Tabs
          value={currentSection}
          onValueChange={(v) => setSearchParams({ section: v })}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-2">
              <Award className="h-4 w-4" />
              Badges & XP
            </TabsTrigger>
            <TabsTrigger value="help" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              Help
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and profile picture
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.profilePicture} />
                    <AvatarFallback className="text-2xl">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Camera className="h-4 w-4" />
                      Change Photo
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF. Max 5MB.
                    </p>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      data-testid="name-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                      data-testid="email-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" value={user?.role || "Student"} disabled />
                  </div>

                  <Button
                    onClick={handleProfileUpdate}
                    disabled={loading}
                    data-testid="update-profile-btn"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Profile"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Change Password
                </Button>
                <Button
                  variant="destructive"
                  className="w-full justify-start gap-2"
                  onClick={handleLogout}
                  data-testid="logout-btn"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about your account
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="assignment-reminders">
                      Assignment Reminders
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded about upcoming assignment deadlines
                    </p>
                  </div>
                  <Switch
                    id="assignment-reminders"
                    checked={notificationSettings.assignmentReminders}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        assignmentReminders: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="grade-notifications">
                      Grade Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Be notified when grades are posted
                    </p>
                  </div>
                  <Switch
                    id="grade-notifications"
                    checked={notificationSettings.gradeNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        gradeNotifications: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="forum-replies">Forum Replies</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified of replies to your forum posts
                    </p>
                  </div>
                  <Switch
                    id="forum-replies"
                    checked={notificationSettings.forumReplies}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        forumReplies: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="course-announcements">
                      Course Announcements
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about course announcements
                    </p>
                  </div>
                  <Switch
                    id="course-announcements"
                    checked={notificationSettings.courseAnnouncements}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        courseAnnouncements: checked,
                      })
                    }
                  />
                </div>

                <Button onClick={handleNotificationUpdate} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Preferences"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badges & XP Tab */}
          <TabsContent value="badges" className="space-y-4">
            {/* XP Card */}
            <Card>
              <CardHeader>
                <CardTitle>Experience Points</CardTitle>
                <CardDescription>
                  Track your learning progress and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <Trophy className="h-16 w-16 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-4xl font-bold text-primary">
                      {xpData?.xp || 0} XP
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Rank #{xpData?.rank || "N/A"} among all students
                    </p>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Level {Math.floor((xpData?.xp || 0) / 100)}</span>
                        <span>
                          {(xpData?.xp || 0) % 100}/100 XP to next level
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(xpData?.xp || 0) % 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Achievements & Badges</CardTitle>
                <CardDescription>
                  Earn badges by completing challenges and milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`border rounded-lg p-4 ${
                        badge.earned ? "bg-card" : "bg-muted/30 opacity-60"
                      }`}
                      data-testid={`badge-${badge.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{badge.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{badge.name}</h3>
                            {badge.earned && (
                              <Badge variant="secondary">Earned</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {badge.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Help Tab */}
          <TabsContent value="help" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Help & Support</CardTitle>
                <CardDescription>
                  Get assistance and learn how to use the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <HelpCircle className="h-4 w-4" />
                    Getting Started Guide
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Contact Support
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <User className="h-4 w-4" />
                    FAQs
                  </Button>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-2">Quick Tips</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      • Use the calendar to track your assignments and live
                      classes
                    </li>
                    <li>
                      • Check the leaderboard to see how you rank among peers
                    </li>
                    <li>• Participate in forum discussions to earn XP</li>
                    <li>
                      • Complete assignments on time to maintain your streak
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
