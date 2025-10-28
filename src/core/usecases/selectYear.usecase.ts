/**
 * SelectYear Use Case
 *
 * Business logic for selecting a year for the work calendar.
 * Implements HU-001 requirements:
 * - Validates year within acceptable range (current - 2 to current + 5)
 * - Provides current year as default
 * - Returns validation results
 */

import { Year } from '../domain/year';
import { Result } from '../domain/result';

export interface YearValidationResult {
  isValid: boolean;
  error?: string;
}

export interface YearRange {
  min: number;
  max: number;
  current: number;
}

export class SelectYearUseCase {
  /**
   * Executes the year selection use case
   * @param yearValue - Optional year value, defaults to current year
   * @returns Result containing Year instance or error
   */
  public execute(yearValue?: number): Result<Year> {
    // If no year provided, use current year
    if (yearValue === undefined) {
      return Result.ok(Year.createCurrent());
    }

    // Create and validate year
    return Year.create(yearValue);
  }

  /**
   * Validates a year without creating a Year instance
   * Useful for form validation before submission
   * @param yearValue - Year to validate
   * @returns Validation result with error message if invalid
   */
  public validateYear(yearValue: number): YearValidationResult {
    const result = Year.create(yearValue);

    if (result.isFailure()) {
      return {
        isValid: false,
        error: result.errorValue(),
      };
    }

    return {
      isValid: true,
    };
  }

  /**
   * Gets the valid year range for selection
   * @returns Object with min, max, and current year
   */
  public getYearRange(): YearRange {
    const currentYear = new Date().getFullYear();

    return {
      min: currentYear - 2,
      max: currentYear + 5,
      current: currentYear,
    };
  }
}
