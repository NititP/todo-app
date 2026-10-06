import { createClient } from "@libsql/client";
import os from "node:os";
import path from "node:path";
import { initSchema } from "../lib/db.js";

// Fresh throwaway database file for each test
export async function freshDb() {
  const file = path.join(os.tmpdir(), `todo-test-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
  const db = createClient({ url: `file:${file}` });
  await initSchema(db);
  return db;
}
