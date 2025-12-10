import {
  createContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { LLM_INITIALIZATION_STAGES } from "../constants/llm.constants";
import {
  initializeLLM,
  isLLMInitializing,
  type ProgressCallback,
} from "../services/llm.service";
import type { LLMInitializationStage } from "../types/llm.types";
import { getToastMessage, updateStageFromProgress } from "../util/llm.util";

type LLMContextValue = {
  isInitialized: boolean;
};

export const LLMContext = createContext<LLMContextValue | null>(null);

type LLMProviderProps = {
  children: ReactNode;
};

export const LLMProvider = ({ children }: LLMProviderProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationStartedRef = useRef(false);
  const previousProgressRef = useRef<number>(-1);
  const stageRef = useRef<LLMInitializationStage | null>(null);

  const resetRefs = () => {
    previousProgressRef.current = -1;
    stageRef.current = null;
  };

  const handleInitialize = async () => {
    if (isInitialized || initializationStartedRef.current) return;

    if (isLLMInitializing()) {
      initializationStartedRef.current = true;
      return;
    }

    initializationStartedRef.current = true;
    previousProgressRef.current = -1;
    stageRef.current = null;

    const id = toast.loading("Initializing model...");

    try {
      const progressCallback: ProgressCallback = (report) => {
        const progressPercent = Math.round(report.progress * 100);
        const text = report.text || "Loading model...";

        stageRef.current = updateStageFromProgress(
          progressPercent,
          text,
          previousProgressRef.current,
          stageRef.current
        );

        previousProgressRef.current = progressPercent;

        const stage = stageRef.current || LLM_INITIALIZATION_STAGES.LOADING;
        const toastMessage = getToastMessage(stage, progressPercent);
        toast.loading(toastMessage, { id });
      };

      await initializeLLM(progressCallback);

      setIsInitialized(true);
      resetRefs();

      toast.success("Model loaded successfully", { id });
    } catch (err) {
      const error = err as Error;
      toast.error(`Failed to load model: ${error.message}`, { id });
    }
  };

  useEffect(() => {
    if (!isInitialized && !initializationStartedRef.current) {
      handleInitialize();
    }
  }, []);

  const value: LLMContextValue = {
    isInitialized,
  };

  return <LLMContext.Provider value={value}>{children}</LLMContext.Provider>;
};
