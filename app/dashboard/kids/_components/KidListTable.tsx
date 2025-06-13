import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { themeAlpine } from 'ag-grid-community';
import { ModuleRegistry, AllCommunityModule, ColDef } from 'ag-grid-community';
import {Kid} from "@/types/Kid";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {Button} from "@/components/ui/button";
import {Search, Trash} from "lucide-react";
import GlobalApi from "@/app/services/GlobalApi";
import {toast} from "sonner";
import { getAgeGroupFromAge } from "@/app/_components/AgeGroupSelect";

interface KidListTableProps {
    kidList?: Kid[];
    refreshData: () => void; // Add refreshData to the props interface
}

function KidListTable({ kidList, refreshData }: KidListTableProps) { // Fix: Single parameter object
    ModuleRegistry.registerModules([AllCommunityModule]);

    const CustomButtons = (props: any) => {
        return (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive"><Trash/></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the record
                            and remove the data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => DeleteRecord(props.data?.id)}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )
    }

    const [colDefs, setColDefs] = useState<ColDef[]>([
        { field: "id", filter: true },
        { field: "name", filter: true },
        { 
            field: "age", 
            headerName: "Age", 
            filter: true,
            valueFormatter: (params) => {
                const age = params.value;
                const ageGroup = getAgeGroupFromAge(age);
                return `${age} (${ageGroup})`;
            }
        },
        { field: "guardian", filter: true },
        { field: "contact", filter: true },
        { field: "address", filter: true },
        { field: 'action', cellRenderer: CustomButtons}
    ]);

    const [rowData, setRowData] = useState<Kid[]>([]);
    const defaultColDef = {
        editable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
    };
    const [searchInput, setSearchInput] = useState('')

    useEffect(() => {
        if (kidList && Array.isArray(kidList)) {
            setRowData(kidList);
        }
    }, [kidList]);

    const DeleteRecord = (id: number) => {
        GlobalApi.DeleteKidRecord(id).then(res => {
            if (res) {
                toast('Record deleted successfully!')
                refreshData()
            }
        })
    }

    return (
        <div>
            <div className="mt-2 mb-2">
                <h2 className="bg-secondary border p-3 w-40 rounded-lg">Total Kids: {kidList?.length}</h2>
            </div>
            <div style={{ height: 940, margin: 'auto', display: "flex", flexDirection: "column" }}>
                <div className="p-2 rounded-lg border shadow-sm mb-4 flex gap-2 max-w-sm">
                    <Search/>
                    <input type={"text"} placeholder={"Search for..."
                    } className="outline-none w-full"
                           onChange={(event) => setSearchInput(event.target.value)}/>
                </div>
                <AgGridReact<Kid>
                    theme={themeAlpine}
                    rowData={rowData}
                    columnDefs={colDefs}
                    defaultColDef={defaultColDef}
                    pagination={true}
                    paginationPageSize={20}
                    paginationPageSizeSelector={true}
                    quickFilterText={searchInput}
                />
            </div>
        </div>
    );
}

export default KidListTable;
