"use client";

import { useTransition } from "react";

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

import { deleteEvent } from "@/app/actions/admin/event";

type DeleteEventDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: number | null;
};

export function DeleteEventDialog({
  open,
  onOpenChange,
  eventId,
}: DeleteEventDialogProps) {
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!eventId) return;

    startTransition(async () => {
      await deleteEvent(eventId);
      onOpenChange(false);
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Event?</AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={pending}
            className="bg-red-600 hover:bg-red-700"
          >
            {pending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
