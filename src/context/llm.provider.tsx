import { createContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { initializeLLM, type ProgressCallback } from "../services/llm.service";

type LLMContextValue = {
  isLoading: boolean;
  progress: number;
  statusMessage: string;
  error: Error | null;
  isInitialized: boolean;
  initialize: () => Promise<void>;
};

export const LLMContext = createContext<LLMContextValue | null>(null);

type LLMProviderProps = {
  children: ReactNode;
};

export const LLMProvider = ({ children }: LLMProviderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [toastId, setToastId] = useState<string | number | null>(null);

  const handleInitialize = async () => {
    if (isInitialized) {
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setStatusMessage("Initializing model...");
    setError(null);

    const id = toast.loading("Loading model: 0%");
    setToastId(id);

    try {
      const progressCallback: ProgressCallback = (report) => {
        const progressPercent = Math.round(report.progress * 100);
        setProgress(progressPercent);
        setStatusMessage(report.text || "Loading model...");

        toast.loading(`Loading model: ${progressPercent}%`, { id });
      };

      await initializeLLM(progressCallback);

      setIsInitialized(true);
      setProgress(100);
      setStatusMessage("Model loaded successfully");

      toast.success("Model loaded successfully", { id });
      setToastId(null);
    } catch (err) {
      const error = err as Error;
      setError(error);
      setStatusMessage(`Error: ${error.message}`);

      toast.error(`Failed to load model: ${error.message}`, { id });
      setToastId(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitialized && !isLoading) {
      handleInitialize();
    }
  }, []);

  const value: LLMContextValue = {
    isLoading,
    progress,
    statusMessage,
    error,
    isInitialized,
    initialize: handleInitialize,
  };

  return <LLMContext.Provider value={value}>{children}</LLMContext.Provider>;
};
