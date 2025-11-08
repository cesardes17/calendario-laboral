import { Guardia } from '../domain/guardia';
import { Year } from '../domain/year';
import { Result } from '../domain/result';

/**
 * Use Case: Manage Guardias (On-call shifts)
 *
 * Handles business logic for managing guardias in the calendar.
 * Includes adding, removing, updating, and retrieving guardias with validation.
 *
 * Business Rules:
 * - A guardia must be within the selected year
 * - Cannot add duplicate guardias (same date)
 * - Guardias are automatically sorted by date
 * - Only applicable for weekly cycles (modo: 'semanal')
 * - Can only be assigned to rest days or holidays
 */

/**
 * Add a guardia to the list
 *
 * @param guardia - The guardia to add
 * @param existingGuardias - Current list of guardias
 * @param year - The selected year for validation
 * @returns Result with updated guardias list or error
 */
export function addGuardia(
  guardia: Guardia,
  existingGuardias: Guardia[],
  year: Year
): Result<Guardia[]> {
  // Validate that guardia is in the selected year
  if (guardia.getYear() !== year.value) {
    return Result.fail(
      `La guardia debe estar en el año ${year.value}`
    );
  }

  // Check for duplicates
  const duplicate = existingGuardias.find((g) => g.isSameDate(guardia));
  if (duplicate) {
    return Result.fail(
      `Ya existe una guardia en la fecha ${guardia.getFormattedDate()}`
    );
  }

  // Add and sort
  const updated = [...existingGuardias, guardia];
  return Result.ok(sortGuardiasByDate(updated));
}

/**
 * Remove a guardia from the list by date
 *
 * @param date - The date of the guardia to remove
 * @param guardias - Current list of guardias
 * @returns Result with updated guardias list or error
 */
export function removeGuardia(
  date: Date,
  guardias: Guardia[]
): Result<Guardia[]> {
  const index = guardias.findIndex((g) => g.isOnDate(date));

  if (index === -1) {
    return Result.fail('No se encontró la guardia a eliminar');
  }

  const updated = guardias.filter((_, i) => i !== index);
  return Result.ok(updated);
}

/**
 * Update an existing guardia
 *
 * @param originalDate - The date of the guardia to update
 * @param updatedGuardia - The new guardia data
 * @param guardias - Current list of guardias
 * @param year - The selected year for validation
 * @returns Result with updated guardias list or error
 */
export function updateGuardia(
  originalDate: Date,
  updatedGuardia: Guardia,
  guardias: Guardia[],
  year: Year
): Result<Guardia[]> {
  // Find the guardia to update
  const index = guardias.findIndex((g) => g.isOnDate(originalDate));

  if (index === -1) {
    return Result.fail('No se encontró la guardia a actualizar');
  }

  // Validate that updated guardia is in the selected year
  if (updatedGuardia.getYear() !== year.value) {
    return Result.fail(
      `La guardia debe estar en el año ${year.value}`
    );
  }

  // If date changed, check for duplicates (excluding the current one)
  if (!updatedGuardia.isOnDate(originalDate)) {
    const duplicate = guardias.find((g, i) =>
      i !== index && g.isSameDate(updatedGuardia)
    );

    if (duplicate) {
      return Result.fail(
        `Ya existe una guardia en la fecha ${updatedGuardia.getFormattedDate()}`
      );
    }
  }

  // Update and sort
  const updated = guardias.map((g, i) => (i === index ? updatedGuardia : g));
  return Result.ok(sortGuardiasByDate(updated));
}

/**
 * Sort guardias by date (earliest first)
 *
 * @param guardias - List of guardias to sort
 * @returns Sorted list of guardias
 */
export function sortGuardiasByDate(guardias: Guardia[]): Guardia[] {
  return [...guardias].sort((a, b) => a.compareTo(b));
}

/**
 * Get guardias filtered by year
 *
 * @param guardias - List of guardias
 * @param year - Year to filter by
 * @returns Guardias in the specified year
 */
export function getGuardiasByYear(
  guardias: Guardia[],
  year: Year
): Guardia[] {
  return guardias.filter((g) => g.getYear() === year.value);
}

/**
 * Find a guardia by date
 *
 * @param date - Date to check
 * @param guardias - List of guardias
 * @returns The guardia if found, undefined otherwise
 */
export function findGuardiaByDate(
  date: Date,
  guardias: Guardia[]
): Guardia | undefined {
  return guardias.find((g) => g.isOnDate(date));
}

/**
 * Check if a date is a guardia
 *
 * @param date - Date to check
 * @param guardias - List of guardias
 * @returns True if the date is a guardia
 */
export function isGuardia(
  date: Date,
  guardias: Guardia[]
): boolean {
  return findGuardiaByDate(date, guardias) !== undefined;
}
