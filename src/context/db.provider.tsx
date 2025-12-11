import type { PGlite } from "@electric-sql/pglite";
import { PGliteProvider } from "@electric-sql/pglite-react";
import type { PGliteWithLive } from "@electric-sql/pglite/live";
import { useEffect, useState, type ReactNode } from "react";
import { LoadingOverlay } from "../components/core/LoadingOverlay";
import { getDatabase } from "../util/db.instance";
import { initDatabase } from "../util/db.util";
import { importDemoRepository } from "../util/demo.util";

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

  // db is created with the live extension, so it has the live namespace at runtime
  return (
    <PGliteProvider db={db as unknown as PGliteWithLive}>
      {children}
    </PGliteProvider>
  );
};
