"use client";

import { useState } from "react";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { columns, NewsRow } from "./columns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { NewsFormDialog } from "./news-form-dialog";
import { DeleteNewsDialog } from "./delete-news-dialog";

export function NewsTable({
  data,
}: {
  data: NewsRow[];
}) {
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsRow | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleAdd = () => {
    setSelectedNews(null);
    setOpen(true);
  };

  const handleEdit = (news: NewsRow) => {
    setSelectedNews(news);
    setOpen(true);
  };

  const handleDelete = (news: NewsRow) => {
    setSelectedId(news.id);
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
        <h1 className="text-2xl font-bold">News</h1>

        <Button onClick={handleAdd}>Add News</Button>
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
      <NewsFormDialog
        open={open}
        onOpenChange={setOpen}
        news={selectedNews ?? undefined}
      />

      {/* DELETE DIALOG */}
      <DeleteNewsDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        newsId={selectedId}
      />
    </>
  );
}