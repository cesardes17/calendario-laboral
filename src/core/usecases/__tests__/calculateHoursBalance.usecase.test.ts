/**
 * Calculate Hours Balance Use Case Tests (HU-029 / SCRUM-41)
 *
 * Tests for the hours balance calculation use case.
 */

import { CalculateHoursBalanceUseCase } from '../calculateHoursBalance.usecase';

describe('CalculateHoursBalanceUseCase', () => {
  let useCase: CalculateHoursBalanceUseCase;

  beforeEach(() => {
    useCase = new CalculateHoursBalanceUseCase();
  });

  describe('execute', () => {
    describe('Company owes hours (empresa_debe)', () => {
      it('should calculate when company owes hours', () => {
        const result = useCase.execute({
          horasTrabajadas: 1800,
          horasConvenio: 1600,
        });

        expect(result.isSuccess()).toBe(true);
        const balance = result.getValue();
        expect(balance.horasTrabajadas).toBe(1800);
        expect(balance.horasConvenio).toBe(1600);
        expect(balance.saldo).toBe(200);
        expect(balance.saldoAbsoluto).toBe(200);
        expect(balance.tipo).toBe('empresa_debe');
      });

      it('should generate correct message when company owes', () => {
        const result = useCase.execute({
          horasTrabajadas: 1800,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        expect(balance.mensaje).toBe('La empresa te debe 200.00 horas');
      });

      it('should calculate equivalent days correctly', () => {
        const result = useCase.execute({
          horasTrabajadas: 1800,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        // 200 hours / 8 hours per day = 25 days
        expect(balance.equivalenteDias).toBe(25);
      });

      it('should calculate fulfillment percentage correctly', () => {
        const result = useCase.execute({
          horasTrabajadas: 1800,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        // (1800 / 1600) * 100 = 112.5%
        expect(balance.porcentajeCumplimiento).toBe(112.5);
      });

      it('should set estado to "excelente" when company owes > 100 hours', () => {
        const result = useCase.execute({
          horasTrabajadas: 1800,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        expect(balance.estado).toBe('excelente');
      });

      it('should set estado to "ok" when company owes 1-100 hours', () => {
        const result = useCase.execute({
          horasTrabajadas: 1650,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        expect(balance.saldo).toBe(50);
        expect(balance.estado).toBe('ok');
      });
    });

    describe('Employee owes hours (empleado_debe)', () => {
      it('should calculate when employee owes hours', () => {
        const result = useCase.execute({
          horasTrabajadas: 872,
          horasConvenio: 1600,
        });

        expect(result.isSuccess()).toBe(true);
        const balance = result.getValue();
        expect(balance.horasTrabajadas).toBe(872);
        expect(balance.horasConvenio).toBe(1600);
        expect(balance.saldo).toBe(-728);
        expect(balance.saldoAbsoluto).toBe(728);
        expect(balance.tipo).toBe('empleado_debe');
      });

      it('should generate correct message when employee owes', () => {
        const result = useCase.execute({
          horasTrabajadas: 872,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        expect(balance.mensaje).toBe('Debes 728.00 horas');
      });

      it('should calculate equivalent days correctly', () => {
        const result = useCase.execute({
          horasTrabajadas: 872,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        // 728 hours / 8 hours per day = 91 days
        expect(balance.equivalenteDias).toBe(91);
      });

      it('should calculate fulfillment percentage correctly', () => {
        const result = useCase.execute({
          horasTrabajadas: 872,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        // (872 / 1600) * 100 = 54.5%
        expect(balance.porcentajeCumplimiento).toBe(54.5);
      });

      it('should set estado to "critico" when employee owes > 100 hours', () => {
        const result = useCase.execute({
          horasTrabajadas: 872,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        expect(balance.saldo).toBe(-728);
        expect(balance.estado).toBe('critico');
      });

      it('should set estado to "advertencia" when employee owes 1-100 hours', () => {
        const result = useCase.execute({
          horasTrabajadas: 1550,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        expect(balance.saldo).toBe(-50);
        expect(balance.estado).toBe('advertencia');
      });
    });

    describe('Balanced hours (equilibrado)', () => {
      it('should calculate when hours are balanced', () => {
        const result = useCase.execute({
          horasTrabajadas: 1600,
          horasConvenio: 1600,
        });

        expect(result.isSuccess()).toBe(true);
        const balance = result.getValue();
        expect(balance.saldo).toBe(0);
        expect(balance.saldoAbsoluto).toBe(0);
        expect(balance.tipo).toBe('equilibrado');
      });

      it('should generate correct message when balanced', () => {
        const result = useCase.execute({
          horasTrabajadas: 1600,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        expect(balance.mensaje).toBe('Horas equilibradas ✓');
      });

      it('should have zero equivalent days when balanced', () => {
        const result = useCase.execute({
          horasTrabajadas: 1600,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        expect(balance.equivalenteDias).toBe(0);
      });

      it('should have 100% fulfillment when balanced', () => {
        const result = useCase.execute({
          horasTrabajadas: 1600,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        expect(balance.porcentajeCumplimiento).toBe(100);
      });

      it('should set estado to "ok" when balanced', () => {
        const result = useCase.execute({
          horasTrabajadas: 1600,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        expect(balance.estado).toBe('ok');
      });
    });

    describe('Examples from acceptance criteria', () => {
      it('should match example: company owes 200 hours', () => {
        const result = useCase.execute({
          horasTrabajadas: 1800,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        expect(balance.saldo).toBe(200);
        expect(balance.mensaje).toBe('La empresa te debe 200.00 horas');
        expect(balance.equivalenteDias).toBe(25);
        expect(balance.estado).toBe('excelente');
      });

      it('should match example: employee owes 728 hours', () => {
        const result = useCase.execute({
          horasTrabajadas: 872,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        expect(balance.saldo).toBe(-728);
        expect(balance.mensaje).toBe('Debes 728.00 horas');
        expect(balance.equivalenteDias).toBe(91);
        expect(balance.estado).toBe('critico');
      });

      it('should match example: balanced hours', () => {
        const result = useCase.execute({
          horasTrabajadas: 1600,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        expect(balance.saldo).toBe(0);
        expect(balance.mensaje).toBe('Horas equilibradas ✓');
        expect(balance.equivalenteDias).toBe(0);
        expect(balance.estado).toBe('ok');
      });
    });

    describe('Estado classification', () => {
      it('should classify as "critico" when employee owes exactly 101 hours', () => {
        const result = useCase.execute({
          horasTrabajadas: 1499,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        expect(balance.saldo).toBe(-101);
        expect(balance.estado).toBe('critico');
      });

      it('should classify as "advertencia" when employee owes exactly 100 hours', () => {
        const result = useCase.execute({
          horasTrabajadas: 1500,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        expect(balance.saldo).toBe(-100);
        expect(balance.estado).toBe('advertencia');
      });

      it('should classify as "advertencia" when employee owes 1 hour', () => {
        const result = useCase.execute({
          horasTrabajadas: 1599,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        expect(balance.saldo).toBe(-1);
        expect(balance.estado).toBe('advertencia');
      });

      it('should classify as "ok" when balanced', () => {
        const result = useCase.execute({
          horasTrabajadas: 1600,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        expect(balance.saldo).toBe(0);
        expect(balance.estado).toBe('ok');
      });

      it('should classify as "ok" when company owes 1 hour', () => {
        const result = useCase.execute({
          horasTrabajadas: 1601,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        expect(balance.saldo).toBe(1);
        expect(balance.estado).toBe('ok');
      });

      it('should classify as "ok" when company owes exactly 100 hours', () => {
        const result = useCase.execute({
          horasTrabajadas: 1700,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        expect(balance.saldo).toBe(100);
        expect(balance.estado).toBe('ok');
      });

      it('should classify as "excelente" when company owes exactly 101 hours', () => {
        const result = useCase.execute({
          horasTrabajadas: 1701,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        expect(balance.saldo).toBe(101);
        expect(balance.estado).toBe('excelente');
      });
    });

    describe('Custom hours per day', () => {
      it('should use custom hours per day for equivalent calculation', () => {
        const result = useCase.execute({
          horasTrabajadas: 1800,
          horasConvenio: 1600,
          horasPorDia: 10, // Custom: 10 hours per day
        });

        const balance = result.getValue();
        // 200 hours / 10 hours per day = 20 days
        expect(balance.equivalenteDias).toBe(20);
      });

      it('should default to 8 hours per day when not specified', () => {
        const result = useCase.execute({
          horasTrabajadas: 1800,
          horasConvenio: 1600,
          // No horasPorDia specified
        });

        const balance = result.getValue();
        // 200 hours / 8 hours per day = 25 days
        expect(balance.equivalenteDias).toBe(25);
      });
    });

    describe('Rounding and precision', () => {
      it('should round equivalent days to 2 decimals', () => {
        const result = useCase.execute({
          horasTrabajadas: 1601,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        // 1 hour / 8 hours per day = 0.125 days
        expect(balance.equivalenteDias).toBe(0.13);
      });

      it('should round fulfillment percentage to 2 decimals', () => {
        const result = useCase.execute({
          horasTrabajadas: 1601,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        // (1601 / 1600) * 100 = 100.0625%
        expect(balance.porcentajeCumplimiento).toBe(100.06);
      });

      it('should format hours in message to 2 decimals', () => {
        const result = useCase.execute({
          horasTrabajadas: 1601.5,
          horasConvenio: 1600,
        });

        const balance = result.getValue();
        expect(balance.mensaje).toBe('La empresa te debe 1.50 horas');
      });
    });

    describe('Edge cases', () => {
      it('should handle zero worked hours', () => {
        const result = useCase.execute({
          horasTrabajadas: 0,
          horasConvenio: 1600,
        });

        expect(result.isSuccess()).toBe(true);
        const balance = result.getValue();
        expect(balance.saldo).toBe(-1600);
        expect(balance.tipo).toBe('empleado_debe');
        expect(balance.estado).toBe('critico');
        expect(balance.porcentajeCumplimiento).toBe(0);
      });

      it('should handle very large hours difference', () => {
        const result = useCase.execute({
          horasTrabajadas: 10000,
          horasConvenio: 1600,
        });

        expect(result.isSuccess()).toBe(true);
        const balance = result.getValue();
        expect(balance.saldo).toBe(8400);
        expect(balance.tipo).toBe('empresa_debe');
        expect(balance.estado).toBe('excelente');
      });

      it('should handle decimal hours', () => {
        const result = useCase.execute({
          horasTrabajadas: 1600.5,
          horasConvenio: 1600.3,
        });

        expect(result.isSuccess()).toBe(true);
        const balance = result.getValue();
        expect(balance.saldo).toBeCloseTo(0.2, 5);
        expect(balance.tipo).toBe('empresa_debe');
      });
    });

    describe('Validation', () => {
      it('should fail with negative worked hours', () => {
        const result = useCase.execute({
          horasTrabajadas: -100,
          horasConvenio: 1600,
        });

        expect(result.isSuccess()).toBe(false);
        expect(result.errorValue()).toContain('no pueden ser negativas');
      });

      it('should fail with zero contract hours', () => {
        const result = useCase.execute({
          horasTrabajadas: 1600,
          horasConvenio: 0,
        });

        expect(result.isSuccess()).toBe(false);
        expect(result.errorValue()).toContain('deben ser mayores que cero');
      });

      it('should fail with negative contract hours', () => {
        const result = useCase.execute({
          horasTrabajadas: 1600,
          horasConvenio: -1600,
        });

        expect(result.isSuccess()).toBe(false);
        expect(result.errorValue()).toContain('deben ser mayores que cero');
      });

      it('should fail with zero hours per day', () => {
        const result = useCase.execute({
          horasTrabajadas: 1600,
          horasConvenio: 1600,
          horasPorDia: 0,
        });

        expect(result.isSuccess()).toBe(false);
        expect(result.errorValue()).toContain('deben ser mayores que cero');
      });

      it('should fail with negative hours per day', () => {
        const result = useCase.execute({
          horasTrabajadas: 1600,
          horasConvenio: 1600,
          horasPorDia: -8,
        });

        expect(result.isSuccess()).toBe(false);
        expect(result.errorValue()).toContain('deben ser mayores que cero');
      });
    });
  });
});
