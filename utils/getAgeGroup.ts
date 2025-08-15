/**
 * Determines the age group based on the numeric age
 * @param {number} age - The numeric age of the kid
 * @returns {string} The age group (e.g., "2-5yrs", "6-9yrs", "10-13yrs")
 */
export const getAgeGroupFromAge = (age: number): string => {
  const numAge = Number(age);

  if (isNaN(numAge)) {
    return ''; // Return empty if age is not a valid number
  }

  if (numAge >= 2 && numAge <= 5) {
    return '2-5yrs';
  } else if (numAge >= 6 && numAge <= 9) {
    return '6-9yrs';
  } else if (numAge >= 10 && numAge <= 13) {
    return '10-13yrs';
  } else {
    return ''; // Return empty for ages outside the defined ranges
  }
};
