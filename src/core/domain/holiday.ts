import { Result } from './result';

/**
 * Holiday Value Object
 *
 * Represents a holiday (festivo) with its date and optional name.
 *
 * Business Rules:
 * - Date must be valid
 * - Name is optional but has a maximum length of 100 characters
 * - Whether the holiday is worked or not is determined by the user's work cycle,
 *   NOT stored in the holiday itself
 *
 * @example
 * ```typescript
 * const holiday = Holiday.create({
 *   date: new Date(2025, 0, 1),
 *   name: 'Año Nuevo'
 * });
 * ```
 */
export class Holiday {
  private constructor(
    private readonly _date: Date,
    private readonly _name: string
  ) {}

  /**
   * Factory method to create a Holiday
   */
  static create(props: {
    date: Date;
    name?: string;
  }): Result<Holiday> {
    const { date, name = '' } = props;

    // Validate date
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return Result.fail('La fecha del festivo no es válida');
    }

    // Validate name length
    const trimmedName = name.trim();
    if (trimmedName.length > 100) {
      return Result.fail('El nombre del festivo no puede superar 100 caracteres');
    }

    return Result.ok(new Holiday(new Date(date), trimmedName));
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
   * Check if this holiday has a name
   */
  hasName(): boolean {
    return this._name.length > 0;
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
  }): Result<Holiday> {
    return Holiday.create({
      date: updates.date ?? this._date,
      name: updates.name ?? this._name,
    });
  }

  /**
   * Convert to plain object for serialization
   */
  toObject(): {
    date: string; // ISO string
    name: string;
  } {
    return {
      date: this._date.toISOString(),
      name: this._name,
    };
  }

  /**
   * Create from plain object (deserialization)
   */
  static fromObject(obj: {
    date: string | Date;
    name?: string;
  }): Result<Holiday> {
    const date = typeof obj.date === 'string' ? new Date(obj.date) : obj.date;

    return Holiday.create({
      date,
      name: obj.name,
    });
  }
}
