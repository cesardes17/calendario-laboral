/**
 * AnnualHoursInputCard Component
 *
 * Main input card for annual contract hours
 * Features:
 * - Large number input with visual styling
 * - Real-time validation
 * - Weekly hours equivalence display
 * - Icon and description
 */

"use client";

import { Clock } from "lucide-react";
import { Card, CardContent } from "../ui";

interface AnnualHoursInputCardProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
  error?: string | null;
  weeklyEquivalent?: string;
}

export function AnnualHoursInputCard({
  value,
  onChange,
  isValid,
  error,
  weeklyEquivalent,
}: AnnualHoursInputCardProps) {
  return (
    <Card className={`transition-colors ${!isValid && error ? "border-destructive" : ""}`}>
      <CardContent className="pt-6 pb-5">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-foreground">
                Horas Anuales de Convenio
              </h4>
              <p className="text-sm text-muted-foreground">
                Según tu contrato laboral
              </p>
            </div>
          </div>

          {/* Input Section */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`
                  w-full rounded-md border px-4 py-3 text-center text-2xl font-bold
                  bg-background focus:outline-none focus:ring-2 focus:ring-ring
                  transition-colors
                  ${
                    !isValid && error
                      ? "border-destructive focus:ring-destructive"
                      : "border-input"
                  }
                `}
                placeholder="1752"
                aria-label="Horas anuales de convenio"
                aria-invalid={!isValid && !!error}
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground pb-3">
              horas/año
            </span>
          </div>

          {/* Weekly Equivalence */}
          {isValid && weeklyEquivalent && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Equivale a{" "}
                <span className="font-semibold text-foreground">
                  {weeklyEquivalent}
                </span>{" "}
                horas/semana
              </p>
            </div>
          )}

          {/* Error Message */}
          {!isValid && error && (
            <p className="text-sm text-destructive text-center" role="alert">
              {error}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
