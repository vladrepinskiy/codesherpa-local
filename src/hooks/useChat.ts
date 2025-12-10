import { useCallback } from "react";
import { useChat as useChatContext } from "../context/chat.provider";
import { useLLM } from "./useLLM";
import type { ChatMessage } from "../types/llm.types";

type UseChatReturn = {
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
  isDbReady: boolean;
  handleInputChange: (value: string) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
};

export const useChat = (): UseChatReturn => {
  const { isInitialized } = useLLM();
  const {
    messages,
    input,
    setInput,
    isLoading,
    isDbReady,
    sendMessage,
    retryMessage,
  } = useChatContext();

  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value);
    },
    [setInput]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      if (!isInitialized || !isDbReady || !input.trim() || isLoading) {
        return;
      }

      await sendMessage(input);
    },
    [input, isInitialized, isDbReady, isLoading, sendMessage]
  );

  const adaptedMessages: ChatMessage[] = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
    id: msg.id,
  }));

  return {
    messages: adaptedMessages,
    input,
    isLoading,
    isDbReady,
    handleInputChange,
    handleSubmit,
    retryMessage,
  };
};
