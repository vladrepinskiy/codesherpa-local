import { createContext, useEffect, useState, type ReactNode } from "react";
import { useLocation, useParams } from "wouter";
import { generateChatResponse } from "../services/llm.service";
import type { Message } from "../types/db.types";
import { initDatabase, getRepositories } from "../util/db.util";
import { generateId, toShortId } from "../util/id.util";

type ChatContextType = {
  chatId: string | null;
  messages: Message[];
  isLoading: boolean;
  isDbReady: boolean;
  input: string;
  setInput: (value: string) => void;
  sendMessage: (content: string) => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
};

export const ChatContext = createContext<ChatContextType | undefined>(
  undefined
);

type ChatProviderProps = {
  children: ReactNode;
};

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const params = useParams<{
    chatId?: string;
    repoShortId?: string;
    chatShortId?: string;
  }>();
  const [, setLocation] = useLocation();

  const [chatId, setChatId] = useState<string | null>(null);
  const [repoId, setRepoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDbReady, setIsDbReady] = useState(false);
  const [input, setInput] = useState("");

  const createNewChat = async (repoId: string): Promise<string> => {
    const { chatsRepository } = getRepositories();
    const newChatId = generateId();
    await chatsRepository.insertChat(newChatId, repoId);
    return newChatId;
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading || !isDbReady) return;

    setIsLoading(true);
    const { chatsRepository, messagesRepository } = getRepositories();

    let currentChatId = chatId;
    let currentRepoId = repoId;

    if (!currentChatId) {
      if (!currentRepoId) {
        console.error("Cannot create chat without repoId");
        setIsLoading(false);
        return;
      }
      currentChatId = await createNewChat(currentRepoId);
      setChatId(currentChatId);

      if (params.repoShortId) {
        setLocation(
          `/repo/${params.repoShortId}/chat/${toShortId(currentChatId)}`
        );
      } else {
        setLocation(`/chat/${toShortId(currentChatId)}`);
      }
    }

    const userMessageId = generateId();
    const userMessage: Message = {
      id: userMessageId,
      chat_id: currentChatId,
      role: "user",
      content: content.trim(),
      status: "complete",
      created_at: new Date(),
      updated_at: new Date(),
    };

    await messagesRepository.insertMessage(
      userMessageId,
      currentChatId,
      "user",
      content.trim(),
      "complete"
    );

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const assistantMessageId = generateId();
    const assistantMessage: Message = {
      id: assistantMessageId,
      chat_id: currentChatId,
      role: "assistant",
      content: "",
      status: "streaming",
      created_at: new Date(),
      updated_at: new Date(),
    };

    await messagesRepository.insertMessage(
      assistantMessageId,
      currentChatId,
      "assistant",
      "",
      "streaming"
    );

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const allMessages = [...messages, userMessage];
      const formattedMessages = allMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      let fullContent = "";

      await generateChatResponse(formattedMessages, async (chunk) => {
        fullContent += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: fullContent }
              : msg
          )
        );
      });

      await messagesRepository.updateContent(assistantMessageId, fullContent);
      await messagesRepository.updateStatus(assistantMessageId, "complete");
      await chatsRepository.updateTimestamp(currentChatId);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: fullContent, status: "complete" }
            : msg
        )
      );
    } catch (error) {
      const errorContent =
        error instanceof Error ? `Error: ${error.message}` : "Error occurred";

      await messagesRepository.updateContent(assistantMessageId, errorContent);
      await messagesRepository.updateStatus(assistantMessageId, "interrupted");

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: errorContent, status: "interrupted" }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const retryMessage = async (messageId: string) => {
    if (isLoading || !isDbReady || !chatId) return;

    const { messagesRepository, chatsRepository } = getRepositories();

    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex === -1) return;

    const targetMessage = messages[messageIndex];
    if (targetMessage.role !== "assistant") return;

    setIsLoading(true);

    const contextMessages = messages.slice(0, messageIndex);

    await messagesRepository.updateContent(messageId, "");
    await messagesRepository.updateStatus(messageId, "streaming");

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, content: "", status: "streaming" }
          : msg
      )
    );

    try {
      const formattedMessages = contextMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      let fullContent = "";

      await generateChatResponse(formattedMessages, async (chunk) => {
        fullContent += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, content: fullContent } : msg
          )
        );
      });

      await messagesRepository.updateContent(messageId, fullContent);
      await messagesRepository.updateStatus(messageId, "complete");
      await chatsRepository.updateTimestamp(chatId);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: fullContent, status: "complete" }
            : msg
        )
      );
    } catch (error) {
      const errorContent =
        error instanceof Error ? `Error: ${error.message}` : "Error occurred";

      await messagesRepository.updateContent(messageId, errorContent);
      await messagesRepository.updateStatus(messageId, "interrupted");

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: errorContent, status: "interrupted" }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await initDatabase();
      setIsDbReady(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (!isDbReady) return;

    const loadRepoAndChat = async () => {
      const { repositoriesRepository, chatsRepository, messagesRepository } =
        getRepositories();

      if (params.repoShortId) {
        const repo = await repositoriesRepository.readByShortId(
          params.repoShortId
        );
        if (repo) {
          setRepoId(repo.id);
        } else {
          setRepoId(null);
          setChatId(null);
          setMessages([]);
          return;
        }
      } else {
        setRepoId(null);
      }

      const shortId = params.chatShortId || params.chatId;

      if (!shortId) {
        setChatId(null);
        setMessages([]);
        return;
      }

      const chat = await chatsRepository.readByShortId(shortId);

      if (chat) {
        setChatId(chat.id);
        const chatMessages = await messagesRepository.getMessagesByChatId(
          chat.id
        );
        setMessages(chatMessages);
      } else {
        setChatId(null);
        setMessages([]);
      }
    };

    loadRepoAndChat();
  }, [params.repoShortId, params.chatShortId, params.chatId, isDbReady]);

  return (
    <ChatContext.Provider
      value={{
        chatId,
        messages,
        isLoading,
        isDbReady,
        input,
        setInput,
        sendMessage,
        retryMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
