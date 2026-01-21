import { createContext, useEffect, useState, type ReactNode } from "react";
import { useLocation, useParams } from "wouter";
import { useRepo } from "../hooks/useRepo";
import { useChats } from "../hooks/useChats";
import { generateChatResponse } from "../services/llm.service";
import type { Message } from "../types/db.types";
import { getRepositories } from "../util/db.util";
import { generateId, toShortId } from "../util/id.util";

type ChatContextType = {
  chatId: string | null;
  messages: Message[];
  isLoading: boolean;
  input: string;
  setInput: (value: string) => void;
  sendMessage: (content: string) => Promise<void>;
};

const defaultChatContext: ChatContextType = {
  chatId: null,
  messages: [],
  isLoading: false,
  input: "",
  setInput: () => {},
  sendMessage: async () => {},
};

export const ChatContext = createContext<ChatContextType>(defaultChatContext);

type ChatProviderProps = {
  children: ReactNode;
};

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const params = useParams<{
    chatId?: string;
    repoShortId?: string;
    chatShortId?: string;
  }>();
  const [_location, setLocation] = useLocation();
  const { getRepositoryByShortId } = useRepo();
  const { getChatByShortId, createChat, updateChatTimestamp } = useChats();

  const [chatId, setChatId] = useState<string | null>(null);
  const [repoId, setRepoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    const { messagesRepository } = getRepositories();

    let currentChatId = chatId;
    let currentRepoId = repoId;

    if (!currentChatId) {
      if (!currentRepoId) {
        console.error("Cannot create chat without repoId");
        setIsLoading(false);
        return;
      }
      
      const newChat = await createChat(currentRepoId);
      currentChatId = newChat.id;
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
      await updateChatTimestamp(currentChatId);

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

  useEffect(() => {
    const loadRepoAndChat = async () => {
      const { messagesRepository } = getRepositories();

      if (params.repoShortId) {
        const repo = getRepositoryByShortId(params.repoShortId);
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

      const chat = getChatByShortId(shortId);

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
  }, [
    params.repoShortId,
    params.chatShortId,
    params.chatId,
    getRepositoryByShortId,
    getChatByShortId,
  ]);

  return (
    <ChatContext.Provider
      value={{
        chatId,
        messages,
        isLoading,
        input,
        setInput,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
