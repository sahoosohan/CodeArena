"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { defaultFormValues, problemSchema } from "@/modules/problems/schema";
import type { ProblemFormData } from "@/modules/problems/schema";
import { SAMPLE_PROBLEMS } from "@/modules/problems/constant/sample-problem";

export interface TagsArrayController {
  fields: Array<{ id: string }>;
  append: (value: string) => void;
  remove: (index: number) => void;
}

export function useCreateProblem() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sampleType, setSampleType] = useState<"DP" | "string">("DP");

  const form = useForm<ProblemFormData>({
    resolver: zodResolver(problemSchema),
    defaultValues: defaultFormValues,
  });

  const testCasesArray = useFieldArray({
    control: form.control,
    name: "testCases" as const,
  });

  const tags = useWatch({ control: form.control, name: "tags" });
  const tagsArray: TagsArrayController = {
    fields: tags.map((_, index) => ({ id: `tag-${index}` })),
    append: (value) => form.setValue("tags", [...tags, value]),
    remove: (index) =>
      form.setValue(
        "tags",
        tags.filter((_, tagIndex) => tagIndex !== index),
      ),
  };

  const onSubmit = async (values: ProblemFormData) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/create-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const contentType = response.headers.get("content-type") ?? "";
      const isJson = contentType.includes("application/json");
      const data = isJson ? await response.json() : null;

      if (!isJson) {
        throw new Error(
          response.redirected
            ? "Your session expired. Please sign in again."
            : "The server returned an unexpected response.",
        );
      }

      if (!response.ok) {
        const testCaseMessage = data?.testCase
          ? `Test failed. Expected ${data.testCase.expectedOutput}, received ${data.testCase.actualOutput ?? "no output"}`
          : undefined;
        throw new Error(
          data?.error ?? data?.errror ?? testCaseMessage ?? "Failed to create problem",
        );
      }

      toast.success("Problem created successfully");
      router.push("/problems");
    } catch (error) {
      console.error("Error creating problem:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create problem");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleData = () => {
    const sampleData =
      SAMPLE_PROBLEMS[sampleType as keyof typeof SAMPLE_PROBLEMS];
    form.reset(sampleData as ProblemFormData);
  };

  return {
    form,
    testCasesArray,
    tagsArray,
    isLoading,
    sampleType,
    setSampleType,
    onSubmit: form.handleSubmit(onSubmit),
    loadSampleData,
  };
}