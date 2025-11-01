import { Holiday } from '../holiday';

describe('Holiday Value Object', () => {
  describe('create', () => {
    it('should create a holiday with valid date and name', () => {
      const result = Holiday.create({
        date: new Date(2025, 0, 1),
        name: 'Año Nuevo',
      });

      expect(result.isSuccess()).toBe(true);
      const holiday = result.getValue();
      expect(holiday.getDayOfMonth()).toBe(1);
      expect(holiday.getMonth()).toBe(0);
      expect(holiday.getYear()).toBe(2025);
      expect(holiday.name).toBe('Año Nuevo');
    });

    it('should create a holiday without name', () => {
      const result = Holiday.create({
        date: new Date(2025, 0, 6),
      });

      expect(result.isSuccess()).toBe(true);
      const holiday = result.getValue();
      expect(holiday.name).toBe('');
      expect(holiday.hasName()).toBe(false);
    });

    it('should trim the name', () => {
      const result = Holiday.create({
        date: new Date(2025, 0, 1),
        name: '  Año Nuevo  ',
      });

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().name).toBe('Año Nuevo');
    });

    it('should fail with invalid date', () => {
      const result = Holiday.create({
        date: new Date('invalid'),
      });

      expect(result.isFailure()).toBe(true);
      expect(result.errorValue()).toBe('La fecha del festivo no es válida');
    });

    it('should fail with name exceeding 100 characters', () => {
      const longName = 'a'.repeat(101);
      const result = Holiday.create({
        date: new Date(2025, 0, 1),
        name: longName,
      });

      expect(result.isFailure()).toBe(true);
      expect(result.errorValue()).toBe(
        'El nombre del festivo no puede superar 100 caracteres'
      );
    });

    it('should accept name with exactly 100 characters', () => {
      const maxName = 'a'.repeat(100);
      const result = Holiday.create({
        date: new Date(2025, 0, 1),
        name: maxName,
      });

      expect(result.isSuccess()).toBe(true);
    });

    it('should create a holiday with worked flag set to true', () => {
      const result = Holiday.create({
        date: new Date(2025, 0, 1),
        name: 'Año Nuevo',
        worked: true,
      });

      expect(result.isSuccess()).toBe(true);
      const holiday = result.getValue();
      expect(holiday.worked).toBe(true);
      expect(holiday.isWorked()).toBe(true);
    });

    it('should create a holiday with worked flag set to false by default', () => {
      const result = Holiday.create({
        date: new Date(2025, 0, 1),
        name: 'Año Nuevo',
      });

      expect(result.isSuccess()).toBe(true);
      const holiday = result.getValue();
      expect(holiday.worked).toBe(false);
      expect(holiday.isWorked()).toBe(false);
    });

    it('should create a holiday with explicit worked flag set to false', () => {
      const result = Holiday.create({
        date: new Date(2025, 0, 1),
        name: 'Año Nuevo',
        worked: false,
      });

      expect(result.isSuccess()).toBe(true);
      const holiday = result.getValue();
      expect(holiday.worked).toBe(false);
      expect(holiday.isWorked()).toBe(false);
    });
  });

  describe('date methods', () => {
    it('should return a copy of the date', () => {
      const originalDate = new Date(2025, 0, 1);
      const holiday = Holiday.create({
        date: originalDate,
      }).getValue();

      const returnedDate = holiday.date;
      returnedDate.setFullYear(2026);

      expect(holiday.getYear()).toBe(2025); // Should not be affected
    });

    it('should return correct year, month, and day', () => {
      const holiday = Holiday.create({
        date: new Date(2025, 11, 25), // December 25, 2025
      }).getValue();

      expect(holiday.getYear()).toBe(2025);
      expect(holiday.getMonth()).toBe(11);
      expect(holiday.getDayOfMonth()).toBe(25);
    });
  });

  describe('hasName', () => {
    it('should return true when holiday has a name', () => {
      const holiday = Holiday.create({
        date: new Date(2025, 0, 1),
        name: 'Año Nuevo',
      }).getValue();

      expect(holiday.hasName()).toBe(true);
    });

    it('should return false when holiday has no name', () => {
      const holiday = Holiday.create({
        date: new Date(2025, 0, 1),
      }).getValue();

      expect(holiday.hasName()).toBe(false);
    });

    it('should return false when name is only whitespace', () => {
      const holiday = Holiday.create({
        date: new Date(2025, 0, 1),
        name: '   ',
      }).getValue();

      expect(holiday.hasName()).toBe(false);
    });
  });

  describe('isSameDate', () => {
    it('should return true for holidays on the same date', () => {
      const holiday1 = Holiday.create({
        date: new Date(2025, 0, 1),
        name: 'Año Nuevo',
      }).getValue();

      const holiday2 = Holiday.create({
        date: new Date(2025, 0, 1),
        name: 'New Year',
      }).getValue();

      expect(holiday1.isSameDate(holiday2)).toBe(true);
    });

    it('should return false for holidays on different dates', () => {
      const holiday1 = Holiday.create({
        date: new Date(2025, 0, 1),
      }).getValue();

      const holiday2 = Holiday.create({
        date: new Date(2025, 0, 6),
      }).getValue();

      expect(holiday1.isSameDate(holiday2)).toBe(false);
    });
  });

  describe('isOnDate', () => {
    it('should return true when holiday is on the given date', () => {
      const holiday = Holiday.create({
        date: new Date(2025, 0, 1, 12, 0, 0),
      }).getValue();

      expect(holiday.isOnDate(new Date(2025, 0, 1, 0, 0, 0))).toBe(true);
      expect(holiday.isOnDate(new Date(2025, 0, 1, 23, 59, 59))).toBe(true);
    });

    it('should return false when holiday is not on the given date', () => {
      const holiday = Holiday.create({
        date: new Date(2025, 0, 1),
      }).getValue();

      expect(holiday.isOnDate(new Date(2025, 0, 2))).toBe(false);
      expect(holiday.isOnDate(new Date(2024, 0, 1))).toBe(false);
    });
  });

  describe('getFormattedDate', () => {
    it('should format date correctly for January', () => {
      const holiday = Holiday.create({
        date: new Date(2025, 0, 1),
      }).getValue();

      expect(holiday.getFormattedDate()).toBe('1 enero');
    });

    it('should format date correctly for December', () => {
      const holiday = Holiday.create({
        date: new Date(2025, 11, 25),
      }).getValue();

      expect(holiday.getFormattedDate()).toBe('25 diciembre');
    });

    it('should format date correctly for all months', () => {
      const months = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];

      months.forEach((month, index) => {
        const holiday = Holiday.create({
          date: new Date(2025, index, 15),
        }).getValue();

        expect(holiday.getFormattedDate()).toBe(`15 ${month}`);
      });
    });
  });

  describe('getDisplayText', () => {
    it('should return date and name for named holiday', () => {
      const holiday = Holiday.create({
        date: new Date(2025, 0, 1),
        name: 'Año Nuevo',
      }).getValue();

      expect(holiday.getDisplayText()).toBe('1 enero - Año Nuevo');
    });

    it('should return only date for unnamed holiday', () => {
      const holiday = Holiday.create({
        date: new Date(2025, 0, 1),
      }).getValue();

      expect(holiday.getDisplayText()).toBe('1 enero');
    });
  });

  describe('compareTo', () => {
    it('should return negative when this is before other', () => {
      const holiday1 = Holiday.create({
        date: new Date(2025, 0, 1),
      }).getValue();

      const holiday2 = Holiday.create({
        date: new Date(2025, 0, 6),
      }).getValue();

      expect(holiday1.compareTo(holiday2)).toBeLessThan(0);
    });

    it('should return positive when this is after other', () => {
      const holiday1 = Holiday.create({
        date: new Date(2025, 0, 6),
      }).getValue();

      const holiday2 = Holiday.create({
        date: new Date(2025, 0, 1),
      }).getValue();

      expect(holiday1.compareTo(holiday2)).toBeGreaterThan(0);
    });
  });

  describe('copyWith', () => {
    it('should create a copy with updated date', () => {
      const original = Holiday.create({
        date: new Date(2025, 0, 1),
        name: 'Año Nuevo',
      }).getValue();

      const result = original.copyWith({
        date: new Date(2025, 0, 6),
      });

      expect(result.isSuccess()).toBe(true);
      const copy = result.getValue();
      expect(copy.getDayOfMonth()).toBe(6);
      expect(copy.name).toBe('Año Nuevo');
    });

    it('should create a copy with updated name', () => {
      const original = Holiday.create({
        date: new Date(2025, 0, 1),
        name: 'Año Nuevo',
      }).getValue();

      const result = original.copyWith({
        name: 'New Year',
      });

      expect(result.isSuccess()).toBe(true);
      const copy = result.getValue();
      expect(copy.name).toBe('New Year');
      expect(copy.getDayOfMonth()).toBe(1);
    });

    it('should create a copy with updated worked flag', () => {
      const original = Holiday.create({
        date: new Date(2025, 0, 1),
        name: 'Año Nuevo',
        worked: false,
      }).getValue();

      const result = original.copyWith({
        worked: true,
      });

      expect(result.isSuccess()).toBe(true);
      const copy = result.getValue();
      expect(copy.worked).toBe(true);
      expect(copy.name).toBe('Año Nuevo');
      expect(copy.getDayOfMonth()).toBe(1);
    });

    it('should validate the new values', () => {
      const original = Holiday.create({
        date: new Date(2025, 0, 1),
      }).getValue();

      const result = original.copyWith({
        date: new Date('invalid'),
      });

      expect(result.isFailure()).toBe(true);
    });
  });

  describe('serialization', () => {
    it('should convert to object', () => {
      const holiday = Holiday.create({
        date: new Date(2025, 0, 1, 12, 30, 0),
        name: 'Año Nuevo',
        worked: true,
      }).getValue();

      const obj = holiday.toObject();

      expect(obj).toEqual({
        date: expect.any(String),
        name: 'Año Nuevo',
        worked: true,
      });
      expect(new Date(obj.date).getFullYear()).toBe(2025);
    });

    it('should create from object with date string', () => {
      const obj = {
        date: '2025-01-01T00:00:00.000Z',
        name: 'Año Nuevo',
      };

      const result = Holiday.fromObject(obj);

      expect(result.isSuccess()).toBe(true);
      const holiday = result.getValue();
      expect(holiday.name).toBe('Año Nuevo');
    });

    it('should create from object with Date object', () => {
      const obj = {
        date: new Date(2025, 0, 1),
        name: 'Año Nuevo',
      };

      const result = Holiday.fromObject(obj);

      expect(result.isSuccess()).toBe(true);
      const holiday = result.getValue();
      expect(holiday.getDayOfMonth()).toBe(1);
    });

    it('should round-trip correctly', () => {
      const original = Holiday.create({
        date: new Date(2025, 0, 1),
        name: 'Año Nuevo',
        worked: true,
      }).getValue();

      const obj = original.toObject();
      const restored = Holiday.fromObject(obj).getValue();

      expect(restored.name).toBe(original.name);
      expect(restored.worked).toBe(original.worked);
      expect(restored.getYear()).toBe(original.getYear());
      expect(restored.getMonth()).toBe(original.getMonth());
      expect(restored.getDayOfMonth()).toBe(original.getDayOfMonth());
    });

    it('should handle missing worked field in deserialization (defaults to false)', () => {
      const obj = {
        date: '2025-01-01T00:00:00.000Z',
        name: 'Año Nuevo',
        // worked field is missing
      };

      const result = Holiday.fromObject(obj);

      expect(result.isSuccess()).toBe(true);
      const holiday = result.getValue();
      expect(holiday.worked).toBe(false);
    });
  });
});
