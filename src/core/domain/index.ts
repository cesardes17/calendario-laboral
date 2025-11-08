/**
 * Domain layer exports
 */

export { Year } from './year';
export { Result } from './result';
export { EmploymentStatus, EmploymentStatusType } from './employmentStatus';
export { ContractStartDate } from './contractStartDate';
export { CycleOffset, CycleDayType } from './cycleOffset';
export { WorkCycle, CycleMode, type WeeklyMask, type CyclePart } from './workCycle';
export { WorkingHours, WorkingHoursError, DEFAULT_WORKING_HOURS, WORKING_HOURS_CONSTRAINTS, type WorkingHoursConfig, type DayType } from './workingHours';
export { AnnualContractHours, AnnualContractHoursError, ANNUAL_CONTRACT_HOURS_CONSTRAINTS, COMMON_ANNUAL_HOURS_EXAMPLES, WarningType, type ValidationWarning } from './annualContractHours';
export { Holiday } from './holiday';
export { VacationPeriod } from './vacationPeriod';
export { Guardia } from './guardia';
export type { CalendarDay, EstadoDia, DayMetadata } from './calendarDay';
export { WEEKDAY_NAMES, MONTH_NAMES } from './calendarDay';
export type { ResultadoValidacion } from './calendarValidation';
export { createEmptyValidationResult, createValidationResultWithErrors, createValidationResultWithWarnings, mergeValidationResults } from './calendarValidation';
export type { EstadisticasDias } from './dayStatistics';
export { createEmptyStatistics } from './dayStatistics';
export type { DistribucionSemanal, DiasPorSemana, PorcentajesPorSemana, WeekdayName } from './weeklyDistribution';
export { createEmptyWeeklyDistribution, WEEKDAY_NAMES_MAP } from './weeklyDistribution';
export type { SaldoHoras, BalanceType, BalanceState } from './hoursBalance';
export { createEmptyHoursBalance, DEFAULT_HOURS_PER_DAY, BALANCE_STATE_THRESHOLDS } from './hoursBalance';
