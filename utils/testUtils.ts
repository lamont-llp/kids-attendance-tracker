/**
 * Utility functions for testing
 */

/**
 * Validates if a kid's age is within the acceptable range (0-18)
 * @param age The age to validate
 * @returns True if the age is valid, false otherwise
 */
export function isValidKidAge(age: string | number): boolean {
  const numAge = typeof age === 'string' ? parseInt(age, 10) : age;

  // Check if age is a valid number
  if (isNaN(numAge)) {
    return false;
  }

  // Check if age is within acceptable range
  return numAge >= 0 && numAge <= 18;
}
