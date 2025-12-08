import { PGlite } from "@electric-sql/pglite";
import { createReposTable } from "../lib/db/repositories/repo.repository";
import { createFilesTable } from "../lib/db/repositories/files.repository";
import { createIssuesTable } from "../lib/db/repositories/issues.repository";
import { createCommentsTable } from "../lib/db/repositories/comments.repository";

let db: PGlite | null = null;

export async function initDatabase(): Promise<PGlite> {
  if (db) {
    return db;
  }

  db = new PGlite("idb://codesherpa-db");

  await db.waitReady;

  await createSchema(db);

  return db;
}

export function getDatabase(): PGlite {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}

async function createSchema(database: PGlite): Promise<void> {
  await database.exec(`
    ${createReposTable}
    ${createFilesTable}
    ${createIssuesTable}
    ${createCommentsTable}
  `);
}
