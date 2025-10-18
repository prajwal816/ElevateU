import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, MessageSquare, Bell, Trophy } from "lucide-react";
import { CourseContent } from "./CourseContent";
import { CourseStudents } from "./CourseStudents";
import { CourseDiscussion } from "./CourseDiscussion";
import { CourseAnnouncements } from "./CourseAnnouncements";
import { CourseLeaderboard } from "./CourseLeaderboard";

interface ManageCourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseName: string;
}

export const ManageCourseModal = ({ open, onOpenChange, courseId, courseName }: ManageCourseModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" data-testid="manage-course-modal">
        <DialogHeader>
          <DialogTitle>Manage Course: {courseName}</DialogTitle>
          <DialogDescription>
            Manage course content, students, discussions, and more.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="content" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="content" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="students" className="gap-2">
              <Users className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="discussion" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Discussion
            </TabsTrigger>
            <TabsTrigger value="announcements" className="gap-2">
              <Bell className="h-4 w-4" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="content" className="m-0">
              <CourseContent courseId={courseId} />
            </TabsContent>
            <TabsContent value="students" className="m-0">
              <CourseStudents courseId={courseId} />
            </TabsContent>
            <TabsContent value="discussion" className="m-0">
              <CourseDiscussion courseId={courseId} />
            </TabsContent>
            <TabsContent value="announcements" className="m-0">
              <CourseAnnouncements courseId={courseId} />
            </TabsContent>
            <TabsContent value="leaderboard" className="m-0">
              <CourseLeaderboard courseId={courseId} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};