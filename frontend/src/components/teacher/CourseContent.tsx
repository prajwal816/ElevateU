import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Plus,
  Trash2,
  FileVideo,
  FileText,
  ListChecks,
  File,
  Loader2,
  Eye,
  Calendar as CalendarIcon,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  getCourseUnits,
  createUnit,
  createTopic,
  deleteUnit,
  deleteTopic,
} from "@/lib/apiService";

interface CourseContentProps {
  courseId: string;
  units: any[];
  onRefresh: () => void;
}

export const CourseContent = ({
  courseId,
  units: initialUnits,
  onRefresh,
}: CourseContentProps) => {
  const [units, setUnits] = useState<any[]>(initialUnits);
  const [loading, setLoading] = useState(false);
  const [showNewUnit, setShowNewUnit] = useState(false);
  const [showNewTopic, setShowNewTopic] = useState<string | null>(null);
  const [previewTopic, setPreviewTopic] = useState<any>(null);
  const [newUnitTitle, setNewUnitTitle] = useState("");
  const [newUnitDesc, setNewUnitDesc] = useState("");
  const [newTopic, setNewTopic] = useState({
    title: "",
    type: "video",
    description: "",
    contentUrl: "",
    dueDate: "",
    maxPoints: 100,
  });
  const [topicFile, setTopicFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    setUnits(initialUnits);
  }, [initialUnits]);

  const loadUnits = async () => {
    try {
      setLoading(true);
      const data = await getCourseUnits(courseId);
      const unitsWithTopics = await Promise.all(
        data.map(async (unit: any) => {
          const topics = await import("@/lib/apiService").then((m) =>
            m.getUnitTopics(unit._id)
          );
          return { ...unit, topics };
        })
      );
      setUnits(unitsWithTopics);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load units",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUnit = async () => {
    if (!newUnitTitle.trim()) {
      toast({
        title: "Error",
        description: "Unit title is required",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await createUnit(courseId, {
        title: newUnitTitle,
        description: newUnitDesc,
        order: units.length,
      });
      toast({ title: "Success", description: "Unit created successfully" });
      setNewUnitTitle("");
      setNewUnitDesc("");
      setShowNewUnit(false);
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create unit",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTopic = async (unitId: string) => {
    if (!newTopic.title.trim()) {
      toast({
        title: "Error",
        description: "Topic title is required",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", newTopic.title);
      formData.append("type", newTopic.type);
      formData.append("description", newTopic.description);

      if (topicFile) formData.append("content", topicFile);
      else if (newTopic.contentUrl)
        formData.append("contentUrl", newTopic.contentUrl);

      // Add assignment-specific fields
      if (newTopic.type === "assignment") {
        if (newTopic.dueDate) formData.append("dueDate", newTopic.dueDate);
        if (newTopic.maxPoints)
          formData.append("maxPoints", newTopic.maxPoints.toString());
      }

      await createTopic(unitId, formData);
      toast({ title: "Success", description: "Topic created successfully" });
      setNewTopic({
        title: "",
        type: "video",
        description: "",
        contentUrl: "",
        dueDate: "",
        maxPoints: 100,
      });
      setTopicFile(null);
      setShowNewTopic(null);
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create topic",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (
      !confirm("Are you sure you want to delete this unit and all its topics?")
    )
      return;

    try {
      await deleteUnit(unitId);
      toast({ title: "Success", description: "Unit deleted successfully" });
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete unit",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;

    try {
      await deleteTopic(topicId);
      toast({ title: "Success", description: "Topic deleted successfully" });
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete topic",
        variant: "destructive",
      });
    }
  };

  const getTopicIcon = (type: string) => {
    switch (type) {
      case "video":
        return <FileVideo className="h-4 w-4" />;
      case "pdf":
        return <FileText className="h-4 w-4" />;
      case "quiz":
        return <ListChecks className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );

  return (
    <div className="space-y-4" data-testid="course-content">
      {/* Header & Add Unit */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Course Units & Topics</h3>
        <Button
          onClick={() => setShowNewUnit(!showNewUnit)}
          data-testid="add-unit-btn"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Unit
        </Button>
      </div>

      {/* New Unit Form */}
      {showNewUnit && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Unit Title</Label>
              <Input
                value={newUnitTitle}
                onChange={(e) => setNewUnitTitle(e.target.value)}
                placeholder="Enter unit title..."
                data-testid="new-unit-title"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newUnitDesc}
                onChange={(e) => setNewUnitDesc(e.target.value)}
                placeholder="Enter unit description..."
                data-testid="new-unit-desc"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateUnit}
                disabled={submitting}
                data-testid="save-unit-btn"
              >
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}{" "}
                Save Unit
              </Button>
              <Button variant="outline" onClick={() => setShowNewUnit(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Units Message */}
      {units.length === 0 && !showNewUnit && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No units yet. Click "Add Unit" to create your first unit.
          </CardContent>
        </Card>
      )}

      {/* Units List */}
      {units.map((unit, unitIndex) => (
        <Card key={unit._id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  Unit {unitIndex + 1}: {unit.title}
                </CardTitle>
                {unit.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {unit.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setShowNewTopic(showNewTopic === unit._id ? null : unit._id)
                  }
                  data-testid={`add-topic-btn-${unitIndex}`}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Topic
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteUnit(unit._id)}
                  data-testid={`delete-unit-btn-${unitIndex}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Topics */}
          <CardContent className="space-y-3">
            {showNewTopic === unit._id && (
              <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
                <div className="space-y-2">
                  <Label>Topic Title</Label>
                  <Input
                    value={newTopic.title}
                    onChange={(e) =>
                      setNewTopic({ ...newTopic, title: e.target.value })
                    }
                    placeholder="Enter topic title..."
                    data-testid="new-topic-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newTopic.type}
                    onValueChange={(value) =>
                      setNewTopic({ ...newTopic, type: value })
                    }
                  >
                    <SelectTrigger data-testid="new-topic-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newTopic.description}
                    onChange={(e) =>
                      setNewTopic({ ...newTopic, description: e.target.value })
                    }
                    placeholder="Enter topic description..."
                    data-testid="new-topic-desc"
                  />
                </div>
                {newTopic.type === "assignment" && (
                  <>
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Popover
                        open={datePickerOpen}
                        onOpenChange={setDatePickerOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            data-testid="new-topic-due-date"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newTopic.dueDate ? (
                              new Date(newTopic.dueDate).toLocaleDateString()
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              newTopic.dueDate
                                ? new Date(newTopic.dueDate)
                                : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                setNewTopic({
                                  ...newTopic,
                                  dueDate: date.toISOString(),
                                });
                                setDatePickerOpen(false);
                              }
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Points</Label>
                      <Input
                        type="number"
                        value={newTopic.maxPoints}
                        onChange={(e) =>
                          setNewTopic({
                            ...newTopic,
                            maxPoints: parseInt(e.target.value) || 100,
                          })
                        }
                        placeholder="100"
                        min="1"
                        data-testid="new-topic-points"
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label>Upload File (or enter URL)</Label>
                  <Input
                    type="file"
                    onChange={(e) => setTopicFile(e.target.files?.[0] || null)}
                    data-testid="new-topic-file"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content URL</Label>
                  <Input
                    value={newTopic.contentUrl}
                    onChange={(e) =>
                      setNewTopic({ ...newTopic, contentUrl: e.target.value })
                    }
                    placeholder="Enter URL..."
                    data-testid="new-topic-url"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCreateTopic(unit._id)}
                    disabled={submitting}
                    data-testid="save-topic-btn"
                  >
                    {submitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}{" "}
                    Save Topic
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewTopic(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {unit.topics && unit.topics.length > 0
              ? unit.topics.map((topic: any, topicIndex: number) => (
                  <div
                    key={topic._id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-background"
                    data-testid={`topic-item-${unitIndex}-${topicIndex}`}
                  >
                    <div className="flex items-center gap-3">
                      {getTopicIcon(topic.type)}
                      <div>
                        <p className="font-medium text-sm">{topic.title}</p>
                        {topic.description && (
                          <p className="text-xs text-muted-foreground">
                            {topic.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {topic.contentUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPreviewTopic(topic)}
                          data-testid={`preview-topic-btn-${unitIndex}-${topicIndex}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteTopic(topic._id)}
                        data-testid={`delete-topic-btn-${unitIndex}-${topicIndex}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              : !showNewTopic && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No topics yet. Click "Add Topic" to create topics.
                  </p>
                )}
          </CardContent>
        </Card>
      ))}

      {/* Preview Dialog */}
      {previewTopic && (
        <Dialog
          open={!!previewTopic}
          onOpenChange={() => setPreviewTopic(null)}
        >
          <DialogContent
            className="max-w-4xl max-h-[90vh]"
            data-testid="teacher-preview-dialog"
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getTopicIcon(previewTopic.type)}
                {previewTopic.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {previewTopic.description && (
                <p className="text-sm text-muted-foreground">
                  {previewTopic.description}
                </p>
              )}
              {previewTopic.contentUrl && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  {previewTopic.type === "video" && (
                    <video
                      controls
                      className="w-full rounded"
                      data-testid="teacher-video-preview"
                    >
                      <source src={previewTopic.contentUrl} />
                      Your browser does not support the video tag.
                    </video>
                  )}
                  {previewTopic.type === "pdf" && (
                    <div className="space-y-2">
                      <iframe
                        src={previewTopic.contentUrl.replace(
                          "/upload/",
                          "/upload/fl_attachment/"
                        )}
                        className="w-full h-[600px] rounded border"
                        data-testid="teacher-pdf-preview"
                        title="PDF Preview"
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        <a
                          href={previewTopic.contentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          Open in new tab
                        </a>
                      </p>
                    </div>
                  )}
                  {previewTopic.type === "assignment" && (
                    <div className="text-center p-8">
                      <p className="mb-4">
                        Assignment content: {previewTopic.contentUrl}
                      </p>
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setPreviewTopic(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
