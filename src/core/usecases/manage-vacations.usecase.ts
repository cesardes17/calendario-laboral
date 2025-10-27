import { VacationPeriod } from '../domain/vacation-period';
import { Year } from '../domain/year';
import { Result } from '../domain/result';

/**
 * Use Case: Manage Vacations
 *
 * Handles business logic for managing vacation periods in the calendar.
 * Includes adding, removing, updating, and retrieving vacation periods with validation.
 *
 * Business Rules (HU-014):
 * - A vacation period must be within the selected year
 * - End date >= start date
 * - Periods can overlap (system allows it, unification is optional)
 * - Vacation periods are automatically sorted by start date
 * - Vacations have priority 2 in the day state hierarchy
 * - Maximum 30 vacation days per year (total across all periods)
 */

/**
 * Maximum vacation days allowed per year
 */
export const MAX_VACATION_DAYS = 30;

/**
 * Information about overlapping vacation periods
 */
export interface OverlapInfo {
  overlappingPeriod: VacationPeriod;
  overlapDays: number;
  isFullyContained: boolean;
}

/**
 * Add a vacation period to the list
 *
 * @param period - The vacation period to add
 * @param existingPeriods - Current list of vacation periods
 * @param year - The selected year for validation
 * @returns Result with updated periods list or error
 */
export function addVacationPeriod(
  period: VacationPeriod,
  existingPeriods: VacationPeriod[],
  year: Year
): Result<VacationPeriod[]> {
  // Validate that period is within the selected year
  const yearStart = new Date(year.value, 0, 1);
  const yearEnd = new Date(year.value, 11, 31);

  if (period.startDate < yearStart || period.endDate > yearEnd) {
    return Result.fail(
      `El período de vacaciones debe estar dentro del año ${year.value}`
    );
  }

  // Validate maximum vacation days limit
  const currentTotalDays = getTotalVacationDays(existingPeriods);
  const newPeriodDays = period.getDayCount();

  // Calculate actual total considering overlaps
  const tempUpdated = [...existingPeriods, period];
  const actualTotal = getTotalVacationDays(tempUpdated);

  if (actualTotal > MAX_VACATION_DAYS) {
    const daysOver = actualTotal - MAX_VACATION_DAYS;
    return Result.fail(
      `No se pueden añadir ${newPeriodDays} días. Supera el límite de ${MAX_VACATION_DAYS} días/año por ${daysOver} ${daysOver === 1 ? 'día' : 'días'} (actualmente: ${currentTotalDays} días)`
    );
  }

  // Allow overlaps - system handles unification optionally
  // Just add and sort
  const updated = [...existingPeriods, period];
  return Result.ok(sortVacationsByDate(updated));
}

/**
 * Remove a vacation period from the list
 *
 * @param index - The index of the period to remove
 * @param periods - Current list of vacation periods
 * @returns Result with updated periods list or error
 */
export function removeVacationPeriod(
  index: number,
  periods: VacationPeriod[]
): Result<VacationPeriod[]> {
  if (index < 0 || index >= periods.length) {
    return Result.fail('Índice de período de vacaciones inválido');
  }

  const updated = periods.filter((_, i) => i !== index);
  return Result.ok(updated);
}

/**
 * Update an existing vacation period
 *
 * @param index - The index of the period to update
 * @param updatedPeriod - The new vacation period data
 * @param periods - Current list of vacation periods
 * @param year - The selected year for validation
 * @returns Result with updated periods list or error
 */
export function updateVacationPeriod(
  index: number,
  updatedPeriod: VacationPeriod,
  periods: VacationPeriod[],
  year: Year
): Result<VacationPeriod[]> {
  if (index < 0 || index >= periods.length) {
    return Result.fail('Índice de período de vacaciones inválido');
  }

  // Validate that period is within the selected year
  const yearStart = new Date(year.value, 0, 1);
  const yearEnd = new Date(year.value, 11, 31);

  if (updatedPeriod.startDate < yearStart || updatedPeriod.endDate > yearEnd) {
    return Result.fail(
      `El período de vacaciones debe estar dentro del año ${year.value}`
    );
  }

  // Validate maximum vacation days limit
  // Exclude the period being updated from the current total
  const periodsWithoutCurrent = periods.filter((_, i) => i !== index);
  const currentTotalDays = getTotalVacationDays(periodsWithoutCurrent);
  const newPeriodDays = updatedPeriod.getDayCount();

  // Calculate actual total considering overlaps
  const tempUpdated = [...periodsWithoutCurrent, updatedPeriod];
  const actualTotal = getTotalVacationDays(tempUpdated);

  if (actualTotal > MAX_VACATION_DAYS) {
    const daysOver = actualTotal - MAX_VACATION_DAYS;
    return Result.fail(
      `No se pueden actualizar a ${newPeriodDays} días. Supera el límite de ${MAX_VACATION_DAYS} días/año por ${daysOver} ${daysOver === 1 ? 'día' : 'días'} (actualmente sin este período: ${currentTotalDays} días)`
    );
  }

  // Update and sort
  const updated = periods.map((p, i) => (i === index ? updatedPeriod : p));
  return Result.ok(sortVacationsByDate(updated));
}

