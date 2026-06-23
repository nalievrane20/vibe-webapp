"use client";

import { useState } from "react";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { columns, EventRow } from "./columns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { EventFormDialog } from "./event-form-dialog";
import { DeleteEventDialog } from "./delete-event-dialog";

type Course = {
  id: number;
  title: string;
};

export function EventTable({
  data,
  courses,
}: {
  data: EventRow[];
  courses: Course[];
}) {
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleAdd = () => {
    setSelectedEvent(null);
    setOpen(true);
  };

  const handleEdit = (event: EventRow) => {
    setSelectedEvent(event);
    setOpen(true);
  };

  const handleDelete = (event: EventRow) => {
    setSelectedId(event.id);
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
        <h1 className="text-2xl font-bold">Events</h1>

        <Button onClick={handleAdd}>Add Event</Button>
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
      <EventFormDialog
        open={open}
        onOpenChange={setOpen}
        courses={courses}
        event={selectedEvent ?? undefined}
      />

      {/* DELETE DIALOG */}
      <DeleteEventDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        eventId={selectedId}
      />
    </>
  );
}
