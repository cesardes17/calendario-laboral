/**
 * Year Value Object
 *
 * Represents a valid year for the work calendar application.
 * Enforces business rules:
 * - Must be a 4-digit year
 * - Must be within valid range: current year - 2 to current year + 5 (HU-001)
 * - Provides leap year detection for accurate calendar generation
 */

import { Result } from './result';

export class Year {
  private readonly _value: number;

  private constructor(value: number) {
    this._value = value;
  }

  /**
   * Gets the numeric value of the year
   */
  get value(): number {
    return this._value;
  }

  /**
   * Creates a new Year instance with validation
   * @param year - The year value (must be 4 digits and within valid range)
   * @returns Result containing Year instance or error message
   */
  public static create(year: number): Result<Year> {
    // Validate 4-digit year
    if (year < 1000 || year > 9999) {
      return Result.fail<Year>('El año debe tener 4 dígitos');
    }

    // Validate year is within allowed range (current - 2 to current + 5)
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 2;
    const maxYear = currentYear + 5;

    if (year < minYear || year > maxYear) {
      return Result.fail<Year>(
        `El año debe estar en el rango válido (${minYear} - ${maxYear})`
      );
    }

    return Result.ok<Year>(new Year(year));
  }

  /**
   * Creates a Year instance for the current year
   * @returns Year instance for current year
   */
  public static createCurrent(): Year {
    const currentYear = new Date().getFullYear();
    // Current year is always valid, so we can safely getValue()
    return Year.create(currentYear).getValue();
  }

  /**
   * Determines if this year is a leap year
   * Leap year rules:
   * - Divisible by 4 AND
   * - (Not divisible by 100 OR divisible by 400)
   *
   * @returns true if leap year, false otherwise
   */
  public isLeapYear(): boolean {
    return (
      (this._value % 4 === 0 && this._value % 100 !== 0) ||
      this._value % 400 === 0
    );
  }

  /**
   * Gets the number of days in this year
   * @returns 366 for leap years, 365 for regular years
   */
  public getDaysInYear(): number {
    return this.isLeapYear() ? 366 : 365;
  }

  /**
   * Compares this year with another for equality
   * @param other - Another Year instance
   * @returns true if years are equal
   */
  public equals(other: Year): boolean {
    return this._value === other._value;
  }

  /**
   * Returns string representation of the year
   * @returns Year as string
   */
  public toString(): string {
    return this._value.toString();
  }
}
