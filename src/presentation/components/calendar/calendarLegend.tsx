/**
 * Calendar Legend Component
 *
 * Shows the color legend for different day states
 * Colors match HU specification with full dark mode support
 * Features: collapsible, day counters, filters unused states
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { EstadoDia, EstadisticasDias } from "@/src/core/domain";
import {
  Briefcase,
  Coffee,
  Plane,
  PartyPopper,
  CalendarClock,
  Ban,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "../ui/button";

export interface CalendarLegendProps {
  /** Day statistics for showing counters (optional) */
  statistics?: EstadisticasDias | null;

  /** Initially collapsed state (default: false) */
  defaultCollapsed?: boolean;
}

interface LegendItem {
  estado: EstadoDia;
  label: string;
  color: string;
  description: string;
  icon: React.ReactNode;
}

const LEGEND_ITEMS: LegendItem[] = [
  {
    estado: "Trabajo",
    label: "Trabajo",
    color: "bg-blue-500 dark:bg-blue-400",
    description: "Día laborable",
    icon: <Briefcase className="w-3 h-3" />,
  },
  {
    estado: "Descanso",
    label: "Descanso",
    color: "bg-green-500 dark:bg-green-400",
    description: "Día de descanso según ciclo",
    icon: <Coffee className="w-3 h-3" />,
  },
  {
    estado: "Vacaciones",
    label: "Vacaciones",
    color: "bg-yellow-400 dark:bg-yellow-300",
    description: "Período de vacaciones",
    icon: <Plane className="w-3 h-3" />,
  },
  {
    estado: "Guardia",
    label: "Guardia",
    color: "bg-purple-600 dark:bg-purple-500",
    description: "Guardia en día de descanso/festivo",
    icon: <Shield className="w-3 h-3" />,
  },
  {
    estado: "Festivo",
    label: "Festivo",
    color: "bg-orange-400 dark:bg-orange-300",
    description: "Día festivo (#FB923C)",
    icon: <PartyPopper className="w-3 h-3" />,
  },
  {
    estado: "FestivoTrabajado",
    label: "Festivo Trabajado",
    color: "bg-red-500 dark:bg-red-400",
    description: "Festivo que se trabaja",
    icon: <CalendarClock className="w-3 h-3" />,
  },
  {
    estado: "NoContratado",
    label: "No Contratado",
    color: "bg-gray-200 dark:bg-gray-700",
    description: "Día sin contrato",
    icon: <Ban className="w-3 h-3" />,
  },
];

/**
 * Gets the count of days for a specific state from statistics
 */
function getDayCount(estado: EstadoDia, statistics?: EstadisticasDias | null): number {
  if (!statistics) return 0;

  const countMap: Record<EstadoDia, number> = {
    Trabajo: statistics.diasTrabajados,
    Descanso: statistics.diasDescanso,
    Vacaciones: statistics.diasVacaciones,
    Guardia: statistics.diasGuardias,
    Festivo: statistics.diasFestivos,
    FestivoTrabajado: statistics.diasFestivosTrabajados,
    NoContratado: statistics.diasNoContratados,
  };

  return countMap[estado] || 0;
}

export function CalendarLegend({
  statistics,
  defaultCollapsed = false,
}: CalendarLegendProps = {}) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Filter items to show only states that have days (if statistics available)
  const itemsToShow = statistics
    ? LEGEND_ITEMS.filter((item) => getDayCount(item.estado, statistics) > 0)
    : LEGEND_ITEMS;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            📊 Leyenda
            {statistics && (
              <span className="text-sm font-normal text-muted-foreground">
                ({statistics.totalDiasAnio} días)
              </span>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
            aria-label={isCollapsed ? "Expandir leyenda" : "Colapsar leyenda"}
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {itemsToShow.map((item) => {
              const dayCount = getDayCount(item.estado, statistics);

              return (
                <div key={item.estado} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded ${item.color} flex-shrink-0 flex items-center justify-center text-white`}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.label}
                      </p>
                      {statistics && (
                        <span className="text-xs font-semibold text-muted-foreground">
                          ({dayCount})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Extra shift indicator legend (if there are extra shifts) */}
            {statistics && statistics.diasTurnosExtras > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-muted flex-shrink-0 flex items-center justify-center relative">
                  {/* Show the triangle indicator */}
                  <div className="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-t-amber-500 border-l-[12px] border-l-transparent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1">
                    <p className="text-sm font-medium text-foreground">
                      Turno Extra
                    </p>
                    <span className="text-xs font-semibold text-muted-foreground">
                      ({statistics.diasTurnosExtras})
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    Horas adicionales ({statistics.horasTurnosExtras.toFixed(1)}h)
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
