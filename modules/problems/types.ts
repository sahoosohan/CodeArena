import type { Difficulty } from "@/lib/generated/prisma/enums";

export type ProblemListItem = {
  id: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  solvedBy?: unknown[];
};

export type ProblemUser = {
  role?: string | null;
} | null | undefined;
