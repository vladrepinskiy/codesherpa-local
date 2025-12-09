import { styled } from "goober";
import { Page } from "../core/Page";

export const Chat = () => {
  return (
    <Page>
      <ChatContainer>
        <Title>Chat</Title>
        <Description>Chat functionality coming soon...</Description>
      </ChatContainer>
    </Page>
  );
};

const ChatContainer = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const Title = styled("h1")`
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  color: ${(props) => props.theme.palette.text};
`;

const Description = styled("p")`
  font-size: 1rem;
  color: ${(props) => props.theme.palette.textMuted};
  margin: 0;
`;
