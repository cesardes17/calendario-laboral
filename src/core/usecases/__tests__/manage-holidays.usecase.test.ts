import { Holiday } from '../../domain/holiday';
import { Year } from '../../domain/year';
import {
  addHoliday,
  removeHoliday,
  updateHoliday,
  sortHolidaysByDate,
  getHolidaysByYear,
  findHolidayByDate,
  isHoliday,
} from '../manage-holidays.usecase';

describe('Manage Holidays Use Case', () => {
  const year2025 = Year.create(2025).getValue();
  const year2024 = Year.create(2024).getValue();

  const holiday1 = Holiday.create({
    date: new Date(2025, 0, 1),
    name: 'Año Nuevo',
  }).getValue();

  const holiday2 = Holiday.create({
    date: new Date(2025, 0, 6),
    name: 'Reyes Magos',
  }).getValue();

  const holiday3 = Holiday.create({
    date: new Date(2025, 2, 19),
    name: 'San José',
  }).getValue();

  describe('addHoliday', () => {
    it('should add a holiday to an empty list', () => {
      const result = addHoliday(holiday1, [], year2025);

      expect(result.isSuccess()).toBe(true);
      const holidays = result.getValue();
      expect(holidays).toHaveLength(1);
      expect(holidays[0]).toBe(holiday1);
    });

    it('should add a holiday to an existing list', () => {
      const result = addHoliday(holiday2, [holiday1], year2025);

      expect(result.isSuccess()).toBe(true);
      const holidays = result.getValue();
      expect(holidays).toHaveLength(2);
    });

    it('should sort holidays after adding', () => {
      const result = addHoliday(holiday1, [holiday3], year2025);

      expect(result.isSuccess()).toBe(true);
      const holidays = result.getValue();
      expect(holidays[0]).toBe(holiday1); // January
      expect(holidays[1]).toBe(holiday3); // March
    });

    it('should fail when adding duplicate holiday', () => {
      const duplicate = Holiday.create({
        date: new Date(2025, 0, 1, 15, 0, 0), // Same day, different time
        name: 'New Year',
      }).getValue();

      const result = addHoliday(duplicate, [holiday1], year2025);

      expect(result.isFailure()).toBe(true);
      expect(result.errorValue()).toBe(
        'Ya existe un festivo en la fecha 1 enero'
      );
    });

    it('should fail when holiday is not in the selected year', () => {
      const holiday2024 = Holiday.create({
        date: new Date(2024, 0, 1),
      }).getValue();

      const result = addHoliday(holiday2024, [], year2025);

      expect(result.isFailure()).toBe(true);
      expect(result.errorValue()).toBe('El festivo debe estar en el año 2025');
    });
  });

  describe('removeHoliday', () => {
    it('should remove a holiday from the list', () => {
      const holidays = [holiday1, holiday2, holiday3];
      const result = removeHoliday(new Date(2025, 0, 6), holidays);

      expect(result.isSuccess()).toBe(true);
      const updated = result.getValue();
      expect(updated).toHaveLength(2);
      expect(updated.find((h) => h.isSameDate(holiday2))).toBeUndefined();
    });

    it('should fail when holiday not found', () => {
      const result = removeHoliday(new Date(2025, 11, 25), [holiday1]);

      expect(result.isFailure()).toBe(true);
      expect(result.errorValue()).toBe('No se encontró el festivo a eliminar');
    });

    it('should return empty list when removing last holiday', () => {
      const result = removeHoliday(new Date(2025, 0, 1), [holiday1]);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toHaveLength(0);
    });
  });

  describe('updateHoliday', () => {
    it('should update a holiday', () => {
      const updated = Holiday.create({
        date: new Date(2025, 0, 1),
        name: 'Año Nuevo Actualizado',
      }).getValue();

      const result = updateHoliday(
        new Date(2025, 0, 1),
        updated,
        [holiday1, holiday2],
        year2025
      );

      expect(result.isSuccess()).toBe(true);
      const holidays = result.getValue();
      const found = holidays.find((h) => h.getDayOfMonth() === 1);
      expect(found?.name).toBe('Año Nuevo Actualizado');
    });

    it('should allow changing the date', () => {
      const updated = Holiday.create({
        date: new Date(2025, 0, 7),
        name: 'Año Nuevo',
      }).getValue();

      const result = updateHoliday(
        new Date(2025, 0, 1),
        updated,
        [holiday1],
        year2025
      );

      expect(result.isSuccess()).toBe(true);
      const holidays = result.getValue();
      expect(holidays[0].getDayOfMonth()).toBe(7);
    });

    it('should resort holidays after updating date', () => {
      const updated = Holiday.create({
        date: new Date(2025, 11, 25), // Move to December
        name: 'Navidad',
      }).getValue();

      const result = updateHoliday(
        new Date(2025, 0, 1),
        updated,
        [holiday1, holiday2, holiday3],
        year2025
      );

      expect(result.isSuccess()).toBe(true);
      const holidays = result.getValue();
      expect(holidays[holidays.length - 1].getMonth()).toBe(11); // December last
    });

    it('should fail when original holiday not found', () => {
      const updated = Holiday.create({
        date: new Date(2025, 0, 1),
      }).getValue();

      const result = updateHoliday(
        new Date(2025, 11, 25),
        updated,
        [holiday1],
        year2025
      );

      expect(result.isFailure()).toBe(true);
      expect(result.errorValue()).toBe(
        'No se encontró el festivo a actualizar'
      );
    });

    it('should fail when new date conflicts with existing holiday', () => {
      const updated = Holiday.create({
        date: new Date(2025, 0, 6), // Same as holiday2
      }).getValue();

      const result = updateHoliday(
        new Date(2025, 0, 1),
        updated,
        [holiday1, holiday2],
        year2025
      );

      expect(result.isFailure()).toBe(true);
      expect(result.errorValue()).toBe(
        'Ya existe un festivo en la fecha 6 enero'
      );
    });

    it('should fail when updated holiday is in different year', () => {
      const updated = Holiday.create({
        date: new Date(2024, 0, 1),
      }).getValue();

      const result = updateHoliday(
        new Date(2025, 0, 1),
        updated,
        [holiday1],
        year2025
      );

      expect(result.isFailure()).toBe(true);
      expect(result.errorValue()).toBe('El festivo debe estar en el año 2025');
    });
  });

  describe('sortHolidaysByDate', () => {
    it('should sort holidays by date ascending', () => {
      const holidays = [holiday3, holiday1, holiday2]; // March, Jan, Jan

      const sorted = sortHolidaysByDate(holidays);

      expect(sorted[0]).toBe(holiday1); // Jan 1
      expect(sorted[1]).toBe(holiday2); // Jan 6
      expect(sorted[2]).toBe(holiday3); // Mar 19
    });

    it('should not mutate original array', () => {
      const holidays = [holiday3, holiday1];
      const original = [...holidays];

      sortHolidaysByDate(holidays);

      expect(holidays).toEqual(original);
    });

    it('should handle empty array', () => {
      const sorted = sortHolidaysByDate([]);
      expect(sorted).toHaveLength(0);
    });
  });

  describe('getHolidaysByYear', () => {
    it('should filter holidays by year', () => {
      const holiday2024 = Holiday.create({
        date: new Date(2024, 0, 1),
      }).getValue();

      const holidays = [holiday1, holiday2024, holiday2];

      const filtered = getHolidaysByYear(holidays, year2025);

      expect(filtered).toHaveLength(2);
      expect(filtered).toContain(holiday1);
      expect(filtered).toContain(holiday2);
      expect(filtered).not.toContain(holiday2024);
    });

    it('should return empty array when no matches', () => {
      const filtered = getHolidaysByYear([holiday1], year2024);
      expect(filtered).toHaveLength(0);
    });
  });


  describe('findHolidayByDate', () => {
    it('should find holiday by date', () => {
      const found = findHolidayByDate(
        new Date(2025, 0, 6),
        [holiday1, holiday2, holiday3]
      );

      expect(found).toBe(holiday2);
    });

    it('should return undefined when not found', () => {
      const found = findHolidayByDate(new Date(2025, 11, 25), [holiday1]);
      expect(found).toBeUndefined();
    });

    it('should match date regardless of time', () => {
      const found = findHolidayByDate(
        new Date(2025, 0, 1, 23, 59, 59),
        [holiday1]
      );

      expect(found).toBe(holiday1);
    });
  });

  describe('isHoliday', () => {
    it('should return true when date is a holiday', () => {
      const result = isHoliday(
        new Date(2025, 2, 19),
        [holiday1, holiday3]
      );

      expect(result).toBe(true);
    });

    it('should return true for any holiday', () => {
      const result = isHoliday(new Date(2025, 0, 1), [holiday1]);
      expect(result).toBe(true);
    });

    it('should return false when holiday not found', () => {
      const result = isHoliday(new Date(2025, 11, 25), [holiday1]);
      expect(result).toBe(false);
    });
  });
});
