/**
 * @file annualContractHours.test.ts
 * @description Tests para el Value Object AnnualContractHours
 */

import { describe, it, expect } from '@jest/globals';
import {
  AnnualContractHours,
  AnnualContractHoursError,
  ANNUAL_CONTRACT_HOURS_CONSTRAINTS,
  WarningType,
} from '../annualContractHours';

describe('AnnualContractHours', () => {
  describe('create', () => {
    it('crea una instancia con valor válido', () => {
      const hours = AnnualContractHours.create(1752);

      expect(hours.getValue()).toBe(1752);
    });

    it('crea una instancia con valores decimales', () => {
      const hours = AnnualContractHours.create(1752.5);

      expect(hours.getValue()).toBe(1752.5);
    });

    it('lanza error si las horas son 0', () => {
      expect(() => AnnualContractHours.create(0)).toThrow(
        AnnualContractHoursError
      );
      expect(() => AnnualContractHours.create(0)).toThrow(
        /deben ser mayores que 0/
      );
    });

    it('lanza error si las horas son negativas', () => {
      expect(() => AnnualContractHours.create(-100)).toThrow(
        AnnualContractHoursError
      );
      expect(() => AnnualContractHours.create(-100)).toThrow(
        /deben ser mayores que 0/
      );
    });

    it('lanza error si las horas superan el máximo', () => {
      expect(() => AnnualContractHours.create(3001)).toThrow(
        AnnualContractHoursError
      );
      expect(() => AnnualContractHours.create(3001)).toThrow(
        /no pueden superar 3000/
      );
    });

    it('acepta valores límite válidos', () => {
      expect(() => AnnualContractHours.create(1)).not.toThrow();
      expect(() => AnnualContractHours.create(3000)).not.toThrow();
    });

    it('lanza error si el valor no es un número válido', () => {
      expect(() => AnnualContractHours.create(NaN)).toThrow(
        AnnualContractHoursError
      );
      expect(() => AnnualContractHours.create(Infinity)).toThrow(
        AnnualContractHoursError
      );
    });
  });

  describe('default', () => {
    it('crea una instancia con el valor por defecto', () => {
      const hours = AnnualContractHours.default();

      expect(hours.getValue()).toBe(
        ANNUAL_CONTRACT_HOURS_CONSTRAINTS.DEFAULT
      );
    });
  });

  describe('fromWeeklyHours', () => {
    it('calcula horas anuales desde horas semanales', () => {
      const hours = AnnualContractHours.fromWeeklyHours(40);

      expect(hours.getValue()).toBe(2080); // 40 * 52
    });

    it('calcula correctamente con valores decimales', () => {
      const hours = AnnualContractHours.fromWeeklyHours(37.5);

      expect(hours.getValue()).toBe(1950); // 37.5 * 52
    });

    it('redondea el resultado', () => {
      const hours = AnnualContractHours.fromWeeklyHours(35.5);

      expect(hours.getValue()).toBe(1846); // 35.5 * 52 = 1846
    });

    it('lanza error si las horas semanales son 0 o negativas', () => {
      expect(() => AnnualContractHours.fromWeeklyHours(0)).toThrow(
        AnnualContractHoursError
      );
      expect(() => AnnualContractHours.fromWeeklyHours(-5)).toThrow(
        AnnualContractHoursError
      );
    });

    it('lanza error si las horas semanales superan 168', () => {
      expect(() => AnnualContractHours.fromWeeklyHours(169)).toThrow(
        AnnualContractHoursError
      );
      expect(() => AnnualContractHours.fromWeeklyHours(169)).toThrow(
        /no pueden superar 168/
      );
    });
  });

  describe('getValue', () => {
    it('devuelve el valor de las horas', () => {
      const hours = AnnualContractHours.create(2000);

      expect(hours.getValue()).toBe(2000);
    });
  });

  describe('isInNormalRange', () => {
    it('devuelve true si las horas están en el rango normal', () => {
      const hours = AnnualContractHours.create(1752);

      expect(hours.isInNormalRange()).toBe(true);
    });

    it('devuelve false si las horas son muy bajas', () => {
      const hours = AnnualContractHours.create(900);

      expect(hours.isInNormalRange()).toBe(false);
    });

    it('devuelve false si las horas son muy altas', () => {
      const hours = AnnualContractHours.create(2600);

      expect(hours.isInNormalRange()).toBe(false);
    });

    it('devuelve true en los límites del rango normal', () => {
      const hoursLow = AnnualContractHours.create(
        ANNUAL_CONTRACT_HOURS_CONSTRAINTS.WARNING_LOW
      );
      const hoursHigh = AnnualContractHours.create(
        ANNUAL_CONTRACT_HOURS_CONSTRAINTS.WARNING_HIGH
      );

      expect(hoursLow.isInNormalRange()).toBe(true);
      expect(hoursHigh.isInNormalRange()).toBe(true);
    });
  });

  describe('getWarning', () => {
    it('devuelve NONE si las horas están en el rango normal', () => {
      const hours = AnnualContractHours.create(1752);

      const warning = hours.getWarning();

      expect(warning.type).toBe(WarningType.NONE);
      expect(warning.message).toBeUndefined();
    });

    it('devuelve UNUSUALLY_LOW si las horas son muy bajas', () => {
      const hours = AnnualContractHours.create(900);

      const warning = hours.getWarning();

      expect(warning.type).toBe(WarningType.UNUSUALLY_LOW);
      expect(warning.message).toContain('inusualmente bajo');
    });

    it('devuelve UNUSUALLY_HIGH si las horas son muy altas', () => {
      const hours = AnnualContractHours.create(2600);

      const warning = hours.getWarning();

      expect(warning.type).toBe(WarningType.UNUSUALLY_HIGH);
      expect(warning.message).toContain('inusualmente alto');
    });

    it('no devuelve advertencia en los límites del rango normal', () => {
      const hoursLow = AnnualContractHours.create(
        ANNUAL_CONTRACT_HOURS_CONSTRAINTS.WARNING_LOW
      );
      const hoursHigh = AnnualContractHours.create(
        ANNUAL_CONTRACT_HOURS_CONSTRAINTS.WARNING_HIGH
      );

      expect(hoursLow.getWarning().type).toBe(WarningType.NONE);
      expect(hoursHigh.getWarning().type).toBe(WarningType.NONE);
    });
  });

  describe('toWeeklyHours', () => {
    it('calcula las horas semanales equivalentes', () => {
      const hours = AnnualContractHours.create(2080);

      expect(hours.toWeeklyHours()).toBe(40);
    });

    it('calcula correctamente con valores no exactos', () => {
      const hours = AnnualContractHours.create(1752);

      expect(hours.toWeeklyHours()).toBe(33.69); // 1752 / 52 = 33.692...
    });

    it('redondea a 2 decimales', () => {
      const hours = AnnualContractHours.create(1755);

      const weeklyHours = hours.toWeeklyHours();

      expect(weeklyHours).toBe(33.75); // 1755 / 52 = 33.75
    });
  });

  describe('isDefault', () => {
    it('devuelve true si es el valor por defecto', () => {
      const hours = AnnualContractHours.default();

      expect(hours.isDefault()).toBe(true);
    });

    it('devuelve false si no es el valor por defecto', () => {
      const hours = AnnualContractHours.create(2000);

      expect(hours.isDefault()).toBe(false);
    });
  });

  describe('equals', () => {
    it('devuelve true si dos instancias tienen el mismo valor', () => {
      const hours1 = AnnualContractHours.create(1752);
      const hours2 = AnnualContractHours.create(1752);

      expect(hours1.equals(hours2)).toBe(true);
    });

    it('devuelve false si las instancias tienen valores diferentes', () => {
      const hours1 = AnnualContractHours.create(1752);
      const hours2 = AnnualContractHours.create(2000);

      expect(hours1.equals(hours2)).toBe(false);
    });
  });

  describe('serialización', () => {
    it('serializa correctamente a JSON', () => {
      const hours = AnnualContractHours.create(1752);

      const json = hours.toJSON();

      expect(json).toBe(1752);
    });

    it('deserializa correctamente desde JSON', () => {
      const json = 1752;

      const hours = AnnualContractHours.fromJSON(json);

      expect(hours.getValue()).toBe(1752);
    });

    it('round-trip serialización/deserialización', () => {
      const original = AnnualContractHours.create(2000);

      const json = original.toJSON();
      const restored = AnnualContractHours.fromJSON(json);

      expect(restored.equals(original)).toBe(true);
    });
  });

  describe('toString', () => {
    it('devuelve una representación legible', () => {
      const hours = AnnualContractHours.create(1752);

      const str = hours.toString();

      expect(str).toBe('1752 horas/año');
    });
  });

  describe('toDetailedString', () => {
    it('devuelve una representación con contexto', () => {
      const hours = AnnualContractHours.create(2080);

      const str = hours.toDetailedString();

      expect(str).toContain('2080 horas/año');
      expect(str).toContain('40 h/semana');
    });
  });

  describe('casos extremos', () => {
    it('acepta el valor mínimo válido', () => {
      const hours = AnnualContractHours.create(1);

      expect(hours.getValue()).toBe(1);
    });

    it('acepta el valor máximo válido', () => {
      const hours = AnnualContractHours.create(3000);

      expect(hours.getValue()).toBe(3000);
    });

    it('maneja valores decimales complejos', () => {
      const hours = AnnualContractHours.create(1752.75);

      expect(hours.getValue()).toBe(1752.75);
    });
  });

  describe('integración con fromWeeklyHours', () => {
    it('convierte correctamente ida y vuelta', () => {
      const weeklyHours = 40;
      const annual = AnnualContractHours.fromWeeklyHours(weeklyHours);
      const backToWeekly = annual.toWeeklyHours();

      expect(backToWeekly).toBe(weeklyHours);
    });

    it('maneja valores decimales en la conversión', () => {
      const weeklyHours = 37.5;
      const annual = AnnualContractHours.fromWeeklyHours(weeklyHours);
      const backToWeekly = annual.toWeeklyHours();

      expect(backToWeekly).toBe(weeklyHours);
    });
  });
});
