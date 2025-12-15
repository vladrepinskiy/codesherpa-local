import { usePGlite } from "@electric-sql/pglite-react";

export const useDB = () => {
  const db = usePGlite();
  return { db };
};
