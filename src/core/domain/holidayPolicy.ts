/**
 * HolidayPolicy Value Object
 *
 * Represents the worker's policy regarding holidays.
 * Determines whether holidays are respected (never worked) or can be worked
 * based on the work cycle.
 *
 * Business Rules:
 * - RESPETAR_FESTIVOS: All holidays are always marked as "Festivo" (not worked, 0 hours)
 *   regardless of what the work cycle indicates for that day
 * - TRABAJAR_FESTIVOS: Holidays follow work cycle - if cycle says "Trabajo" on a holiday,
 *   it becomes "FestivoTrabajado" (worked, holiday hours apply)
 */

import { Result } from './result';

/**
 * Enum for holiday policy types
 */
export enum HolidayPolicyType {
  /** Worker respects holidays - never works on holidays regardless of cycle */
  RESPETAR_FESTIVOS = 'RESPETAR_FESTIVOS',
  /** Worker can work holidays if cycle indicates work day (current behavior) */
  TRABAJAR_FESTIVOS = 'TRABAJAR_FESTIVOS',
}

/**
 * Default policy (maintains current application behavior)
 */
export const DEFAULT_HOLIDAY_POLICY = HolidayPolicyType.TRABAJAR_FESTIVOS;

export class HolidayPolicy {
  private readonly _type: HolidayPolicyType;

  private constructor(type: HolidayPolicyType) {
    this._type = type;
  }

  /**
   * Gets the holiday policy type
   */
  get type(): HolidayPolicyType {
    return this._type;
  }

  /**
   * Creates a new HolidayPolicy instance with validation
   * @param type - The holiday policy type
   * @returns Result containing HolidayPolicy instance or error message
   */
  public static create(type: HolidayPolicyType): Result<HolidayPolicy> {
    // Validate type is one of the valid enum values
    if (!Object.values(HolidayPolicyType).includes(type)) {
      return Result.fail<HolidayPolicy>(
        'El tipo de política de festivos debe ser válido (RESPETAR_FESTIVOS o TRABAJAR_FESTIVOS)'
      );
    }

    return Result.ok<HolidayPolicy>(new HolidayPolicy(type));
  }

  /**
   * Creates a HolidayPolicy with default value (TRABAJAR_FESTIVOS)
   * @returns HolidayPolicy instance with default policy
   */
  public static default(): HolidayPolicy {
    return new HolidayPolicy(DEFAULT_HOLIDAY_POLICY);
  }

  /**
   * Checks if the policy respects holidays (never works on holidays)
   */
  public respectsHolidays(): boolean {
    return this._type === HolidayPolicyType.RESPETAR_FESTIVOS;
  }

  /**
   * Checks if the policy allows working holidays based on cycle
   */
  public canWorkHolidays(): boolean {
    return this._type === HolidayPolicyType.TRABAJAR_FESTIVOS;
  }

  /**
   * Gets the display text for the policy
   */
  public getDisplayText(): string {
    switch (this._type) {
      case HolidayPolicyType.RESPETAR_FESTIVOS:
        return 'Respeto festivos (no trabajo en festivos)';
      case HolidayPolicyType.TRABAJAR_FESTIVOS:
        return 'Trabajo festivos según mi ciclo';
    }
  }

  /**
   * Gets the help message for the policy
   */
  public getHelpMessage(): string {
    switch (this._type) {
      case HolidayPolicyType.RESPETAR_FESTIVOS:
        return 'Los festivos nunca se trabajarán, independientemente de tu ciclo laboral';
      case HolidayPolicyType.TRABAJAR_FESTIVOS:
        return 'Los festivos se trabajarán solo si tu ciclo indica que es un día de trabajo';
    }
  }

  /**
   * Compares this policy with another for equality
   * @param other - Another HolidayPolicy instance
   * @returns true if policies are equal
   */
  public equals(other: HolidayPolicy): boolean {
    return this._type === other._type;
  }

  /**
   * Checks if this is the default policy
   */
  public isDefault(): boolean {
    return this._type === DEFAULT_HOLIDAY_POLICY;
  }

  /**
   * Returns string representation of the policy
   */
  public toString(): string {
    return this._type;
  }

  /**
   * Serialization for storage
   */
  public toJSON(): string {
    return this._type;
  }

  /**
   * Deserialization from storage
   */
  public static fromJSON(json: string): Result<HolidayPolicy> {
    return HolidayPolicy.create(json as HolidayPolicyType);
  }
}
