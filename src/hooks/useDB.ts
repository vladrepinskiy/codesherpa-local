import { useContext } from "react";
import { DatabaseContext } from "../context/db.provider";

export const useDB = () => {
  const context = useContext(DatabaseContext);

  if (!context) {
    throw new Error("useDB must be used within a DatabaseProvider");
  }

  return context;
};
