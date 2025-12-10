import type { Issue } from "../../../types/db.types";
import { BaseRepository } from "./base.repository";

export const createIssuesTable = `
  CREATE TABLE IF NOT EXISTS issues (
    id TEXT PRIMARY KEY,
    repo_id TEXT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    state TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('issue', 'pull_request')),
    author TEXT,
    labels JSONB,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    closed_at TIMESTAMP,
    UNIQUE(repo_id, number, type)
  );

  CREATE INDEX IF NOT EXISTS idx_issues_repo_id ON issues(repo_id);
  CREATE INDEX IF NOT EXISTS idx_issues_type ON issues(type);
  CREATE INDEX IF NOT EXISTS idx_issues_state ON issues(state);
`;

export class IssuesRepository extends BaseRepository<Issue> {
  protected readonly tableName = "issues";

  async readById(id: string): Promise<Issue | null> {
    const db = this.getDatabase();
    const result = await db.query("SELECT * FROM issues WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0] as Issue & { labels: string };
    return {
      ...row,
      labels: row.labels ? JSON.parse(row.labels) : undefined,
      created_at: new Date(row.created_at),
      updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
      closed_at: row.closed_at ? new Date(row.closed_at) : undefined,
    };
  }

  async deleteById(id: string): Promise<void> {
    const db = this.getDatabase();
    await db.query("DELETE FROM issues WHERE id = $1", [id]);
  }

  async insertIssues(issues: Array<Issue>): Promise<void> {
    const db = this.getDatabase();

    for (const issue of issues) {
      await db.query(
        `INSERT INTO issues (id, repo_id, number, title, body, state, type, author, labels, created_at, updated_at, closed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE SET
           repo_id = EXCLUDED.repo_id,
           number = EXCLUDED.number,
           title = EXCLUDED.title,
           body = EXCLUDED.body,
           state = EXCLUDED.state,
           type = EXCLUDED.type,
           author = EXCLUDED.author,
           labels = EXCLUDED.labels,
           created_at = EXCLUDED.created_at,
           updated_at = EXCLUDED.updated_at,
           closed_at = EXCLUDED.closed_at`,
        [
          issue.id,
          issue.repo_id,
          issue.number,
          issue.title,
          issue.body || null,
          issue.state,
          issue.type,
          issue.author || null,
          JSON.stringify(issue.labels || []),
          issue.created_at,
          issue.updated_at || null,
          issue.closed_at || null,
        ]
      );
    }
  }
}
