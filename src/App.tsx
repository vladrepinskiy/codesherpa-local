import { styled } from "goober";
import { Toaster } from "sonner";
import { Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import "./App.css";
import { DatabaseRepl } from "./components/core/DatabaseRepl";
import { HashRouteNormalizer } from "./components/core/HashRouteNormalizer";
import { ThemeToggle } from "./components/core/ThemeToggle";
import { ChatPage } from "./components/pages/ChatPage";
import { Dashboard } from "./components/pages/Dashboard";
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
          <Router hook={useHashLocation}>
            <HashRouteNormalizer />
            <AppContainer>
              <Toaster />
              <ThemeToggle />
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/welcome" component={Welcome} />
                <Route path="/import" component={Import} />
                <Route path="/chat/:chatId" component={ChatPage} />
                <Route path="/chat" component={ChatPage} />
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
