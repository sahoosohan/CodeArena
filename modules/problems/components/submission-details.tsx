import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CpuIcon, Code, CheckCircle2, XCircle } from "lucide-react";

type Submission = {
  status?: string | null;
  memory?: string | number | null;
  time?: string | number | null;
  createdAt?: string | number | Date | null;
  language?: string | null;
};

type SubmissionDetailsProps = {
  submission: Submission;
};

const parseMetricValues = (
  value: string | number | null | undefined,
  normalize: (value: string) => string = (metric) => metric,
) => {
  if (value === null || value === undefined || value === "") return [];
  if (typeof value === "number") return [value];

  try {
    const parsed: unknown = JSON.parse(value);
    const values = Array.isArray(parsed) ? parsed : [parsed];

    return values
      .map((metric) => {
        if (typeof metric === "number") return metric;
        if (typeof metric === "string") return parseFloat(normalize(metric));
        return Number.NaN;
      })
      .filter((metric): metric is number => Number.isFinite(metric));
  } catch {
    const metric = parseFloat(normalize(value));
    return Number.isFinite(metric) ? [metric] : [];
  }
};

const averageMetric = (values: number[]) => {
  if (!values.length) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
};

export const SubmissionDetails = ({ submission }: SubmissionDetailsProps) => {
  const isSuccess = submission.status === "Accepted";
  const averageMemory = averageMetric(parseMetricValues(submission.memory));
  const averageTime = averageMetric(
    parseMetricValues(submission.time, (metric) => metric.replace(" s", "")),
  );
  const submittedAt = submission.createdAt
    ? new Date(submission.createdAt).toLocaleString()
    : "N/A";

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Submission Details</CardTitle>
          {isSuccess ? (
            <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Success
            </Badge>
          ) : (
            <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
              <XCircle className="mr-1 h-3 w-3" />
              Failed
            </Badge>
          )}
        </div>
        <CardDescription>
          Submitted at {submittedAt}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Language</p>
              <p className="text-sm text-muted-foreground">{submission.language ?? "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CpuIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Memory (avg)</p>
              <p className="text-sm text-muted-foreground">{averageMemory.toFixed(2)} KB</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Time (avg)</p>
              <p className="text-sm text-muted-foreground">{averageTime.toFixed(3)} s</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
