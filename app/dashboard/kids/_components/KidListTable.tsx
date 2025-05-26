import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { themeQuartz } from 'ag-grid-community';
import { ModuleRegistry, AllCommunityModule, ColDef } from 'ag-grid-community';
import {Kid} from "@/types/Kid";
import {Button} from "@/components/ui/button";
import {Search, Trash} from "lucide-react";


interface KidListTableProps {
    kidList?: Kid[];
}

function KidListTable({ kidList }: KidListTableProps) {
    ModuleRegistry.registerModules([AllCommunityModule]);

    const CustomButtons = (props: Element) => {
      return <Button variant="destructive"><Trash/></Button>
    }
    const [colDefs, setColDefs] = useState<ColDef[]>([
        { field: "id", filter: true },
        { field: "name", filter: true },
        { field: "age", filter: true },
        { field: "address", filter: true },
        { field: "contact", filter: true },
        { field: 'action', cellRenderer: CustomButtons}
    ]);

    const [rowData, setRowData] = useState<Kid[]>([]);
    const [searchInput, setSearchInput] = useState('')

    useEffect(() => {
        if (kidList && Array.isArray(kidList)) {
            setRowData(kidList);
        }
    }, [kidList]);

    return (
        <div>
            <div className="mt-2 mb-2">
                <h2 className="bg-secondary border p-3 w-40 rounded-lg">Total Kids: {kidList?.length}</h2>
            </div>
            <div style={{ height: 500 }}>
                <div className="p-2 rounded-lg border shadow-sm mb-4 flex gap-2 max-w-sm">
                    <Search/>
                    <input type={"text"} placeholder={"Search for..."
                    } className="outline-none w-full"
                    onChange={(event) => setSearchInput(event.target.value)}/>
                </div>
                <AgGridReact<Kid>
                    theme={themeQuartz}
                    rowData={rowData}
                    columnDefs={colDefs}
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