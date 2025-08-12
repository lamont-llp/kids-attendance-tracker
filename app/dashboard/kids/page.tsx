'use client';
import React, { useEffect, useState } from 'react';
import AddNewKid from '@/app/dashboard/kids/_components/AddNewKid';
import GlobalApi from '@/app/services/GlobalApi';
import KidListTable from '@/app/dashboard/kids/_components/KidListTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function Kid() {
  const [kidList, setKidList] = useState([]);

  useEffect(() => {
    GetAllKids();
  }, []);
  /**
   * Used to Get All Kids
   */
  const GetAllKids = () => {
    GlobalApi.GetAllKids().then((res) => {
      setKidList(res.data);
      console.log(res.data);
    });
  };
  return (
    <div className="p-7">
      <h2 className="font-bold text-2xl flex justify-between items-center">
        Kids
        <AddNewKid refreshData={GetAllKids} />
      </h2>

      <Card className="overflow-hidden mt-2">
        <CardContent className="p-2 h-dvh">
          <KidListTable kidList={kidList} refreshData={GetAllKids} />
        </CardContent>
      </Card>
    </div>
  );
}

export default Kid;
