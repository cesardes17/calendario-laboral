/**
 * Validate Calendar Use Case (HU-026 / SCRUM-38)
 *
 * Validates that a generated calendar is coherent and without errors
 * to ensure that subsequent calculations are correct.
 *
 * This use case performs comprehensive validation checks on a calendar
 * including data integrity, business rules compliance, and hours coherence.
 */

import {
  CalendarDay,
  EstadoDia,
  Result,
  ResultadoValidacion,
  createEmptyValidationResult,
  Year,
  ContractStartDate,
  VacationPeriod,
  Holiday,
} from '../domain';

/**
 * Input for validating a calendar
 */
export interface ValidateCalendarInput {
  /** The calendar days to validate */
  days: CalendarDay[];

  /** The year for which the calendar was generated */
  year: Year;

  /** Optional contract start date (for validating NoContratado days) */
  contractStartDate?: ContractStartDate;

  /** Optional vacation periods (for validating vacation completeness) */
  vacationPeriods?: VacationPeriod[];

  /** Optional holidays (for validating worked holidays) */
  holidays?: Holiday[];
}

/**
 * Use Case: Validate Calendar
 *
 * Performs comprehensive validation on a generated calendar to ensure:
 * 1. All days have a state (no null values)
 * 2. Dates are continuous (1/1 to 31/12 without gaps)
 * 3. Total days count is correct (365 or 366 for leap years)
 * 4. Hours are coherent with day states
 * 5. NoContratado days are only before contract start date
 * 6. Priority rules are respected (no conflicts)
 * 7. Worked holidays have hours > 0
 * 8. Vacation periods are complete (all days marked)
 *
 * Returns a ResultadoValidacion with:
 * - Critical errors (valido: false): prevent calendar usage
 * - Warnings (valido: true): non-critical issues to review
 *
 * @example
 * ```typescript
 * const useCase = new ValidateCalendarUseCase();
 * const yearResult = Year.create(2025);
 *
 * if (yearResult.isSuccess) {
 *   const validationResult = useCase.execute({
 *     days: calendar.days,
 *     year: yearResult.getValue(),
 *     contractStartDate,
 *     vacationPeriods,
 *     holidays
 *   });
 *
 *   if (validationResult.isSuccess) {
 *     const validation = validationResult.getValue();
 *     if (validation.valido) {
 *       console.log('✓ Calendario válido');
 *     } else {
 *       console.error('✗ Errores:', validation.errores);
 *     }
 *   }
 * }
 * ```
 */
export class ValidateCalendarUseCase {
  /**
   * Executes the validation use case
   *
   * @param input - Contains the calendar and related data to validate
   * @returns Result containing validation result or error message
   */
  public execute(input: ValidateCalendarInput): Result<ResultadoValidacion> {
    try {
      const { days, year, contractStartDate, vacationPeriods = [], holidays = [] } = input;

      const validation = createEmptyValidationResult();

      // Run all validation checks
      this.validateDaysCount(days, year, validation);
      this.validateAllDaysHaveState(days, validation);
      this.validateContinuousDates(days, year, validation);
      this.validateHoursCoherence(days, validation);
      this.validateNotContractedDays(days, contractStartDate, validation);
      this.validatePriorities(days, validation);
      this.validateWorkedHolidays(days, holidays, validation);
      this.validateVacationPeriods(days, vacationPeriods, validation);

      // Determine overall validity based on errors
      validation.valido = validation.errores.length === 0;

      return Result.ok<ResultadoValidacion>(validation);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return Result.fail<ResultadoValidacion>(
        `Error al validar el calendario: ${errorMessage}`
      );
    }
  }

  /**
   * Validation 1: Check that the total number of days is correct (365 or 366)
   */
  private validateDaysCount(
    days: CalendarDay[],
    year: Year,
    validation: ResultadoValidacion
  ): void {
    const expectedDays = year.getDaysInYear();
    const actualDays = days.length;

    if (actualDays !== expectedDays) {
      validation.errores.push(
        `Número incorrecto de días: se esperaban ${expectedDays} días pero hay ${actualDays}`
      );
    }
  }

