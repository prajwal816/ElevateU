import { useRef, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Copy, Download, Upload, Play } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MonacoCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  onRun?: () => void;
  isRunning?: boolean;
}

const languages = [
  {
    value: "javascript",
    label: "JavaScript",
    monacoLang: "javascript",
    judge0Id: 63,
  },
  { value: "python", label: "Python", monacoLang: "python", judge0Id: 71 },
  { value: "java", label: "Java", monacoLang: "java", judge0Id: 62 },
  { value: "cpp", label: "C++", monacoLang: "cpp", judge0Id: 54 },
  { value: "c", label: "C", monacoLang: "c", judge0Id: 50 },
];

const defaultTemplates = {
  javascript: `// JavaScript
function solution() {
    console.log("Hello, World!");
}

solution();`,
  python: `# Python
def solution():
    print("Hello, World!")

solution()`,
  java: `// Java
public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  cpp: `// C++
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  c: `// C
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
};

export const MonacoCodeEditor = ({
  value,
  onChange,
  language,
  onLanguageChange,
  onRun,
  isRunning = false,
}: MonacoCodeEditorProps) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  useEffect(() => {
    // Load Monaco Editor dynamically
    const loadMonaco = async () => {
      try {
        const monaco = await import("monaco-editor");
        monacoRef.current = monaco;

        // Configure Monaco
        monaco.editor.defineTheme("elevateU-dark", {
          base: "vs-dark",
          inherit: true,
          rules: [],
          colors: {
            "editor.background": "#1a1a1a",
            "editor.foreground": "#d4d4d4",
          },
        });

        // Create editor
        const editor = monaco.editor.create(
          document.getElementById("monaco-editor")!,
          {
            value: value,
            language: getMonacoLanguage(language),
            theme: "elevateU-dark",
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: "on",
            lineNumbers: "on",
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
          }
        );

        editorRef.current = editor;

        // Listen for content changes
        editor.onDidChangeModelContent(() => {
          onChange(editor.getValue());
        });
      } catch (error) {
        console.error("Failed to load Monaco Editor:", error);
        // Fallback to textarea if Monaco fails to load
        createFallbackEditor();
      }
    };

    loadMonaco();

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelLanguage(
          model,
          getMonacoLanguage(language)
        );
      }
    }
  }, [language]);

  const createFallbackEditor = () => {
    const container = document.getElementById("monaco-editor");
    if (container) {
      container.innerHTML = `
        <textarea 
          id="fallback-editor"
          style="width: 100%; height: 400px; background: #1a1a1a; color: #d4d4d4; border: none; outline: none; font-family: 'Courier New', monospace; font-size: 14px; padding: 16px; resize: none;"
          placeholder="Write your code here..."
        >${value}</textarea>
      `;

      const textarea = document.getElementById(
        "fallback-editor"
      ) as HTMLTextAreaElement;
      textarea.addEventListener("input", (e) => {
        onChange((e.target as HTMLTextAreaElement).value);
      });
    }
  };

  const getMonacoLanguage = (lang: string) => {
    const langConfig = languages.find((l) => l.value === lang);
    return langConfig?.monacoLang || "javascript";
  };

  const handleLanguageChange = (newLanguage: string) => {
    onLanguageChange(newLanguage);
    if (!value || value.trim() === "") {
      onChange(
        defaultTemplates[newLanguage as keyof typeof defaultTemplates] || ""
      );
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: "Copied!",
        description: "Code copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy code",
        variant: "destructive",
      });
    }
  };

  const downloadCode = () => {
    const extensions = {
      javascript: "js",
      python: "py",
      java: "java",
      cpp: "cpp",
      c: "c",
    };

    const extension = extensions[language as keyof typeof extensions] || "txt";
    const blob = new Blob([value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solution.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadTemplate = () => {
    const template =
      defaultTemplates[language as keyof typeof defaultTemplates] || "";
    onChange(template);
    toast({
      title: "Template Loaded",
      description: `${
        languages.find((l) => l.value === language)?.label
      } template loaded`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Editor Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadTemplate}>
            <Upload className="h-4 w-4 mr-1" />
            Template
          </Button>
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCode}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          {onRun && (
            <Button onClick={onRun} disabled={isRunning} className="gap-2">
              <Play className="h-4 w-4" />
              {isRunning ? "Running..." : "Run Code"}
            </Button>
          )}
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div
        id="monaco-editor"
        className="w-full h-[400px] border border-border rounded-md overflow-hidden"
        style={{ minHeight: "400px" }}
      />

      {/* Editor Info */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Lines: {value.split("\n").length}</span>
        <span>Characters: {value.length}</span>
        <span>
          Language: {languages.find((l) => l.value === language)?.label}
        </span>
      </div>
    </div>
  );
};

export const getJudge0LanguageId = (language: string): number => {
  const langConfig = languages.find((l) => l.value === language);
  return langConfig?.judge0Id || 63; // Default to JavaScript
};
