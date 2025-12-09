import { styled } from "goober";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({
  children,
  disabled = false,
  onClick,
  type = "button",
  ...props
}: ButtonProps) => {
  return (
    <ButtonContainer
      type={type}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </ButtonContainer>
  );
};

const ButtonContainer = styled("button")`
  padding: 0.75rem 1.5rem;
  font-size: ${(props) => props.theme.fontSizes.md};
  font-weight: 500;
  background-color: ${(props) => props.theme.palette.button.bg};
  color: ${(props) => props.theme.palette.button.text};
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.palette.button.hover};
  }

  &:active:not(:disabled) {
    background-color: ${(props) => props.theme.palette.button.active};
  }

  &:disabled {
    background-color: ${(props) => props.theme.palette.button.disabled};
    color: ${(props) => props.theme.palette.button.disabledText};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;
