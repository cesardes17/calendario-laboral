/**
 * Monthly Hours Chart Component (HU-Statistics / SCRUM-50)
 *
 * Displays a combination chart (bar + line) showing hours worked per month.
 * Interactive with hover tooltips and smooth animations.
 */

"use client";

import React, { useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { EstadisticasDias } from "@/src/core/domain";
import { Button } from "../../ui/button";
import { TrendingUp, BarChart3 } from "lucide-react";

interface MonthlyHoursChartProps {
  statistics: EstadisticasDias;
}

interface ChartDataItem {
  month: string;
  monthShort: string;
  hours: number;
  days: number;
  avgHoursPerDay: number;
}

interface TooltipPayload {
  payload: ChartDataItem;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

type ChartMode = "bar" | "line" | "combo";

/**
 * Custom tooltip for monthly hours chart
 */
const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartDataItem;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-sm mb-2">{data.month}</p>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="text-muted-foreground">Horas: </span>
            <span className="font-semibold">{data.hours.toFixed(2)} h</span>
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Días trabajados: </span>
            <span className="font-semibold">{data.days}</span>
          </p>
          {data.days > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Promedio: {data.avgHoursPerDay.toFixed(2)} h/día
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function MonthlyHoursChart({ statistics }: MonthlyHoursChartProps) {
  const [chartMode, setChartMode] = useState<ChartMode>("combo");

  const monthlyStats = statistics.estadisticasMensuales;

  // Prepare data for the chart
  const chartData: ChartDataItem[] = monthlyStats.nombresMeses.map((month, index) => {
    const hours = monthlyStats.horasPorMes[index];
    const days = monthlyStats.diasTrabajadosPorMes[index];
    const avgHoursPerDay = days > 0 ? hours / days : 0;

    return {
      month,
      monthShort: month.substring(0, 3), // First 3 letters
      hours: Math.round(hours * 100) / 100, // Round to 2 decimals
      days,
      avgHoursPerDay: Math.round(avgHoursPerDay * 100) / 100,
    };
  });

  // Calculate Y axis max
  const maxHours = Math.max(...chartData.map((d) => d.hours));
  const yAxisMax = Math.ceil(maxHours * 1.1); // Add 10% padding

  return (
    <div className="w-full space-y-4">
      {/* Chart mode toggle */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant={chartMode === "bar" ? "default" : "outline"}
          size="sm"
          onClick={() => setChartMode("bar")}
          className="h-8"
        >
          <BarChart3 className="w-4 h-4 mr-1" />
          Barras
        </Button>
        <Button
          variant={chartMode === "line" ? "default" : "outline"}
          size="sm"
          onClick={() => setChartMode("line")}
          className="h-8"
        >
          <TrendingUp className="w-4 h-4 mr-1" />
          Línea
        </Button>
        <Button
          variant={chartMode === "combo" ? "default" : "outline"}
          size="sm"
          onClick={() => setChartMode("combo")}
          className="h-8"
        >
          Combo
        </Button>
      </div>

      {/* Chart */}
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="monthShort"
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              domain={[0, yAxisMax]}
              label={{
                value: "Horas trabajadas",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12 },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ fontSize: 12 }}
            />

            {/* Show bar, line, or both based on mode */}
            {(chartMode === "bar" || chartMode === "combo") && (
              <Bar
                dataKey="hours"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
                animationDuration={800}
                name="Horas trabajadas"
              />
            )}

            {(chartMode === "line" || chartMode === "combo") && (
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={800}
                name={chartMode === "combo" ? "Tendencia" : "Horas trabajadas"}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
