import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { listTasks, addTask } from "@/lib/tasks";
import { handle, readJson, requireUser } from "@/lib/http";

export const GET = handle(async () => {
  const user = await requireUser();
  return NextResponse.json({ tasks: await listTasks(await getDb(), user.id) });
});

export const POST = handle(async (req) => {
  const user = await requireUser();
  const { title } = await readJson(req);
  const task = await addTask(await getDb(), user.id, title);
  return NextResponse.json({ task }, { status: 201 });
});
