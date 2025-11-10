import { TurnoExtra } from '../domain/turnoExtra';
import { Year } from '../domain/year';
import { Result } from '../domain/result';

/**
 * Use Case: Manage Extra Shifts (Turnos Extras)
 *
 * Handles business logic for managing extra shifts in the calendar.
 * Includes adding, removing, updating, and retrieving extra shifts with validation.
 *
 * Business Rules:
 * - An extra shift must be within the selected year
 * - Cannot add duplicate extra shifts (same date)
 * - Extra shifts are automatically sorted by date
 * - Can be assigned to ANY day (unlike Guardia which has cycle restrictions)
 * - Extra shift hours are added on top of base day hours
 */

/**
 * Add an extra shift to the list
 *
 * @param extraShift - The extra shift to add
 * @param existingExtraShifts - Current list of extra shifts
 * @param year - The selected year for validation
 * @returns Result with updated extra shifts list or error
 */
export function addExtraShift(
  extraShift: TurnoExtra,
  existingExtraShifts: TurnoExtra[],
  year: Year
): Result<TurnoExtra[]> {
  // Validate that extra shift is in the selected year
  if (extraShift.getYear() !== year.value) {
    return Result.fail(
      `El turno extra debe estar en el año ${year.value}`
    );
  }

  // Check for duplicates
  const duplicate = existingExtraShifts.find((es) => es.isSameDate(extraShift));
  if (duplicate) {
    return Result.fail(
      `Ya existe un turno extra en la fecha ${extraShift.getFormattedDate()}`
    );
  }

  // Add and sort
  const updated = [...existingExtraShifts, extraShift];
  return Result.ok(sortExtraShiftsByDate(updated));
}

/**
 * Remove an extra shift from the list by date
 *
 * @param date - The date of the extra shift to remove
 * @param extraShifts - Current list of extra shifts
 * @returns Result with updated extra shifts list or error
 */
export function removeExtraShift(
  date: Date,
  extraShifts: TurnoExtra[]
): Result<TurnoExtra[]> {
  const index = extraShifts.findIndex((es) => es.isOnDate(date));

  if (index === -1) {
    return Result.fail('No se encontró el turno extra a eliminar');
  }

  const updated = extraShifts.filter((_, i) => i !== index);
  return Result.ok(updated);
}

/**
 * Update an existing extra shift
 *
 * @param originalDate - The date of the extra shift to update
 * @param updatedExtraShift - The new extra shift data
 * @param extraShifts - Current list of extra shifts
 * @param year - The selected year for validation
 * @returns Result with updated extra shifts list or error
 */
export function updateExtraShift(
  originalDate: Date,
  updatedExtraShift: TurnoExtra,
  extraShifts: TurnoExtra[],
  year: Year
): Result<TurnoExtra[]> {
  // Find the extra shift to update
  const index = extraShifts.findIndex((es) => es.isOnDate(originalDate));

  if (index === -1) {
    return Result.fail('No se encontró el turno extra a actualizar');
  }

  // Validate that updated extra shift is in the selected year
  if (updatedExtraShift.getYear() !== year.value) {
    return Result.fail(
      `El turno extra debe estar en el año ${year.value}`
    );
  }

  // If date changed, check for duplicates (excluding the current one)
  if (!updatedExtraShift.isOnDate(originalDate)) {
    const duplicate = extraShifts.find((es, i) =>
      i !== index && es.isSameDate(updatedExtraShift)
    );

    if (duplicate) {
      return Result.fail(
        `Ya existe un turno extra en la fecha ${updatedExtraShift.getFormattedDate()}`
      );
    }
  }

  // Update and sort
  const updated = extraShifts.map((es, i) => (i === index ? updatedExtraShift : es));
  return Result.ok(sortExtraShiftsByDate(updated));
}

/**
 * Sort extra shifts by date (earliest first)
 *
 * @param extraShifts - List of extra shifts to sort
 * @returns Sorted list of extra shifts
 */
export function sortExtraShiftsByDate(extraShifts: TurnoExtra[]): TurnoExtra[] {
  return [...extraShifts].sort((a, b) => a.compareTo(b));
}

/**
 * Get extra shifts filtered by year
 *
 * @param extraShifts - List of extra shifts
 * @param year - Year to filter by
 * @returns Extra shifts in the specified year
 */
export function getExtraShiftsByYear(
  extraShifts: TurnoExtra[],
  year: Year
): TurnoExtra[] {
  return extraShifts.filter((es) => es.getYear() === year.value);
}

/**
 * Find an extra shift by date
 *
 * @param date - Date to check
 * @param extraShifts - List of extra shifts
 * @returns The extra shift if found, undefined otherwise
 */
export function findExtraShiftByDate(
  date: Date,
  extraShifts: TurnoExtra[]
): TurnoExtra | undefined {
  return extraShifts.find((es) => es.isOnDate(date));
}

/**
 * Check if a date has an extra shift
 *
 * @param date - Date to check
 * @param extraShifts - List of extra shifts
 * @returns True if the date has an extra shift
 */
export function hasExtraShift(
  date: Date,
  extraShifts: TurnoExtra[]
): boolean {
  return findExtraShiftByDate(date, extraShifts) !== undefined;
}
