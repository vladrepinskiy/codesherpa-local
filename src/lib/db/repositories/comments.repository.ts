import type { Comment } from "../../../types/db.types";
import { BaseRepository } from "./base.repository";

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

export class CommentsRepository extends BaseRepository<Comment> {
  protected readonly tableName = "comments";

  async readById(id: string): Promise<Comment | null> {
    const db = this.getDatabase();
    const result = await db.query("SELECT * FROM comments WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0] as Comment;
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
    };
  }

  async deleteById(id: string): Promise<void> {
    const db = this.getDatabase();
    await db.query("DELETE FROM comments WHERE id = $1", [id]);
  }

  async insertComments(comments: Array<Comment>): Promise<void> {
    const db = this.getDatabase();

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
}
