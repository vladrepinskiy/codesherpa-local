import { styled } from "goober";
import { Toaster } from "sonner";
import { Route, Router, Switch, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { DatabaseRepl } from "./components/core/DatabaseRepl";
import { HashRouteNormalizer } from "./components/core/HashRouteNormalizer";
import { Topbar } from "./components/core/Topbar";
import { PageChat } from "./components/pages/PageChat";
import { PageDashboard } from "./components/pages/PageDashboard";
import { PageRepo } from "./components/pages/PageRepo";
import { PageWelcome } from "./components/pages/PageWelcome";
import { DatabaseProvider } from "./context/db.provider";
import { LLMProvider } from "./context/llm.provider";
import { OnboardingProvider } from "./context/onboarding.provider";
import { ThemeProvider } from "./context/theme.provider";

export const App = () => {
  return (
    <ThemeProvider>
      <DatabaseProvider>
        <LLMProvider>
          <OnboardingProvider>
            <Router hook={useHashLocation}>
              <HashRouteNormalizer />
              <Routes />
            </Router>
          </OnboardingProvider>
        </LLMProvider>
      </DatabaseProvider>
    </ThemeProvider>
  );
};

const Routes = () => {
  const [location] = useLocation();

  return (
    <AppContainer>
      <Toaster />
      {location !== "/welcome" && <Topbar />}
      <DatabaseRepl />
      <Switch>
        <Route path="/" component={PageDashboard} />
        <Route path="/welcome" component={PageWelcome} />
        <Route
          path="/repo/:repoShortId/chat/:chatShortId"
          component={PageChat}
        />
        <Route path="/repo/:repoShortId/chat" component={PageChat} />
        <Route path="/repo/:repoShortId" component={PageRepo} />
        <Route path="/chat/:chatId" component={PageChat} />
        <Route path="/chat" component={PageChat} />
      </Switch>
    </AppContainer>
  );
};

const AppContainer = styled("div")`
  min-height: 100vh;
  background-color: ${(props) => props.theme.palette.bg};
`;
