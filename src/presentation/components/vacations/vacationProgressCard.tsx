/**
 * VacationProgressCard Component
 *
 * Displays a progress bar showing vacation days used vs the 30-day limit
 * Features:
 * - Visual progress bar with color coding
 * - Shows used/remaining days
 * - Warning when approaching limit (>80%)
 * - Error state when at or over limit
 */

"use client";

import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui";
import { Badge } from "../ui/badge";

interface VacationProgressCardProps {
  totalDays: number;
  maxDays?: number;
}

const DEFAULT_MAX_DAYS = 30;

export function VacationProgressCard({
  totalDays,
  maxDays = DEFAULT_MAX_DAYS,
}: VacationProgressCardProps) {
  const remainingDays = Math.max(0, maxDays - totalDays);
  const percentage = Math.min(100, (totalDays / maxDays) * 100);

  // Determine color based on usage
  const getColorClass = () => {
    if (percentage >= 100) return "bg-destructive";
    if (percentage >= 80) return "bg-orange-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getTextColorClass = () => {
    if (percentage >= 100) return "text-destructive";
    if (percentage >= 80) return "text-orange-600 dark:text-orange-400";
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const getStatusBadge = () => {
    if (percentage >= 100) {
      return (
        <Badge variant="destructive" className="text-xs">
          Límite alcanzado
        </Badge>
      );
    }
    if (percentage >= 80) {
      return (
        <Badge className="bg-orange-500 text-white text-xs">
          Cerca del límite
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Días de Vacaciones
          </span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-5">
        <div className="space-y-3">
          {/* Progress Bar */}
          <div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getColorClass()}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Statistics */}
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className={`font-semibold ${getTextColorClass()}`}>
                {totalDays} {totalDays === 1 ? "día" : "días"}
              </span>
              <span className="text-muted-foreground"> utilizados</span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-foreground">
                {remainingDays} {remainingDays === 1 ? "día" : "días"}
              </span>
              <span className="text-muted-foreground"> restantes</span>
            </div>
          </div>

          {/* Limit Info */}
          <div className="text-center pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Límite anual: {maxDays} días
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
