/**
 * Tests for CalculateDayHours Use Case (HU-025 / SCRUM-37)
 */

import { CalculateDayHoursUseCase, CalculateDayHoursInput } from '../calculateDayHours.usecase';
import { CalendarDay, EstadoDia, WorkingHours } from '../../domain';

describe('CalculateDayHoursUseCase', () => {
  let useCase: CalculateDayHoursUseCase;
  let workingHours: WorkingHours;

  beforeEach(() => {
    useCase = new CalculateDayHoursUseCase();
    // Standard configuration: L-V: 8h, Sáb: 6h, Dom: 0h, Festivo: 10h
    workingHours = WorkingHours.create({
      weekday: 8.0,
      saturday: 6.0,
      sunday: 0.0,
      holiday: 10.0,
    });
  });

  // Helper to create a minimal CalendarDay for testing
  const createTestDay = (estado: EstadoDia | null, diaSemana: number): CalendarDay => ({
    fecha: new Date(2025, 0, 1), // Arbitrary date
    diaSemana,
    nombreDia: 'Test',
    diaNumero: 1,
    mes: 1,
    nombreMes: 'Enero',
    numeroSemana: 1,
    estado,
    horasTrabajadas: 0,
  });

  describe('States that always result in 0 hours', () => {
    it('should return 0 hours for NoContratado state (any day)', () => {
      const day = createTestDay('NoContratado', 3); // Wednesday
      const input: CalculateDayHoursInput = { day, workingHours };

      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().hours).toBe(0);
      expect(result.getValue().estado).toBe('NoContratado');
    });

    it('should return 0 hours for Vacaciones state (any day)', () => {
      const day = createTestDay('Vacaciones', 2); // Tuesday
      const input: CalculateDayHoursInput = { day, workingHours };

      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().hours).toBe(0);
      expect(result.getValue().estado).toBe('Vacaciones');
    });

    it('should return 0 hours for Festivo state (any day)', () => {
      const day = createTestDay('Festivo', 4); // Thursday
      const input: CalculateDayHoursInput = { day, workingHours };

      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().hours).toBe(0);
      expect(result.getValue().estado).toBe('Festivo');
    });

    it('should return 0 hours for Descanso state (any day)', () => {
      const day = createTestDay('Descanso', 6); // Saturday
      const input: CalculateDayHoursInput = { day, workingHours };

      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().hours).toBe(0);
      expect(result.getValue().estado).toBe('Descanso');
    });

    it('should return 0 hours for null estado (day not yet processed)', () => {
      const day = createTestDay(null, 1); // Monday
      const input: CalculateDayHoursInput = { day, workingHours };

      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().hours).toBe(0);
      expect(result.getValue().estado).toBe(null);
    });
  });

  describe('Trabajo state - Monday to Friday (weekday hours)', () => {
    it('should return weekday hours for Monday (1)', () => {
      const day = createTestDay('Trabajo', 1);
      const input: CalculateDayHoursInput = { day, workingHours };

      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().hours).toBe(8.0);
      expect(result.getValue().estado).toBe('Trabajo');
      expect(result.getValue().diaSemana).toBe(1);
    });

    it('should return weekday hours for Tuesday (2)', () => {
      const day = createTestDay('Trabajo', 2);
      const input: CalculateDayHoursInput = { day, workingHours };

      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().hours).toBe(8.0);
    });

    it('should return weekday hours for Wednesday (3)', () => {
      const day = createTestDay('Trabajo', 3);
      const input: CalculateDayHoursInput = { day, workingHours };

      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().hours).toBe(8.0);
    });

    it('should return weekday hours for Thursday (4)', () => {
      const day = createTestDay('Trabajo', 4);
      const input: CalculateDayHoursInput = { day, workingHours };

      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().hours).toBe(8.0);
    });

    it('should return weekday hours for Friday (5)', () => {
      const day = createTestDay('Trabajo', 5);
      const input: CalculateDayHoursInput = { day, workingHours };

      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().hours).toBe(8.0);
    });
  });

  describe('Trabajo state - Saturday (saturday hours)', () => {
    it('should return saturday hours for Saturday (6)', () => {
      const day = createTestDay('Trabajo', 6);
      const input: CalculateDayHoursInput = { day, workingHours };

      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().hours).toBe(6.0);
      expect(result.getValue().estado).toBe('Trabajo');
      expect(result.getValue().diaSemana).toBe(6);
    });

    it('should return 0 if saturday hours configured as 0', () => {
      const customHours = WorkingHours.create({
        weekday: 8.0,
        saturday: 0.0,
        sunday: 0.0,
        holiday: 10.0,
      });
      const day = createTestDay('Trabajo', 6);
      const input: CalculateDayHoursInput = { day, workingHours: customHours };

      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().hours).toBe(0);
    });
  });

  describe('Trabajo state - Sunday (sunday hours)', () => {
    it('should return sunday hours for Sunday (0)', () => {
      const day = createTestDay('Trabajo', 0);
      const input: CalculateDayHoursInput = { day, workingHours };

      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().hours).toBe(0); // Configured as 0
      expect(result.getValue().estado).toBe('Trabajo');
      expect(result.getValue().diaSemana).toBe(0);
    });

    it('should return configured sunday hours if not 0', () => {
      const customHours = WorkingHours.create({
        weekday: 8.0,
        saturday: 6.0,
        sunday: 4.0,
        holiday: 10.0,
      });
      const day = createTestDay('Trabajo', 0);
      const input: CalculateDayHoursInput = { day, workingHours: customHours };

      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().hours).toBe(4.0);
    });
  });

  describe('FestivoTrabajado state - always uses holiday hours', () => {
    it('should return holiday hours for FestivoTrabajado on Monday', () => {
      const day = createTestDay('FestivoTrabajado', 1);
      const input: CalculateDayHoursInput = { day, workingHours };

      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().hours).toBe(10.0);
      expect(result.getValue().estado).toBe('FestivoTrabajado');
    });

    it('should return holiday hours for FestivoTrabajado on Saturday', () => {
      const day = createTestDay('FestivoTrabajado', 6);
      const input: CalculateDayHoursInput = { day, workingHours };

      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().hours).toBe(10.0);
      // Even though it's Saturday, it uses holiday hours, not saturday hours
    });

    it('should return holiday hours for FestivoTrabajado on Sunday', () => {
      const day = createTestDay('FestivoTrabajado', 0);
      const input: CalculateDayHoursInput = { day, workingHours };

      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().hours).toBe(10.0);
      // Even though it's Sunday, it uses holiday hours, not sunday hours
    });
  });

  describe('Hours normalization and decimal precision', () => {
    it('should handle decimal hours correctly (2 decimal places)', () => {
      const customHours = WorkingHours.create({
        weekday: 7.5,
        saturday: 4.25,
        sunday: 0.0,
        holiday: 9.75,
      });
      const day = createTestDay('Trabajo', 1); // Monday
      const input: CalculateDayHoursInput = { day, workingHours: customHours };

      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().hours).toBe(7.5);
    });

    it('should handle very small decimal values', () => {
      const customHours = WorkingHours.create({
        weekday: 0.5,
        saturday: 0.25,
        sunday: 0.0,
        holiday: 1.0,
      });
      const day = createTestDay('Trabajo', 2); // Tuesday
      const input: CalculateDayHoursInput = { day, workingHours: customHours };

      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().hours).toBe(0.5);
    });
  });

  describe('Complete example from Jira story', () => {
    it('should match the complete example from acceptance criteria', () => {
      // Configuration from example
      const exampleHours = WorkingHours.create({
        weekday: 8.0,
        saturday: 6.0,
        sunday: 0.0,
        holiday: 10.0,
      });

      // 1 ene (Wednesday) - Festivo → 0 hours
      const day1 = createTestDay('Festivo', 3);
      expect(useCase.execute({ day: day1, workingHours: exampleHours }).getValue().hours).toBe(0);

      // 2 ene (Thursday) - Trabajo → 8.0 hours (L-V)
      const day2 = createTestDay('Trabajo', 4);
      expect(useCase.execute({ day: day2, workingHours: exampleHours }).getValue().hours).toBe(8.0);

      // 3 ene (Friday) - Trabajo → 8.0 hours (L-V)
      const day3 = createTestDay('Trabajo', 5);
      expect(useCase.execute({ day: day3, workingHours: exampleHours }).getValue().hours).toBe(8.0);

      // 4 ene (Saturday) - Trabajo → 6.0 hours (Saturday)
      const day4 = createTestDay('Trabajo', 6);
      expect(useCase.execute({ day: day4, workingHours: exampleHours }).getValue().hours).toBe(6.0);

      // 5 ene (Sunday) - Descanso → 0 hours
      const day5 = createTestDay('Descanso', 0);
      expect(useCase.execute({ day: day5, workingHours: exampleHours }).getValue().hours).toBe(0);

      // 6 ene (Monday) - FestivoTrabajado → 10.0 hours
      const day6 = createTestDay('FestivoTrabajado', 1);
      expect(useCase.execute({ day: day6, workingHours: exampleHours }).getValue().hours).toBe(10.0);

      // 15 jul (Tuesday) - Vacaciones → 0 hours
      const day7 = createTestDay('Vacaciones', 2);
      expect(useCase.execute({ day: day7, workingHours: exampleHours }).getValue().hours).toBe(0);
    });
  });

  describe('Edge cases and special scenarios', () => {
    it('should handle Descanso on Saturday (rest day from cycle, not worked)', () => {
      const day = createTestDay('Descanso', 6); // Saturday
      const input: CalculateDayHoursInput = { day, workingHours };

      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().hours).toBe(0);
      // Should be 0, not saturday hours, because it's Descanso state
    });

    it('should return different hours for different working hours configurations', () => {
      const customHours = WorkingHours.create({
        weekday: 10.0,
        saturday: 8.0,
        sunday: 6.0,
        holiday: 12.0,
      });

      const mondayWork = createTestDay('Trabajo', 1);
      const result1 = useCase.execute({ day: mondayWork, workingHours: customHours });
      expect(result1.getValue().hours).toBe(10.0);

      const saturdayWork = createTestDay('Trabajo', 6);
      const result2 = useCase.execute({ day: saturdayWork, workingHours: customHours });
      expect(result2.getValue().hours).toBe(8.0);

      const holidayWorked = createTestDay('FestivoTrabajado', 3);
      const result3 = useCase.execute({ day: holidayWorked, workingHours: customHours });
      expect(result3.getValue().hours).toBe(12.0);
    });
  });
});
