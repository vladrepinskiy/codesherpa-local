import { useContext } from "react";
import { LLMContext } from "../context/llm.provider";

export const useLLM = () => {
  const context = useContext(LLMContext);

  if (!context) {
    throw new Error("useLLM must be used within an LLMProvider");
  }

  return context;
};
