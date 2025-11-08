import { Result } from './result';

/**
 * Guardia (On-call shift) Value Object
 *
 * Represents an on-call shift day with its date, hours worked, and optional description.
 *
 * Business Rules:
 * - Date must be valid
 * - Only applicable for weekly cycles (modo: 'semanal')
 * - Can only be assigned to rest days or holidays from the cycle
 * - Hours must be >= 0 and <= 24
 * - Description is optional but has a maximum length of 200 characters
 * - Guardias count as worked hours
 * - Priority: Higher than holidays but lower than vacations
 *
 * @example
 * ```typescript
 * const guardia = Guardia.create({
 *   date: new Date(2025, 0, 1),
 *   hours: 12,
 *   description: 'Guardia de fin de semana'
 * });
 * ```
 */
export class Guardia {
  private constructor(
    private readonly _date: Date,
    private readonly _hours: number,
    private readonly _description: string
  ) {}

  /**
   * Factory method to create a Guardia
   */
  static create(props: {
    date: Date;
    hours: number;
    description?: string;
  }): Result<Guardia> {
    const { date, hours, description = '' } = props;

    // Validate date
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return Result.fail('La fecha de la guardia no es válida');
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

    return Result.ok(new Guardia(new Date(date), hours, trimmedDescription));
  }

  /**
   * Get the guardia date
   */
  get date(): Date {
    return new Date(this._date);
  }

  /**
   * Get the hours worked on this guardia
   */
  get hours(): number {
    return this._hours;
  }

  /**
   * Get the guardia description
   */
  get description(): string {
    return this._description;
  }

  /**
   * Check if this guardia has a description
   */
  hasDescription(): boolean {
    return this._description.length > 0;
  }

  /**
   * Get the year of this guardia
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
   * Check if this guardia is on the same date as another
   */
  isSameDate(other: Guardia): boolean {
    return (
      this.getYear() === other.getYear() &&
      this.getMonth() === other.getMonth() &&
      this.getDayOfMonth() === other.getDayOfMonth()
    );
  }

  /**
   * Check if this guardia is on the given date
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
   * Get display text for the guardia
   */
  getDisplayText(): string {
    const dateStr = this.getFormattedDate();
    const hoursStr = `${this._hours}h`;
    const descriptionStr = this.hasDescription() ? ` - ${this._description}` : '';

    return `${dateStr} (${hoursStr})${descriptionStr}`;
  }

  /**
   * Compare this guardia with another for sorting by date
   * Returns negative if this is before other, positive if after, 0 if same
   */
  compareTo(other: Guardia): number {
    return this._date.getTime() - other.date.getTime();
  }

  /**
   * Create a copy of this guardia with updated properties
   */
  copyWith(updates: {
    date?: Date;
    hours?: number;
    description?: string;
  }): Result<Guardia> {
    return Guardia.create({
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
  }): Result<Guardia> {
    const date = typeof obj.date === 'string' ? new Date(obj.date) : obj.date;

    return Guardia.create({
      date,
      hours: obj.hours,
      description: obj.description,
    });
  }
}
