/**
 * Apply Parts Cycle to Days Use Case Tests (HU-022)
 *
 * Tests for the parts-based cycle application use case.
 */

import { ApplyPartsCycleToDaysUseCase } from '../applyPartsCycleToDays.usecase';
import { WorkCycle, CalendarDay, CycleOffset, CycleDayType } from '../../domain';
import { createDate } from '../../../infrastructure/utils/dateUtils';

describe('ApplyPartsCycleToDaysUseCase', () => {
  let useCase: ApplyPartsCycleToDaysUseCase;

  beforeEach(() => {
    useCase = new ApplyPartsCycleToDaysUseCase();
  });

  /**
   * Helper function to create a mock calendar day
   */
  function createMockDay(year: number, month: number, day: number): CalendarDay {
    const fecha = createDate(year, month, day);
    return {
      fecha,
      diaSemana: fecha.getDay(),
      nombreDia: '',
      diaNumero: day,
      mes: month,
      nombreMes: '',
      numeroSemana: 1,
      estado: null,
      horasTrabajadas: 0,
    };
  }

  describe('execute', () => {
    it('should fail if work cycle is not in PARTS mode', () => {
      const workCycleResult = WorkCycle.createWeekly([true, true, true, true, true, false, false]);
      const workCycle = workCycleResult.getValue();

      const days = [createMockDay(2025, 1, 1)];

      const result = useCase.execute({ days, workCycle });

      expect(result.isSuccess()).toBe(false);
      expect(result.errorValue()).toContain('PARTS');
    });

    it('should apply simple 6-3 cycle correctly', () => {
      // Cycle: 6 work days, 3 rest days
      const workCycleResult = WorkCycle.createParts([{ workDays: 6, restDays: 3 }]);
      const workCycle = workCycleResult.getValue();

      const days = Array.from({ length: 18 }, (_, i) => createMockDay(2025, 1, i + 1));

      const result = useCase.execute({ days, workCycle });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.cycleLength).toBe(9); // 6 + 3
      expect(output.workDaysMarked).toBe(12); // 6 + 6 (2 cycles)
      expect(output.restDaysMarked).toBe(6); // 3 + 3 (2 cycles)
      expect(output.totalDaysProcessed).toBe(18);

      // First 6 days should be work
      for (let i = 0; i < 6; i++) {
        expect(days[i].estado).toBe('Trabajo');
        expect(days[i].metadata?.parte).toBe(1);
        expect(days[i].metadata?.diaDentroParte).toBe(i + 1);
        expect(days[i].metadata?.tipoDentroParte).toBe('Trabajo');
      }

      // Next 3 days should be rest
      for (let i = 6; i < 9; i++) {
        expect(days[i].estado).toBe('Descanso');
        expect(days[i].metadata?.parte).toBe(1);
        expect(days[i].metadata?.diaDentroParte).toBe(i - 5); // 1, 2, 3
        expect(days[i].metadata?.tipoDentroParte).toBe('Descanso');
      }

      // Cycle repeats: next 6 work, 3 rest
      for (let i = 9; i < 15; i++) {
        expect(days[i].estado).toBe('Trabajo');
      }
      for (let i = 15; i < 18; i++) {
        expect(days[i].estado).toBe('Descanso');
      }
    });

    it('should apply complex 6-3,6-3,6-3,6-2 cycle correctly (HU-022 example)', () => {
      // Cycle: 4 parts
      const workCycleResult = WorkCycle.createParts([
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 2 },
      ]);
      const workCycle = workCycleResult.getValue();

      // Total cycle length: 9 + 9 + 9 + 8 = 35 days
      const days = Array.from({ length: 35 }, (_, i) => createMockDay(2025, 1, i + 1));

      const result = useCase.execute({ days, workCycle });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.cycleLength).toBe(35);
      expect(output.workDaysMarked).toBe(24); // 6*4
      expect(output.restDaysMarked).toBe(11); // 3+3+3+2
      expect(output.totalDaysProcessed).toBe(35);

      // Part 1: days 1-9 (6 work, 3 rest)
      for (let i = 0; i < 6; i++) {
        expect(days[i].estado).toBe('Trabajo');
        expect(days[i].metadata?.parte).toBe(1);
      }
      for (let i = 6; i < 9; i++) {
        expect(days[i].estado).toBe('Descanso');
        expect(days[i].metadata?.parte).toBe(1);
      }

      // Part 2: days 10-18 (6 work, 3 rest)
      for (let i = 9; i < 15; i++) {
        expect(days[i].estado).toBe('Trabajo');
        expect(days[i].metadata?.parte).toBe(2);
      }
      for (let i = 15; i < 18; i++) {
        expect(days[i].estado).toBe('Descanso');
        expect(days[i].metadata?.parte).toBe(2);
      }

      // Part 3: days 19-27 (6 work, 3 rest)
      for (let i = 18; i < 24; i++) {
        expect(days[i].estado).toBe('Trabajo');
        expect(days[i].metadata?.parte).toBe(3);
      }
      for (let i = 24; i < 27; i++) {
        expect(days[i].estado).toBe('Descanso');
        expect(days[i].metadata?.parte).toBe(3);
      }

      // Part 4: days 28-35 (6 work, 2 rest)
      for (let i = 27; i < 33; i++) {
        expect(days[i].estado).toBe('Trabajo');
        expect(days[i].metadata?.parte).toBe(4);
      }
      for (let i = 33; i < 35; i++) {
        expect(days[i].estado).toBe('Descanso');
        expect(days[i].metadata?.parte).toBe(4);
      }
    });

    it('should apply cycle with offset (parte 3, día 4 trabajo)', () => {
      // Cycle: 6-3, 6-3, 6-3, 6-2
      const workCycleResult = WorkCycle.createParts([
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 2 },
      ]);
      const workCycle = workCycleResult.getValue();

      // Offset: Part 3, day 4 of work
      // Index calculation: Part 1 (9 days) + Part 2 (9 days) + 3 work days = index 21
      const offsetResult = CycleOffset.create(3, 4, CycleDayType.WORK);
      const cycleOffset = offsetResult.getValue();

      const days = Array.from({ length: 10 }, (_, i) => createMockDay(2025, 1, i + 1));

      const result = useCase.execute({ days, workCycle, cycleOffset });

      expect(result.isSuccess()).toBe(true);

      // Day 1 = index 21 (Part 3, day 4 work)
      expect(days[0].estado).toBe('Trabajo');
      expect(days[0].metadata?.parte).toBe(3);
      expect(days[0].metadata?.diaDentroParte).toBe(4);

      // Day 2 = index 22 (Part 3, day 5 work)
      expect(days[1].estado).toBe('Trabajo');
      expect(days[1].metadata?.parte).toBe(3);
      expect(days[1].metadata?.diaDentroParte).toBe(5);

      // Day 3 = index 23 (Part 3, day 6 work)
      expect(days[2].estado).toBe('Trabajo');
      expect(days[2].metadata?.parte).toBe(3);
      expect(days[2].metadata?.diaDentroParte).toBe(6);

      // Day 4 = index 24 (Part 3, day 1 rest)
      expect(days[3].estado).toBe('Descanso');
      expect(days[3].metadata?.parte).toBe(3);
      expect(days[3].metadata?.diaDentroParte).toBe(1);
      expect(days[3].metadata?.tipoDentroParte).toBe('Descanso');
    });

    it('should never override NoContratado days', () => {
      const workCycleResult = WorkCycle.createParts([{ workDays: 6, restDays: 3 }]);
      const workCycle = workCycleResult.getValue();

      const days = [
        createMockDay(2025, 1, 1),
        createMockDay(2025, 1, 2),
        createMockDay(2025, 1, 3),
        createMockDay(2025, 1, 4),
      ];

      // Mark days 2 and 3 as NoContratado
      days[1].estado = 'NoContratado';
      days[2].estado = 'NoContratado';

      const result = useCase.execute({ days, workCycle });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.totalDaysProcessed).toBe(2); // Only days 1 and 4

      expect(days[0].estado).toBe('Trabajo');
      expect(days[1].estado).toBe('NoContratado'); // Should NOT be overridden
      expect(days[2].estado).toBe('NoContratado'); // Should NOT be overridden
      expect(days[3].estado).toBe('Trabajo');
    });

    it('should handle cycle wrapping at end of sequence', () => {
      // Simple 4-2 cycle (6 days total)
      const workCycleResult = WorkCycle.createParts([{ workDays: 4, restDays: 2 }]);
      const workCycle = workCycleResult.getValue();

      // Generate 18 days (3 complete cycles)
      const days = Array.from({ length: 18 }, (_, i) => createMockDay(2025, 1, i + 1));

      const result = useCase.execute({ days, workCycle });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.cycleLength).toBe(6);
      expect(output.workDaysMarked).toBe(12); // 4*3
      expect(output.restDaysMarked).toBe(6); // 2*3

      // Check pattern repeats correctly
      for (let cycle = 0; cycle < 3; cycle++) {
        const base = cycle * 6;
        // 4 work days
        for (let i = 0; i < 4; i++) {
          expect(days[base + i].estado).toBe('Trabajo');
        }
        // 2 rest days
        for (let i = 4; i < 6; i++) {
          expect(days[base + i].estado).toBe('Descanso');
        }
      }
    });

    it('should save correct metadata for each day', () => {
      const workCycleResult = WorkCycle.createParts([
        { workDays: 3, restDays: 2 },
        { workDays: 4, restDays: 1 },
      ]);
      const workCycle = workCycleResult.getValue();

      const days = Array.from({ length: 10 }, (_, i) => createMockDay(2025, 1, i + 1));

      const result = useCase.execute({ days, workCycle });

      expect(result.isSuccess()).toBe(true);

      // Part 1: 3 work + 2 rest
      expect(days[0].metadata).toEqual({ parte: 1, diaDentroParte: 1, tipoDentroParte: 'Trabajo' });
      expect(days[1].metadata).toEqual({ parte: 1, diaDentroParte: 2, tipoDentroParte: 'Trabajo' });
      expect(days[2].metadata).toEqual({ parte: 1, diaDentroParte: 3, tipoDentroParte: 'Trabajo' });
      expect(days[3].metadata).toEqual({ parte: 1, diaDentroParte: 1, tipoDentroParte: 'Descanso' });
      expect(days[4].metadata).toEqual({ parte: 1, diaDentroParte: 2, tipoDentroParte: 'Descanso' });

      // Part 2: 4 work + 1 rest
      expect(days[5].metadata).toEqual({ parte: 2, diaDentroParte: 1, tipoDentroParte: 'Trabajo' });
      expect(days[6].metadata).toEqual({ parte: 2, diaDentroParte: 2, tipoDentroParte: 'Trabajo' });
      expect(days[7].metadata).toEqual({ parte: 2, diaDentroParte: 3, tipoDentroParte: 'Trabajo' });
      expect(days[8].metadata).toEqual({ parte: 2, diaDentroParte: 4, tipoDentroParte: 'Trabajo' });
      expect(days[9].metadata).toEqual({ parte: 2, diaDentroParte: 1, tipoDentroParte: 'Descanso' });
    });

    it('should handle empty days array', () => {
      const workCycleResult = WorkCycle.createParts([{ workDays: 6, restDays: 3 }]);
      const workCycle = workCycleResult.getValue();

      const days: CalendarDay[] = [];

      const result = useCase.execute({ days, workCycle });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.workDaysMarked).toBe(0);
      expect(output.restDaysMarked).toBe(0);
      expect(output.totalDaysProcessed).toBe(0);
    });

    it('should handle offset with REST day type', () => {
      const workCycleResult = WorkCycle.createParts([{ workDays: 6, restDays: 3 }]);
      const workCycle = workCycleResult.getValue();

      // Start at rest day 2
      const offsetResult = CycleOffset.create(1, 2, CycleDayType.REST);
      const cycleOffset = offsetResult.getValue();

      const days = Array.from({ length: 5 }, (_, i) => createMockDay(2025, 1, i + 1));

      const result = useCase.execute({ days, workCycle, cycleOffset });

      expect(result.isSuccess()).toBe(true);

      // Day 1 = rest day 2
      expect(days[0].estado).toBe('Descanso');
      expect(days[0].metadata?.diaDentroParte).toBe(2);

      // Day 2 = rest day 3
      expect(days[1].estado).toBe('Descanso');
      expect(days[1].metadata?.diaDentroParte).toBe(3);

      // Day 3 = work day 1 (cycle wraps)
      expect(days[2].estado).toBe('Trabajo');
      expect(days[2].metadata?.diaDentroParte).toBe(1);
    });

    it('should handle multiple parts with different lengths', () => {
      const workCycleResult = WorkCycle.createParts([
        { workDays: 5, restDays: 2 },
        { workDays: 3, restDays: 4 },
        { workDays: 7, restDays: 1 },
      ]);
      const workCycle = workCycleResult.getValue();

      // Total: 7 + 7 + 8 = 22 days
      const days = Array.from({ length: 22 }, (_, i) => createMockDay(2025, 1, i + 1));

      const result = useCase.execute({ days, workCycle });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.cycleLength).toBe(22);
      expect(output.workDaysMarked).toBe(15); // 5+3+7
      expect(output.restDaysMarked).toBe(7); // 2+4+1
    });

    it('should apply pattern across full year correctly', () => {
      const workCycleResult = WorkCycle.createParts([{ workDays: 6, restDays: 3 }]);
      const workCycle = workCycleResult.getValue();

      // Generate full year of 2025 (365 days)
      const days: CalendarDay[] = [];
      for (let month = 1; month <= 12; month++) {
        const daysInMonth = new Date(2025, month, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          days.push(createMockDay(2025, month, day));
        }
      }

      const result = useCase.execute({ days, workCycle });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.totalDaysProcessed).toBe(365);
      expect(output.workDaysMarked + output.restDaysMarked).toBe(365);

      // 365 days / 9 days per cycle = 40.55 cycles
      // So: 40 complete cycles + 5 days
      // 40 cycles: 40*6=240 work days, 40*3=120 rest days
      // Remaining 5 days are work days (6 work days in cycle)
      expect(output.workDaysMarked).toBe(245); // 240 + 5
      expect(output.restDaysMarked).toBe(120);
    });
  });
});
