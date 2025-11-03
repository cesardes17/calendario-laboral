/**
 * Day Cell Component
 *
 * Displays a single day in the calendar grid
 */

import React from 'react';
import type { CalendarDay, EstadoDia } from '@/src/core/domain';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Coffee,
  Plane,
  PartyPopper,
  CalendarClock,
  Ban,
} from 'lucide-react';

interface DayCellProps {
  day: CalendarDay;
  onClick?: (day: CalendarDay) => void;
}

/**
 * Get icon component for a day state (for accessibility)
 */
function getDayIcon(estado: EstadoDia | null): React.ReactNode {
  if (!estado) return null;

  const iconProps = { className: 'w-2.5 h-2.5 opacity-70', strokeWidth: 2.5 };

  const iconMap: Record<EstadoDia, React.ReactNode> = {
    Trabajo: <Briefcase {...iconProps} />,
    Descanso: <Coffee {...iconProps} />,
    Vacaciones: <Plane {...iconProps} />,
    Festivo: <PartyPopper {...iconProps} />,
    FestivoTrabajado: <CalendarClock {...iconProps} />,
    NoContratado: <Ban {...iconProps} />,
  };

  return iconMap[estado];
}

/**
 * Get color class for a day state
 * Colors match HU specification with full dark mode support and WCAG AA compliance
 */
function getDayColorClass(estado: EstadoDia | null): string {
  if (!estado) {
    return 'bg-muted text-muted-foreground';
  }

  const colorMap: Record<EstadoDia, string> = {
    // Trabajo: #3B82F6 (light) / #60A5FA (dark)
    Trabajo: 'bg-blue-500 dark:bg-blue-400 text-white hover:bg-blue-600 dark:hover:bg-blue-500',

    // Descanso: #10B981 (light) / #34D399 (dark)
    Descanso: 'bg-green-500 dark:bg-green-400 text-white hover:bg-green-600 dark:hover:bg-green-500',

    // Vacaciones: #F59E0B (light) / #FBBF24 (dark)
    Vacaciones: 'bg-amber-500 dark:bg-amber-400 text-white hover:bg-amber-600 dark:hover:bg-amber-500',

    // Festivo: #EF4444 (light) / #F87171 (dark)
    Festivo: 'bg-red-500 dark:bg-red-400 text-white hover:bg-red-600 dark:hover:bg-red-500',

    // Festivo Trabajado: #A855F7 (light) / #C084FC (dark)
    FestivoTrabajado: 'bg-purple-500 dark:bg-purple-400 text-white hover:bg-purple-600 dark:hover:bg-purple-500',

    // No Contratado: #E5E7EB (light) / #374151 (dark)
    NoContratado: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
  };

  return colorMap[estado];
}

export function DayCell({ day, onClick }: DayCellProps) {
  const colorClass = getDayColorClass(day.estado);
  const dayIcon = getDayIcon(day.estado);
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
        gap-0.5
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
      aria-label={`${day.nombreDia} ${day.diaNumero} de ${day.nombreMes}${
        day.estado ? ` - ${day.estado}` : ''
      }`}
    >
      {/* Accessibility icon */}
      {dayIcon && (
        <div className="absolute top-0.5 left-0.5" aria-hidden="true">
          {dayIcon}
        </div>
      )}

      {/* Day number */}
      <span className="font-semibold leading-none">{day.diaNumero}</span>

      {/* Today indicator */}
      {isToday && (
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current" />
      )}
    </motion.button>
  );
}
