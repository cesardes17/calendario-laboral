/**
 * Tests for EmploymentStatus Value Object
 *
 * Following TDD approach - RED phase
 * Tests business logic for employment status selection
 */

import { EmploymentStatus, EmploymentStatusType } from '../employmentStatus';

describe('EmploymentStatus Value Object', () => {
  describe('Creation and validation', () => {
    it('should create an EmploymentStatus with STARTED_THIS_YEAR type', () => {
      const status = EmploymentStatus.create(EmploymentStatusType.STARTED_THIS_YEAR);

      expect(status.isSuccess()).toBe(true);
      expect(status.getValue().type).toBe(EmploymentStatusType.STARTED_THIS_YEAR);
    });

    it('should create an EmploymentStatus with WORKED_BEFORE type', () => {
      const status = EmploymentStatus.create(EmploymentStatusType.WORKED_BEFORE);

      expect(status.isSuccess()).toBe(true);
      expect(status.getValue().type).toBe(EmploymentStatusType.WORKED_BEFORE);
    });

    it('should fail when type is invalid', () => {
      const status = EmploymentStatus.create('INVALID' as unknown as EmploymentStatusType);

      expect(status.isFailure()).toBe(true);
      expect(status.errorValue()).toContain('válido');
    });
  });

  describe('Type checking methods', () => {
    it('should return true for isStartedThisYear when type is STARTED_THIS_YEAR', () => {
      const status = EmploymentStatus.create(EmploymentStatusType.STARTED_THIS_YEAR);

      expect(status.getValue().isStartedThisYear()).toBe(true);
      expect(status.getValue().isWorkedBefore()).toBe(false);
    });

    it('should return true for isWorkedBefore when type is WORKED_BEFORE', () => {
      const status = EmploymentStatus.create(EmploymentStatusType.WORKED_BEFORE);

      expect(status.getValue().isWorkedBefore()).toBe(true);
      expect(status.getValue().isStartedThisYear()).toBe(false);
    });
  });

  describe('Display text', () => {
    it('should return correct display text for STARTED_THIS_YEAR', () => {
      const status = EmploymentStatus.create(EmploymentStatusType.STARTED_THIS_YEAR);

      expect(status.getValue().getDisplayText()).toBe('Sí, empecé este año');
    });

    it('should return correct display text for WORKED_BEFORE', () => {
      const status = EmploymentStatus.create(EmploymentStatusType.WORKED_BEFORE);

      expect(status.getValue().getDisplayText()).toBe('No, ya trabajaba antes');
    });
  });

  describe('Help message', () => {
    it('should return correct help message for STARTED_THIS_YEAR', () => {
      const status = EmploymentStatus.create(EmploymentStatusType.STARTED_THIS_YEAR);
      const helpMessage = status.getValue().getHelpMessage();

      expect(helpMessage).toContain('fecha exacta');
      expect(helpMessage).toContain('No contratado');
    });

    it('should return correct help message for WORKED_BEFORE', () => {
      const status = EmploymentStatus.create(EmploymentStatusType.WORKED_BEFORE);
      const helpMessage = status.getValue().getHelpMessage();

      expect(helpMessage).toContain('punto de tu ciclo');
      expect(helpMessage).toContain('1 de enero');
    });
  });

  describe('Equality comparison', () => {
    it('should return true when comparing equal employment statuses', () => {
      const status1 = EmploymentStatus.create(EmploymentStatusType.STARTED_THIS_YEAR);
      const status2 = EmploymentStatus.create(EmploymentStatusType.STARTED_THIS_YEAR);

      expect(status1.getValue().equals(status2.getValue())).toBe(true);
    });

    it('should return false when comparing different employment statuses', () => {
      const status1 = EmploymentStatus.create(EmploymentStatusType.STARTED_THIS_YEAR);
      const status2 = EmploymentStatus.create(EmploymentStatusType.WORKED_BEFORE);

      expect(status1.getValue().equals(status2.getValue())).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const status = EmploymentStatus.create(EmploymentStatusType.STARTED_THIS_YEAR);

      expect(status.getValue().toString()).toBe('STARTED_THIS_YEAR');
    });
  });
});
