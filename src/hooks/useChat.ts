import { useState, useCallback } from "react";
import { generateChatResponse } from "../services/llm.service";
import { useLLM } from "./useLLM";
import type { ChatMessage } from "../types/llm.types";

type UseChatReturn = {
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
  handleInputChange: (value: string) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  setMessages: (messages: ChatMessage[]) => void;
};

export const useChat = (): UseChatReturn => {
  const { isInitialized } = useLLM();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      if (!isInitialized || !input.trim() || isLoading) {
        return;
      }

      const userMessage: ChatMessage = {
        role: "user",
        content: input.trim(),
        id: `user-${Date.now()}`,
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setIsLoading(true);

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: "",
        id: `assistant-${Date.now()}`,
      };

      setMessages([...newMessages, assistantMessage]);

      try {
        const formattedMessages = newMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        let fullContent = "";

        await generateChatResponse(formattedMessages, (chunk) => {
          fullContent += chunk;
          setMessages([
            ...newMessages,
            {
              ...assistantMessage,
              content: fullContent,
            },
          ]);
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to generate response";
        setMessages([
          ...newMessages,
          {
            ...assistantMessage,
            content: `Error: ${errorMessage}`,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, messages, isInitialized, isLoading]
  );

  return {
    messages,
    input,
    isLoading,
    handleInputChange,
    handleSubmit,
    setMessages,
  };
};
