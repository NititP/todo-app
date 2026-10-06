import { AppError } from "./errors.js";

// Every query includes user_id, so a user can only ever touch their own tasks.

function toTask(r) {
  return { id: Number(r.id), title: r.title, done: Boolean(r.done) };
}

export async function listTasks(db, userId) {
  const res = await db.execute({
    sql: "SELECT id, title, done FROM tasks WHERE user_id = ? ORDER BY done, id DESC",
    args: [userId],
  });
  return res.rows.map(toTask);
}

export async function addTask(db, userId, title) {
  title = String(title ?? "").trim();
  if (!title) throw new AppError("Task can't be empty.", 400);
  if (title.length > 200) throw new AppError("Task must be 200 characters or fewer.", 400);
  const res = await db.execute({
    sql: "INSERT INTO tasks (user_id, title) VALUES (?, ?)",
    args: [userId, title],
  });
  return { id: Number(res.lastInsertRowid), title, done: false };
}

export async function setTaskDone(db, userId, taskId, done) {
  const res = await db.execute({
    sql: "UPDATE tasks SET done = ? WHERE id = ? AND user_id = ?",
    args: [done ? 1 : 0, Number(taskId), userId],
  });
  if (res.rowsAffected === 0) throw new AppError("Task not found.", 404);
}

export async function deleteTask(db, userId, taskId) {
  const res = await db.execute({
    sql: "DELETE FROM tasks WHERE id = ? AND user_id = ?",
    args: [Number(taskId), userId],
  });
  if (res.rowsAffected === 0) throw new AppError("Task not found.", 404);
}
