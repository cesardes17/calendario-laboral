/**
 * Generate Annual Calendar Use Case Tests (HU-019, HU-020)
 *
 * Tests for the calendar generation use case.
 */

import { GenerateAnnualCalendarUseCase } from '../generateAnnualCalendar.usecase';
import { Year, EmploymentStatus, EmploymentStatusType, ContractStartDate } from '../../domain';

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

  describe('NoContratado days (HU-020)', () => {
    it('should mark days before contract start as NoContratado when started this year', () => {
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();

      const employmentStatusResult = EmploymentStatus.create(EmploymentStatusType.STARTED_THIS_YEAR);
      const employmentStatus = employmentStatusResult.getValue();

      // Contract started on June 6, 2025
      const contractStartDateResult = ContractStartDate.create(new Date(2025, 5, 6), year); // Month is 0-indexed
      const contractStartDate = contractStartDateResult.getValue();

      const result = useCase.execute({ year, employmentStatus, contractStartDate });

      expect(result.isSuccess()).toBe(true);

      const calendar = result.getValue();
      const notContractedDays = calendar.days.filter(day => day.estado === 'NoContratado');

      // From Jan 1 to June 5 = 156 days
      expect(notContractedDays).toHaveLength(156);

      // Verify all NoContratado days are before June 6
      notContractedDays.forEach(day => {
        expect(day.fecha.getTime()).toBeLessThan(new Date(2025, 5, 6).getTime());
        expect(day.horasTrabajadas).toBe(0);
      });
    });

    it('should NOT mark the contract start date itself as NoContratado', () => {
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();

      const employmentStatusResult = EmploymentStatus.create(EmploymentStatusType.STARTED_THIS_YEAR);
      const employmentStatus = employmentStatusResult.getValue();

      const contractStartDateResult = ContractStartDate.create(new Date(2025, 5, 6), year);
      const contractStartDate = contractStartDateResult.getValue();

      const result = useCase.execute({ year, employmentStatus, contractStartDate });

      expect(result.isSuccess()).toBe(true);

      const calendar = result.getValue();

      // Find June 6
      const june6 = calendar.days.find(day => day.mes === 6 && day.diaNumero === 6);

      expect(june6).toBeDefined();
      expect(june6!.estado).not.toBe('NoContratado');
      expect(june6!.estado).toBeNull(); // Should remain null (not yet assigned)
    });

    it('should have 0 NoContratado days if contract started on January 1', () => {
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();

      const employmentStatusResult = EmploymentStatus.create(EmploymentStatusType.STARTED_THIS_YEAR);
      const employmentStatus = employmentStatusResult.getValue();

      const contractStartDateResult = ContractStartDate.create(new Date(2025, 0, 1), year);
      const contractStartDate = contractStartDateResult.getValue();

      const result = useCase.execute({ year, employmentStatus, contractStartDate });

      expect(result.isSuccess()).toBe(true);

      const calendar = result.getValue();
      const notContractedDays = calendar.days.filter(day => day.estado === 'NoContratado');

      expect(notContractedDays).toHaveLength(0);
    });

    it('should NOT mark any days as NoContratado if employmentStatus is WORKED_BEFORE', () => {
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();

      const employmentStatusResult = EmploymentStatus.create(EmploymentStatusType.WORKED_BEFORE);
      const employmentStatus = employmentStatusResult.getValue();

      const result = useCase.execute({ year, employmentStatus });

      expect(result.isSuccess()).toBe(true);

      const calendar = result.getValue();
      const notContractedDays = calendar.days.filter(day => day.estado === 'NoContratado');

      expect(notContractedDays).toHaveLength(0);
    });

    it('should NOT mark any days as NoContratado if no employmentStatus provided', () => {
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();

      const result = useCase.execute({ year });

      expect(result.isSuccess()).toBe(true);

      const calendar = result.getValue();
      const notContractedDays = calendar.days.filter(day => day.estado === 'NoContratado');

      expect(notContractedDays).toHaveLength(0);
    });

    it('should fail if employmentStatus is STARTED_THIS_YEAR but no contractStartDate provided', () => {
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();

      const employmentStatusResult = EmploymentStatus.create(EmploymentStatusType.STARTED_THIS_YEAR);
      const employmentStatus = employmentStatusResult.getValue();

      const result = useCase.execute({ year, employmentStatus });

      expect(result.isSuccess()).toBe(false);
      expect(result.errorValue()).toContain('fecha de inicio de contrato');
    });

    it('should correctly count NoContratado days for mid-year start', () => {
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();

      const employmentStatusResult = EmploymentStatus.create(EmploymentStatusType.STARTED_THIS_YEAR);
      const employmentStatus = employmentStatusResult.getValue();

      // Contract started on July 1, 2025
      const contractStartDateResult = ContractStartDate.create(new Date(2025, 6, 1), year);
      const contractStartDate = contractStartDateResult.getValue();

      const result = useCase.execute({ year, employmentStatus, contractStartDate });

      expect(result.isSuccess()).toBe(true);

      const calendar = result.getValue();
      const notContractedDays = calendar.days.filter(day => day.estado === 'NoContratado');

      // From Jan 1 to June 30 = 181 days
      expect(notContractedDays).toHaveLength(181);
    });

    it('should mark all days as NoContratado if contract starts on December 31', () => {
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();

      const employmentStatusResult = EmploymentStatus.create(EmploymentStatusType.STARTED_THIS_YEAR);
      const employmentStatus = employmentStatusResult.getValue();

      // Contract started on December 31, 2025
      const contractStartDateResult = ContractStartDate.create(new Date(2025, 11, 31), year);
      const contractStartDate = contractStartDateResult.getValue();

      const result = useCase.execute({ year, employmentStatus, contractStartDate });

      expect(result.isSuccess()).toBe(true);

      const calendar = result.getValue();
      const notContractedDays = calendar.days.filter(day => day.estado === 'NoContratado');

      // All days except Dec 31 = 364 days
      expect(notContractedDays).toHaveLength(364);

      // Verify Dec 31 is NOT marked as NoContratado
      const dec31 = calendar.days.find(day => day.mes === 12 && day.diaNumero === 31);
      expect(dec31!.estado).not.toBe('NoContratado');
    });
  });
});
