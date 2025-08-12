import React, { useEffect, useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  ModuleRegistry,
  ColDef,
  CellValueChangedEvent,
} from 'ag-grid-community';
import moment from 'moment';
import GlobalApi from '../../../services/GlobalApi';
import { toast } from 'sonner';
import { getUniqueRecord } from '@/app/services/service';
import { Search } from 'lucide-react';

ModuleRegistry.registerModules([AllCommunityModule]);

interface AttendanceItem {
  kidId: number;
  day: number;
  name?: string;
  [key: string]: any;
}

interface AttendanceGridProps {
  attendanceList?: AttendanceItem[];
  selectedMonth?: string;
}

interface RowData {
  kidId: number;
  name: string;
  [key: number]: boolean;
}

function AttendanceGrid({ attendanceList, selectedMonth }: AttendanceGridProps) {
  const [rowData, setRowData] = useState<RowData[]>([]);
  const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState('');

  // Track window resize for responsive behavior
  useEffect(() => {
    // Set initial window width on client side
    setIsClient(true);
    setWindowWidth(window.innerWidth);

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Device breakpoints - use desktop as fallback for SSR
  const isMobile = isClient && windowWidth < 768;
  const isTablet = isClient && windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = !isClient || windowWidth >= 1024; // Default to desktop for SSR

  // Helper function to get Sundays in a month
  const getSundaysInMonth = (year: number, month: number): number[] => {
    const sundays: number[] = [];
    const date = new Date(year, month, 1);

    // Find first Sunday
    while (date.getDay() !== 0) {
      date.setDate(date.getDate() + 1);
    }

    // Collect all Sundays in the month
    while (date.getMonth() === month) {
      sundays.push(date.getDate());
      date.setDate(date.getDate() + 7);
    }

    return sundays;
  };

  // Get Sundays for the selected month
  const sundays = useMemo(() => {
    if (!selectedMonth) return [];

    const monthMoment = moment(selectedMonth, 'MM/YYYY');
    if (!monthMoment.isValid()) {
      console.error('Invalid date format:', selectedMonth);
      return [];
    }

    const year = monthMoment.year();
    const month = monthMoment.month();

    return getSundaysInMonth(year, month);
  }, [selectedMonth]);

  // Responsive column definitions
  const getResponsiveColDefs = useMemo((): ColDef[] => {
    // Don't generate responsive columns until client-side hydration
    if (!isClient) {
      return [
        {
          field: 'kidId',
          headerName: 'ID',
          filter: true,
          width: 80,
          maxWidth: 100,
          sortable: true,
        },
        {
          field: 'name',
          headerName: 'Student Name',
          filter: true,
          minWidth: 150,
          flex: 1,
          resizable: true,
          sortable: true,
        },
      ];
    }

    const baseColumns: ColDef[] = [
      {
        field: 'name',
        headerName: 'Student Name',
        filter: true,
        minWidth: isMobile ? 120 : 150,
        flex: isMobile ? 2 : 1,
        resizable: true,
        pinned: isMobile ? 'left' : undefined, // Pin name column on mobile
        sortable: true,
      },
    ];

    // Add kidId column only for desktop
    if (isDesktop) {
      baseColumns.unshift({
        field: 'kidId',
        headerName: 'ID',
        filter: true,
        width: 80,
        maxWidth: 100,
        sortable: true,
      });
    }

    if (selectedMonth && sundays.length > 0) {
      // For mobile: show only first 2-3 Sundays to prevent horizontal overflow
      const visibleSundays = isMobile ? sundays.slice(0, 4) : sundays;

      const sundayColumns: ColDef[] = visibleSundays.map((day) => ({
        field: day.toString(),
        headerName: isMobile
          ? moment(selectedMonth).date(day).format('D') // Just day number on mobile
          : moment(selectedMonth).date(day).format('ddd D'), // Full format on larger screens
        width: isMobile ? 60 : 90,
        maxWidth: isMobile ? 80 : 120,
        minWidth: isMobile ? 50 : 80,
        editable: true,
        cellRenderer: 'agCheckboxCellRenderer',
        cellEditor: 'agCheckboxCellEditor',
        sortable: false,
        resizable: !isMobile,
      }));

      baseColumns.push(...sundayColumns);
    }

    return baseColumns;
  }, [selectedMonth, sundays, isMobile, isTablet, isDesktop, windowWidth, isClient]);

  useEffect(() => {
    setColDefs(getResponsiveColDefs);
  }, [getResponsiveColDefs]);

  useEffect(() => {
    setIsLoading(true);

    // Process attendance data
    if (attendanceList && attendanceList.length > 0) {
      const userList = getUniqueRecord({ attendanceList });
      const updatedUserList = userList.map((obj: any) => {
        const newObj: RowData = { ...obj };
        sundays.forEach((day) => {
          newObj[day] = isPresent(obj.kidId, day);
        });
        return newObj;
      });
      setRowData(updatedUserList);
      setIsLoading(false);
    } else {
      // Fetch kids to show empty grid
      GlobalApi.GetAllKids()
        .then((response) => {
          if (response.data?.length > 0) {
            const emptyAttendance = response.data.map((kid: any) => {
              const record: RowData = { kidId: kid.id, name: kid.name };
              sundays.forEach((day) => (record[day] = false));
              return record;
            });
            setRowData(emptyAttendance);
          }
        })
        .catch((error) => {
          console.error('Error fetching kids:', error);
          setRowData([]);
        })
        .finally(() => setIsLoading(false));
    }
  }, [attendanceList, selectedMonth, sundays]);

  // Check if kid was present on a specific Sunday
  const isPresent = (kidId: number, day: number): boolean => {
    return attendanceList?.some((item) => item.day === day && item.kidId === kidId) || false;
  };

  // Mark attendance handler
  const onMarkAttendance = (day: string, kidId: number, presentStatus: boolean): void => {
    if (!selectedMonth) return;

    const date = moment(selectedMonth).format('MM/yyyy');
    if (presentStatus) {
      const data = {
        day: day,
        kidId: kidId,
        present: presentStatus,
        date: date,
      };

      GlobalApi.MarkAttendance(data).then((response) => {
        console.log('Mark attendance', response);
        toast('Kid Id: ' + kidId + ' Marked as present');
      });
    } else {
      GlobalApi.MarkAbsent(kidId, day, date).then((response) => {
        toast('Kid Id: ' + kidId + ' Marked as absent');
      });
    }
  };

  // Get responsive pagination size
  const getPaginationSize = (): number => {
    if (isMobile) return 10;
    if (isTablet) return 15;
    return 20;
  };

  return (
    <div className="w-full">
      <div className="p-2 rounded-lg border shadow-sm mb-4 flex gap-2 max-w-sm">
        <Search />
        <input
          type={'text'}
          placeholder={'Search for...'}
          className="outline-none w-full"
          onChange={(event) => setSearchInput(event.target.value)}
        />
      </div>
      {/* Only show responsive features after client-side hydration */}
      {isClient && isMobile && sundays.length > 4 && (
        <div className="p-3 bg-gray-100 mb-3 rounded text-xs font-medium text-gray-700">
          <span className="font-semibold">Note:</span> Showing first 4 Sundays. Total Sundays this
          month: {sundays.length}
        </div>
      )}

      {isLoading ? (
        <div
          className={`flex justify-center items-center h-48 ${isMobile ? 'text-sm' : 'text-base'}`}
        >
          Loading attendance data...
        </div>
      ) : (
        <div
          className={`
          ${
            isClient && isMobile
              ? 'h-[calc(100vh-250px)] min-h-[300px] max-h-[500px]'
              : isClient && isTablet
                ? 'h-[calc(100vh-220px)] min-h-[400px] max-h-[600px]'
                : 'h-[calc(100vh-200px)] min-h-[400px] max-h-[800px]'
          }
          ${isClient && isMobile ? '-mx-2 sm:mx-0' : ''}
          ag-grid-responsive
        `}
        >
          <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            onCellValueChanged={(e: CellValueChangedEvent) =>
              onMarkAttendance(e.colDef.field as string, e.data.kidId, e.newValue)
            }
            pagination={true}
            paginationPageSize={getPaginationSize()}
            paginationPageSizeSelector={!isMobile} // Hide on mobile
            // Responsive features
            suppressHorizontalScroll={false}
            suppressColumnVirtualisation={true}
            autoSizeStrategy={{
              type: 'fitGridWidth',
              defaultMinWidth: isMobile ? 50 : 100,
            }}
            // Mobile-specific optimizations
            suppressTouch={false}
            suppressScrollOnNewData={true}
            animateRows={!isMobile} // Disable animations on mobile for better performance
            suppressCellFocus={isMobile} // Prevents zoom on mobile input focus
            // Grid event handlers
            onGridReady={(params) => {
              // Delay sizing to ensure proper rendering
              setTimeout(() => {
                params.api.sizeColumnsToFit();
              }, 100);
            }}
            onGridSizeChanged={(params) => {
              params.api.sizeColumnsToFit();
            }}
            // Row and cell styling
            rowHeight={isMobile ? 35 : 40}
            headerHeight={isMobile ? 35 : 40}
            // Additional responsive props
            suppressMenuHide={false}
            defaultColDef={{
              sortable: true,
              filter: !isMobile, // Disable filters on mobile to save space
              resizable: !isMobile,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default AttendanceGrid;
