/**
 * Generate Annual Calendar Use Case Tests (HU-019)
 *
 * Tests for the calendar generation use case.
 */

import { GenerateAnnualCalendarUseCase } from '../generateAnnualCalendar.usecase';
import { Year } from '../../domain';

describe('GenerateAnnualCalendarUseCase', () => {
  let useCase: GenerateAnnualCalendarUseCase;

  beforeEach(() => {
    useCase = new GenerateAnnualCalendarUseCase();
  });

  describe('execute', () => {
    it('should generate 365 days for a non-leap year', () => {
      const yearResult = Year.create(2025);
      expect(yearResult.isSuccess()).toBe(true);

      const year = yearResult.getValue();
      const result = useCase.execute({ year });

      expect(result.isSuccess()).toBe(true);

      const calendar = result.getValue();
      expect(calendar.totalDays).toBe(365);
      expect(calendar.days).toHaveLength(365);
      expect(calendar.isLeapYear).toBe(false);
      expect(calendar.year).toBe(2025);
    });

    it('should generate 366 days for a leap year', () => {
      const yearResult = Year.create(2024);
      expect(yearResult.isSuccess()).toBe(true);

      const year = yearResult.getValue();
      const result = useCase.execute({ year });

      expect(result.isSuccess()).toBe(true);

      const calendar = result.getValue();
      expect(calendar.totalDays).toBe(366);
      expect(calendar.days).toHaveLength(366);
      expect(calendar.isLeapYear).toBe(true);
      expect(calendar.year).toBe(2024);
    });

    it('should initialize all days with null state and 0 hours', () => {
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();
      const result = useCase.execute({ year });

      expect(result.isSuccess()).toBe(true);

      const calendar = result.getValue();

      calendar.days.forEach((day) => {
        expect(day.estado).toBeNull();
        expect(day.horasTrabajadas).toBe(0);
        expect(day.descripcion).toBeUndefined();
        expect(day.metadata).toBeUndefined();
      });
    });

    it('should generate correct date information for first day of year', () => {
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();
      const result = useCase.execute({ year });

      expect(result.isSuccess()).toBe(true);

      const calendar = result.getValue();
      const firstDay = calendar.days[0];

      expect(firstDay.diaNumero).toBe(1);
      expect(firstDay.mes).toBe(1);
      expect(firstDay.nombreMes).toBe('Enero');
      expect(firstDay.fecha.getUTCDate()).toBe(1);
      expect(firstDay.fecha.getUTCMonth()).toBe(0); // 0-indexed
    });

    it('should generate correct date information for last day of year', () => {
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();
      const result = useCase.execute({ year });

      expect(result.isSuccess()).toBe(true);

      const calendar = result.getValue();
      const lastDay = calendar.days[calendar.days.length - 1];

      expect(lastDay.diaNumero).toBe(31);
      expect(lastDay.mes).toBe(12);
      expect(lastDay.nombreMes).toBe('Diciembre');
      expect(lastDay.fecha.getUTCDate()).toBe(31);
      expect(lastDay.fecha.getUTCMonth()).toBe(11); // 0-indexed
    });

    it('should include correct weekday information', () => {
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();
      const result = useCase.execute({ year });

      expect(result.isSuccess()).toBe(true);

      const calendar = result.getValue();

      calendar.days.forEach((day) => {
        expect(day.diaSemana).toBeGreaterThanOrEqual(0);
        expect(day.diaSemana).toBeLessThanOrEqual(6);
        expect(day.nombreDia).toBeTruthy();
        expect(typeof day.nombreDia).toBe('string');
      });
    });

    it('should include ISO week numbers for all days', () => {
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();
      const result = useCase.execute({ year });

      expect(result.isSuccess()).toBe(true);

      const calendar = result.getValue();

      calendar.days.forEach((day) => {
        expect(day.numeroSemana).toBeGreaterThanOrEqual(1);
        expect(day.numeroSemana).toBeLessThanOrEqual(53);
      });
    });

    it('should have 12 different months', () => {
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();
      const result = useCase.execute({ year });

      expect(result.isSuccess()).toBe(true);

      const calendar = result.getValue();
      const uniqueMonths = new Set(calendar.days.map((day) => day.mes));

      expect(uniqueMonths.size).toBe(12);
      expect(Array.from(uniqueMonths).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });

    it('should handle February correctly in leap year', () => {
      const yearResult = Year.create(2024);
      const year = yearResult.getValue();
      const result = useCase.execute({ year });

      expect(result.isSuccess()).toBe(true);

      const calendar = result.getValue();
      const februaryDays = calendar.days.filter((day) => day.mes === 2);

      expect(februaryDays).toHaveLength(29);
      expect(februaryDays[februaryDays.length - 1].diaNumero).toBe(29);
    });

    it('should handle February correctly in non-leap year', () => {
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();
      const result = useCase.execute({ year });

      expect(result.isSuccess()).toBe(true);

      const calendar = result.getValue();
      const februaryDays = calendar.days.filter((day) => day.mes === 2);

      expect(februaryDays).toHaveLength(28);
      expect(februaryDays[februaryDays.length - 1].diaNumero).toBe(28);
    });

    it('should generate dates sequentially without gaps', () => {
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();
      const result = useCase.execute({ year });

      expect(result.isSuccess()).toBe(true);

      const calendar = result.getValue();

      for (let i = 1; i < calendar.days.length; i++) {
        const prevDay = calendar.days[i - 1].fecha;
        const currentDay = calendar.days[i].fecha;

        const dayDiff = (currentDay.getTime() - prevDay.getTime()) / (1000 * 60 * 60 * 24);
        expect(dayDiff).toBe(1);
      }
    });

    it('should have all Spanish weekday names', () => {
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();
      const result = useCase.execute({ year });

      expect(result.isSuccess()).toBe(true);

      const calendar = result.getValue();
      const uniqueWeekdays = new Set(calendar.days.map((day) => day.nombreDia));

      expect(uniqueWeekdays.size).toBe(7);
      expect(uniqueWeekdays).toContain('Lunes');
      expect(uniqueWeekdays).toContain('Martes');
      expect(uniqueWeekdays).toContain('Miércoles');
      expect(uniqueWeekdays).toContain('Jueves');
      expect(uniqueWeekdays).toContain('Viernes');
      expect(uniqueWeekdays).toContain('Sábado');
      expect(uniqueWeekdays).toContain('Domingo');
    });

    it('should have all Spanish month names', () => {
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();
      const result = useCase.execute({ year });

      expect(result.isSuccess()).toBe(true);

      const calendar = result.getValue();
      const uniqueMonths = new Set(calendar.days.map((day) => day.nombreMes));

      expect(uniqueMonths.size).toBe(12);
      expect(uniqueMonths).toContain('Enero');
      expect(uniqueMonths).toContain('Febrero');
      expect(uniqueMonths).toContain('Marzo');
      expect(uniqueMonths).toContain('Diciembre');
    });
  });
});
