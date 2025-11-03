/**
 * Calculate Day Statistics Use Case Tests (HU-027 / SCRUM-39)
 *
 * Tests for the day statistics calculation use case.
 */

import { CalculateDayStatisticsUseCase } from '../calculateDayStatistics.usecase';
import { CalendarDay, EstadoDia } from '../../domain';
import { createDate } from '../../../infrastructure/utils/dateUtils';

describe('CalculateDayStatisticsUseCase', () => {
  let useCase: CalculateDayStatisticsUseCase;

  beforeEach(() => {
    useCase = new CalculateDayStatisticsUseCase();
  });

  /**
   * Helper function to create a calendar day with a specific state
   */
  function createDay(yearValue: number, month: number, day: number, estado: EstadoDia | null): CalendarDay {
    const fecha = createDate(yearValue, month, day);
    return {
      fecha,
      diaSemana: fecha.getDay(),
      nombreDia: 'Lunes',
      diaNumero: day,
      mes: month,
      nombreMes: 'Enero',
      numeroSemana: 1,
      estado,
      horasTrabajadas: estado === 'Trabajo' || estado === 'FestivoTrabajado' ? 8 : 0,
      descripcion: undefined,
      metadata: undefined,
    };
  }

  /**
   * Helper function to create a calendar with specific state distribution
   */
  function createCalendarWithStates(states: (EstadoDia | null)[]): CalendarDay[] {
    return states.map((estado, index) => createDay(2025, 1, index + 1, estado));
  }

  describe('execute', () => {
    describe('Basic counting', () => {
      it('should count work days correctly', () => {
        const days = createCalendarWithStates([
          'Trabajo', 'Trabajo', 'Trabajo', 'Descanso', 'Descanso'
        ]);

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();
        expect(stats.diasTrabajados).toBe(3);
        expect(stats.diasDescanso).toBe(2);
      });

      it('should count rest days correctly', () => {
        const days = createCalendarWithStates([
          'Descanso', 'Descanso', 'Descanso', 'Trabajo', 'Trabajo'
        ]);

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();
        expect(stats.diasDescanso).toBe(3);
        expect(stats.diasTrabajados).toBe(2);
      });

      it('should count vacation days correctly', () => {
        const days = createCalendarWithStates([
          'Vacaciones', 'Vacaciones', 'Trabajo', 'Trabajo', 'Trabajo'
        ]);

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();
        expect(stats.diasVacaciones).toBe(2);
        expect(stats.diasTrabajados).toBe(3);
      });

      it('should count holidays correctly', () => {
        const days = createCalendarWithStates([
          'Festivo', 'Festivo', 'Trabajo', 'Trabajo', 'Trabajo'
        ]);

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();
        expect(stats.diasFestivos).toBe(2);
        expect(stats.diasTrabajados).toBe(3);
      });

      it('should count worked holidays correctly', () => {
        const days = createCalendarWithStates([
          'FestivoTrabajado', 'FestivoTrabajado', 'Trabajo', 'Descanso', 'Descanso'
        ]);

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();
        expect(stats.diasFestivosTrabajados).toBe(2);
        expect(stats.diasTrabajados).toBe(1);
      });

      it('should count non-contracted days correctly', () => {
        const days = createCalendarWithStates([
          'NoContratado', 'NoContratado', 'NoContratado', 'Trabajo', 'Trabajo'
        ]);

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();
        expect(stats.diasNoContratados).toBe(3);
        expect(stats.diasTrabajados).toBe(2);
      });

      it('should handle days with null state', () => {
        const days = createCalendarWithStates([
          null, null, 'Trabajo', 'Trabajo', 'Descanso'
        ]);

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();
        expect(stats.diasTrabajados).toBe(2);
        expect(stats.diasDescanso).toBe(1);
        expect(stats.totalDiasAnio).toBe(5);
      });
    });

    describe('Mixed calendar counting', () => {
      it('should count all states correctly in a mixed calendar', () => {
        const days = createCalendarWithStates([
          'Trabajo', 'Trabajo', 'Descanso',
          'Vacaciones', 'Festivo', 'FestivoTrabajado',
          'NoContratado', 'NoContratado'
        ]);

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();
        expect(stats.diasTrabajados).toBe(2);
        expect(stats.diasDescanso).toBe(1);
        expect(stats.diasVacaciones).toBe(1);
        expect(stats.diasFestivos).toBe(1);
        expect(stats.diasFestivosTrabajados).toBe(1);
        expect(stats.diasNoContratados).toBe(2);
      });

      it('should match the example from acceptance criteria', () => {
        // Simulating: 156 NoContratado, 126 Trabajo, 54 Descanso, 22 Vacaciones, 5 Festivo, 2 FestivoTrabajado
        const days: CalendarDay[] = [];

        // Add 156 NoContratado days
        for (let i = 0; i < 156; i++) {
          days.push(createDay(2025, 1, i + 1, 'NoContratado'));
        }

        // Add 126 Trabajo days
        for (let i = 0; i < 126; i++) {
          days.push(createDay(2025, 6, i + 1, 'Trabajo'));
        }

        // Add 54 Descanso days
        for (let i = 0; i < 54; i++) {
          days.push(createDay(2025, 9, i + 1, 'Descanso'));
        }

        // Add 22 Vacaciones days
        for (let i = 0; i < 22; i++) {
          days.push(createDay(2025, 10, i + 1, 'Vacaciones'));
        }

        // Add 5 Festivo days
        for (let i = 0; i < 5; i++) {
          days.push(createDay(2025, 11, i + 1, 'Festivo'));
        }

        // Add 2 FestivoTrabajado days
        for (let i = 0; i < 2; i++) {
          days.push(createDay(2025, 12, i + 1, 'FestivoTrabajado'));
        }

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();

        // Verify counts
        expect(stats.diasNoContratados).toBe(156);
        expect(stats.diasTrabajados).toBe(126);
        expect(stats.diasDescanso).toBe(54);
        expect(stats.diasVacaciones).toBe(22);
        expect(stats.diasFestivos).toBe(5);
        expect(stats.diasFestivosTrabajados).toBe(2);

        // Verify derived totals
        expect(stats.totalDiasLaborables).toBe(128); // 126 + 2
        expect(stats.totalDiasNoLaborables).toBe(81); // 54 + 22 + 5
        expect(stats.totalDiasAnio).toBe(365);
        expect(stats.diasEfectivos).toBe(209); // 365 - 156

        // Verify percentages (with rounding tolerance)
        expect(stats.porcentajeTrabajo).toBeCloseTo(61.24, 1);
        expect(stats.porcentajeDescanso).toBeCloseTo(25.84, 1);
        expect(stats.porcentajeVacaciones).toBeCloseTo(10.53, 1);
      });
    });

    describe('Derived totals', () => {
      it('should calculate totalDiasLaborables correctly', () => {
        const days = createCalendarWithStates([
          'Trabajo', 'Trabajo', 'Trabajo',
          'FestivoTrabajado', 'FestivoTrabajado',
          'Descanso'
        ]);

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();
        expect(stats.totalDiasLaborables).toBe(5); // 3 Trabajo + 2 FestivoTrabajado
      });

      it('should calculate totalDiasNoLaborables correctly', () => {
        const days = createCalendarWithStates([
          'Descanso', 'Descanso',
          'Vacaciones', 'Vacaciones', 'Vacaciones',
          'Festivo',
          'Trabajo'
        ]);

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();
        expect(stats.totalDiasNoLaborables).toBe(6); // 2 Descanso + 3 Vacaciones + 1 Festivo
      });

      it('should calculate totalDiasAnio correctly', () => {
        const days = createCalendarWithStates([
          'Trabajo', 'Descanso', 'Vacaciones', 'Festivo', 'NoContratado'
        ]);

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();
        expect(stats.totalDiasAnio).toBe(5);
      });

      it('should calculate diasEfectivos correctly', () => {
        const days = createCalendarWithStates([
          'NoContratado', 'NoContratado', 'NoContratado',
          'Trabajo', 'Trabajo', 'Descanso', 'Vacaciones'
        ]);

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();
        expect(stats.diasEfectivos).toBe(4); // 7 total - 3 NoContratado
      });
    });

    describe('Percentage calculations', () => {
      it('should calculate porcentajeTrabajo correctly', () => {
        const days = createCalendarWithStates([
          'Trabajo', 'Trabajo', 'Trabajo',
          'Descanso', 'Descanso'
        ]);

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();
        // 3 work days out of 5 effective = 60%
        expect(stats.porcentajeTrabajo).toBe(60);
      });

      it('should calculate porcentajeDescanso correctly', () => {
        const days = createCalendarWithStates([
          'Descanso', 'Descanso',
          'Trabajo', 'Trabajo', 'Trabajo'
        ]);

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();
        // 2 rest days out of 5 effective = 40%
        expect(stats.porcentajeDescanso).toBe(40);
      });

      it('should calculate porcentajeVacaciones correctly', () => {
        const days = createCalendarWithStates([
          'Vacaciones', 'Vacaciones', 'Vacaciones',
          'Trabajo', 'Trabajo', 'Trabajo', 'Trabajo'
        ]);

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();
        // 3 vacation days out of 7 effective = 42.86%
        expect(stats.porcentajeVacaciones).toBeCloseTo(42.86, 1);
      });

      it('should include worked holidays in trabajo percentage', () => {
        const days = createCalendarWithStates([
          'Trabajo', 'Trabajo',
          'FestivoTrabajado',
          'Descanso', 'Descanso'
        ]);

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();
        // 3 working days (2 Trabajo + 1 FestivoTrabajado) out of 5 effective = 60%
        expect(stats.porcentajeTrabajo).toBe(60);
      });

      it('should calculate percentages over effective days only', () => {
        const days = createCalendarWithStates([
          'NoContratado', 'NoContratado', 'NoContratado', 'NoContratado', 'NoContratado',
          'Trabajo', 'Trabajo', 'Trabajo',
          'Descanso', 'Descanso'
        ]);

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();
        // Effective days = 10 - 5 = 5
        // 3 work days out of 5 effective = 60%
        expect(stats.diasEfectivos).toBe(5);
        expect(stats.porcentajeTrabajo).toBe(60);
        expect(stats.porcentajeDescanso).toBe(40);
      });

      it('should handle zero effective days gracefully', () => {
        const days = createCalendarWithStates([
          'NoContratado', 'NoContratado', 'NoContratado'
        ]);

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();
        expect(stats.diasEfectivos).toBe(0);
        expect(stats.porcentajeTrabajo).toBe(0);
        expect(stats.porcentajeDescanso).toBe(0);
        expect(stats.porcentajeVacaciones).toBe(0);
      });

      it('should round percentages to 2 decimal places', () => {
        const days = createCalendarWithStates([
          'Trabajo', 'Descanso', 'Descanso'
        ]);

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();
        // 1/3 = 33.333... should round to 33.33
        expect(stats.porcentajeTrabajo).toBe(33.33);
        // 2/3 = 66.666... should round to 66.67
        expect(stats.porcentajeDescanso).toBe(66.67);
      });
    });

    describe('Validation', () => {
      it('should validate that all days sum to totalDiasAnio', () => {
        const days = createCalendarWithStates([
          'Trabajo', 'Trabajo',
          'Descanso', 'Descanso',
          'Vacaciones',
          'Festivo',
          'FestivoTrabajado',
          'NoContratado', 'NoContratado', 'NoContratado'
        ]);

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();

        const sum =
          stats.diasTrabajados +
          stats.diasDescanso +
          stats.diasVacaciones +
          stats.diasFestivos +
          stats.diasFestivosTrabajados +
          stats.diasNoContratados;

        expect(sum).toBe(stats.totalDiasAnio);
      });

      it('should handle leap year (366 days)', () => {
        const days: CalendarDay[] = [];
        // Create 366 days for a leap year
        for (let i = 0; i < 366; i++) {
          days.push(createDay(2024, 1, 1, 'Trabajo'));
        }

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();
        expect(stats.totalDiasAnio).toBe(366);
        expect(stats.diasTrabajados).toBe(366);
      });
    });

    describe('Edge cases', () => {
      it('should fail with empty calendar', () => {
        const days: CalendarDay[] = [];

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(false);
        expect(result.errorValue()).toContain('No se proporcionaron días');
      });

      it('should handle calendar with all work days', () => {
        const days = createCalendarWithStates([
          'Trabajo', 'Trabajo', 'Trabajo', 'Trabajo', 'Trabajo'
        ]);

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();
        expect(stats.diasTrabajados).toBe(5);
        expect(stats.porcentajeTrabajo).toBe(100);
        expect(stats.porcentajeDescanso).toBe(0);
        expect(stats.porcentajeVacaciones).toBe(0);
      });

      it('should handle calendar with all rest days', () => {
        const days = createCalendarWithStates([
          'Descanso', 'Descanso', 'Descanso'
        ]);

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();
        expect(stats.diasDescanso).toBe(3);
        expect(stats.porcentajeTrabajo).toBe(0);
        expect(stats.porcentajeDescanso).toBe(100);
      });

      it('should handle calendar with all null states', () => {
        const days = createCalendarWithStates([
          null, null, null, null, null
        ]);

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();
        expect(stats.diasTrabajados).toBe(0);
        expect(stats.diasDescanso).toBe(0);
        expect(stats.diasVacaciones).toBe(0);
        expect(stats.totalDiasAnio).toBe(5);
      });

      it('should handle single day calendar', () => {
        const days = createCalendarWithStates(['Trabajo']);

        const result = useCase.execute({ days });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();
        expect(stats.totalDiasAnio).toBe(1);
        expect(stats.diasTrabajados).toBe(1);
        expect(stats.porcentajeTrabajo).toBe(100);
      });
    });

    describe('Performance', () => {
      it('should handle full year calendar efficiently', () => {
        const days: CalendarDay[] = [];
        // Create a full year (365 days)
        for (let i = 0; i < 365; i++) {
          const estado: EstadoDia = i % 7 === 0 || i % 7 === 6 ? 'Descanso' : 'Trabajo';
          days.push(createDay(2025, 1, 1, estado));
        }

        const startTime = Date.now();
        const result = useCase.execute({ days });
        const endTime = Date.now();

        expect(result.isSuccess()).toBe(true);
        // Should complete in less than 10ms for 365 days (single pass)
        expect(endTime - startTime).toBeLessThan(10);
      });
    });

    describe('Hours balance with proportional contract hours', () => {
      it('should calculate proportional contract hours for mid-year start', () => {
        const days: CalendarDay[] = [];

        // First 6 months (182 days) not contracted
        for (let i = 0; i < 182; i++) {
          days.push(createDay(2025, 1, i + 1, 'NoContratado'));
        }

        // Second 6 months (183 days) working 5 days/week
        for (let i = 0; i < 183; i++) {
          const estado: EstadoDia = i % 7 === 5 || i % 7 === 6 ? 'Descanso' : 'Trabajo';
          days.push(createDay(2025, 7, i + 1, estado));
        }

        // Annual contract hours: 1752
        // Proportional hours should be: 1752 * (183 / 365) ≈ 878.05
        const result = useCase.execute({ days, horasConvenio: 1752 });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();

        expect(stats.diasNoContratados).toBe(182);
        expect(stats.diasEfectivos).toBe(183); // 365 - 182
        expect(stats.balanceHoras).toBeDefined();

        // The contract hours used for balance should be proportional
        // Expected: 1752 * (183/365) ≈ 878.05 hours
        const expectedProportionalHours = (1752 * 183) / 365;
        expect(stats.balanceHoras?.horasConvenio).toBeCloseTo(expectedProportionalHours, 1);
      });

      it('should use full contract hours when working entire year', () => {
        const days: CalendarDay[] = [];

        // Full year (365 days) working 5 days/week
        for (let i = 0; i < 365; i++) {
          const estado: EstadoDia = i % 7 === 5 || i % 7 === 6 ? 'Descanso' : 'Trabajo';
          days.push(createDay(2025, 1, i + 1, estado));
        }

        const result = useCase.execute({ days, horasConvenio: 1752 });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();

        expect(stats.diasNoContratados).toBe(0);
        expect(stats.diasEfectivos).toBe(365);
        expect(stats.balanceHoras).toBeDefined();

        // Should use full contract hours (365/365 = 1)
        expect(stats.balanceHoras?.horasConvenio).toBe(1752);
      });

      it('should calculate proportional hours for quarter-year employment', () => {
        const days: CalendarDay[] = [];

        // First 3 quarters (274 days) not contracted
        for (let i = 0; i < 274; i++) {
          days.push(createDay(2025, 1, i + 1, 'NoContratado'));
        }

        // Last quarter (91 days) working
        for (let i = 0; i < 91; i++) {
          days.push(createDay(2025, 10, i + 1, 'Trabajo'));
        }

        // Annual contract hours: 1752
        // Proportional hours should be: 1752 * (91 / 365) ≈ 437.03
        const result = useCase.execute({ days, horasConvenio: 1752 });

        expect(result.isSuccess()).toBe(true);
        const stats = result.getValue();

        expect(stats.diasNoContratados).toBe(274);
        expect(stats.diasEfectivos).toBe(91);
        expect(stats.balanceHoras).toBeDefined();

        const expectedProportionalHours = (1752 * 91) / 365;
        expect(stats.balanceHoras?.horasConvenio).toBeCloseTo(expectedProportionalHours, 1);
      });
    });
  });
});
