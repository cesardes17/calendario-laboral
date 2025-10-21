/**
 * WorkCycle Value Object
 *
 * Represents the work/rest cycle configuration.
 * Implements HU-003 business rules:
 * - Two modes: weekly (7-day mask) or parts (work/rest blocks)
 * - Weekly mode: at least one work day
 * - Parts mode: at least one part with work > 0 and rest > 0
 */

import { Result } from './result';

/**
 * Enum for cycle modes
 */
export enum CycleMode {
  WEEKLY = 'WEEKLY',
  PARTS = 'PARTS',
}

/**
 * Weekly mask: 7 booleans for Mon-Sun (true = work, false = rest)
 */
export type WeeklyMask = [boolean, boolean, boolean, boolean, boolean, boolean, boolean];

/**
 * A part in the cycle with work and rest days
 */
export interface CyclePart {
  workDays: number;
  restDays: number;
}

export class WorkCycle {
  private readonly _mode: CycleMode;
  private readonly _weeklyMask: WeeklyMask | null;
  private readonly _parts: CyclePart[] | null;

  private constructor(
    mode: CycleMode,
    weeklyMask: WeeklyMask | null,
    parts: CyclePart[] | null
  ) {
    this._mode = mode;
    this._weeklyMask = weeklyMask;
    this._parts = parts;
  }

  /**
   * Gets the cycle mode
   */
  get mode(): CycleMode {
    return this._mode;
  }

  /**
   * Creates a weekly cycle
   * @param mask - 7-day boolean mask (Mon-Sun)
   * @returns Result containing WorkCycle or error
   */
  public static createWeekly(mask: WeeklyMask): Result<WorkCycle> {
    // Validate mask length
    if (mask.length !== 7) {
      return Result.fail<WorkCycle>('La máscara semanal debe tener 7 días (Lunes a Domingo)');
    }

    // Validate at least one work day
    const hasWorkDay = mask.some((day) => day === true);
    if (!hasWorkDay) {
      return Result.fail<WorkCycle>(
        'La máscara semanal debe tener al menos un día trabajado'
      );
    }

    return Result.ok<WorkCycle>(new WorkCycle(CycleMode.WEEKLY, mask, null));
  }

  /**
   * Creates a parts-based cycle
   * @param parts - Array of work/rest day parts
   * @returns Result containing WorkCycle or error
   */
  public static createParts(parts: CyclePart[]): Result<WorkCycle> {
    // Validate at least one part
    if (parts.length === 0) {
      return Result.fail<WorkCycle>('Debe haber al menos una parte en el ciclo');
    }

    // Validate each part
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (part.workDays <= 0) {
        return Result.fail<WorkCycle>(
          `Los días de trabajo en la parte ${i + 1} deben ser mayor que 0`
        );
      }

      if (part.restDays <= 0) {
        return Result.fail<WorkCycle>(
          `Los días de descanso en la parte ${i + 1} deben ser mayor que 0`
        );
      }
    }

    // Create a copy of parts to maintain immutability
    const partsCopy = parts.map((p) => ({ ...p }));

    return Result.ok<WorkCycle>(new WorkCycle(CycleMode.PARTS, null, partsCopy));
  }

  /**
   * Checks if this is a weekly cycle
   */
  public isWeekly(): boolean {
    return this._mode === CycleMode.WEEKLY;
  }

  /**
   * Checks if this is a parts-based cycle
   */
  public isParts(): boolean {
    return this._mode === CycleMode.PARTS;
  }

  /**
   * Gets the weekly mask (only for weekly mode)
   */
  public getWeeklyMask(): WeeklyMask | null {
    return this._weeklyMask ? [...this._weeklyMask] : null;
  }

  /**
   * Gets the parts (only for parts mode)
   */
  public getParts(): CyclePart[] | null {
    return this._parts ? this._parts.map((p) => ({ ...p })) : null;
  }

  /**
   * Gets the total number of parts
   * Returns 1 for weekly mode (can be thought of as 1 repeating part)
   */
  public getTotalParts(): number {
    if (this._mode === CycleMode.WEEKLY) {
      return 1;
    }
    return this._parts?.length ?? 0;
  }

  /**
   * Gets a specific part by 1-based index
   * @param partNumber - Part number (1-based)
   * @returns The part or null if not found
   */
  public getPart(partNumber: number): CyclePart | null {
    if (this._mode === CycleMode.WEEKLY || !this._parts) {
      return null;
    }

    if (partNumber < 1 || partNumber > this._parts.length) {
      return null;
    }

    return { ...this._parts[partNumber - 1] };
  }

  /**
   * Gets the number of work days in a week (only for weekly mode)
   */
  public getWorkDaysInWeek(): number {
    if (this._mode !== CycleMode.WEEKLY || !this._weeklyMask) {
      return 0;
    }

    return this._weeklyMask.filter((day) => day === true).length;
  }

  /**
   * Checks if a given date is a work day according to the cycle
   * For weekly mode, checks the day of the week against the mask
   * For parts mode, this method is not applicable and returns false
   * @param date - The date to check
   * @returns true if it's a work day, false otherwise
   */
  public isWorkDayOnDate(date: Date): boolean {
    if (this._mode !== CycleMode.WEEKLY || !this._weeklyMask) {
      return false;
    }

    // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = date.getDay();

    // Convert to our format (0 = Monday, ..., 6 = Sunday)
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    return this._weeklyMask[adjustedDay];
  }

  /**
   * Gets a human-readable display text
   */
  public getDisplayText(): string {
    if (this._mode === CycleMode.WEEKLY && this._weeklyMask) {
      const workDays = this.getWorkDaysInWeek();
      return `Semanal: ${workDays} días de trabajo`;
    }

    if (this._mode === CycleMode.PARTS && this._parts) {
      const partsText = this._parts
        .map((p) => `${p.workDays}-${p.restDays}`)
        .join(', ');
      return `Por partes: ${partsText}`;
    }

    return 'Ciclo no configurado';
  }

  /**
   * Gets detailed description
   */
  public getDescription(): string {
    if (this._mode === CycleMode.WEEKLY && this._weeklyMask) {
      const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
      const workDays = days.filter((_, i) => this._weeklyMask![i]);
      return `Trabajas: ${workDays.join(', ')}`;
    }

    if (this._mode === CycleMode.PARTS && this._parts) {
      if (this._parts.length === 1) {
        const p = this._parts[0];
        return `${p.workDays} días de trabajo, ${p.restDays} días de descanso (repetido indefinidamente)`;
      }
      return `${this._parts.length} partes que se repiten`;
    }

    return '';
  }

  /**
   * Compares this cycle with another for equality
   */
  public equals(other: WorkCycle): boolean {
    if (this._mode !== other._mode) {
      return false;
    }

    if (this._mode === CycleMode.WEEKLY) {
      if (!this._weeklyMask || !other._weeklyMask) {
        return false;
      }
      return this._weeklyMask.every((day, i) => day === other._weeklyMask![i]);
    }

    if (this._mode === CycleMode.PARTS) {
      if (!this._parts || !other._parts) {
        return false;
      }
      if (this._parts.length !== other._parts.length) {
        return false;
      }
      return this._parts.every(
        (part, i) =>
          part.workDays === other._parts![i].workDays &&
          part.restDays === other._parts![i].restDays
      );
    }

    return false;
  }

  /**
   * Returns string representation
   */
  public toString(): string {
    return this.getDisplayText();
  }
}
