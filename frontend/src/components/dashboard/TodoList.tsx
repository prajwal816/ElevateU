import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getTodos, createTodo, updateTodo, deleteTodo, toggleTodo } from "@/lib/apiService";
import { Plus, Trash2, CheckCircle2, Circle, Loader2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";

interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  createdAt: string;
}

export const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: new Date(),
    dueTime: "09:00",
    priority: "medium" as "low" | "medium" | "high",
  });

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const result = await getTodos();
      setTodos(result);
    } catch (error) {
      console.error("Failed to load todos:", error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Combine date and time
      const [hours, minutes] = formData.dueTime.split(":");
      const dueDateTime = new Date(formData.dueDate);
      dueDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      await createTodo({
        title: formData.title,
        description: formData.description,
        dueDate: dueDateTime,
        priority: formData.priority,
      });

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      setDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        dueDate: new Date(),
        dueTime: "09:00",
        priority: "medium",
      });
      loadTodos();
    } catch (error) {
      console.error("Failed to create todo:", error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleTodo(id);
      loadTodos();
    } catch (error) {
      console.error("Failed to toggle todo:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
      loadTodos();
    } catch (error) {
      console.error("Failed to delete todo:", error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 border-red-500/30 text-red-500";
      case "medium":
        return "bg-yellow-500/20 border-yellow-500/30 text-yellow-500";
      default:
        return "bg-green-500/20 border-green-500/30 text-green-500";
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "MMM d, h:mm a");
  };

  if (loading) {
    return (
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle>To-Do List</CardTitle>
          <CardDescription>Manage your tasks</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>To-Do List</CardTitle>
            <CardDescription>Manage your tasks</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="add-todo-button">
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>Add a new task to your to-do list</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Task title"
                      required
                      data-testid="todo-title-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Task description"
                      data-testid="todo-description-input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Due Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(formData.dueDate, "MMM d, yyyy")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.dueDate}
                            onSelect={(date) => date && setFormData({ ...formData, dueDate: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="time">Time *</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="time"
                          type="time"
                          value={formData.dueTime}
                          onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                          className="pl-10"
                          required
                          data-testid="todo-time-input"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: "low" | "medium" | "high") =>
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <SelectTrigger id="priority" data-testid="todo-priority-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" data-testid="submit-todo-button">Create Task</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {todos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No tasks yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {todos.map((todo) => (
              <div
                key={todo._id}
                className="glass-card-orange border-white/5 rounded-lg p-3 hover:border-white/20 transition-colors"
                data-testid="todo-item"
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => handleToggle(todo._id)}
                    className="mt-1 focus:outline-none"
                    data-testid="toggle-todo-button"
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h4
                      className={`font-medium text-sm ${
                        todo.completed ? "line-through opacity-60" : ""
                      }`}
                    >
                      {todo.title}
                    </h4>
                    {todo.description && (
                      <p className="text-xs text-muted-foreground mt-1">{todo.description}</p>
                    )}
                    {todo.dueDate && (
                      <div className="flex items-center gap-2 mt-2">
                        <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(todo.dueDate)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPriorityColor(todo.priority)}>
                      {todo.priority}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(todo._id)}
                      className="h-8 w-8 p-0 hover:bg-red-500/20"
                      data-testid="delete-todo-button"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};