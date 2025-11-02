/**
 * Day Distribution Pie Chart Component (HU-Statistics / SCRUM-50)
 *
 * Displays a pie chart showing the distribution of days by state.
 * Uses the same colors as the calendar for consistency.
 */

"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { EstadisticasDias } from "@/src/core/domain";

interface DayDistributionPieChartProps {
  statistics: EstadisticasDias;
}

// Colors matching the calendar (from CalendarStatistics.tsx)
const DAY_STATE_COLORS = {
  Trabajo: "#22c55e", // green-500
  Descanso: "#64748b", // slate-500
  Vacaciones: "#f59e0b", // amber-500
  Festivo: "#ef4444", // red-500
  FestivoTrabajado: "#8b5cf6", // violet-500
  NoContratado: "#9ca3af", // gray-400
};

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  percentage: number;
  [key: string]: string | number; // Index signature for Recharts compatibility
}

interface TooltipPayload {
  payload: ChartDataItem;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

/**
 * Custom label for pie chart slices showing percentage
 */
const renderCustomLabel = (props: {
  cx?: string | number;
  cy?: string | number;
  midAngle?: number;
  innerRadius?: string | number;
  outerRadius?: string | number;
  percent?: number;
}) => {
  const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 } = props;

  // Convert to numbers if they're strings
  const numCx = typeof cx === 'string' ? parseFloat(cx) : cx;
  const numCy = typeof cy === 'string' ? parseFloat(cy) : cy;
  const numInner = typeof innerRadius === 'string' ? parseFloat(innerRadius) : innerRadius;
  const numOuter = typeof outerRadius === 'string' ? parseFloat(outerRadius) : outerRadius;

  const percentage = percent * 100;

  // Don't show label if percentage is too small
  if (percentage < 5) return null;

  const RADIAN = Math.PI / 180;
  const radius = numInner + (numOuter - numInner) * 0.5;
  const x = numCx + radius * Math.cos(-midAngle * RADIAN);
  const y = numCy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > numCx ? "start" : "end"}
      dominantBaseline="central"
      className="text-sm font-semibold"
    >
      {`${percentage.toFixed(1)}%`}
    </text>
  );
};

/**
 * Custom tooltip for pie chart
 */
const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartDataItem;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-sm mb-1">{data.name}</p>
        <p className="text-sm">
          <span className="font-semibold">{data.value}</span> días
        </p>
        <p className="text-xs text-muted-foreground">
          {data.percentage.toFixed(2)}% del total
        </p>
      </div>
    );
  }
  return null;
};

export function DayDistributionPieChart({ statistics }: DayDistributionPieChartProps) {
  // Prepare data for the chart
  const chartData: ChartDataItem[] = [
    {
      name: "Trabajo",
      value: statistics.diasTrabajados,
      color: DAY_STATE_COLORS.Trabajo,
      percentage: (statistics.diasTrabajados / statistics.totalDiasAnio) * 100,
    },
    {
      name: "Descanso",
      value: statistics.diasDescanso,
      color: DAY_STATE_COLORS.Descanso,
      percentage: (statistics.diasDescanso / statistics.totalDiasAnio) * 100,
    },
    {
      name: "Vacaciones",
      value: statistics.diasVacaciones,
      color: DAY_STATE_COLORS.Vacaciones,
      percentage: (statistics.diasVacaciones / statistics.totalDiasAnio) * 100,
    },
    {
      name: "Festivo",
      value: statistics.diasFestivos,
      color: DAY_STATE_COLORS.Festivo,
      percentage: (statistics.diasFestivos / statistics.totalDiasAnio) * 100,
    },
    {
      name: "Festivo trabajado",
      value: statistics.diasFestivosTrabajados,
      color: DAY_STATE_COLORS.FestivoTrabajado,
      percentage: (statistics.diasFestivosTrabajados / statistics.totalDiasAnio) * 100,
    },
  ];

  // Only include NoContratado if there are any
  if (statistics.diasNoContratados > 0) {
    chartData.push({
      name: "No contratado",
      value: statistics.diasNoContratados,
      color: DAY_STATE_COLORS.NoContratado,
      percentage: (statistics.diasNoContratados / statistics.totalDiasAnio) * 100,
    });
  }

  // Filter out items with 0 days
  const filteredData = chartData.filter((item) => item.value > 0);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            animationDuration={800}
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => {
              // Access the payload which contains our ChartDataItem
              const item = entry.payload as ChartDataItem;
              return `${value} (${item.value} días)`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
