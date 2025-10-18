import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";

interface WeekCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export const WeekCalendar = ({ selectedDate, onSelectDate }: WeekCalendarProps) => {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 })); // Monday

  const handlePrevWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };

  const handleNextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Weekly View</CardTitle>
            <CardDescription>
              {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevWeek} data-testid="prev-week-button">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextWeek} data-testid="next-week-button">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            
            return (
              <button
                key={index}
                onClick={() => onSelectDate(day)}
                className={`p-3 rounded-lg border transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : isToday
                    ? "bg-primary/20 border-primary/50"
                    : "bg-card/50 border-white/10 hover:border-white/30 hover:bg-card"
                }`}
                data-testid="calendar-day-button"
              >
                <div className="text-xs font-medium mb-1">
                  {format(day, "EEE")}
                </div>
                <div className="text-lg font-bold">
                  {format(day, "d")}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};