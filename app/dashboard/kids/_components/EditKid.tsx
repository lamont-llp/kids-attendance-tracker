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
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm, FormProvider } from 'react-hook-form';
import GlobalApi from '@/app/services/GlobalApi';
import { CreateKidRequest, AgeGroup } from '@/app/services/GlobalApi';
import { toast } from 'sonner';
import { LoaderIcon } from 'lucide-react';
import { Kid } from '@/utils/schema';
import AgeGroupSelect from '@/app/_components/AgeGroupSelect';
import { Checkbox } from '@/components/ui/checkbox';

interface EditKidProps {
  kid: Kid;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refreshData: () => void;
}

function EditKid({ kid, open, onOpenChange, refreshData }: EditKidProps) {
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [kidAge, setKidAge] = useState<string>(kid.age?.toString() || '');
  const [ageGroup, setAgeGroup] = useState<string>('');

  const methods = useForm<CreateKidRequest>({
    defaultValues: {
      name: kid.name || '',
      contact: kid.contact || '',
      address: kid.address || '',
      isVisitor: kid.isVisitor || false,
    },
  });

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = methods;

  // Reset form when kid changes or dialog opens
  useEffect(() => {
    if (open && kid) {
      setKidAge(kid.age?.toString() || '');
      reset({
        name: kid.name || '',
        contact: kid.contact || '',
        address: kid.address || '',
        isVisitor: kid.isVisitor || false,
      });
    }
  }, [open, kid, reset]);

  const onSubmit = async (data: CreateKidRequest) => {
    setLoading(true);
    if (!data.name || !kidAge) {
      toast('Name and Age are required');
      setLoading(false);
      return;
    }

    try {
      const kidData = {
        ...data,
        age: kidAge,
        id: kid.id, // Include the kid's ID for the update
      };

      const response = await GlobalApi.UpdateKid(kidData); // You'll need to create this API method
      console.log('Kid updated:', response.data);
      toast('Kid successfully updated!');

      setLoading(false);
      refreshData();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating kid:', error);
      toast('Failed to update kid.');
      setLoading(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Kid</DialogTitle>
          <DialogDescription>
            Update the kid&apos;s information in the attendance system.
          </DialogDescription>

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
                <Input placeholder="Eg. 123 Left Street, Eldorado Park" {...register('address')} />
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
                <Button type="button" onClick={() => onOpenChange(false)} variant="ghost">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <LoaderIcon className="animate-spin" /> : 'Update'}
                </Button>
              </FormItem>
            </form>
          </FormProvider>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default EditKid;
