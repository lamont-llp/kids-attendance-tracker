'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GlobalApi from '@/app/services/GlobalApi';
import { toast } from 'sonner';
import { Search, CheckCircle } from 'lucide-react';
import moment from 'moment';

interface Kid {
  id: number;
  name: string;
  age: string;
  address?: string;
  contact?: string;
  guardian_id?: number;
}

const KioskPage = () => {
  const [searchInput, setSearchInput] = useState<string>('');
  const [kidsList, setKidsList] = useState<Kid[]>([]);
  const [filteredKids, setFilteredKids] = useState<Kid[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [checkedInKids, setCheckedInKids] = useState<number[]>([]);

  // Fetch all kids on component mount
  useEffect(() => {
    fetchAllKids();
    fetchTodayCheckIns();

    // Pick a random background color for the card
    const randomIndex = Math.floor(Math.random() * backgroundColors.length);
    // @ts-expect-error - TS2322: Type 'string' is not assignable to type 'never'.
    setCardColor(backgroundColors[randomIndex]);
  }, []);

  /**
   * Fetch already checked-in kids for today
   */
  const fetchTodayCheckIns = async () => {
    try {
      setIsLoading(true);
      const today = new Date();
      const day = today.getDate();
      const date = moment(today).format('DD/MM/yyyy');

      // You might need to create a new API endpoint for this
      // For now we'll use the existing attendance endpoint
      const response = await GlobalApi.GetAttendanceList(undefined, date);

      if (response.data && Array.isArray(response.data)) {
        // Filter to only include present kids for today's date
        const todayCheckins = response.data.filter(
          (record) => record.present && Number(record.day) === day && record.date === date,
        );

        // Extract the kid IDs of those already checked in
        const checkedInKidIds = todayCheckins.map((record) => record.kidId);
        setCheckedInKids(checkedInKidIds);
      }
    } catch (error) {
      console.error("Error fetching today's check-ins:", error);
      toast.error("Failed to load today's attendance data");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter kids based on search input
  useEffect(() => {
    if (searchInput.trim() === '') {
      setFilteredKids([]);
    } else {
      const filtered = kidsList.filter((kid) =>
        kid.name.toLowerCase().includes(searchInput.toLowerCase()),
      );
      setFilteredKids(filtered);
    }
  }, [searchInput, kidsList]);

  /**
   * Fetch all kids from the API
   */
  const fetchAllKids = () => {
    setIsLoading(true);
    GlobalApi.GetAllKids()
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          setKidsList(response.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching kids:', error);
        toast.error('Failed to load kids data');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Handle check-in for a kid
  const handleCheckIn = async (kid: Kid) => {
    if (!kid.id || !kid.name) {
      toast.error('Invalid kid data');
      return;
    }

    const today = new Date();
    const currentHour = today.getHours();

    // Example operating hours check (7 AM to 8 PM)
    if (currentHour < 7 || currentHour > 20) {
      toast.error('Check-in is only available during operating hours (7 AM - 8   PM)');
      return;
    }

    const day = today.getDate();
    const date = moment(today).format('DD/MM/yyyy'); // Include day in date format

    const data = {
      day: day.toString(),
      kidId: kid.id,
      present: true,
      date: date,
      timestamp: today.toISOString(), // Add timestamp for precise tracking
    };

    const retryCount = 3;
    let attempts = 0;

    const attemptCheckIn = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await GlobalApi.MarkAttendance(data);

        // Successfully checked in
        toast.success(`${kid.name} has been checked in successfully!`);
        setCheckedInKids((prev) => [...prev, kid.id]);
      } catch (error: any) {
        console.error('Error checking in:', error);

        // Check if this is a 409 Conflict response (already checked in)
        if (error.response && error.response.status === 409) {
          toast.error(`${kid.name} is already checked in for today`);
          // Update the UI to show the kid as checked in
          setCheckedInKids((prev) => [...prev, kid.id]);
          return;
        }

        if (attempts < retryCount) {
          attempts++;
          toast.error(`Retrying check-in... (Attempt ${attempts}/${retryCount})`);
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second between retries
          return attemptCheckIn();
        }

        toast.error(`Failed to check in ${kid.name}. Please try again later.`);
      } finally {
        setIsLoading(false);
      }
    };

    await attemptCheckIn();
  };

  // Clear search input
  const clearSearch = () => {
    setSearchInput('');
    setFilteredKids([]);
  };

  const backgroundColors = [
    'bg-blue-100',
    'bg-green-100',
    'bg-yellow-100',
    'bg-red-100',
    'bg-purple-100',
  ];
  const [cardColor, setCardColor] = useState('bg-white');

  return (
    <div
      className="min-h-screen bg-gray-50 p-8 md:p-30"
      style={{
        backgroundImage: "url('/check in.jpeg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <img
        src="/logo.jpeg"
        alt="Logo"
        className="fixed bottom-4 right-4 w-20 h0auto cursor-pointer"
        style={{ zIndex: 100 }}
      />
      <Card className="max-w-8xl mx-auto bg-pink-100 text-black rounded 2xl shadow-md p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Check-In station for Awesome Kids!</CardTitle>
          <p className="text-muted-foreground mt-2">
            Search for your child&apos;s name and check them in
          </p>
        </CardHeader>
        <CardContent>
          {/* Search Input */}
          <div className="relative mb-8">
            <div className="flex items-center border-2 border-blue-400 bg-blue-100 rounded-lg p-3 shadow-md">
              <Search className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Type your child's name..."
                className="flex-1 outline-none text-lg"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="ml- text-blue-600 hover:text-blue-800"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Search Results */}
          {filteredKids.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Search Results:</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {filteredKids.map((kid) => (
                  <Card key={kid.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between p-4">
                        <div>
                          <h3 className="font-semibold text-lg">{kid.name}</h3>
                          <p className="text-sm text-gray-500">
                            <b className="font-semibold text-white">Age:</b> {kid.age}
                          </p>
                          <p className="text-sm text-gray-500">
                            <b className="font-semibold text-white">Contact:</b> {kid.contact}
                          </p>
                          <p
                            className={
                              kid.address ? 'text-sm text-gray-500' : 'bg-red-600 rounded-md'
                            }
                          >
                            <b className="font-semibold text-white">Address:</b> {kid.address}
                          </p>
                          {/*<p className={kid.guardian_id ? 'text-sm text-gray-500' : 'bg-red-600'}><b className='font-semibold text-white'>Parent/Guardian:</b> {kid.guardian_id}</p>*/}
                        </div>
                        <Button
                          onClick={() => handleCheckIn(kid)}
                          disabled={isLoading || checkedInKids.includes(kid.id)}
                          className={checkedInKids.includes(kid.id) ? 'bg-green-600' : ''}
                        >
                          {checkedInKids.includes(kid.id) ? (
                            <>
                              <CheckCircle className="mr-1" /> Checked In
                            </>
                          ) : (
                            'Check In'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : searchInput ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No children found with that name</p>
              <p className="text-sm mt-2">Please try a different name or ask for assistance</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">Welcome!</h3>
              <p className="text-gray-500">
                Please type your child&apos;s name in the search box above to check them in
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KioskPage;
