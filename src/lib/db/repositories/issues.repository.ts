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

    const row = result.rows[0] as Issue & { labels: string | any[] | null };

    let labels: any[] | undefined = undefined;
    if (row.labels) {
      if (typeof row.labels === "string") {
        try {
          const parsed = JSON.parse(row.labels);
          labels =
            Array.isArray(parsed) && parsed.length > 0 ? parsed : undefined;
        } catch (e) {
          // Invalid JSON, treat as undefined
          labels = undefined;
        }
      } else if (Array.isArray(row.labels)) {
        labels = row.labels.length > 0 ? row.labels : undefined;
      }
    }

    return {
      ...row,
      labels,
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
    if (issues.length === 0) return;

    const db = this.getDatabase();
    const batchSize = this.DB_BATCH_SIZE;

    for (let i = 0; i < issues.length; i += batchSize) {
      const batch = issues.slice(i, i + batchSize);

      // Deduplicate by ID (keep last occurrence)
      const uniqueBatch = Array.from(
        new Map(batch.map((issue) => [issue.id, issue])).values()
      );

      const values: any[] = [];
      const placeholders: string[] = [];

      uniqueBatch.forEach((issue, index) => {
        const baseIndex = index * 12;
        placeholders.push(
          `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${
            baseIndex + 4
          }, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${
            baseIndex + 8
          }, $${baseIndex + 9}, $${baseIndex + 10}, $${baseIndex + 11}, $${
            baseIndex + 12
          })`
        );
        values.push(
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
          issue.closed_at || null
        );
      });

      await db.query(
        `INSERT INTO issues (id, repo_id, number, title, body, state, type, author, labels, created_at, updated_at, closed_at)
         VALUES ${placeholders.join(", ")}
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
        values
      );
    }
  }
}
