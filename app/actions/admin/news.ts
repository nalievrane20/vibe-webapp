"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { NewsItem } from "@/components/pages/guest/news-carousel"; 

interface CreateNewsInput {
  title: string;
  description?: string;
  image?: string;
  newsDate: Date;
}

interface UpdateNewsInput {
  id: number;
  title: string;
  description?: string;
  image?: string;
  newsDate: Date;
}

export async function createNews(data: CreateNewsInput) {
  try {
    const news = await prisma.news.create({
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        news_date: data.newsDate,
      },
    });

    revalidatePath("/admin/news");

    return {
      success: true,
      data: news,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to create news",
    };
  }
}

export async function getNews() {
  return await prisma.news.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getNewsById(id: number) {
  return await prisma.news.findUnique({
    where: {
      id,
    },
  });
}

export async function updateNews(data: UpdateNewsInput) {
  try {
    const news = await prisma.news.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        news_date: data.newsDate,
      },
    });

    revalidatePath("/admin/news");

    return {
      success: true,
      data: news,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to update news",
    };
  }
}

export async function deleteNews(id: number) {
  try {
    await prisma.news.delete({
      where: {
        id,
      },
    });
    

    revalidatePath("/admin/news");

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to delete news",
    };
  }
}

export async function getPublicNews(): Promise<NewsItem[]> {
  const rows = await getNews()

  return rows.map((row: any) => ({
    id: String(row.id),
    title: row.title,
    description: row.description,
    image_url: row.image,
    news_date: row.news_date.toISOString(),
    link: null,
  }))
}