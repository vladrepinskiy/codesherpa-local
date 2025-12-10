import type { Message, MessageStatus } from "../../../types/db.types";
import { BaseRepository } from "./base.repository";

export const createMessagesTable = `
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT,
    status TEXT NOT NULL DEFAULT 'complete',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
`;

export class MessagesRepository extends BaseRepository<Message> {
  protected readonly tableName = "messages";

  async readById(id: string): Promise<Message | null> {
    const db = this.getDatabase();
    const result = await db.query("SELECT * FROM messages WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0] as Message;
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  async deleteById(id: string): Promise<void> {
    const db = this.getDatabase();
    await db.query("DELETE FROM messages WHERE id = $1", [id]);
  }

  async insertMessage(
    id: string,
    chatId: string,
    role: "user" | "assistant",
    content: string,
    status: MessageStatus = "complete"
  ): Promise<Message> {
    const db = this.getDatabase();
    await db.query(
      `INSERT INTO messages (id, chat_id, role, content, status) VALUES ($1, $2, $3, $4, $5)`,
      [id, chatId, role, content, status]
    );

    return {
      id,
      chat_id: chatId,
      role,
      content,
      status,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  async updateContent(id: string, content: string): Promise<void> {
    const db = this.getDatabase();
    await db.query(
      `UPDATE messages SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [content, id]
    );
  }

  async updateStatus(id: string, status: MessageStatus): Promise<void> {
    const db = this.getDatabase();
    await db.query(
      `UPDATE messages SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [status, id]
    );
  }

  async getMessagesByChatId(chatId: string): Promise<Message[]> {
    const db = this.getDatabase();
    const result = await db.query(
      "SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC",
      [chatId]
    );

    return (result.rows as Message[]).map((row) => ({
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    }));
  }

  async getLastInterruptedMessage(chatId: string): Promise<Message | null> {
    const db = this.getDatabase();
    const result = await db.query(
      `SELECT * FROM messages 
       WHERE chat_id = $1 AND status = 'interrupted' 
       ORDER BY created_at DESC LIMIT 1`,
      [chatId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0] as Message;
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}
