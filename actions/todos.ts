"use server"

import { eq, and, sql } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { todos } from "@/database/schema"
import { z } from "zod"

// Create a todo
export async function createTodo(formData: FormData): Promise<{
  error?: string;
  success?: boolean;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "Not authenticated" };
  }

  const title = formData.get("title");
  const schema = z.object({
    title: z.string().min(1, "Title cannot be empty"),
  });

  const result = schema.safeParse({ title });

  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  // Optional: show optimistic loading effect
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await db.insert(todos).values({
    title: result.data.title,
    completed: false,
    userId: session.user.id,
  });

  revalidatePath("/todos");
  return { success: true };
}

// Toggle a todo's completion (only by the creator)
export async function toggleTodo(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return;

  await db
    .update(todos)
    .set({ completed: sql`NOT "completed"` })
    .where(
      and(
        eq(todos.id, id),
        eq(todos.userId, session.user.id) // user can only toggle their own
      )
    );

  revalidatePath("/todos");
}

// Delete a todo (admin only)
export async function deleteTodo(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const id = formData.get("id") as string;

  await db.delete(todos).where(eq(todos.id, id));

  revalidatePath("/admin");
}
