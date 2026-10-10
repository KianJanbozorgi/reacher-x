import "server-only";

import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export type Account = {
  id: string;
  email: string;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
};

let database: DatabaseSync | undefined;

export function authDb(): DatabaseSync {
  if (database) return database;
  const path = process.env.AUTH_DB_PATH || "/app/data/auth.sqlite";
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
      first_name TEXT, last_name TEXT, created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY, account_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL, FOREIGN KEY(account_id) REFERENCES accounts(id)
    );
    CREATE TABLE IF NOT EXISTS codes (
      email TEXT NOT NULL, purpose TEXT NOT NULL, code_hash TEXT NOT NULL,
      password_hash TEXT, expires_at INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY(email, purpose)
    );
    CREATE TABLE IF NOT EXISTS recovery_codes (
      account_id TEXT NOT NULL, code_hash TEXT NOT NULL,
      PRIMARY KEY(account_id, code_hash),
      FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS attempts (
      scope TEXT PRIMARY KEY, count INTEGER NOT NULL, window_start INTEGER NOT NULL
    );
  `);
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(Date.now());
  db.prepare("DELETE FROM codes WHERE expires_at < ?").run(Date.now());
  db.prepare("DELETE FROM attempts WHERE window_start < ?").run(Date.now() - 24 * 60 * 60_000);
  database = db;
  return db;
}

export function getAccount(email: string): Account | undefined {
  return authDb().prepare("SELECT * FROM accounts WHERE email = ?").get(email) as Account | undefined;
}

export function getAccountById(id: string): Account | undefined {
  return authDb().prepare("SELECT * FROM accounts WHERE id = ?").get(id) as Account | undefined;
}

export function allowAttempt(scope: string, max = 5, windowMs = 15 * 60_000): boolean {
  const db = authDb();
  const now = Date.now();
  const row = db.prepare("SELECT count, window_start FROM attempts WHERE scope = ?").get(scope) as
    | { count: number; window_start: number }
    | undefined;
  if (!row || now - row.window_start >= windowMs) {
    db.prepare("INSERT INTO attempts(scope, count, window_start) VALUES (?, 1, ?) ON CONFLICT(scope) DO UPDATE SET count=1, window_start=excluded.window_start").run(scope, now);
    return true;
  }
  db.prepare("UPDATE attempts SET count=count+1 WHERE scope=?").run(scope);
  return row.count < max;
}
