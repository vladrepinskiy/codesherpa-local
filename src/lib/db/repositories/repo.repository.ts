import { BaseRepository } from "./base.repository";
import type {
  Repository,
  InsertRepository,
  ImportStats,
} from "../../../types/db.types";

export const createReposTable = `
  CREATE TABLE IF NOT EXISTS repositories (
    id TEXT PRIMARY KEY,
    owner TEXT NOT NULL,
    name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    default_branch TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    imported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

export class RepositoriesRepository extends BaseRepository<Repository> {
  protected readonly tableName = "repositories";

  async readById(id: string): Promise<Repository | null> {
    const db = this.getDatabase();
    const result = await db.query("SELECT * FROM repositories WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0] as Repository;
    return {
      ...row,
      imported_at: new Date(row.imported_at),
    };
  }

  async readByShortId(shortId: string): Promise<Repository | null> {
    const db = this.getDatabase();
    const result = await db.query(
      "SELECT * FROM repositories WHERE id LIKE $1 ORDER BY imported_at DESC LIMIT 1",
      [`${shortId}%`]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0] as Repository;
    return {
      ...row,
      imported_at: new Date(row.imported_at),
    };
  }

  async deleteById(id: string): Promise<void> {
    const db = this.getDatabase();
    await db.query("DELETE FROM repositories WHERE id = $1", [id]);
  }

  async insertRepository(data: InsertRepository): Promise<void> {
    const db = this.getDatabase();
    await db.query(
      `INSERT INTO repositories (id, owner, name, full_name, url, description, default_branch, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         owner = EXCLUDED.owner,
         name = EXCLUDED.name,
         full_name = EXCLUDED.full_name,
         url = EXCLUDED.url,
         description = EXCLUDED.description,
         default_branch = EXCLUDED.default_branch,
         status = EXCLUDED.status,
         imported_at = CURRENT_TIMESTAMP`,
      [
        data.id,
        data.owner,
        data.name,
        data.full_name,
        data.url,
        data.description || null,
        data.default_branch || null,
        data.status,
      ]
    );
  }

  async updateStatus(repoId: string, status: string): Promise<void> {
    const db = this.getDatabase();
    await db.query(`UPDATE repositories SET status = $1 WHERE id = $2`, [
      status,
      repoId,
    ]);
  }

  async clearRepository(repoId: string): Promise<void> {
    const db = this.getDatabase();
    await db.query("DELETE FROM repositories WHERE id = $1", [repoId]);
  }

  async getAllRepositories(): Promise<Repository[]> {
    const db = this.getDatabase();
    const result = await db.query(
      "SELECT * FROM repositories ORDER BY imported_at DESC"
    );

    return (result.rows as Repository[]).map((row) => ({
      ...row,
      imported_at: new Date(row.imported_at),
    }));
  }

  async getImportStats(repoId: string): Promise<ImportStats> {
    const db = this.getDatabase();

    const filesResult = await db.query(
      "SELECT COUNT(*) as count FROM files WHERE repo_id = $1",
      [repoId]
    );

    const issuesResult = await db.query(
      "SELECT COUNT(*) as count FROM issues WHERE repo_id = $1 AND type = $2",
      [repoId, "issue"]
    );

    const prsResult = await db.query(
      "SELECT COUNT(*) as count FROM issues WHERE repo_id = $1 AND type = $2",
      [repoId, "pull_request"]
    );

    const commentsResult = await db.query(
      `SELECT COUNT(*) as count FROM comments 
       WHERE issue_id IN (SELECT id FROM issues WHERE repo_id = $1)`,
      [repoId]
    );

    return {
      filesCount: Number(
        (filesResult.rows[0] as { count: string | number }).count
      ),
      issuesCount: Number(
        (issuesResult.rows[0] as { count: string | number }).count
      ),
      pullRequestsCount: Number(
        (prsResult.rows[0] as { count: string | number }).count
      ),
      commentsCount: Number(
        (commentsResult.rows[0] as { count: string | number }).count
      ),
    };
  }
}
