import type { Chat } from "../../../types/db.types";
import { BaseRepository } from "./base.repository";

export const createChatsTable = `
  CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    title TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

export class ChatsRepository extends BaseRepository<Chat> {
  protected readonly tableName = "chats";

  async readById(id: string): Promise<Chat | null> {
    const db = this.getDatabase();
    const result = await db.query("SELECT * FROM chats WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0] as Chat;
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  async readByShortId(shortId: string): Promise<Chat | null> {
    const db = this.getDatabase();
    const result = await db.query(
      "SELECT * FROM chats WHERE id LIKE $1 ORDER BY created_at DESC LIMIT 1",
      [`${shortId}%`]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0] as Chat;
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  async deleteById(id: string): Promise<void> {
    const db = this.getDatabase();
    await db.query("DELETE FROM chats WHERE id = $1", [id]);
  }

  async insertChat(id: string, title?: string): Promise<Chat> {
    const db = this.getDatabase();
    await db.query(`INSERT INTO chats (id, title) VALUES ($1, $2)`, [
      id,
      title || null,
    ]);

    return {
      id,
      title,
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

  async getAllChats(): Promise<Chat[]> {
    const db = this.getDatabase();
    const result = await db.query(
      "SELECT * FROM chats ORDER BY updated_at DESC"
    );

    return (result.rows as Chat[]).map((row) => ({
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    }));
  }
}
