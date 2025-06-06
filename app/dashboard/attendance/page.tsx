"use client";

import React, { useState } from "react";
import MonthSelection from "../../_components/MonthSelection";
import AgeGroupSelect from "../../_components/AgeGroupSelect";
import { Button } from "../../../components/ui/button";
import GlobalApi from "../../services/GlobalApi";
import moment from "moment";
import AttendanceGrid from "./_components/AttendanceGrid";
import { toast } from "sonner";
import { Attendance } from "@/types/Attendance";

interface ApiResponse {
  data: Attendance[];
}

function AttendancePage() {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    moment(new Date()).format("MM/YYYY")
  );
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("3-5yrs");
  const [attendanceList, setAttendanceList] = useState<
    Attendance[] | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Used to fetch attendance list for given month and age group
   */
  const onSearchHandler = (): void => {
    // Add validation before proceeding
    if (!selectedMonth || !selectedAgeGroup) {
      toast.error("Please select both month and age group");
      return;
    }

    setIsLoading(true);
    const month = moment(selectedMonth).format("MM/YYYY");

    GlobalApi.GetAttendanceList(selectedAgeGroup, month)
      .then((response: ApiResponse) => {
        // Check if response.data exists and is an array
        if (response.data && Array.isArray(response.data)) {
          setAttendanceList(response.data);
        } else {
          console.error("Invalid data format received:", response.data);
          setAttendanceList([]);
          toast.error("No attendance data found");
        }
      })
      .catch((error: Error) => {
        console.error("API Error:", error);
        setAttendanceList([]);
        toast.error("Failed to fetch attendance data");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleMonthSelection = (value: string): void => {
    setSelectedMonth(value);
  };

  const handleAgeGroupSelection = (value: string): void => {
    setSelectedAgeGroup(value);
  };

  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold">Attendance</h2>
      {/* Search option */}

      <div className="flex gap-5 my-5 p-5 border rounded-lg shadow-sm">
        <div className="flex gap-2 items-center justify-center">
          <label>Select Month: </label>
          <MonthSelection selectedMonth={handleMonthSelection} />
        </div>
        <div className="flex gap-2 items-center justify-center">
          <label>Select Age Group: </label>
          <AgeGroupSelect selectedAgeGroup={handleAgeGroupSelection} />
        </div>
        <Button onClick={onSearchHandler} disabled={isLoading}>
          {isLoading ? "Loading..." : "Search"}
        </Button>
      </div>

      {/* Kid Attendance Grid */}
      <AttendanceGrid
        attendanceList={attendanceList}
        selectedMonth={moment(selectedMonth).toDate()}
      />
    </div>
  );
}

export default AttendancePage;
