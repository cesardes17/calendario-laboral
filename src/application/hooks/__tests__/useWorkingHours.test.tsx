/**
 * @file use-workingHours.test.tsx
 * @description Tests para el hook useWorkingHours
 */

import { describe, it, expect } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useWorkingHours } from '../use-workingHours';
import { DEFAULT_WORKING_HOURS } from '@/src/core/domain';

describe('useWorkingHours', () => {
  describe('inicialización', () => {
    it('inicializa con valores por defecto', () => {
      const { result } = renderHook(() => useWorkingHours());

      expect(result.current.workingHours.getAll()).toEqual(DEFAULT_WORKING_HOURS);
      expect(result.current.weekdayInput).toBe('8.00');
      expect(result.current.saturdayInput).toBe('8.00');
      expect(result.current.sundayInput).toBe('8.00');
      expect(result.current.holidayInput).toBe('8.00');
      expect(result.current.isValid).toBe(true);
    });

    it('inicializa con configuración personalizada', () => {
      const { result } = renderHook(() =>
        useWorkingHours({
          weekday: 7.5,
          saturday: 6,
          sunday: 0,
          holiday: 8.5,
        })
      );

      expect(result.current.workingHours.getHours('weekday')).toBe(7.5);
      expect(result.current.workingHours.getHours('saturday')).toBe(6);
      expect(result.current.workingHours.getHours('sunday')).toBe(0);
      expect(result.current.workingHours.getHours('holiday')).toBe(8.5);
      expect(result.current.weekdayInput).toBe('7.50');
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('updateWeekdayHours', () => {
    it('actualiza correctamente las horas para días laborables', () => {
      const { result } = renderHook(() => useWorkingHours());

      act(() => {
        result.current.updateWeekdayHours('7.5');
      });

      expect(result.current.workingHours.getHours('weekday')).toBe(7.5);
      expect(result.current.weekdayInput).toBe('7.5');
      expect(result.current.weekdayValidation.isValid).toBe(true);
      expect(result.current.isValid).toBe(true);
    });

    it('valida valores negativos', () => {
      const { result } = renderHook(() => useWorkingHours());

      act(() => {
        result.current.updateWeekdayHours('-1');
      });

      expect(result.current.weekdayValidation.isValid).toBe(false);
      expect(result.current.weekdayValidation.error).toContain('negativo');
      expect(result.current.isValid).toBe(false);
    });

    it('valida valores mayores a 24', () => {
      const { result } = renderHook(() => useWorkingHours());

      act(() => {
        result.current.updateWeekdayHours('25');
      });

      expect(result.current.weekdayValidation.isValid).toBe(false);
      expect(result.current.weekdayValidation.error).toContain('24 horas');
      expect(result.current.isValid).toBe(false);
    });

    it('valida valores no numéricos', () => {
      const { result } = renderHook(() => useWorkingHours());

      act(() => {
        result.current.updateWeekdayHours('abc');
      });

      expect(result.current.weekdayValidation.isValid).toBe(false);
      expect(result.current.weekdayValidation.error).toContain('número válido');
      expect(result.current.isValid).toBe(false);
    });

    it('valida campos vacíos', () => {
      const { result } = renderHook(() => useWorkingHours());

      act(() => {
        result.current.updateWeekdayHours('');
      });

      expect(result.current.weekdayValidation.isValid).toBe(false);
      expect(result.current.weekdayValidation.error).toContain('requerido');
      expect(result.current.isValid).toBe(false);
    });

    it('acepta valores decimales', () => {
      const { result } = renderHook(() => useWorkingHours());

      act(() => {
        result.current.updateWeekdayHours('7.25');
      });

      expect(result.current.workingHours.getHours('weekday')).toBe(7.25);
      expect(result.current.weekdayValidation.isValid).toBe(true);
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('updateSaturdayHours', () => {
    it('actualiza correctamente las horas para sábados', () => {
      const { result } = renderHook(() => useWorkingHours());

      act(() => {
        result.current.updateSaturdayHours('6');
      });

      expect(result.current.workingHours.getHours('saturday')).toBe(6);
      expect(result.current.saturdayInput).toBe('6');
      expect(result.current.saturdayValidation.isValid).toBe(true);
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('updateSundayHours', () => {
    it('actualiza correctamente las horas para domingos', () => {
      const { result } = renderHook(() => useWorkingHours());

      act(() => {
        result.current.updateSundayHours('0');
      });

      expect(result.current.workingHours.getHours('sunday')).toBe(0);
      expect(result.current.sundayInput).toBe('0');
      expect(result.current.sundayValidation.isValid).toBe(true);
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('updateHolidayHours', () => {
    it('actualiza correctamente las horas para festivos', () => {
      const { result } = renderHook(() => useWorkingHours());

      act(() => {
        result.current.updateHolidayHours('10');
      });

      expect(result.current.workingHours.getHours('holiday')).toBe(10);
      expect(result.current.holidayInput).toBe('10');
      expect(result.current.holidayValidation.isValid).toBe(true);
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('reset', () => {
    it('resetea a valores por defecto', () => {
      const { result } = renderHook(() => useWorkingHours());

      act(() => {
        result.current.updateWeekdayHours('7.5');
        result.current.updateSaturdayHours('6');
        result.current.updateSundayHours('0');
      });

      expect(result.current.workingHours.getHours('weekday')).toBe(7.5);

      act(() => {
        result.current.reset();
      });

      expect(result.current.workingHours.getAll()).toEqual(DEFAULT_WORKING_HOURS);
      expect(result.current.weekdayInput).toBe('8.00');
      expect(result.current.saturdayInput).toBe('8.00');
      expect(result.current.sundayInput).toBe('8.00');
      expect(result.current.holidayInput).toBe('8.00');
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('loadFromConfig', () => {
    it('carga configuración desde un objeto', () => {
      const { result } = renderHook(() => useWorkingHours());

      const config = {
        weekday: 7.5,
        saturday: 6,
        sunday: 0,
        holiday: 8.5,
      };

      act(() => {
        result.current.loadFromConfig(config);
      });

      expect(result.current.workingHours.getAll()).toEqual(config);
      expect(result.current.weekdayInput).toBe('7.50');
      expect(result.current.saturdayInput).toBe('6.00');
      expect(result.current.sundayInput).toBe('0.00');
      expect(result.current.holidayInput).toBe('8.50');
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('validación general', () => {
    it('isValid es false si algún campo es inválido', () => {
      const { result } = renderHook(() => useWorkingHours());

      act(() => {
        result.current.updateWeekdayHours('7.5');
        result.current.updateSaturdayHours('-1'); // Inválido
        result.current.updateSundayHours('0');
        result.current.updateHolidayHours('8');
      });

      expect(result.current.isValid).toBe(false);
    });

    it('isValid es true si todos los campos son válidos', () => {
      const { result } = renderHook(() => useWorkingHours());

      act(() => {
        result.current.updateWeekdayHours('7.5');
        result.current.updateSaturdayHours('6');
        result.current.updateSundayHours('0');
        result.current.updateHolidayHours('8');
      });

      expect(result.current.isValid).toBe(true);
    });
  });

  describe('normalización', () => {
    it('normaliza automáticamente a 2 decimales', () => {
      const { result } = renderHook(() => useWorkingHours());

      act(() => {
        result.current.updateWeekdayHours('7.126');
      });

      // El valor interno se normaliza a 2 decimales
      expect(result.current.workingHours.getHours('weekday')).toBe(7.13);
      // El input mantiene lo que el usuario escribió
      expect(result.current.weekdayInput).toBe('7.126');
    });
  });

  describe('flujo completo', () => {
    it('permite configurar todas las horas y resetear', () => {
      const { result } = renderHook(() => useWorkingHours());

      // Configurar todas las horas
      act(() => {
        result.current.updateWeekdayHours('7.5');
        result.current.updateSaturdayHours('6');
        result.current.updateSundayHours('0');
        result.current.updateHolidayHours('10');
      });

      expect(result.current.workingHours.getHours('weekday')).toBe(7.5);
      expect(result.current.workingHours.getHours('saturday')).toBe(6);
      expect(result.current.workingHours.getHours('sunday')).toBe(0);
      expect(result.current.workingHours.getHours('holiday')).toBe(10);
      expect(result.current.isValid).toBe(true);

      // Resetear
      act(() => {
        result.current.reset();
      });

      expect(result.current.workingHours.getAll()).toEqual(DEFAULT_WORKING_HOURS);
      expect(result.current.isValid).toBe(true);
    });
  });
});
