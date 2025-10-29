/**
 * YearSelector Component
 *
 * UI component for year selection (HU-001)
 * Implements:
 * - Year selector as first field
 * - Current year selected by default
 * - Valid range: current - 2 to current + 5
 * - Error display for validation
 * - Clear visual feedback
 *
 * Redesigned with visual grid layout (v0.dev style)
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { useYearSelection } from "@/src/application/hooks/useYearSelection";

export interface YearSelectorProps {
  /**
   * Initial year to select (optional)
   */
  initialYear?: number;

  /**
   * Callback when year is selected
   */
  onYearChange?: (year: number) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const YearSelector: React.FC<YearSelectorProps> = ({
  initialYear,
  onYearChange,
  className = "",
}) => {
  const { selectedYear, isValid, yearRange, selectYear } =
    useYearSelection(initialYear);

  // Calculate current year locally
  const currentYear = React.useMemo(() => new Date().getFullYear(), []);

  // Generate year options for the grid
  const yearOptions = React.useMemo(() => {
    const options = [];
    for (let year = yearRange.min; year <= yearRange.max; year++) {
      options.push(year);
    }
    return options;
  }, [yearRange]);

  // Leap year checker
  const isLeapYear = React.useCallback((year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }, []);

  // Notify parent when year changes
  React.useEffect(() => {
    if (isValid && onYearChange) {
      onYearChange(selectedYear);
    }
  }, [selectedYear, isValid, onYearChange]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Selecciona el Año de Referencia
        </CardTitle>
        <CardDescription>
          Este año determinará tu calendario laboral completo
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pb-6">
        {/* Grid de años */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {yearOptions.map((year) => {
            const isSelected = selectedYear === year;
            const isCurrent = year === currentYear;
            const isLeap = isLeapYear(year);

            return (
              <motion.div
                key={year}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.2,
                  delay: (year - yearRange.min) * 0.05,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={isSelected ? "default" : "outline"}
                  className={`
                    relative h-auto w-full flex flex-col items-center gap-2 p-4
                    transition-all duration-200
                    ${isSelected ? "ring-2 ring-primary/20 shadow-lg" : ""}
                    ${isCurrent && !isSelected ? "border-primary/50" : ""}
                  `}
                  onClick={() => selectYear(year)}
                  aria-pressed={isSelected}
                  aria-label={`Seleccionar año ${year}${
                    isCurrent ? " (año actual)" : ""
                  }${isLeap ? " (año bisiesto)" : ""}`}
                >
                  {/* Badge "Actual" para el año corriente */}
                  {isCurrent && (
                    <Badge
                      variant="secondary"
                      className="absolute -top-2 -right-2 flex items-center gap-1 text-xs"
                    >
                      <Sparkles className="h-3 w-3" />
                      Actual
                    </Badge>
                  )}

                  {/* Icono de calendario */}
                  <Calendar
                    className={`h-5 w-5 ${
                      isSelected
                        ? "text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  />

                  {/* Número del año (grande y prominente) */}
                  <span className="text-2xl md:text-3xl font-bold">{year}</span>

                  {/* Info días (bisiesto o no) */}
                  <span
                    className={`text-xs ${
                      isSelected
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    {isLeap ? "366 días" : "365 días"}
                  </span>

                  {/* Badge bisiesto */}
                  {isLeap && (
                    <Badge
                      variant={isSelected ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      Bisiesto
                    </Badge>
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Info adicional del rango */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Rango disponible: {yearRange.min} - {yearRange.max}
          </p>
        </div>

        {/* Alert de éxito cuando hay selección válida */}
        {isValid && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                Año seleccionado: <strong>{selectedYear}</strong>
                {isLeapYear(selectedYear) && " (año bisiesto con 366 días)"}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
