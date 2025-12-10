import { LLM_INITIALIZATION_STAGES } from "../constants/llm.constants";
import type { LLMInitializationStage } from "../types/llm.types";

export const getStageFromText = (text: string): LLMInitializationStage => {
  const lowerText = text.toLowerCase();

  if (lowerText.includes("loading model from cache")) {
    return LLM_INITIALIZATION_STAGES.LOADING;
  } else if (
    lowerText.includes("fetching") ||
    lowerText.includes("param cache") ||
    lowerText.includes("downloading")
  ) {
    return LLM_INITIALIZATION_STAGES.DOWNLOADING;
  }

  return LLM_INITIALIZATION_STAGES.LOADING;
};

export const getToastMessage = (
  stage: LLMInitializationStage,
  progress: number
): string => {
  if (stage === LLM_INITIALIZATION_STAGES.DOWNLOADING) {
    return `Downloading model: ${progress}%`;
  }
  return `Loading model: ${progress}%`;
};

export const updateStageFromProgress = (
  currentProgress: number,
  text: string,
  previousProgress: number,
  currentStage: LLMInitializationStage | null
): LLMInitializationStage => {
  const detectedStage = getStageFromText(text);

  if (previousProgress > currentProgress) {
    return LLM_INITIALIZATION_STAGES.LOADING;
  }

  if (currentStage === null || detectedStage !== currentStage) {
    return detectedStage;
  }

  return currentStage;
};
