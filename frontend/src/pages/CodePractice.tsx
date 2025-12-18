import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Code,
  Play,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  BookOpen,
  Target,
  Zap,
} from "lucide-react";
import { CodeEditor } from "@/components/code/CodeEditor";
import { ProblemList } from "@/components/code/ProblemList";
import { CodeProgress } from "@/components/code/CodeProgress";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { codePracticeApi } from "@/lib/api";

const CodePractice = () => {
  const { user } = useAuth();
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [userCode, setUserCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [testResults, setTestResults] = useState<any[]>([]);
  const [stats, setStats] = useState({
    problemsSolved: 0,
    totalProblems: 0,
    streak: 0,
    totalTime: 0,
  });

  useEffect(() => {
    loadCodeStats();
  }, []);

  const loadCodeStats = async () => {
    try {
      const response = await codePracticeApi.getUserProgress();
      const progress = response.data;

      setStats({
        problemsSolved: progress.totalProblemsSolved || 0,
        totalProblems: 50, // This would come from a separate API call
        streak: progress.currentStreak || 0,
        totalTime: progress.totalTimeSpent || 0,
      });
    } catch (error) {
      console.error("Failed to load code stats:", error);
      // Fallback to mock data
      setStats({
        problemsSolved: 0,
        totalProblems: 50,
        streak: 0,
        totalTime: 0,
      });
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    try {
      // Mock code execution - replace with actual code execution service
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockOutput = `Output:\nHello, World!\n\nExecution completed successfully.`;
      setOutput(mockOutput);

      // Mock test results
      const mockTestResults = [
        {
          id: 1,
          input: "test case 1",
          expected: "expected output",
          actual: "expected output",
          passed: true,
        },
        {
          id: 2,
          input: "test case 2",
          expected: "expected output",
          actual: "expected output",
          passed: true,
        },
        {
          id: 3,
          input: "test case 3",
          expected: "expected output",
          actual: "wrong output",
          passed: false,
        },
      ];
      setTestResults(mockTestResults);

      toast({
        title: "Code Executed",
        description: "Your code has been executed successfully!",
      });
    } catch (error) {
      toast({
        title: "Execution Error",
        description: "Failed to execute code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const submitSolution = async () => {
    if (!selectedProblem) return;

    try {
      // Mock submission - replace with actual API call
      toast({
        title: "Solution Submitted",
        description: "Your solution has been submitted for evaluation!",
      });
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "Failed to submit solution. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout
      userRole={user?.role?.toLowerCase() as "student" | "teacher"}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Code Practice 💻
            </h1>
            <p className="text-muted-foreground">
              Practice coding problems and improve your programming skills.
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="stat-card-orange border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Problems Solved
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.problemsSolved}</div>
              <p className="text-xs text-muted-foreground">
                out of {stats.totalProblems}
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card-orange border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Current Streak
              </CardTitle>
              <Zap className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.streak}</div>
              <p className="text-xs text-muted-foreground">days</p>
            </CardContent>
          </Card>

          <Card className="stat-card-orange border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Practice Time
              </CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor(stats.totalTime / 60)}h
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalTime % 60}m this week
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card-orange border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Success Rate
              </CardTitle>
              <Target className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((stats.problemsSolved / stats.totalProblems) * 100)}
                %
              </div>
              <p className="text-xs text-muted-foreground">accuracy</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="practice" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="practice">Practice Problems</TabsTrigger>
            <TabsTrigger value="editor">Code Editor</TabsTrigger>
            <TabsTrigger value="progress">My Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="practice" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Problem List
                  </CardTitle>
                  <CardDescription>Choose a problem to solve</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProblemList
                    onSelectProblem={setSelectedProblem}
                    selectedProblem={selectedProblem}
                  />
                </CardContent>
              </Card>

              {selectedProblem && (
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedProblem.title}</span>
                      <Badge
                        variant={
                          selectedProblem.difficulty === "Easy"
                            ? "default"
                            : selectedProblem.difficulty === "Medium"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {selectedProblem.difficulty}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {selectedProblem.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Problem Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedProblem.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Example</h4>
                      <div className="bg-muted/50 p-3 rounded-md text-sm font-mono">
                        <div>Input: {selectedProblem.example.input}</div>
                        <div>Output: {selectedProblem.example.output}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setUserCode(selectedProblem.template)}
                        variant="outline"
                        size="sm"
                      >
                        Load Template
                      </Button>
                      <Button onClick={submitSolution} size="sm">
                        Submit Solution
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Code Editor
                  </CardTitle>
                  <CardDescription>Write and test your code</CardDescription>
                </CardHeader>
                <CardContent>
                  <CodeEditor
                    value={userCode}
                    onChange={setUserCode}
                    language={language}
                    onLanguageChange={setLanguage}
                  />
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={runCode}
                      disabled={isRunning}
                      className="gap-2"
                    >
                      <Play className="h-4 w-4" />
                      {isRunning ? "Running..." : "Run Code"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle>Output</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 p-3 rounded-md min-h-[200px] font-mono text-sm">
                      {output || "Run your code to see output here..."}
                    </div>
                  </CardContent>
                </Card>

                {testResults.length > 0 && (
                  <Card className="glass-card border-white/10">
                    <CardHeader>
                      <CardTitle>Test Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {testResults.map((result) => (
                          <div
                            key={result.id}
                            className="flex items-center justify-between p-2 rounded-md bg-muted/30"
                          >
                            <span className="text-sm">
                              Test Case {result.id}
                            </span>
                            {result.passed ? (
                              <CheckCircle className="h-4 w-4 text-success" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive" />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <CodeProgress stats={stats} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CodePractice;