/**
 * Sort vacation periods by start date (earliest first)
 *
 * @param periods - List of vacation periods to sort
 * @returns Sorted list of vacation periods
 */
export function sortVacationsByDate(periods: VacationPeriod[]): VacationPeriod[] {
  return [...periods].sort((a, b) => a.compareTo(b));
}

/**
 * Get total number of vacation days (accounting for overlaps)
 *
 * @param periods - List of vacation periods
 * @returns Total number of unique vacation days
 */
export function getTotalVacationDays(periods: VacationPeriod[]): number {
  if (periods.length === 0) return 0;

  // Create a set of unique dates to handle overlaps
  const dateSet = new Set<string>();

  periods.forEach((period) => {
    const currentDate = new Date(period.startDate);
    const endDate = period.endDate;

    while (currentDate <= endDate) {
      dateSet.add(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  return dateSet.size;
}

/**
 * Detect overlaps between a new period and existing periods
 *
 * @param period - The new vacation period to check
 * @param existingPeriods - Current list of vacation periods
 * @returns Array of OverlapInfo for all overlapping periods
 */
export function detectOverlaps(
  period: VacationPeriod,
  existingPeriods: VacationPeriod[]
): OverlapInfo[] {
  return existingPeriods
    .map((existing) => {
      if (!period.overlapsWith(existing)) {
        return null;
      }

      return {
        overlappingPeriod: existing,
        overlapDays: period.getOverlapDayCount(existing),
        isFullyContained: period.isContainedIn(existing),
      };
    })
    .filter((info): info is OverlapInfo => info !== null);
}

/**
 * Unify overlapping or contiguous vacation periods
 *
 * This creates a minimal set of non-overlapping periods that cover
 * the same dates as the original periods.
 *
 * @param periods - List of vacation periods (can have overlaps)
 * @returns Unified list of non-overlapping periods
 */
export function unifyVacationPeriods(periods: VacationPeriod[]): VacationPeriod[] {
  if (periods.length <= 1) return periods;

  // Sort by start date
  const sorted = sortVacationsByDate(periods);
  const unified: VacationPeriod[] = [];

  let currentStart = sorted[0].startDate;
  let currentEnd = sorted[0].endDate;
  let currentDescription = sorted[0].description;

  for (let i = 1; i < sorted.length; i++) {
    const period = sorted[i];

    // Check if this period overlaps or is contiguous with current
    const tempPeriod = VacationPeriod.create({
      startDate: currentStart,
      endDate: currentEnd,
    }).getValue();

    if (tempPeriod.overlapsWith(period) || tempPeriod.isContiguousWith(period)) {
      // Extend the current period
      currentEnd = new Date(Math.max(currentEnd.getTime(), period.endDate.getTime()));
      // Combine descriptions if both exist
      if (period.hasDescription() && currentDescription) {
        currentDescription = currentDescription;
      } else if (period.hasDescription()) {
        currentDescription = period.description;
      }
    } else {
      // Save current period and start a new one
      const unifiedPeriod = VacationPeriod.create({
        startDate: currentStart,
        endDate: currentEnd,
        description: currentDescription,
      }).getValue();
      unified.push(unifiedPeriod);

      currentStart = period.startDate;
      currentEnd = period.endDate;
      currentDescription = period.description;
    }
  }

  // Add the last period
  const lastPeriod = VacationPeriod.create({
    startDate: currentStart,
    endDate: currentEnd,
    description: currentDescription,
  }).getValue();
  unified.push(lastPeriod);

  return unified;
}

/**
 * Check if a date falls within any vacation period
 *
 * @param date - Date to check
 * @param periods - List of vacation periods
 * @returns The vacation period if found, undefined otherwise
 */
export function findVacationPeriodByDate(
  date: Date,
  periods: VacationPeriod[]
): VacationPeriod | undefined {
  return periods.find((p) => p.includesDate(date));
}

/**
 * Check if a date is within a vacation period
 *
 * @param date - Date to check
 * @param periods - List of vacation periods
 * @returns True if the date is within any vacation period
 */
export function isVacationDay(
  date: Date,
  periods: VacationPeriod[]
): boolean {
  return findVacationPeriodByDate(date, periods) !== undefined;
}

/**
 * Get vacation periods filtered by year
 *
 * @param periods - List of vacation periods
 * @param year - Year to filter by
 * @returns Periods within the specified year
 */
export function getVacationPeriodsByYear(
  periods: VacationPeriod[],
  year: Year
): VacationPeriod[] {
  const yearStart = new Date(year.value, 0, 1);
  const yearEnd = new Date(year.value, 11, 31);

  return periods.filter(
    (p) => p.startDate <= yearEnd && p.endDate >= yearStart
  );
}
