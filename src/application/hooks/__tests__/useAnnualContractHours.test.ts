/**
 * @file use-annualContractHours.test.ts
 * @description Tests para el hook useAnnualContractHours
 */

import { describe, it, expect } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useAnnualContractHours } from '../useAnnualContractHours';
import {
  ANNUAL_CONTRACT_HOURS_CONSTRAINTS,
  WarningType,
} from '@/src/core/domain/annualContractHours';

describe('useAnnualContractHours', () => {
  describe('inicialización', () => {
    it('se inicializa con valores por defecto', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      expect(result.current.annualHours).not.toBeNull();
      expect(result.current.annualHours?.getValue()).toBe(
        ANNUAL_CONTRACT_HOURS_CONSTRAINTS.DEFAULT
      );
      expect(result.current.isDefault).toBe(true);
      expect(result.current.annualError).toBeNull();
      expect(result.current.weeklyError).toBeNull();
    });

    it('el input anual muestra el valor por defecto', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      expect(result.current.annualInput).toBe(
        ANNUAL_CONTRACT_HOURS_CONSTRAINTS.DEFAULT.toString()
      );
    });

    it('el input semanal está vacío', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      expect(result.current.weeklyInput).toBe('');
    });
  });

  describe('setAnnualHours', () => {
    it('actualiza las horas anuales con un valor válido', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setAnnualHours('2000');
      });

      expect(result.current.annualHours?.getValue()).toBe(2000);
      expect(result.current.annualInput).toBe('2000');
      expect(result.current.annualError).toBeNull();
      expect(result.current.isDefault).toBe(false);
    });

    it('acepta valores decimales', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setAnnualHours('1752.5');
      });

      expect(result.current.annualHours?.getValue()).toBe(1752.5);
      expect(result.current.annualError).toBeNull();
    });

    it('muestra error con valor no numérico', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setAnnualHours('abc');
      });

      expect(result.current.annualHours).toBeNull();
      expect(result.current.annualError).toContain('número válido');
    });

    it('muestra error con valor fuera de rango (demasiado bajo)', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setAnnualHours('0');
      });

      expect(result.current.annualHours).toBeNull();
      expect(result.current.annualError).toContain('mayores que 0');
    });

    it('muestra error con valor fuera de rango (demasiado alto)', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setAnnualHours('3001');
      });

      expect(result.current.annualHours).toBeNull();
      expect(result.current.annualError).toContain('superar 3000');
    });

    it('permite campo vacío', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setAnnualHours('');
      });

      expect(result.current.annualHours).toBeNull();
      expect(result.current.annualInput).toBe('');
      expect(result.current.annualError).toBeNull();
    });

    it('actualiza el estado de advertencia con valor bajo', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setAnnualHours('900');
      });

      expect(result.current.warning).not.toBeNull();
      expect(result.current.warning?.type).toBe(WarningType.UNUSUALLY_LOW);
    });

    it('actualiza el estado de advertencia con valor alto', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setAnnualHours('2600');
      });

      expect(result.current.warning).not.toBeNull();
      expect(result.current.warning?.type).toBe(WarningType.UNUSUALLY_HIGH);
    });

    it('no muestra advertencia con valor normal', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setAnnualHours('1752');
      });

      expect(result.current.warning?.type).toBe(WarningType.NONE);
    });
  });

  describe('setWeeklyHours', () => {
    it('actualiza el input de horas semanales con valor válido', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setWeeklyHours('40');
      });

      expect(result.current.weeklyInput).toBe('40');
      expect(result.current.weeklyError).toBeNull();
    });

    it('acepta valores decimales', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setWeeklyHours('37.5');
      });

      expect(result.current.weeklyInput).toBe('37.5');
      expect(result.current.weeklyError).toBeNull();
    });

    it('muestra error con valor no numérico', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setWeeklyHours('abc');
      });

      expect(result.current.weeklyError).toContain('número válido');
    });

    it('muestra error con valor fuera de rango', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setWeeklyHours('169');
      });

      expect(result.current.weeklyError).toContain('superar 168');
    });

    it('permite campo vacío', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setWeeklyHours('40');
      });

      act(() => {
        result.current.setWeeklyHours('');
      });

      expect(result.current.weeklyInput).toBe('');
      expect(result.current.weeklyError).toBeNull();
    });

    it('no actualiza las horas anuales automáticamente', () => {
      const { result } = renderHook(() => useAnnualContractHours());
      const initialAnnual = result.current.annualHours?.getValue();

      act(() => {
        result.current.setWeeklyHours('40');
      });

      expect(result.current.annualHours?.getValue()).toBe(initialAnnual);
    });
  });

  describe('applyWeeklyCalculation', () => {
    it('calcula las horas anuales desde las semanales', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setWeeklyHours('40');
      });

      act(() => {
        result.current.applyWeeklyCalculation();
      });

      expect(result.current.annualHours?.getValue()).toBe(2080);
      expect(result.current.annualInput).toBe('2080');
    });

    it('calcula correctamente con valores decimales', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setWeeklyHours('37.5');
      });

      act(() => {
        result.current.applyWeeklyCalculation();
      });

      expect(result.current.annualHours?.getValue()).toBe(1950);
    });

    it('actualiza el estado de advertencia si corresponde', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      // 50h/semana = 2600h/año (> WARNING_HIGH de 2500)
      act(() => {
        result.current.setWeeklyHours('50');
      });

      act(() => {
        result.current.applyWeeklyCalculation();
      });

      expect(result.current.annualHours?.getValue()).toBe(2600);
      expect(result.current.warning?.type).toBe(WarningType.UNUSUALLY_HIGH);
    });

    it('no hace nada si el input semanal está vacío', () => {
      const { result } = renderHook(() => useAnnualContractHours());
      const initialAnnual = result.current.annualHours?.getValue();

      act(() => {
        result.current.applyWeeklyCalculation();
      });

      expect(result.current.annualHours?.getValue()).toBe(initialAnnual);
    });

    it('no hace nada si el input semanal es inválido', () => {
      const { result } = renderHook(() => useAnnualContractHours());
      const initialAnnual = result.current.annualHours?.getValue();

      act(() => {
        result.current.setWeeklyHours('abc');
      });

      act(() => {
        result.current.applyWeeklyCalculation();
      });

      expect(result.current.annualHours?.getValue()).toBe(initialAnnual);
    });
  });

  describe('reset', () => {
    it('resetea a valores por defecto', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      // Cambiar valores
      act(() => {
        result.current.setAnnualHours('2000');
        result.current.setWeeklyHours('40');
      });

      // Resetear
      act(() => {
        result.current.reset();
      });

      expect(result.current.annualHours?.getValue()).toBe(
        ANNUAL_CONTRACT_HOURS_CONSTRAINTS.DEFAULT
      );
      expect(result.current.isDefault).toBe(true);
      expect(result.current.weeklyInput).toBe('');
      expect(result.current.annualError).toBeNull();
      expect(result.current.weeklyError).toBeNull();
    });
  });

  describe('loadFromConfig', () => {
    it('carga una configuración guardada', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.loadFromConfig(2000);
      });

      expect(result.current.annualHours?.getValue()).toBe(2000);
      expect(result.current.annualInput).toBe('2000');
      expect(result.current.isDefault).toBe(false);
    });

    it('carga el valor por defecto y marca isDefault', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.loadFromConfig(
          ANNUAL_CONTRACT_HOURS_CONSTRAINTS.DEFAULT
        );
      });

      expect(result.current.isDefault).toBe(true);
    });

    it('limpia el input semanal al cargar', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setWeeklyHours('40');
      });

      act(() => {
        result.current.loadFromConfig(2000);
      });

      expect(result.current.weeklyInput).toBe('');
    });
  });

  describe('getFormattedAnnualHours', () => {
    it('devuelve las horas anuales formateadas', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setAnnualHours('2000');
      });

      expect(result.current.getFormattedAnnualHours()).toBe('2000');
    });

    it('devuelve cadena vacía si no hay valor', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setAnnualHours('');
      });

      expect(result.current.getFormattedAnnualHours()).toBe('');
    });
  });

  describe('getFormattedWeeklyHours', () => {
    it('devuelve las horas semanales equivalentes', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setAnnualHours('2080');
      });

      expect(result.current.getFormattedWeeklyHours()).toBe('40');
    });

    it('devuelve cadena vacía si no hay valor', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setAnnualHours('');
      });

      expect(result.current.getFormattedWeeklyHours()).toBe('');
    });
  });

  describe('isValid', () => {
    it('devuelve true con configuración válida', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setAnnualHours('2000');
      });

      expect(result.current.isValid()).toBe(true);
    });

    it('devuelve false con campo vacío', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setAnnualHours('');
      });

      expect(result.current.isValid()).toBe(false);
    });

    it('devuelve false con error', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setAnnualHours('abc');
      });

      expect(result.current.isValid()).toBe(false);
    });
  });

  describe('flujo completo', () => {
    it('permite calcular desde semanal y luego modificar manualmente', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      // Calcular desde semanal
      act(() => {
        result.current.setWeeklyHours('40');
      });

      act(() => {
        result.current.applyWeeklyCalculation();
      });

      expect(result.current.annualHours?.getValue()).toBe(2080);

      // Modificar manualmente
      act(() => {
        result.current.setAnnualHours('2000');
      });

      expect(result.current.annualHours?.getValue()).toBe(2000);
    });

    it('permite resetear después de configurar', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setAnnualHours('2000');
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.isDefault).toBe(true);
      expect(result.current.annualHours?.getValue()).toBe(
        ANNUAL_CONTRACT_HOURS_CONSTRAINTS.DEFAULT
      );
    });
  });

  describe('casos de uso reales', () => {
    it('maneja jornada estándar 40h/semana', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setWeeklyHours('40');
      });

      act(() => {
        result.current.applyWeeklyCalculation();
      });

      expect(result.current.annualHours?.getValue()).toBe(2080);
      expect(result.current.isValid()).toBe(true);
      expect(result.current.warning?.type).toBe(WarningType.NONE);
    });

    it('maneja jornada reducida 37.5h/semana', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      act(() => {
        result.current.setWeeklyHours('37.5');
      });

      act(() => {
        result.current.applyWeeklyCalculation();
      });

      expect(result.current.annualHours?.getValue()).toBe(1950);
      expect(result.current.isValid()).toBe(true);
    });

    it('maneja jornada parcial con advertencia', () => {
      const { result } = renderHook(() => useAnnualContractHours());

      // 15h/semana = 780h/año (< WARNING_LOW de 1000)
      act(() => {
        result.current.setWeeklyHours('15');
      });

      act(() => {
        result.current.applyWeeklyCalculation();
      });

      expect(result.current.annualHours?.getValue()).toBe(780);
      expect(result.current.warning?.type).toBe(WarningType.UNUSUALLY_LOW);
    });
  });
});
