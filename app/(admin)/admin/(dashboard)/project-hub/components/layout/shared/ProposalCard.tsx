import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProposalCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function ProposalCard({
  title,
  description,
  children,
  actions,
  footer,
  className,
}: ProposalCardProps) {
  return (
    <Card
      className={cn("rounded-xl border shadow-sm transition-all", className)}
    >
      <CardHeader className="pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg">{title}</CardTitle>

            {description && <CardDescription>{description}</CardDescription>}
          </div>

          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">{children}</CardContent>

      {footer && (
        <CardFooter className="border-t bg-muted/30">{footer}</CardFooter>
      )}
    </Card>
  );
}
