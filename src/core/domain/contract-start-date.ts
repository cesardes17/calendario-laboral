/**
 * ContractStartDate Value Object
 *
 * Represents the date when a contract started within a specific year.
 * Implements HU-002 business rules:
 * - Must be within the selected year
 * - Used to calculate "Not contracted" days before this date
 */

import { Result } from './result';
import { Year } from './year';

export class ContractStartDate {
  private readonly _value: Date;
  private readonly _year: Year;

  private constructor(value: Date, year: Year) {
    this._value = value;
    this._year = year;
  }

  /**
   * Gets the date value
   */
  get value(): Date {
    return new Date(this._value); // Return copy to maintain immutability
  }

  /**
   * Creates a new ContractStartDate with validation
   * @param date - The contract start date
   * @param year - The year context for validation
   * @returns Result containing ContractStartDate or error
   */
  public static create(date: Date, year: Year): Result<ContractStartDate> {
    // Validate date is valid
    if (isNaN(date.getTime())) {
      return Result.fail<ContractStartDate>('La fecha debe ser válida');
    }

    // Validate date is within the year
    const yearValue = year.value;
    const dateYear = date.getFullYear();

    if (dateYear !== yearValue) {
      return Result.fail<ContractStartDate>(
        `La fecha de inicio debe estar dentro del año ${yearValue}`
      );
    }

    return Result.ok<ContractStartDate>(new ContractStartDate(date, year));
  }

  /**
   * Calculates the number of days before the contract started
   * (from January 1st to the day before contract start)
   * @returns Number of days as "Not contracted"
   */
  public getDaysBeforeContract(): number {
    const yearStart = new Date(this._year.value, 0, 1); // January 1st
    const contractStart = this._value;

    // Calculate difference in milliseconds
    const diffMs = contractStart.getTime() - yearStart.getTime();

    // Convert to days
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Returns ISO string format of the date
   */
  public toISOString(): string {
    return this._value.toISOString();
  }

  /**
   * Returns localized date string
   */
  public toLocaleDateString(locale: string = 'es-ES'): string {
    return this._value.toLocaleDateString(locale);
  }

  /**
   * Compares this date with another for equality
   */
  public equals(other: ContractStartDate): boolean {
    return this._value.getTime() === other._value.getTime();
  }

  /**
   * Checks if this date is before another
   */
  public isBefore(other: ContractStartDate): boolean {
    return this._value.getTime() < other._value.getTime();
  }

  /**
   * Checks if this date is after another
   */
  public isAfter(other: ContractStartDate): boolean {
    return this._value.getTime() > other._value.getTime();
  }

  /**
   * Returns string representation
   */
  public toString(): string {
    return this.toLocaleDateString();
  }
}
