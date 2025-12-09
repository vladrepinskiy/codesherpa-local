import { styled } from "goober";
import { useEffect, useRef } from "react";
import { Button } from "../core/Button";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e?: React.FormEvent) => Promise<void>;
  disabled?: boolean;
  isLoading?: boolean;
};

export const ChatInput = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  isLoading = false,
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [value]);

  return (
    <Form onSubmit={onSubmit}>
      <InputContainer>
        <Input
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your message..."
          disabled={disabled || isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
        />
        <SendButton type="submit" disabled={disabled || isLoading || !value.trim()}>
          {isLoading ? "..." : "Send"}
        </SendButton>
      </InputContainer>
    </Form>
  );
};

const Form = styled("form")`
  padding: 1rem;
  border-top: 1px solid ${(props) => props.theme.palette.button.disabled};
  background-color: ${(props) => props.theme.palette.bg};
`;

const InputContainer = styled("div")`
  display: flex;
  gap: 0.75rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Input = styled("textarea")`
  flex: 1;
  padding: 0.75rem;
  font-size: ${(props) => props.theme.fontSizes.md};
  border: 1px solid ${(props) => props.theme.palette.button.disabled};
  border-radius: 0.5rem;
  background-color: ${(props) => props.theme.palette.bg};
  color: ${(props) => props.theme.palette.text};
  resize: none;
  min-height: 44px;
  max-height: 120px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.palette.accent};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SendButton = styled(Button)`
  align-self: flex-end;
`;
