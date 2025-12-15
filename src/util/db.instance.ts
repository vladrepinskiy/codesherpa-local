import { PGlite } from "@electric-sql/pglite";
import { live } from "@electric-sql/pglite/live";

// todo: work out a good place for this singleton
let db: PGlite | null = null;
let initPromise: Promise<PGlite> | null = null;

export async function initDatabase(): Promise<PGlite> {
  if (db) {
    return db;
  }

  // Prevent multiple concurrent initializations (React Strict Mode)
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    db = await PGlite.create("idb://codesherpa-db", {
      extensions: { live },
    });

    return db;
  })();

  return initPromise;
}

export function getDatabase(): PGlite {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}
