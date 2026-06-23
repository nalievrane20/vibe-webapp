"use client";

import { useEffect, useState, useTransition } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { createNews, updateNews } from "@/app/actions/admin/news";
import { Textarea } from "@/components/ui/textarea";

type NewsFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  news?: {
    id: number;
    title: string;
    image: string | null;
    description: string | null;
    news_date: Date;
  };
};

export function NewsFormDialog({
  open,
  onOpenChange,
  news,
}: NewsFormDialogProps) {
  const isEdit = !!news;

  const [pending, startTransition] = useTransition();

  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [newsDate, setNewsDate] = useState("");

  useEffect(() => {
    if (news) {
      setTitle(news.title);

      setDescription(news.description ?? "");

      setNewsDate(new Date(news.news_date).toISOString().slice(0, 16));

      setImagePreview(news.image ?? null);

    } else {
      setTitle("");
      setDescription("");
      setImage("");
      setNewsDate("");
    }
  }, [news, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setImage("");
  setImagePreview(URL.createObjectURL(file));
  };


  const handleSubmit = () => {
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateNews({
            id: news.id,
            title,
            image,
            description,
            newsDate: new Date(newsDate),
          });
        } else {
          await createNews({
            title,
            image,
            description,
            newsDate: new Date(newsDate),
          });
        }

        onOpenChange(false);
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit News" : "Create News"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium">Event Image URL</label>

          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />

          {image && (
            <img
              src={image}
              alt="Preview"
              className="h-40 w-full rounded-md object-cover border"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
        </div>

        <div className="space-y-4">
          <Input
            placeholder="News Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            placeholder="News Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Input
            type="datetime-local"
            value={newsDate}
            onChange={(e) => setNewsDate(e.target.value)}
          />

          <Button onClick={handleSubmit} disabled={pending} className="w-full">
            {pending ? "Saving..." : isEdit ? "Update News" : "Create News"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}