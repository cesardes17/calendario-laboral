/**
 * Calendar View Page
 *
 * Displays the annual work calendar with all 12 months
 */

"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useCalendar } from "@/src/application/hooks";
import {
  MonthGrid,
  CalendarLegend,
} from "@/src/presentation/components/calendar";
import type { CalendarDay } from "@/src/core/domain";
import { Calendar as CalendarIcon, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/src/presentation/components/ui/button";
import { Card, CardContent } from "@/src/presentation/components/ui/card";
import Link from "next/link";

export default function CalendarPage() {
  const { days, year, isLeapYear, isLoading, error } = useCalendar();

  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  // Group days by month
  const monthsData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return months.map((month) => ({
      month,
      days: days.filter((day) => day.mes === month),
    }));
  }, [days]);

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDay(day);
    // TODO: Show day details in a modal or side panel (HU-032)
    console.log("Day clicked:", day);
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
      {/* Leyenda */}
      <div className="mb-8">
        <CalendarLegend />
      </div>

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

      {/* Información del día seleccionado */}
      {selectedDay && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-8"
        >
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-2">
                {selectedDay.nombreDia} {selectedDay.diaNumero} de{" "}
                {selectedDay.nombreMes} de {year}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Semana:</span>{" "}
                  <span className="font-semibold">
                    #{selectedDay.numeroSemana}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Estado:</span>{" "}
                  <span className="font-semibold">
                    {selectedDay.estado || "Sin estado"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Horas trabajadas:
                  </span>{" "}
                  <span className="font-semibold">
                    {selectedDay.horasTrabajadas}h
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
