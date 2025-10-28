/**
 * CycleOffset Value Object
 *
 * Represents the position within a work cycle on January 1st
 * when the user was already working before the selected year.
 * Implements HU-002 business rules:
 * - Specifies which part of the cycle
 * - Specifies which day within that part
 * - Specifies if it's a work day or rest day
 */

import { Result } from './result';

/**
 * Enum for cycle day types
 */
export enum CycleDayType {
  WORK = 'WORK',
  REST = 'REST',
}

export class CycleOffset {
  private readonly _partNumber: number;
  private readonly _dayWithinPart: number;
  private readonly _dayType: CycleDayType;

  private constructor(partNumber: number, dayWithinPart: number, dayType: CycleDayType) {
    this._partNumber = partNumber;
    this._dayWithinPart = dayWithinPart;
    this._dayType = dayType;
  }

  /**
   * Gets the part number (1-based)
   */
  get partNumber(): number {
    return this._partNumber;
  }

  /**
   * Gets the day within the part (1-based)
   */
  get dayWithinPart(): number {
    return this._dayWithinPart;
  }

  /**
   * Gets the day type
   */
  get dayType(): CycleDayType {
    return this._dayType;
  }

  /**
   * Creates a new CycleOffset with validation
   * @param partNumber - The part number (1-based)
   * @param dayWithinPart - The day within the part (1-based)
   * @param dayType - Whether it's a work or rest day
   * @returns Result containing CycleOffset or error
   */
  public static create(
    partNumber: number,
    dayWithinPart: number,
    dayType: CycleDayType
  ): Result<CycleOffset> {
    // Validate part number
    if (partNumber < 1) {
      return Result.fail<CycleOffset>('La parte debe ser mayor o igual a 1');
    }

    // Validate day within part
    if (dayWithinPart < 1) {
      return Result.fail<CycleOffset>('El día dentro de la parte debe ser mayor o igual a 1');
    }

    // Validate day type
    if (!Object.values(CycleDayType).includes(dayType)) {
      return Result.fail<CycleOffset>(
        'El tipo de día debe ser un tipo de día válido (WORK o REST)'
      );
    }

    return Result.ok<CycleOffset>(new CycleOffset(partNumber, dayWithinPart, dayType));
  }

  /**
   * Checks if this is a work day
   */
  public isWorkDay(): boolean {
    return this._dayType === CycleDayType.WORK;
  }

  /**
   * Checks if this is a rest day
   */
  public isRestDay(): boolean {
    return this._dayType === CycleDayType.REST;
  }

  /**
   * Gets a human-readable display text
   */
  public getDisplayText(): string {
    const dayTypeText = this._dayType === CycleDayType.WORK ? 'trabajo' : 'descanso';
    return `Parte ${this._partNumber}, día ${this._dayWithinPart} de ${dayTypeText}`;
  }

  /**
   * Compares this offset with another for equality
   */
  public equals(other: CycleOffset): boolean {
    return (
      this._partNumber === other._partNumber &&
      this._dayWithinPart === other._dayWithinPart &&
      this._dayType === other._dayType
    );
  }

  /**
   * Returns string representation
   */
  public toString(): string {
    return `Part ${this._partNumber}, Day ${this._dayWithinPart}, Type: ${this._dayType}`;
  }
}
