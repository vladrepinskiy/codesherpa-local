import { useEffect } from "react";
import { styled } from "goober";
import type { ReactNode } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  fullscreen?: boolean;
  showCloseButton?: boolean;
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  fullscreen = false,
  showCloseButton = true,
}: ModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose} $fullscreen={fullscreen}>
      <ModalContent
        onClick={(e) => e.stopPropagation()}
        $fullscreen={fullscreen}
      >
        {(title || showCloseButton) && (
          <ModalHeader>
            {title && <ModalTitle>{title}</ModalTitle>}
            {showCloseButton && <CloseButton onClick={onClose}>×</CloseButton>}
          </ModalHeader>
        )}
        <ModalBody>{children}</ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled("div")<{ $fullscreen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${(props) => (props.$fullscreen ? "0" : "2rem")};
`;

const ModalContent = styled("div")<{ $fullscreen: boolean }>`
  background-color: ${(props) => props.theme.palette.bg};
  border-radius: ${(props) => (props.$fullscreen ? "0" : "0.75rem")};
  max-width: ${(props) => (props.$fullscreen ? "100%" : "800px")};
  width: 100%;
  max-height: ${(props) => (props.$fullscreen ? "100vh" : "90vh")};
  height: ${(props) => (props.$fullscreen ? "100vh" : "auto")};
  overflow-y: auto;
  box-shadow: ${(props) =>
    props.$fullscreen
      ? "none"
      : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"};
`;

const ModalHeader = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
`;

const ModalTitle = styled("h2")`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: ${(props) => props.theme.palette.text};
`;

const CloseButton = styled("button")`
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  color: ${(props) => props.theme.palette.text};
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${(props) => props.theme.palette.textMuted}20;
  }
`;

const ModalBody = styled("div")`
  padding: 1.5rem;
`;
