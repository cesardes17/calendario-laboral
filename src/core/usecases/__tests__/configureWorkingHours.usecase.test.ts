/**
 * @file configureWorkingHours.usecase.test.ts
 * @description Tests para el caso de uso ConfigureWorkingHours
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ConfigureWorkingHoursUseCase } from '../configureWorkingHours.usecase';
import { WorkingHours, DEFAULT_WORKING_HOURS } from '../../domain/workingHours';

describe('ConfigureWorkingHoursUseCase', () => {
  let useCase: ConfigureWorkingHoursUseCase;

  beforeEach(() => {
    useCase = new ConfigureWorkingHoursUseCase();
  });

  describe('execute', () => {
    it('crea nueva configuración con valores personalizados', () => {
      const result = useCase.execute({
        weekday: 7.5,
        saturday: 6,
        sunday: 0,
        holiday: 8,
      });

      expect(result.isSuccess()).toBe(true);
      const workingHours = result.getValue();
      expect(workingHours.getHours('weekday')).toBe(7.5);
      expect(workingHours.getHours('saturday')).toBe(6);
      expect(workingHours.getHours('sunday')).toBe(0);
      expect(workingHours.getHours('holiday')).toBe(8);
    });

    it('crea configuración con valores parciales usando defaults', () => {
      const result = useCase.execute({
        weekday: 7.5,
      });

      expect(result.isSuccess()).toBe(true);
      const workingHours = result.getValue();
      expect(workingHours.getHours('weekday')).toBe(7.5);
      expect(workingHours.getHours('saturday')).toBe(DEFAULT_WORKING_HOURS.saturday);
      expect(workingHours.getHours('sunday')).toBe(DEFAULT_WORKING_HOURS.sunday);
      expect(workingHours.getHours('holiday')).toBe(DEFAULT_WORKING_HOURS.holiday);
    });

    it('actualiza configuración existente', () => {
      const current = WorkingHours.create({
        weekday: 8,
        saturday: 8,
        sunday: 0,
        holiday: 8,
      });

      const result = useCase.execute(
        {
          weekday: 7.5,
          sunday: 4,
        },
        current
      );

      expect(result.isSuccess()).toBe(true);
      const workingHours = result.getValue();
      expect(workingHours.getHours('weekday')).toBe(7.5);
      expect(workingHours.getHours('saturday')).toBe(8);
      expect(workingHours.getHours('sunday')).toBe(4);
      expect(workingHours.getHours('holiday')).toBe(8);
    });

    it('normaliza automáticamente los valores a 2 decimales', () => {
      const result = useCase.execute({
        weekday: 7.126,
        saturday: 6.999,
      });

      expect(result.isSuccess()).toBe(true);
      const workingHours = result.getValue();
      expect(workingHours.getHours('weekday')).toBe(7.13);
      expect(workingHours.getHours('saturday')).toBe(7);
    });

    it('falla si las horas son negativas', () => {
      const result = useCase.execute({
        weekday: -1,
      });

      expect(result.isFailure()).toBe(true);
      expect(result.errorValue()).toContain('no pueden ser negativas');
    });

    it('falla si las horas superan 24', () => {
      const result = useCase.execute({
        weekday: 25,
      });

      expect(result.isFailure()).toBe(true);
      expect(result.errorValue()).toContain('no pueden superar 24');
    });

    it('falla si las horas no son un número válido', () => {
      const result = useCase.execute({
        weekday: NaN,
      });

      expect(result.isFailure()).toBe(true);
      expect(result.errorValue()).toContain('número válido');
    });

    it('acepta valores límite (0 y 24)', () => {
      const result = useCase.execute({
        weekday: 0,
        saturday: 24,
      });

      expect(result.isSuccess()).toBe(true);
      const workingHours = result.getValue();
      expect(workingHours.getHours('weekday')).toBe(0);
      expect(workingHours.getHours('saturday')).toBe(24);
    });

    it('crea configuración vacía si no se proporcionan valores', () => {
      const result = useCase.execute({});

      expect(result.isSuccess()).toBe(true);
      const workingHours = result.getValue();
      expect(workingHours.getAll()).toEqual(DEFAULT_WORKING_HOURS);
    });
  });

  describe('updateSingleDayType', () => {
    it('actualiza solo el tipo de día especificado', () => {
      const current = WorkingHours.default();

      const result = useCase.updateSingleDayType('weekday', 7.5, current);

      expect(result.isSuccess()).toBe(true);
      const workingHours = result.getValue();
      expect(workingHours.getHours('weekday')).toBe(7.5);
      expect(workingHours.getHours('saturday')).toBe(DEFAULT_WORKING_HOURS.saturday);
      expect(workingHours.getHours('sunday')).toBe(DEFAULT_WORKING_HOURS.sunday);
      expect(workingHours.getHours('holiday')).toBe(DEFAULT_WORKING_HOURS.holiday);
    });

    it('crea nueva configuración si no hay instancia actual', () => {
      const result = useCase.updateSingleDayType('weekday', 7.5);

      expect(result.isSuccess()).toBe(true);
      const workingHours = result.getValue();
      expect(workingHours.getHours('weekday')).toBe(7.5);
      expect(workingHours.getHours('saturday')).toBe(DEFAULT_WORKING_HOURS.saturday);
    });

    it('normaliza el valor a 2 decimales', () => {
      const result = useCase.updateSingleDayType('weekday', 7.126);

      expect(result.isSuccess()).toBe(true);
      const workingHours = result.getValue();
      expect(workingHours.getHours('weekday')).toBe(7.13);
    });

    it('falla si el valor es inválido', () => {
      const result = useCase.updateSingleDayType('weekday', -1);

      expect(result.isFailure()).toBe(true);
    });

    it('actualiza cada tipo de día correctamente', () => {
      const current = WorkingHours.default();

      const weekdayResult = useCase.updateSingleDayType('weekday', 7.5, current);
      expect(weekdayResult.isSuccess()).toBe(true);

      const saturdayResult = useCase.updateSingleDayType('saturday', 6, current);
      expect(saturdayResult.isSuccess()).toBe(true);

      const sundayResult = useCase.updateSingleDayType('sunday', 0, current);
      expect(sundayResult.isSuccess()).toBe(true);

      const holidayResult = useCase.updateSingleDayType('holiday', 8.5, current);
      expect(holidayResult.isSuccess()).toBe(true);
    });
  });

  describe('reset', () => {
    it('resetea a valores por defecto', () => {
      const result = useCase.reset();

      expect(result.isSuccess()).toBe(true);
      const workingHours = result.getValue();
      expect(workingHours.getAll()).toEqual(DEFAULT_WORKING_HOURS);
      expect(workingHours.isDefault()).toBe(true);
    });
  });

  describe('loadFromConfig', () => {
    it('carga configuración desde JSON válido', () => {
      const config = {
        weekday: 7.5,
        saturday: 6,
        sunday: 0,
        holiday: 8,
      };

      const result = useCase.loadFromConfig(config);

      expect(result.isSuccess()).toBe(true);
      const workingHours = result.getValue();
      expect(workingHours.getAll()).toEqual(config);
    });

    it('falla si la configuración es inválida', () => {
      const config = {
        weekday: -1,
        saturday: 8,
        sunday: 8,
        holiday: 8,
      };

      const result = useCase.loadFromConfig(config);

      expect(result.isFailure()).toBe(true);
    });

    it('carga configuración con valores límite', () => {
      const config = {
        weekday: 0,
        saturday: 24,
        sunday: 12.5,
        holiday: 8.75,
      };

      const result = useCase.loadFromConfig(config);

      expect(result.isSuccess()).toBe(true);
      const workingHours = result.getValue();
      expect(workingHours.getHours('weekday')).toBe(0);
      expect(workingHours.getHours('saturday')).toBe(24);
      expect(workingHours.getHours('sunday')).toBe(12.5);
      expect(workingHours.getHours('holiday')).toBe(8.75);
    });
  });

  describe('flujo completo', () => {
    it('permite configurar, actualizar y resetear', () => {
      // Configuración inicial
      const initial = useCase.execute({
        weekday: 8,
        saturday: 8,
        sunday: 0,
        holiday: 8,
      });
      expect(initial.isSuccess()).toBe(true);

      // Actualizar un valor
      const current = initial.getValue();
      const updated = useCase.updateSingleDayType('weekday', 7.5, current);
      expect(updated.isSuccess()).toBe(true);

      // Actualizar múltiples valores
      const current2 = updated.getValue();
      const updated2 = useCase.execute(
        {
          saturday: 6,
          sunday: 4,
        },
        current2
      );
      expect(updated2.isSuccess()).toBe(true);

      const workingHours = updated2.getValue();
      expect(workingHours.getHours('weekday')).toBe(7.5);
      expect(workingHours.getHours('saturday')).toBe(6);
      expect(workingHours.getHours('sunday')).toBe(4);

      // Resetear
      const reset = useCase.reset();
      expect(reset.isSuccess()).toBe(true);
      expect(reset.getValue().isDefault()).toBe(true);
    });

    it('permite guardar y cargar configuración', () => {
      // Configurar
      const configured = useCase.execute({
        weekday: 7.5,
        saturday: 6,
        sunday: 0,
        holiday: 8.5,
      });
      expect(configured.isSuccess()).toBe(true);

      // Guardar configuración
      const config = configured.getValue().toJSON();

      // Cargar configuración
      const loaded = useCase.loadFromConfig(config);
      expect(loaded.isSuccess()).toBe(true);
      expect(loaded.getValue().equals(configured.getValue())).toBe(true);
    });
  });
});
