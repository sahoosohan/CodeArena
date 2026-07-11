"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { executeCode } from "../actions";

type ProblemTestCase = {
  input: string;
  output: string;
};

type EditorProblem = {
  id: string;
  testCases?: ProblemTestCase[];
  codeSnippets?: Record<string, string>;
} | null;

export function useEditor(problem: EditorProblem, initialLanguage = "JAVASCRIPT") {
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResponse, setExecutionResponse] = useState(null);

  useEffect(() => {
    if (problem?.codeSnippets?.[selectedLanguage]) {
      setCode(problem?.codeSnippets?.[selectedLanguage]);
    }
  }, [selectedLanguage, problem]);

  const handleRun = () => {
    toast.success("This is your assignment");
  };

  const handleSubmit = async () => {
    if (!problem) return;

    try {
      setIsRunning(true);
      const testCases = problem.testCases ?? [];
      const stdin = testCases.map((tc) => tc.input);
      const expected_outputs = testCases.map((tc) => tc.output);

      const res = await executeCode(code , selectedLanguage , stdin , expected_outputs , problem.id);
      setExecutionResponse(res);

      if(res.success){
        toast.success("Code executed successfully")
      }
    } catch (error) {
       console.error('Error executing code', error);
      toast.error('Error executing code');
    }
    finally{
      setIsRunning(false)
    }
  };

  return {
    selectedLanguage,
    setSelectedLanguage,
    code,
    setCode,
    isRunning,
    isSubmitting,
    executionResponse,
    handleRun,
    handleSubmit,
  };
}
