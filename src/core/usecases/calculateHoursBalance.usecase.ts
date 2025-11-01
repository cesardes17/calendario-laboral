/**
 * Calculate Hours Balance Use Case (HU-029 / SCRUM-41)
 *
 * Calculates the difference between worked hours and contract hours,
 * providing interpretation, messaging, and severity analysis.
 *
 * This use case helps users understand if they're owed hours or owe hours.
 */

import {
  SaldoHoras,
  BalanceType,
  BalanceState,
  createEmptyHoursBalance,
  DEFAULT_HOURS_PER_DAY,
  BALANCE_STATE_THRESHOLDS,
  Result,
} from '../domain';

/**
 * Input for calculating hours balance
 */
export interface CalculateHoursBalanceInput {
  /** Total hours worked (from calendar calculation) */
  horasTrabajadas: number;

  /** Total contract hours (annual contract) */
  horasConvenio: number;

  /** Optional custom hours per day for equivalence (default: 8) */
  horasPorDia?: number;
}

/**
 * Use Case: Calculate Hours Balance
 *
 * Analyzes the difference between worked hours and contract hours,
 * providing comprehensive interpretation and messaging.
 *
 * Business Rules (from HU-029):
 * - saldo = horasTrabajadas - horasConvenio
 * - Positive saldo: Company owes hours to worker
 * - Negative saldo: Worker owes hours to company
 * - Zero saldo: Perfectly balanced
 * - equivalenteDias = |saldo| / hours per day (default 8)
 * - porcentajeCumplimiento = (horasTrabajadas / horasConvenio) * 100
 * - Generate user-friendly messages
 * - Classify severity based on thresholds
 *
 * Estado Classification:
 * - critico: Employee owes > 100 hours
 * - advertencia: Employee owes 1-100 hours
 * - ok: Balanced or company owes 1-100 hours
 * - excelente: Company owes > 100 hours
 *
 * @example
 * ```typescript
 * const useCase = new CalculateHoursBalanceUseCase();
 * const result = useCase.execute({
 *   horasTrabajadas: 1800,
 *   horasConvenio: 1600
 * });
 *
 * if (result.isSuccess) {
 *   const balance = result.getValue();
 *   console.log(balance.mensaje); // "La empresa te debe 200.00 horas"
 *   console.log(balance.estado);  // "excelente"
 * }
 * ```
 */
export class CalculateHoursBalanceUseCase {
  /**
   * Executes the use case to calculate hours balance
   *
   * @param input - Contains worked and contract hours
   * @returns Result containing balance calculation or error message
   */
  public execute(input: CalculateHoursBalanceInput): Result<SaldoHoras> {
    try {
      const { horasTrabajadas, horasConvenio, horasPorDia = DEFAULT_HOURS_PER_DAY } = input;

      // Validate input
      if (horasTrabajadas < 0) {
        return Result.fail<SaldoHoras>(
          'Las horas trabajadas no pueden ser negativas'
        );
      }

      if (horasConvenio <= 0) {
        return Result.fail<SaldoHoras>(
          'Las horas de convenio deben ser mayores que cero'
        );
      }

      if (horasPorDia <= 0) {
        return Result.fail<SaldoHoras>(
          'Las horas por día deben ser mayores que cero'
        );
      }

      // Initialize balance
      const balance = createEmptyHoursBalance();

      // Set input values
      balance.horasTrabajadas = horasTrabajadas;
      balance.horasConvenio = horasConvenio;

      // Calculate balance (worked - contract)
      balance.saldo = horasTrabajadas - horasConvenio;
      balance.saldoAbsoluto = Math.abs(balance.saldo);

      // Determine balance type
      balance.tipo = this.determineBalanceType(balance.saldo);

      // Generate user-friendly message
      balance.mensaje = this.generateMessage(balance.saldo, balance.saldoAbsoluto);

      // Calculate equivalent in days
      balance.equivalenteDias = this.calculateEquivalentDays(
        balance.saldoAbsoluto,
        horasPorDia
      );

      // Calculate fulfillment percentage
      balance.porcentajeCumplimiento = this.calculateFulfillmentPercentage(
        horasTrabajadas,
        horasConvenio
      );

      // Determine state/severity
      balance.estado = this.determineState(balance.saldo);

      return Result.ok<SaldoHoras>(balance);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return Result.fail<SaldoHoras>(
        `Error al calcular saldo de horas: ${errorMessage}`
      );
    }
  }

  /**
   * Determines the type of balance based on the saldo value
   *
   * @param saldo - The balance (worked - contract)
   * @returns Balance type
   */
  private determineBalanceType(saldo: number): BalanceType {
    if (saldo > 0) {
      return 'empresa_debe';
    } else if (saldo < 0) {
      return 'empleado_debe';
    } else {
      return 'equilibrado';
    }
  }

  /**
   * Generates a user-friendly message describing the balance
   *
   * @param saldo - The balance (can be positive, negative, or zero)
   * @param saldoAbsoluto - Absolute value of the balance
   * @returns User-friendly message
   */
  private generateMessage(saldo: number, saldoAbsoluto: number): string {
    if (saldo > 0) {
      return `La empresa te debe ${this.formatHours(saldoAbsoluto)} horas`;
    } else if (saldo < 0) {
      return `Debes ${this.formatHours(saldoAbsoluto)} horas`;
    } else {
      return 'Horas equilibradas ✓';
    }
  }

  /**
   * Calculates the equivalent in days for a given number of hours
   *
   * @param hours - Number of hours
   * @param hoursPerDay - Hours per day (default 8)
   * @returns Equivalent in days, rounded to 2 decimals
   */
  private calculateEquivalentDays(hours: number, hoursPerDay: number): number {
    const days = hours / hoursPerDay;
    return Math.round(days * 100) / 100; // Round to 2 decimals
  }

  /**
   * Calculates the percentage of contract fulfillment
   *
   * @param worked - Hours worked
   * @param contract - Contract hours
   * @returns Percentage rounded to 2 decimals
   */
  private calculateFulfillmentPercentage(worked: number, contract: number): number {
    if (contract === 0) {
      return 0;
    }
    const percentage = (worked / contract) * 100;
    return Math.round(percentage * 100) / 100; // Round to 2 decimals
  }

  /**
   * Determines the state/severity of the balance
   *
   * Business Rules:
   * - critico: Employee owes > 100 hours (saldo < -100)
   * - advertencia: Employee owes 1-100 hours (saldo < 0 and >= -100)
   * - ok: Balanced or company owes 1-100 hours (saldo >= 0 and <= 100)
   * - excelente: Company owes > 100 hours (saldo > 100)
   *
   * @param saldo - The balance (worked - contract)
   * @returns Balance state
   */
  private determineState(saldo: number): BalanceState {
    if (saldo < -BALANCE_STATE_THRESHOLDS.CRITICAL) {
      return 'critico';
    } else if (saldo < 0) {
      return 'advertencia';
    } else if (saldo <= BALANCE_STATE_THRESHOLDS.EXCELLENT) {
      return 'ok';
    } else {
      return 'excelente';
    }
  }

  /**
   * Formats hours to 2 decimal places
   *
   * @param hours - Number of hours
   * @returns Formatted string with 2 decimals
   */
  private formatHours(hours: number): string {
    return hours.toFixed(2);
  }
}
