import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Copy, Download, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
}

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "typescript", label: "TypeScript" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

const defaultTemplates = {
  javascript: `// JavaScript Template
function solution() {
    // Write your code here
    console.log("Hello, World!");
}

solution();`,
  python: `# Python Template
def solution():
    # Write your code here
    print("Hello, World!")

solution()`,
  java: `// Java Template
public class Solution {
    public static void main(String[] args) {
        // Write your code here
        System.out.println("Hello, World!");
    }
}`,
  cpp: `// C++ Template
#include <iostream>
using namespace std;

int main() {
    // Write your code here
    cout << "Hello, World!" << endl;
    return 0;
}`,
  c: `// C Template
#include <stdio.h>

int main() {
    // Write your code here
    printf("Hello, World!\\n");
    return 0;
}`,
  typescript: `// TypeScript Template
function solution(): void {
    // Write your code here
    console.log("Hello, World!");
}

solution();`,
  go: `// Go Template
package main

import "fmt"

func main() {
    // Write your code here
    fmt.Println("Hello, World!")
}`,
  rust: `// Rust Template
fn main() {
    // Write your code here
    println!("Hello, World!");
}`,
};

export const CodeEditor = ({
  value,
  onChange,
  language,
  onLanguageChange,
}: CodeEditorProps) => {
  const [fontSize, setFontSize] = useState("14");

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
      typescript: "ts",
      go: "go",
      rust: "rs",
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

          <Select value={fontSize} onValueChange={setFontSize}>
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12px</SelectItem>
              <SelectItem value="14">14px</SelectItem>
              <SelectItem value="16">16px</SelectItem>
              <SelectItem value="18">18px</SelectItem>
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
        </div>
      </div>

      {/* Code Editor */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-[400px] p-4 bg-muted/50 border border-border rounded-md font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          style={{ fontSize: `${fontSize}px` }}
          placeholder={`Write your ${
            languages.find((l) => l.value === language)?.label
          } code here...`}
          spellCheck={false}
        />

        {/* Line numbers (simplified) */}
        <div className="absolute left-2 top-4 text-muted-foreground text-sm font-mono pointer-events-none">
          {value.split("\n").map((_, index) => (
            <div
              key={index}
              style={{ height: `${parseInt(fontSize) * 1.5}px` }}
            >
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
