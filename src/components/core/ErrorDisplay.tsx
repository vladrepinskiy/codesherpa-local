import { styled } from "goober";
import type { ErrorDisplayProps } from "../../types/component.types";

export const ErrorDisplay = ({
  title,
  icon = "⚠️",
  children,
  actionLabel,
  onAction,
}: ErrorDisplayProps) => {
  return (
    <Container>
      <Header>
        <ErrorIcon>{icon}</ErrorIcon>
        <ErrorTitle>{title}</ErrorTitle>
      </Header>

      <ErrorBox>{children}</ErrorBox>

      {actionLabel && onAction && (
        <ActionButton onClick={onAction}>{actionLabel}</ActionButton>
      )}
    </Container>
  );
};

const Container = styled("div")`
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
`;

const Header = styled("div")`
  text-align: center;
  margin-bottom: 20px;
`;

const ErrorIcon = styled("div")`
  font-size: 48px;
  margin-bottom: 10px;
`;

const ErrorTitle = styled("h2")`
  margin: 0 0 10px 0;
  font-size: 1.8rem;
  color: #d73a4a;
`;

const ErrorBox = styled("div")`
  padding: 15px;
  background-color: #fff5f5;
  border: 1px solid #d73a4a;
  border-radius: 6px;
  margin-bottom: 20px;
`;

const ActionButton = styled("button")`
  width: 100%;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background-color: #2da44e;
  border: none;
  border-radius: 6px;
  cursor: pointer;
`;
