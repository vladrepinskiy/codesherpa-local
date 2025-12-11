import { styled } from "goober";

type LoadingOverlayProps = {
  message?: string;
};

export const LoadingOverlay = ({
  message = "Loading...",
}: LoadingOverlayProps) => {
  return (
    <Overlay>
      <LoadingText>{message}</LoadingText>
    </Overlay>
  );
};

const Overlay = styled("div")`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.theme.palette.bg};
  z-index: 9999;
`;

const LoadingText = styled("div")`
  font-size: 1.125rem;
  color: ${(props) => props.theme.palette.textMuted};
`;
