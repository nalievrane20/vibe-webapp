"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

interface CreateUserInput {
  student_id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email: string;
  password: string;
  role: "STUDENT" | "ADMIN";
  courseId: number | null;
}

interface UpdateUserInput {
  id: number;
  student_id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email: string;
  password?: string;
  role: "STUDENT" | "ADMIN";
  courseId: number | null;
}

export async function createUser(data: CreateUserInput) {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        student_id: data.student_id,
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        course: data.courseId
          ? { connect: { id: data.courseId } }
          : undefined,
      },
      include: {
        course: true,
      },
    });

    revalidatePath("/admin/users");

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to create user",
    };
  }
}

export async function getUsers() {
  return await prisma.user.findMany({
    include: {
      course: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getUserById(id: number) {
  return await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      course: true,
    },
  });
}

export async function updateUser(data: UpdateUserInput) {
  try {
    
  const user = await prisma.user.update({
    where: {
      id: data.id,
    },
    data: {
      student_id: data.student_id,
      first_name: data.first_name,
      middle_name: data.middle_name,
      last_name: data.last_name,
      email: data.email,
      role: data.role,
      ...(data.password && { password: await bcrypt.hash(data.password, 10) }),
      course: data.courseId
        ? { connect: { id: data.courseId } }
        : { disconnect: true },
    },
    include: {
      course: true,
    },
  });

    revalidatePath("/admin/users");

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to update user",
    };
  }
}

export async function deleteUser(id: number) {
  try {
    await prisma.user.delete({
      where: {
        id,
      },
    });

    revalidatePath("/admin/users");

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to delete user",
    };
  }
}