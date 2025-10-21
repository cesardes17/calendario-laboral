/**
 * @file configure-annual-contract-hours.usecase.test.ts
 * @description Tests para el caso de uso ConfigureAnnualContractHours
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ConfigureAnnualContractHoursUseCase } from '../configure-annual-contract-hours.usecase';
import { ANNUAL_CONTRACT_HOURS_CONSTRAINTS } from '../../domain/annual-contract-hours';

describe('ConfigureAnnualContractHoursUseCase', () => {
  let useCase: ConfigureAnnualContractHoursUseCase;

  beforeEach(() => {
    useCase = new ConfigureAnnualContractHoursUseCase();
  });

  describe('execute', () => {
    it('configura horas anuales válidas', () => {
      const result = useCase.execute(1752);

      expect(result.isSuccess()).toBe(true);
      const hours = result.getValue();
      expect(hours.getValue()).toBe(1752);
    });

    it('configura horas con valores decimales', () => {
      const result = useCase.execute(1752.5);

      expect(result.isSuccess()).toBe(true);
      const hours = result.getValue();
      expect(hours.getValue()).toBe(1752.5);
    });

    it('falla si las horas son 0', () => {
      const result = useCase.execute(0);

      expect(result.isFailure()).toBe(true);
      expect(result.errorValue()).toContain('mayores que 0');
    });

    it('falla si las horas son negativas', () => {
      const result = useCase.execute(-100);

      expect(result.isFailure()).toBe(true);
      expect(result.errorValue()).toContain('mayores que 0');
    });

    it('falla si las horas superan el máximo', () => {
      const result = useCase.execute(3001);

      expect(result.isFailure()).toBe(true);
      expect(result.errorValue()).toContain('no pueden superar 3000');
    });

    it('acepta valores límite', () => {
      const result1 = useCase.execute(1);
      const result2 = useCase.execute(3000);

      expect(result1.isSuccess()).toBe(true);
      expect(result2.isSuccess()).toBe(true);
    });

    it('falla con valores no numéricos', () => {
      const result = useCase.execute(NaN);

      expect(result.isFailure()).toBe(true);
      expect(result.errorValue()).toContain('número válido');
    });
  });

  describe('executeFromWeekly', () => {
    it('calcula horas anuales desde horas semanales', () => {
      const result = useCase.executeFromWeekly(40);

      expect(result.isSuccess()).toBe(true);
      const hours = result.getValue();
      expect(hours.getValue()).toBe(2080); // 40 * 52
    });

    it('calcula con valores decimales', () => {
      const result = useCase.executeFromWeekly(37.5);

      expect(result.isSuccess()).toBe(true);
      const hours = result.getValue();
      expect(hours.getValue()).toBe(1950); // 37.5 * 52
    });

    it('falla si las horas semanales son 0', () => {
      const result = useCase.executeFromWeekly(0);

      expect(result.isFailure()).toBe(true);
      expect(result.errorValue()).toContain('mayores que 0');
    });

    it('falla si las horas semanales son negativas', () => {
      const result = useCase.executeFromWeekly(-5);

      expect(result.isFailure()).toBe(true);
    });

    it('falla si las horas semanales superan 168', () => {
      const result = useCase.executeFromWeekly(169);

      expect(result.isFailure()).toBe(true);
      expect(result.errorValue()).toContain('no pueden superar 168');
    });

    it('acepta horas semanales comunes', () => {
      const result35 = useCase.executeFromWeekly(35);
      const result375 = useCase.executeFromWeekly(37.5);
      const result40 = useCase.executeFromWeekly(40);

      expect(result35.isSuccess()).toBe(true);
      expect(result375.isSuccess()).toBe(true);
      expect(result40.isSuccess()).toBe(true);
    });
  });

  describe('reset', () => {
    it('resetea a valores por defecto', () => {
      const result = useCase.reset();

      expect(result.isSuccess()).toBe(true);
      const hours = result.getValue();
      expect(hours.getValue()).toBe(ANNUAL_CONTRACT_HOURS_CONSTRAINTS.DEFAULT);
      expect(hours.isDefault()).toBe(true);
    });
  });

  describe('loadFromConfig', () => {
    it('carga configuración desde un valor guardado', () => {
      const result = useCase.loadFromConfig(2000);

      expect(result.isSuccess()).toBe(true);
      const hours = result.getValue();
      expect(hours.getValue()).toBe(2000);
    });

    it('falla si la configuración es inválida', () => {
      const result = useCase.loadFromConfig(-100);

      expect(result.isFailure()).toBe(true);
    });

    it('carga el valor por defecto', () => {
      const result = useCase.loadFromConfig(
        ANNUAL_CONTRACT_HOURS_CONSTRAINTS.DEFAULT
      );

      expect(result.isSuccess()).toBe(true);
      const hours = result.getValue();
      expect(hours.isDefault()).toBe(true);
    });
  });

  describe('validate', () => {
    it('valida horas anuales correctas', () => {
      const validation = useCase.validate(1752);

      expect(validation.isValid).toBe(true);
      expect(validation.error).toBeUndefined();
    });

    it('valida horas anuales incorrectas', () => {
      const validation = useCase.validate(0);

      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('mayores que 0');
    });

    it('valida valores límite', () => {
      const validation1 = useCase.validate(1);
      const validation2 = useCase.validate(3000);

      expect(validation1.isValid).toBe(true);
      expect(validation2.isValid).toBe(true);
    });

    it('valida valores fuera de rango', () => {
      const validationLow = useCase.validate(0);
      const validationHigh = useCase.validate(3001);

      expect(validationLow.isValid).toBe(false);
      expect(validationHigh.isValid).toBe(false);
    });

    it('valida valores no numéricos', () => {
      const validation = useCase.validate(NaN);

      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeDefined();
    });
  });

  describe('validateWeekly', () => {
    it('valida horas semanales correctas', () => {
      const validation = useCase.validateWeekly(40);

      expect(validation.isValid).toBe(true);
      expect(validation.error).toBeUndefined();
    });

    it('valida horas semanales incorrectas', () => {
      const validation = useCase.validateWeekly(0);

      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('mayores que 0');
    });

    it('valida horas semanales comunes', () => {
      const validation35 = useCase.validateWeekly(35);
      const validation375 = useCase.validateWeekly(37.5);
      const validation40 = useCase.validateWeekly(40);

      expect(validation35.isValid).toBe(true);
      expect(validation375.isValid).toBe(true);
      expect(validation40.isValid).toBe(true);
    });

    it('valida horas semanales fuera de rango', () => {
      const validationLow = useCase.validateWeekly(0);
      const validationHigh = useCase.validateWeekly(169);

      expect(validationLow.isValid).toBe(false);
      expect(validationHigh.isValid).toBe(false);
    });
  });

  describe('flujo completo', () => {
    it('permite configurar directamente y resetear', () => {
      // Configurar
      const configured = useCase.execute(2000);
      expect(configured.isSuccess()).toBe(true);

      // Resetear
      const reset = useCase.reset();
      expect(reset.isSuccess()).toBe(true);
      expect(reset.getValue().isDefault()).toBe(true);
    });

    it('permite calcular desde semanal y guardar', () => {
      // Calcular desde semanal
      const calculated = useCase.executeFromWeekly(40);
      expect(calculated.isSuccess()).toBe(true);

      const annualValue = calculated.getValue().getValue();

      // Cargar el valor calculado
      const loaded = useCase.loadFromConfig(annualValue);
      expect(loaded.isSuccess()).toBe(true);
      expect(loaded.getValue().equals(calculated.getValue())).toBe(true);
    });

    it('permite validar antes de ejecutar', () => {
      // Validar primero
      const validation = useCase.validate(1752);
      expect(validation.isValid).toBe(true);

      // Ejecutar si es válido
      if (validation.isValid) {
        const result = useCase.execute(1752);
        expect(result.isSuccess()).toBe(true);
      }
    });

    it('valida semanal antes de calcular anual', () => {
      // Validar horas semanales
      const validation = useCase.validateWeekly(40);
      expect(validation.isValid).toBe(true);

      // Calcular si es válido
      if (validation.isValid) {
        const result = useCase.executeFromWeekly(40);
        expect(result.isSuccess()).toBe(true);
        expect(result.getValue().getValue()).toBe(2080);
      }
    });
  });

  describe('casos de uso reales', () => {
    it('maneja jornada completa típica española (1752h)', () => {
      const result = useCase.execute(1752);

      expect(result.isSuccess()).toBe(true);
      const hours = result.getValue();
      expect(hours.isInNormalRange()).toBe(true);
    });

    it('maneja jornada completa estándar 40h/sem', () => {
      const result = useCase.executeFromWeekly(40);

      expect(result.isSuccess()).toBe(true);
      const hours = result.getValue();
      expect(hours.getValue()).toBe(2080);
      expect(hours.isInNormalRange()).toBe(true);
    });

    it('maneja jornada reducida 37.5h/sem', () => {
      const result = useCase.executeFromWeekly(37.5);

      expect(result.isSuccess()).toBe(true);
      const hours = result.getValue();
      expect(hours.getValue()).toBe(1950);
      expect(hours.isInNormalRange()).toBe(true);
    });

    it('advierte sobre jornadas inusuales', () => {
      const resultLow = useCase.execute(900);
      const resultHigh = useCase.execute(2600);

      expect(resultLow.isSuccess()).toBe(true);
      expect(resultLow.getValue().isInNormalRange()).toBe(false);

      expect(resultHigh.isSuccess()).toBe(true);
      expect(resultHigh.getValue().isInNormalRange()).toBe(false);
    });
  });
});
