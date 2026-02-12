"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Trash, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Kid } from "@/utils/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import GlobalApi from "@/app/services/GlobalApi";
import { toast } from "sonner";
import EditKid from "./EditKid";

interface KidWithGuardian extends Kid {
  guardian_name?: string | null;
}

interface KidsTableProps {
  kidList?: KidWithGuardian[];
  refreshData: () => void;
}

const KidsTable: React.FC<KidsTableProps> = ({ kidList, refreshData }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedKid, setSelectedKid] = useState<KidWithGuardian | null>(null);

  const handleEditClick = (kid: KidWithGuardian) => {
    setSelectedKid(kid);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (kid: KidWithGuardian) => {
    setSelectedKid(kid);
    setDeleteDialogOpen(true);
  };

  const DeleteRecord = () => {
    if (!selectedKid) return;
    
    GlobalApi.DeleteKidRecord(selectedKid.id).then((res) => {
      if (res) {
        toast.success('Record deleted successfully!');
        refreshData();
        setDeleteDialogOpen(false);
        setSelectedKid(null);
      }
    }).catch(() => {
      toast.error('Failed to delete record');
    });
  };

  if (!kidList) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const columns: ColumnDef<KidWithGuardian>[] = [
    {
      accessorKey: "id",
      id: "id",
      header: "ID",
      enableHiding: true,
    },
    {
      accessorKey: "name",
      id: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <span className="font-medium">{row.original.name}</span>;
      },
    },
    {
      accessorKey: "age",
      id: "age",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Age
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <span className="text-sm">{row.original.age}</span>;
      },
    },
    {
      accessorKey: "contact",
      id: "contact",
      header: "Contact",
      cell: ({ row }) => {
        const contact = row.original.contact;
        if (!contact || contact === 'N/A') {
          return (
            <div className="flex items-center gap-2 px-2 py-1 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 rounded">
              <AlertTriangle className="h-3 w-3" />
              <span className="text-sm">N/A</span>
            </div>
          );
        }
        return (
          <a href={`tel:${contact}`} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
            {contact}
          </a>
        );
      },
    },
    {
      accessorKey: "guardian_name",
      id: "guardian",
      header: "Parent/Guardian",
      cell: ({ row }) => {
        const guardianName = row.original.guardian_name;
        if (!guardianName || guardianName === 'N/A') {
          return (
            <div className="flex items-center gap-2 px-2 py-1 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 rounded">
              <AlertTriangle className="h-3 w-3" />
              <span className="text-sm">N/A</span>
            </div>
          );
        }
        return <span className="text-sm">{guardianName}</span>;
      },
    },
    {
      accessorKey: "address",
      id: "address",
      header: "Address",
      cell: ({ row }) => {
        const address = row.original.address;
        if (!address || address === 'N/A') {
          return (
            <div className="flex items-center gap-2 px-2 py-1 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 rounded w-fit">
              <AlertTriangle className="h-3 w-3" />
              <span className="text-sm">N/A</span>
            </div>
          );
        }
        return (
          <span className="text-sm max-w-[250px] truncate block" title={address}>
            {address}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleEditClick(row.original)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => handleDeleteClick(row.original)}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-secondary border px-4 py-2 w-fit rounded-lg">
        <span className="text-sm font-medium">Total Kids: {kidList.length}</span>
      </div>

      <DataTable
        columns={columns}
        data={kidList}
        searchKey="name"
        searchPlaceholder="Search by name..."
      />

      {/* Edit Dialog */}
      {selectedKid && (
        <EditKid
          kid={selectedKid}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          refreshData={refreshData}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the record for{" "}
              <span className="font-semibold">{selectedKid?.name}</span> and remove the data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedKid(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={DeleteRecord}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KidsTable;
