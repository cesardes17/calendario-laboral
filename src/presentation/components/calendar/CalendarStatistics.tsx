/**
 * Calendar Statistics Component (HU-Statistics / SCRUM-50)
 *
 * Displays comprehensive statistics about the annual calendar:
 * - Executive summary
 * - Day distribution with visual bars
 * - Percentages and totals
 * - Work/rest ratios
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { EstadisticasDias } from "@/src/core/domain";
import { Progress } from "../ui/progress";
import {
  Briefcase,
  Coffee,
  Plane,
  PartyPopper,
  CalendarClock,
  Ban,
  TrendingUp,
  Calendar,
} from "lucide-react";

export interface CalendarStatisticsProps {
  /** Day statistics to display */
  statistics: EstadisticasDias;

  /** Year being displayed */
  year: number;
}

interface StatItem {
  icon: React.ReactNode;
  label: string;
  description: string;
  count: number;
  percentage: number;
  color: string;
  includeInEffective: boolean;
}

/**
 * CalendarStatistics component
 *
 * Shows a comprehensive statistics panel with visual indicators.
 *
 * @example
 * ```tsx
 * <CalendarStatistics statistics={dayStatistics} year={2025} />
 * ```
 */
export function CalendarStatistics({
  statistics,
  year,
}: CalendarStatisticsProps) {
  // Prepare stat items with colors matching the calendar
  const statItems: StatItem[] = [
    {
      icon: <Briefcase className="w-4 h-4" />,
      label: "Trabajo",
      description: "Días laborables según tu ciclo de trabajo",
      count: statistics.diasTrabajados,
      percentage: statistics.porcentajeTrabajo,
      color: "bg-blue-500 dark:bg-blue-400",
      includeInEffective: true,
    },
    {
      icon: <Coffee className="w-4 h-4" />,
      label: "Descanso",
      description: "Días de descanso según tu ciclo laboral",
      count: statistics.diasDescanso,
      percentage: statistics.porcentajeDescanso,
      color: "bg-green-500 dark:bg-green-400",
      includeInEffective: true,
    },
    {
      icon: <Plane className="w-4 h-4" />,
      label: "Vacaciones",
      description: "Períodos de vacaciones configurados",
      count: statistics.diasVacaciones,
      percentage: statistics.porcentajeVacaciones,
      color: "bg-amber-500 dark:bg-amber-400",
      includeInEffective: true,
    },
    {
      icon: <CalendarClock className="w-4 h-4" />,
      label: "Festivos trabajados",
      description: "Festivos oficiales que se trabajan",
      count: statistics.diasFestivosTrabajados,
      percentage:
        statistics.diasEfectivos > 0
          ? (statistics.diasFestivosTrabajados / statistics.diasEfectivos) * 100
          : 0,
      color: "bg-red-500 dark:bg-red-400",
      includeInEffective: true,
    },
    {
      icon: <PartyPopper className="w-4 h-4" />,
      label: "Festivos",
      description: "Festivos oficiales no trabajados",
      count: statistics.diasFestivos,
      percentage:
        statistics.diasEfectivos > 0
          ? (statistics.diasFestivos / statistics.diasEfectivos) * 100
          : 0,
      color: "bg-orange-400 dark:bg-orange-300",
      includeInEffective: true,
    },
    {
      icon: <Ban className="w-4 h-4" />,
      label: "No contratado",
      description: "Días anteriores a tu fecha de inicio de contrato",
      count: statistics.diasNoContratados,
      percentage: 0, // Not included in effective days
      color: "bg-gray-200 dark:bg-gray-700",
      includeInEffective: false,
    },
  ];

  // Filter only items with days > 0
  const itemsToShow = statItems.filter((item) => item.count > 0);

  // Calculate work/rest ratio
  const totalRestDays =
    statistics.diasDescanso +
    statistics.diasVacaciones +
    statistics.diasFestivos;
  const workRestRatio =
    totalRestDays > 0
      ? (statistics.totalDiasLaborables / totalRestDays).toFixed(2)
      : "N/A";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          📊 Resumen del Año {year}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Executive Summary */}
        <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold text-foreground">
                En {year} trabajaste {statistics.totalDiasLaborables} días de{" "}
                {statistics.diasEfectivos} días efectivos
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Cumplimiento:{" "}
                {statistics.diasEfectivos > 0
                  ? (
                      (statistics.totalDiasLaborables /
                        statistics.diasEfectivos) *
                      100
                    ).toFixed(2)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>

        {/* Distribution Section */}
        <div>
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Distribución de días
          </h3>

          <div className="space-y-4">
            {itemsToShow.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1">
                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center text-white flex-shrink-0 ${item.color}`}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <span className="text-sm font-semibold">
                      {item.count} días
                    </span>
                    {item.includeInEffective && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({item.percentage.toFixed(2)}%)
                      </span>
                    )}
                  </div>
                </div>

                {item.includeInEffective && (
                  <Progress
                    value={item.percentage}
                    className="h-2"
                    indicatorClassName={item.color}
                  />
                )}

                {!item.includeInEffective && (
                  <p className="text-xs text-muted-foreground italic pl-8">
                    (no incluido en estadísticas)
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Totals */}
        <div className="pt-4 border-t space-y-3">
          <h3 className="text-base font-semibold mb-3">Información adicional</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                Días laborables totales
              </p>
              <p className="text-lg font-bold">
                {statistics.totalDiasLaborables}
              </p>
              <p className="text-xs text-muted-foreground">
                Trabajo + Festivos trabajados
              </p>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                Días no laborables
              </p>
              <p className="text-lg font-bold">
                {statistics.totalDiasNoLaborables}
              </p>
              <p className="text-xs text-muted-foreground">
                Descanso + Vacaciones + Festivos
              </p>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                Ratio trabajo/descanso
              </p>
              <p className="text-lg font-bold">{workRestRatio}</p>
              <p className="text-xs text-muted-foreground">
                Por cada día de descanso
              </p>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Total año</p>
              <p className="text-lg font-bold">{statistics.totalDiasAnio}</p>
              <p className="text-xs text-muted-foreground">
                {statistics.totalDiasAnio === 366 ? "Año bisiesto" : "Año normal"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
