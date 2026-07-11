import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Clock, Cpu, Code, Calendar } from "lucide-react";

type Submission = {
  id: string;
  status?: string | null;
  language?: string | null;
  memory?: string | number | null;
  time?: string | number | null;
  createdAt?: string | number | Date | null;
};

type SubmissionHistoryProps = {
  submissions?: Submission[] | null;
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

export const SubmissionHistory = ({
  submissions = [],
}: SubmissionHistoryProps) => {
  const submissionList = submissions ?? [];

  if (!submissionList.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
          <CardDescription>No submissions yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const formatMemory = (memory: Submission["memory"]) => {
    const memoryValues = parseMetricValues(memory);
    if (!memoryValues.length) return "N/A";

    const avgMemory =
      memoryValues.reduce((total, value) => total + value, 0) /
      memoryValues.length;
    return `${avgMemory.toFixed(2)} KB`;
  };

  const formatTime = (time: Submission["time"]) => {
    const timeValues = parseMetricValues(time, (metric) =>
      metric.replace(" s", ""),
    );
    if (!timeValues.length) return "N/A";

    const avgTime =
      timeValues.reduce((total, value) => total + value, 0) / timeValues.length;
    return `${avgTime.toFixed(3)} s`;
  };

  const formatDate = (dateString: Submission["createdAt"]) => {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Submission History</CardTitle>
        <CardDescription>Your previous submissions for this problem</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-100 pr-4">
          <div className="space-y-3">
            {submissionList.map((submission) => (
              <Card key={submission.id} className="bg-muted/50">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {submission.status === "Accepted" ? (
                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Accepted
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
                          <XCircle className="mr-1 h-3 w-3" />
                          Failed
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(submission.createdAt)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Language</p>
                        <p className="text-sm font-medium">{submission.language ?? "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Memory</p>
                        <p className="text-sm font-medium">{formatMemory(submission.memory)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Time</p>
                        <p className="text-sm font-medium">{formatTime(submission.time)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
