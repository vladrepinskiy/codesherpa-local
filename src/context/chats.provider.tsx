import { createContext, type ReactNode } from "react";
import { useLiveQuery } from "@electric-sql/pglite-react";
import type { Chat } from "../types/db.types";
import { CHATS_QUERY } from "../lib/db/repositories/chats.repository";
import { getRepositories } from "../util/db.util";
import { generateId } from "../util/id.util";

type ChatsContextType = {
  chats: Chat[];
  getChatById: (id: string) => Chat | undefined;
  getChatByShortId: (shortId: string) => Chat | undefined;
  getChatsByRepoId: (repoId: string) => Chat[];
  createChat: (repoId: string, title?: string) => Promise<Chat>;
  deleteChat: (id: string) => Promise<void>;
  updateChatTitle: (id: string, title: string) => Promise<void>;
  updateChatTimestamp: (id: string) => Promise<void>;
};

const defaultChatsContext: ChatsContextType = {
  chats: [],
  getChatById: () => undefined,
  getChatByShortId: () => undefined,
  getChatsByRepoId: () => [],
  createChat: async () => ({
    id: "",
    repo_id: "",
    created_at: new Date(),
    updated_at: new Date(),
  }),
  deleteChat: async () => {},
  updateChatTitle: async () => {},
  updateChatTimestamp: async () => {},
};

export const ChatsContext =
  createContext<ChatsContextType>(defaultChatsContext);

export const ChatsProvider = ({ children }: { children: ReactNode }) => {
  const { chatsRepository } = getRepositories();

  const result = useLiveQuery<Chat>(CHATS_QUERY);

  const chats = result?.rows
    ? result.rows.map((row) => ({
        ...row,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
      }))
    : [];

  const getChatById = (id: string) => {
    return chats.find((chat) => chat.id === id);
  };

  const getChatByShortId = (shortId: string) => {
    return chats.find((chat) => chat.id.startsWith(shortId));
  };

  const getChatsByRepoId = (repoId: string) => {
    return chats.filter((chat) => chat.repo_id === repoId);
  };

  const createChat = async (repoId: string, title?: string): Promise<Chat> => {
    const id = generateId();
    const newChat = await chatsRepository.insertChat(id, repoId, title);

    return newChat;
  };

  const deleteChat = async (id: string) => {
    await chatsRepository.deleteById(id);
  };

  const updateChatTitle = async (id: string, title: string) => {
    await chatsRepository.updateTitle(id, title);
  };

  const updateChatTimestamp = async (id: string) => {
    await chatsRepository.updateTimestamp(id);
  };

  return (
    <ChatsContext.Provider
      value={{
        chats,
        getChatById,
        getChatByShortId,
        getChatsByRepoId,
        createChat,
        deleteChat,
        updateChatTitle,
        updateChatTimestamp,
      }}
    >
      {children}
    </ChatsContext.Provider>
  );
};
