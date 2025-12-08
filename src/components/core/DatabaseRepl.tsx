import { Repl } from "@electric-sql/pglite-repl";
import { styled } from "goober";
import { useEffect, useState } from "react";
import { getDatabase, initDatabase } from "../../services/db";

export const DatabaseRepl = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [db, setDb] = useState<Awaited<ReturnType<typeof initDatabase>> | null>(
    null
  );

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Cmd+Shift+D on Mac, Ctrl+Shift+D on Windows/Linux
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key === "d" &&
        !e.defaultPrevented
      ) {
        e.preventDefault();
        const willOpen = !isOpen;
        setIsOpen(willOpen);

        if (willOpen) {
          // Try to get or initialize database when opening
          try {
            const database = getDatabase();
            setDb(database);
          } catch {
            // Database not initialized, initialize it
            try {
              const database = await initDatabase();
              setDb(database);
            } catch (error) {
              console.error("Failed to initialize database for REPL:", error);
              setIsOpen(false);
            }
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen || !db) {
    return null;
  }

  return (
    <ReplContainer>
      <ReplWrapper>
        <Repl pg={db} />
      </ReplWrapper>
    </ReplContainer>
  );
};

const ReplContainer = styled("div")`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50vh;
  z-index: 9999;
  background-color: white;
  border-top: 1px solid #d0d7de;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
`;

const ReplWrapper = styled("div")`
  width: 100%;
  height: 100%;
`;
