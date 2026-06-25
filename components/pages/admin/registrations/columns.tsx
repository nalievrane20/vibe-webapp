"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import Link from "next/link";

export type RegistrationEventRow = {
  id: number;
  title: string;
  image: string | null;
  event_date: Date;
  fee: number | null;

  _count: {
    registrations: number;
  };
};

export const columns: ColumnDef<RegistrationEventRow>[] = [
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
    accessorKey: "event_date",
    header: "Event Date",
    cell: ({ row }) =>
      new Date(row.original.event_date).toLocaleDateString(),
  },

  {
    header: "Type",
    cell: ({ row }) =>
      row.original.fee && row.original.fee > 0
        ? `₱${row.original.fee}`
        : "Free",
  },

  {
    header: "Registrants",
    cell: ({ row }) => row.original._count.registrations,
  },

  {
    id: "actions",
    cell: ({ row }) => (
      <Link href={`/admin/registrations/${row.original.id}`}>
        <Button size="icon" variant="outline">
          <Users className="h-4 w-4" />
        </Button>
      </Link>
    ),
  },
];