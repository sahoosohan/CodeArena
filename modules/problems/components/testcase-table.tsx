import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

type TestCaseResult = {
  id?: string | number | null;
  passed?: boolean | null;
  memory?: string | number | null;
  time?: string | number | null;
  stdout?: string | number | null;
  expected?: string | number | null;
};

type TestCaseTableProps = {
  testCases?: TestCaseResult[] | null;
};

export const TestCaseTable = ({ testCases = [] }: TestCaseTableProps) => {
  const testCaseList = testCases ?? [];

  return (
    <div className="w-full rounded-lg border">
      <Table>
        <TableCaption>Test Case Results</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-25">Case #</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Memory</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Output</TableHead>
            <TableHead>Expected</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {testCaseList.map((testCase, index) => (
            <TableRow key={testCase.id ?? index}>
              <TableCell className="font-medium">Test {index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {testCase.passed ? (
                    <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Passed
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
                      <XCircle className="mr-1 h-3 w-3" />
                      Failed
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{testCase.memory ?? "N/A"}</TableCell>
              <TableCell>{testCase.time ?? "N/A"}</TableCell>
              <TableCell className="max-w-50 truncate font-mono text-sm">
                {testCase.stdout ?? "N/A"}
              </TableCell>
              <TableCell className="max-w-50 truncate font-mono text-sm">
                {testCase.expected ?? "N/A"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
