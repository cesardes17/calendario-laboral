/**
 * HolidayListCard Component
 *
 * Displays the list of added holidays with edit/delete actions
 * Features:
 * - Sorted list of holidays by date
 * - Each holiday shows formatted date and name
 * - Delete button for each holiday
 * - Empty state message
 * - Count badge
 */

"use client";

import { Calendar, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Holiday } from "@/src/core/domain/holiday";

interface HolidayListCardProps {
  holidays: Holiday[];
  onRemove: (date: Date) => void;
  disabled?: boolean;
}

export function HolidayListCard({
  holidays,
  onRemove,
  disabled = false,
}: HolidayListCardProps) {
  const hasHolidays = holidays.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Festivos Añadidos
          </span>
          {hasHolidays && (
            <Badge variant="secondary" className="text-sm">
              {holidays.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-5">
        {!hasHolidays ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No has añadido ningún festivo todavía</p>
            <p className="text-xs mt-1">
              Usa el formulario de arriba para añadir festivos
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {holidays.map((holiday) => {
              const dateKey = holiday.date.toISOString();
              const formattedDate = holiday.getFormattedDate();
              const displayText = holiday.hasName()
                ? holiday.name
                : "Sin nombre";

              return (
                <div
                  key={dateKey}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {formattedDate}
                      </span>
                      {holiday.hasName() && (
                        <span className="text-xs text-muted-foreground">
                          •
                        </span>
                      )}
                      <span
                        className={`text-sm ${
                          holiday.hasName()
                            ? "text-foreground"
                            : "text-muted-foreground italic"
                        } truncate`}
                      >
                        {displayText}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => onRemove(holiday.date)}
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                    aria-label={`Eliminar festivo ${formattedDate}`}
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
