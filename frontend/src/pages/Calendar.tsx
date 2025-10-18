import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Video,
  FileText,
  Calendar as CalendarIcon,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getEvents, getTodos, getAssignments } from "@/lib/apiService";
import { toast } from "@/hooks/use-toast";

const Calendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [todos, setTodos] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const [eventsData, todosData, assignmentsData] = await Promise.all([
        getEvents(startOfMonth.toISOString(), endOfMonth.toISOString()).catch(
          () => []
        ),
        getTodos().catch(() => []),
        getAssignments().catch(() => []),
      ]);

      setEvents(eventsData);
      setTodos(todosData);
      setAssignments(assignmentsData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load calendar data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startTime);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getTodosForDate = (date: Date) => {
    return todos.filter((todo) => {
      if (!todo.dueDate) return false;
      const todoDate = new Date(todo.dueDate);
      return (
        todoDate.getDate() === date.getDate() &&
        todoDate.getMonth() === date.getMonth() &&
        todoDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getAssignmentsForDate = (date: Date) => {
    return assignments.filter((assignment) => {
      if (!assignment.dueDate) return false;
      const assignmentDate = new Date(assignment.dueDate);
      return (
        assignmentDate.getDate() === date.getDate() &&
        assignmentDate.getMonth() === date.getMonth() &&
        assignmentDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  const calendarDays = [];
  // Empty cells before first day
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "class":
        return <Video className="h-3 w-3" />;
      case "assignment":
        return <FileText className="h-3 w-3" />;
      case "exam":
        return <CalendarIcon className="h-3 w-3" />;
      default:
        return <CalendarIcon className="h-3 w-3" />;
    }
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const selectedDateTodos = selectedDate ? getTodosForDate(selectedDate) : [];
  const selectedDateAssignments = selectedDate
    ? getAssignmentsForDate(selectedDate)
    : [];

  return (
    <DashboardLayout
      userRole={user?.role === "Teacher" ? "teacher" : "student"}
    >
      <div className="space-y-6">
        <div>
          <h1
            className="text-3xl font-bold text-foreground mb-2"
            data-testid="calendar-title"
          >
            Calendar
          </h1>
          <p className="text-muted-foreground">
            View your schedule, live classes, assignments, and to-do items.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar View */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {monthName} {year}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={previousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Week day headers */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div
                          key={day}
                          className="text-center text-sm font-medium text-muted-foreground py-2"
                        >
                          {day}
                        </div>
                      )
                    )}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((date, index) => {
                      if (!date) {
                        return (
                          <div
                            key={`empty-${index}`}
                            className="aspect-square"
                          />
                        );
                      }

                      const isToday =
                        date.getDate() === new Date().getDate() &&
                        date.getMonth() === new Date().getMonth() &&
                        date.getFullYear() === new Date().getFullYear();

                      const isSelected =
                        selectedDate &&
                        date.getDate() === selectedDate.getDate() &&
                        date.getMonth() === selectedDate.getMonth() &&
                        date.getFullYear() === selectedDate.getFullYear();

                      const dayEvents = getEventsForDate(date);
                      const dayTodos = getTodosForDate(date);
                      const dayAssignments = getAssignmentsForDate(date);
                      const hasItems =
                        dayEvents.length > 0 ||
                        dayTodos.length > 0 ||
                        dayAssignments.length > 0;

                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedDate(date)}
                          className={`aspect-square p-2 rounded-lg border transition-colors ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : isToday
                              ? "bg-accent border-accent"
                              : "hover:bg-muted border-transparent"
                          }`}
                          data-testid={`calendar-day-${date.getDate()}`}
                        >
                          <div className="text-sm font-medium">
                            {date.getDate()}
                          </div>
                          {hasItems && (
                            <div className="flex gap-1 mt-1 justify-center flex-wrap">
                              {dayEvents.slice(0, 2).map((_, i) => (
                                <div
                                  key={i}
                                  className="w-1 h-1 rounded-full bg-primary"
                                />
                              ))}
                              {dayTodos.slice(0, 2).map((_, i) => (
                                <div
                                  key={`todo-${i}`}
                                  className="w-1 h-1 rounded-full bg-accent"
                                />
                              ))}
                              {dayAssignments.slice(0, 2).map((_, i) => (
                                <div
                                  key={`assignment-${i}`}
                                  className="w-1 h-1 rounded-full bg-orange-500"
                                />
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Date Details */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate
                  ? selectedDate.toLocaleDateString("default", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Select a date"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div className="space-y-4">
                  {/* Events */}
                  {selectedDateEvents.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Events</h3>
                      <div className="space-y-2">
                        {selectedDateEvents.map((event) => (
                          <div
                            key={event._id}
                            className="border rounded-lg p-3 space-y-1"
                            data-testid="event-item"
                          >
                            <div className="flex items-start gap-2">
                              <Badge variant="outline" className="mt-0.5">
                                {getEventIcon(event.type)}
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">
                                  {event.title}
                                </p>
                                {event.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {event.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {new Date(
                                      event.startTime
                                    ).toLocaleTimeString("default", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assignments */}
                  {selectedDateAssignments.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">
                        Assignments Due
                      </h3>
                      <div className="space-y-2">
                        {selectedDateAssignments.map((assignment) => (
                          <div
                            key={assignment._id}
                            className="border rounded-lg p-3 space-y-1"
                            data-testid="assignment-item"
                          >
                            <div className="flex items-start gap-2">
                              <Badge variant="outline" className="mt-0.5">
                                <FileText className="h-3 w-3" />
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">
                                  {assignment.title}
                                </p>
                                {assignment.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {assignment.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                  <span>
                                    {assignment.course?.title || "Course"}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {assignment.maxPoints || 100} points
                                  </span>
                                  {assignment.submitted && (
                                    <>
                                      <span>•</span>
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        Submitted
                                      </Badge>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* To-dos */}
                  {selectedDateTodos.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">
                        To-Do Items
                      </h3>
                      <div className="space-y-2">
                        {selectedDateTodos.map((todo) => (
                          <div
                            key={todo._id}
                            className="border rounded-lg p-3 space-y-1"
                            data-testid="todo-item"
                          >
                            <p className="font-medium text-sm">{todo.title}</p>
                            {todo.description && (
                              <p className="text-xs text-muted-foreground">
                                {todo.description}
                              </p>
                            )}
                            <Badge
                              variant={
                                todo.priority === "high"
                                  ? "destructive"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {todo.priority}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDateEvents.length === 0 &&
                    selectedDateTodos.length === 0 &&
                    selectedDateAssignments.length === 0 && (
                      <p className="text-center text-muted-foreground py-8 text-sm">
                        No events, assignments, or to-do items for this date.
                      </p>
                    )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  Click on a date to view details.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
