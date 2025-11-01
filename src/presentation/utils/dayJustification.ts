/**
 * Day Justification Utility
 *
 * Generates human-readable justifications for calendar day states.
 * Used in the day details modal (HU-032 / SCRUM-44).
 */

import { CalendarDay, EstadoDia, CycleMode } from '@/src/core/domain';

/**
 * Wizard data structure from localStorage
 */
export interface WizardData {
  contractStart?: {
    statusType: string;
    contractStartDate?: string;
    cycleOffset?: {
      partNumber: number;
      dayWithinPart: number;
      dayType: string;
    };
  };
  workCycle?: {
    mode: CycleMode;
    data?: {
      weeklyMask?: boolean[];
      parts?: Array<{ trabaja: number; descansa: number }>;
    };
  };
  vacations?: Array<{
    startDate: string;
    endDate: string;
    description?: string;
  }>;
  holidays?: Array<{
    date: string;
    name: string;
    worked: boolean;
  }>;
}

/**
 * Generates a justification message for why a day has its current state
 *
 * @param day - The calendar day to justify
 * @param wizardData - Configuration data from wizard
 * @returns Human-readable justification string
 *
 * @example
 * ```typescript
 * const justification = generateDayJustification(day, wizardData);
 * // Returns: "Día de vacaciones: Verano"
 * ```
 */
export function generateDayJustification(
  day: CalendarDay,
  wizardData?: WizardData
): string {
  if (!day.estado) {
    return 'Estado no determinado';
  }

  switch (day.estado) {
    case 'NoContratado':
      return generateNotContractedJustification(day, wizardData);

    case 'Vacaciones':
      return generateVacationJustification(day, wizardData);

    case 'Festivo':
      return generateHolidayJustification(day, wizardData);

    case 'FestivoTrabajado':
      return generateWorkedHolidayJustification(day, wizardData);

    case 'Descanso':
      return generateRestJustification(day, wizardData);

    case 'Trabajo':
      return generateWorkJustification(day, wizardData);

    default:
      return 'Estado desconocido';
  }
}

/**
 * Generates justification for NotContracted days
 */
function generateNotContractedJustification(
  day: CalendarDay,
  wizardData?: WizardData
): string {
  if (wizardData?.contractStart?.contractStartDate) {
    const contractStartDate = new Date(wizardData.contractStart.contractStartDate);
    const dateStr = formatDate(contractStartDate);
    return `Tu contrato comenzó el ${dateStr}. Este día es anterior a tu fecha de inicio.`;
  }
  return 'Día no contratado';
}

/**
 * Generates justification for Vacation days
 */
function generateVacationJustification(
  day: CalendarDay,
  wizardData?: WizardData
): string {
  if (!wizardData?.vacations) {
    return 'Día de vacaciones';
  }

  // Find matching vacation period
  const dayDate = day.fecha.getTime();
  const matchingVacation = wizardData.vacations.find((vacation) => {
    const start = new Date(vacation.startDate).getTime();
    const end = new Date(vacation.endDate).getTime();
    return dayDate >= start && dayDate <= end;
  });

  if (matchingVacation?.description) {
    return `Día de vacaciones: ${matchingVacation.description}`;
  }

  return 'Día de vacaciones';
}

/**
 * Generates justification for Holiday days
 */
function generateHolidayJustification(
  day: CalendarDay,
  wizardData?: WizardData
): string {
  if (!wizardData?.holidays) {
    return 'Festivo';
  }

  // Find matching holiday
  const dayDateStr = day.fecha.toISOString().split('T')[0];
  const matchingHoliday = wizardData.holidays.find(
    (holiday) => holiday.date === dayDateStr
  );

  if (matchingHoliday?.name) {
    return `Festivo: ${matchingHoliday.name}`;
  }

  return 'Festivo';
}

/**
 * Generates justification for Worked Holiday days
 */
function generateWorkedHolidayJustification(
  day: CalendarDay,
  wizardData?: WizardData
): string {
  if (!wizardData?.holidays) {
    return 'Festivo trabajado';
  }

  // Find matching holiday
  const dayDateStr = day.fecha.toISOString().split('T')[0];
  const matchingHoliday = wizardData.holidays.find(
    (holiday) => holiday.date === dayDateStr
  );

  if (matchingHoliday?.name) {
    return `Festivo trabajado: ${matchingHoliday.name}`;
  }

  return 'Festivo trabajado';
}

