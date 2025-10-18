import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createCourse } from "@/lib/apiService";

interface CreateCourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCourseCreated: () => void;
}

export const CreateCourseModal = ({ open, onOpenChange, onCourseCreated }: CreateCourseModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    category: "",
    level: "Beginner",
  });
  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [currentOutcome, setCurrentOutcome] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const addOutcome = () => {
    if (currentOutcome.trim()) {
      setOutcomes([...outcomes, currentOutcome.trim()]);
      setCurrentOutcome("");
    }
  };

  const removeOutcome = (index: number) => {
    setOutcomes(outcomes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Course title is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("duration", formData.duration);
      data.append("category", formData.category);
      data.append("level", formData.level);
      data.append("outcomes", JSON.stringify(outcomes));
      if (thumbnail) {
        data.append("thumbnail", thumbnail);
      }

      await createCourse(data);
      toast({
        title: "Success",
        description: "Course created successfully",
      });
      onCourseCreated();
      onOpenChange(false);
      // Reset form
      setFormData({
        title: "",
        description: "",
        duration: "",
        category: "",
        level: "Beginner",
      });
      setOutcomes([]);
      setThumbnail(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create course",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="create-course-modal">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new course. You can add content later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Introduction to Computer Science"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              data-testid="course-title-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what students will learn in this course..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              data-testid="course-description-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                placeholder="e.g., 12 weeks"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                data-testid="course-duration-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., Computer Science"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                data-testid="course-category-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
              <SelectTrigger data-testid="course-level-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Learning Outcomes</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a learning outcome..."
                value={currentOutcome}
                onChange={(e) => setCurrentOutcome(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOutcome())}
                data-testid="outcome-input"
              />
              <Button type="button" onClick={addOutcome} size="icon" data-testid="add-outcome-btn">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {outcomes.length > 0 && (
              <div className="space-y-2 mt-2">
                {outcomes.map((outcome, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                    <span className="text-sm">{outcome}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOutcome(index)}
                      data-testid={`remove-outcome-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">Course Thumbnail</Label>
            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
              data-testid="thumbnail-input"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} data-testid="submit-course-btn">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Course
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};