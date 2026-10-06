import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { registerUser } from "@/lib/users";
import { createSession } from "@/lib/session";
import { handle, readJson } from "@/lib/http";

export const POST = handle(async (req) => {
  const { username, password } = await readJson(req);
  const user = await registerUser(await getDb(), username, password);
  await createSession(user);
  return NextResponse.json({ user }, { status: 201 });
});
