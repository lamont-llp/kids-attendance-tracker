import { getAgeRangeFromGroup, isValidAgeGroup, AgeGroup } from '@/utils/ageGroupUtils';

describe('ageGroupUtils', () => {
  describe('getAgeRangeFromGroup', () => {
    it('should return correct range for 2-5yrs', () => {
      const result = getAgeRangeFromGroup('2-5yrs');
      expect(result).toEqual({ min: 2, max: 5 });
    });

    it('should return correct range for 6-9yrs', () => {
      const result = getAgeRangeFromGroup('6-9yrs');
      expect(result).toEqual({ min: 6, max: 9 });
    });

    it('should return correct range for 10-13yrs', () => {
      const result = getAgeRangeFromGroup('10-13yrs');
      expect(result).toEqual({ min: 10, max: 13 });
    });

    it('should return correct range for all', () => {
      const result = getAgeRangeFromGroup('all');
      expect(result).toEqual({ min: 0, max: 100 });
    });

    it('should return default range for invalid group', () => {
      const result = getAgeRangeFromGroup('invalid');
      expect(result).toEqual({ min: 0, max: 0 });
    });

    it('should return default range for empty string', () => {
      const result = getAgeRangeFromGroup('');
      expect(result).toEqual({ min: 0, max: 0 });
    });
  });

  describe('isValidAgeGroup', () => {
    it('should return true for valid age groups', () => {
      expect(isValidAgeGroup('2-5yrs')).toBe(true);
      expect(isValidAgeGroup('6-9yrs')).toBe(true);
      expect(isValidAgeGroup('10-13yrs')).toBe(true);
      expect(isValidAgeGroup('all')).toBe(true);
    });

    it('should return false for invalid age groups', () => {
      expect(isValidAgeGroup('invalid')).toBe(false);
      expect(isValidAgeGroup('')).toBe(false);
      expect(isValidAgeGroup('0-5yrs')).toBe(false);
      expect(isValidAgeGroup('ALL')).toBe(false); // Case sensitive
    });
  });
});
