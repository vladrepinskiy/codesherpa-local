import { styled } from "goober";
import { Button } from "./Button";
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
        <ButtonContainer>
          <Button onClick={onAction}>{actionLabel}</Button>
        </ButtonContainer>
      )}
    </Container>
  );
};

const Container = styled("div")`
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background-color: ${(props) => props.theme.palette.bg};
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
  color: ${(props) => props.theme.palette.text};
`;

const ErrorBox = styled("div")`
  padding: 15px;
  background-color: ${(props) => props.theme.palette.bg};
  border: 1px solid ${(props) => props.theme.palette.text};
  border-radius: 6px;
  margin-bottom: 20px;
`;

const ButtonContainer = styled("div")`
  width: 100%;
`;
