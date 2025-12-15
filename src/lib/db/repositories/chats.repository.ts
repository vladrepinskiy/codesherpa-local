import type { Chat } from "../../../types/db.types";
import { BaseRepository } from "./base.repository";

export const CHATS_QUERY = `SELECT * FROM chats ORDER BY updated_at DESC`;

export const createChatsTable = `
  CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    title TEXT,
    repo_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

export class ChatsRepository extends BaseRepository {
  protected readonly tableName = "chats";

  async deleteById(id: string): Promise<void> {
    const db = this.getDatabase();
    await db.query("DELETE FROM chats WHERE id = $1", [id]);
  }

  async insertChat(id: string, repoId: string, title?: string): Promise<Chat> {
    const db = this.getDatabase();
    await db.query(
      `INSERT INTO chats (id, title, repo_id) VALUES ($1, $2, $3)`,
      [id, title || null, repoId]
    );

    return {
      id,
      title,
      repo_id: repoId,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  async updateTitle(id: string, title: string): Promise<void> {
    const db = this.getDatabase();
    await db.query(
      `UPDATE chats SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [title, id]
    );
  }

  async updateTimestamp(id: string): Promise<void> {
    const db = this.getDatabase();
    await db.query(
      `UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );
  }
}
