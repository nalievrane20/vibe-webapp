"use client";

import { useState } from "react";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { columns, UserRow } from "./columns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import { UserFormDialog } from "./user-form-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";

type Course = {
  id: number;
  title: string;
};

export function UserTable({
  data,
  courses,
}: {
  data: UserRow[];
  courses: Course[];
}) {
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleAdd = () => {
    setSelectedUser(null);
    setOpen(true);
  };

  const handleEdit = (user: UserRow) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleDelete = (user: UserRow) => {
    setSelectedId(user.id);
    setOpenDelete(true);
  };

  const table = useReactTable({
    data,
    columns: columns(handleEdit, handleDelete),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      {/* HEADER */}
      <div className="flex items-center justify-between px-5">
        <h1 className="text-2xl font-bold">Users</h1>

        <Button onClick={handleAdd}>Add Student</Button>
      </div>

      {/* TABLE */}
      <div className="rounded-md border mx-5">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ADD / EDIT DIALOG */}
      <UserFormDialog
        open={open}
        onOpenChange={setOpen}
        courses={courses}
        user={selectedUser ?? undefined}
      />

      {/* DELETE DIALOG */}
      <DeleteUserDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        userId={selectedId}
      />
    </>
  );
}