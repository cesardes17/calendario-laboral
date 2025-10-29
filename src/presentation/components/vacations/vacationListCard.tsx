/**
 * VacationListCard Component
 *
 * Displays the list of added vacation periods with day counts and actions
 * Features:
 * - Sorted list of vacation periods by start date
 * - Each period shows date range, day count, and optional description
 * - Delete button for each vacation
 * - Empty state message
 * - Count badge
 */

"use client";

import { Calendar, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { VacationPeriod } from "@/src/core/domain/vacationPeriod";

interface VacationListCardProps {
  vacations: VacationPeriod[];
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export function VacationListCard({
  vacations,
  onRemove,
  disabled = false,
}: VacationListCardProps) {
  const hasVacations = vacations.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Períodos de Vacaciones
          </span>
          {hasVacations && (
            <Badge variant="secondary" className="text-sm">
              {vacations.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-5">
        {!hasVacations ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No has añadido ningún período de vacaciones todavía</p>
            <p className="text-xs mt-1">
              Usa el formulario de arriba para añadir tus vacaciones
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {vacations.map((vacation, index) => {
              const dateRange = vacation.getFormattedDateRange();
              const dayCount = vacation.getDayCount();
              const description = vacation.hasDescription()
                ? vacation.description
                : null;

              return (
                <div
                  key={`vacation-${index}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {dateRange}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {dayCount} {dayCount === 1 ? "día" : "días"}
                      </Badge>
                    </div>
                    {description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {description}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => onRemove(index)}
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 flex-shrink-0"
                    aria-label={`Eliminar vacaciones ${dateRange}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
