/**
 * @file working-hours.test.ts
 * @description Tests para el Value Object WorkingHours
 */

import { describe, it, expect } from '@jest/globals';
import {
  WorkingHours,
  WorkingHoursError,
  DEFAULT_WORKING_HOURS,
  WORKING_HOURS_CONSTRAINTS,
  type DayType,
} from '../working-hours';

describe('WorkingHours', () => {
  describe('create', () => {
    it('crea una instancia con valores por defecto', () => {
      const hours = WorkingHours.create();

      expect(hours.getHours('weekday')).toBe(DEFAULT_WORKING_HOURS.weekday);
      expect(hours.getHours('saturday')).toBe(DEFAULT_WORKING_HOURS.saturday);
      expect(hours.getHours('sunday')).toBe(DEFAULT_WORKING_HOURS.sunday);
      expect(hours.getHours('holiday')).toBe(DEFAULT_WORKING_HOURS.holiday);
    });

    it('crea una instancia con valores personalizados', () => {
      const hours = WorkingHours.create({
        weekday: 7.5,
        saturday: 6,
        sunday: 0,
        holiday: 8,
      });

      expect(hours.getHours('weekday')).toBe(7.5);
      expect(hours.getHours('saturday')).toBe(6);
      expect(hours.getHours('sunday')).toBe(0);
      expect(hours.getHours('holiday')).toBe(8);
    });

    it('crea una instancia con valores parciales', () => {
      const hours = WorkingHours.create({
        weekday: 7.5,
        sunday: 0,
      });

      expect(hours.getHours('weekday')).toBe(7.5);
      expect(hours.getHours('saturday')).toBe(DEFAULT_WORKING_HOURS.saturday);
      expect(hours.getHours('sunday')).toBe(0);
      expect(hours.getHours('holiday')).toBe(DEFAULT_WORKING_HOURS.holiday);
    });

    it('lanza error si las horas son negativas', () => {
      expect(() => WorkingHours.create({ weekday: -1 })).toThrow(
        WorkingHoursError
      );
      expect(() => WorkingHours.create({ weekday: -1 })).toThrow(
        /no pueden ser negativas/
      );
    });

    it('lanza error si las horas superan 24', () => {
      expect(() => WorkingHours.create({ weekday: 25 })).toThrow(
        WorkingHoursError
      );
      expect(() => WorkingHours.create({ saturday: 24.1 })).toThrow(
        WorkingHoursError
      );
    });

    it('acepta valores límite válidos (0 y 24)', () => {
      expect(() =>
        WorkingHours.create({
          weekday: 0,
          saturday: 24,
          sunday: 0,
          holiday: 24,
        })
      ).not.toThrow();
    });

    it('lanza error si las horas no son un número válido', () => {
      expect(() => WorkingHours.create({ weekday: NaN })).toThrow(
        WorkingHoursError
      );
      expect(() => WorkingHours.create({ weekday: Infinity })).toThrow(
        WorkingHoursError
      );
    });
  });

  describe('default', () => {
    it('crea una instancia con valores por defecto', () => {
      const hours = WorkingHours.default();

      expect(hours.getAll()).toEqual(DEFAULT_WORKING_HOURS);
    });
  });

  describe('normalizeHours', () => {
    it('normaliza valores a 2 decimales', () => {
      expect(WorkingHours.normalizeHours(7.123456)).toBe(7.12);
      expect(WorkingHours.normalizeHours(7.126)).toBe(7.13);
      expect(WorkingHours.normalizeHours(7.125)).toBe(7.13);
    });

    it('mantiene valores enteros', () => {
      expect(WorkingHours.normalizeHours(8)).toBe(8);
    });

    it('mantiene un decimal', () => {
      expect(WorkingHours.normalizeHours(7.5)).toBe(7.5);
    });
  });

  describe('getHours', () => {
    it('devuelve las horas para cada tipo de día', () => {
      const hours = WorkingHours.create({
        weekday: 7.5,
        saturday: 6,
        sunday: 0,
        holiday: 8,
      });

      expect(hours.getHours('weekday')).toBe(7.5);
      expect(hours.getHours('saturday')).toBe(6);
      expect(hours.getHours('sunday')).toBe(0);
      expect(hours.getHours('holiday')).toBe(8);
    });
  });

  describe('getAll', () => {
    it('devuelve una copia de toda la configuración', () => {
      const hours = WorkingHours.create({
        weekday: 7.5,
        saturday: 6,
        sunday: 0,
        holiday: 8,
      });

      const config = hours.getAll();

      expect(config).toEqual({
        weekday: 7.5,
        saturday: 6,
        sunday: 0,
        holiday: 8,
      });
    });

    it('devuelve una copia no modificable', () => {
      const hours = WorkingHours.create({ weekday: 8 });
      const config = hours.getAll();

      config.weekday = 10;

      expect(hours.getHours('weekday')).toBe(8);
    });
  });

  describe('updateHours', () => {
    it('actualiza las horas de un tipo de día', () => {
      const hours = WorkingHours.default();
      const updated = hours.updateHours('weekday', 7.5);

      expect(updated.getHours('weekday')).toBe(7.5);
      expect(updated.getHours('saturday')).toBe(DEFAULT_WORKING_HOURS.saturday);
    });

    it('normaliza automáticamente a 2 decimales', () => {
      const hours = WorkingHours.default();
      const updated = hours.updateHours('weekday', 7.126);

      expect(updated.getHours('weekday')).toBe(7.13);
    });

    it('no modifica la instancia original (inmutabilidad)', () => {
      const hours = WorkingHours.default();
      const updated = hours.updateHours('weekday', 7.5);

      expect(hours.getHours('weekday')).toBe(DEFAULT_WORKING_HOURS.weekday);
      expect(updated.getHours('weekday')).toBe(7.5);
    });

    it('valida el nuevo valor', () => {
      const hours = WorkingHours.default();

      expect(() => hours.updateHours('weekday', -1)).toThrow(
        WorkingHoursError
      );
      expect(() => hours.updateHours('weekday', 25)).toThrow(
        WorkingHoursError
      );
    });
  });

  describe('updateMultiple', () => {
    it('actualiza múltiples tipos de día a la vez', () => {
      const hours = WorkingHours.default();
      const updated = hours.updateMultiple({
        weekday: 7.5,
        sunday: 0,
      });

      expect(updated.getHours('weekday')).toBe(7.5);
      expect(updated.getHours('saturday')).toBe(DEFAULT_WORKING_HOURS.saturday);
      expect(updated.getHours('sunday')).toBe(0);
      expect(updated.getHours('holiday')).toBe(DEFAULT_WORKING_HOURS.holiday);
    });

    it('normaliza todos los valores', () => {
      const hours = WorkingHours.default();
      const updated = hours.updateMultiple({
        weekday: 7.126,
        saturday: 6.999,
      });

      expect(updated.getHours('weekday')).toBe(7.13);
      expect(updated.getHours('saturday')).toBe(7);
    });

    it('no modifica la instancia original', () => {
      const hours = WorkingHours.default();
      const updated = hours.updateMultiple({
        weekday: 7.5,
        sunday: 0,
      });

      expect(hours.getHours('weekday')).toBe(DEFAULT_WORKING_HOURS.weekday);
      expect(hours.getHours('sunday')).toBe(DEFAULT_WORKING_HOURS.sunday);
    });
  });

  describe('isDefault', () => {
    it('devuelve true si todas las horas son valores por defecto', () => {
      const hours = WorkingHours.default();

      expect(hours.isDefault()).toBe(true);
    });

    it('devuelve false si alguna hora difiere del valor por defecto', () => {
      const hours = WorkingHours.create({ weekday: 7.5 });

      expect(hours.isDefault()).toBe(false);
    });
  });

  describe('equals', () => {
    it('devuelve true si dos instancias tienen los mismos valores', () => {
      const hours1 = WorkingHours.create({
        weekday: 7.5,
        saturday: 6,
        sunday: 0,
        holiday: 8,
      });
      const hours2 = WorkingHours.create({
        weekday: 7.5,
        saturday: 6,
        sunday: 0,
        holiday: 8,
      });

      expect(hours1.equals(hours2)).toBe(true);
    });

    it('devuelve false si las instancias tienen valores diferentes', () => {
      const hours1 = WorkingHours.create({ weekday: 7.5 });
      const hours2 = WorkingHours.create({ weekday: 8 });

      expect(hours1.equals(hours2)).toBe(false);
    });
  });

  describe('serialización', () => {
    it('serializa correctamente a JSON', () => {
      const hours = WorkingHours.create({
        weekday: 7.5,
        saturday: 6,
        sunday: 0,
        holiday: 8,
      });

      const json = hours.toJSON();

      expect(json).toEqual({
        weekday: 7.5,
        saturday: 6,
        sunday: 0,
        holiday: 8,
      });
    });

    it('deserializa correctamente desde JSON', () => {
      const json = {
        weekday: 7.5,
        saturday: 6,
        sunday: 0,
        holiday: 8,
      };

      const hours = WorkingHours.fromJSON(json);

      expect(hours.getAll()).toEqual(json);
    });

    it('round-trip serialización/deserialización', () => {
      const original = WorkingHours.create({
        weekday: 7.5,
        saturday: 6,
        sunday: 0,
        holiday: 8,
      });

      const json = original.toJSON();
      const restored = WorkingHours.fromJSON(json);

      expect(restored.equals(original)).toBe(true);
    });
  });

  describe('toString', () => {
    it('devuelve una representación legible', () => {
      const hours = WorkingHours.create({
        weekday: 7.5,
        saturday: 6,
        sunday: 0,
        holiday: 8,
      });

      const str = hours.toString();

      expect(str).toContain('7.5');
      expect(str).toContain('6');
      expect(str).toContain('0');
      expect(str).toContain('8');
    });
  });

  describe('casos extremos', () => {
    it('acepta cero horas para todos los tipos de día', () => {
      const hours = WorkingHours.create({
        weekday: 0,
        saturday: 0,
        sunday: 0,
        holiday: 0,
      });

      expect(hours.getAll()).toEqual({
        weekday: 0,
        saturday: 0,
        sunday: 0,
        holiday: 0,
      });
    });

    it('acepta 24 horas para todos los tipos de día', () => {
      const hours = WorkingHours.create({
        weekday: 24,
        saturday: 24,
        sunday: 24,
        holiday: 24,
      });

      expect(hours.getAll()).toEqual({
        weekday: 24,
        saturday: 24,
        sunday: 24,
        holiday: 24,
      });
    });

    it('maneja correctamente valores decimales complejos', () => {
      const hours = WorkingHours.create({
        weekday: 7.75,
        saturday: 6.25,
        sunday: 4.5,
        holiday: 8.33,
      });

      expect(hours.getHours('weekday')).toBe(7.75);
      expect(hours.getHours('saturday')).toBe(6.25);
      expect(hours.getHours('sunday')).toBe(4.5);
      expect(hours.getHours('holiday')).toBe(8.33);
    });
  });
});
