"use server";

import prisma from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  signToken,
  setAuthCookie,
  clearAuthCookie,
} from "@/lib/auth";
import { redirect } from "next/navigation";

type ActionResult = { error: string } | void;

export async function signup(
  prevState: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const student_id = formData.get("student_id") as string;
  const first_name = formData.get("first_name") as string;
  const middle_name = (formData.get("middle_name") as string) || null;
  const last_name = formData.get("last_name") as string;
  const email = formData.get("email") as string;
  const course_id_raw = formData.get("course_id") as string | null;
  const course_id = course_id_raw ? Number(course_id_raw) : NaN;
  const password = formData.get("password") as string;

  if (
    !student_id ||
    !first_name ||
    !last_name ||
    !email ||
    Number.isNaN(course_id) ||
    !password
  ) {
    return { error: "All required fields must be filled in" };
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { student_id }] },
  });
  if (existing) {
    return { error: "Email or student ID already in use" };
  }

  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      student_id,
      first_name,
      middle_name,
      last_name,
      email,
      course_id,
      password: hashed,
    },
  });

  const token = await signToken({ userId: user.id, role: user.role });
  await setAuthCookie(token);

  redirect("/dashboard");
}

export async function login(
  prevState: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Invalid email or password" };
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return { error: "Invalid email or password" };
  }

  const token = await signToken({ userId: user.id, role: user.role });
  await setAuthCookie(token);

  redirect("/");
}

export async function logout() {
  await clearAuthCookie();
  redirect("/login");
}
