import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyUser } from "@/lib/users";
import { createSession } from "@/lib/session";
import { handle, readJson } from "@/lib/http";
import { AppError } from "@/lib/errors";

export const POST = handle(async (req) => {
  const { username, password } = await readJson(req);
  const user = await verifyUser(await getDb(), username, password);
  if (!user) throw new AppError("Wrong username or password.", 401);
  await createSession(user);
  return NextResponse.json({ user });
});
