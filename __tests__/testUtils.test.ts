import { isValidKidAge } from '@/utils/testUtils';

describe('isValidKidAge', () => {
  test('returns true for valid ages', () => {
    expect(isValidKidAge(0)).toBe(true);
    expect(isValidKidAge(5)).toBe(true);
    expect(isValidKidAge(18)).toBe(true);
    expect(isValidKidAge('10')).toBe(true);
  });

  test('returns false for invalid ages', () => {
    expect(isValidKidAge(-1)).toBe(false);
    expect(isValidKidAge(19)).toBe(false);
    expect(isValidKidAge('abc')).toBe(false);
    expect(isValidKidAge(NaN)).toBe(false);
  });
});
