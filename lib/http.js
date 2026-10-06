import { NextResponse } from "next/server";
import { AppError } from "./errors.js";
import { getSessionUser } from "./session.js";

export async function readJson(req) {
  try { return await req.json(); } catch { return {}; }
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new AppError("Please log in.", 401);
  return user;
}

export function handle(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e instanceof AppError) return NextResponse.json({ error: e.message }, { status: e.status });
      console.error(e);
      return NextResponse.json({ error: "Something went wrong on the server." }, { status: 500 });
    }
  };
}
