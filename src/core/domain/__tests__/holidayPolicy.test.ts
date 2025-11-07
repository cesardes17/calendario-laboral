/**
 * Tests for HolidayPolicy Value Object
 *
 * Tests business logic for holiday work policy selection
 */

import { HolidayPolicy, HolidayPolicyType, DEFAULT_HOLIDAY_POLICY } from '../holidayPolicy';

describe('HolidayPolicy Value Object', () => {
  describe('Creation and validation', () => {
    it('should create a HolidayPolicy with RESPETAR_FESTIVOS type', () => {
      const policy = HolidayPolicy.create(HolidayPolicyType.RESPETAR_FESTIVOS);

      expect(policy.isSuccess()).toBe(true);
      expect(policy.getValue().type).toBe(HolidayPolicyType.RESPETAR_FESTIVOS);
    });

    it('should create a HolidayPolicy with TRABAJAR_FESTIVOS type', () => {
      const policy = HolidayPolicy.create(HolidayPolicyType.TRABAJAR_FESTIVOS);

      expect(policy.isSuccess()).toBe(true);
      expect(policy.getValue().type).toBe(HolidayPolicyType.TRABAJAR_FESTIVOS);
    });

    it('should fail when type is invalid', () => {
      const policy = HolidayPolicy.create('INVALID' as unknown as HolidayPolicyType);

      expect(policy.isFailure()).toBe(true);
      expect(policy.errorValue()).toContain('válido');
    });
  });

  describe('Default policy', () => {
    it('should create default policy with TRABAJAR_FESTIVOS', () => {
      const policy = HolidayPolicy.default();

      expect(policy.type).toBe(HolidayPolicyType.TRABAJAR_FESTIVOS);
    });

    it('should identify default policy correctly', () => {
      const defaultPolicy = HolidayPolicy.default();
      const nonDefaultPolicy = HolidayPolicy.create(HolidayPolicyType.RESPETAR_FESTIVOS).getValue();

      expect(defaultPolicy.isDefault()).toBe(true);
      expect(nonDefaultPolicy.isDefault()).toBe(false);
    });

    it('DEFAULT_HOLIDAY_POLICY constant should be TRABAJAR_FESTIVOS', () => {
      expect(DEFAULT_HOLIDAY_POLICY).toBe(HolidayPolicyType.TRABAJAR_FESTIVOS);
    });
  });

  describe('Type checking methods', () => {
    it('should return true for respectsHolidays when type is RESPETAR_FESTIVOS', () => {
      const policy = HolidayPolicy.create(HolidayPolicyType.RESPETAR_FESTIVOS);

      expect(policy.getValue().respectsHolidays()).toBe(true);
      expect(policy.getValue().canWorkHolidays()).toBe(false);
    });

    it('should return true for canWorkHolidays when type is TRABAJAR_FESTIVOS', () => {
      const policy = HolidayPolicy.create(HolidayPolicyType.TRABAJAR_FESTIVOS);

      expect(policy.getValue().canWorkHolidays()).toBe(true);
      expect(policy.getValue().respectsHolidays()).toBe(false);
    });
  });

  describe('Display text', () => {
    it('should return correct display text for RESPETAR_FESTIVOS', () => {
      const policy = HolidayPolicy.create(HolidayPolicyType.RESPETAR_FESTIVOS);

      expect(policy.getValue().getDisplayText()).toBe('Respeto festivos (no trabajo en festivos)');
    });

    it('should return correct display text for TRABAJAR_FESTIVOS', () => {
      const policy = HolidayPolicy.create(HolidayPolicyType.TRABAJAR_FESTIVOS);

      expect(policy.getValue().getDisplayText()).toBe('Trabajo festivos según mi ciclo');
    });
  });

  describe('Help message', () => {
    it('should return correct help message for RESPETAR_FESTIVOS', () => {
      const policy = HolidayPolicy.create(HolidayPolicyType.RESPETAR_FESTIVOS);
      const helpMessage = policy.getValue().getHelpMessage();

      expect(helpMessage).toContain('nunca se trabajarán');
      expect(helpMessage).toContain('independientemente');
    });

    it('should return correct help message for TRABAJAR_FESTIVOS', () => {
      const policy = HolidayPolicy.create(HolidayPolicyType.TRABAJAR_FESTIVOS);
      const helpMessage = policy.getValue().getHelpMessage();

      expect(helpMessage).toContain('ciclo indica');
      expect(helpMessage).toContain('día de trabajo');
    });
  });

  describe('Equality comparison', () => {
    it('should return true when comparing equal holiday policies', () => {
      const policy1 = HolidayPolicy.create(HolidayPolicyType.RESPETAR_FESTIVOS);
      const policy2 = HolidayPolicy.create(HolidayPolicyType.RESPETAR_FESTIVOS);

      expect(policy1.getValue().equals(policy2.getValue())).toBe(true);
    });

    it('should return false when comparing different holiday policies', () => {
      const policy1 = HolidayPolicy.create(HolidayPolicyType.RESPETAR_FESTIVOS);
      const policy2 = HolidayPolicy.create(HolidayPolicyType.TRABAJAR_FESTIVOS);

      expect(policy1.getValue().equals(policy2.getValue())).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation for RESPETAR_FESTIVOS', () => {
      const policy = HolidayPolicy.create(HolidayPolicyType.RESPETAR_FESTIVOS);

      expect(policy.getValue().toString()).toBe('RESPETAR_FESTIVOS');
    });

    it('should return string representation for TRABAJAR_FESTIVOS', () => {
      const policy = HolidayPolicy.create(HolidayPolicyType.TRABAJAR_FESTIVOS);

      expect(policy.getValue().toString()).toBe('TRABAJAR_FESTIVOS');
    });
  });

  describe('JSON serialization', () => {
    it('should serialize to JSON correctly', () => {
      const policy = HolidayPolicy.create(HolidayPolicyType.RESPETAR_FESTIVOS).getValue();

      expect(policy.toJSON()).toBe('RESPETAR_FESTIVOS');
    });

    it('should deserialize from JSON correctly', () => {
      const json = 'TRABAJAR_FESTIVOS';
      const policy = HolidayPolicy.fromJSON(json);

      expect(policy.isSuccess()).toBe(true);
      expect(policy.getValue().type).toBe(HolidayPolicyType.TRABAJAR_FESTIVOS);
    });

    it('should fail deserialization with invalid JSON', () => {
      const json = 'INVALID_POLICY';
      const policy = HolidayPolicy.fromJSON(json);

      expect(policy.isFailure()).toBe(true);
    });

    it('should maintain policy after serialization roundtrip', () => {
      const original = HolidayPolicy.create(HolidayPolicyType.RESPETAR_FESTIVOS).getValue();
      const json = original.toJSON();
      const restored = HolidayPolicy.fromJSON(json).getValue();

      expect(restored.equals(original)).toBe(true);
    });
  });
});
