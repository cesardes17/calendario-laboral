/**
 * Apply Weekly Cycle to Days Use Case Tests (HU-021)
 *
 * Tests for the weekly cycle application use case.
 */

import { ApplyWeeklyCycleToDaysUseCase } from '../applyWeeklyCycleToDays.usecase';
import { WorkCycle, CalendarDay } from '../../domain';
import { createDate } from '../../../infrastructure/utils/dateUtils';

describe('ApplyWeeklyCycleToDaysUseCase', () => {
  let useCase: ApplyWeeklyCycleToDaysUseCase;

  beforeEach(() => {
    useCase = new ApplyWeeklyCycleToDaysUseCase();
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
    it('should fail if work cycle is not in WEEKLY mode', () => {
      const workCycleResult = WorkCycle.createParts([{ workDays: 6, restDays: 3 }]);
      const workCycle = workCycleResult.getValue();

      const days = [createMockDay(2025, 1, 1)];

      const result = useCase.execute({ days, workCycle });

      expect(result.isSuccess()).toBe(false);
      expect(result.errorValue()).toContain('WEEKLY');
    });

    it('should apply Mon-Fri work pattern correctly (HU-021 Example 1)', () => {
      // Mask: [T, T, T, T, T, F, F] = Mon-Fri work, Sat-Sun rest
      const workCycleResult = WorkCycle.createWeekly([true, true, true, true, true, false, false]);
      const workCycle = workCycleResult.getValue();

      // January 1, 2025 = Wednesday
      const days = [
        createMockDay(2025, 1, 1), // Wed - should be Trabajo
        createMockDay(2025, 1, 2), // Thu - should be Trabajo
        createMockDay(2025, 1, 3), // Fri - should be Trabajo
        createMockDay(2025, 1, 4), // Sat - should be Descanso
        createMockDay(2025, 1, 5), // Sun - should be Descanso
        createMockDay(2025, 1, 6), // Mon - should be Trabajo
      ];

      const result = useCase.execute({ days, workCycle });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.workDaysMarked).toBe(4); // Wed, Thu, Fri, Mon
      expect(output.restDaysMarked).toBe(2); // Sat, Sun
      expect(output.totalDaysProcessed).toBe(6);

      expect(days[0].estado).toBe('Trabajo'); // Wed
      expect(days[1].estado).toBe('Trabajo'); // Thu
      expect(days[2].estado).toBe('Trabajo'); // Fri
      expect(days[3].estado).toBe('Descanso'); // Sat
      expect(days[4].estado).toBe('Descanso'); // Sun
      expect(days[5].estado).toBe('Trabajo'); // Mon
    });

    it('should apply pattern starting from contract start date (HU-021 Example 2)', () => {
      // Mask: [T, T, T, T, T, F, F] = Mon-Fri work, Sat-Sun rest
      const workCycleResult = WorkCycle.createWeekly([true, true, true, true, true, false, false]);
      const workCycle = workCycleResult.getValue();

      // June 6, 2025 = Friday
      const days = [
        createMockDay(2025, 1, 1), // Jan 1 - NoContratado
        createMockDay(2025, 6, 5), // Jun 5 Thu - NoContratado
        createMockDay(2025, 6, 6), // Jun 6 Fri - should be Trabajo (cycle day 1)
        createMockDay(2025, 6, 7), // Jun 7 Sat - should be Descanso
        createMockDay(2025, 6, 8), // Jun 8 Sun - should be Descanso
        createMockDay(2025, 6, 9), // Jun 9 Mon - should be Trabajo
      ];

      // Mark first two days as NoContratado (simulate HU-020)
      days[0].estado = 'NoContratado';
      days[1].estado = 'NoContratado';

      const result = useCase.execute({ days, workCycle });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.workDaysMarked).toBe(2); // Jun 6 Fri, Jun 9 Mon
      expect(output.restDaysMarked).toBe(2); // Jun 7 Sat, Jun 8 Sun
      expect(output.totalDaysProcessed).toBe(4); // Excludes 2 NoContratado days

      expect(days[0].estado).toBe('NoContratado'); // Should remain NoContratado
      expect(days[1].estado).toBe('NoContratado'); // Should remain NoContratado
      expect(days[2].estado).toBe('Trabajo'); // Jun 6 Fri
      expect(days[3].estado).toBe('Descanso'); // Jun 7 Sat
      expect(days[4].estado).toBe('Descanso'); // Jun 8 Sun
      expect(days[5].estado).toBe('Trabajo'); // Jun 9 Mon
    });

    it('should never override NoContratado days', () => {
      const workCycleResult = WorkCycle.createWeekly([true, true, true, true, true, true, true]);
      const workCycle = workCycleResult.getValue();

      const days = [
        createMockDay(2025, 1, 1),
        createMockDay(2025, 1, 2),
        createMockDay(2025, 1, 3),
      ];

      // Mark middle day as NoContratado
      days[1].estado = 'NoContratado';

      const result = useCase.execute({ days, workCycle });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.workDaysMarked).toBe(2); // Only days 1 and 3
      expect(output.totalDaysProcessed).toBe(2); // Excludes NoContratado day

      expect(days[0].estado).toBe('Trabajo');
      expect(days[1].estado).toBe('NoContratado'); // Should NOT be overridden
      expect(days[2].estado).toBe('Trabajo');
    });

    it('should apply custom pattern: work 4 days, rest 3 days (as weekly)', () => {
      // Mask: [T, T, T, T, F, F, F] = Mon-Thu work, Fri-Sun rest
      const workCycleResult = WorkCycle.createWeekly([true, true, true, true, false, false, false]);
      const workCycle = workCycleResult.getValue();

      // Start from Monday (Jan 6, 2025)
      const days = [
        createMockDay(2025, 1, 6), // Mon - Trabajo
        createMockDay(2025, 1, 7), // Tue - Trabajo
        createMockDay(2025, 1, 8), // Wed - Trabajo
        createMockDay(2025, 1, 9), // Thu - Trabajo
        createMockDay(2025, 1, 10), // Fri - Descanso
        createMockDay(2025, 1, 11), // Sat - Descanso
        createMockDay(2025, 1, 12), // Sun - Descanso
      ];

      const result = useCase.execute({ days, workCycle });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.workDaysMarked).toBe(4);
      expect(output.restDaysMarked).toBe(3);

      expect(days[0].estado).toBe('Trabajo');
      expect(days[1].estado).toBe('Trabajo');
      expect(days[2].estado).toBe('Trabajo');
      expect(days[3].estado).toBe('Trabajo');
      expect(days[4].estado).toBe('Descanso');
      expect(days[5].estado).toBe('Descanso');
      expect(days[6].estado).toBe('Descanso');
    });

    it('should apply pattern with only Sunday as rest day', () => {
      // Mask: [T, T, T, T, T, T, F] = Mon-Sat work, Sun rest
      const workCycleResult = WorkCycle.createWeekly([true, true, true, true, true, true, false]);
      const workCycle = workCycleResult.getValue();

      const days = [
        createMockDay(2025, 1, 6), // Mon - Trabajo
        createMockDay(2025, 1, 7), // Tue - Trabajo
        createMockDay(2025, 1, 8), // Wed - Trabajo
        createMockDay(2025, 1, 9), // Thu - Trabajo
        createMockDay(2025, 1, 10), // Fri - Trabajo
        createMockDay(2025, 1, 11), // Sat - Trabajo
        createMockDay(2025, 1, 12), // Sun - Descanso
      ];

      const result = useCase.execute({ days, workCycle });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.workDaysMarked).toBe(6);
      expect(output.restDaysMarked).toBe(1);

      expect(days[0].estado).toBe('Trabajo');
      expect(days[1].estado).toBe('Trabajo');
      expect(days[2].estado).toBe('Trabajo');
      expect(days[3].estado).toBe('Trabajo');
      expect(days[4].estado).toBe('Trabajo');
      expect(days[5].estado).toBe('Trabajo');
      expect(days[6].estado).toBe('Descanso');
    });

    it('should correctly convert Sunday (day 0) to mask index 6', () => {
      // Mask: Work all days except Sunday
      const workCycleResult = WorkCycle.createWeekly([true, true, true, true, true, true, false]);
      const workCycle = workCycleResult.getValue();

      // January 5, 2025 = Sunday
      const days = [createMockDay(2025, 1, 5)]; // Sun

      const result = useCase.execute({ days, workCycle });

      expect(result.isSuccess()).toBe(true);
      expect(days[0].estado).toBe('Descanso'); // Sunday should be rest
    });

    it('should correctly convert Monday (day 1) to mask index 0', () => {
      // Mask: Rest on Monday only
      const workCycleResult = WorkCycle.createWeekly([false, true, true, true, true, true, true]);
      const workCycle = workCycleResult.getValue();

      // January 6, 2025 = Monday
      const days = [createMockDay(2025, 1, 6)]; // Mon

      const result = useCase.execute({ days, workCycle });

      expect(result.isSuccess()).toBe(true);
      expect(days[0].estado).toBe('Descanso'); // Monday should be rest
    });

    it('should correctly convert Saturday (day 6) to mask index 5', () => {
      // Mask: Rest on Saturday only
      const workCycleResult = WorkCycle.createWeekly([true, true, true, true, true, false, true]);
      const workCycle = workCycleResult.getValue();

      // January 4, 2025 = Saturday
      const days = [createMockDay(2025, 1, 4)]; // Sat

      const result = useCase.execute({ days, workCycle });

      expect(result.isSuccess()).toBe(true);
      expect(days[0].estado).toBe('Descanso'); // Saturday should be rest
    });

    it('should process entire year correctly', () => {
      const workCycleResult = WorkCycle.createWeekly([true, true, true, true, true, false, false]);
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

      // 2025 has 52 full weeks + 1 day (starts on Wednesday, ends on Wednesday)
      // So we should have approximately 260 work days (52 weeks * 5 days/week)
      expect(output.workDaysMarked).toBeGreaterThanOrEqual(260);
      expect(output.workDaysMarked).toBeLessThanOrEqual(262);
    });

    it('should handle empty days array', () => {
      const workCycleResult = WorkCycle.createWeekly([true, true, true, true, true, false, false]);
      const workCycle = workCycleResult.getValue();

      const days: CalendarDay[] = [];

      const result = useCase.execute({ days, workCycle });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.workDaysMarked).toBe(0);
      expect(output.restDaysMarked).toBe(0);
      expect(output.totalDaysProcessed).toBe(0);
    });

    it('should handle all days being NoContratado', () => {
      const workCycleResult = WorkCycle.createWeekly([true, true, true, true, true, false, false]);
      const workCycle = workCycleResult.getValue();

      const days = [
        createMockDay(2025, 1, 1),
        createMockDay(2025, 1, 2),
        createMockDay(2025, 1, 3),
      ];

      // Mark all as NoContratado
      days.forEach(day => day.estado = 'NoContratado');

      const result = useCase.execute({ days, workCycle });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.workDaysMarked).toBe(0);
      expect(output.restDaysMarked).toBe(0);
      expect(output.totalDaysProcessed).toBe(0);

      // All should remain NoContratado
      days.forEach(day => expect(day.estado).toBe('NoContratado'));
    });

    it('should apply "maternity pattern": work Mon-Thu and Sun, rest Fri-Sat', () => {
      // Mask from requirements example: [T, T, T, T, F, F, T] = 1111001
      const workCycleResult = WorkCycle.createWeekly([true, true, true, true, false, false, true]);
      const workCycle = workCycleResult.getValue();

      // Start from Monday
      const days = [
        createMockDay(2025, 1, 6), // Mon - Trabajo
        createMockDay(2025, 1, 7), // Tue - Trabajo
        createMockDay(2025, 1, 8), // Wed - Trabajo
        createMockDay(2025, 1, 9), // Thu - Trabajo
        createMockDay(2025, 1, 10), // Fri - Descanso
        createMockDay(2025, 1, 11), // Sat - Descanso
        createMockDay(2025, 1, 12), // Sun - Trabajo
      ];

      const result = useCase.execute({ days, workCycle });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.workDaysMarked).toBe(5); // Mon, Tue, Wed, Thu, Sun
      expect(output.restDaysMarked).toBe(2); // Fri, Sat

      expect(days[0].estado).toBe('Trabajo'); // Mon
      expect(days[1].estado).toBe('Trabajo'); // Tue
      expect(days[2].estado).toBe('Trabajo'); // Wed
      expect(days[3].estado).toBe('Trabajo'); // Thu
      expect(days[4].estado).toBe('Descanso'); // Fri
      expect(days[5].estado).toBe('Descanso'); // Sat
      expect(days[6].estado).toBe('Trabajo'); // Sun
    });
  });
});
