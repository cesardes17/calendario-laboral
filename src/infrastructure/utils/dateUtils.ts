/**
 * Date Utilities
 *
 * Helper functions for date calculations used in calendar generation.
 * Implements ISO 8601 week numbering standard.
 */

/**
 * Calculates the ISO 8601 week number for a given date.
 *
 * ISO 8601 week numbering rules:
 * - Weeks start on Monday
 * - Week 1 is the first week with at least 4 days in January
 * - Week 1 always contains January 4th
 * - Weeks can span across year boundaries
 *
 * @param date - The date to calculate the week number for
 * @returns ISO week number (1-53)
 *
 * @example
 * getISOWeekNumber(new Date('2025-01-01')) // Returns 1
 * getISOWeekNumber(new Date('2025-12-31')) // Returns 53 or 1 depending on the year
 */
export function getISOWeekNumber(date: Date): number {
  // Create a copy to avoid mutating the original date
  const target = new Date(date.valueOf());

  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  const dayNum = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNum + 3);

  // January 4 is always in week 1
  const firstThursday = new Date(target.getFullYear(), 0, 4);

  // Adjust to Thursday in week 1
  const firstThursdayDayNum = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstThursdayDayNum + 3);

  // Calculate week number
  const weekDiff = (target.getTime() - firstThursday.getTime()) / 86400000;
  return 1 + Math.round(weekDiff / 7);
}

/**
 * Gets the number of days in a specific month of a year.
 *
 * @param year - The year (for leap year calculation)
 * @param month - The month (1-12)
 * @returns Number of days in the month (28-31)
 *
 * @example
 * getDaysInMonth(2024, 2) // Returns 29 (leap year)
 * getDaysInMonth(2025, 2) // Returns 28
 * getDaysInMonth(2025, 1) // Returns 31
 */
export function getDaysInMonth(year: number, month: number): number {
  // Month is 1-indexed in our API, but Date constructor expects 0-indexed
  // Setting day to 0 gets the last day of the previous month
  return new Date(year, month, 0).getDate();
}

/**
 * Checks if a given year is a leap year.
 *
 * Leap year rules:
 * - Divisible by 4 AND
 * - (Not divisible by 100 OR divisible by 400)
 *
 * @param year - The year to check
 * @returns true if leap year, false otherwise
 *
 * @example
 * isLeapYear(2024) // Returns true
 * isLeapYear(2025) // Returns false
 * isLeapYear(2000) // Returns true
 * isLeapYear(1900) // Returns false
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Creates a normalized date (midnight UTC) from year, month, and day.
 *
 * This ensures consistent date comparisons without time zone issues.
 *
 * @param year - The year
 * @param month - The month (1-12)
 * @param day - The day of the month (1-31)
 * @returns Date object set to midnight UTC
 *
 * @example
 * createDate(2025, 1, 1) // Returns 2025-01-01T00:00:00.000Z
 */
export function createDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

/**
 * Formats a date to YYYY-MM-DD string format.
 *
 * @param date - The date to format
 * @returns Date string in YYYY-MM-DD format
 *
 * @example
 * formatDateISO(new Date('2025-01-15')) // Returns "2025-01-15"
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
