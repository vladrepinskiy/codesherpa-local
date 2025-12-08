import { getDatabase } from "../../../util/db.util";

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

export async function insertIssues(
  issues: Array<{
    id: string;
    repo_id: string;
    number: number;
    title: string;
    body?: string;
    state: string;
    type: "issue" | "pull_request";
    author?: string;
    labels?: any[];
    created_at: Date;
    updated_at?: Date;
    closed_at?: Date;
  }>
): Promise<void> {
  const db = getDatabase();

  for (const issue of issues) {
    await db.query(
      `INSERT INTO issues (id, repo_id, number, title, body, state, type, author, labels, created_at, updated_at, closed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (repo_id, number, type) DO UPDATE SET
         title = EXCLUDED.title,
         body = EXCLUDED.body,
         state = EXCLUDED.state,
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
