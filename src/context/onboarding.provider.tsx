import { createContext, useEffect, useState, type ReactNode } from "react";
import { useLocation } from "wouter";

type OnboardingContextType = {
  onboardingStatus: string | null;
  setOnboardingStatus: (status: string) => void;
};

export const OnboardingContext = createContext<
  OnboardingContextType | undefined
>(undefined);

type OnboardingProviderProps = {
  children: ReactNode;
};

export const OnboardingProvider = ({ children }: OnboardingProviderProps) => {
  const [onboardingStatus, setOnboardingStatusState] = useState<string | null>(
    null
  );
  const [location, setLocation] = useLocation();

  const setOnboardingStatus = (status: string) => {
    localStorage.setItem("onboarding", status);
    setOnboardingStatusState(status);
  };

  useEffect(() => {
    const stored = localStorage.getItem("onboarding");
    setOnboardingStatusState(stored);

    if (stored !== "completed") {
      setLocation("/welcome");
    }
  }, [setLocation]);

  useEffect(() => {
    if (location !== "/welcome") {
      const stored = localStorage.getItem("onboarding");
      if (stored !== "completed") {
        localStorage.setItem("onboarding", "completed");
        setOnboardingStatusState("completed");
      }
    }
  }, [location]);

  return (
    <OnboardingContext.Provider
      value={{ onboardingStatus, setOnboardingStatus }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
