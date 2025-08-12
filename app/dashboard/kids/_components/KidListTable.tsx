import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { themeAlpine } from 'ag-grid-community';
import { ModuleRegistry, AllCommunityModule, ColDef } from 'ag-grid-community';
import { Kid } from '@/utils/schema';
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
} from '@/components/ui/alert-dialog';

import { Button } from '@/components/ui/button';
import { Search, Trash, Edit } from 'lucide-react';
import GlobalApi from '@/app/services/GlobalApi';
import { toast } from 'sonner';
import EditKid from './EditKid';

interface KidListTableProps {
  kidList?: Kid[];
  refreshData: () => void;
}

function KidListTable({ kidList, refreshData }: KidListTableProps) {
  ModuleRegistry.registerModules([AllCommunityModule]);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedKid, setSelectedKid] = useState<Kid | null>(null);

  const handleEditClick = (kid: Kid) => {
    setSelectedKid(kid);
    setEditDialogOpen(true);
  };

  const warningCellStyle = (params: any): { [key: string]: string } => {
    const val = params.value;
    if (!val || val === 'N/A') {
      return {
        backgroundColor: '#ffe6e6',
        color: '#a94442',
      };
    }
    return {}; // empty object is fine
  };

  const CustomButtons = (props: any) => {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => handleEditClick(props.data)}>
          <Edit className="w-4 h-4" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the record and remove the
                data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => DeleteRecord(props.data?.id)}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };

  const [colDefs, setColDefs] = useState<ColDef[]>([
    { field: 'id', filter: true, hide: true },
    { field: 'name', filter: true },
    {
      field: 'age',
      headerName: 'Age',
      filter: true,
    },
    { field: 'contact', filter: true, cellStyle: warningCellStyle },
    {
      field: 'guardian_name',
      headerName: 'Parent/Guardian',
      filter: true,
      valueGetter: (params) => params.data.guardian_name || 'N/A',
      cellStyle: warningCellStyle,
    },
    { field: 'address', filter: true, cellStyle: warningCellStyle },
    {
      field: 'action',
      headerName: 'Actions',
      cellRenderer: CustomButtons,
      sortable: false,
      filter: false,
      width: 120,
    },
  ]);

  const [rowData, setRowData] = useState<Kid[]>([]);
  const defaultColDef = {
    editable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
  };
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (kidList && Array.isArray(kidList)) {
      setRowData(kidList);
    }
  }, [kidList]);

  const DeleteRecord = (id: number) => {
    GlobalApi.DeleteKidRecord(id).then((res) => {
      if (res) {
        toast('Record deleted successfully!');
        refreshData();
      }
    });
  };

  return (
    <div>
      <div className="mt-2 mb-2">
        <h2 className="bg-secondary border p-3 w-40 rounded-lg">Total Kids: {kidList?.length}</h2>
      </div>
      <div style={{ height: 940, margin: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div className="p-2 rounded-lg border shadow-sm mb-4 flex gap-2 max-w-sm">
          <Search />
          <input
            type={'text'}
            placeholder={'Search for...'}
            className="outline-none w-full"
            onChange={(event) => setSearchInput(event.target.value)}
          />
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

      {/* Edit Dialog */}
      {selectedKid && (
        <EditKid
          kid={selectedKid}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          refreshData={refreshData}
        />
      )}
    </div>
  );
}

export default KidListTable;
