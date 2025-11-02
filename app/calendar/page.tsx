/**
 * Calendar View Page
 *
 * Displays the annual work calendar with all 12 months
 */

"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useCalendar } from "@/src/application/hooks";
import {
  MonthGrid,
  DayDetailsModal,
  CalendarStatistics,
  CalendarCharts,
} from "@/src/presentation/components/calendar";
import type { CalendarDay } from "@/src/core/domain";
import type { WizardData } from "@/src/presentation/utils/dayJustification";
import { Calendar as CalendarIcon, Home } from "lucide-react";
import { Button } from "@/src/presentation/components/ui/button";
import Link from "next/link";
import { CalculateDayStatisticsUseCase } from "@/src/core/usecases";

export default function CalendarPage() {
  const { days, year, isLoading, error } = useCalendar();

  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [wizardData, setWizardData] = useState<WizardData | undefined>(
    undefined
  );

  // Load wizard data from localStorage
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem("calendarWizardData");
      if (savedConfig) {
        const data = JSON.parse(savedConfig);
        setWizardData(data);
      }
    } catch (error) {
      console.warn("Failed to load wizard data:", error);
    }
  }, []);

  // Group days by month
  const monthsData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return months.map((month) => ({
      month,
      days: days.filter((day) => day.mes === month),
    }));
  }, [days]);

  // Calculate day statistics for legend
  const dayStatistics = useMemo(() => {
    if (days.length === 0) return null;

    const useCase = new CalculateDayStatisticsUseCase();

    // Extract annual hours from wizard data if available
    const horasConvenio = wizardData?.annualHours ?? undefined;

    const result = useCase.execute({
      days,
      horasConvenio,
    });

    if (!result.isSuccess()) {
      console.warn("Failed to calculate day statistics:", result.errorValue());
      return null;
    }

    return result.getValue();
  }, [days, wizardData]);

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDay(day);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <CalendarIcon className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <p className="text-lg text-muted-foreground">
            Generando calendario...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10">
            <CalendarIcon className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Error al generar calendario
          </h2>
          <p className="text-muted-foreground">{error}</p>
          <Link href="/">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex-1 mx-auto p-4">
      {/* Contenido principal */}
      <div className="text-2xl mb-2 text-center">
        <h3>Calendario {year}</h3>
      </div>
      {/* Estadísticas */}
      {dayStatistics && (
        <div className="mb-8 space-y-6">
          <CalendarStatistics statistics={dayStatistics} year={year} />
          <CalendarCharts statistics={dayStatistics} />
        </div>
      )}

      {/* Grid de meses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {monthsData.map(({ month, days: monthDays }, idx) => (
          <motion.div
            key={month}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.05 * idx }}
          >
            <MonthGrid
              days={monthDays}
              month={month}
              year={year}
              onDayClick={handleDayClick}
              canGoPrevious={false}
              canGoNext={false}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Day details modal (HU-032 / SCRUM-44) */}
      <DayDetailsModal
        day={selectedDay}
        onClose={() => setSelectedDay(null)}
        wizardData={wizardData}
      />
    </div>
  );
}
