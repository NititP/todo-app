import { describe, it, expect, beforeEach } from "vitest";
import { freshDb } from "./helpers.js";
import { registerUser, verifyUser } from "../lib/users.js";

let db;
beforeEach(async () => { db = await freshDb(); });

describe("login", () => {
  it("stores a bcrypt hash, never the plain password", async () => {
    await registerUser(db, "alice", "secret123");
    const { rows } = await db.execute("SELECT password_hash FROM users WHERE username = 'alice'");
    expect(rows[0].password_hash).not.toBe("secret123");
    expect(rows[0].password_hash).toMatch(/^\$2[aby]\$/);
  });

  it("logs in with the right password", async () => {
    await registerUser(db, "alice", "secret123");
    const user = await verifyUser(db, "alice", "secret123");
    expect(user).toMatchObject({ username: "alice" });
  });

  it("rejects a wrong password", async () => {
    await registerUser(db, "alice", "secret123");
    expect(await verifyUser(db, "alice", "wrongpass")).toBeNull();
  });

  it("rejects an unknown user", async () => {
    expect(await verifyUser(db, "nobody", "secret123")).toBeNull();
  });

  it("rejects a duplicate username", async () => {
    await registerUser(db, "alice", "secret123");
    await expect(registerUser(db, "alice", "other123")).rejects.toMatchObject({ status: 409 });
  });

  it("rejects short passwords and bad usernames", async () => {
    await expect(registerUser(db, "bob", "123")).rejects.toMatchObject({ status: 400 });
    await expect(registerUser(db, "", "secret123")).rejects.toMatchObject({ status: 400 });
    await expect(registerUser(db, "bad name!", "secret123")).rejects.toMatchObject({ status: 400 });
  });
});
