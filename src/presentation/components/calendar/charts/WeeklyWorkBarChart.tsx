/**
 * Weekly Work Bar Chart Component (HU-Statistics / SCRUM-50)
 *
 * Displays a bar chart showing the number of days worked per day of the week.
 * Interactive with hover tooltips.
 */

"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { EstadisticasDias } from "@/src/core/domain";

interface WeeklyWorkBarChartProps {
  statistics: EstadisticasDias;
}

interface ChartDataItem {
  day: string;
  dayShort: string;
  count: number;
  isHighest: boolean;
  isLowest: boolean;
}

interface TooltipPayload {
  payload: ChartDataItem;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

/**
 * Custom tooltip for bar chart
 */
const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartDataItem;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-sm mb-1">{data.day}</p>
        <p className="text-sm">
          <span className="font-semibold">{data.count}</span> días trabajados
        </p>
        {data.isHighest && data.count > 0 && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            ✓ Día más trabajado
          </p>
        )}
        {data.isLowest && data.count > 0 && (
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
            ↓ Día menos trabajado
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function WeeklyWorkBarChart({ statistics }: WeeklyWorkBarChartProps) {
  const dist = statistics.distribucionSemanal;

  // Prepare data for the chart
  const weekdaysData = [
    { day: "Lunes", dayShort: "L", key: "lunes" as const },
    { day: "Martes", dayShort: "M", key: "martes" as const },
    { day: "Miércoles", dayShort: "X", key: "miercoles" as const },
    { day: "Jueves", dayShort: "J", key: "jueves" as const },
    { day: "Viernes", dayShort: "V", key: "viernes" as const },
    { day: "Sábado", dayShort: "S", key: "sabado" as const },
    { day: "Domingo", dayShort: "D", key: "domingo" as const },
  ];

  const chartData: ChartDataItem[] = weekdaysData.map((wd) => ({
    day: wd.day,
    dayShort: wd.dayShort,
    count: dist.diasPorSemana[wd.key],
    isHighest: dist.diaMasTrabajado === wd.key,
    isLowest: dist.diaMenosTrabajado === wd.key && dist.diasPorSemana[wd.key] > 0,
  }));

  // Get max count for Y axis
  const maxCount = Math.max(...chartData.map((d) => d.count));
  const yAxisMax = Math.ceil(maxCount * 1.1); // Add 10% padding

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="dayShort"
            tick={{ fontSize: 14 }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            domain={[0, yAxisMax]}
            label={{
              value: "Días trabajados",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 12 },
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99, 102, 241, 0.1)" }} />
          <Bar dataKey="count" radius={[8, 8, 0, 0]} animationDuration={800}>
            {chartData.map((entry, index) => {
              let fillColor = "#6366f1"; // indigo-500 default

              if (entry.isHighest && entry.count > 0) {
                fillColor = "#22c55e"; // green-500 for highest
              } else if (entry.isLowest) {
                fillColor = "#f97316"; // orange-500 for lowest
              }

              return <Cell key={`cell-${index}`} fill={fillColor} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
