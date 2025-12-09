import { styled } from "goober";
import type { ReactNode } from "react";

type PageProps = {
  children: ReactNode;
};

export const Page = ({ children }: PageProps) => {
  return <PageContainer>{children}</PageContainer>;
};

const PageContainer = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin: 0 auto;
  background-color: ${(props) => props.theme.palette.bg};
`;
