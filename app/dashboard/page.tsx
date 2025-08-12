// dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import MonthSelection from '@/app/_components/MonthSelection';
import AgeGroupSelect from '@/app/_components/AgeGroupSelect';
import GlobalApi from '@/app/services/GlobalApi';
import moment from 'moment';
import StatusList from '@/app/dashboard/_components/StatusList';
import BarChartComponent from '@/app/dashboard/_components/BarChartComponent';
import PieChartComponent from '@/app/dashboard/_components/PieChartComponent';
import DailyAttendanceList from './_components/DailyAttendanceList';
import DailyAttendance from './_components/DailyAttendance';

function Dashboard() {
  const { setTheme } = useTheme();
  const [selectedMonth, setSelectedMonth] = useState(moment(new Date()));
  const [selectedDate, setSelectedDate] = useState(moment(new Date()));
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('2-5yrs');
  const [attendanceList, setAttendanceList] = useState([]);
  const [totalPresentData, setTotalPresentData] = useState([]);
  const [kidList, setKidList] = useState([]);

  /**
   * Used to Get All Kids
   */
  const GetAllKids = () => {
    GlobalApi.GetAllKids().then((res) => {
      setKidList(res.data);
      console.log(res.data);
    });
  };

  useEffect(() => {
    // Only set default theme once on component mount
    setTheme('system');
  }, []);

  useEffect(() => {
    GetTotalPresentCountByDay();
    getKidAttendance();
    GetAllKids();
  }, [selectedMonth, selectedAgeGroup]);

  /**
   * Used to get Kid Attendance for given Month and Date
   */
  const getKidAttendance = () => {
    GlobalApi.GetAttendanceList(selectedAgeGroup, moment(selectedMonth).format('MM/yyyy'))
      .then((response) => {
        setAttendanceList(response.data || []);
      })
      .catch((error) => {
        console.error('Error fetching attendance:', error);
        setAttendanceList([]);
      });
  };

  const GetTotalPresentCountByDay = () => {
    GlobalApi.TotalPresentCountByDay(
      moment(selectedMonth).format('MM/yyyy'),
      selectedAgeGroup,
    ).then((response) => {
      setTotalPresentData(response.data);
    });
  };

  let age;
  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-6 min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-bold text-3xl sm:text-4xl bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Welcome back! Here&apos;s your attendance overview for{' '}
            {moment(selectedMonth).format('MMMM YYYY')}.
          </p>
        </div>

        {/* Controls *
                <div className='flex flex-col xs:flex-row gap-3 sm:gap-4 w-full sm:w-auto'>
                    <div className="w-full xs:w-auto">
                        <MonthSelection selectedMonth={setSelectedMonth} />
                    </div>
                    <div className="w-full xs:w-auto">
                        <AgeGroupSelect selectedGroup={setSelectedAgeGroup} />
                    </div>
                </div>
                */}
      </div>

      {/* Status Cards */}
      <div className="w-full">
        <StatusList kidList={kidList} />
      </div>

      {/* Daily Attendance List */}
      <div className="w-full">
        <DailyAttendance />
      </div>

      {/* Charts Section */}

      {/*<div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>*/}
      {/* Bar Chart - Takes 2 columns on xl screens */}
      {/*
                <div className='xl:col-span-2'>
                    <div className="bg-card/80 backdrop-blur-sm dark:bg-card/90 rounded-xl border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-3 h-6 bg-gradient-to-b from-primary to-info rounded-full"></div>
                            <h3 className="text-xl font-semibold text-foreground">
                                Daily Attendance Trends
                            </h3>
                        </div>
                        <div className="h-[350px] sm:h-[400px]">
                            <BarChartComponent
                                attendanceList={attendanceList}
                                totalPresentData={totalPresentData}
                            />
                        </div>
                    </div>
                </div>
                */}

      {/* Pie Chart - Takes 1 column */}
      {/*
                <div className='xl:col-span-1'>
                    <div className="bg-card/80 backdrop-blur-sm dark:bg-card/90 rounded-xl border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-3 h-6 bg-gradient-to-b from-success to-warning rounded-full"></div>
                            <h3 className="text-xl font-semibold text-foreground">
                                Monthly Distribution
                            </h3>
                        </div>
                        <div className="h-[350px] sm:h-[400px] flex items-center justify-center">
                            <PieChartComponent attendanceList={attendanceList} />
                        </div>
                    </div>
                </div>
            </div>
            */}

      {/* Additional Info Cards */}
      {/*<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">*/}
      {/*    <div className="bg-gradient-to-br from-primary/10 to-info/10 dark:from-primary/20 dark:to-info/20 rounded-lg p-4 border border-primary/20">*/}
      {/*        <div className="flex items-center gap-2">*/}
      {/*            <div className="w-2 h-2 bg-primary rounded-full"></div>*/}
      {/*            <span className="text-sm font-medium text-muted-foreground">Average Daily</span>*/}
      {/*        </div>*/}
      {/*        <p className="text-2xl font-bold text-primary mt-1">85%</p>*/}
      {/*    </div>*/}

      {/*    <div className="bg-gradient-to-br from-success/10 to-success/5 dark:from-success/20 dark:to-success/10 rounded-lg p-4 border border-success/20">*/}
      {/*        <div className="flex items-center gap-2">*/}
      {/*            <div className="w-2 h-2 bg-success rounded-full"></div>*/}
      {/*            <span className="text-sm font-medium text-muted-foreground">Peak Day</span>*/}
      {/*        </div>*/}
      {/*        <p className="text-2xl font-bold text-success mt-1">95%</p>*/}
      {/*    </div>*/}

      {/*    <div className="bg-gradient-to-br from-warning/10 to-warning/5 dark:from-warning/20 dark:to-warning/10 rounded-lg p-4 border border-warning/20">*/}
      {/*        <div className="flex items-center gap-2">*/}
      {/*            <div className="w-2 h-2 bg-warning rounded-full"></div>*/}
      {/*            <span className="text-sm font-medium text-muted-foreground">Low Day</span>*/}
      {/*        </div>*/}
      {/*        <p className="text-2xl font-bold text-warning mt-1">65%</p>*/}
      {/*    </div>*/}

      {/*    <div className="bg-gradient-to-br from-info/10 to-info/5 dark:from-info/20 dark:to-info/10 rounded-lg p-4 border border-info/20">*/}
      {/*        <div className="flex items-center gap-2">*/}
      {/*            <div className="w-2 h-2 bg-info rounded-full"></div>*/}
      {/*            <span className="text-sm font-medium text-muted-foreground">Trend</span>*/}
      {/*        </div>*/}
      {/*        <p className="text-2xl font-bold text-info mt-1">↗ +5%</p>*/}
      {/*    </div>*/}
      {/*</div>*/}
    </div>
  );
}

export default Dashboard;
