import { styled } from "goober";
import { Toaster } from "sonner";
import { Route, Router, Switch } from "wouter";
import "./App.css";
import { DatabaseRepl } from "./components/core/DatabaseRepl";
import { ThemeToggle } from "./components/core/ThemeToggle";
import { Chat } from "./components/pages/Chat";
import { Import } from "./components/pages/Import";
import { Welcome } from "./components/pages/Welcome";
import { LLMProvider } from "./context/llm.provider";
import { OnboardingProvider } from "./context/onboarding.provider";
import { ThemeProvider } from "./context/theme.provider";

export const App = () => {
  return (
    <ThemeProvider>
      <LLMProvider>
        <OnboardingProvider>
          <Router>
            <AppContainer>
              <Toaster />
              <ThemeToggle />
              <Switch>
                <Route path="/welcome" component={Welcome} />
                <Route path="/import" component={Import} />
                <Route path="/chat" component={Chat} />
                <Route component={Welcome} />
              </Switch>
              <DatabaseRepl />
            </AppContainer>
          </Router>
        </OnboardingProvider>
      </LLMProvider>
    </ThemeProvider>
  );
};

const AppContainer = styled("div")`
  min-height: 100vh;
  background-color: ${(props) => props.theme.palette.bg};
`;
