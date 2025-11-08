/**
 * GuardiaListCard Component
 *
 * Displays the list of added guardias (on-call shifts) with delete actions
 * Features:
 * - Sorted list of guardias by date
 * - Each guardia shows formatted date, hours, and description
 * - Delete button for each guardia
 * - Empty state message
 * - Count badge and total hours summary
 */

"use client";

import { Shield, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Guardia } from "@/src/core/domain/guardia";

interface GuardiaListCardProps {
  guardias: Guardia[];
  onRemove: (date: Date) => void;
  disabled?: boolean;
}

export function GuardiaListCard({
  guardias,
  onRemove,
  disabled = false,
}: GuardiaListCardProps) {
  const hasGuardias = guardias.length > 0;
  const totalHours = guardias.reduce((sum, g) => sum + g.hours, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            Guardias Añadidas
          </span>
          {hasGuardias && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {guardias.length}
              </Badge>
              <Badge className="text-sm bg-amber-600 hover:bg-amber-700">
                {totalHours}h total
              </Badge>
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-5">
        {!hasGuardias ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No has añadido ninguna guardia todavía</p>
            <p className="text-xs mt-1">
              Usa el formulario de arriba para añadir guardias
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {guardias.map((guardia) => {
              const dateKey = guardia.date.toISOString();
              const formattedDate = guardia.getFormattedDate();
              const hasDescription = guardia.hasDescription();

              return (
                <div
                  key={dateKey}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/50 dark:hover:bg-amber-950/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {formattedDate}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        •
                      </span>
                      <Badge className="text-xs bg-amber-600 hover:bg-amber-700">
                        {guardia.hours}h
                      </Badge>
                    </div>
                    {hasDescription && (
                      <p className="text-xs text-muted-foreground truncate">
                        {guardia.description}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => onRemove(guardia.date)}
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 shrink-0"
                    aria-label={`Eliminar guardia ${formattedDate}`}
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
