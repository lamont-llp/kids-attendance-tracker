'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm, FormProvider } from 'react-hook-form';
import GlobalApi from '@/app/services/GlobalApi';
import { CreateKidRequest, AgeGroup } from '@/app/services/GlobalApi';
import { toast } from 'sonner';
import { LoaderIcon } from 'lucide-react';
import AgeGroupSelect from '@/app/_components/AgeGroupSelect';
import { Checkbox } from '@/components/ui/checkbox';

interface AddNewKidProps {
  refreshData: () => void; // Add refreshData to the props interface
}

function AddNewKid({ refreshData }: AddNewKidProps) {
  const [open, setOpen] = useState(false);
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [kidAge, setKidAge] = useState<string>('');
  const [ageGroup, setAgeGroup] = useState<string>('');
  const methods = useForm<CreateKidRequest>();
  const [checked, setChecked] = React.useState(false);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = methods;

  const onSubmit = async (data: CreateKidRequest) => {
    setLoading(true);
    if (!data.name || !kidAge) {
      toast('Name and Age are required');
      return;
    }

    try {
      // Use the actual numeric age and the determined age group
      const kidData = {
        ...data,
        age: kidAge, // Store the actual numeric age
      };

      const response = await GlobalApi.CreateNewKid(kidData);
      console.log('Kid created:', response.data);
      toast('Kid successfully added!');

      // Reset form or close modal
      setLoading(false);
      setKidAge('');
      setAgeGroup('');
      reset();
      refreshData();
      setOpen(false);
    } catch (error) {
      console.error('Error creating kid:', error);
      toast('Failed to add kid.');
    }
  };

  const GetAllAgeGroupsList = () => {
    GlobalApi.GetAllAgeGroups().then((response) => {
      setAgeGroups(response.data);
    });
  };

  useEffect(() => {
    GetAllAgeGroupsList();
  }, []);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>+ Add New Kid</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Kid</DialogTitle>
            <DialogDescription>Add a new kid to the attendance system.</DialogDescription>

            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <FormItem className="py-2">
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Eg. John Smith" {...register('name', { required: true })} />
                  </FormControl>
                </FormItem>
                <FormItem className="py-2">
                  <FormLabel>Age</FormLabel>
                  <Input
                    type="number"
                    placeholder="Eg. 4"
                    value={kidAge}
                    onChange={(e) => setKidAge(e.target.value)}
                    min="2"
                    max="13"
                  />
                </FormItem>
                <FormItem className="flex flex-col py-2">
                  <FormLabel>Age Group (automatically determined)</FormLabel>
                  <FormControl>
                    <AgeGroupSelect age={kidAge} selectedAgeGroup={setAgeGroup} />
                  </FormControl>
                </FormItem>
                <FormItem className="py-2">
                  <FormLabel>Contact number</FormLabel>
                  <Input type="number" placeholder="Eg. 0823456789" {...register('contact')} />
                </FormItem>
                <FormItem className="py-2">
                  <FormLabel>Address</FormLabel>
                  <Input
                    placeholder="Eg. 123 Left Street, Eldorado Park"
                    {...register('address')}
                  />
                </FormItem>
                <FormField
                  control={methods.control}
                  name="isVisitor"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Visitor?</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormItem className="flex gap-3 items-center justify-end mt-5">
                  <Button type="button" onClick={() => setOpen(false)} variant="ghost">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? <LoaderIcon className="animate-spin" /> : 'Save'}
                  </Button>
                </FormItem>
              </form>
            </FormProvider>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewKid;
