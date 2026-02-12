/**
 * Age group utilities for filtering attendance and kids data
 */

export type AgeGroup = '2-5yrs' | '6-9yrs' | '10-13yrs' | 'all';

export interface AgeRange {
  min: number;
  max: number;
}

/**
 * Converts an age group string to a numeric min/max range
 * @param ageGroup - The age group identifier
 * @returns Object with min and max age values
 */
export function getAgeRangeFromGroup(ageGroup: string): AgeRange {
  switch (ageGroup) {
    case '2-5yrs':
      return { min: 2, max: 5 };
    case '6-9yrs':
      return { min: 6, max: 9 };
    case '10-13yrs':
      return { min: 10, max: 13 };
    case 'all':
      return { min: 0, max: 100 };
    default:
      return { min: 0, max: 0 }; // Default case, should not happen
  }
}

/**
 * Validates if a given string is a valid age group
 * @param value - The value to validate
 * @returns True if valid age group, false otherwise
 */
export function isValidAgeGroup(value: string): value is AgeGroup {
  return ['2-5yrs', '6-9yrs', '10-13yrs', 'all'].includes(value);
}
