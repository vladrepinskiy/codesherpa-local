import { CreateMLCEngine, type MLCEngineInterface } from "@mlc-ai/web-llm";

const MODEL_ID = "Llama-3.1-8B-Instruct-q4f32_1-MLC";

let llmEngine: MLCEngineInterface | null = null;
let isInitializing = false;
let initializationError: Error | null = null;

export type ProgressCallback = (progress: {
  progress: number;
  timeElapsed: number;
  text: string;
}) => void;

const initializeLLMEngine = async (
  onProgress?: ProgressCallback
): Promise<MLCEngineInterface> => {
  if (llmEngine) {
    return llmEngine;
  }

  if (isInitializing) {
    while (isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (llmEngine) {
      return llmEngine;
    }
    if (initializationError) {
      throw initializationError;
    }
  }

  isInitializing = true;

  try {
    const startTime = performance.now();

    const reportProgress = (progress: number, text: string) => {
      const timeElapsed = performance.now() - startTime;
      if (onProgress) {
        onProgress({
          progress,
          timeElapsed,
          text,
        });
      }
    };

    llmEngine = await CreateMLCEngine(
      MODEL_ID,
      {
        initProgressCallback: (report) => {
          const progress = report.progress;
          const text = report.text || "Loading model...";
          reportProgress(progress, text);
        },
      },
      {
        temperature: 0.7,
        top_p: 0.95,
      }
    );

    isInitializing = false;
    return llmEngine;
  } catch (error) {
    isInitializing = false;
    initializationError = error as Error;
    throw error;
  }
};

export const initializeLLM = async (
  onProgress?: ProgressCallback
): Promise<void> => {
  await initializeLLMEngine(onProgress);
};

export const generateChatResponse = async (
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  const engine = await initializeLLMEngine();

  const response = await engine.chat.completions.create({
    messages: messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    temperature: 0.7,
    top_p: 0.95,
    stream: true,
  });

  let fullResponse = "";

  for await (const chunk of response) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) {
      fullResponse += content;
      if (onChunk) {
        onChunk(content);
      }
    }
  }

  return fullResponse;
};
