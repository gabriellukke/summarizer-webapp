import type { Summary } from "@/db/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  summary: Summary;
}

export default function SummaryResult({ summary }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{summary.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Summary
          </p>
          <p className="text-sm leading-relaxed">{summary.summary}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Key Points
          </p>
          <ul className="space-y-1">
            {(summary.bulletPoints as string[]).map((point, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Action Items
          </p>
          <div className="flex flex-wrap gap-2">
            {(summary.actionItems as string[]).map((item, i) => (
              <Badge key={i} variant="secondary">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
