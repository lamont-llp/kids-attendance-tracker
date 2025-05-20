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
import {useForm} from "react-hook-form";
import GlobalApi from "@/app/services/GlobalApi";
import {NextResponse} from "next/server";
import {CreateKidRequest} from "@/app/services/GlobalApi";

function AddNewKid() {
    const [open, setOpen] = useState(false)
    const [ageGroups, setAgeGroups] = useState([])
    const { register, handleSubmit, watch, formState: { errors } } = useForm();

    const onSubmit = async (data: Response) => {
        console.log('FormData', data);

        GlobalApi.CreateNewKid(data).then(response => {
            console.log("--",response);
        })
        console.log("Received data:", data);

        if (!data?.name || !data?.ageGroup) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
    }

    const GetAllAgeGroupsList = () => {
        GlobalApi.GetAllAgeGroups().then((response) => {
            setAgeGroups(response.data);
        })
    }

    useEffect(() => {
        GetAllAgeGroupsList()
    },[])

    const form = useForm()

    return (
        <div>
            <Button onClick={ ()=>setOpen(true) } >+ Add New Kid</Button>

            <Dialog open={open}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Kid</DialogTitle>
                        <DialogDescription>

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
                                                {...register('ageGroup', { required: true })}>
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

                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

        </div>
    )
}

export default AddNewKid
