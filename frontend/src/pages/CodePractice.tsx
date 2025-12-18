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
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { MonacoCodeEditor } from "@/components/code/MonacoCodeEditor";
import { ProblemList } from "@/components/code/ProblemList";
import { CodeProgress } from "@/components/code/CodeProgress";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { codePracticeApi } from "@/lib/api";
import codeApi from "@/api/codeApi";

const CodePractice = () => {
  const { user } = useAuth();
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [userCode, setUserCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [testResults, setTestResults] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [executionStats, setExecutionStats] = useState<any>(null);
  const [lastExecutionTime, setLastExecutionTime] = useState<number>(0);
  const [stats, setStats] = useState({
    problemsSolved: 0,
    totalProblems: 0,
    streak: 0,
    totalTime: 0,
  });

  useEffect(() => {
    loadCodeStats();
    loadExecutionStats();
    startPracticeSession();

    // Cleanup on unmount
    return () => {
      if (activeSession) {
        endPracticeSession();
      }
    };
  }, [user]);

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
      // Keep stats at 0 if API fails
    }
  };

  const loadExecutionStats = async () => {
    try {
      const response = await codeApi.getExecutionStats();
      setExecutionStats(response.stats);
    } catch (error) {
      console.error("Failed to load execution stats:", error);
    }
  };

  const startPracticeSession = async () => {
    try {
      const session = await codeApi.startPracticeSession();
      setActiveSession(session);
    } catch (error) {
      console.error("Failed to start practice session:", error);
    }
  };

  const endPracticeSession = async () => {
    if (!activeSession) return;

    try {
      await codeApi.endPracticeSession(activeSession.sessionId);
      setActiveSession(null);
    } catch (error) {
      console.error("Failed to end practice session:", error);
    }
  };

  const canExecuteCode = () => {
    if (!executionStats) return true;

    // Check daily limit
    if (!executionStats.canExecute) {
      return false;
    }

    // Check cooldown
    const now = Date.now();
    const timeSinceLastExecution = (now - lastExecutionTime) / 1000;
    if (timeSinceLastExecution < (executionStats.cooldownSeconds || 3)) {
      return false;
    }

    return true;
  };

  const getCooldownMessage = () => {
    if (!executionStats) return "";

    if (!executionStats.canExecute) {
      return "Daily execution limit reached. Try again tomorrow.";
    }

    const now = Date.now();
    const timeSinceLastExecution = (now - lastExecutionTime) / 1000;
    const remainingCooldown =
      (executionStats.cooldownSeconds || 3) - timeSinceLastExecution;

    if (remainingCooldown > 0) {
      return `Please wait ${Math.ceil(
        remainingCooldown
      )} seconds before running again.`;
    }

    return "";
  };

  const runCode = async () => {
    if (!userCode.trim()) {
      toast({
        title: "No Code",
        description: "Please write some code first.",
        variant: "destructive",
      });
      return;
    }

    if (!canExecuteCode()) {
      toast({
        title: "Cannot Execute",
        description: getCooldownMessage(),
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setOutput("");
    setTestResults([]);
    setLastExecutionTime(Date.now());

    try {
      const result = await codeApi.executeCode({
        code: userCode,
        language: language,
      });

      if (!result.success) {
        if (result.type === "RATE_LIMIT_ERROR") {
          setOutput(`Rate Limit Error: ${result.error}`);
          toast({
            title: "Rate Limit Exceeded",
            description: result.error,
            variant: "destructive",
          });
        } else {
          throw new Error(result.error || "Unknown execution error");
        }
        return;
      }

      if (result.result) {
        const { status, stdout, stderr, compile_output, time, memory } =
          result.result;

        let outputText = "";
        if (stdout) outputText += `Output:\n${stdout}\n`;
        if (stderr) outputText += `Error:\n${stderr}\n`;
        if (compile_output) outputText += `Compilation:\n${compile_output}\n`;
        outputText += `\nExecution Time: ${time}s\nMemory Used: ${memory}KB`;

        setOutput(outputText);

        if (status === "Accepted") {
          toast({
            title: "Code Executed Successfully! ✅",
            description: `Execution time: ${time}s`,
          });
        } else {
          toast({
            title: status,
            description: "Check the output panel for details",
            variant: "destructive",
          });
        }
      }

      // Update execution stats
      if (result.executionStats) {
        setExecutionStats(result.executionStats);
      }
    } catch (error: any) {
      const errorMsg = error.message || "Failed to execute code";
      setOutput(`Error: ${errorMsg}`);
      toast({
        title: "Execution Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const submitSolution = async () => {
    if (!selectedProblem) {
      toast({
        title: "No Problem Selected",
        description: "Please select a problem first.",
        variant: "destructive",
      });
      return;
    }

    if (!userCode.trim()) {
      toast({
        title: "No Code",
        description: "Please write some code first.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setOutput("");
    setTestResults([]);

    try {
      const result = await codeApi.submitCodeForProblem({
        problemId: selectedProblem.id,
        code: userCode,
        language: language,
      });

      if (result.success) {
        const {
          status,
          testResults: results,
          passedTestCases,
          totalTestCases,
          xpEarned,
        } = result;

        setTestResults(results || []);
        setOutput(
          `Status: ${status}\nPassed: ${passedTestCases}/${totalTestCases} test cases`
        );

        if (status === "Accepted") {
          toast({
            title: "Accepted! 🎉",
            description: `You earned ${xpEarned} XP!`,
          });
          // Reload stats to reflect new progress
          loadCodeStats();
        } else {
          toast({
            title: status,
            description: `${passedTestCases}/${totalTestCases} test cases passed`,
            variant: "destructive",
          });
        }
      } else {
        throw new Error(result.error || "Submission failed");
      }
    } catch (error: any) {
      const errorMsg = error.message || "Failed to submit code";
      setOutput(`Error: ${errorMsg}`);
      toast({
        title: "Submission Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleProblemSelect = (problem: any) => {
    setSelectedProblem(problem);
    // Load template for the selected problem
    if (problem.templates && problem.templates[language]) {
      setUserCode(problem.templates[language]);
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

        {/* Execution Limit Warning */}
        {executionStats && (
          <Alert
            className={
              executionStats.canExecute ? "border-blue-500" : "border-red-500"
            }
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {executionStats.canExecute ? (
                <>
                  Executions today: {executionStats.executionsToday}/
                  {executionStats.dailyLimit}(
                  {executionStats.remainingExecutions} remaining)
                </>
              ) : (
                "Daily execution limit reached. Try again tomorrow."
              )}
            </AlertDescription>
          </Alert>
        )}

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
                {stats.totalTime % 60}m total
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card-orange border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Executions Today
              </CardTitle>
              <Target className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {executionStats ? executionStats.executionsToday : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                of {executionStats ? executionStats.dailyLimit : 100}
              </p>
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
                    onSelectProblem={handleProblemSelect}
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

                    {selectedProblem.example && (
                      <div>
                        <h4 className="font-medium mb-2">Example</h4>
                        <div className="bg-muted/50 p-3 rounded-md text-sm font-mono">
                          <div>Input: {selectedProblem.example.input}</div>
                          <div>Output: {selectedProblem.example.output}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={submitSolution}
                        disabled={isRunning}
                        className="gap-2"
                      >
                        {isRunning ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trophy className="h-4 w-4" />
                        )}
                        {isRunning ? "Submitting..." : "Submit Solution"}
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
                  <MonacoCodeEditor
                    value={userCode}
                    onChange={setUserCode}
                    language={language}
                    onLanguageChange={setLanguage}
                    onRun={runCode}
                    isRunning={isRunning}
                  />

                  {/* Run Code Button with Status */}
                  <div className="mt-4 flex items-center justify-between">
                    <Button
                      onClick={runCode}
                      disabled={isRunning || !canExecuteCode()}
                      className="gap-2"
                    >
                      <Play className="h-4 w-4" />
                      {isRunning ? "Running..." : "Run Code"}
                    </Button>

                    {!canExecuteCode() && (
                      <p className="text-sm text-muted-foreground">
                        {getCooldownMessage()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle>Output</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 p-3 rounded-md min-h-[200px] font-mono text-sm whitespace-pre-wrap">
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
                        {testResults.map((result, index) => (
                          <div
                            key={result.testCaseId || index}
                            className="flex items-center justify-between p-2 rounded-md bg-muted/30"
                          >
                            <span className="text-sm">
                              Test Case {index + 1}
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
