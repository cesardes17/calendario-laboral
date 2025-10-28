/**
 * WorkCyclePartItem Component
 *
 * Displays a single work/rest part configuration:
 * - Badge with part number
 * - Input for work days
 * - Input for rest days
 * - Remove button (if more than 1 part)
 *
 * Layout improvements:
 * - Better mobile responsiveness (stacks on small screens)
 * - Proper spacing between inputs
 * - Improved padding inside the card
 */

"use client";

import { X } from "lucide-react";
import type { CyclePart } from "@/src/core/domain/workCycle";
import { Card, CardContent, Badge, Button } from "./ui";

interface WorkCyclePartItemProps {
  part: CyclePart;
  index: number;
  canRemove: boolean;
  onPartChange: (
    index: number,
    field: "workDays" | "restDays",
    value: string
  ) => void;
  onRemove: (index: number) => void;
}

export function WorkCyclePartItem({
  part,
  index,
  canRemove,
  onPartChange,
  onRemove,
}: WorkCyclePartItemProps) {
  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Badge variant="outline" className="shrink-0 self-start sm:self-center">
            Parte {index + 1}
          </Badge>

          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {/* Work days input */}
            <div className="flex flex-1 items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={part.workDays || ""}
                onChange={(e) => onPartChange(index, "workDays", e.target.value)}
                className="w-16 rounded-md border border-input bg-background px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="6"
              />
              <span className="text-xs text-muted-foreground">días trabajo</span>
            </div>

            {/* Rest days input */}
            <div className="flex flex-1 items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={part.restDays || ""}
                onChange={(e) => onPartChange(index, "restDays", e.target.value)}
                className="w-16 rounded-md border border-input bg-background px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="3"
              />
              <span className="text-xs text-muted-foreground">
                días descanso
              </span>
            </div>
          </div>

          {/* Remove button */}
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 text-destructive hover:text-destructive self-end sm:self-center"
              onClick={() => onRemove(index)}
              title="Eliminar parte"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
