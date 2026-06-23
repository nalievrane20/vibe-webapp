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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUser, updateUser } from "@/app/actions/admin/user";

type UserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  courses: {
    id: number;
    title: string;
  }[];

  user?: {
    id: number;
    student_id: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    email: string;
    role: "STUDENT" | "ADMIN";
    course?: {
      id: number;
    } | null;
  };
};

export function UserFormDialog({
  open,
  onOpenChange,
  courses,
  user,
}: UserFormDialogProps) {
  const isEdit = !!user;

  const [pending, startTransition] = useTransition();

  const [studentId, setStudentId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "ADMIN">("STUDENT");
  const [courseId, setCourseId] = useState<string>("none");

  useEffect(() => {
    if (user) {
      setStudentId(user.student_id);
      setFirstName(user.first_name);
      setMiddleName(user.middle_name ?? "");
      setLastName(user.last_name);
      setEmail(user.email);
      setPassword("");
      setRole(user.role);
      setCourseId(user.course ? String(user.course.id) : "none");
    } else {
      setStudentId("");
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRole("STUDENT");
      setCourseId("none");
    }
  }, [user, open]);

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        const courseIdValue = courseId === "none" ? null : Number(courseId);

        if (isEdit) {
          await updateUser({
            id: user.id,
            student_id: studentId,
            first_name: firstName,
            middle_name: middleName || null,
            last_name: lastName,
            email,
            password: password || undefined,
            role,
            courseId: courseIdValue,
          });
        } else {
          await createUser({
            student_id: studentId,
            first_name: firstName,
            middle_name: middleName || null,
            last_name: lastName,
            email,
            password,
            role,
            courseId: courseIdValue,
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
          <DialogTitle>{isEdit ? "Edit User" : "Create User"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />

            <Input
              placeholder="Middle Name"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
            />

            <Input
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            type="password"
            placeholder={
              isEdit ? "Leave blank to keep current password" : "Password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div>
            <label className="mb-2 block text-sm font-medium">Role</label>

            <Select
              value={role}
              onValueChange={(value) => setRole(value as "STUDENT" | "ADMIN")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="STUDENT">Student</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Course</label>

            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="none">No course</SelectItem>

                {courses.map((course) => (
                  <SelectItem key={course.id} value={String(course.id)}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSubmit} disabled={pending} className="w-full">
            {pending ? "Saving..." : isEdit ? "Update User" : "Create User"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}