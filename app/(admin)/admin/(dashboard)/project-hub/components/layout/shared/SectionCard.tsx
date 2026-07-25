"use client";

import { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  actions,
  children,
  className,
}: SectionCardProps) {
  return (
    <Card className={cn("border-muted shadow-none", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>

          {actions}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">{children}</CardContent>
    </Card>
  );
}
