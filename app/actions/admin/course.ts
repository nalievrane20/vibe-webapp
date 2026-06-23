"use server";

import prisma from "@/lib/prisma";

export type CreateCourseParams = {
  title: string;
  description?: string;
};

export type UpdateCourseParams = {
  id: number;
  title: string;
  description?: string;
};

/**
 * Create
 */
export async function createCourse(params: CreateCourseParams) {
  try {
    const course = await prisma.course.create({
      data: params,
    });

    return {
      success: true,
      data: course,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create course.",
    };
  }
}

/**
 * Get All
 */
export async function getCourses() {
  try {
    return await prisma.course.findMany({
      orderBy: {
        title: "asc",
      },
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

/**
 * Get By Id
 */
export async function getCourseById(id: number) {
  try {
    return await prisma.course.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}
/**
 * Update
 */
export async function updateCourse(params: UpdateCourseParams) {
  try {
    const course = await prisma.course.update({
      where: {
        id: params.id,
      },
      data: {
        title: params.title,
        description: params.description,
      },
    });

    return {
      success: true,
      data: course,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to update course.",
    };
  }
}

/**
 * Delete
 */
export async function deleteCourse(id: number) {
  try {
    const userCount = await prisma.user.count({
      where: {
        course_id: id,
      },
    });

    if (userCount > 0) {
      return {
        success: false,
        message: "Cannot delete course because it is assigned to students.",
      };
    }

    await prisma.course.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Course deleted successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete course.",
    };
  }
}