/**
 * Generates justification for Rest days
 */
function generateRestJustification(
  day: CalendarDay,
  wizardData?: WizardData
): string {
  if (!wizardData?.workCycle) {
    return 'Día de descanso según tu ciclo laboral';
  }

  const { mode, data } = wizardData.workCycle;

  if (mode === CycleMode.WEEKLY) {
    return `Día de descanso según tu ciclo semanal`;
  }

  // Parts mode - show part information if available
  if (mode === CycleMode.PARTS && day.metadata) {
    const { parte, diaDentroParte, tipoDentroParte } = day.metadata;

    if (parte !== undefined && diaDentroParte !== undefined && tipoDentroParte) {
      const partNumber = parte + 1; // Convert 0-indexed to 1-indexed
      const dayNumber = diaDentroParte + 1;

      // Get part configuration if available
      if (data?.parts && data.parts[parte]) {
        const partConfig = data.parts[parte];
        return `Día de descanso (Parte ${partNumber}, día ${dayNumber} de ${partConfig.descansa} días de descanso)`;
      }

      return `Día de descanso (Parte ${partNumber}, día ${dayNumber} del periodo de descanso)`;
    }
  }

  return 'Día de descanso según tu ciclo laboral';
}

/**
 * Generates justification for Work days
 */
function generateWorkJustification(
  day: CalendarDay,
  wizardData?: WizardData
): string {
  if (!wizardData?.workCycle) {
    return 'Día laborable según tu ciclo de trabajo';
  }

  const { mode, data } = wizardData.workCycle;

  if (mode === CycleMode.WEEKLY) {
    return `Día laborable según tu ciclo semanal`;
  }

  // Parts mode - show part information if available
  if (mode === CycleMode.PARTS && day.metadata) {
    const { parte, diaDentroParte, tipoDentroParte } = day.metadata;

    if (parte !== undefined && diaDentroParte !== undefined && tipoDentroParte) {
      const partNumber = parte + 1; // Convert 0-indexed to 1-indexed
      const dayNumber = diaDentroParte + 1;

      // Get part configuration if available
      if (data?.parts && data.parts[parte]) {
        const partConfig = data.parts[parte];
        return `Día laborable (Parte ${partNumber}, día ${dayNumber} de ${partConfig.trabaja} días de trabajo)`;
      }

      return `Día laborable (Parte ${partNumber}, día ${dayNumber} del periodo de trabajo)`;
    }
  }

  return 'Día laborable según tu ciclo de trabajo';
}

/**
 * Formats a date to Spanish format
 *
 * @param date - Date to format
 * @returns Formatted date string (e.g., "15 de julio de 2025")
 */
function formatDate(date: Date): string {
  const day = date.getDate();
  const monthNames = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day} de ${month} de ${year}`;
}

/**
 * Formats a complete date with weekday name
 *
 * @param day - Calendar day
 * @returns Full formatted date (e.g., "Lunes, 15 de julio de 2025")
 */
export function formatFullDate(day: CalendarDay): string {
  const weekdayName = day.nombreDia;
  const dayNumber = day.diaNumero;
  const monthNames = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];
  const month = monthNames[day.mes - 1]; // mes is 1-indexed
  const year = day.fecha.getFullYear();

  return `${weekdayName}, ${dayNumber} de ${month} de ${year}`;
}

/**
 * Gets a user-friendly label for a day state
 *
 * @param estado - Day state
 * @returns Spanish label for the state
 */
export function getEstadoLabel(estado: EstadoDia | null): string {
  if (!estado) {
    return 'Sin estado';
  }

  const labels: Record<EstadoDia, string> = {
    NoContratado: 'No contratado',
    Vacaciones: 'Vacaciones',
    Festivo: 'Festivo',
    FestivoTrabajado: 'Festivo trabajado',
    Descanso: 'Descanso',
    Trabajo: 'Trabajo',
  };

  return labels[estado] || estado;
}
