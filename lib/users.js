import bcrypt from "bcryptjs";
import { AppError } from "./errors.js";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;

export async function registerUser(db, username, password) {
  username = String(username ?? "").trim();
  password = String(password ?? "");
  if (!USERNAME_RE.test(username))
    throw new AppError("Username must be 3–30 letters, numbers or underscores.", 400);
  if (password.length < 6 || password.length > 100)
    throw new AppError("Password must be 6–100 characters.", 400);

  const existing = await db.execute({ sql: "SELECT id FROM users WHERE username = ?", args: [username] });
  if (existing.rows.length) throw new AppError("That username is taken.", 409);

  // Only the bcrypt hash is stored, never the plain password.
  const hash = await bcrypt.hash(password, 10);
  const res = await db.execute({
    sql: "INSERT INTO users (username, password_hash) VALUES (?, ?)",
    args: [username, hash],
  });
  return { id: Number(res.lastInsertRowid), username };
}

export async function verifyUser(db, username, password) {
  const res = await db.execute({
    sql: "SELECT id, username, password_hash FROM users WHERE username = ?",
    args: [String(username ?? "").trim()],
  });
  const row = res.rows[0];
  if (!row) return null;
  const ok = await bcrypt.compare(String(password ?? ""), row.password_hash);
  return ok ? { id: Number(row.id), username: row.username } : null;
}
