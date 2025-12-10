import type { LLM_INITIALIZATION_STAGES } from "../constants/llm.constants";
import type { ValueOf } from "./util.types";

export type LLMInitializationStage = ValueOf<typeof LLM_INITIALIZATION_STAGES>;

export type ProgressCallback = (progress: {
  progress: number;
  timeElapsed: number;
  text: string;
}) => void;

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  id?: string;
};
