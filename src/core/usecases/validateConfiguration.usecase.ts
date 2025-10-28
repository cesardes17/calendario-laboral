import { Year } from '../domain/year';
import { WorkCycle } from '../domain/workCycle';
import { EmploymentStatus } from '../domain/employmentStatus';
import { ContractStartDate } from '../domain/contractStartDate';
import { CycleOffset } from '../domain/cycleOffset';
import { WorkingHours } from '../domain/workingHours';
import { AnnualContractHours } from '../domain/annualContractHours';
import { Holiday } from '../domain/holiday';
import { VacationPeriod } from '../domain/vacationPeriod';

/**
 * Use Case: Validate Complete Configuration
 *
 * Validates that all required configuration is complete and correct
 * before generating the calendar.
 *
 * Business Rules (HU-017):
 * - All mandatory fields must be filled
 * - Optional fields generate warnings but don't block generation
 * - Clear error messages for each missing/invalid field
 */

/**
 * Validation status for a specific field
 */
export enum FieldStatus {
  COMPLETE = 'COMPLETE',
  INCOMPLETE = 'INCOMPLETE',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

/**
 * Validation result for a specific field/section
 */
export interface FieldValidation {
  field: string;
  status: FieldStatus;
  message?: string;
  navigateTo?: string; // Section ID to navigate to
}

/**
 * Overall configuration validation result
 */
export interface ConfigurationValidation {
  isValid: boolean;
  isComplete: boolean;
  completedSections: number;
  totalSections: number;
  fields: FieldValidation[];
  canGenerate: boolean;
  warnings: string[];
}

/**
 * Configuration input for validation
 */
export interface ConfigurationInput {
  year: Year | null;
  workCycle: WorkCycle | null;
  employmentStatus: EmploymentStatus | null;
  contractStartDate: ContractStartDate | null;
  cycleOffset: CycleOffset | null;
  workingHours: WorkingHours | null;
  annualContractHours: AnnualContractHours | null;
  holidays: Holiday[];
  vacations: VacationPeriod[];
}

/**
 * Validates the complete configuration
 */
export function validateCompleteConfiguration(
  config: ConfigurationInput
): ConfigurationValidation {
  const fields: FieldValidation[] = [];
  const warnings: string[] = [];
  let completedSections = 0;
  const totalSections = 7; // Year, WorkCycle, EmploymentStatus, WorkingHours, AnnualContractHours, Holidays, Vacations

  // 1. Validate Year (mandatory)
  if (!config.year) {
    fields.push({
      field: 'year',
      status: FieldStatus.INCOMPLETE,
      message: 'Debe seleccionar un año',
      navigateTo: 'year-section',
    });
  } else {
    fields.push({
      field: 'year',
      status: FieldStatus.COMPLETE,
      message: `Año ${config.year.value} seleccionado`,
    });
    completedSections++;
  }

  // 2. Validate Work Cycle (mandatory)
  if (!config.workCycle) {
    fields.push({
      field: 'workCycle',
      status: FieldStatus.INCOMPLETE,
      message: 'Debe configurar su ciclo de trabajo',
      navigateTo: 'workCyclesection',
    });
  } else {
    fields.push({
      field: 'workCycle',
      status: FieldStatus.COMPLETE,
      message: config.workCycle.getDisplayText(),
    });
    completedSections++;
  }

  // 3. Validate Employment Status (mandatory)
  if (!config.employmentStatus) {
    fields.push({
      field: 'employmentStatus',
      status: FieldStatus.INCOMPLETE,
      message: 'Debe indicar su situación laboral',
      navigateTo: 'employmentStatussection',
    });
  } else {
    // Check if additional data is needed
    if (config.employmentStatus.isStartedThisYear()) {
      if (!config.contractStartDate) {
        fields.push({
          field: 'contractStartDate',
          status: FieldStatus.INCOMPLETE,
          message: 'Debe indicar la fecha de inicio de contrato',
          navigateTo: 'employmentStatussection',
        });
      } else {
        fields.push({
          field: 'employmentStatus',
          status: FieldStatus.COMPLETE,
          message: `Empezó el ${config.contractStartDate.toLocaleDateString()}`,
        });
        completedSections++;
      }
    } else {
      // Worked before - needs cycle offset
      if (!config.cycleOffset) {
        fields.push({
          field: 'cycleOffset',
          status: FieldStatus.INCOMPLETE,
          message: 'Debe indicar el offset del ciclo',
          navigateTo: 'employmentStatussection',
        });
      } else {
        fields.push({
          field: 'employmentStatus',
          status: FieldStatus.COMPLETE,
          message: 'Ya trabajaba antes (offset configurado)',
        });
        completedSections++;
      }
    }
  }

  // 4. Validate Working Hours (mandatory)
  if (!config.workingHours) {
    fields.push({
      field: 'workingHours',
      status: FieldStatus.INCOMPLETE,
      message: 'Debe configurar las horas de trabajo',
      navigateTo: 'workingHourssection',
    });
  } else {
    const hours = config.workingHours.getAll();
    fields.push({
      field: 'workingHours',
      status: FieldStatus.COMPLETE,
      message: `L-V: ${hours.weekday}h, Sáb: ${hours.saturday}h, Dom: ${hours.sunday}h, Festivo: ${hours.holiday}h`,
    });
    completedSections++;
  }

  // 5. Validate Annual Contract Hours (mandatory)
  if (!config.annualContractHours) {
    fields.push({
      field: 'annualContractHours',
      status: FieldStatus.INCOMPLETE,
      message: 'Debe indicar las horas anuales de convenio',
      navigateTo: 'annualContractHourssection',
    });
  } else {
    fields.push({
      field: 'annualContractHours',
      status: FieldStatus.COMPLETE,
      message: `${config.annualContractHours.getValue()} horas/año`,
    });
    completedSections++;
  }

  // 6. Validate Holidays (optional - warning if empty)
  if (config.holidays.length === 0) {
    fields.push({
      field: 'holidays',
      status: FieldStatus.WARNING,
      message: 'No hay festivos configurados',
      navigateTo: 'holidays-section',
    });
    warnings.push('No has añadido festivos. El calendario se generará sin festivos oficiales.');
  } else {
    fields.push({
      field: 'holidays',
      status: FieldStatus.COMPLETE,
      message: `${config.holidays.length} ${config.holidays.length === 1 ? 'festivo' : 'festivos'} configurados`,
    });
    completedSections++;
  }

  // 7. Validate Vacations (optional - warning if empty)
  if (config.vacations.length === 0) {
    fields.push({
      field: 'vacations',
      status: FieldStatus.WARNING,
      message: 'No hay vacaciones configuradas',
      navigateTo: 'vacations-section',
    });
    warnings.push('No has añadido períodos de vacaciones. El calendario se generará sin días de vacaciones.');
  } else {
    fields.push({
      field: 'vacations',
      status: FieldStatus.COMPLETE,
      message: `${config.vacations.length} ${config.vacations.length === 1 ? 'período' : 'períodos'} de vacaciones`,
    });
    completedSections++;
  }

  // Determine overall status
  const hasErrors = fields.some((f) => f.status === FieldStatus.INCOMPLETE || f.status === FieldStatus.ERROR);

  // Can generate if all mandatory fields are complete (even with warnings)
  const canGenerate = !hasErrors;

  // Is complete if all sections are done (including optional)
  const isComplete = completedSections === totalSections;

  return {
    isValid: !hasErrors,
    isComplete,
    completedSections,
    totalSections,
    fields,
    canGenerate,
    warnings,
  };
}

/**
 * Get missing fields from validation
 */
export function getMissingFields(validation: ConfigurationValidation): FieldValidation[] {
  return validation.fields.filter(
    (f) => f.status === FieldStatus.INCOMPLETE || f.status === FieldStatus.ERROR
  );
}

/**
 * Get warning fields from validation
 */
export function getWarningFields(validation: ConfigurationValidation): FieldValidation[] {
  return validation.fields.filter((f) => f.status === FieldStatus.WARNING);
}
