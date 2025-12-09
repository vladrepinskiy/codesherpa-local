import { styled } from "goober";

export const ChatLoadingSpinner = () => {
  return (
    <Container>
      <Spinner />
      <Text>Loading model...</Text>
    </Container>
  );
};

const Container = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  height: 100%;
`;

const Spinner = styled("div")`
  width: 40px;
  height: 40px;
  border: 3px solid ${(props) => props.theme.palette.button.disabled};
  border-top-color: ${(props) => props.theme.palette.accent};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const Text = styled("p")`
  font-size: ${(props) => props.theme.fontSizes.md};
  color: ${(props) => props.theme.palette.textMuted};
  margin: 0;
`;
