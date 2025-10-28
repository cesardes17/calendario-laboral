/**
 * @file configureAnnualContractHours.usecase.ts
 * @description Caso de uso para configurar horas anuales de convenio
 */

import { AnnualContractHours } from '../domain/annualContractHours';
import { Result } from '../domain/result';

/**
 * Entrada del caso de uso
 */
export interface ConfigureAnnualContractHoursInput {
  /**
   * Horas anuales según convenio
   */
  annualHours?: number;

  /**
   * O horas semanales para calcular las anuales
   */
  weeklyHours?: number;
}

/**
 * Caso de Uso: ConfigureAnnualContractHours
 *
 * Permite al usuario configurar las horas anuales establecidas en su convenio laboral.
 *
 * Reglas de negocio:
 * - Las horas deben ser mayores que 0
 * - Rango razonable: 1-3000 horas anuales
 * - Se pueden calcular desde horas semanales
 * - Se emiten advertencias para valores inusuales
 */
export class ConfigureAnnualContractHoursUseCase {
  /**
   * Configura las horas anuales directamente
   */
  execute(annualHours: number): Result<AnnualContractHours> {
    try {
      const contractHours = AnnualContractHours.create(annualHours);
      return Result.ok(contractHours);
    } catch (error) {
      if (error instanceof Error) {
        return Result.fail(error.message);
      }
      return Result.fail('Error desconocido al configurar las horas de convenio');
    }
  }

  /**
   * Configura las horas anuales desde horas semanales
   */
  executeFromWeekly(weeklyHours: number): Result<AnnualContractHours> {
    try {
      const contractHours = AnnualContractHours.fromWeeklyHours(weeklyHours);
      return Result.ok(contractHours);
    } catch (error) {
      if (error instanceof Error) {
        return Result.fail(error.message);
      }
      return Result.fail('Error desconocido al calcular las horas de convenio');
    }
  }

  /**
   * Resetea a valores por defecto
   */
  reset(): Result<AnnualContractHours> {
    return Result.ok(AnnualContractHours.default());
  }

  /**
   * Carga desde una configuración guardada
   */
  loadFromConfig(annualHours: number): Result<AnnualContractHours> {
    return this.execute(annualHours);
  }

  /**
   * Valida las horas sin crear la instancia
   */
  validate(annualHours: number): {
    isValid: boolean;
    error?: string;
  } {
    try {
      AnnualContractHours.create(annualHours);
      return { isValid: true };
    } catch (error) {
      if (error instanceof Error) {
        return { isValid: false, error: error.message };
      }
      return { isValid: false, error: 'Error desconocido' };
    }
  }

  /**
   * Valida horas semanales sin crear la instancia
   */
  validateWeekly(weeklyHours: number): {
    isValid: boolean;
    error?: string;
  } {
    try {
      AnnualContractHours.fromWeeklyHours(weeklyHours);
      return { isValid: true };
    } catch (error) {
      if (error instanceof Error) {
        return { isValid: false, error: error.message };
      }
      return { isValid: false, error: 'Error desconocido' };
    }
  }
}
