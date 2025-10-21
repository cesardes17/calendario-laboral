/**
 * @file configure-working-hours.usecase.ts
 * @description Caso de uso para configurar horas de trabajo por tipo de día
 */

import { WorkingHours, type DayType, type WorkingHoursConfig } from '../domain/working-hours';
import { Result } from '../domain/result';

/**
 * Entrada del caso de uso
 */
export interface ConfigureWorkingHoursInput {
  weekday?: number;
  saturday?: number;
  sunday?: number;
  holiday?: number;
}

/**
 * Caso de Uso: ConfigureWorkingHours
 *
 * Permite al usuario configurar las horas de trabajo para cada tipo de día.
 *
 * Reglas de negocio:
 * - Las horas deben estar entre 0 y 24
 * - Se normalizan automáticamente a 2 decimales
 * - Los valores no especificados se mantienen como estaban o usan defaults
 */
export class ConfigureWorkingHoursUseCase {
  /**
   * Ejecuta el caso de uso con una instancia existente
   */
  execute(
    input: ConfigureWorkingHoursInput,
    current?: WorkingHours
  ): Result<WorkingHours> {
    try {
      // Si no hay instancia actual, crear una nueva con defaults
      const workingHours = current
        ? current.updateMultiple(input)
        : WorkingHours.create(input);

      return Result.ok(workingHours);
    } catch (error) {
      if (error instanceof Error) {
        return Result.fail(error.message);
      }
      return Result.fail('Error desconocido al configurar las horas de trabajo');
    }
  }

  /**
   * Actualiza solo un tipo de día
   */
  updateSingleDayType(
    dayType: DayType,
    hours: number,
    current?: WorkingHours
  ): Result<WorkingHours> {
    try {
      const workingHours = current
        ? current.updateHours(dayType, hours)
        : WorkingHours.create({ [dayType]: hours });

      return Result.ok(workingHours);
    } catch (error) {
      if (error instanceof Error) {
        return Result.fail(error.message);
      }
      return Result.fail('Error desconocido al actualizar las horas');
    }
  }

  /**
   * Resetea a valores por defecto
   */
  reset(): Result<WorkingHours> {
    return Result.ok(WorkingHours.default());
  }

  /**
   * Carga desde una configuración guardada
   */
  loadFromConfig(
    config: WorkingHoursConfig
  ): Result<WorkingHours> {
    try {
      const workingHours = WorkingHours.fromJSON(config);

      return Result.ok(workingHours);
    } catch (error) {
      if (error instanceof Error) {
        return Result.fail(error.message);
      }
      return Result.fail('Error al cargar la configuración de horas');
    }
  }
}
