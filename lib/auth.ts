import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";     
export const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
export const JWT_COOKIE_NAME = "auth_token";
export const ROLE_COOKIE_NAME = "role";

const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: { userId: number; role: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: number; role: string };
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(JWT_COOKIE_NAME);
  cookieStore.delete(ROLE_COOKIE_NAME);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(JWT_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getCurrentUser() {       
  const session = await getSession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      first_name: true,
      middle_name: true,
      last_name: true,
      email: true,   
      course: { select: { title: true } },
    },
  });
}


// Like getCurrentUser(), but also includes role and course_id — the fields
// needed to authorize access to a course-specific chat. Kept separate from
// getCurrentUser() so existing callers of that function aren't affected.
export async function getAuthUser() {
  const session = await getSession();
  if (!session) return null;
 
  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      role: true,
      course_id: true,
      first_name: true,
      last_name: true,
      course: { select: { title: true } },
    },
  });
}

