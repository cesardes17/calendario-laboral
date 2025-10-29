/**
 * HoursInputCard Component
 *
 * Individual card for configuring hours for a specific day type
 * Features:
 * - Visual card layout with icon
 * - Number input with validation
 * - Error display
 * - Responsive design
 * - Dark mode support
 */

"use client";

import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "../ui";

interface HoursInputCardProps {
  label: string;
  icon: LucideIcon;
  description: string;
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
  error?: string;
}

export function HoursInputCard({
  label,
  icon: Icon,
  description,
  value,
  onChange,
  isValid,
  error,
}: HoursInputCardProps) {
  return (
    <Card className={`transition-colors ${!isValid ? "border-destructive" : ""}`}>
      <CardContent className="pt-6 pb-5">
        <div className="space-y-4">
          {/* Header with icon and label */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground">{label}</h4>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>

          {/* Input with hours label */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.]?[0-9]*"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={`
                w-20 rounded-md border px-3 py-2 text-center text-lg font-semibold
                bg-background focus:outline-none focus:ring-2 focus:ring-ring
                transition-colors
                ${
                  isValid
                    ? "border-input"
                    : "border-destructive focus:ring-destructive"
                }
              `}
              placeholder="8.00"
              aria-label={`Horas para ${label}`}
              aria-invalid={!isValid}
            />
            <span className="text-sm font-medium text-muted-foreground">
              horas/día
            </span>
          </div>

          {/* Error message */}
          {!isValid && error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
