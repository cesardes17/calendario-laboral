/**
 * Calculate Weekly Distribution Use Case Tests (HU-028 / SCRUM-40)
 *
 * Tests for the weekly distribution calculation use case.
 */

import { CalculateWeeklyDistributionUseCase } from '../calculateWeeklyDistribution.usecase';
import { CalendarDay, EstadoDia } from '../../domain';

describe('CalculateWeeklyDistributionUseCase', () => {
  let useCase: CalculateWeeklyDistributionUseCase;

  beforeEach(() => {
    useCase = new CalculateWeeklyDistributionUseCase();
  });

  /**
   * Helper function to create a calendar day with specific estado and weekday
   * @param diaSemana - 0=Sunday, 1=Monday, ..., 6=Saturday
   */
  function createDay(diaSemana: number, estado: EstadoDia | null): CalendarDay {
    // Use a date that matches the desired weekday
    // Jan 1, 2023 is Sunday (0), so we can offset from there
    const baseDate = new Date('2023-01-01'); // Sunday
    baseDate.setDate(baseDate.getDate() + diaSemana);

    return {
      fecha: baseDate,
      diaSemana,
      nombreDia: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][diaSemana],
      diaNumero: baseDate.getDate(),
      mes: baseDate.getMonth() + 1,
      nombreMes: 'Enero',
      numeroSemana: 1,
      estado,
      horasTrabajadas: estado === 'Trabajo' || estado === 'FestivoTrabajado' ? 8 : 0,
      descripcion: undefined,
      metadata: undefined,
    };
  }

  describe('execute', () => {
    describe('Basic counting', () => {
      it('should count worked Mondays correctly', () => {
        const days = [
          createDay(1, 'Trabajo'),    // Monday
          createDay(1, 'Trabajo'),    // Monday
          createDay(1, 'Trabajo'),    // Monday
          createDay(2, 'Trabajo'),    // Tuesday
          createDay(3, 'Descanso'),   // Wednesday - not counted
        ];

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const dist = result.getValue();
        expect(dist.diasPorSemana.lunes).toBe(3);
        expect(dist.diasPorSemana.martes).toBe(1);
        expect(dist.totalDiasTrabajados).toBe(4);
      });

      it('should count all weekdays separately', () => {
        const days = [
          createDay(1, 'Trabajo'),    // Monday
          createDay(2, 'Trabajo'),    // Tuesday
          createDay(3, 'Trabajo'),    // Wednesday
          createDay(4, 'Trabajo'),    // Thursday
          createDay(5, 'Trabajo'),    // Friday
          createDay(6, 'Trabajo'),    // Saturday
          createDay(0, 'Trabajo'),    // Sunday
        ];

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const dist = result.getValue();
        expect(dist.diasPorSemana.lunes).toBe(1);
        expect(dist.diasPorSemana.martes).toBe(1);
        expect(dist.diasPorSemana.miercoles).toBe(1);
        expect(dist.diasPorSemana.jueves).toBe(1);
        expect(dist.diasPorSemana.viernes).toBe(1);
        expect(dist.diasPorSemana.sabado).toBe(1);
        expect(dist.diasPorSemana.domingo).toBe(1);
        expect(dist.totalDiasTrabajados).toBe(7);
      });

      it('should include worked holidays in the count', () => {
        const days = [
          createDay(1, 'Trabajo'),           // Monday - work
          createDay(1, 'FestivoTrabajado'),  // Monday - worked holiday
          createDay(2, 'Trabajo'),           // Tuesday - work
        ];

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const dist = result.getValue();
        expect(dist.diasPorSemana.lunes).toBe(2); // Both Trabajo and FestivoTrabajado
        expect(dist.diasPorSemana.martes).toBe(1);
        expect(dist.totalDiasTrabajados).toBe(3);
      });
    });

    describe('Excluding non-work states', () => {
      it('should not count Descanso days', () => {
        const days = [
          createDay(1, 'Descanso'),   // Monday - rest
          createDay(1, 'Descanso'),   // Monday - rest
          createDay(1, 'Trabajo'),    // Monday - work
        ];

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const dist = result.getValue();
        expect(dist.diasPorSemana.lunes).toBe(1); // Only the Trabajo day
        expect(dist.totalDiasTrabajados).toBe(1);
      });

      it('should not count Vacaciones days', () => {
        const days = [
          createDay(2, 'Vacaciones'), // Tuesday - vacation
          createDay(2, 'Vacaciones'), // Tuesday - vacation
          createDay(2, 'Trabajo'),    // Tuesday - work
        ];

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const dist = result.getValue();
        expect(dist.diasPorSemana.martes).toBe(1); // Only the Trabajo day
        expect(dist.totalDiasTrabajados).toBe(1);
      });

      it('should not count Festivo days', () => {
        const days = [
          createDay(3, 'Festivo'),    // Wednesday - holiday
          createDay(3, 'Festivo'),    // Wednesday - holiday
          createDay(3, 'Trabajo'),    // Wednesday - work
        ];

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const dist = result.getValue();
        expect(dist.diasPorSemana.miercoles).toBe(1); // Only the Trabajo day
        expect(dist.totalDiasTrabajados).toBe(1);
      });

      it('should not count NoContratado days', () => {
        const days = [
          createDay(4, 'NoContratado'), // Thursday - not contracted
          createDay(4, 'NoContratado'), // Thursday - not contracted
          createDay(4, 'Trabajo'),      // Thursday - work
        ];

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const dist = result.getValue();
        expect(dist.diasPorSemana.jueves).toBe(1); // Only the Trabajo day
        expect(dist.totalDiasTrabajados).toBe(1);
      });

      it('should not count days with null state', () => {
        const days = [
          createDay(5, null),         // Friday - null
          createDay(5, null),         // Friday - null
          createDay(5, 'Trabajo'),    // Friday - work
        ];

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const dist = result.getValue();
        expect(dist.diasPorSemana.viernes).toBe(1); // Only the Trabajo day
        expect(dist.totalDiasTrabajados).toBe(1);
      });

      it('should only count Trabajo and FestivoTrabajado states', () => {
        const days = [
          createDay(1, 'Trabajo'),           // Counted
          createDay(1, 'FestivoTrabajado'),  // Counted
          createDay(1, 'Descanso'),          // Not counted
          createDay(1, 'Vacaciones'),        // Not counted
          createDay(1, 'Festivo'),           // Not counted
          createDay(1, 'NoContratado'),      // Not counted
          createDay(1, null),                // Not counted
        ];

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const dist = result.getValue();
        expect(dist.diasPorSemana.lunes).toBe(2); // Only Trabajo + FestivoTrabajado
        expect(dist.totalDiasTrabajados).toBe(2);
      });
    });

    describe('Percentage calculations', () => {
      it('should calculate percentages correctly', () => {
        const days = [
          createDay(1, 'Trabajo'),    // Monday
          createDay(2, 'Trabajo'),    // Tuesday
          createDay(3, 'Trabajo'),    // Wednesday
          createDay(4, 'Trabajo'),    // Thursday
          createDay(5, 'Trabajo'),    // Friday
        ];

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const dist = result.getValue();
        // Each day is 20% of total (1/5)
        expect(dist.porcentajes.lunes).toBe(20);
        expect(dist.porcentajes.martes).toBe(20);
        expect(dist.porcentajes.miercoles).toBe(20);
        expect(dist.porcentajes.jueves).toBe(20);
        expect(dist.porcentajes.viernes).toBe(20);
        expect(dist.porcentajes.sabado).toBe(0);
        expect(dist.porcentajes.domingo).toBe(0);
      });

      it('should round percentages to 2 decimal places', () => {
        const days = [
          createDay(1, 'Trabajo'),    // Monday
          createDay(2, 'Trabajo'),    // Tuesday
          createDay(3, 'Trabajo'),    // Wednesday
        ];

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const dist = result.getValue();
        // Each day is 33.333...% of total (1/3)
        expect(dist.porcentajes.lunes).toBe(33.33);
        expect(dist.porcentajes.martes).toBe(33.33);
        expect(dist.porcentajes.miercoles).toBe(33.33);
      });

      it('should handle zero worked days without division by zero', () => {
        const days = [
          createDay(1, 'Descanso'),   // Monday - rest
          createDay(2, 'Vacaciones'), // Tuesday - vacation
        ];

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const dist = result.getValue();
        expect(dist.totalDiasTrabajados).toBe(0);
        expect(dist.porcentajes.lunes).toBe(0);
        expect(dist.porcentajes.martes).toBe(0);
      });
    });

    describe('Most and least worked days', () => {
      it('should identify most worked day', () => {
        const days = [
          createDay(1, 'Trabajo'),    // Monday - 3 times
          createDay(1, 'Trabajo'),
          createDay(1, 'Trabajo'),
          createDay(2, 'Trabajo'),    // Tuesday - 1 time
        ];

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const dist = result.getValue();
        expect(dist.diaMasTrabajado).toBe('lunes');
      });

      it('should identify least worked day', () => {
        const days = [
          createDay(1, 'Trabajo'),    // Monday - 3 times
          createDay(1, 'Trabajo'),
          createDay(1, 'Trabajo'),
          createDay(2, 'Trabajo'),    // Tuesday - 1 time
          createDay(3, 'Trabajo'),    // Wednesday - 2 times
          createDay(3, 'Trabajo'),
        ];

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const dist = result.getValue();
        expect(dist.diaMenosTrabajado).toBe('domingo'); // 0 times
      });

      it('should handle tie for most worked day (first occurrence)', () => {
        const days = [
          createDay(1, 'Trabajo'),    // Monday - 2 times
          createDay(1, 'Trabajo'),
          createDay(2, 'Trabajo'),    // Tuesday - 2 times
          createDay(2, 'Trabajo'),
        ];

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const dist = result.getValue();
        // In case of tie for max, should return first occurrence with max count
        // Monday (index 1) comes before Tuesday (index 2) in the array
        expect(dist.diaMasTrabajado).toBe('lunes');
        // For min, domingo (0) comes before other days with 0 count
        expect(dist.diaMenosTrabajado).toBe('domingo');
      });

      it('should handle zero worked days for most/least', () => {
        const days = [
          createDay(1, 'Descanso'),   // No worked days
        ];

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const dist = result.getValue();
        expect(dist.diaMasTrabajado).toBe('');
        expect(dist.diaMenosTrabajado).toBe('');
      });
    });

    describe('Example from acceptance criteria', () => {
      it('should match the example: L-V work cycle', () => {
        // Simulate a typical Monday-Friday work cycle
        // 30 days of each Mon-Fri, 0 days Sat-Sun
        const days: CalendarDay[] = [];

        // Add 30 of each weekday Mon-Fri
        for (let i = 0; i < 30; i++) {
          days.push(createDay(1, 'Trabajo')); // Monday
          days.push(createDay(2, 'Trabajo')); // Tuesday
          days.push(createDay(3, 'Trabajo')); // Wednesday
          days.push(createDay(4, 'Trabajo')); // Thursday
          days.push(createDay(5, 'Trabajo')); // Friday
        }

        // Add some Sat-Sun as Descanso (not counted)
        for (let i = 0; i < 30; i++) {
          days.push(createDay(6, 'Descanso')); // Saturday
          days.push(createDay(0, 'Descanso')); // Sunday
        }

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const dist = result.getValue();

        // Verify counts
        expect(dist.diasPorSemana.lunes).toBe(30);
        expect(dist.diasPorSemana.martes).toBe(30);
        expect(dist.diasPorSemana.miercoles).toBe(30);
        expect(dist.diasPorSemana.jueves).toBe(30);
        expect(dist.diasPorSemana.viernes).toBe(30);
        expect(dist.diasPorSemana.sabado).toBe(0);
        expect(dist.diasPorSemana.domingo).toBe(0);

        // Verify percentages
        expect(dist.porcentajes.lunes).toBe(20.00);
        expect(dist.porcentajes.martes).toBe(20.00);
        expect(dist.porcentajes.miercoles).toBe(20.00);
        expect(dist.porcentajes.jueves).toBe(20.00);
        expect(dist.porcentajes.viernes).toBe(20.00);
        expect(dist.porcentajes.sabado).toBe(0);
        expect(dist.porcentajes.domingo).toBe(0);

        // Verify most/least
        expect(dist.diaMasTrabajado).toBe('lunes'); // All Mon-Fri tied, lunes is first
        expect(dist.diaMenosTrabajado).toBe('domingo'); // Sat-Sun tied at 0, domingo is first

        // Verify total
        expect(dist.totalDiasTrabajados).toBe(150); // 30 * 5
      });
    });

    describe('Edge cases', () => {
      it('should fail with empty calendar', () => {
        const days: CalendarDay[] = [];

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(false);
        expect(result.errorValue()).toContain('No se proporcionaron días');
      });

      it('should handle calendar with only one work day', () => {
        const days = [createDay(3, 'Trabajo')]; // Wednesday

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const dist = result.getValue();
        expect(dist.diasPorSemana.miercoles).toBe(1);
        expect(dist.porcentajes.miercoles).toBe(100);
        expect(dist.totalDiasTrabajados).toBe(1);
        expect(dist.diaMasTrabajado).toBe('miercoles');
        expect(dist.diaMenosTrabajado).toBe('domingo');
      });

      it('should handle calendar with no work days', () => {
        const days = [
          createDay(1, 'Descanso'),
          createDay(2, 'Vacaciones'),
          createDay(3, 'Festivo'),
        ];

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const dist = result.getValue();
        expect(dist.totalDiasTrabajados).toBe(0);
        expect(dist.diasPorSemana.lunes).toBe(0);
        expect(dist.diasPorSemana.martes).toBe(0);
        expect(dist.diasPorSemana.miercoles).toBe(0);
        expect(dist.diaMasTrabajado).toBe('');
        expect(dist.diaMenosTrabajado).toBe('');
      });

      it('should handle calendar with all work on same day', () => {
        const days = [
          createDay(4, 'Trabajo'),    // Thursday
          createDay(4, 'Trabajo'),    // Thursday
          createDay(4, 'Trabajo'),    // Thursday
        ];

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const dist = result.getValue();
        expect(dist.diasPorSemana.jueves).toBe(3);
        expect(dist.porcentajes.jueves).toBe(100);
        expect(dist.totalDiasTrabajados).toBe(3);
        expect(dist.diaMasTrabajado).toBe('jueves');
        expect(dist.diaMenosTrabajado).toBe('domingo');
      });
    });

    describe('Performance', () => {
      it('should handle full year calendar efficiently', () => {
        const days: CalendarDay[] = [];
        // Create a full year (365 days) with typical work pattern
        for (let i = 0; i < 365; i++) {
          const weekday = i % 7;
          const estado: EstadoDia = weekday === 0 || weekday === 6 ? 'Descanso' : 'Trabajo';
          days.push(createDay(weekday, estado));
        }

        const startTime = Date.now();
        const result = useCase.execute({ days });
        const endTime = Date.now();

        expect(result.isSuccess()).toBe(true);
        // Should complete in less than 10ms for 365 days (single pass)
        expect(endTime - startTime).toBeLessThan(10);
      });
    });
  });
});
