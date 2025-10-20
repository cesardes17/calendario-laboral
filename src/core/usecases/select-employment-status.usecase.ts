/**
 * SelectEmploymentStatus Use Case
 *
 * Business logic for selecting employment status and associated data.
 * Implements HU-002 requirements:
 * - Select between "started this year" or "worked before"
 * - Validate contract start date if started this year
 * - Validate cycle offset if worked before
 */

import { Result } from '../domain/result';
import { EmploymentStatus, EmploymentStatusType } from '../domain/employment-status';
import { ContractStartDate } from '../domain/contract-start-date';
import { CycleOffset, CycleDayType } from '../domain/cycle-offset';
import { Year } from '../domain/year';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface CycleOffsetInput {
  partNumber: number;
  dayWithinPart: number;
  dayType: CycleDayType;
}

export class SelectEmploymentStatusUseCase {
  /**
   * Selects an employment status
   * @param type - The employment status type
   * @returns Result containing EmploymentStatus or error
   */
  public selectStatus(type: EmploymentStatusType): Result<EmploymentStatus> {
    return EmploymentStatus.create(type);
  }

  /**
   * Sets the contract start date (for STARTED_THIS_YEAR)
   * @param date - The contract start date
   * @param year - The year context
   * @returns Result containing ContractStartDate or error
   */
  public setContractStartDate(date: Date, year: Year): Result<ContractStartDate> {
    return ContractStartDate.create(date, year);
  }

  /**
   * Sets the cycle offset (for WORKED_BEFORE)
   * @param partNumber - The part number
   * @param dayWithinPart - The day within the part
   * @param dayType - The day type (WORK or REST)
   * @returns Result containing CycleOffset or error
   */
  public setCycleOffset(
    partNumber: number,
    dayWithinPart: number,
    dayType: CycleDayType
  ): Result<CycleOffset> {
    return CycleOffset.create(partNumber, dayWithinPart, dayType);
  }

  /**
   * Validates the complete employment status configuration
   * @param statusType - The employment status type
   * @param year - The year
   * @param contractDate - Optional contract start date
   * @param cycleOffset - Optional cycle offset
   * @returns Validation result with errors if any
   */
  public validateConfiguration(
    statusType: EmploymentStatusType,
    year: Year,
    contractDate?: Date,
    cycleOffset?: CycleOffsetInput
  ): ValidationResult {
    const errors: string[] = [];

    // Validate status type itself
    const statusResult = this.selectStatus(statusType);
    if (statusResult.isFailure()) {
      errors.push(statusResult.errorValue());
      return { isValid: false, errors };
    }

    const status = statusResult.getValue();

    // If started this year, require contract date
    if (status.isStartedThisYear()) {
      if (!contractDate) {
        errors.push('Debe proporcionar una fecha de inicio de contrato');
      } else {
        const dateResult = this.setContractStartDate(contractDate, year);
        if (dateResult.isFailure()) {
          errors.push(dateResult.errorValue());
        }
      }
    }

    // If worked before, require cycle offset
    if (status.isWorkedBefore()) {
      if (!cycleOffset) {
        errors.push('Debe proporcionar el offset del ciclo');
      } else {
        const offsetResult = this.setCycleOffset(
          cycleOffset.partNumber,
          cycleOffset.dayWithinPart,
          cycleOffset.dayType
        );
        if (offsetResult.isFailure()) {
          errors.push(offsetResult.errorValue());
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
