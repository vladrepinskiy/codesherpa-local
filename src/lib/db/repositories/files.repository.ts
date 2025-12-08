import { getDatabase } from "../../../util/db.util";

export const createFilesTable = `
  CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    repo_id TEXT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    content TEXT,
    size INTEGER,
    type TEXT,
    sha TEXT,
    last_modified TIMESTAMP,
    UNIQUE(repo_id, path)
  );

  CREATE INDEX IF NOT EXISTS idx_files_repo_id ON files(repo_id);
  CREATE INDEX IF NOT EXISTS idx_files_path ON files(path);
`;

export async function insertFiles(
  files: Array<{
    id: string;
    repo_id: string;
    path: string;
    content?: string;
    size?: number;
    type?: string;
    sha?: string;
    last_modified?: Date;
  }>
): Promise<void> {
  const db = getDatabase();

  for (const file of files) {
    await db.query(
      `INSERT INTO files (id, repo_id, path, content, size, type, sha, last_modified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (repo_id, path) DO UPDATE SET
         content = EXCLUDED.content,
         size = EXCLUDED.size,
         type = EXCLUDED.type,
         sha = EXCLUDED.sha,
         last_modified = EXCLUDED.last_modified`,
      [
        file.id,
        file.repo_id,
        file.path,
        file.content || null,
        file.size || null,
        file.type || null,
        file.sha || null,
        file.last_modified || null,
      ]
    );
  }
}
