import { Repl } from "@electric-sql/pglite-repl";
import { styled } from "goober";
import { useEffect, useState } from "react";
import { useDB } from "../../hooks/useDB";

export const DatabaseRepl = () => {
  const { db } = useDB();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Shift+D on Mac, Ctrl+Shift+D on Windows/Linux
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key === "d" &&
        !e.defaultPrevented
      ) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!isOpen) {
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
  background-color: ${(props) => props.theme.palette.bg};
  border-top: 1px solid ${(props) => props.theme.palette.text};
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
`;

const ReplWrapper = styled("div")`
  width: 100%;
  height: 100%;
`;
