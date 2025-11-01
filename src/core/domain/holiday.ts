import { Result } from './result';

/**
 * Holiday Value Object
 *
 * Represents a holiday (festivo) with its date, optional name, and worked status.
 *
 * Business Rules:
 * - Date must be valid
 * - Name is optional but has a maximum length of 100 characters
 * - Worked flag indicates if the user worked on this holiday (default: false)
 * - If worked = true, holiday becomes "FestivoTrabajado" with hours calculated
 * - If worked = false, holiday becomes "Festivo" with 0 hours
 *
 * @example
 * ```typescript
 * const holiday = Holiday.create({
 *   date: new Date(2025, 0, 1),
 *   name: 'Año Nuevo',
 *   worked: false
 * });
 * ```
 */
export class Holiday {
  private constructor(
    private readonly _date: Date,
    private readonly _name: string,
    private readonly _worked: boolean
  ) {}

  /**
   * Factory method to create a Holiday
   */
  static create(props: {
    date: Date;
    name?: string;
    worked?: boolean;
  }): Result<Holiday> {
    const { date, name = '', worked = false } = props;

    // Validate date
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return Result.fail('La fecha del festivo no es válida');
    }

    // Validate name length
    const trimmedName = name.trim();
    if (trimmedName.length > 100) {
      return Result.fail('El nombre del festivo no puede superar 100 caracteres');
    }

    return Result.ok(new Holiday(new Date(date), trimmedName, worked));
  }

  /**
   * Get the holiday date
   */
  get date(): Date {
    return new Date(this._date);
  }

  /**
   * Get the holiday name
   */
  get name(): string {
    return this._name;
  }

  /**
   * Get whether this holiday was worked
   */
  get worked(): boolean {
    return this._worked;
  }

  /**
   * Check if this holiday has a name
   */
  hasName(): boolean {
    return this._name.length > 0;
  }

  /**
   * Check if this holiday was worked
   */
  isWorked(): boolean {
    return this._worked;
  }

  /**
   * Get the year of this holiday
   */
  getYear(): number {
    return this._date.getFullYear();
  }

  /**
   * Get the month (0-11)
   */
  getMonth(): number {
    return this._date.getMonth();
  }

  /**
   * Get the day of month (1-31)
   */
  getDayOfMonth(): number {
    return this._date.getDate();
  }

  /**
   * Check if this holiday is on the same date as another
   */
  isSameDate(other: Holiday): boolean {
    return (
      this.getYear() === other.getYear() &&
      this.getMonth() === other.getMonth() &&
      this.getDayOfMonth() === other.getDayOfMonth()
    );
  }

  /**
   * Check if this holiday is on the given date
   */
  isOnDate(date: Date): boolean {
    return (
      this.getYear() === date.getFullYear() &&
      this.getMonth() === date.getMonth() &&
      this.getDayOfMonth() === date.getDate()
    );
  }

  /**
   * Format the date as "d MMMM"
   * @example "1 enero", "6 enero", "25 diciembre"
   */
  getFormattedDate(): string {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    return `${this.getDayOfMonth()} ${months[this.getMonth()]}`;
  }

  /**
   * Get display text for the holiday
   */
  getDisplayText(): string {
    const dateStr = this.getFormattedDate();
    const nameStr = this.hasName() ? ` - ${this._name}` : '';

    return `${dateStr}${nameStr}`;
  }

  /**
   * Compare this holiday with another for sorting by date
   * Returns negative if this is before other, positive if after, 0 if same
   */
  compareTo(other: Holiday): number {
    return this._date.getTime() - other.date.getTime();
  }

  /**
   * Create a copy of this holiday with updated properties
   */
  copyWith(updates: {
    date?: Date;
    name?: string;
    worked?: boolean;
  }): Result<Holiday> {
    return Holiday.create({
      date: updates.date ?? this._date,
      name: updates.name ?? this._name,
      worked: updates.worked ?? this._worked,
    });
  }

  /**
   * Convert to plain object for serialization
   */
  toObject(): {
    date: string; // ISO string
    name: string;
    worked: boolean;
  } {
    return {
      date: this._date.toISOString(),
      name: this._name,
      worked: this._worked,
    };
  }

  /**
   * Create from plain object (deserialization)
   */
  static fromObject(obj: {
    date: string | Date;
    name?: string;
    worked?: boolean;
  }): Result<Holiday> {
    const date = typeof obj.date === 'string' ? new Date(obj.date) : obj.date;

    return Holiday.create({
      date,
      name: obj.name,
      worked: obj.worked,
    });
  }
}
