"use server";
import prisma from "@/lib/db";
import {
  getCodeboxLanguageId,
  getCodeboxLanguageName,
  pollBatchResults,
  submitBatch,
} from "@/lib/codebox";
import { getCurrentUserData } from "@/modules/auth/actions";

export const getAllProblems = async () => {
  try {
    await getCurrentUserData();

    const problems = await prisma.problem.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: problems.map(({ tag, ...problem }) => ({
        ...problem,
        tags: tag.filter(Boolean),
      })),
    };
  } catch (error) {
    console.error("❌ Error fetching problems:", error);
    return { success: false, error: "Failed to fetch problems" };
  }
};

export const getProblemById = async (id: string) => {
  try {
    const problem = await prisma.problem.findUnique({
      where: {
        id: id,
      },
    });

    return {
      success: true,
      data: problem,
    };
  } catch (error) {
    console.error("❌ Error fetching problem:", error);
    return { success: false, error: "Failed to fetch problem" };
  }
};

// --- Execution Helpers ---

const validateExecutionRequest = (user: any, stdin: string[], expected_outputs: string[]) => {
  if (!user || "error" in user) {
    return { error: "No authenticated user found" };
  }
  if (
    !Array.isArray(stdin) ||
    stdin.length === 0 ||
    !Array.isArray(expected_outputs) ||
    expected_outputs.length !== stdin.length
  ) {
    return { error: "Invalid Test Cases" };
  }
  return null;
};

const runCodeOnCodebox = async (source_code: string, languageId: number, stdin: string[], expected_outputs: string[]) => {
  const submissions = stdin.map((input, index) => ({
    source_code,
    language_id: languageId,
    stdin: input,
    expected_output: expected_outputs[index],
  }));

  const submitResponse = await submitBatch(submissions);
  const tokens = submitResponse.map((res) => res.token);
  const results = await pollBatchResults(tokens);

  let allPassed = true;

  const detailedResults = results.map((result, i) => {
    const stdout = result.stdout?.trim() || null;
    const expected_output = expected_outputs[i]?.trim();
    const passed = stdout === expected_output;
    const status = result.status?.description ?? "Unknown";

    if (!passed) allPassed = false;

    return {
      testCase: i + 1,
      passed,
      stdout,
      expected: expected_output,
      stderr: result.stderr || null,
      compile_output: result.compile_output || null,
      status,
      memory: result.memory ? `${result.memory} KB` : undefined,
      time: result.time ? `${result.time} s` : undefined,
    };
  });

  return { detailedResults, allPassed };
};

const saveSubmissionAndResults = async (
  userId: string,
  problemId: string,
  source_code: string,
  languageId: number,
  stdin: string[],
  detailedResults: any[],
  allPassed: boolean
) => {
  const submission = await prisma.submission.create({
    data: {
      userId,
      problemId,
      sourceCode: source_code,
      language: getCodeboxLanguageName(languageId),
      stdin: stdin.join("\n"),
      stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
      stderr: detailedResults.some((r) => r.stderr)
        ? JSON.stringify(detailedResults.map((r) => r.stderr))
        : null,
      compileOutput: detailedResults.some((r) => r.compile_output)
        ? JSON.stringify(detailedResults.map((r) => r.compile_output))
        : null,
      status: allPassed ? "Accepted" : "Wrong Answer",
      memory: detailedResults.some((r) => r.memory)
        ? JSON.stringify(detailedResults.map((r) => r.memory))
        : null,
      time: detailedResults.some((r) => r.time)
        ? JSON.stringify(detailedResults.map((r) => r.time))
        : null,
    },
  });

  if (allPassed) {
    await prisma.problemSolved.upsert({
      where: { userId_problemId: { userId, problemId } },
      update: {},
      create: { userId, problemId },
    });
  }

  const testCaseResults = detailedResults.map((result) => ({
    submissionId: submission.id,
    testCase: result.testCase,
    passed: result.passed,
    stdout: result.stdout,
    expected: result.expected,
    stderr: result.stderr,
    compileOutput: result.compile_output,
    status: result.status,
    memory: result.memory,
    time: result.time,
  }));

  await prisma.testCaseResult.createMany({ data: testCaseResults });

  return prisma.submission.findUnique({
    where: { id: submission.id },
    include: { testCases: true },
  });
};

// --- Main Execute Action ---

export const executeCode = async (
  source_code: string,
  language: string,
  stdin: string[],
  expected_outputs: string[],
  id: string,
) => {
  const user = await getCurrentUserData();

  const validationError = validateExecutionRequest(user, stdin, expected_outputs);
  if (validationError) {
    return { success: false, error: validationError.error };
  }

  const languageId = getCodeboxLanguageId(language);
  const { detailedResults, allPassed } = await runCodeOnCodebox(source_code, languageId, stdin, expected_outputs);

  const submissionWithTestCases = await saveSubmissionAndResults(
    // @ts-ignore
    user.id,
    id,
    source_code,
    languageId,
    stdin,
    detailedResults,
    allPassed
  );

  return {
    success: true,
    submission: submissionWithTestCases,
  };
};

export const getAllSubmissionByCurrentUserForProblem = async (
  problemId: string,
) => {
  const user = await getCurrentUserData();

  if (!user || "error" in user) {
    return { success: false, error: "No authenticated user found" };
  }

  const submissions = await prisma.submission.findMany({
    where: {
      problemId: problemId,
      // @ts-ignore
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    success: true,
    data: submissions,
  };
};
