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
import { createEvent, updateEvent } from "@/app/actions/admin/event";
import { Textarea } from "@/components/ui/textarea";

type EventFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  courses: {
    id: number;
    title: string;
  }[];

  event?: {
    id: number;
    title: string;
    image: string | null;
    description: string | null;
    fee?: number | null;
    event_date: Date;
    courses: {
      id: number;
    }[];
  };
};

export function EventFormDialog({
  open,
  onOpenChange,
  courses,
  event,
}: EventFormDialogProps) {
  const isEdit = !!event;

  const [pending, startTransition] = useTransition();

  const [image, setImage] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");

  const [eventType, setEventType] = useState<"FREE" | "PAID">("FREE");
  const [fee, setFee] = useState("");

  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description ?? "");
      setEventDate(new Date(event.event_date).toISOString().slice(0, 16));
      setSelectedCourses(event.courses.map((course) => course.id));
      setImage(event.image ?? "");

      setFee(event.fee?.toString() ?? "");
      setEventType(event.fee && event.fee > 0 ? "PAID" : "FREE");

    } else {
      setTitle("");
      setDescription("");
      setImage("");
      setEventDate("");
      setSelectedCourses([]);

      setFee("");
setEventType("FREE");
    }
  }, [event, open]);

  const toggleCourse = (courseId: number) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId],
    );
  };

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateEvent({
            id: event!.id,
            title,
            image,
            description,
            eventDate: new Date(eventDate),
            courseIds: selectedCourses,

            fee: eventType === "PAID" ? Number(fee) : null,
          });
        } else {
          await createEvent({
            // no id for creation
            title,
            image,
            description,
            eventDate: new Date(eventDate),
            courseIds: selectedCourses,

            fee: eventType === "PAID" ? Number(fee) : null,
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
          <DialogTitle>{isEdit ? "Edit Event" : "Create Event"}</DialogTitle>
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
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            placeholder="Event Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Event Type
          </label>

          <select
            value={eventType}
            onChange={(e) =>
              setEventType(e.target.value as "FREE" | "PAID")
            }
            className="w-full rounded-md border p-2"
          >
            <option value="FREE">Free</option>
            <option value="PAID">Paid</option>
          </select>

          {eventType === "PAID" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Registration Fee
              </label>

              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter fee amount"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
              />
            </div>
          )}

        </div>

          <Input
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />

          <div>
            <label className="mb-3 block text-sm font-medium">Courses</label>

            <div className="space-y-3 rounded-md border p-4">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedCourses.includes(course.id)}
                    onCheckedChange={() => toggleCourse(course.id)}
                  />

                  <span className="text-sm">{course.title}</span>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={pending} className="w-full">
            {pending ? "Saving..." : isEdit ? "Update Event" : "Create Event"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}