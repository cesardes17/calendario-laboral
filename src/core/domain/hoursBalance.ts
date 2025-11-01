/**
 * Hours Balance Domain Types
 *
 * Types and interfaces for calculating and representing the balance
 * between worked hours and contract hours (HU-029 / SCRUM-41).
 */

/**
 * Type of hours balance
 */
export type BalanceType = 'empresa_debe' | 'empleado_debe' | 'equilibrado';

/**
 * State/severity of the balance
 */
export type BalanceState = 'critico' | 'advertencia' | 'ok' | 'excelente';

/**
 * Balance between worked hours and contract hours
 *
 * Contains the calculation of the difference between actual worked hours
 * and the contract hours, with interpretation and user-friendly messaging.
 *
 * Business Rules:
 * - saldo = horasTrabajadas - horasConvenio
 * - Positive saldo: Company owes hours to worker (empresa_debe)
 * - Negative saldo: Worker owes hours (empleado_debe)
 * - Zero saldo: Balanced hours (equilibrado)
 * - equivalenteDias = saldoAbsoluto / average daily hours (8)
 * - porcentajeCumplimiento = (horasTrabajadas / horasConvenio) * 100
 * - Estado severity based on saldo thresholds
 *
 * Estado Thresholds:
 * - critico: Employee owes > 100 hours
 * - advertencia: Employee owes 1-100 hours
 * - ok: Balanced or company owes 1-100 hours
 * - excelente: Company owes > 100 hours
 *
 * @example
 * ```typescript
 * const balance: SaldoHoras = {
 *   horasTrabajadas: 1800,
 *   horasConvenio: 1600,
 *   saldo: 200,
 *   saldoAbsoluto: 200,
 *   tipo: 'empresa_debe',
 *   mensaje: 'La empresa te debe 200.00 horas',
 *   equivalenteDias: 25,
 *   porcentajeCumplimiento: 112.5,
 *   estado: 'excelente'
 * };
 * ```
 */
export interface SaldoHoras {
  /** Total hours actually worked (from calendar) */
  horasTrabajadas: number;

  /** Total contract hours (annual contract) */
  horasConvenio: number;

  /** Balance: worked - contract (can be positive, negative, or zero) */
  saldo: number;

  /** Absolute value of the balance */
  saldoAbsoluto: number;

  /** Type of balance (who owes whom) */
  tipo: BalanceType;

  /** User-friendly message describing the balance */
  mensaje: string;

  /** Balance expressed in equivalent days (at 8 hours/day) */
  equivalenteDias: number;

  /** Percentage of contract fulfillment (worked/contract * 100) */
  porcentajeCumplimiento: number;

  /** Severity state of the balance */
  estado: BalanceState;
}

/**
 * Creates an empty hours balance with zero values
 */
export function createEmptyHoursBalance(): SaldoHoras {
  return {
    horasTrabajadas: 0,
    horasConvenio: 0,
    saldo: 0,
    saldoAbsoluto: 0,
    tipo: 'equilibrado',
    mensaje: '',
    equivalenteDias: 0,
    porcentajeCumplimiento: 0,
    estado: 'ok',
  };
}

/**
 * Default hours per day for equivalence calculation
 */
export const DEFAULT_HOURS_PER_DAY = 8;

/**
 * Thresholds for balance state classification
 */
export const BALANCE_STATE_THRESHOLDS = {
  CRITICAL: 100,      // Employee owes > 100 hours
  WARNING: 1,         // Employee owes 1-100 hours
  EXCELLENT: 100,     // Company owes > 100 hours
} as const;
