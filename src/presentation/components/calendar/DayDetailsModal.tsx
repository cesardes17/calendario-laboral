/**
 * Day Details Modal Component (HU-032 / SCRUM-44)
 *
 * Displays detailed information about a selected calendar day.
 * - Desktop: Slide-in panel from the right (300-400px)
 * - Mobile: Fullscreen modal with slide-up animation
 * - Shows: date, state, justification, hours, cycle metadata
 * - Closeable by clicking outside or close button
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { CalendarDay } from '@/src/core/domain';
import {
  formatFullDate,
  getEstadoLabel,
  generateDayJustification,
  WizardData,
} from '@/src/presentation/utils/dayJustification';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

export interface DayDetailsModalProps {
  /** The selected day to display details for */
  day: CalendarDay | null;

  /** Function to close the modal */
  onClose: () => void;

  /** Wizard configuration data */
  wizardData?: WizardData;
}

/**
 * DayDetailsModal component
 *
 * Responsive modal/panel that displays detailed information about a calendar day.
 *
 * @example
 * ```tsx
 * <DayDetailsModal
 *   day={selectedDay}
 *   onClose={() => setSelectedDay(null)}
 *   wizardData={wizardData}
 * />
 * ```
 */
export function DayDetailsModal({ day, onClose, wizardData }: DayDetailsModalProps) {
  if (!day) {
    return null;
  }

  const estadoLabel = getEstadoLabel(day.estado);
  const fullDate = formatFullDate(day);
  const justification = generateDayJustification(day, wizardData);

  // Get estado color for badge
  const estadoColor = getEstadoColor(day.estado);

  return (
    <AnimatePresence>
      {day && (
        <>
          {/* Backdrop overlay - click to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Desktop: Side panel (hidden on mobile) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-[400px] bg-white dark:bg-gray-950 shadow-2xl z-50 overflow-y-auto hidden md:block"
          >
            <DayDetailsContent
              day={day}
              fullDate={fullDate}
              estadoLabel={estadoLabel}
              estadoColor={estadoColor}
              justification={justification}
              onClose={onClose}
              wizardData={wizardData}
            />
          </motion.div>

          {/* Mobile: Fullscreen modal (hidden on desktop) */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white dark:bg-gray-950 z-50 overflow-y-auto md:hidden"
          >
            <DayDetailsContent
              day={day}
              fullDate={fullDate}
              estadoLabel={estadoLabel}
              estadoColor={estadoColor}
              justification={justification}
              onClose={onClose}
              wizardData={wizardData}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Internal component with the actual content
 */
interface DayDetailsContentProps {
  day: CalendarDay;
  fullDate: string;
  estadoLabel: string;
  estadoColor: string;
  justification: string;
  onClose: () => void;
  wizardData?: WizardData;
}

function DayDetailsContent({
  day,
  fullDate,
  estadoLabel,
  estadoColor,
  justification,
  onClose,
  wizardData,
}: DayDetailsContentProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header with close button */}
      <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
        <h2 className="text-xl font-semibold">Detalles del día</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Date card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fecha</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{fullDate}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Semana {day.numeroSemana} del año
            </p>
          </CardContent>
        </Card>

        {/* State card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={estadoColor}>{estadoLabel}</Badge>
          </CardContent>
        </Card>

        {/* Justification card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Justificación</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 dark:text-gray-300">{justification}</p>
          </CardContent>
        </Card>

        {/* Hours card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Horas trabajadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{day.horasTrabajadas.toFixed(2)}h</p>
            {day.horasTrabajadas === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Sin horas registradas
              </p>
            )}
          </CardContent>
        </Card>

        {/* Cycle metadata (if available) */}
        {day.metadata &&
          day.metadata.parte !== undefined &&
          day.metadata.diaDentroParte !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información del ciclo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Parte:</span>
                  <span className="font-medium">
                    {(day.metadata.parte + 1).toString()}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Día en la parte:
                  </span>
                  <span className="font-medium">
                    {(day.metadata.diaDentroParte + 1).toString()}
                  </span>
                </div>
                {day.metadata.tipoDentroParte && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Tipo:
                      </span>
                      <span className="font-medium">{day.metadata.tipoDentroParte}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

        {/* Vacation period info (if applicable) */}
        {day.estado === 'Vacaciones' && wizardData?.vacations && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Período de vacaciones</CardTitle>
            </CardHeader>
            <CardContent>
              {renderVacationPeriod(day, wizardData.vacations)}
            </CardContent>
          </Card>
        )}

        {/* Holiday info (if applicable) */}
        {(day.estado === 'Festivo' || day.estado === 'FestivoTrabajado') &&
          wizardData?.holidays && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información del festivo</CardTitle>
              </CardHeader>
              <CardContent>{renderHolidayInfo(day, wizardData.holidays)}</CardContent>
            </Card>
          )}

        {/* Description (if any) */}
        {day.descripcion && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 dark:text-gray-300">{day.descripcion}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/**
 * Gets Tailwind classes for estado badge color
 * Colors match HU specification with full dark mode support
 */
function getEstadoColor(estado: CalendarDay['estado']): string {
  switch (estado) {
    case 'Trabajo':
      // #3B82F6 (light) / #60A5FA (dark)
      return 'bg-blue-500 dark:bg-blue-400 text-white';
    case 'Descanso':
      // #10B981 (light) / #34D399 (dark)
      return 'bg-green-500 dark:bg-green-400 text-white';
    case 'Vacaciones':
      // #F59E0B (light) / #FBBF24 (dark)
      return 'bg-amber-500 dark:bg-amber-400 text-white';
    case 'Festivo':
      // #FB923C (light) / #FDBA74 (dark)
      return 'bg-orange-400 dark:bg-orange-300 text-white';
    case 'FestivoTrabajado':
      // #EF4444 (light) / #F87171 (dark)
      return 'bg-red-500 dark:bg-red-400 text-white';
    case 'NoContratado':
      // #E5E7EB (light) / #374151 (dark)
      return 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
}

/**
 * Renders vacation period information
 */
function renderVacationPeriod(
  day: CalendarDay,
  vacations: WizardData['vacations']
): React.ReactNode {
  if (!vacations) return null;

  const dayDate = day.fecha.getTime();
  const matchingVacation = vacations.find((vacation) => {
    const start = new Date(vacation.startDate).getTime();
    const end = new Date(vacation.endDate).getTime();
    return dayDate >= start && dayDate <= end;
  });

  if (!matchingVacation) {
    return <p className="text-sm text-gray-500">Información no disponible</p>;
  }

  const startDate = new Date(matchingVacation.startDate);
  const endDate = new Date(matchingVacation.endDate);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">Inicio:</span>
        <span className="font-medium">{formatShortDate(startDate)}</span>
      </div>
      <Separator />
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">Fin:</span>
        <span className="font-medium">{formatShortDate(endDate)}</span>
      </div>
      {matchingVacation.description && (
        <>
          <Separator />
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Descripción:</span>
            <p className="mt-1 text-sm">{matchingVacation.description}</p>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Renders holiday information
 */
function renderHolidayInfo(
  day: CalendarDay,
  holidays: WizardData['holidays']
): React.ReactNode {
  if (!holidays) return null;

  const dayDateStr = day.fecha.toISOString().split('T')[0];
  const matchingHoliday = holidays.find((holiday) => holiday.date === dayDateStr);

  if (!matchingHoliday) {
    return <p className="text-sm text-gray-500">Información no disponible</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">Nombre:</span>
        <span className="font-medium">{matchingHoliday.name}</span>
      </div>
      <Separator />
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">Trabajado:</span>
        <Badge
          className={
            matchingHoliday.worked
              ? 'bg-red-500 dark:bg-red-400 text-white'
              : 'bg-orange-400 dark:bg-orange-300 text-white'
          }
        >
          {matchingHoliday.worked ? 'Sí' : 'No'}
        </Badge>
      </div>
    </div>
  );
}

/**
 * Formats a date to short Spanish format
 */
function formatShortDate(date: Date): string {
  const day = date.getDate();
  const monthNames = [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}
