/**
 * @file useHolidayPolicy.test.tsx
 * @description Tests para el hook useHolidayPolicy
 */

import { describe, it, expect } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useHolidayPolicy } from '../useHolidayPolicy';
import { HolidayPolicyType, DEFAULT_HOLIDAY_POLICY } from '@/src/core/domain/holidayPolicy';

describe('useHolidayPolicy', () => {
  describe('inicialización', () => {
    it('inicializa con política por defecto (TRABAJAR_FESTIVOS)', () => {
      const { result } = renderHook(() => useHolidayPolicy());

      expect(result.current.holidayPolicy.type).toBe(DEFAULT_HOLIDAY_POLICY);
      expect(result.current.holidayPolicy.type).toBe(HolidayPolicyType.TRABAJAR_FESTIVOS);
      expect(result.current.canWorkHolidays).toBe(true);
      expect(result.current.respectsHolidays).toBe(false);
    });

    it('inicializa con política personalizada RESPETAR_FESTIVOS', () => {
      const { result } = renderHook(() =>
        useHolidayPolicy(HolidayPolicyType.RESPETAR_FESTIVOS)
      );

      expect(result.current.holidayPolicy.type).toBe(HolidayPolicyType.RESPETAR_FESTIVOS);
      expect(result.current.respectsHolidays).toBe(true);
      expect(result.current.canWorkHolidays).toBe(false);
    });

    it('inicializa con política personalizada TRABAJAR_FESTIVOS', () => {
      const { result } = renderHook(() =>
        useHolidayPolicy(HolidayPolicyType.TRABAJAR_FESTIVOS)
      );

      expect(result.current.holidayPolicy.type).toBe(HolidayPolicyType.TRABAJAR_FESTIVOS);
      expect(result.current.canWorkHolidays).toBe(true);
      expect(result.current.respectsHolidays).toBe(false);
    });
  });

  describe('setPolicy', () => {
    it('establece correctamente la política RESPETAR_FESTIVOS', () => {
      const { result } = renderHook(() => useHolidayPolicy());

      act(() => {
        result.current.setPolicy(HolidayPolicyType.RESPETAR_FESTIVOS);
      });

      expect(result.current.holidayPolicy.type).toBe(HolidayPolicyType.RESPETAR_FESTIVOS);
      expect(result.current.respectsHolidays).toBe(true);
      expect(result.current.canWorkHolidays).toBe(false);
    });

    it('establece correctamente la política TRABAJAR_FESTIVOS', () => {
      const { result } = renderHook(() =>
        useHolidayPolicy(HolidayPolicyType.RESPETAR_FESTIVOS)
      );

      act(() => {
        result.current.setPolicy(HolidayPolicyType.TRABAJAR_FESTIVOS);
      });

      expect(result.current.holidayPolicy.type).toBe(HolidayPolicyType.TRABAJAR_FESTIVOS);
      expect(result.current.canWorkHolidays).toBe(true);
      expect(result.current.respectsHolidays).toBe(false);
    });
  });

  describe('togglePolicy', () => {
    it('alterna de TRABAJAR_FESTIVOS a RESPETAR_FESTIVOS', () => {
      const { result } = renderHook(() => useHolidayPolicy());

      // Estado inicial: TRABAJAR_FESTIVOS
      expect(result.current.holidayPolicy.type).toBe(HolidayPolicyType.TRABAJAR_FESTIVOS);

      act(() => {
        result.current.togglePolicy();
      });

      // Después del toggle: RESPETAR_FESTIVOS
      expect(result.current.holidayPolicy.type).toBe(HolidayPolicyType.RESPETAR_FESTIVOS);
      expect(result.current.respectsHolidays).toBe(true);
    });

    it('alterna de RESPETAR_FESTIVOS a TRABAJAR_FESTIVOS', () => {
      const { result } = renderHook(() =>
        useHolidayPolicy(HolidayPolicyType.RESPETAR_FESTIVOS)
      );

      // Estado inicial: RESPETAR_FESTIVOS
      expect(result.current.holidayPolicy.type).toBe(HolidayPolicyType.RESPETAR_FESTIVOS);

      act(() => {
        result.current.togglePolicy();
      });

      // Después del toggle: TRABAJAR_FESTIVOS
      expect(result.current.holidayPolicy.type).toBe(HolidayPolicyType.TRABAJAR_FESTIVOS);
      expect(result.current.canWorkHolidays).toBe(true);
    });

    it('permite múltiples toggles consecutivos', () => {
      const { result } = renderHook(() => useHolidayPolicy());

      expect(result.current.holidayPolicy.type).toBe(HolidayPolicyType.TRABAJAR_FESTIVOS);

      act(() => {
        result.current.togglePolicy();
      });
      expect(result.current.holidayPolicy.type).toBe(HolidayPolicyType.RESPETAR_FESTIVOS);

      act(() => {
        result.current.togglePolicy();
      });
      expect(result.current.holidayPolicy.type).toBe(HolidayPolicyType.TRABAJAR_FESTIVOS);

      act(() => {
        result.current.togglePolicy();
      });
      expect(result.current.holidayPolicy.type).toBe(HolidayPolicyType.RESPETAR_FESTIVOS);
    });
  });

  describe('reset', () => {
    it('resetea a política por defecto (TRABAJAR_FESTIVOS)', () => {
      const { result } = renderHook(() =>
        useHolidayPolicy(HolidayPolicyType.RESPETAR_FESTIVOS)
      );

      // Estado inicial: RESPETAR_FESTIVOS
      expect(result.current.holidayPolicy.type).toBe(HolidayPolicyType.RESPETAR_FESTIVOS);

      act(() => {
        result.current.reset();
      });

      // Después del reset: TRABAJAR_FESTIVOS (default)
      expect(result.current.holidayPolicy.type).toBe(HolidayPolicyType.TRABAJAR_FESTIVOS);
      expect(result.current.holidayPolicy.isDefault()).toBe(true);
    });
  });

  describe('loadFromJSON', () => {
    it('carga correctamente RESPETAR_FESTIVOS desde JSON', () => {
      const { result } = renderHook(() => useHolidayPolicy());

      const json = 'RESPETAR_FESTIVOS';

      let success: boolean = false;
      act(() => {
        success = result.current.loadFromJSON(json);
      });

      expect(success).toBe(true);
      expect(result.current.holidayPolicy.type).toBe(HolidayPolicyType.RESPETAR_FESTIVOS);
    });

    it('carga correctamente TRABAJAR_FESTIVOS desde JSON', () => {
      const { result } = renderHook(() =>
        useHolidayPolicy(HolidayPolicyType.RESPETAR_FESTIVOS)
      );

      const json = 'TRABAJAR_FESTIVOS';

      let success: boolean = false;
      act(() => {
        success = result.current.loadFromJSON(json);
      });

      expect(success).toBe(true);
      expect(result.current.holidayPolicy.type).toBe(HolidayPolicyType.TRABAJAR_FESTIVOS);
    });

    it('retorna false con JSON inválido y mantiene política actual', () => {
      const { result } = renderHook(() => useHolidayPolicy());

      const invalidJson = 'INVALID_POLICY';
      const previousType = result.current.holidayPolicy.type;

      let success: boolean = true;
      act(() => {
        success = result.current.loadFromJSON(invalidJson);
      });

      expect(success).toBe(false);
      // La política no debe cambiar cuando el JSON es inválido
      expect(result.current.holidayPolicy.type).toBe(previousType);
    });
  });

  describe('propiedades derivadas', () => {
    it('respectsHolidays es true cuando la política es RESPETAR_FESTIVOS', () => {
      const { result } = renderHook(() =>
        useHolidayPolicy(HolidayPolicyType.RESPETAR_FESTIVOS)
      );

      expect(result.current.respectsHolidays).toBe(true);
      expect(result.current.holidayPolicy.respectsHolidays()).toBe(true);
    });

    it('canWorkHolidays es true cuando la política es TRABAJAR_FESTIVOS', () => {
      const { result } = renderHook(() =>
        useHolidayPolicy(HolidayPolicyType.TRABAJAR_FESTIVOS)
      );

      expect(result.current.canWorkHolidays).toBe(true);
      expect(result.current.holidayPolicy.canWorkHolidays()).toBe(true);
    });

    it('respectsHolidays y canWorkHolidays son mutuamente excluyentes', () => {
      const { result } = renderHook(() => useHolidayPolicy());

      // Verificar con TRABAJAR_FESTIVOS
      expect(result.current.respectsHolidays).not.toBe(result.current.canWorkHolidays);

      // Cambiar a RESPETAR_FESTIVOS y verificar de nuevo
      act(() => {
        result.current.togglePolicy();
      });

      expect(result.current.respectsHolidays).not.toBe(result.current.canWorkHolidays);
    });
  });

  describe('flujo completo', () => {
    it('permite cambiar política, resetear y cargar desde JSON', () => {
      const { result } = renderHook(() => useHolidayPolicy());

      // Estado inicial
      expect(result.current.holidayPolicy.type).toBe(HolidayPolicyType.TRABAJAR_FESTIVOS);

      // Cambiar política
      act(() => {
        result.current.setPolicy(HolidayPolicyType.RESPETAR_FESTIVOS);
      });
      expect(result.current.holidayPolicy.type).toBe(HolidayPolicyType.RESPETAR_FESTIVOS);

      // Resetear
      act(() => {
        result.current.reset();
      });
      expect(result.current.holidayPolicy.type).toBe(HolidayPolicyType.TRABAJAR_FESTIVOS);

      // Cargar desde JSON
      act(() => {
        result.current.loadFromJSON('RESPETAR_FESTIVOS');
      });
      expect(result.current.holidayPolicy.type).toBe(HolidayPolicyType.RESPETAR_FESTIVOS);
    });
  });
});
