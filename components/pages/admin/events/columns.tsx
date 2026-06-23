"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export type EventRow = {
  id: number;
  title: string;
  image: string | null;
  description: string | null;
  event_date: Date;
  courses: { id: number; title: string }[];
};

export const columns = (
  onEdit: (event: EventRow) => void,
  onDelete: (event: EventRow) => void,
): ColumnDef<EventRow>[] => [
 
{
  accessorKey: "image",
  header: "Image",
  cell: ({ row }) => {
    const image = row.original.image;

    if (!image) {
      return (
        <span className="text-xs text-muted-foreground">
          No image
        </span>
      );
    }

    return (
      <img
        src={image}
        alt={row.original.title}
        className="h-10 w-10 rounded object-cover border"
      />
    );
  },
},
  
  {
    accessorKey: "title",
    header: "Event",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <p className="line-clamp-2 max-w-[250px] text-sm text-muted-foreground">
        {row.getValue("description")}
      </p>
  ),
  },
  {
    accessorKey: "eventDate",
    header: "Event Date",
    cell: ({ row }) => new Date(row.original.event_date).toLocaleDateString(),
  },
  {
    header: "Courses",
    cell: ({ row }) => row.original.courses.length,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          size="icon"
          variant="outline"
          onClick={() => onEdit(row.original)}
        >
          <Pencil className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant="destructive"
          onClick={() => onDelete(row.original)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
