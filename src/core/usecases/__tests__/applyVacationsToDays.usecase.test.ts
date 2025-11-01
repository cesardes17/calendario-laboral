/**
 * Apply Vacations to Days Use Case Tests (HU-023)
 *
 * Tests for the vacation application use case.
 */

import { ApplyVacationsToDaysUseCase } from '../applyVacationsToDays.usecase';
import { VacationPeriod, CalendarDay } from '../../domain';
import { createDate } from '../../../infrastructure/utils/dateUtils';

describe('ApplyVacationsToDaysUseCase', () => {
  let useCase: ApplyVacationsToDaysUseCase;

  beforeEach(() => {
    useCase = new ApplyVacationsToDaysUseCase();
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
    it('should return success with zero counts when no vacation periods provided', () => {
      const days = [
        createMockDay(2025, 7, 15),
        createMockDay(2025, 7, 16),
      ];
      days[0].estado = 'Trabajo';
      days[1].estado = 'Descanso';

      const result = useCase.execute({ days, vacationPeriods: [] });

      expect(result.isSuccess()).toBe(true);
      const output = result.getValue();
      expect(output.vacationDaysMarked).toBe(0);
      expect(output.periodsProcessed).toBe(0);
      expect(output.totalDaysProcessed).toBe(0);

      // Original states should be unchanged
      expect(days[0].estado).toBe('Trabajo');
      expect(days[1].estado).toBe('Descanso');
    });

    it('should override Work days with Vacaciones (HU-023 Example)', () => {
      // Create calendar days marked as Work
      const days = [
        createMockDay(2025, 7, 15), // July 15
        createMockDay(2025, 7, 16), // July 16
        createMockDay(2025, 7, 17), // July 17
      ];
      days[0].estado = 'Trabajo';
      days[1].estado = 'Trabajo';
      days[2].estado = 'Trabajo';

      // Create vacation period: July 15-17
      const vacationResult = VacationPeriod.create({
        startDate: createDate(2025, 7, 15),
        endDate: createDate(2025, 7, 17),
        description: 'Vacaciones de verano',
      });
      const vacation = vacationResult.getValue();

      const result = useCase.execute({ days, vacationPeriods: [vacation] });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.vacationDaysMarked).toBe(3);
      expect(output.periodsProcessed).toBe(1);
      expect(output.stateChanges.fromWork).toBe(3);

      // All days should now be Vacaciones
      expect(days[0].estado).toBe('Vacaciones');
      expect(days[1].estado).toBe('Vacaciones');
      expect(days[2].estado).toBe('Vacaciones');

      // Hours should be 0
      expect(days[0].horasTrabajadas).toBe(0);
      expect(days[1].horasTrabajadas).toBe(0);
      expect(days[2].horasTrabajadas).toBe(0);

      // Description should be set
      expect(days[0].descripcion).toBe('Vacaciones de verano');
      expect(days[1].descripcion).toBe('Vacaciones de verano');
      expect(days[2].descripcion).toBe('Vacaciones de verano');
    });

    it('should override Rest days with Vacaciones (HU-023)', () => {
      const days = [
        createMockDay(2025, 7, 15),
        createMockDay(2025, 7, 16),
      ];
      days[0].estado = 'Descanso';
      days[1].estado = 'Descanso';

      const vacationResult = VacationPeriod.create({
        startDate: createDate(2025, 7, 15),
        endDate: createDate(2025, 7, 16),
      });
      const vacation = vacationResult.getValue();

      const result = useCase.execute({ days, vacationPeriods: [vacation] });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.vacationDaysMarked).toBe(2);
      expect(output.stateChanges.fromRest).toBe(2);

      expect(days[0].estado).toBe('Vacaciones');
      expect(days[1].estado).toBe('Vacaciones');
    });

    it('should override Festivo with Vacaciones (HU-023 Special Rule)', () => {
      const days = [
        createMockDay(2025, 8, 15), // August 15 (Asunción)
      ];
      days[0].estado = 'Festivo';
      days[0].descripcion = 'Asunción';

      const vacationResult = VacationPeriod.create({
        startDate: createDate(2025, 8, 15),
        endDate: createDate(2025, 8, 15),
        description: 'Vacaciones',
      });
      const vacation = vacationResult.getValue();

      const result = useCase.execute({ days, vacationPeriods: [vacation] });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.vacationDaysMarked).toBe(1);
      expect(output.stateChanges.fromHoliday).toBe(1);

      // Holiday should be overridden by vacation
      expect(days[0].estado).toBe('Vacaciones');
      expect(days[0].descripcion).toBe('Vacaciones'); // Vacation description wins
    });

    it('should override FestivoTrabajado with Vacaciones', () => {
      const days = [
        createMockDay(2025, 12, 25), // December 25
      ];
      days[0].estado = 'FestivoTrabajado';
      days[0].horasTrabajadas = 8;

      const vacationResult = VacationPeriod.create({
        startDate: createDate(2025, 12, 25),
        endDate: createDate(2025, 12, 25),
      });
      const vacation = vacationResult.getValue();

      const result = useCase.execute({ days, vacationPeriods: [vacation] });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.vacationDaysMarked).toBe(1);
      expect(output.stateChanges.fromWorkedHoliday).toBe(1);

      expect(days[0].estado).toBe('Vacaciones');
      expect(days[0].horasTrabajadas).toBe(0); // Hours reset to 0
    });

    it('should NOT override NoContratado (highest priority)', () => {
      const days = [
        createMockDay(2025, 1, 1),
        createMockDay(2025, 1, 2),
        createMockDay(2025, 6, 6),
      ];
      days[0].estado = 'NoContratado';
      days[1].estado = 'NoContratado';
      days[2].estado = 'Trabajo';

      // Vacation period covers all three days
      const vacationResult = VacationPeriod.create({
        startDate: createDate(2025, 1, 1),
        endDate: createDate(2025, 6, 6),
      });
      const vacation = vacationResult.getValue();

      const result = useCase.execute({ days, vacationPeriods: [vacation] });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      // Only the last day should be marked (first two are NoContratado)
      expect(output.vacationDaysMarked).toBe(1);

      // NoContratado days remain unchanged
      expect(days[0].estado).toBe('NoContratado');
      expect(days[1].estado).toBe('NoContratado');

      // Work day is overridden
      expect(days[2].estado).toBe('Vacaciones');
    });

    it('should handle vacation without description', () => {
      const days = [createMockDay(2025, 7, 15)];
      days[0].estado = 'Trabajo';

      const vacationResult = VacationPeriod.create({
        startDate: createDate(2025, 7, 15),
        endDate: createDate(2025, 7, 15),
        // No description
      });
      const vacation = vacationResult.getValue();

      const result = useCase.execute({ days, vacationPeriods: [vacation] });

      expect(result.isSuccess()).toBe(true);
      expect(days[0].estado).toBe('Vacaciones');
      expect(days[0].descripcion).toBeUndefined(); // No description set
    });

    it('should apply multiple vacation periods correctly', () => {
      const days = [
        createMockDay(2025, 7, 15),
        createMockDay(2025, 7, 16),
        createMockDay(2025, 7, 17), // Not in any vacation
        createMockDay(2025, 8, 10),
        createMockDay(2025, 8, 11),
      ];
      days.forEach((d) => (d.estado = 'Trabajo'));

      // First vacation: July 15-16
      const vacation1Result = VacationPeriod.create({
        startDate: createDate(2025, 7, 15),
        endDate: createDate(2025, 7, 16),
        description: 'Vacaciones julio',
      });
      const vacation1 = vacation1Result.getValue();

      // Second vacation: August 10-11
      const vacation2Result = VacationPeriod.create({
        startDate: createDate(2025, 8, 10),
        endDate: createDate(2025, 8, 11),
        description: 'Vacaciones agosto',
      });
      const vacation2 = vacation2Result.getValue();

      const result = useCase.execute({
        days,
        vacationPeriods: [vacation1, vacation2],
      });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.vacationDaysMarked).toBe(4); // 2 + 2
      expect(output.periodsProcessed).toBe(2);

      // Check states
      expect(days[0].estado).toBe('Vacaciones');
      expect(days[0].descripcion).toBe('Vacaciones julio');
      expect(days[1].estado).toBe('Vacaciones');
      expect(days[1].descripcion).toBe('Vacaciones julio');
      expect(days[2].estado).toBe('Trabajo'); // Not in vacation
      expect(days[3].estado).toBe('Vacaciones');
      expect(days[3].descripcion).toBe('Vacaciones agosto');
      expect(days[4].estado).toBe('Vacaciones');
      expect(days[4].descripcion).toBe('Vacaciones agosto');
    });

    it('should handle overlapping vacation periods correctly', () => {
      const days = [
        createMockDay(2025, 7, 15),
        createMockDay(2025, 7, 16),
        createMockDay(2025, 7, 17),
      ];
      days.forEach((d) => (d.estado = 'Trabajo'));

      // First vacation: July 15-16
      const vacation1Result = VacationPeriod.create({
        startDate: createDate(2025, 7, 15),
        endDate: createDate(2025, 7, 16),
        description: 'Vacaciones 1',
      });
      const vacation1 = vacation1Result.getValue();

      // Second vacation: July 16-17 (overlaps with first)
      const vacation2Result = VacationPeriod.create({
        startDate: createDate(2025, 7, 16),
        endDate: createDate(2025, 7, 17),
        description: 'Vacaciones 2',
      });
      const vacation2 = vacation2Result.getValue();

      const result = useCase.execute({
        days,
        vacationPeriods: [vacation1, vacation2],
      });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      // Note: With overlapping periods, the counter counts each application
      // Period 1 marks 2 days (15, 16), Period 2 marks 2 days (16, 17)
      // Total applications = 4 (even though only 3 unique days)
      expect(output.vacationDaysMarked).toBe(4);

      // All should be Vacaciones
      expect(days[0].estado).toBe('Vacaciones');
      expect(days[1].estado).toBe('Vacaciones');
      expect(days[2].estado).toBe('Vacaciones');

      // July 16 gets the description from the last period that processes it
      expect(days[1].descripcion).toBe('Vacaciones 2');
    });

    it('should handle single-day vacation period', () => {
      const days = [
        createMockDay(2025, 7, 15),
        createMockDay(2025, 7, 16),
        createMockDay(2025, 7, 17),
      ];
      days.forEach((d) => (d.estado = 'Trabajo'));

      // Single day vacation: July 16 only
      const vacationResult = VacationPeriod.create({
        startDate: createDate(2025, 7, 16),
        endDate: createDate(2025, 7, 16),
      });
      const vacation = vacationResult.getValue();

      const result = useCase.execute({ days, vacationPeriods: [vacation] });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.vacationDaysMarked).toBe(1);

      // Only middle day should be vacation
      expect(days[0].estado).toBe('Trabajo');
      expect(days[1].estado).toBe('Vacaciones');
      expect(days[2].estado).toBe('Trabajo');
    });

    it('should track state changes correctly', () => {
      const days = [
        createMockDay(2025, 7, 15),
        createMockDay(2025, 7, 16),
        createMockDay(2025, 7, 17),
        createMockDay(2025, 7, 18),
        createMockDay(2025, 7, 19),
        createMockDay(2025, 7, 20),
      ];
      days[0].estado = 'Trabajo';
      days[1].estado = 'Descanso';
      days[2].estado = 'Festivo';
      days[3].estado = 'FestivoTrabajado';
      days[4].estado = null;
      days[5].estado = 'NoContratado';

      const vacationResult = VacationPeriod.create({
        startDate: createDate(2025, 7, 15),
        endDate: createDate(2025, 7, 20),
      });
      const vacation = vacationResult.getValue();

      const result = useCase.execute({ days, vacationPeriods: [vacation] });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.stateChanges.fromWork).toBe(1);
      expect(output.stateChanges.fromRest).toBe(1);
      expect(output.stateChanges.fromHoliday).toBe(1);
      expect(output.stateChanges.fromWorkedHoliday).toBe(1);
      expect(output.stateChanges.fromNull).toBe(1);
      // NoContratado not changed, so total marked = 5
      expect(output.vacationDaysMarked).toBe(5);
    });

    it('should only apply vacation to days within the vacation period', () => {
      const days = [
        createMockDay(2025, 7, 14), // Before vacation
        createMockDay(2025, 7, 15), // Start of vacation
        createMockDay(2025, 7, 16), // In vacation
        createMockDay(2025, 7, 17), // End of vacation
        createMockDay(2025, 7, 18), // After vacation
      ];
      days.forEach((d) => (d.estado = 'Trabajo'));

      const vacationResult = VacationPeriod.create({
        startDate: createDate(2025, 7, 15),
        endDate: createDate(2025, 7, 17),
      });
      const vacation = vacationResult.getValue();

      const result = useCase.execute({ days, vacationPeriods: [vacation] });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.vacationDaysMarked).toBe(3);

      // Only days within period are marked
      expect(days[0].estado).toBe('Trabajo'); // Before
      expect(days[1].estado).toBe('Vacaciones'); // Start
      expect(days[2].estado).toBe('Vacaciones'); // Middle
      expect(days[3].estado).toBe('Vacaciones'); // End
      expect(days[4].estado).toBe('Trabajo'); // After
    });

    it('should handle long vacation period (full month)', () => {
      const days: CalendarDay[] = [];
      // July 2025: 31 days
      for (let day = 1; day <= 31; day++) {
        const mockDay = createMockDay(2025, 7, day);
        mockDay.estado = 'Trabajo';
        days.push(mockDay);
      }

      // Vacation for entire month
      const vacationResult = VacationPeriod.create({
        startDate: createDate(2025, 7, 1),
        endDate: createDate(2025, 7, 31),
        description: 'Vacaciones completas',
      });
      const vacation = vacationResult.getValue();

      const result = useCase.execute({ days, vacationPeriods: [vacation] });

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.vacationDaysMarked).toBe(31);
      expect(output.stateChanges.fromWork).toBe(31);

      // All days should be vacation
      days.forEach((day) => {
        expect(day.estado).toBe('Vacaciones');
        expect(day.horasTrabajadas).toBe(0);
        expect(day.descripcion).toBe('Vacaciones completas');
      });
    });
  });
});
