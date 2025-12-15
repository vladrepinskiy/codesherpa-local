import { useContext } from "react";
import { RepoContext } from "../context/repo.provider";

export const useRepo = () => {
  const context = useContext(RepoContext);

  if (!context) {
    throw new Error("useRepo must be used within a RepoProvider");
  }

  return context;
};
