import axios from "axios";

export interface CodeboxSubmission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
}

export interface CodeboxResult {
  token: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time?: string | number | null;
  memory?: string | number | null;
  message?: string | null;
  error?: string;
  status?: {
    id: number;
    description?: string;
  };
}

const CODEBOX_URL = process.env.CODEBOX_URL ?? "http://localhost:3000";

function getCodeboxHeaders() {
  const authToken = process.env.CODEBOX_AUTH_TOKEN;

  if (!authToken) {
    throw new Error("CODEBOX_AUTH_TOKEN is not configured");
  }

  return {
    "X-Auth-Token": authToken,
    "Content-Type": "application/json",
  };
}

export function getCodeboxLanguageId(language: string) {
  const languageMap = {
    C: 50,
    CPP: 54,
    CPLUSPLUS: 54,
    JAVA: 62,
    JAVASCRIPT: 63,
    TYPESCRIPT: 74,
    PYTHON: 71,
  };

  const languageId =
    languageMap[language.toUpperCase() as keyof typeof languageMap];

  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }

  return languageId;
}

export function getCodeboxLanguageName(languageId: number) {
  const languageMap = {
    50: "C",
    54: "C++",
    62: "Java",
    63: "JavaScript",
    71: "Python",
    74: "TypeScript",
  };

  return languageMap[languageId as keyof typeof languageMap] ?? "Unknown";
}

export async function submitBatch(submissions: CodeboxSubmission[]) {
  const { data } = await axios.post<
    { token: string } | Array<{ token: string }>
  >(
    `${CODEBOX_URL}/submissions/batch`,
    { submissions },
    {
      params: { base64_encoded: "false" },
      headers: getCodeboxHeaders(),
    },
  );

  return Array.isArray(data) ? data : [data];
}

export async function pollBatchResults(
  tokens: string[],
  timeoutMs = 30_000,
) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const { data } = await axios.get<{ submissions: CodeboxResult[] }>(
      `${CODEBOX_URL}/submissions/batch`,
      {
        params: {
          tokens: tokens.join(","),
          base64_encoded: "false",
        },
        headers: getCodeboxHeaders(),
      },
    );

    const invalidResult = data.submissions.find((result) => !result.status);
    if (invalidResult) {
      throw new Error(
        invalidResult.error ?? invalidResult.message ?? "Invalid CodeBox response",
      );
    }

    const allFinished = data.submissions.every(
      ({ status }) => status!.id !== 1 && status!.id !== 2,
    );

    if (allFinished) {
      return data.submissions;
    }

    await sleep(500);
  }

  throw new Error("Code execution timed out while polling CodeBox results");
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
