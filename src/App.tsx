import { styled } from "goober";
import "./App.css";
import { DatabaseRepl } from "./components/core/DatabaseRepl";
import { RepositoryImporter } from "./components/import/RepositoryImporter";

export const App = () => {
  return (
    <AppContainer>
      <RepositoryImporter />
      <DatabaseRepl />
    </AppContainer>
  );
};

const AppContainer = styled("div")`
  min-height: 100vh;
  background-color: #ffffff;
`;
