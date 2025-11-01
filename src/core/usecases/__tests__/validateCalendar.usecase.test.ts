/**
 * Validate Calendar Use Case Tests (HU-026 / SCRUM-38)
 *
 * Tests for the calendar validation use case.
 */

import { ValidateCalendarUseCase } from '../validateCalendar.usecase';
import {
  Year,
  CalendarDay,
  ContractStartDate,
  VacationPeriod,
  Holiday,
} from '../../domain';
import { createDate } from '../../../infrastructure/utils/dateUtils';

describe('ValidateCalendarUseCase', () => {
  let useCase: ValidateCalendarUseCase;

  beforeEach(() => {
    useCase = new ValidateCalendarUseCase();
  });

  /**
   * Helper function to create a valid calendar with all days having a state
   */
  function createValidCalendar(yearValue: number, totalDays: number): CalendarDay[] {
    const days: CalendarDay[] = [];
    let currentDate = createDate(yearValue, 1, 1);

    for (let i = 0; i < totalDays; i++) {
      days.push({
        fecha: new Date(currentDate),
        diaSemana: currentDate.getDay(),
        nombreDia: 'Lunes',
        diaNumero: currentDate.getDate(),
        mes: currentDate.getMonth() + 1,
        nombreMes: 'Enero',
        numeroSemana: 1,
        estado: 'Trabajo',
        horasTrabajadas: 8,
        descripcion: undefined,
        metadata: undefined,
      });

      // Move to next day
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    }

    return days;
  }

  describe('execute', () => {
    describe('Valid calendar validation', () => {
      it('should validate a correct calendar with no errors', () => {
        const yearResult = Year.create(2025);
        expect(yearResult.isSuccess()).toBe(true);
        const year = yearResult.getValue();

        const days = createValidCalendar(2025, 365);

        const result = useCase.execute({ days, year });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(true);
        expect(validation.errores).toHaveLength(0);
      });

      it('should validate a leap year calendar correctly', () => {
        const yearResult = Year.create(2024);
        expect(yearResult.isSuccess()).toBe(true);
        const year = yearResult.getValue();

        const days = createValidCalendar(2024, 366);

        const result = useCase.execute({ days, year });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(true);
        expect(validation.errores).toHaveLength(0);
      });
    });

    describe('Days count validation', () => {
      it('should detect incorrect number of days (too few)', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 300); // Should be 365

        const result = useCase.execute({ days, year });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(false);
        expect(validation.errores).toContain(
          'Número incorrecto de días: se esperaban 365 días pero hay 300'
        );
      });

      it('should detect incorrect number of days (too many)', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 370); // Should be 365

        const result = useCase.execute({ days, year });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(false);
        expect(validation.errores).toContain(
          'Número incorrecto de días: se esperaban 365 días pero hay 370'
        );
      });
    });

    describe('State validation', () => {
      it('should detect days with null state', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 365);

        // Set some days to null state
        days[0].estado = null;
        days[10].estado = null;
        days[100].estado = null;

        const result = useCase.execute({ days, year });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(false);
        expect(validation.errores).toContain(
          'Hay 3 día(s) sin estado asignado (estado = null)'
        );
      });

      it('should pass when all days have a state', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 365);

        // All days already have a state in createValidCalendar
        const result = useCase.execute({ days, year });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(true);
      });
    });

    describe('Continuous dates validation', () => {
      it('should detect non-continuous dates (gap)', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 365);

        // Create a gap by skipping a day
        days[50].fecha = new Date(days[50].fecha.getTime() + 2 * 24 * 60 * 60 * 1000);

        const result = useCase.execute({ days, year });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(false);
        expect(validation.errores.some(e => e.includes('Salto en las fechas'))).toBe(true);
      });

      it('should detect incorrect first day', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 365);

        // Set first day to January 2 instead of January 1
        days[0].diaNumero = 2;
        days[0].mes = 1;

        const result = useCase.execute({ days, year });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(false);
        expect(validation.errores.some(e => e.includes('primer día debería ser 1 de enero'))).toBe(true);
      });

      it('should detect incorrect last day', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 365);

        // Set last day incorrectly
        days[364].diaNumero = 30;
        days[364].mes = 12;

        const result = useCase.execute({ days, year });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(false);
        expect(validation.errores.some(e => e.includes('último día debería ser 31 de diciembre'))).toBe(true);
      });

      it('should detect empty calendar', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days: CalendarDay[] = [];

        const result = useCase.execute({ days, year });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(false);
        expect(validation.errores).toContain('El calendario está vacío');
      });
    });

    describe('Hours coherence validation', () => {
      it('should detect negative hours', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 365);

        // Set some days with negative hours
        days[0].horasTrabajadas = -5;
        days[10].horasTrabajadas = -8;

        const result = useCase.execute({ days, year });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(false);
        expect(validation.errores).toContain('Hay 2 día(s) con horas negativas');
      });

      it('should detect NoContratado days with hours > 0', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 365);

        // Set some NoContratado days with hours
        days[0].estado = 'NoContratado';
        days[0].horasTrabajadas = 8;
        days[10].estado = 'NoContratado';
        days[10].horasTrabajadas = 4;

        const result = useCase.execute({ days, year });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(false);
        expect(validation.errores.some(e =>
          e.includes('NoContratado/Descanso/Vacaciones/Festivo con horas != 0')
        )).toBe(true);
      });

      it('should detect Descanso days with hours > 0', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 365);

        days[0].estado = 'Descanso';
        days[0].horasTrabajadas = 8;

        const result = useCase.execute({ days, year });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(false);
      });

      it('should detect Vacaciones days with hours > 0', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 365);

        days[0].estado = 'Vacaciones';
        days[0].horasTrabajadas = 8;

        const result = useCase.execute({ days, year });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(false);
      });

      it('should detect Festivo days with hours > 0', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 365);

        days[0].estado = 'Festivo';
        days[0].horasTrabajadas = 8;

        const result = useCase.execute({ days, year });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(false);
      });

      it('should warn about Trabajo days with 0 hours', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 365);

        days[0].estado = 'Trabajo';
        days[0].horasTrabajadas = 0;

        const result = useCase.execute({ days, year });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(true); // Warning, not error
        expect(validation.advertencias.some(w =>
          w.includes('Trabajo/FestivoTrabajado con 0 horas')
        )).toBe(true);
      });

      it('should warn about FestivoTrabajado days with 0 hours', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 365);

        days[0].estado = 'FestivoTrabajado';
        days[0].horasTrabajadas = 0;

        const result = useCase.execute({ days, year });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(true); // Warning, not error
        expect(validation.advertencias.some(w =>
          w.includes('Trabajo/FestivoTrabajado con 0 horas')
        )).toBe(true);
      });
    });

    describe('NoContratado days validation', () => {
      it('should validate NoContratado days are before contract start', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 365);

        const contractStartResult = ContractStartDate.create(createDate(2025, 3, 1), year);
        expect(contractStartResult.isSuccess()).toBe(true);
        const contractStartDate = contractStartResult.getValue();

        // Set days before March 1 as NoContratado
        for (let i = 0; i < 59; i++) { // Jan 1 to Feb 28 (59 days)
          days[i].estado = 'NoContratado';
          days[i].horasTrabajadas = 0;
        }

        const result = useCase.execute({ days, year, contractStartDate });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(true);
      });

      it('should detect NoContratado days after contract start', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 365);

        const contractStartResult = ContractStartDate.create(createDate(2025, 3, 1), year);
        const contractStartDate = contractStartResult.getValue();

        // Incorrectly mark some days after contract start as NoContratado
        days[100].estado = 'NoContratado'; // April
        days[200].estado = 'NoContratado'; // July

        const result = useCase.execute({ days, year, contractStartDate });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(false);
        expect(validation.errores.some(e =>
          e.includes('NoContratado después de la fecha de inicio de contrato')
        )).toBe(true);
      });

      it('should detect missing NoContratado days before contract start', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 365);

        const contractStartResult = ContractStartDate.create(createDate(2025, 3, 1), year);
        const contractStartDate = contractStartResult.getValue();

        // Don't mark days before contract start as NoContratado
        // (they're left as Trabajo from createValidCalendar)

        const result = useCase.execute({ days, year, contractStartDate });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(false);
        expect(validation.errores.some(e =>
          e.includes('antes de la fecha de inicio que no están marcados como NoContratado')
        )).toBe(true);
      });

      it('should warn if NoContratado days exist but no contract start date provided', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 365);

        days[0].estado = 'NoContratado';
        days[0].horasTrabajadas = 0;
        days[1].estado = 'NoContratado';
        days[1].horasTrabajadas = 0;

        const result = useCase.execute({ days, year });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(true); // Warning, not error
        expect(validation.advertencias.some(w =>
          w.includes('NoContratado pero no se proporcionó fecha de inicio de contrato')
        )).toBe(true);
      });
    });

    describe('Worked holidays validation', () => {
      it('should warn about worked holidays with 0 hours', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 365);

        days[0].estado = 'FestivoTrabajado';
        days[0].horasTrabajadas = 0;
        days[10].estado = 'FestivoTrabajado';
        days[10].horasTrabajadas = 0;

        const result = useCase.execute({ days, year });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(true); // Warning, not error
        expect(validation.advertencias.some(w =>
          w.includes('festivo(s) trabajado(s) con 0 horas')
        )).toBe(true);
      });

      it('should detect missing worked holidays in calendar', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 365);

        const holidayResult = Holiday.create({
          date: createDate(2025, 1, 1),
          name: 'Año Nuevo',
          worked: true,
        });
        expect(holidayResult.isSuccess()).toBe(true);
        const holiday = holidayResult.getValue();

        // Day is marked as Trabajo instead of FestivoTrabajado
        days[0].estado = 'Trabajo';

        const result = useCase.execute({ days, year, holidays: [holiday] });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(false);
        expect(validation.errores.some(e =>
          e.includes('marcado(s) como trabajado(s) en la lista pero no están en el calendario')
        )).toBe(true);
      });

      it('should validate worked holidays correctly when properly marked', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 365);

        const holidayResult = Holiday.create({
          date: createDate(2025, 1, 1),
          name: 'Año Nuevo',
          worked: true,
        });
        const holiday = holidayResult.getValue();

        days[0].estado = 'FestivoTrabajado';
        days[0].horasTrabajadas = 8;

        const result = useCase.execute({ days, year, holidays: [holiday] });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(true);
      });
    });

    describe('Vacation periods validation', () => {
      it('should detect incomplete vacation periods', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 365);

        const vacationResult = VacationPeriod.create({
          startDate: createDate(2025, 7, 1),
          endDate: createDate(2025, 7, 15),
          description: 'Vacaciones de verano',
        });
        expect(vacationResult.isSuccess()).toBe(true);
        const vacation = vacationResult.getValue();

        // Mark only some days as vacation (should mark all 15 days)
        for (let i = 181; i < 186; i++) { // Only 5 days marked
          days[i].estado = 'Vacaciones';
          days[i].horasTrabajadas = 0;
        }

        const result = useCase.execute({ days, year, vacationPeriods: [vacation] });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(false);
        expect(validation.errores.some(e =>
          e.includes('no marcado(s) como Vacaciones')
        )).toBe(true);
      });

      it('should validate complete vacation periods correctly', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 365);

        const vacationResult = VacationPeriod.create({
          startDate: createDate(2025, 7, 1),
          endDate: createDate(2025, 7, 7),
          description: 'Vacaciones',
        });
        const vacation = vacationResult.getValue();

        // Mark all 7 days as vacation (July 1-7)
        for (let i = 181; i < 188; i++) {
          days[i].estado = 'Vacaciones';
          days[i].horasTrabajadas = 0;
        }

        const result = useCase.execute({ days, year, vacationPeriods: [vacation] });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(true);
      });

      it('should warn about orphan vacation days', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 365);

        // Mark some days as vacation without a vacation period
        days[100].estado = 'Vacaciones';
        days[100].horasTrabajadas = 0;
        days[101].estado = 'Vacaciones';
        days[101].horasTrabajadas = 0;
        days[102].estado = 'Vacaciones';
        days[102].horasTrabajadas = 0;

        const result = useCase.execute({ days, year, vacationPeriods: [] });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(true); // Warning, not error
        expect(validation.advertencias.some(w =>
          w.includes('marcado(s) como Vacaciones que no pertenecen a ningún período')
        )).toBe(true);
      });
    });

    describe('Multiple errors', () => {
      it('should accumulate multiple errors', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 300); // Wrong count

        // Add multiple errors
        days[0].estado = null; // Null state
        days[1].horasTrabajadas = -5; // Negative hours
        days[2].estado = 'Descanso';
        days[2].horasTrabajadas = 8; // Invalid hours for state

        const result = useCase.execute({ days, year });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(false);
        expect(validation.errores.length).toBeGreaterThan(1);
      });

      it('should accumulate both errors and warnings', () => {
        const yearResult = Year.create(2025);
        const year = yearResult.getValue();
        const days = createValidCalendar(2025, 365);

        // Add an error
        days[0].estado = null;

        // Add a warning
        days[1].estado = 'Trabajo';
        days[1].horasTrabajadas = 0;

        const result = useCase.execute({ days, year });

        expect(result.isSuccess()).toBe(true);
        const validation = result.getValue();
        expect(validation.valido).toBe(false);
        expect(validation.errores.length).toBeGreaterThan(0);
        expect(validation.advertencias.length).toBeGreaterThan(0);
      });
    });
  });
});
