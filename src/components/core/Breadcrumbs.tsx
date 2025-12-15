import { styled } from "goober";
import { useLocation } from "wouter";
import { ROUTE_TITLES } from "../../constants/routes.constants";
import { useChats } from "../../hooks/useChats";
import { useRepo } from "../../hooks/useRepo";

type BreadcrumbItem = {
  label: string;
  path: string;
};

export const Breadcrumbs = () => {
  const [location] = useLocation();
  const { getRepositoryByShortId } = useRepo();
  const { getChatByShortId } = useChats();

  // todo: can we simplify and make use of the wouter router?
  const buildBreadcrumbs = (): BreadcrumbItem[] => {
    const crumbs: BreadcrumbItem[] = [];

    if (location === "/") {
      crumbs.push({ label: ROUTE_TITLES["/"] || "Dashboard", path: "/" });
    } else if (location.startsWith("/repo/")) {
      const pathParts = location.split("/").filter(Boolean);
      const repoIndex = pathParts.indexOf("repo");
      const repoShortId =
        repoIndex >= 0 && pathParts[repoIndex + 1]
          ? pathParts[repoIndex + 1]
          : null;
      const chatIndex = pathParts.indexOf("chat");
      const chatShortId =
        chatIndex >= 0 && pathParts[chatIndex + 1]
          ? pathParts[chatIndex + 1]
          : null;

      crumbs.push({ label: ROUTE_TITLES["/"] || "Dashboard", path: "/" });

      if (repoShortId) {
        const repo = getRepositoryByShortId(repoShortId);
        const repoPath = `/repo/${repoShortId}`;
        crumbs.push({
          label: repo?.full_name || repoShortId,
          path: repoPath,
        });

        if (chatShortId) {
          const chat = getChatByShortId(chatShortId);
          const chatPath = `/repo/${repoShortId}/chat/${chatShortId}`;
          crumbs.push({
            label: chat?.title || chatShortId,
            path: chatPath,
          });
        } else if (location.includes("/chat")) {
          crumbs.push({
            label: ROUTE_TITLES["/chat"] || "New Chat",
            path: `/repo/${repoShortId}/chat`,
          });
        }
      }
    } else if (location.startsWith("/chat/")) {
      const pathParts = location.split("/").filter(Boolean);
      const chatIndex = pathParts.indexOf("chat");
      const chatId =
        chatIndex >= 0 && pathParts[chatIndex + 1]
          ? pathParts[chatIndex + 1]
          : null;

      crumbs.push({ label: ROUTE_TITLES["/"] || "Dashboard", path: "/" });

      if (chatId) {
        const chat = getChatByShortId(chatId);
        const chatPath = `/chat/${chatId}`;
        crumbs.push({
          label: chat?.title || chatId,
          path: chatPath,
        });
      }
    } else if (location === "/chat") {
      crumbs.push({ label: ROUTE_TITLES["/"] || "Dashboard", path: "/" });
      crumbs.push({
        label: ROUTE_TITLES["/chat"] || "New Chat",
        path: "/chat",
      });
    } else {
      crumbs.push({ label: ROUTE_TITLES["/"] || "Dashboard", path: "/" });
      const title = ROUTE_TITLES[location];
      if (title) {
        crumbs.push({ label: title, path: location });
      } else {
        crumbs.push({ label: location, path: location });
      }
    }

    return crumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <BreadcrumbsContainer>
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <span key={index}>
            {isLast ? (
              <BreadcrumbItem>{crumb.label}</BreadcrumbItem>
            ) : (
              <BreadcrumbLink href={`#${crumb.path}`}>
                {crumb.label}
              </BreadcrumbLink>
            )}
            {!isLast && <Separator>{" > "}</Separator>}
          </span>
        );
      })}
    </BreadcrumbsContainer>
  );
};

const BreadcrumbsContainer = styled("div")`
  display: flex;
  align-items: center;
  flex: 1;
  font-size: 0.875rem;
  color: ${(props) => props.theme.palette.textMuted};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BreadcrumbItem = styled("span")`
  color: ${(props) => props.theme.palette.text};
`;

const BreadcrumbLink = styled("a")`
  color: ${(props) => props.theme.palette.text};
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
    text-decoration: underline;
  }
`;

const Separator = styled("span")`
  margin: 0 0.25rem;
  color: ${(props) => props.theme.palette.textMuted};
`;
