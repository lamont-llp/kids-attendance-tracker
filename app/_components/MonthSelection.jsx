"use client"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {Button} from "../../components/ui/button";
import {CalendarDays} from "lucide-react";
import {addMonths} from 'date-fns';
import {useState} from "react";
import moment from "moment";

function MonthSelection({selectedMonth}) {
    const today = new Date();
    const nextMonths = addMonths(new Date(), 0);
    const [month, setMonth] = useState(nextMonths);

    return (
        <div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="flex gap-2 items-center text-slate-500">
                        <CalendarDays className="h-5 w-5"/>
                        {moment(month).format('MMM YYYY')}
                    </Button>
                </PopoverTrigger>
                <PopoverContent>
                    <Calendar
                        mode="single"
                        selected={month}
                        onSelect={(date) => {
                            setMonth(date);
                            selectedMonth(date);
                        }}
                        className="rounded-md border"
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}

export default MonthSelection