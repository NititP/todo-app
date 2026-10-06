import { describe, it, expect, beforeEach } from "vitest";
import { freshDb } from "./helpers.js";
import { registerUser } from "../lib/users.js";
import { listTasks, addTask, setTaskDone, deleteTask } from "../lib/tasks.js";

let db, alice, bob;
beforeEach(async () => {
  db = await freshDb();
  alice = await registerUser(db, "alice", "secret123");
  bob = await registerUser(db, "bob", "secret456");
});

describe("task list", () => {
  it("adds, completes and deletes a task", async () => {
    const t = await addTask(db, alice.id, "Buy milk");
    await setTaskDone(db, alice.id, t.id, true);
    expect(await listTasks(db, alice.id)).toEqual([{ id: t.id, title: "Buy milk", done: true }]);
    await deleteTask(db, alice.id, t.id);
    expect(await listTasks(db, alice.id)).toEqual([]);
  });

  it("each user sees only their own tasks", async () => {
    await addTask(db, alice.id, "Alice task");
    await addTask(db, bob.id, "Bob task");
    expect((await listTasks(db, alice.id)).map((t) => t.title)).toEqual(["Alice task"]);
    expect((await listTasks(db, bob.id)).map((t) => t.title)).toEqual(["Bob task"]);
  });

  it("a user cannot delete another user's task", async () => {
    const t = await addTask(db, alice.id, "Alice task");
    await expect(deleteTask(db, bob.id, t.id)).rejects.toMatchObject({ status: 404 });
    expect(await listTasks(db, alice.id)).toHaveLength(1);
  });

  it("a user cannot complete another user's task", async () => {
    const t = await addTask(db, alice.id, "Alice task");
    await expect(setTaskDone(db, bob.id, t.id, true)).rejects.toMatchObject({ status: 404 });
    expect((await listTasks(db, alice.id))[0].done).toBe(false);
  });

  it("rejects empty and whitespace-only tasks", async () => {
    await expect(addTask(db, alice.id, "")).rejects.toMatchObject({ status: 400 });
    await expect(addTask(db, alice.id, "   ")).rejects.toMatchObject({ status: 400 });
    expect(await listTasks(db, alice.id)).toEqual([]);
  });
});
