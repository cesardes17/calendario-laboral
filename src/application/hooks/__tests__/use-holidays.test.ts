import { renderHook, act } from '@testing-library/react';
import { useHolidays } from '../use-holidays';
import { Holiday } from '@/src/core/domain/holiday';
import { Year } from '@/src/core/domain/year';

describe('useHolidays', () => {
  const year2025 = Year.create(2025).getValue();
  const year2024 = Year.create(2024).getValue();

  const createHoliday = (day: number, month: number, name?: string) => {
    return Holiday.create({
      date: new Date(2025, month, day),
      name,
    }).getValue();
  };

  describe('initialization', () => {
    it('should initialize with empty holidays', () => {
      const { result } = renderHook(() => useHolidays(year2025));

      expect(result.current.holidays).toHaveLength(0);
      expect(result.current.error).toBeNull();
      expect(result.current.getCount()).toBe(0);
    });

    it('should work without year initially', () => {
      const { result } = renderHook(() => useHolidays(null));

      expect(result.current.holidays).toHaveLength(0);
      expect(result.current.error).toBeNull();
    });
  });

  describe('addHoliday', () => {
    it('should add a holiday successfully', () => {
      const { result } = renderHook(() => useHolidays(year2025));
      const holiday = createHoliday(1, 0, 'Año Nuevo');

      act(() => {
        const success = result.current.addHoliday(holiday);
        expect(success).toBe(true);
      });

      expect(result.current.holidays).toHaveLength(1);
      expect(result.current.holidays[0]).toBe(holiday);
      expect(result.current.error).toBeNull();
    });

    it('should add multiple holidays', () => {
      const { result } = renderHook(() => useHolidays(year2025));
      const holiday1 = createHoliday(1, 0, 'Año Nuevo');
      const holiday2 = createHoliday(6, 0, 'Reyes Magos');

      act(() => {
        result.current.addHoliday(holiday1);
      });

      act(() => {
        result.current.addHoliday(holiday2);
      });

      expect(result.current.holidays).toHaveLength(2);
      expect(result.current.getCount()).toBe(2);
    });

    it('should sort holidays automatically', () => {
      const { result } = renderHook(() => useHolidays(year2025));
      const holiday1 = createHoliday(6, 0); // Jan 6
      const holiday2 = createHoliday(1, 0); // Jan 1

      act(() => {
        result.current.addHoliday(holiday1);
      });

      act(() => {
        result.current.addHoliday(holiday2);
      });

      expect(result.current.holidays[0].getDayOfMonth()).toBe(1);
      expect(result.current.holidays[1].getDayOfMonth()).toBe(6);
    });

    it('should fail when adding duplicate', () => {
      const { result } = renderHook(() => useHolidays(year2025));
      const holiday1 = createHoliday(1, 0, 'Año Nuevo');
      const holiday2 = createHoliday(1, 0, 'New Year');

      act(() => {
        result.current.addHoliday(holiday1);
      });

      let success: boolean;
      act(() => {
        success = result.current.addHoliday(holiday2);
      });

      expect(success!).toBe(false);
      expect(result.current.holidays).toHaveLength(1);
      expect(result.current.error).toContain('Ya existe un festivo');
    });

    it('should fail when year is null', () => {
      const { result } = renderHook(() => useHolidays(null));
      const holiday = createHoliday(1, 0);

      act(() => {
        const success = result.current.addHoliday(holiday);
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe('Debe seleccionar un año primero');
    });

    it('should fail when holiday is in wrong year', () => {
      const { result } = renderHook(() => useHolidays(year2025));
      const holiday2024 = Holiday.create({
        date: new Date(2024, 0, 1),
      }).getValue();

      act(() => {
        const success = result.current.addHoliday(holiday2024);
        expect(success).toBe(false);
      });

      expect(result.current.error).toContain('debe estar en el año 2025');
    });
  });

  describe('removeHoliday', () => {
    it('should remove a holiday successfully', () => {
      const { result } = renderHook(() => useHolidays(year2025));
      const holiday = createHoliday(1, 0, 'Año Nuevo');

      act(() => {
        result.current.addHoliday(holiday);
      });

      let success: boolean;
      act(() => {
        success = result.current.removeHoliday(new Date(2025, 0, 1));
      });

      expect(success!).toBe(true);
      expect(result.current.holidays).toHaveLength(0);
      expect(result.current.error).toBeNull();
    });

    it('should remove correct holiday from multiple', () => {
      const { result } = renderHook(() => useHolidays(year2025));
      const holiday1 = createHoliday(1, 0);
      const holiday2 = createHoliday(6, 0);

      act(() => {
        result.current.addHoliday(holiday1);
        result.current.addHoliday(holiday2);
        result.current.removeHoliday(new Date(2025, 0, 1));
      });

      expect(result.current.holidays).toHaveLength(1);
      expect(result.current.holidays[0].getDayOfMonth()).toBe(6);
    });

    it('should fail when holiday not found', () => {
      const { result } = renderHook(() => useHolidays(year2025));

      act(() => {
        const success = result.current.removeHoliday(new Date(2025, 0, 1));
        expect(success).toBe(false);
      });

      expect(result.current.error).toContain('No se encontró el festivo');
    });
  });

  describe('updateHoliday', () => {
    it('should update a holiday successfully', () => {
      const { result } = renderHook(() => useHolidays(year2025));
      const holiday = createHoliday(1, 0, 'Año Nuevo');

      act(() => {
        result.current.addHoliday(holiday);
      });

      const updated = createHoliday(1, 0, 'New Year');

      act(() => {
        const success = result.current.updateHoliday(
          new Date(2025, 0, 1),
          updated
        );
        expect(success).toBe(true);
      });

      expect(result.current.holidays).toHaveLength(1);
      expect(result.current.holidays[0].name).toBe('New Year');
      expect(result.current.error).toBeNull();
    });

    it('should allow changing the date', () => {
      const { result } = renderHook(() => useHolidays(year2025));
      const holiday = createHoliday(1, 0);

      act(() => {
        result.current.addHoliday(holiday);
      });

      const updated = createHoliday(7, 0);

      act(() => {
        result.current.updateHoliday(new Date(2025, 0, 1), updated);
      });

      expect(result.current.holidays[0].getDayOfMonth()).toBe(7);
    });

    it('should fail when year is null', () => {
      const { result } = renderHook(() => useHolidays(null));
      const updated = createHoliday(1, 0);

      act(() => {
        const success = result.current.updateHoliday(
          new Date(2025, 0, 1),
          updated
        );
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe('Debe seleccionar un año primero');
    });

    it('should fail when holiday not found', () => {
      const { result } = renderHook(() => useHolidays(year2025));
      const updated = createHoliday(1, 0);

      act(() => {
        const success = result.current.updateHoliday(
          new Date(2025, 0, 1),
          updated
        );
        expect(success).toBe(false);
      });

      expect(result.current.error).toContain('No se encontró el festivo');
    });
  });

  describe('error handling', () => {
    it('should set error on failure', () => {
      const { result } = renderHook(() => useHolidays(year2025));
      const holiday = createHoliday(1, 0);

      act(() => {
        result.current.addHoliday(holiday);
      });

      act(() => {
        result.current.addHoliday(holiday); // Duplicate
      });

      expect(result.current.error).not.toBeNull();
    });

    it('should clear error', () => {
      const { result } = renderHook(() => useHolidays(year2025));
      const holiday = createHoliday(1, 0);

      act(() => {
        result.current.addHoliday(holiday);
      });

      act(() => {
        result.current.addHoliday(holiday); // Duplicate
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should clear error on successful operation', () => {
      const { result } = renderHook(() => useHolidays(year2025));
      const holiday1 = createHoliday(1, 0);
      const holiday2 = createHoliday(6, 0);

      act(() => {
        result.current.addHoliday(holiday1);
      });

      act(() => {
        result.current.addHoliday(holiday1); // Set error
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.addHoliday(holiday2); // Success should clear error
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('query methods', () => {
    it('should count holidays correctly', () => {
      const { result } = renderHook(() => useHolidays(year2025));

      act(() => {
        result.current.addHoliday(createHoliday(1, 0));
      });

      act(() => {
        result.current.addHoliday(createHoliday(6, 0));
      });

      act(() => {
        result.current.addHoliday(createHoliday(19, 2));
      });

      expect(result.current.getCount()).toBe(3);
    });

    it('should check if date is a holiday', () => {
      const { result } = renderHook(() => useHolidays(year2025));

      act(() => {
        result.current.addHoliday(createHoliday(1, 0));
      });

      expect(result.current.isHoliday(new Date(2025, 0, 1))).toBe(true);
      expect(result.current.isHoliday(new Date(2025, 0, 2))).toBe(false);
    });

    it('should find holiday by date', () => {
      const { result } = renderHook(() => useHolidays(year2025));
      const holiday = createHoliday(1, 0, 'Año Nuevo');

      act(() => {
        result.current.addHoliday(holiday);
      });

      const found = result.current.findByDate(new Date(2025, 0, 1));
      expect(found).toBeDefined();
      expect(found?.name).toBe('Año Nuevo');
    });
  });

  describe('reset', () => {
    it('should reset all holidays and errors', () => {
      const { result } = renderHook(() => useHolidays(year2025));

      act(() => {
        result.current.addHoliday(createHoliday(1, 0));
      });

      act(() => {
        result.current.addHoliday(createHoliday(6, 0));
      });

      act(() => {
        result.current.addHoliday(createHoliday(1, 0)); // Set error
      });

      expect(result.current.holidays).toHaveLength(2);
      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.reset();
      });

      expect(result.current.holidays).toHaveLength(0);
      expect(result.current.error).toBeNull();
    });
  });
});
