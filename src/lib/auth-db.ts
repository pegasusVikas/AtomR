import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const AUTH_DB_PATH = ".data/auth.sqlite";

mkdirSync(dirname(AUTH_DB_PATH), { recursive: true });

export const authDb = new Database(AUTH_DB_PATH);
