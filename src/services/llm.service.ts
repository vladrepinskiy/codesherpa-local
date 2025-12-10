import {
  CreateServiceWorkerMLCEngine,
  type MLCEngineInterface,
} from "@mlc-ai/web-llm";
import { MODEL_ID } from "../constants/llm.constants";

let llmEngine: MLCEngineInterface | null = null;
let isInitializing = false;
let initializationError: Error | null = null;
let serviceWorkerRegistered = false;

export type ProgressCallback = (progress: {
  progress: number;
  timeElapsed: number;
  text: string;
}) => void;

const getServiceWorkerUrl = (): string => {
  return import.meta.env.MODE === "production"
    ? "/codesherpa-local/sw.js"
    : "/sw.js";
};

const waitForServiceWorkerActivation = (
  registration: ServiceWorkerRegistration
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Service worker activation timeout"));
    }, 10000);

    const checkState = () => {
      if (registration.active?.state === "activated") {
        clearTimeout(timeout);
        setTimeout(() => {
          console.log("Service Worker registered and activated:", registration);
          resolve();
        }, 200);
      } else if (registration.installing) {
        registration.installing.addEventListener("statechange", checkState);
      } else if (registration.waiting) {
        registration.waiting.addEventListener("statechange", checkState);
      } else {
        setTimeout(checkState, 100);
      }
    };

    checkState();
  });
};

const registerServiceWorker = async (): Promise<void> => {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service workers are not supported");
  }

  const swUrl = getServiceWorkerUrl();
  const registration = await navigator.serviceWorker.register(swUrl, {
    type: "module",
  });

  await navigator.serviceWorker.ready;
  await waitForServiceWorkerActivation(registration);
};

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
    if (!serviceWorkerRegistered) {
      try {
        await registerServiceWorker();
        serviceWorkerRegistered = true;
      } catch (error) {
        console.error("Service Worker registration failed:", error);
        throw new Error("Failed to register service worker");
      }
    }

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

    llmEngine = await CreateServiceWorkerMLCEngine(MODEL_ID, {
      initProgressCallback: (report) => {
        const progress = report.progress;
        const text = report.text || "Loading model...";
        reportProgress(progress, text);
      },
    });

    isInitializing = false;
    return llmEngine;
  } catch (error) {
    isInitializing = false;
    initializationError = error as Error;
    throw error;
  }
};

export const isLLMInitializing = (): boolean => {
  return isInitializing;
};

export const checkIfModelAlreadyLoaded = async (): Promise<boolean> => {
  if (llmEngine) {
    return true;
  }

  if (!("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const swUrl = getServiceWorkerUrl();
    const registration = await navigator.serviceWorker.getRegistration(swUrl);

    if (!registration || !registration.active) {
      return false;
    }

    let progressReceived = false;
    const startTime = performance.now();

    const engine = await CreateServiceWorkerMLCEngine(MODEL_ID, {
      initProgressCallback: () => {
        progressReceived = true;
      },
    });

    const elapsed = performance.now() - startTime;

    if (engine && elapsed < 200 && !progressReceived) {
      llmEngine = engine;
      isInitializing = false;
      return true;
    }
  } catch (error) {
    return false;
  }

  return false;
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
