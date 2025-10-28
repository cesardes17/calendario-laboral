/**
 * Tests for SelectEmploymentStatus Use Case
 *
 * Following TDD approach - RED phase
 */

import { SelectEmploymentStatusUseCase } from '../selectEmploymentStatus.usecase';
import { EmploymentStatusType } from '../../domain/employmentStatus';
import { CycleDayType } from '../../domain/cycleOffset';
import { Year } from '../../domain/year';

describe('SelectEmploymentStatusUseCase', () => {
  let useCase: SelectEmploymentStatusUseCase;
  let testYear: ReturnType<typeof Year.create>;

  beforeEach(() => {
    useCase = new SelectEmploymentStatusUseCase();
    testYear = Year.create(2025);
  });

  describe('selectStatus', () => {
    it('should successfully select STARTED_THIS_YEAR status', () => {
      const result = useCase.selectStatus(EmploymentStatusType.STARTED_THIS_YEAR);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().isStartedThisYear()).toBe(true);
    });

    it('should successfully select WORKED_BEFORE status', () => {
      const result = useCase.selectStatus(EmploymentStatusType.WORKED_BEFORE);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().isWorkedBefore()).toBe(true);
    });

    it('should fail with invalid status type', () => {
      const result = useCase.selectStatus('INVALID' as unknown as EmploymentStatusType);

      expect(result.isFailure()).toBe(true);
    });
  });

  describe('setContractStartDate', () => {
    it('should set valid contract start date within year', () => {
      const date = new Date('2025-06-15');
      const result = useCase.setContractStartDate(date, testYear.getValue());

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().value).toEqual(date);
    });

    it('should fail when date is outside the year', () => {
      const date = new Date('2024-12-31');
      const result = useCase.setContractStartDate(date, testYear.getValue());

      expect(result.isFailure()).toBe(true);
      expect(result.errorValue()).toContain('dentro del año');
    });

    it('should fail when date is invalid', () => {
      const date = new Date('invalid');
      const result = useCase.setContractStartDate(date, testYear.getValue());

      expect(result.isFailure()).toBe(true);
    });
  });

  describe('setCycleOffset', () => {
    it('should set valid cycle offset', () => {
      const result = useCase.setCycleOffset(2, 3, CycleDayType.WORK);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().partNumber).toBe(2);
      expect(result.getValue().dayWithinPart).toBe(3);
    });

    it('should fail when part number is invalid', () => {
      const result = useCase.setCycleOffset(0, 3, CycleDayType.WORK);

      expect(result.isFailure()).toBe(true);
    });

    it('should fail when day within part is invalid', () => {
      const result = useCase.setCycleOffset(2, 0, CycleDayType.WORK);

      expect(result.isFailure()).toBe(true);
    });
  });

  describe('validateConfiguration', () => {
    it('should validate complete configuration for STARTED_THIS_YEAR', () => {
      const status = EmploymentStatusType.STARTED_THIS_YEAR;
      const date = new Date('2025-06-15');

      const validation = useCase.validateConfiguration(
        status,
        testYear.getValue(),
        date,
        undefined
      );

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should validate complete configuration for WORKED_BEFORE', () => {
      const status = EmploymentStatusType.WORKED_BEFORE;
      const offset = { partNumber: 2, dayWithinPart: 3, dayType: CycleDayType.WORK };

      const validation = useCase.validateConfiguration(
        status,
        testYear.getValue(),
        undefined,
        offset
      );

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should fail when STARTED_THIS_YEAR but no date provided', () => {
      const status = EmploymentStatusType.STARTED_THIS_YEAR;

      const validation = useCase.validateConfiguration(
        status,
        testYear.getValue(),
        undefined,
        undefined
      );

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Debe proporcionar una fecha de inicio de contrato');
    });

    it('should fail when WORKED_BEFORE but no offset provided', () => {
      const status = EmploymentStatusType.WORKED_BEFORE;

      const validation = useCase.validateConfiguration(
        status,
        testYear.getValue(),
        undefined,
        undefined
      );

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Debe proporcionar el offset del ciclo');
    });

    it('should fail when date is invalid for STARTED_THIS_YEAR', () => {
      const status = EmploymentStatusType.STARTED_THIS_YEAR;
      const date = new Date('2024-01-01'); // Wrong year

      const validation = useCase.validateConfiguration(
        status,
        testYear.getValue(),
        date,
        undefined
      );

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
});
