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

import { deleteNews } from "@/app/actions/admin/news";

type DeleteNewsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newsId: number | null;
};

export function DeleteNewsDialog({
  open,
  onOpenChange,
  newsId,
}: DeleteNewsDialogProps) {
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!newsId) return;

    startTransition(async () => {
      await deleteNews(newsId);
      onOpenChange(false);
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete News?</AlertDialogTitle>

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