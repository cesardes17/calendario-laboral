/**
 * Calendar Charts Component (HU-Statistics / SCRUM-50)
 *
 * Container component that displays interactive charts for calendar statistics.
 * Includes:
 * - Day distribution pie chart
 * - Weekly work pattern bar chart
 * - Monthly hours line/bar chart
 * - Export functionality
 */

"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ChevronDown, Download, PieChart as PieChartIcon, BarChart3, TrendingUp } from "lucide-react";
import type { EstadisticasDias } from "@/src/core/domain";
import { DayDistributionPieChart } from "./charts/DayDistributionPieChart";
import { WeeklyWorkBarChart } from "./charts/WeeklyWorkBarChart";
import { MonthlyHoursChart } from "./charts/MonthlyHoursChart";
import html2canvas from "html2canvas";

interface CalendarChartsProps {
  statistics: EstadisticasDias;
  year: number;
}

type ChartType = "pie" | "weekly" | "monthly";

interface ChartOption {
  type: ChartType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const CHART_OPTIONS: ChartOption[] = [
  {
    type: "pie",
    label: "Distribución de días",
    icon: <PieChartIcon className="w-4 h-4" />,
    description: "Proporción de días por estado",
  },
  {
    type: "weekly",
    label: "Días por semana",
    icon: <BarChart3 className="w-4 h-4" />,
    description: "Días trabajados por día de la semana",
  },
  {
    type: "monthly",
    label: "Horas por mes",
    icon: <TrendingUp className="w-4 h-4" />,
    description: "Horas trabajadas cada mes",
  },
];

export function CalendarCharts({ statistics, year }: CalendarChartsProps) {
  const [showCharts, setShowCharts] = useState(false);
  const [selectedChart, setSelectedChart] = useState<ChartType>("pie");
  const [isExporting, setIsExporting] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  /**
   * Exports the current chart as a PNG image
   */
  const handleExportChart = async () => {
    if (!chartRef.current) return;

    setIsExporting(true);

    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2, // Higher quality
        backgroundColor: "#ffffff",
        logging: false,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const chartName = CHART_OPTIONS.find((opt) => opt.type === selectedChart)?.label || "grafico";
        link.download = `calendario-${year}-${chartName.toLowerCase().replace(/ /g, "-")}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error("Error exporting chart:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const currentChartOption = CHART_OPTIONS.find((opt) => opt.type === selectedChart);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Gráficos estadísticos
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCharts((prev) => !prev)}
            className="h-8 w-8 p-0"
          >
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${
                showCharts ? "rotate-180" : ""
              }`}
            />
          </Button>
        </CardTitle>
      </CardHeader>

      {showCharts && (
        <CardContent className="space-y-4">
          {/* Chart type selector */}
          <div className="flex flex-wrap gap-2">
            {CHART_OPTIONS.map((option) => (
              <Button
                key={option.type}
                variant={selectedChart === option.type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedChart(option.type)}
                className="h-auto py-2 px-3"
              >
                <span className="flex items-center gap-2">
                  {option.icon}
                  <span className="flex flex-col items-start">
                    <span className="text-sm font-semibold">{option.label}</span>
                    <span className="text-xs opacity-80">{option.description}</span>
                  </span>
                </span>
              </Button>
            ))}
          </div>

          {/* Export button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportChart}
              disabled={isExporting}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {isExporting ? "Exportando..." : "Exportar como imagen"}
            </Button>
          </div>

          {/* Chart display area */}
          <div ref={chartRef} className="bg-white dark:bg-gray-900 rounded-lg p-6 border">
            {/* Chart title */}
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              {currentChartOption?.icon}
              {currentChartOption?.label}
            </h3>

            {/* Render selected chart */}
            {selectedChart === "pie" && <DayDistributionPieChart statistics={statistics} />}
            {selectedChart === "weekly" && <WeeklyWorkBarChart statistics={statistics} />}
            {selectedChart === "monthly" && <MonthlyHoursChart statistics={statistics} />}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
