"use client";
import { useEffect, useState } from "react";

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json" },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed.");
  return data;
}

function AuthForm({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isLogin = mode === "login";

  async function submit(e) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const { user } = await api(isLogin ? "/api/login" : "/api/register", {
        method: "POST", body: { username, password },
      });
      onLogin(user);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <form className="sheet" onSubmit={submit}>
      {error && <p className="error" role="alert">{error}</p>}
      <label htmlFor="u">Username</label>
      <input id="u" type="text" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <label htmlFor="p">Password</label>
      <input id="p" type="password" autoComplete={isLogin ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="primary" disabled={busy}>{isLogin ? "Log in" : "Create account"}</button>
      <p className="switch">
        {isLogin ? "New here? " : "Already have an account? "}
        <button type="button" className="link" onClick={() => { setMode(isLogin ? "register" : "login"); setError(""); }}>
          {isLogin ? "Create an account" : "Log in"}
        </button>
      </p>
    </form>
  );
}

function TaskList({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try { setTasks((await api("/api/tasks")).tasks); } catch (err) { setError(err.message); }
  }
  useEffect(() => { load(); }, []);

  async function run(fn) {
    setError("");
    try { await fn(); await load(); } catch (err) { setError(err.message); }
  }

  const add = (e) => { e.preventDefault(); run(async () => { await api("/api/tasks", { method: "POST", body: { title } }); setTitle(""); }); };
  const toggle = (t) => run(() => api(`/api/tasks/${t.id}`, { method: "PATCH", body: { done: !t.done } }));
  const remove = (t) => run(() => api(`/api/tasks/${t.id}`, { method: "DELETE" }));
  const left = tasks.filter((t) => !t.done).length;

  return (
    <div className="sheet">
      {error && <p className="error" role="alert">{error}</p>}
      <form className="addrow" onSubmit={add}>
        <input type="text" aria-label="New task" placeholder="Add a task" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
        <button className="primary">Add</button>
      </form>
      {tasks.length === 0 ? (
        <p className="empty">No tasks yet. Add your first one above.</p>
      ) : (
        <ul>
          {tasks.map((t) => (
            <li key={t.id} className={t.done ? "done" : ""}>
              <input type="checkbox" checked={t.done} onChange={() => toggle(t)} aria-label={`Mark "${t.title}" as done`} />
              <span>{t.title}</span>
              <button className="del" onClick={() => remove(t)} aria-label={`Delete "${t.title}"`}>Delete</button>
            </li>
          ))}
        </ul>
      )}
      <p className="count">{left} left to do</p>
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState(undefined);
  useEffect(() => { api("/api/me").then((d) => setUser(d.user)).catch(() => setUser(null)); }, []);

  async function logout() { await api("/api/logout", { method: "POST" }); setUser(null); }

  return (
    <main>
      <div className="top">
        <h1>{user ? `${user.username}'s tasks` : "Tasks"}</h1>
        {user && <button className="link" onClick={logout}>Log out</button>}
      </div>
      <p className="sub">{user ? "Only you can see this list." : "Log in to see your own list."}</p>
      {user === undefined ? null : user ? <TaskList user={user} /> : <AuthForm onLogin={setUser} />}
    </main>
  );
}
