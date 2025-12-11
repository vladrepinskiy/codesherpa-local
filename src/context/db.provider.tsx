import { createContext, useEffect, useState, type ReactNode } from "react";
import type { PGlite } from "@electric-sql/pglite";
import { initDatabase, getDatabase } from "../util/db.util";
import { importDemoRepository } from "../util/demo.util";
import { LoadingOverlay } from "../components/core/LoadingOverlay";

type DatabaseContextType = {
  db: PGlite;
};

export const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider = ({ children }: { children: ReactNode }) => {
  const [db, setDb] = useState<PGlite | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        const database = getDatabase();
        setDb(database);
        await importDemoRepository();
        setIsReady(true);
      } catch (error) {
        console.error("Failed to initialize database:", error);
      }
    };

    init();
  }, []);

  if (!isReady || !db) {
    return <LoadingOverlay message="Initializing database..." />;
  }

  return (
    <DatabaseContext.Provider value={{ db }}>
      {children}
    </DatabaseContext.Provider>
  );
};
