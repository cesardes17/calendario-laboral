/**
 * Domain layer exports
 */

export { Year } from './year';
export { Result } from './result';
export { EmploymentStatus, EmploymentStatusType } from './employment-status';
export { ContractStartDate } from './contract-start-date';
export { CycleOffset, CycleDayType } from './cycle-offset';
export { WorkCycle, CycleMode, type WeeklyMask, type CyclePart } from './work-cycle';
export { WorkingHours, WorkingHoursError, DEFAULT_WORKING_HOURS, WORKING_HOURS_CONSTRAINTS, type WorkingHoursConfig, type DayType } from './working-hours';
export { AnnualContractHours, AnnualContractHoursError, ANNUAL_CONTRACT_HOURS_CONSTRAINTS, COMMON_ANNUAL_HOURS_EXAMPLES, WarningType, type ValidationWarning } from './annual-contract-hours';
export { Holiday } from './holiday';
