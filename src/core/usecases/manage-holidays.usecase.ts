import { Holiday } from '../domain/holiday';
import { Year } from '../domain/year';
import { Result } from '../domain/result';

/**
 * Use Case: Manage Holidays
 *
 * Handles business logic for managing holidays (festivos) in the calendar.
 * Includes adding, removing, updating, and retrieving holidays with validation.
 *
 * Business Rules:
 * - A holiday must be within the selected year
 * - Cannot add duplicate holidays (same date)
 * - Holidays are automatically sorted by date
 */

/**
 * Add a holiday to the list
 *
 * @param holiday - The holiday to add
 * @param existingHolidays - Current list of holidays
 * @param year - The selected year for validation
 * @returns Result with updated holidays list or error
 */
export function addHoliday(
  holiday: Holiday,
  existingHolidays: Holiday[],
  year: Year
): Result<Holiday[]> {
  // Validate that holiday is in the selected year
  if (holiday.getYear() !== year.value) {
    return Result.fail(
      `El festivo debe estar en el año ${year.value}`
    );
  }

  // Check for duplicates
  const duplicate = existingHolidays.find((h) => h.isSameDate(holiday));
  if (duplicate) {
    return Result.fail(
      `Ya existe un festivo en la fecha ${holiday.getFormattedDate()}`
    );
  }

  // Add and sort
  const updated = [...existingHolidays, holiday];
  return Result.ok(sortHolidaysByDate(updated));
}

/**
 * Remove a holiday from the list by date
 *
 * @param date - The date of the holiday to remove
 * @param holidays - Current list of holidays
 * @returns Result with updated holidays list or error
 */
export function removeHoliday(
  date: Date,
  holidays: Holiday[]
): Result<Holiday[]> {
  const index = holidays.findIndex((h) => h.isOnDate(date));

  if (index === -1) {
    return Result.fail('No se encontró el festivo a eliminar');
  }

  const updated = holidays.filter((_, i) => i !== index);
  return Result.ok(updated);
}

/**
 * Update an existing holiday
 *
 * @param originalDate - The date of the holiday to update
 * @param updatedHoliday - The new holiday data
 * @param holidays - Current list of holidays
 * @param year - The selected year for validation
 * @returns Result with updated holidays list or error
 */
export function updateHoliday(
  originalDate: Date,
  updatedHoliday: Holiday,
  holidays: Holiday[],
  year: Year
): Result<Holiday[]> {
  // Find the holiday to update
  const index = holidays.findIndex((h) => h.isOnDate(originalDate));

  if (index === -1) {
    return Result.fail('No se encontró el festivo a actualizar');
  }

  // Validate that updated holiday is in the selected year
  if (updatedHoliday.getYear() !== year.value) {
    return Result.fail(
      `El festivo debe estar en el año ${year.value}`
    );
  }

  // If date changed, check for duplicates (excluding the current one)
  if (!updatedHoliday.isOnDate(originalDate)) {
    const duplicate = holidays.find((h, i) =>
      i !== index && h.isSameDate(updatedHoliday)
    );

    if (duplicate) {
      return Result.fail(
        `Ya existe un festivo en la fecha ${updatedHoliday.getFormattedDate()}`
      );
    }
  }

  // Update and sort
  const updated = holidays.map((h, i) => (i === index ? updatedHoliday : h));
  return Result.ok(sortHolidaysByDate(updated));
}

/**
 * Sort holidays by date (earliest first)
 *
 * @param holidays - List of holidays to sort
 * @returns Sorted list of holidays
 */
export function sortHolidaysByDate(holidays: Holiday[]): Holiday[] {
  return [...holidays].sort((a, b) => a.compareTo(b));
}

/**
 * Get holidays filtered by year
 *
 * @param holidays - List of holidays
 * @param year - Year to filter by
 * @returns Holidays in the specified year
 */
export function getHolidaysByYear(
  holidays: Holiday[],
  year: Year
): Holiday[] {
  return holidays.filter((h) => h.getYear() === year.value);
}

/**
 * Check if a date is a holiday
 *
 * @param date - Date to check
 * @param holidays - List of holidays
 * @returns The holiday if found, undefined otherwise
 */
export function findHolidayByDate(
  date: Date,
  holidays: Holiday[]
): Holiday | undefined {
  return holidays.find((h) => h.isOnDate(date));
}

/**
 * Check if a date is a holiday
 *
 * @param date - Date to check
 * @param holidays - List of holidays
 * @returns True if the date is a holiday
 */
export function isHoliday(
  date: Date,
  holidays: Holiday[]
): boolean {
  return findHolidayByDate(date, holidays) !== undefined;
}
