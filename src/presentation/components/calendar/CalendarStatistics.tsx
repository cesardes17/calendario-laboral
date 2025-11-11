/**
 * Calendar Statistics Component (HU-Statistics / SCRUM-50)
 *
 * Displays comprehensive statistics about the annual calendar:
 * - Executive summary
 * - Day distribution with visual bars
 * - Percentages and totals
 * - Work/rest ratios
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { EstadisticasDias, WeekdayName } from "@/src/core/domain";
import { Progress } from "../ui/progress";
import {
  Briefcase,
  Coffee,
  Plane,
  PartyPopper,
  CalendarClock,
  Ban,
  Calendar,
  ChevronDown,
  ChartNoAxesColumnIncreasing,
  Lightbulb,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { Button } from "../ui";

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
 * Generates automatic insights about work patterns based on weekly distribution
 */
function generateWorkPatternInsights(statistics: EstadisticasDias): string[] {
  const insights: string[] = [];
  const dist = statistics.distribucionSemanal;

  if (dist.totalDiasTrabajados === 0) {
    return insights;
  }

  // Check if works weekends
  const weekendDays = dist.diasPorSemana.sabado + dist.diasPorSemana.domingo;
  const weekdaysDays =
    dist.diasPorSemana.lunes +
    dist.diasPorSemana.martes +
    dist.diasPorSemana.miercoles +
    dist.diasPorSemana.jueves +
    dist.diasPorSemana.viernes;

  if (weekendDays === 0) {
    insights.push("No trabajas fines de semana");
  } else if (weekendDays > weekdaysDays * 0.3) {
    insights.push("Trabajas frecuentemente los fines de semana");
  }

  // Check distribution uniformity
  const weekdays = [
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
  ] as const;
  const weekdayCounts = weekdays.map((day) => dist.diasPorSemana[day]);
  const maxWeekday = Math.max(...weekdayCounts);
  const minWeekday = Math.min(...weekdayCounts.filter((c) => c > 0));

  if (
    weekdayCounts.filter((c) => c > 0).length > 0 &&
    maxWeekday - minWeekday <= 2
  ) {
    insights.push("Tu distribución semanal es uniforme");
  }

  // Highlight most worked day if significant
  const mostWorkedDay = dist.diaMasTrabajado as WeekdayName;
  if (mostWorkedDay && dist.porcentajes[mostWorkedDay] > 20) {
    const dayName =
      mostWorkedDay.charAt(0).toUpperCase() + mostWorkedDay.slice(1);
    insights.push(`Trabajas más los ${dayName}s`);
  }

  // Check if works mainly weekdays
  const weekdaysPercentage = (weekdaysDays / dist.totalDiasTrabajados) * 100;
  if (weekdaysPercentage >= 95) {
    insights.push("Trabajas principalmente entre semana (lunes a viernes)");
  }

  return insights;
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
  const [showContent, setShowContent] = useState(false);

  // Generate work pattern insights
  const workPatternInsights = generateWorkPatternInsights(statistics);

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
      color: "bg-yellow-400 dark:bg-yellow-300",
      includeInEffective: true,
    },
    {
      icon: <Shield className="w-4 h-4" />,
      label: "Guardia",
      description: `Guardias en días de descanso o festivos (${statistics.horasGuardias.toFixed(
        2
      )} horas)`,
      count: statistics.diasGuardias,
      percentage:
        statistics.diasEfectivos > 0
          ? (statistics.diasGuardias / statistics.diasEfectivos) * 100
          : 0,
      color: "bg-purple-600 dark:bg-purple-500",
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
        <CardTitle className="text-xl flex justify-between items-center">
          <span className="flex gap-2">
            <ChartNoAxesColumnIncreasing /> Resumen del Año {year}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowContent((prev) => !prev)}
            className="h-8 w-8 p-0"
          >
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${
                showContent ? "rotate-180" : ""
              }`}
            />
          </Button>
        </CardTitle>
      </CardHeader>
      {showContent && (
        <CardContent className="p-6">
          {/* Grid layout: 1 column on mobile, 2 columns on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribution Section */}
            <div className="shadow border rounded p-4">
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

            {/* Hours Balance Panel (HU-Statistics / SCRUM-50) */}
            {statistics.balanceHoras.horasConvenio > 0 && (
              <div className="shadow border rounded p-4">
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Balance de horas
                </h3>

                <div
                  className={`p-4 rounded-lg border-2 ${
                    statistics.balanceHoras.estado === "excelente"
                      ? "bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800"
                      : statistics.balanceHoras.estado === "ok"
                      ? "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-800"
                      : statistics.balanceHoras.estado === "advertencia"
                      ? "bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800"
                      : "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        Horas trabajadas:
                      </span>
                      <span className="font-semibold">
                        {statistics.balanceHoras.horasTrabajadas.toFixed(2)} h
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        Horas convenio:
                      </span>
                      <span className="font-semibold">
                        {statistics.balanceHoras.horasConvenio.toFixed(2)} h
                      </span>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">Saldo:</span>
                        <span
                          className={`text-lg font-bold flex items-center gap-1 ${
                            statistics.balanceHoras.saldo > 0
                              ? "text-green-700 dark:text-green-400"
                              : statistics.balanceHoras.saldo < 0
                              ? "text-red-700 dark:text-red-400"
                              : "text-gray-700 dark:text-gray-400"
                          }`}
                        >
                          {statistics.balanceHoras.saldo > 0 ? (
                            <TrendingUp className="w-5 h-5" />
                          ) : statistics.balanceHoras.saldo < 0 ? (
                            <TrendingDown className="w-5 h-5" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5" />
                          )}
                          {statistics.balanceHoras.saldo > 0 ? "+" : ""}
                          {statistics.balanceHoras.saldo.toFixed(2)} h
                        </span>
                      </div>
                    </div>

                    <div
                      className={`mt-3 p-3 rounded ${
                        statistics.balanceHoras.tipo === "empresa_debe"
                          ? "bg-green-100 dark:bg-green-900/40"
                          : statistics.balanceHoras.tipo === "empleado_debe"
                          ? "bg-red-100 dark:bg-red-900/40"
                          : "bg-gray-100 dark:bg-gray-900/40"
                      }`}
                    >
                      <p
                        className={`text-sm font-semibold flex items-center gap-2 ${
                          statistics.balanceHoras.tipo === "empresa_debe"
                            ? "text-green-800 dark:text-green-300"
                            : statistics.balanceHoras.tipo === "empleado_debe"
                            ? "text-red-800 dark:text-red-300"
                            : "text-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {statistics.balanceHoras.tipo === "empresa_debe" ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />{" "}
                            {statistics.balanceHoras.mensaje}
                          </>
                        ) : statistics.balanceHoras.tipo === "empleado_debe" ? (
                          <>
                            <AlertTriangle className="w-4 h-4" />{" "}
                            {statistics.balanceHoras.mensaje}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />{" "}
                            {statistics.balanceHoras.mensaje}
                          </>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Equivalente a{" "}
                        {statistics.balanceHoras.equivalenteDias.toFixed(2)}{" "}
                        días laborables
                      </p>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Cumplimiento:
                        </span>
                        <span className="text-sm font-bold">
                          {statistics.balanceHoras.porcentajeCumplimiento.toFixed(
                            2
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={Math.min(
                          statistics.balanceHoras.porcentajeCumplimiento,
                          100
                        )}
                        className="h-2"
                        indicatorClassName={
                          statistics.balanceHoras.estado === "excelente"
                            ? "bg-green-500 dark:bg-green-400"
                            : statistics.balanceHoras.estado === "ok"
                            ? "bg-yellow-500 dark:bg-yellow-400"
                            : statistics.balanceHoras.estado === "advertencia"
                            ? "bg-orange-500 dark:bg-orange-400"
                            : "bg-red-500 dark:bg-red-400"
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Hours breakdown by day type */}
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-3">
                    Desglose de horas
                  </h4>
                  <div className="space-y-2">
                    {[
                      {
                        label: "Lunes-Viernes",
                        hours: statistics.desgloseHorasPorTipo.lunesViernes,
                        total: statistics.balanceHoras.horasTrabajadas,
                      },
                      {
                        label: "Sábados",
                        hours: statistics.desgloseHorasPorTipo.sabados,
                        total: statistics.balanceHoras.horasTrabajadas,
                      },
                      {
                        label: "Domingos",
                        hours: statistics.desgloseHorasPorTipo.domingos,
                        total: statistics.balanceHoras.horasTrabajadas,
                      },
                      {
                        label: "Festivos trabajados",
                        hours:
                          statistics.desgloseHorasPorTipo.festivosTrabajados,
                        total: statistics.balanceHoras.horasTrabajadas,
                      },
                      ...(statistics.horasGuardias > 0
                        ? [
                            {
                              label: "Guardias",
                              hours: statistics.horasGuardias,
                              total: statistics.balanceHoras.horasTrabajadas,
                            },
                          ]
                        : []),
                      ...(statistics.horasTurnosExtras > 0
                        ? [
                            {
                              label: "Turnos extras",
                              hours: statistics.horasTurnosExtras,
                              total: statistics.balanceHoras.horasTrabajadas,
                            },
                          ]
                        : []),
                    ].map(({ label, hours, total }) => {
                      const percentage = total > 0 ? (hours / total) * 100 : 0;
                      return (
                        <div key={label} className="text-sm">
                          <div className="flex justify-between items-center mb-1">
                            <span>{label}:</span>
                            <span className="font-semibold">
                              {hours.toFixed(2)} h{" "}
                              <span className="text-xs text-muted-foreground">
                                ({percentage.toFixed(2)}%)
                              </span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Averages */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      Promedio por día trabajado
                    </p>
                    <p className="text-lg font-bold">
                      {statistics.promedioHorasPorDiaTrabajado.toFixed(2)} h
                    </p>
                  </div>
                  {/* <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      Promedio por semana
                    </p>
                    <p className="text-lg font-bold">
                      {statistics.promedioHorasPorSemana.toFixed(2)} h
                    </p>
                  </div> */}
                </div>
              </div>
            )}

            {/* Weekly Distribution Section (HU-Statistics / SCRUM-50) */}
            {statistics.distribucionSemanal.totalDiasTrabajados > 0 && (
              <div className="shadow border rounded p-4">
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Días trabajados por semana
                </h3>

                <div className="space-y-3">
                  {(
                    [
                      "lunes",
                      "martes",
                      "miercoles",
                      "jueves",
                      "viernes",
                      "sabado",
                      "domingo",
                    ] as const
                  ).map((dia) => {
                    const count =
                      statistics.distribucionSemanal.diasPorSemana[dia];
                    const percentage =
                      statistics.distribucionSemanal.porcentajes[dia];
                    const extraShiftsCount =
                      statistics.distribucionSemanal.turnosExtrasPorSemana[dia];
                    const isHighest =
                      statistics.distribucionSemanal.diaMasTrabajado === dia;
                    const isLowest =
                      statistics.distribucionSemanal.diaMenosTrabajado ===
                        dia && count > 0;

                    return (
                      <div key={dia} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium capitalize flex items-center gap-2">
                            {dia.charAt(0).toUpperCase() + dia.slice(1)}
                            {isHighest && count > 0 && (
                              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                                Más trabajado
                              </span>
                            )}
                            {isLowest && (
                              <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full">
                                Menos trabajado
                              </span>
                            )}
                          </span>
                          <span className="text-sm font-semibold">
                            {count} días
                            {count > 0 && (
                              <span className="text-xs text-muted-foreground ml-2">
                                ({percentage.toFixed(2)}%)
                              </span>
                            )}
                          </span>
                        </div>

                        <Progress
                          value={percentage}
                          className="h-2"
                          indicatorClassName={
                            count === 0
                              ? "bg-gray-300 dark:bg-gray-600"
                              : "bg-indigo-500 dark:bg-indigo-400"
                          }
                        />

                        {/* Extra shifts indicator */}
                        {extraShiftsCount > 0 && (
                          <div className="flex items-center gap-1.5 pl-2 pt-0.5">
                            <div className="w-0 h-0 border-t-[6px] border-t-amber-500 border-l-[6px] border-l-transparent" />
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                              {extraShiftsCount} turno
                              {extraShiftsCount !== 1 ? "s" : ""} extra
                              {extraShiftsCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Work Pattern Insights */}
                {workPatternInsights.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
                          Insights de tu patrón de trabajo
                        </p>
                        <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                          {workPatternInsights.map((insight, idx) => (
                            <li key={idx}>• {insight}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Additional Totals */}
            {/* If total sections is odd, this section spans 2 columns and centers */}
            <div
              className={`shadow border rounded p-4 ${
                // Calculate if total sections is odd
                (2 + // Always: Distribution + Additional Info
                  (statistics.balanceHoras.horasConvenio > 0 ? 1 : 0) +
                  (statistics.distribucionSemanal.totalDiasTrabajados > 0
                    ? 1
                    : 0)) %
                  2 !==
                0
                  ? "lg:col-span-2 lg:max-w-2xl lg:mx-auto"
                  : ""
              }`}
            >
              <h3 className="text-base font-semibold mb-3">
                Información adicional
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Días laborables totales
                  </p>
                  <p className="text-lg font-bold">
                    {statistics.totalDiasLaborables}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Trabajo + Guardias + Festivos trabajados
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

                {statistics.diasTurnosExtras > 0 && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                      Turnos extras realizados
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-lg font-bold text-amber-900 dark:text-amber-300">
                        {statistics.diasTurnosExtras}
                      </p>
                      <div className="w-0 h-0 border-t-[8px] border-t-amber-500 border-l-[8px] border-l-transparent" />
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      {statistics.horasTurnosExtras.toFixed(2)} horas extras
                    </p>
                  </div>
                )}

                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total año</p>
                  <p className="text-lg font-bold">
                    {statistics.totalDiasAnio}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {statistics.totalDiasAnio === 366
                      ? "Año bisiesto"
                      : "Año normal"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