  /**
   * Validation 2: Check that all days have a state assigned (no null)
   */
  private validateAllDaysHaveState(
    days: CalendarDay[],
    validation: ResultadoValidacion
  ): void {
    const daysWithoutState = days.filter(day => day.estado === null);

    if (daysWithoutState.length > 0) {
      validation.errores.push(
        `Hay ${daysWithoutState.length} día(s) sin estado asignado (estado = null)`
      );
    }
  }

  /**
   * Validation 3: Check that dates are continuous from 1/1 to 31/12 without gaps
   */
  private validateContinuousDates(
    days: CalendarDay[],
    year: Year,
    validation: ResultadoValidacion
  ): void {
    if (days.length === 0) {
      validation.errores.push('El calendario está vacío');
      return;
    }

    // Check first day is January 1
    const firstDay = days[0];
    if (firstDay.mes !== 1 || firstDay.diaNumero !== 1) {
      validation.errores.push(
        `El primer día debería ser 1 de enero, pero es ${firstDay.diaNumero} de ${firstDay.nombreMes}`
      );
    }

    // Check last day is December 31
    const lastDay = days[days.length - 1];
    if (lastDay.mes !== 12 || lastDay.diaNumero !== 31) {
      validation.errores.push(
        `El último día debería ser 31 de diciembre, pero es ${lastDay.diaNumero} de ${lastDay.nombreMes}`
      );
    }

    // Check dates are continuous (each day follows the previous)
    for (let i = 1; i < days.length; i++) {
      const prevDay = days[i - 1];
      const currentDay = days[i];

      const prevTime = prevDay.fecha.getTime();
      const currentTime = currentDay.fecha.getTime();
      const millisecondsPerDay = 1000 * 60 * 60 * 24;

      // Check if current day is exactly 1 day after previous
      if (currentTime - prevTime !== millisecondsPerDay) {
        validation.errores.push(
          `Salto en las fechas: después de ${prevDay.diaNumero} de ${prevDay.nombreMes} viene ${currentDay.diaNumero} de ${currentDay.nombreMes}`
        );
        break; // Only report first gap
      }
    }
  }

  /**
   * Validation 4: Check that hours are coherent with day states
   *
   * Rules:
   * - All days must have hours >= 0
   * - NoContratado, Descanso, Vacaciones, Festivo must have hours = 0
   * - Only Trabajo or FestivoTrabajado can have hours > 0
   */
  private validateHoursCoherence(
    days: CalendarDay[],
    validation: ResultadoValidacion
  ): void {
    const daysWithNegativeHours = days.filter(day => day.horasTrabajadas < 0);
    if (daysWithNegativeHours.length > 0) {
      validation.errores.push(
        `Hay ${daysWithNegativeHours.length} día(s) con horas negativas`
      );
    }

    // States that must have 0 hours
    const zeroHourStates: EstadoDia[] = ['NoContratado', 'Descanso', 'Vacaciones', 'Festivo'];
    const daysWithInvalidHours = days.filter(
      day =>
        day.estado !== null &&
        zeroHourStates.includes(day.estado) &&
        day.horasTrabajadas !== 0
    );

    if (daysWithInvalidHours.length > 0) {
      validation.errores.push(
        `Hay ${daysWithInvalidHours.length} día(s) de tipo ${zeroHourStates.join('/')} con horas != 0`
      );
    }

    // States that should have hours > 0
    const workStates: EstadoDia[] = ['Trabajo', 'FestivoTrabajado'];
    const daysWithMissingHours = days.filter(
      day =>
        day.estado !== null &&
        workStates.includes(day.estado) &&
        day.horasTrabajadas === 0
    );

    if (daysWithMissingHours.length > 0) {
      // This is a warning, not an error, as hours might not be applied yet
      validation.advertencias.push(
        `Hay ${daysWithMissingHours.length} día(s) de tipo ${workStates.join('/')} con 0 horas (puede que las horas no se hayan calculado aún)`
      );
    }
  }

