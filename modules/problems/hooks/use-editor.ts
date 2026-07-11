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

type ExecutionResponse = Awaited<ReturnType<typeof executeCode>> | null;

export function useEditor(problem: EditorProblem, initialLanguage = "JAVASCRIPT") {
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [executionResponse, setExecutionResponse] =
    useState<ExecutionResponse>(null);

  useEffect(() => {
    const snippet = problem?.codeSnippets?.[selectedLanguage];
    if (!snippet) return;

    let isCurrent = true;
    queueMicrotask(() => {
      if (isCurrent) setCode(snippet);
    });

    return () => {
      isCurrent = false;
    };
  }, [selectedLanguage, problem]);

  const handleRun = () => {
    handleSubmit();
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
    executionResponse,
    handleRun,
    handleSubmit,
  };
}
