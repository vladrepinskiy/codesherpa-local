import type { File } from "../../../types/db.types";
import { BaseRepository } from "./base.repository";

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

export class FilesRepository extends BaseRepository<File> {
  protected readonly tableName = "files";

  async readById(id: string): Promise<File | null> {
    const db = this.getDatabase();
    const result = await db.query("SELECT * FROM files WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0] as File;
    return {
      ...row,
      last_modified: row.last_modified
        ? new Date(row.last_modified)
        : undefined,
    };
  }

  async deleteById(id: string): Promise<void> {
    const db = this.getDatabase();
    await db.query("DELETE FROM files WHERE id = $1", [id]);
  }

  async insertFiles(files: Array<File>): Promise<void> {
    if (files.length === 0) return;

    const db = this.getDatabase();
    const batchSize = this.DB_BATCH_SIZE;

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);

      // Deduplicate by ID (keep last occurrence)
      const uniqueBatch = Array.from(
        new Map(batch.map((file) => [file.id, file])).values()
      );

      const values: any[] = [];
      const placeholders: string[] = [];

      uniqueBatch.forEach((file, index) => {
        const baseIndex = index * 8;
        placeholders.push(
          `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${
            baseIndex + 4
          }, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${
            baseIndex + 8
          })`
        );
        values.push(
          file.id,
          file.repo_id,
          file.path,
          file.content || null,
          file.size || null,
          file.type || null,
          file.sha || null,
          file.last_modified || null
        );
      });

      await db.query(
        `INSERT INTO files (id, repo_id, path, content, size, type, sha, last_modified)
         VALUES ${placeholders.join(", ")}
         ON CONFLICT (id) DO UPDATE SET
           repo_id = EXCLUDED.repo_id,
           path = EXCLUDED.path,
           content = EXCLUDED.content,
           size = EXCLUDED.size,
           type = EXCLUDED.type,
           sha = EXCLUDED.sha,
           last_modified = EXCLUDED.last_modified`,
        values
      );
    }
  }
}
