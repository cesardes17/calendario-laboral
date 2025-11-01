/**
 * Calendar Validation Domain Types
 *
 * Types and interfaces for validating generated calendars to ensure
 * data coherence and correctness (HU-026 / SCRUM-38).
 */

/**
 * Result of calendar validation
 *
 * Contains validation status, errors (critical issues that prevent
 * calendar usage), and warnings (non-critical issues that should be
 * reviewed but don't prevent calendar usage).
 *
 * @example
 * ```typescript
 * const validationResult: ResultadoValidacion = {
 *   valido: false,
 *   errores: ['Hay 3 días con estado null'],
 *   advertencias: ['2 festivos trabajados con 0 horas']
 * };
 * ```
 */
export interface ResultadoValidacion {
  /** Whether the calendar passed all critical validations */
  valido: boolean;

  /** List of critical errors that prevent calendar usage */
  errores: string[];

  /** List of non-critical warnings that should be reviewed */
  advertencias: string[];
}

/**
 * Creates an empty validation result with no errors or warnings
 */
export function createEmptyValidationResult(): ResultadoValidacion {
  return {
    valido: true,
    errores: [],
    advertencias: [],
  };
}

/**
 * Creates a validation result with errors
 */
export function createValidationResultWithErrors(errores: string[]): ResultadoValidacion {
  return {
    valido: false,
    errores,
    advertencias: [],
  };
}

/**
 * Creates a validation result with warnings but no errors
 */
export function createValidationResultWithWarnings(advertencias: string[]): ResultadoValidacion {
  return {
    valido: true,
    errores: [],
    advertencias,
  };
}

/**
 * Merges multiple validation results into one
 * The merged result is invalid if any input result is invalid
 */
export function mergeValidationResults(results: ResultadoValidacion[]): ResultadoValidacion {
  const allErrors = results.flatMap(r => r.errores);
  const allWarnings = results.flatMap(r => r.advertencias);

  return {
    valido: allErrors.length === 0,
    errores: allErrors,
    advertencias: allWarnings,
  };
}
