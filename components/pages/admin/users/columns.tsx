"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export type UserRow = {
  id: number;
  student_id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  course?: { id: number; title: string } | null;
  createdAt: Date;
};

export const columns = (
  onEdit: (user: UserRow) => void,
  onDelete: (user: UserRow) => void,
): ColumnDef<UserRow>[] => [

  {
    accessorKey: "student_id",
    header: "Student ID",
  },

  {
    id: "name",
    header: "Name",
    cell: ({ row }) => {
      const { first_name, middle_name, last_name } = row.original;
      const fullName = [first_name, middle_name, last_name]
        .filter(Boolean)
        .join(" ");

      return <span className="font-medium">{fullName}</span>;
    },
  },

  {
    accessorKey: "email",
    header: "Email",
  },

  {
    id: "course",
    header: "Course",
    cell: ({ row }) => {
      const course = row.original.course;

      if (!course) {
        return (
          <span className="text-xs text-muted-foreground">
            No course
          </span>
        );
      }

      return <span>{course.title}</span>;
    },
  },

  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;

      return (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            role === "ADMIN"
              ? "bg-purple-100 text-purple-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {role}
        </span>
      );
    },
  },

  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
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