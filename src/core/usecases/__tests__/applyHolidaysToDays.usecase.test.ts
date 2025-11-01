/**
 * Unit tests for ApplyHolidaysToDaysUseCase (HU-024 / SCRUM-36)
 */

import { ApplyHolidaysToDaysUseCase } from '../applyHolidaysToDays.usecase';
import { Holiday } from '../../domain/holiday';
import { CalendarDay } from '../../domain/calendarDay';
import { WorkingHours } from '../../domain/workingHours';

describe('ApplyHolidaysToDaysUseCase (HU-024)', () => {
  let useCase: ApplyHolidaysToDaysUseCase;
  let workingHours: WorkingHours;

  beforeEach(() => {
    useCase = new ApplyHolidaysToDaysUseCase();
    // Default working hours: 8 hours for all days including holidays
    workingHours = WorkingHours.default();
  });

  /**
   * Helper to create a calendar day
   */
  const createDay = (
    date: Date,
    estado: CalendarDay['estado'] = null,
    horasTrabajadas: number = 0
  ): CalendarDay => ({
    fecha: date,
    diaSemana: date.getDay(),
    nombreDia: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][
      date.getDay()
    ],
    diaNumero: date.getDate(),
    mes: date.getMonth() + 1,
    nombreMes: 'Enero', // Simplified for testing
    numeroSemana: 1,
    estado,
    horasTrabajadas,
  });

  describe('No holidays scenario', () => {
    it('should return zero counts when no holidays are provided', () => {
      const days: CalendarDay[] = [
        createDay(new Date(2025, 0, 1), 'Trabajo', 8),
        createDay(new Date(2025, 0, 2), 'Descanso', 0),
      ];

      const result = useCase.execute({
        days,
        holidays: [],
        workingHours,
      });

      expect(result.isSuccess()).toBe(true);
      const output = result.getValue();
      expect(output.holidayDaysMarked).toBe(0);
      expect(output.workedHolidayDaysMarked).toBe(0);
      expect(output.holidaysProcessed).toBe(0);
      expect(output.totalDaysProcessed).toBe(0);
    });
  });

  describe('Non-worked holiday (Festivo)', () => {
    it('should mark a work day as Festivo with 0 hours when holiday is not worked', () => {
      const jan1 = new Date(2025, 0, 1); // January 1
      const days: CalendarDay[] = [createDay(jan1, 'Trabajo', 8)];

      const holidayResult = Holiday.create({
        date: jan1,
        name: 'Año Nuevo',
        worked: false,
      });

      expect(holidayResult.isSuccess()).toBe(true);
      const holiday = holidayResult.getValue();

      const result = useCase.execute({
        days,
        holidays: [holiday],
        workingHours,
      });

      expect(result.isSuccess()).toBe(true);
      const output = result.getValue();

      // Check statistics
      expect(output.holidayDaysMarked).toBe(1);
      expect(output.workedHolidayDaysMarked).toBe(0);
      expect(output.holidaysProcessed).toBe(1);
      expect(output.totalDaysProcessed).toBe(1);
      expect(output.stateChanges.fromWork).toBe(1);

      // Check day state
      expect(days[0].estado).toBe('Festivo');
      expect(days[0].horasTrabajadas).toBe(0);
      expect(days[0].descripcion).toBe('Año Nuevo');
    });

    it('should mark a rest day as Festivo when holiday is not worked', () => {
      const jan1 = new Date(2025, 0, 1);
      const days: CalendarDay[] = [createDay(jan1, 'Descanso', 0)];

      const holidayResult = Holiday.create({
        date: jan1,
        name: 'Año Nuevo',
        worked: false,
      });

      const result = useCase.execute({
        days,
        holidays: [holidayResult.getValue()],
        workingHours,
      });

      expect(result.isSuccess()).toBe(true);
      const output = result.getValue();

      expect(output.holidayDaysMarked).toBe(1);
      expect(output.stateChanges.fromRest).toBe(1);
      expect(days[0].estado).toBe('Festivo');
      expect(days[0].horasTrabajadas).toBe(0);
    });
  });

  describe('Worked holiday (FestivoTrabajado)', () => {
    it('should mark a work day as FestivoTrabajado with holiday hours when worked', () => {
      const jan6 = new Date(2025, 0, 6); // January 6
      const days: CalendarDay[] = [createDay(jan6, 'Descanso', 0)];

      const holidayResult = Holiday.create({
        date: jan6,
        name: 'Reyes Magos',
        worked: true,
      });

      const result = useCase.execute({
        days,
        holidays: [holidayResult.getValue()],
        workingHours,
      });

      expect(result.isSuccess()).toBe(true);
      const output = result.getValue();

      // Check statistics
      expect(output.holidayDaysMarked).toBe(0);
      expect(output.workedHolidayDaysMarked).toBe(1);
      expect(output.holidaysProcessed).toBe(1);
      expect(output.totalDaysProcessed).toBe(1);
      expect(output.stateChanges.fromRest).toBe(1);

      // Check day state
      expect(days[0].estado).toBe('FestivoTrabajado');
      expect(days[0].horasTrabajadas).toBe(8); // Default holiday hours
      expect(days[0].descripcion).toBe('Reyes Magos');
    });

    it('should use holiday hours configuration for worked holidays', () => {
      const customWorkingHours = WorkingHours.create({
        weekday: 8,
        saturday: 6,
        sunday: 0,
        holiday: 10, // Custom holiday hours
      });

      const jan1 = new Date(2025, 0, 1);
      const days: CalendarDay[] = [createDay(jan1, 'Trabajo', 8)];

      const holidayResult = Holiday.create({
        date: jan1,
        name: 'Año Nuevo',
        worked: true,
      });

      const result = useCase.execute({
        days,
        holidays: [holidayResult.getValue()],
        workingHours: customWorkingHours,
      });

      expect(result.isSuccess()).toBe(true);
      expect(days[0].estado).toBe('FestivoTrabajado');
      expect(days[0].horasTrabajadas).toBe(10); // Custom holiday hours
    });
  });

  describe('Priority hierarchy (HU-024)', () => {
    it('should NOT override NoContratado days (priority 1)', () => {
      const jan1 = new Date(2025, 0, 1);
      const days: CalendarDay[] = [createDay(jan1, 'NoContratado', 0)];

      const holidayResult = Holiday.create({
        date: jan1,
        name: 'Año Nuevo',
        worked: false,
      });

      const result = useCase.execute({
        days,
        holidays: [holidayResult.getValue()],
        workingHours,
      });

      expect(result.isSuccess()).toBe(true);
      const output = result.getValue();

      // Holiday should not be applied
      expect(output.holidayDaysMarked).toBe(0);
      expect(output.totalDaysProcessed).toBe(0);

      // Day should remain NoContratado
      expect(days[0].estado).toBe('NoContratado');
      expect(days[0].horasTrabajadas).toBe(0);
    });

    it('should NOT override Vacaciones days (priority 2)', () => {
      const aug15 = new Date(2025, 7, 15); // August 15
      const days: CalendarDay[] = [createDay(aug15, 'Vacaciones', 0)];

      const holidayResult = Holiday.create({
        date: aug15,
        name: 'Asunción',
        worked: false,
      });

      const result = useCase.execute({
        days,
        holidays: [holidayResult.getValue()],
        workingHours,
      });

      expect(result.isSuccess()).toBe(true);
      const output = result.getValue();

      // Holiday should not be applied
      expect(output.holidayDaysMarked).toBe(0);
      expect(output.totalDaysProcessed).toBe(0);

      // Day should remain Vacaciones
      expect(days[0].estado).toBe('Vacaciones');
    });

    it('should override Trabajo days (priority 5)', () => {
      const jan1 = new Date(2025, 0, 1);
      const days: CalendarDay[] = [createDay(jan1, 'Trabajo', 8)];

      const holidayResult = Holiday.create({
        date: jan1,
        name: 'Año Nuevo',
        worked: false,
      });

      const result = useCase.execute({
        days,
        holidays: [holidayResult.getValue()],
        workingHours,
      });

      expect(result.isSuccess()).toBe(true);
      const output = result.getValue();

      expect(output.holidayDaysMarked).toBe(1);
      expect(output.stateChanges.fromWork).toBe(1);
      expect(days[0].estado).toBe('Festivo');
    });

    it('should override Descanso days (priority 4)', () => {
      const jan1 = new Date(2025, 0, 1);
      const days: CalendarDay[] = [createDay(jan1, 'Descanso', 0)];

      const holidayResult = Holiday.create({
        date: jan1,
        name: 'Año Nuevo',
        worked: false,
      });

      const result = useCase.execute({
        days,
        holidays: [holidayResult.getValue()],
        workingHours,
      });

      expect(result.isSuccess()).toBe(true);
      const output = result.getValue();

      expect(output.holidayDaysMarked).toBe(1);
      expect(output.stateChanges.fromRest).toBe(1);
      expect(days[0].estado).toBe('Festivo');
    });
  });

  describe('Multiple holidays', () => {
    it('should process multiple holidays correctly', () => {
      const jan1 = new Date(2025, 0, 1);
      const jan6 = new Date(2025, 0, 6);
      const dec25 = new Date(2025, 11, 25);

      const days: CalendarDay[] = [
        createDay(jan1, 'Trabajo', 8),
        createDay(jan6, 'Descanso', 0),
        createDay(dec25, 'Trabajo', 8),
      ];

      const holiday1 = Holiday.create({
        date: jan1,
        name: 'Año Nuevo',
        worked: false,
      }).getValue();

      const holiday2 = Holiday.create({
        date: jan6,
        name: 'Reyes Magos',
        worked: true,
      }).getValue();

      const holiday3 = Holiday.create({
        date: dec25,
        name: 'Navidad',
        worked: false,
      }).getValue();

      const result = useCase.execute({
        days,
        holidays: [holiday1, holiday2, holiday3],
        workingHours,
      });

      expect(result.isSuccess()).toBe(true);
      const output = result.getValue();

      // Check statistics
      expect(output.holidayDaysMarked).toBe(2); // Jan 1 and Dec 25
      expect(output.workedHolidayDaysMarked).toBe(1); // Jan 6
      expect(output.holidaysProcessed).toBe(3);
      expect(output.totalDaysProcessed).toBe(3);

      // Check individual days
      expect(days[0].estado).toBe('Festivo');
      expect(days[0].horasTrabajadas).toBe(0);

      expect(days[1].estado).toBe('FestivoTrabajado');
      expect(days[1].horasTrabajadas).toBe(8);

      expect(days[2].estado).toBe('Festivo');
      expect(days[2].horasTrabajadas).toBe(0);
    });
  });

  describe('Holiday without name', () => {
    it('should not set description when holiday has no name', () => {
      const jan1 = new Date(2025, 0, 1);
      const days: CalendarDay[] = [createDay(jan1, 'Trabajo', 8)];

      const holidayResult = Holiday.create({
        date: jan1,
        // No name provided
        worked: false,
      });

      const result = useCase.execute({
        days,
        holidays: [holidayResult.getValue()],
        workingHours,
      });

      expect(result.isSuccess()).toBe(true);
      expect(days[0].estado).toBe('Festivo');
      expect(days[0].descripcion).toBeUndefined();
    });
  });

  describe('Examples from HU-024', () => {
    it('Example 1: Non-worked holiday on work day', () => {
      // 1 enero: Trabajo (según ciclo)
      // + Festivo: 1 enero - Año Nuevo (no trabajado)
      // → 1 enero: Festivo, Horas: 0

      const jan1 = new Date(2025, 0, 1);
      const days: CalendarDay[] = [createDay(jan1, 'Trabajo', 8)];

      const holiday = Holiday.create({
        date: jan1,
        name: 'Año Nuevo',
        worked: false,
      }).getValue();

      const result = useCase.execute({
        days,
        holidays: [holiday],
        workingHours,
      });

      expect(result.isSuccess()).toBe(true);
      expect(days[0].estado).toBe('Festivo');
      expect(days[0].horasTrabajadas).toBe(0);
    });

    it('Example 2: Worked holiday on rest day', () => {
      // 6 enero: Descanso (según ciclo)
      // + Festivo: 6 enero - Reyes Magos (trabajado)
      // → 6 enero: FestivoTrabajado, Horas: 8.0

      const jan6 = new Date(2025, 0, 6);
      const days: CalendarDay[] = [createDay(jan6, 'Descanso', 0)];

      const holiday = Holiday.create({
        date: jan6,
        name: 'Reyes Magos',
        worked: true,
      }).getValue();

      const result = useCase.execute({
        days,
        holidays: [holiday],
        workingHours,
      });

      expect(result.isSuccess()).toBe(true);
      expect(days[0].estado).toBe('FestivoTrabajado');
      expect(days[0].horasTrabajadas).toBe(8);
    });

    it('Example 3: Holiday on vacation day (vacation prevails)', () => {
      // 15 agosto: Vacaciones
      // + Festivo: 15 agosto - Asunción
      // → 15 agosto: Vacaciones (prevalece)

      const aug15 = new Date(2025, 7, 15);
      const days: CalendarDay[] = [createDay(aug15, 'Vacaciones', 0)];

      const holiday = Holiday.create({
        date: aug15,
        name: 'Asunción',
        worked: false,
      }).getValue();

      const result = useCase.execute({
        days,
        holidays: [holiday],
        workingHours,
      });

      expect(result.isSuccess()).toBe(true);
      expect(days[0].estado).toBe('Vacaciones'); // Vacation prevails
    });

    it('Example 4: Holiday before contract (NoContratado prevails)', () => {
      // 1 enero: NoContratado
      // + Festivo: 1 enero - Año Nuevo
      // → 1 enero: NoContratado (prevalece)

      const jan1 = new Date(2025, 0, 1);
      const days: CalendarDay[] = [createDay(jan1, 'NoContratado', 0)];

      const holiday = Holiday.create({
        date: jan1,
        name: 'Año Nuevo',
        worked: false,
      }).getValue();

      const result = useCase.execute({
        days,
        holidays: [holiday],
        workingHours,
      });

      expect(result.isSuccess()).toBe(true);
      expect(days[0].estado).toBe('NoContratado'); // NoContratado prevails
    });
  });

  describe('Edge cases', () => {
    it('should handle holiday that does not match any calendar day', () => {
      const jan1 = new Date(2025, 0, 1);
      const feb1 = new Date(2025, 1, 1);
      const days: CalendarDay[] = [createDay(jan1, 'Trabajo', 8)];

      // Holiday on a different date
      const holiday = Holiday.create({
        date: feb1,
        name: 'Test',
        worked: false,
      }).getValue();

      const result = useCase.execute({
        days,
        holidays: [holiday],
        workingHours,
      });

      expect(result.isSuccess()).toBe(true);
      const output = result.getValue();

      // Holiday not applied because date doesn't exist in days array
      expect(output.totalDaysProcessed).toBe(0);
      expect(days[0].estado).toBe('Trabajo'); // Unchanged
    });

    it('should handle null state days', () => {
      const jan1 = new Date(2025, 0, 1);
      const days: CalendarDay[] = [createDay(jan1, null, 0)];

      const holiday = Holiday.create({
        date: jan1,
        name: 'Año Nuevo',
        worked: false,
      }).getValue();

      const result = useCase.execute({
        days,
        holidays: [holiday],
        workingHours,
      });

      expect(result.isSuccess()).toBe(true);
      const output = result.getValue();

      expect(output.holidayDaysMarked).toBe(1);
      expect(output.stateChanges.fromNull).toBe(1);
      expect(days[0].estado).toBe('Festivo');
    });
  });
});
