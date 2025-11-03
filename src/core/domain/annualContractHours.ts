/**
 * @file annualContractHours.ts
 * @description Value Object que representa las horas anuales según convenio laboral
 */

/**
 * Constantes para validación y valores por defecto
 */
export const ANNUAL_CONTRACT_HOURS_CONSTRAINTS = {
  MIN: 1,
  MAX: 3000,
  WARNING_LOW: 1000,
  WARNING_HIGH: 2500,
  DEFAULT: 1762, // Jornada típica completa en España
  WEEKS_PER_YEAR: 52,
} as const;

/**
 * Ejemplos comunes de horas anuales
 */
export const COMMON_ANNUAL_HOURS_EXAMPLES = [
  { weeklyHours: 37.5, annualHours: 1950, description: "Jornada reducida" },
  {
    weeklyHours: 40,
    annualHours: 2080,
    description: "Jornada completa estándar",
  },
  { weeklyHours: 35, annualHours: 1820, description: "Jornada europea típica" },
] as const;

/**
 * Errores relacionados con horas de convenio
 */
export class AnnualContractHoursError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnnualContractHoursError";
  }
}

/**
 * Tipo de advertencia
 */
export enum WarningType {
  NONE = "none",
  UNUSUALLY_LOW = "unusually_low",
  UNUSUALLY_HIGH = "unusually_high",
}

/**
 * Resultado de validación con advertencia
 */
export interface ValidationWarning {
  type: WarningType;
  message?: string;
}

/**
 * Value Object: AnnualContractHours
 * Representa las horas anuales establecidas en el convenio laboral
 *
 * Invariantes:
 * - Las horas deben ser mayor que 0
 * - Las horas deben estar en un rango razonable (1-3000)
 * - Se pueden emitir advertencias para valores inusuales
 */
export class AnnualContractHours {
  private constructor(private readonly hours: number) {
    this.validate(hours);
  }

  /**
   * Crea una instancia de AnnualContractHours
   */
  static create(hours: number): AnnualContractHours {
    return new AnnualContractHours(hours);
  }

  /**
   * Crea una instancia con el valor por defecto
   */
  static default(): AnnualContractHours {
    return new AnnualContractHours(ANNUAL_CONTRACT_HOURS_CONSTRAINTS.DEFAULT);
  }

  /**
   * Calcula horas anuales desde horas semanales
   */
  static fromWeeklyHours(weeklyHours: number): AnnualContractHours {
    if (weeklyHours <= 0) {
      throw new AnnualContractHoursError(
        "Las horas semanales deben ser mayores que 0"
      );
    }

    if (weeklyHours > 168) {
      throw new AnnualContractHoursError(
        "Las horas semanales no pueden superar 168 (horas en una semana)"
      );
    }

    const annualHours = Math.round(
      weeklyHours * ANNUAL_CONTRACT_HOURS_CONSTRAINTS.WEEKS_PER_YEAR
    );

    return new AnnualContractHours(annualHours);
  }

  /**
   * Valida las horas
   */
  private validate(hours: number): void {
    if (!Number.isFinite(hours)) {
      throw new AnnualContractHoursError(
        "Las horas deben ser un número válido"
      );
    }

    if (hours <= 0) {
      throw new AnnualContractHoursError(
        "Las horas anuales deben ser mayores que 0"
      );
    }

    if (hours > ANNUAL_CONTRACT_HOURS_CONSTRAINTS.MAX) {
      throw new AnnualContractHoursError(
        `Las horas anuales no pueden superar ${ANNUAL_CONTRACT_HOURS_CONSTRAINTS.MAX}`
      );
    }
  }

  /**
   * Obtiene el valor de las horas
   */
  getValue(): number {
    return this.hours;
  }

  /**
   * Verifica si el valor está en el rango normal (sin advertencias)
   */
  isInNormalRange(): boolean {
    return (
      this.hours >= ANNUAL_CONTRACT_HOURS_CONSTRAINTS.WARNING_LOW &&
      this.hours <= ANNUAL_CONTRACT_HOURS_CONSTRAINTS.WARNING_HIGH
    );
  }

  /**
   * Obtiene una advertencia si el valor es inusual
   */
  getWarning(): ValidationWarning {
    if (this.hours < ANNUAL_CONTRACT_HOURS_CONSTRAINTS.WARNING_LOW) {
      return {
        type: WarningType.UNUSUALLY_LOW,
        message: `El valor es inusualmente bajo. Las jornadas completas suelen estar entre ${ANNUAL_CONTRACT_HOURS_CONSTRAINTS.WARNING_LOW}-${ANNUAL_CONTRACT_HOURS_CONSTRAINTS.WARNING_HIGH} horas/año`,
      };
    }

    if (this.hours > ANNUAL_CONTRACT_HOURS_CONSTRAINTS.WARNING_HIGH) {
      return {
        type: WarningType.UNUSUALLY_HIGH,
        message: `El valor es inusualmente alto. Las jornadas completas suelen estar entre ${ANNUAL_CONTRACT_HOURS_CONSTRAINTS.WARNING_LOW}-${ANNUAL_CONTRACT_HOURS_CONSTRAINTS.WARNING_HIGH} horas/año`,
      };
    }

    return { type: WarningType.NONE };
  }

  /**
   * Calcula las horas semanales equivalentes
   */
  toWeeklyHours(): number {
    return (
      Math.round(
        (this.hours / ANNUAL_CONTRACT_HOURS_CONSTRAINTS.WEEKS_PER_YEAR) * 100
      ) / 100
    );
  }

  /**
   * Verifica si es el valor por defecto
   */
  isDefault(): boolean {
    return this.hours === ANNUAL_CONTRACT_HOURS_CONSTRAINTS.DEFAULT;
  }

  /**
   * Igualdad por valor
   */
  equals(other: AnnualContractHours): boolean {
    return this.hours === other.hours;
  }

  /**
   * Serialización para almacenamiento
   */
  toJSON(): number {
    return this.hours;
  }

  /**
   * Deserialización desde almacenamiento
   */
  static fromJSON(json: number): AnnualContractHours {
    return AnnualContractHours.create(json);
  }

  /**
   * Representación legible
   */
  toString(): string {
    return `${this.hours} horas/año`;
  }

  /**
   * Representación con contexto
   */
  toDetailedString(): string {
    const weeklyHours = this.toWeeklyHours();
    return `${this.hours} horas/año (≈ ${weeklyHours} h/semana)`;
  }
}
