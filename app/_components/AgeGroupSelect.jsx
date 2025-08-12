'use client';

import React, { useEffect, useState } from 'react';
import GlobalApi, { AgeGroup } from '../services/GlobalApi';

/**
 * Determines the age group based on the numeric age
 * @param {number} age - The numeric age of the kid
 * @returns {string} The age group (e.g., "2-5yrs", "6-9yrs", "10-13yrs")
 */
export const getAgeGroupFromAge = (age) => {
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

function AgeGroupSelect({ age, selectedAgeGroup }) {
  const [ageGroups, setAgeGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('2-5yrs');

  const GetAllAgeGroupsList = () => {
    GlobalApi.GetAllAgeGroups().then((response) => {
      setAgeGroups(response.data);
    });
  };

  useEffect(() => {
    GetAllAgeGroupsList();
  }, []);

  // Update the selected group whenever the age changes
  useEffect(() => {
    if (age) {
      const ageGroup = getAgeGroupFromAge(age);
      setSelectedGroup(ageGroup);
      selectedAgeGroup(ageGroup);
    }
  }, [age, selectedAgeGroup]);

  return (
    <div>
      <select
        className="p-2 border rounded-lg"
        value={selectedGroup}
        onChange={(event) => {
          setSelectedGroup(event.target.value);
          selectedAgeGroup(event.target.value);
        }}
        disabled={age !== undefined} // Only disable if age is provided
      >
        <option value="" disabled>
          Select Age Group
        </option>
        {ageGroups.map((item, index) => (
          <option key={index} value={item.group}>
            {item.group}
          </option>
        ))}
      </select>
    </div>
  );
}

export default AgeGroupSelect;
