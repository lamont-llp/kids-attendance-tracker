"use client"

import React, {useEffect, useState} from 'react'
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {Input} from "@/components/ui/input";
import {useForm, FormProvider} from "react-hook-form";
import GlobalApi from "@/app/services/GlobalApi";
import {CreateKidRequest, AgeGroup} from "@/app/services/GlobalApi";

function AddNewKid() {
    const [open, setOpen] = useState(false)
    const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([])
    const methods = useForm<CreateKidRequest>();
    const { handleSubmit, register, reset, formState: { errors } } = methods;


    const onSubmit = async (data: CreateKidRequest) => {
        if (!data.name || !data.age) {
            alert("Name and Age Group are required");
            return;
        }

        try {
            const response = await GlobalApi.CreateNewKid(data);
            console.log("Kid created:", response.data);
            alert("Kid successfully added!");

            // Reset form or close modal
            setOpen(false);
        } catch (error) {
            console.error("Error creating kid:", error);
            alert("Failed to add kid.");
        }
    };


    const GetAllAgeGroupsList = () => {
        GlobalApi.GetAllAgeGroups().then((response) => {
            setAgeGroups(response.data);
        })
    }

    useEffect(() => {
        GetAllAgeGroupsList()
    },[])


    return (
        <div>
            <Button onClick={ ()=>setOpen(true) } >+ Add New Kid</Button>

            <Dialog open={open}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Kid</DialogTitle>
                        <DialogDescription>
                            Add a new kid to the attendance system.
                        </DialogDescription>

                            <FormProvider {...methods}>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <FormItem className='py-2'>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Eg. John Smith"
                                                   {...register('name', { required: true })}/>
                                        </FormControl>
                                    </FormItem>
                                    <FormItem className='flex flex-col py-2'>
                                        <FormLabel>Select Age Group</FormLabel>
                                        <FormControl>
                                            <select className='p-3 border rounded-lg'
                                                    {...register('age', { required: true })}>
                                                {ageGroups.map((item, index) => (
                                                    <option key={index} value={item.group}>{item.group}</option>
                                                ))}
                                            </select>
                                        </FormControl>
                                    </FormItem>
                                    <FormItem className='py-2'>
                                        <FormLabel>Contact number</FormLabel>
                                        <Input type="number" placeholder="Eg. 0823456789"
                                               {...register('contact')}/>
                                    </FormItem>
                                    <FormItem className='py-2'>
                                        <FormLabel>Address</FormLabel>
                                        <Input placeholder="Eg. 123 Left Street, Eldorado Park"
                                               {...register('address')}/>
                                    </FormItem>

                                    <FormItem className='flex gap-3 items-center justify-end mt-5'>
                                        <Button onClick={()=>setOpen(false)} variant="ghost">Cancel</Button>
                                        <Button
                                            type="submit">Save</Button>
                                    </FormItem>
                                </form>
                            </FormProvider>

                    </DialogHeader>
                </DialogContent>
            </Dialog>

        </div>
    )
}

export default AddNewKid
