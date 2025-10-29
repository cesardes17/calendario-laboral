import { Result } from './result';

/**
 * VacationPeriod Value Object
 *
 * Represents a vacation period with start date, end date, and optional description.
 *
 * Business Rules (HU-014):
 * - End date must be >= start date
 * - Both dates must be valid
 * - Description is optional with max 100 characters
 * - Vacation periods can overlap (system unifies automatically)
 * - Vacations have priority 2 (after "Not Contracted")
 * - Vacations override any cycle state (Work/Rest/Holiday)
 *
 * @example
 * ```typescript
 * const vacation = VacationPeriod.create({
 *   startDate: new Date(2025, 6, 15), // July 15
 *   endDate: new Date(2025, 6, 31),   // July 31
 *   description: 'Vacaciones de verano'
 * });
 * ```
 */
export class VacationPeriod {
  private constructor(
    private readonly _startDate: Date,
    private readonly _endDate: Date,
    private readonly _description: string
  ) {}

  /**
   * Factory method to create a VacationPeriod
   */
  static create(props: {
    startDate: Date;
    endDate: Date;
    description?: string;
  }): Result<VacationPeriod> {
    const { startDate, endDate, description = '' } = props;

    // Validate start date
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      return Result.fail('La fecha de inicio no es válida');
    }

    // Validate end date
    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      return Result.fail('La fecha de fin no es válida');
    }

    // Validate end date >= start date
    if (endDate < startDate) {
      return Result.fail('La fecha de fin debe ser posterior o igual a la fecha de inicio');
    }

    // Validate description length
    const trimmedDescription = description.trim();
    if (trimmedDescription.length > 100) {
      return Result.fail('La descripción no puede superar 100 caracteres');
    }

    // Create defensive copies of dates
    return Result.ok(
      new VacationPeriod(
        new Date(startDate),
        new Date(endDate),
        trimmedDescription
      )
    );
  }

  /**
   * Get the start date
   */
  get startDate(): Date {
    return new Date(this._startDate);
  }

  /**
   * Get the end date
   */
  get endDate(): Date {
    return new Date(this._endDate);
  }

  /**
   * Get the description
   */
  get description(): string {
    return this._description;
  }

  /**
   * Check if this period has a description
   */
  hasDescription(): boolean {
    return this._description.length > 0;
  }

  /**
   * Get the number of days in this vacation period (inclusive)
   */
  getDayCount(): number {
    // Create copies to avoid mutating original dates
    const start = new Date(this._startDate);
    const end = new Date(this._endDate);

    // Normalize to noon to avoid timezone/DST issues
    start.setHours(12, 0, 0, 0);
    end.setHours(12, 0, 0, 0);

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.round(timeDiff / millisecondsPerDay);
    return daysDiff + 1; // +1 because both dates are inclusive
  }

  /**
   * Check if a given date falls within this vacation period (inclusive)
   */
  includesDate(date: Date): boolean {
    const dateTime = date.getTime();
    return dateTime >= this._startDate.getTime() && dateTime <= this._endDate.getTime();
  }

  /**
   * Check if this period overlaps with another vacation period
   */
  overlapsWith(other: VacationPeriod): boolean {
    return (
      this._startDate <= other._endDate &&
      this._endDate >= other._startDate
    );
  }

  /**
   * Get the number of overlapping days with another period
   * Returns 0 if no overlap
   */
  getOverlapDayCount(other: VacationPeriod): number {
    if (!this.overlapsWith(other)) {
      return 0;
    }

    const overlapStart = new Date(
      Math.max(this._startDate.getTime(), other._startDate.getTime())
    );
    const overlapEnd = new Date(
      Math.min(this._endDate.getTime(), other._endDate.getTime())
    );

    // Normalize to noon to avoid timezone/DST issues
    overlapStart.setHours(12, 0, 0, 0);
    overlapEnd.setHours(12, 0, 0, 0);

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const timeDiff = overlapEnd.getTime() - overlapStart.getTime();
    const daysDiff = Math.round(timeDiff / millisecondsPerDay);
    return daysDiff + 1;
  }

  /**
   * Check if this period is entirely contained within another period
   */
  isContainedIn(other: VacationPeriod): boolean {
    return (
      this._startDate >= other._startDate &&
      this._endDate <= other._endDate
    );
  }

  /**
   * Check if this period is contiguous with another (ends/starts on adjacent days)
   */
  isContiguousWith(other: VacationPeriod): boolean {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const thisEndPlusOne = new Date(this._endDate.getTime() + millisecondsPerDay);
    const otherEndPlusOne = new Date(other._endDate.getTime() + millisecondsPerDay);

    return (
      thisEndPlusOne.toDateString() === other._startDate.toDateString() ||
      otherEndPlusOne.toDateString() === this._startDate.toDateString()
    );
  }

  /**
   * Format date range as "d MMM - d MMM"
   * @example "15 jul - 31 jul"
   */
  getFormattedDateRange(): string {
    const months = [
      'ene', 'feb', 'mar', 'abr', 'may', 'jun',
      'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ];

    const startDay = this._startDate.getDate();
    const startMonth = months[this._startDate.getMonth()];
    const endDay = this._endDate.getDate();
    const endMonth = months[this._endDate.getMonth()];

    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  }

  /**
   * Get display text for the vacation period
   */
  getDisplayText(): string {
    const dateRange = this.getFormattedDateRange();
    const dayCount = this.getDayCount();
    const descriptionStr = this.hasDescription() ? ` - ${this._description}` : '';

    return `${dateRange} (${dayCount} ${dayCount === 1 ? 'día' : 'días'})${descriptionStr}`;
  }

  /**
   * Compare this period with another for sorting by start date
   * Returns negative if this is before other, positive if after, 0 if same
   */
  compareTo(other: VacationPeriod): number {
    return this._startDate.getTime() - other._startDate.getTime();
  }

  /**
   * Create a copy of this vacation period with updated properties
   */
  copyWith(updates: {
    startDate?: Date;
    endDate?: Date;
    description?: string;
  }): Result<VacationPeriod> {
    return VacationPeriod.create({
      startDate: updates.startDate ?? this._startDate,
      endDate: updates.endDate ?? this._endDate,
      description: updates.description ?? this._description,
    });
  }

  /**
   * Convert to plain object for serialization
   */
  toObject(): {
    startDate: string; // ISO string
    endDate: string;   // ISO string
    description: string;
  } {
    return {
      startDate: this._startDate.toISOString(),
      endDate: this._endDate.toISOString(),
      description: this._description,
    };
  }

  /**
   * Create from plain object (deserialization)
   */
  static fromObject(obj: {
    startDate: string | Date;
    endDate: string | Date;
    description?: string;
  }): Result<VacationPeriod> {
    const startDate = typeof obj.startDate === 'string'
      ? new Date(obj.startDate)
      : obj.startDate;
    const endDate = typeof obj.endDate === 'string'
      ? new Date(obj.endDate)
      : obj.endDate;

    return VacationPeriod.create({
      startDate,
      endDate,
      description: obj.description,
    });
  }
}
