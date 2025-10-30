/**
 * Month Grid Component
 *
 * Displays a month view with all days in a calendar grid
 */

import React from 'react';
import type { CalendarDay } from '@/src/core/domain';
import { DayCell } from './dayCell';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface MonthGridProps {
  days: CalendarDay[];
  month: number;
  year?: number;
  onPreviousMonth?: () => void;
  onNextMonth?: () => void;
  onDayClick?: (day: CalendarDay) => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
}

/**
 * Get the month name in Spanish
 */
function getMonthName(month: number): string {
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  return months[month - 1] || '';
}

/**
 * Get empty cells to pad the start of the month
 * (to align the first day with its correct weekday)
 */
function getLeadingEmptyCells(days: CalendarDay[]): number {
  if (days.length === 0) return 0;

  const firstDay = days[0];
  // diaSemana: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // We want Monday as the first column, so adjust
  const dayOfWeek = firstDay.diaSemana;
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday to 6, Monday to 0
}

export function MonthGrid({
  days,
  month,
  onDayClick,
}: MonthGridProps) {
  const leadingEmptyCells = getLeadingEmptyCells(days);
  const monthName = getMonthName(month);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-center">
          <CardTitle className="text-xl font-bold">
            {monthName}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
            <div
              key={day}
              className={`text-center text-[10px] font-semibold text-muted-foreground ${
                index >= 5 ? 'text-orange-600 dark:text-orange-400' : ''
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for alignment */}
          {Array.from({ length: leadingEmptyCells }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Day cells */}
          {days.map((day) => (
            <DayCell key={day.fecha.toISOString()} day={day} onClick={onDayClick} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
