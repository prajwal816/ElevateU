import { useState } from "react";
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

interface SimpleCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  onRun?: () => void;
  isRunning?: boolean;
}

const languages = [
  { value: "javascript", label: "JavaScript", judge0Id: 63 },
  { value: "python", label: "Python", judge0Id: 71 },
  { value: "java", label: "Java", judge0Id: 62 },
  { value: "cpp", label: "C++", judge0Id: 54 },
  { value: "c", label: "C", judge0Id: 50 },
];

const defaultTemplates = {
  javascript: `// JavaScript
console.log("Hello, World!");`,
  python: `# Python
print("Hello, World!")`,
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

export const SimpleCodeEditor = ({
  value,
  onChange,
  language,
  onLanguageChange,
  onRun,
  isRunning = false,
}: SimpleCodeEditorProps) => {
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

      {/* Code Editor */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-[400px] p-4 bg-gray-900 text-gray-100 border border-gray-700 rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={`Write your ${
            languages.find((l) => l.value === language)?.label
          } code here...`}
          spellCheck={false}
          style={{
            fontFamily: "'Fira Code', 'Courier New', monospace",
            lineHeight: "1.5",
            tabSize: 2,
          }}
        />

        {/* Line numbers overlay */}
        <div className="absolute left-2 top-4 text-gray-500 text-sm font-mono pointer-events-none select-none">
          {value.split("\n").map((_, index) => (
            <div key={index} style={{ height: "21px" }}>
              {index + 1}
            </div>
          ))}
        </div>
      </div>

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
