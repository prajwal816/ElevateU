import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDailyTimetable } from "@/lib/apiService";
import { Clock, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface TimetableProps {
  selectedDate: Date;
}

interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate: string;
  priority: "low" | "medium" | "high";
}

interface Event {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: string;
  course?: { title: string };
}

interface Assignment {
  _id: string;
  title: string;
  dueDate: string;
  course?: { title: string };
}

interface TimetableData {
  date: string;
  todos: Todo[];
  events: Event[];
  assignments: Assignment[];
}

export const Timetable = ({ selectedDate }: TimetableProps) => {
  const [data, setData] = useState<TimetableData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimetable();
  }, [selectedDate]);

  const loadTimetable = async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split("T")[0];
      const result = await getDailyTimetable(dateStr);
      setData(result);
    } catch (error) {
      console.error("Failed to load timetable:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    return format(new Date(dateStr), "h:mm a");
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

  if (loading) {
    return (
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle>Daily Schedule</CardTitle>
          <CardDescription>{format(selectedDate, "MMMM d, yyyy")}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const hasNoTasks = 
    (!data?.todos || data.todos.length === 0) &&
    (!data?.events || data.events.length === 0) &&
    (!data?.assignments || data.assignments.length === 0);

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle>Daily Schedule</CardTitle>
        <CardDescription>{format(selectedDate, "MMMM d, yyyy")}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasNoTasks ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No tasks scheduled for this day</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Events */}
            {data?.events && data.events.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 text-primary">Events</h3>
                {data.events.map((event) => (
                  <div
                    key={event._id}
                    className="glass-card-orange border-white/5 rounded-lg p-3 mb-2"
                    data-testid="timetable-event-item"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        {event.course && (
                          <p className="text-xs text-muted-foreground">{event.course.title}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-blue-500/20 border-blue-500/30">
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Assignments */}
            {data?.assignments && data.assignments.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 text-accent">Assignments Due</h3>
                {data.assignments.map((assignment) => (
                  <div
                    key={assignment._id}
                    className="glass-card-orange border-white/5 rounded-lg p-3 mb-2"
                    data-testid="timetable-assignment-item"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{assignment.title}</h4>
                        {assignment.course && (
                          <p className="text-xs text-muted-foreground">{assignment.course.title}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Due: {formatTime(assignment.dueDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Todos */}
            {data?.todos && data.todos.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 text-success">Tasks</h3>
                {data.todos.map((todo) => (
                  <div
                    key={todo._id}
                    className="glass-card-orange border-white/5 rounded-lg p-3 mb-2"
                    data-testid="timetable-todo-item"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        {todo.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h4 className={`font-medium text-sm ${todo.completed ? "line-through opacity-60" : ""}`}>
                            {todo.title}
                          </h4>
                          {todo.description && (
                            <p className="text-xs text-muted-foreground mt-1">{todo.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatTime(todo.dueDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={getPriorityColor(todo.priority)}>
                        {todo.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};