  /**
   * Validation 5: Check that NoContratado days are only before contract start date
   */
  private validateNotContractedDays(
    days: CalendarDay[],
    contractStartDate: ContractStartDate | undefined,
    validation: ResultadoValidacion
  ): void {
    const notContractedDays = days.filter(day => day.estado === 'NoContratado');

    // If no contract start date provided
    if (!contractStartDate) {
      // Warn if there are NoContratado days without a contract start date
      if (notContractedDays.length > 0) {
        validation.advertencias.push(
          `Hay ${notContractedDays.length} día(s) NoContratado pero no se proporcionó fecha de inicio de contrato`
        );
      }
      return;
    }

    const startTime = contractStartDate.value.getTime();

    // Check all NoContratado days are before contract start
    const invalidNotContractedDays = notContractedDays.filter(
      day => day.fecha.getTime() >= startTime
    );

    if (invalidNotContractedDays.length > 0) {
      validation.errores.push(
        `Hay ${invalidNotContractedDays.length} día(s) NoContratado después de la fecha de inicio de contrato`
      );
    }

    // Check all days before contract start are NoContratado
    const daysBeforeStart = days.filter(day => day.fecha.getTime() < startTime);
    const missedNotContractedDays = daysBeforeStart.filter(
      day => day.estado !== 'NoContratado'
    );

    if (missedNotContractedDays.length > 0) {
      validation.errores.push(
        `Hay ${missedNotContractedDays.length} día(s) antes de la fecha de inicio que no están marcados como NoContratado`
      );
    }
  }

  /**
   * Validation 6: Check that priorities are respected
   *
   * Rules:
   * - NoContratado has highest priority (should never conflict)
   * - Vacaciones should override Trabajo/Descanso/Festivo
   * - No impossible state combinations
   *
   * Note: This validation is implicit in the state machine - if a day has a single
   * state, priorities were respected. This method serves as a placeholder for
   * future enhancements or explicit priority conflict detection.
   */
  private validatePriorities(
    _days: CalendarDay[],
    _validation: ResultadoValidacion
  ): void {
    // In current implementation, we can't directly detect conflicts since each
    // day has only one state. No validation needed at this time.
  }

  /**
   * Validation 7: Check that worked holidays have hours > 0
   */
  private validateWorkedHolidays(
    days: CalendarDay[],
    holidays: Holiday[],
    validation: ResultadoValidacion
  ): void {
    const workedHolidayDays = days.filter(day => day.estado === 'FestivoTrabajado');

    // Check that worked holidays have hours assigned
    const workedHolidaysWithoutHours = workedHolidayDays.filter(
      day => day.horasTrabajadas === 0
    );

    if (workedHolidaysWithoutHours.length > 0) {
      validation.advertencias.push(
        `Hay ${workedHolidaysWithoutHours.length} festivo(s) trabajado(s) con 0 horas`
      );
    }

    // Cross-reference with holidays list to ensure consistency
    const workedHolidays = holidays.filter(h => h.worked);

    const markedWorkedHolidayDates = new Set(
      workedHolidayDays.map(d => d.fecha.toISOString().split('T')[0])
    );

    // Check if all worked holidays in the list are marked as FestivoTrabajado
    const missingWorkedHolidays = workedHolidays.filter(
      h => !markedWorkedHolidayDates.has(h.date.toISOString().split('T')[0])
    );

    if (missingWorkedHolidays.length > 0) {
      validation.errores.push(
        `Hay ${missingWorkedHolidays.length} festivo(s) marcado(s) como trabajado(s) en la lista pero no están en el calendario como FestivoTrabajado`
      );
    }
  }

  /**
   * Validation 8: Check that vacation periods are complete (all days marked)
   */
  private validateVacationPeriods(
    days: CalendarDay[],
    vacationPeriods: VacationPeriod[],
    validation: ResultadoValidacion
  ): void {
    // For each vacation period, check all days in the range are marked as Vacaciones
    for (const period of vacationPeriods) {
      const periodDays = days.filter(day => period.includesDate(day.fecha));
      const nonVacationDays = periodDays.filter(day => day.estado !== 'Vacaciones');

      if (nonVacationDays.length > 0) {
        validation.errores.push(
          `Período de vacaciones ${period.getFormattedDateRange()}: hay ${nonVacationDays.length} día(s) no marcado(s) como Vacaciones`
        );
      }
    }

    // Check that all vacation days in the calendar belong to a vacation period
    const vacationDays = days.filter(day => day.estado === 'Vacaciones');
    const orphanVacationDays = vacationDays.filter(
      day => !vacationPeriods.some(period => period.includesDate(day.fecha))
    );

    if (orphanVacationDays.length > 0) {
      validation.advertencias.push(
        `Hay ${orphanVacationDays.length} día(s) marcado(s) como Vacaciones que no pertenecen a ningún período de vacaciones`
      );
    }
  }
}
