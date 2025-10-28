/**
 * EmploymentStatus Value Object
 *
 * Represents the employment status at the beginning of the year.
 * Implements HU-002 business rules:
 * - Two mutually exclusive options
 * - STARTED_THIS_YEAR: Requires contract start date
 * - WORKED_BEFORE: Requires cycle offset
 */

import { Result } from './result';

/**
 * Enum for employment status types
 */
export enum EmploymentStatusType {
  STARTED_THIS_YEAR = 'STARTED_THIS_YEAR',
  WORKED_BEFORE = 'WORKED_BEFORE',
}

export class EmploymentStatus {
  private readonly _type: EmploymentStatusType;

  private constructor(type: EmploymentStatusType) {
    this._type = type;
  }

  /**
   * Gets the employment status type
   */
  get type(): EmploymentStatusType {
    return this._type;
  }

  /**
   * Creates a new EmploymentStatus instance with validation
   * @param type - The employment status type
   * @returns Result containing EmploymentStatus instance or error message
   */
  public static create(type: EmploymentStatusType): Result<EmploymentStatus> {
    // Validate type is one of the valid enum values
    if (!Object.values(EmploymentStatusType).includes(type)) {
      return Result.fail<EmploymentStatus>(
        'El tipo de situación laboral debe ser válido (STARTED_THIS_YEAR o WORKED_BEFORE)'
      );
    }

    return Result.ok<EmploymentStatus>(new EmploymentStatus(type));
  }

  /**
   * Checks if the status is "started this year"
   */
  public isStartedThisYear(): boolean {
    return this._type === EmploymentStatusType.STARTED_THIS_YEAR;
  }

  /**
   * Checks if the status is "worked before"
   */
  public isWorkedBefore(): boolean {
    return this._type === EmploymentStatusType.WORKED_BEFORE;
  }

  /**
   * Gets the display text for the status
   */
  public getDisplayText(): string {
    switch (this._type) {
      case EmploymentStatusType.STARTED_THIS_YEAR:
        return 'Sí, empecé este año';
      case EmploymentStatusType.WORKED_BEFORE:
        return 'No, ya trabajaba antes';
    }
  }

  /**
   * Gets the help message for the status
   */
  public getHelpMessage(): string {
    switch (this._type) {
      case EmploymentStatusType.STARTED_THIS_YEAR:
        return 'Indica la fecha exacta en que comenzó tu contrato. Los días anteriores aparecerán como \'No contratado\'';
      case EmploymentStatusType.WORKED_BEFORE:
        return 'Indica en qué punto de tu ciclo laboral te encontrabas el 1 de enero para continuar correctamente';
    }
  }

  /**
   * Compares this status with another for equality
   * @param other - Another EmploymentStatus instance
   * @returns true if statuses are equal
   */
  public equals(other: EmploymentStatus): boolean {
    return this._type === other._type;
  }

  /**
   * Returns string representation of the status
   */
  public toString(): string {
    return this._type;
  }
}
