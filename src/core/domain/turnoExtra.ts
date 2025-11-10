import { Result } from './result';

/**
 * TurnoExtra (Extra Shift) Value Object
 *
 * Represents an extra shift worked on any day with specific hours.
 *
 * Business Rules:
 * - Date must be valid
 * - Can be assigned to ANY day (unlike Guardia which has cycle restrictions)
 * - Hours must be >= 0 and <= 24
 * - Description is optional but has a maximum length of 200 characters
 * - Extra shifts count as additional worked hours (on top of base hours)
 * - Priority: Does not change day state, only adds hours
 *
 * @example
 * ```typescript
 * const turnoExtra = TurnoExtra.create({
 *   date: new Date(2025, 0, 15),
 *   hours: 8,
 *   description: 'Cubriendo turno de tarde de compañero'
 * });
 * ```
 */
export class TurnoExtra {
  private constructor(
    private readonly _date: Date,
    private readonly _hours: number,
    private readonly _description: string
  ) {}

  /**
   * Factory method to create a TurnoExtra
   */
  static create(props: {
    date: Date;
    hours: number;
    description?: string;
  }): Result<TurnoExtra> {
    const { date, hours, description = '' } = props;

    // Validate date
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return Result.fail('La fecha del turno extra no es válida');
    }

    // Validate hours
    if (typeof hours !== 'number' || isNaN(hours)) {
      return Result.fail('Las horas deben ser un número válido');
    }

    if (hours < 0) {
      return Result.fail('Las horas no pueden ser negativas');
    }

    if (hours > 24) {
      return Result.fail('Las horas no pueden superar 24 horas en un día');
    }

    // Validate description length
    const trimmedDescription = description.trim();
    if (trimmedDescription.length > 200) {
      return Result.fail('La descripción no puede superar 200 caracteres');
    }

    return Result.ok(new TurnoExtra(new Date(date), hours, trimmedDescription));
  }

  /**
   * Get the turno extra date
   */
  get date(): Date {
    return new Date(this._date);
  }

  /**
   * Get the hours worked on this turno extra
   */
  get hours(): number {
    return this._hours;
  }

  /**
   * Get the turno extra description
   */
  get description(): string {
    return this._description;
  }

  /**
   * Check if this turno extra has a description
   */
  hasDescription(): boolean {
    return this._description.length > 0;
  }

  /**
   * Get the year of this turno extra
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
   * Check if this turno extra is on the same date as another
   */
  isSameDate(other: TurnoExtra): boolean {
    return (
      this.getYear() === other.getYear() &&
      this.getMonth() === other.getMonth() &&
      this.getDayOfMonth() === other.getDayOfMonth()
    );
  }

  /**
   * Check if this turno extra is on the given date
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
   * @example "15 enero", "6 febrero", "25 diciembre"
   */
  getFormattedDate(): string {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    return `${this.getDayOfMonth()} ${months[this.getMonth()]}`;
  }

  /**
   * Get display text for the turno extra
   */
  getDisplayText(): string {
    const dateStr = this.getFormattedDate();
    const hoursStr = `${this._hours}h`;
    const descriptionStr = this.hasDescription() ? ` - ${this._description}` : '';

    return `${dateStr} (${hoursStr})${descriptionStr}`;
  }

  /**
   * Compare this turno extra with another for sorting by date
   * Returns negative if this is before other, positive if after, 0 if same
   */
  compareTo(other: TurnoExtra): number {
    return this._date.getTime() - other.date.getTime();
  }

  /**
   * Create a copy of this turno extra with updated properties
   */
  copyWith(updates: {
    date?: Date;
    hours?: number;
    description?: string;
  }): Result<TurnoExtra> {
    return TurnoExtra.create({
      date: updates.date ?? this._date,
      hours: updates.hours ?? this._hours,
      description: updates.description ?? this._description,
    });
  }

  /**
   * Convert to plain object for serialization
   */
  toObject(): {
    date: string; // ISO string
    hours: number;
    description: string;
  } {
    return {
      date: this._date.toISOString(),
      hours: this._hours,
      description: this._description,
    };
  }

  /**
   * Create from plain object (deserialization)
   */
  static fromObject(obj: {
    date: string | Date;
    hours: number;
    description?: string;
  }): Result<TurnoExtra> {
    const date = typeof obj.date === 'string' ? new Date(obj.date) : obj.date;

    return TurnoExtra.create({
      date,
      hours: obj.hours,
      description: obj.description,
    });
  }
}
