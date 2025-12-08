import { getDatabase } from "../../../util/db.util";

export const createCommentsTable = `
  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    issue_id TEXT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    body TEXT,
    author TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_comments_issue_id ON comments(issue_id);
`;

export async function insertComments(
  comments: Array<{
    id: string;
    issue_id: string;
    body?: string;
    author?: string;
    created_at: Date;
    updated_at?: Date;
  }>
): Promise<void> {
  const db = getDatabase();

  for (const comment of comments) {
    await db.query(
      `INSERT INTO comments (id, issue_id, body, author, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         body = EXCLUDED.body,
         author = EXCLUDED.author,
         created_at = EXCLUDED.created_at,
         updated_at = EXCLUDED.updated_at`,
      [
        comment.id,
        comment.issue_id,
        comment.body || null,
        comment.author || null,
        comment.created_at,
        comment.updated_at || null,
      ]
    );
  }
}
