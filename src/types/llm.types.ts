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
