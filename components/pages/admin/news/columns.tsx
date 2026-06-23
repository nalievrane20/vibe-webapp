"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export type NewsRow = {
  id: number;
  title: string;
  image: string | null;
  description: string | null;
  news_date: Date;
};

export const columns = (
  onEdit: (news: NewsRow) => void,
  onDelete: (news: NewsRow) => void,
): ColumnDef<NewsRow>[] => [

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
    header: "News",
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
    accessorKey: "newsDate",
    header: "News Date",
    cell: ({ row }) => new Date(row.original.news_date).toLocaleDateString(),
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