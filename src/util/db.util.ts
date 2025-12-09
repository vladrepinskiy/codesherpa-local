import { PGlite } from "@electric-sql/pglite";
import {
  CommentsRepository,
  createCommentsTable,
} from "../lib/db/repositories/comments.repository";
import {
  createFilesTable,
  FilesRepository,
} from "../lib/db/repositories/files.repository";
import {
  createIssuesTable,
  IssuesRepository,
} from "../lib/db/repositories/issues.repository";
import {
  createReposTable,
  RepositoriesRepository,
} from "../lib/db/repositories/repo.repository";

let db: PGlite | null = null;

let commentsRepositoryInstance: CommentsRepository | null = null;
let filesRepositoryInstance: FilesRepository | null = null;
let issuesRepositoryInstance: IssuesRepository | null = null;
let repositoriesRepositoryInstance: RepositoriesRepository | null = null;

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

export function getRepositories() {
  if (!commentsRepositoryInstance) {
    commentsRepositoryInstance = new CommentsRepository();
  }
  if (!filesRepositoryInstance) {
    filesRepositoryInstance = new FilesRepository();
  }
  if (!issuesRepositoryInstance) {
    issuesRepositoryInstance = new IssuesRepository();
  }
  if (!repositoriesRepositoryInstance) {
    repositoriesRepositoryInstance = new RepositoriesRepository();
  }

  return {
    commentsRepository: commentsRepositoryInstance,
    filesRepository: filesRepositoryInstance,
    issuesRepository: issuesRepositoryInstance,
    repositoriesRepository: repositoriesRepositoryInstance,
  };
}
