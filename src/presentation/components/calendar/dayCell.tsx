/**
 * Day Cell Component
 *
 * Displays a single day in the calendar grid
 */

import React from 'react';
import type { CalendarDay, EstadoDia, TurnoExtra } from '@/src/core/domain';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Coffee,
  Plane,
  PartyPopper,
  CalendarClock,
  Ban,
  Shield,
} from 'lucide-react';

interface DayCellProps {
  day: CalendarDay;
  onClick?: (day: CalendarDay) => void;
  extraShifts?: TurnoExtra[];
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
    Guardia: <Shield {...iconProps} />,
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

    // Vacaciones: #FBBF24 (light) / #FCD34D (dark) - Yellow 400/300
    Vacaciones: 'bg-yellow-400 dark:bg-yellow-300 text-gray-900 hover:bg-yellow-500 dark:hover:bg-yellow-400',

    // Guardia: #9333EA (light) / #A855F7 (dark) - Purple 600/500
    Guardia: 'bg-purple-600 dark:bg-purple-500 text-white hover:bg-purple-700 dark:hover:bg-purple-600',

    // Festivo: #FB923C (light) / #FDBA74 (dark) - Orange 400/300
    Festivo: 'bg-orange-400 dark:bg-orange-300 text-white hover:bg-orange-500 dark:hover:bg-orange-400',

    // Festivo Trabajado: #EF4444 (light) / #F87171 (dark) - Red 500/400
    FestivoTrabajado: 'bg-red-500 dark:bg-red-400 text-white hover:bg-red-600 dark:hover:bg-red-500',

    // No Contratado: #E5E7EB (light) / #374151 (dark)
    NoContratado: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
  };

  return colorMap[estado];
}

export function DayCell({ day, onClick, extraShifts = [] }: DayCellProps) {
  const colorClass = getDayColorClass(day.estado);
  const dayIcon = getDayIcon(day.estado);
  const isWeekend = day.diaSemana === 0 || day.diaSemana === 6; // Sunday or Saturday
  const isToday =
    new Date().toDateString() === day.fecha.toDateString();

  // Check if this day has an extra shift
  const hasExtraShift = extraShifts.some(shift => shift.isOnDate(day.fecha));
  const extraShift = extraShifts.find(shift => shift.isOnDate(day.fecha));

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

      {/* Extra shift indicator (amber triangle in top-right corner) */}
      {hasExtraShift && (
        <div
          className="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-t-amber-500 border-l-[12px] border-l-transparent"
          title={extraShift ? `Turno extra: ${extraShift.hours}h` : 'Turno extra'}
          aria-label={extraShift ? `Turno extra de ${extraShift.hours} horas` : 'Turno extra'}
        />
      )}

      {/* Today indicator */}
      {isToday && (
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current" />
      )}
    </motion.button>
  );
}
