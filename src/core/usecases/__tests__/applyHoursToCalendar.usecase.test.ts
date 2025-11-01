/**
 * Tests for ApplyHoursToCalendar Use Case (HU-025 / SCRUM-37)
 */

import { ApplyHoursToCalendarUseCase, ApplyHoursToCalendarInput } from '../applyHoursToCalendar.usecase';
import { CalendarDay, EstadoDia, WorkingHours } from '../../domain';

describe('ApplyHoursToCalendarUseCase', () => {
  let useCase: ApplyHoursToCalendarUseCase;
  let workingHours: WorkingHours;

  beforeEach(() => {
    useCase = new ApplyHoursToCalendarUseCase();
    workingHours = WorkingHours.create({
      weekday: 8.0,
      saturday: 6.0,
      sunday: 0.0,
      holiday: 10.0,
    });
  });

  // Helper to create a test day
  const createDay = (
    estado: EstadoDia | null,
    diaSemana: number,
    diaNumero: number = 1,
    mes: number = 1
  ): CalendarDay => ({
    fecha: new Date(2025, mes - 1, diaNumero),
    diaSemana,
    nombreDia: 'Test',
    diaNumero,
    mes,
    nombreMes: 'Enero',
    numeroSemana: 1,
    estado,
    horasTrabajadas: 0,
  });

  describe('Basic functionality', () => {
    it('should apply hours to all days in the calendar', () => {
      const days: CalendarDay[] = [
        createDay('Trabajo', 1), // Monday -> 8h
        createDay('Trabajo', 2), // Tuesday -> 8h
        createDay('Descanso', 3), // Wednesday Rest -> 0h
        createDay('Trabajo', 4), // Thursday -> 8h
        createDay('Festivo', 5), // Friday Holiday -> 0h
        createDay('Trabajo', 6), // Saturday -> 6h
        createDay('Descanso', 0), // Sunday Rest -> 0h
      ];

      const input: ApplyHoursToCalendarInput = { days, workingHours };
      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);

      const output = result.getValue();
      expect(output.days[0].horasTrabajadas).toBe(8.0); // Monday
      expect(output.days[1].horasTrabajadas).toBe(8.0); // Tuesday
      expect(output.days[2].horasTrabajadas).toBe(0); // Rest
      expect(output.days[3].horasTrabajadas).toBe(8.0); // Thursday
      expect(output.days[4].horasTrabajadas).toBe(0); // Holiday
      expect(output.days[5].horasTrabajadas).toBe(6.0); // Saturday
      expect(output.days[6].horasTrabajadas).toBe(0); // Sunday Rest
    });

    it('should update the original days array (mutation)', () => {
      const days: CalendarDay[] = [
        createDay('Trabajo', 1), // Monday
        createDay('Trabajo', 2), // Tuesday
      ];

      const input: ApplyHoursToCalendarInput = { days, workingHours };
      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);

      // Original array should be mutated
      expect(days[0].horasTrabajadas).toBe(8.0);
      expect(days[1].horasTrabajadas).toBe(8.0);
    });
  });

  describe('Metrics calculation', () => {
    it('should calculate total hours correctly', () => {
      const days: CalendarDay[] = [
        createDay('Trabajo', 1), // 8h
        createDay('Trabajo', 2), // 8h
        createDay('Trabajo', 6), // 6h (Saturday)
        createDay('FestivoTrabajado', 3), // 10h
      ];

      const input: ApplyHoursToCalendarInput = { days, workingHours };
      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().totalHours).toBe(32.0); // 8+8+6+10
    });

    it('should count work days correctly', () => {
      const days: CalendarDay[] = [
        createDay('Trabajo', 1), // Work day
        createDay('Trabajo', 2), // Work day
        createDay('Descanso', 3), // Not a work day
        createDay('FestivoTrabajado', 4), // Work day
        createDay('Vacaciones', 5), // Not a work day
      ];

      const input: ApplyHoursToCalendarInput = { days, workingHours };
      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      const output = result.getValue();
      expect(output.workDaysCount).toBe(3); // Trabajo + Trabajo + FestivoTrabajado
      expect(output.regularWorkDays).toBe(2); // Only Trabajo days
      expect(output.workedHolidaysCount).toBe(1); // Only FestivoTrabajado
    });

    it('should calculate average hours per work day', () => {
      const days: CalendarDay[] = [
        createDay('Trabajo', 1), // 8h
        createDay('Trabajo', 2), // 8h
        createDay('Trabajo', 6), // 6h
        createDay('Descanso', 0), // 0h (not counted in average)
      ];

      const input: ApplyHoursToCalendarInput = { days, workingHours };
      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      const output = result.getValue();
      expect(output.totalHours).toBe(22.0);
      expect(output.workDaysCount).toBe(3);
      expect(output.averageHoursPerWorkDay).toBe(7.33); // 22 / 3 = 7.333... rounded to 7.33
    });

    it('should handle zero work days without division by zero', () => {
      const days: CalendarDay[] = [
        createDay('Descanso', 0),
        createDay('Vacaciones', 1),
        createDay('Festivo', 2),
      ];

      const input: ApplyHoursToCalendarInput = { days, workingHours };
      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      const output = result.getValue();
      expect(output.totalHours).toBe(0);
      expect(output.workDaysCount).toBe(0);
      expect(output.averageHoursPerWorkDay).toBe(0);
    });
  });

  describe('Decimal precision', () => {
    it('should round total hours to 2 decimals', () => {
      const customHours = WorkingHours.create({
        weekday: 7.333,
        saturday: 6.0,
        sunday: 0.0,
        holiday: 10.0,
      });

      const days: CalendarDay[] = [
        createDay('Trabajo', 1), // 7.33
        createDay('Trabajo', 2), // 7.33
        createDay('Trabajo', 3), // 7.33
      ];

      const input: ApplyHoursToCalendarInput = { days, workingHours: customHours };
      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      const output = result.getValue();
      // 7.33 * 3 = 21.99, should be rounded properly
      expect(output.totalHours).toBe(21.99);
    });

    it('should round average to 2 decimals', () => {
      const days: CalendarDay[] = [
        createDay('Trabajo', 1), // 8h
        createDay('Trabajo', 2), // 8h
        createDay('Trabajo', 3), // 8h
      ];

      const input: ApplyHoursToCalendarInput = { days, workingHours };
      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      // 24 / 3 = 8.0 exactly
      expect(result.getValue().averageHoursPerWorkDay).toBe(8.0);
    });
  });

  describe('Different day states', () => {
    it('should assign 0 hours to NoContratado days', () => {
      const days: CalendarDay[] = [
        createDay('NoContratado', 1),
        createDay('NoContratado', 2),
      ];

      const input: ApplyHoursToCalendarInput = { days, workingHours };
      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().totalHours).toBe(0);
      expect(result.getValue().workDaysCount).toBe(0);
    });

    it('should handle mixed states correctly', () => {
      const days: CalendarDay[] = [
        createDay('NoContratado', 1), // 0h
        createDay('Trabajo', 2), // 8h
        createDay('Vacaciones', 3), // 0h
        createDay('Festivo', 4), // 0h
        createDay('FestivoTrabajado', 5), // 10h
        createDay('Descanso', 6), // 0h
        createDay('Trabajo', 0), // 0h (Sunday with 0h config)
      ];

      const input: ApplyHoursToCalendarInput = { days, workingHours };
      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      const output = result.getValue();
      expect(output.totalHours).toBe(18.0); // 8 + 10
      expect(output.workDaysCount).toBe(2); // Trabajo + FestivoTrabajado
      expect(output.regularWorkDays).toBe(1);
      expect(output.workedHolidaysCount).toBe(1);
    });
  });

  describe('Complete example from Jira story', () => {
    it('should match the complete acceptance criteria example', () => {
      const days: CalendarDay[] = [
        createDay('Festivo', 3, 1, 1), // 1 ene (Wed) - Festivo → 0h
        createDay('Trabajo', 4, 2, 1), // 2 ene (Thu) - Trabajo → 8h
        createDay('Trabajo', 5, 3, 1), // 3 ene (Fri) - Trabajo → 8h
        createDay('Trabajo', 6, 4, 1), // 4 ene (Sat) - Trabajo → 6h
        createDay('Descanso', 0, 5, 1), // 5 ene (Sun) - Descanso → 0h
        createDay('FestivoTrabajado', 1, 6, 1), // 6 ene (Mon) - FestivoTrabajado → 10h
        createDay('Vacaciones', 2, 15, 7), // 15 jul (Tue) - Vacaciones → 0h
      ];

      const input: ApplyHoursToCalendarInput = { days, workingHours };
      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      const output = result.getValue();

      expect(output.days[0].horasTrabajadas).toBe(0); // Festivo
      expect(output.days[1].horasTrabajadas).toBe(8.0); // Trabajo Thu
      expect(output.days[2].horasTrabajadas).toBe(8.0); // Trabajo Fri
      expect(output.days[3].horasTrabajadas).toBe(6.0); // Trabajo Sat
      expect(output.days[4].horasTrabajadas).toBe(0); // Descanso
      expect(output.days[5].horasTrabajadas).toBe(10.0); // FestivoTrabajado
      expect(output.days[6].horasTrabajadas).toBe(0); // Vacaciones

      expect(output.totalHours).toBe(32.0); // 8+8+6+10
      expect(output.workDaysCount).toBe(4);
      expect(output.regularWorkDays).toBe(3);
      expect(output.workedHolidaysCount).toBe(1);
    });
  });

  describe('Error handling', () => {
    it('should fail if days array is empty', () => {
      const input: ApplyHoursToCalendarInput = {
        days: [],
        workingHours,
      };

      const result = useCase.execute(input);

      expect(result.isFailure()).toBe(true);
      expect(result.errorValue()).toContain('vacío');
    });

    it('should fail if days array is null/undefined', () => {
      const input: ApplyHoursToCalendarInput = {
        days: null as unknown as CalendarDay[],
        workingHours,
      };

      const result = useCase.execute(input);

      expect(result.isFailure()).toBe(true);
    });
  });

  describe('Large calendar (full year)', () => {
    it('should handle a full year of 365 days efficiently', () => {
      const days: CalendarDay[] = [];

      // Create 365 days (mix of work and rest)
      for (let i = 0; i < 365; i++) {
        const diaSemana = i % 7; // Cycle through week
        const estado: EstadoDia = diaSemana === 0 || diaSemana === 6 ? 'Descanso' : 'Trabajo';
        days.push(createDay(estado, diaSemana, i + 1, 1));
      }

      const input: ApplyHoursToCalendarInput = { days, workingHours };
      const result = useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      const output = result.getValue();

      expect(output.days.length).toBe(365);
      expect(output.totalHours).toBeGreaterThan(0);
      expect(output.workDaysCount).toBeGreaterThan(0);
      expect(output.averageHoursPerWorkDay).toBeGreaterThan(0);
    });
  });
});
