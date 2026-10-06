import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { setTaskDone, deleteTask } from "@/lib/tasks";
import { handle, readJson, requireUser } from "@/lib/http";

export const PATCH = handle(async (req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const { done } = await readJson(req);
  await setTaskDone(await getDb(), user.id, id, Boolean(done));
  return NextResponse.json({ ok: true });
});

export const DELETE = handle(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  await deleteTask(await getDb(), user.id, id);
  return NextResponse.json({ ok: true });
});
