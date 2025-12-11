import { styled } from "goober";
import type { ReactNode } from "react";
import { useLocation } from "wouter";

type PageProps = {
  children: ReactNode;
};

export const Page = ({ children }: PageProps) => {
  const [location] = useLocation();
  const showTopbar = location !== "/welcome";

  return <PageContainer $showTopbar={showTopbar}>{children}</PageContainer>;
};

const PageContainer = styled("div")<{ $showTopbar: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin: 0 auto;
  overflow: hidden;
  background-color: ${(props) => props.theme.palette.bg};
  padding-top: ${(props) => (props.$showTopbar ? "3rem" : "0")};
`;
