"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GlobalApi from "@/app/services/GlobalApi";
import { toast } from "sonner";
import { Search, CheckCircle } from "lucide-react";
import moment from "moment";

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
  }, []);

  // Filter kids based on search input
  useEffect(() => {
    if (searchInput.trim() === '') {
      setFilteredKids([]);
    } else {
      const filtered = kidsList.filter(kid => 
        kid.name.toLowerCase().includes(searchInput.toLowerCase())
      );
      setFilteredKids(filtered);
    }
  }, [searchInput, kidsList]);

  // Fetch all kids from the API
  const fetchAllKids = async () => {
    setIsLoading(true);
    try {
      const response = await GlobalApi.GetAllKids();
      if (response.data && Array.isArray(response.data)) {
        setKidsList(response.data);
      }
    } catch (error) {
      console.error("Error fetching kids:", error);
      toast.error("Failed to load kids data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle check-in for a kid
  const handleCheckIn = (kid: Kid) => {
    const today = new Date();
    const day = today.getDate();
    const date = moment(today).format("MM/yyyy");

    const data = {
      day: day.toString(),
      kidId: kid.id,
      present: true,
      date: date,
    };

    setIsLoading(true);
    GlobalApi.MarkAttendance(data)
      .then(() => {
        toast.success(`${kid.name} has been checked in successfully!`);
        setCheckedInKids([...checkedInKids, kid.id]);
      })
      .catch((error) => {
        console.error("Error checking in:", error);
        toast.error(`Failed to check in ${kid.name}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Clear search input
  const clearSearch = () => {
    setSearchInput('');
    setFilteredKids([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Kids Check-In</CardTitle>
          <p className="text-muted-foreground mt-2">
            Search for your child's name and check them in
          </p>
        </CardHeader>
        <CardContent>
          {/* Search Input */}
          <div className="relative mb-8">
            <div className="flex items-center border-2 rounded-lg p-3 shadow-sm">
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
                  className="ml-2"
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
                          <p className="text-sm text-gray-500">Age: {kid.age}</p>
                        </div>
                        <Button
                          onClick={() => handleCheckIn(kid)}
                          disabled={isLoading || checkedInKids.includes(kid.id)}
                          className={checkedInKids.includes(kid.id) ? "bg-green-600" : ""}
                        >
                          {checkedInKids.includes(kid.id) ? (
                            <>
                              <CheckCircle className="mr-1" /> Checked In
                            </>
                          ) : (
                            "Check In"
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
                Please type your child's name in the search box above to check them in
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KioskPage;
