import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getStudyHoursSummary } from "@/lib/apiService";
import { Loader2 } from "lucide-react";

interface StudyData {
  date: string;
  hours: number;
  minutes: number;
}

export const StudyHoursChart = () => {
  const [data, setData] = useState<StudyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getStudyHoursSummary(7);
      setData(result);
    } catch (error) {
      console.error("Failed to load study hours:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle>Study Hours (Last 7 Days)</CardTitle>
          <CardDescription>Track your daily study activity</CardDescription>
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
        <CardTitle>Study Hours (Last 7 Days)</CardTitle>
        <CardDescription>Track your daily study activity</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="rgba(255,255,255,0.5)"
            />
            <YAxis 
              stroke="rgba(255,255,255,0.5)"
              label={{ value: "Hours", angle: -90, position: "insideLeft" }}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card border border-white/20 rounded-lg p-3 shadow-lg">
                      <p className="font-medium">{formatDate(payload[0].payload.date)}</p>
                      <p className="text-sm text-primary">{payload[0].value} hours</p>
                      <p className="text-xs text-muted-foreground">{payload[0].payload.minutes} minutes</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="hours" 
              fill="hsl(var(--primary))" 
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};