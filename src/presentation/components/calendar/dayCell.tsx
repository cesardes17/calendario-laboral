/**
 * Day Cell Component
 *
 * Displays a single day in the calendar grid
 */

import React from 'react';
import type { CalendarDay, EstadoDia } from '@/src/core/domain';
import { motion } from 'framer-motion';

interface DayCellProps {
  day: CalendarDay;
  onClick?: (day: CalendarDay) => void;
}

/**
 * Get color class for a day state
 */
function getDayColorClass(estado: EstadoDia | null): string {
  if (!estado) {
    return 'bg-muted text-muted-foreground';
  }

  const colorMap: Record<EstadoDia, string> = {
    Trabajo: 'bg-blue-500 text-white hover:bg-blue-600',
    Descanso: 'bg-green-500 text-white hover:bg-green-600',
    Vacaciones: 'bg-yellow-500 text-white hover:bg-yellow-600',
    Festivo: 'bg-orange-500 text-white hover:bg-orange-600',
    FestivoTrabajado: 'bg-red-500 text-white hover:bg-red-600',
    NoContratado: 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600',
  };

  return colorMap[estado];
}

export function DayCell({ day, onClick }: DayCellProps) {
  const colorClass = getDayColorClass(day.estado);
  const isWeekend = day.diaSemana === 0 || day.diaSemana === 6; // Sunday or Saturday
  const isToday =
    new Date().toDateString() === day.fecha.toDateString();

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15 }}
      onClick={() => onClick?.(day)}
      className={`
        aspect-square
        rounded
        p-1
        flex
        flex-col
        items-center
        justify-center
        transition-all
        duration-200
        ${colorClass}
        ${isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
        ${isWeekend && !day.estado ? 'bg-muted/50' : ''}
        cursor-pointer
        relative
        text-xs
      `}
      title={`${day.nombreDia} ${day.diaNumero} de ${day.nombreMes}${
        day.estado ? ` - ${day.estado}` : ''
      }`}
    >
      {/* Day number */}
      <span className="font-semibold leading-none">{day.diaNumero}</span>

      {/* Today indicator */}
      {isToday && (
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current" />
      )}
    </motion.button>
  );
}
