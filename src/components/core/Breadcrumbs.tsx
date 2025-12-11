import { useEffect, useState } from "react";
import { styled } from "goober";
import { useLocation } from "wouter";
import { ROUTE_TITLES } from "../../constants/routes.constants";
import { getRepositories } from "../../util/db.util";

export const Breadcrumbs = () => {
  const [location] = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // todo: sort out this mess, using session provider and new data flow
  useEffect(() => {
    const loadBreadcrumbs = async () => {
      setLoading(true);
      try {
        const crumbs: string[] = [];

        if (location === "/") {
          crumbs.push(ROUTE_TITLES["/"] || "Dashboard");
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

          if (repoShortId) {
            const { repositoriesRepository, chatsRepository } =
              getRepositories();
            const repo = await repositoriesRepository.readByShortId(
              repoShortId
            );

            if (repo) {
              crumbs.push("repo");
              crumbs.push(repo.full_name);

              if (chatShortId) {
                crumbs.push("chat");
                const chat = await chatsRepository.readByShortId(chatShortId);
                if (chat) {
                  crumbs.push(chat.title || chatShortId);
                } else {
                  crumbs.push(chatShortId);
                }
              } else if (location.includes("/chat")) {
                crumbs.push("chat");
              }
            } else {
              crumbs.push("repo");
              crumbs.push(repoShortId);
            }
          }
        } else if (location.startsWith("/chat/")) {
          const pathParts = location.split("/").filter(Boolean);
          const chatIndex = pathParts.indexOf("chat");
          const chatId =
            chatIndex >= 0 && pathParts[chatIndex + 1]
              ? pathParts[chatIndex + 1]
              : null;

          crumbs.push("chat");

          if (chatId) {
            const { chatsRepository } = getRepositories();
            const chat = await chatsRepository.readByShortId(chatId);
            if (chat) {
              crumbs.push(chat.title || chatId);
            } else {
              crumbs.push(chatId);
            }
          }
        } else if (location === "/chat") {
          crumbs.push(ROUTE_TITLES["/chat"] || "New Chat");
        } else {
          const title = ROUTE_TITLES[location];
          if (title) {
            crumbs.push(title);
          } else {
            crumbs.push(location);
          }
        }

        setBreadcrumbs(crumbs);
      } catch (error) {
        console.error("Failed to load breadcrumbs:", error);
        setBreadcrumbs([location]);
      } finally {
        setLoading(false);
      }
    };

    loadBreadcrumbs();
  }, [location]);

  if (loading || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <BreadcrumbsContainer>
      {breadcrumbs.map((crumb, index) => (
        <span key={index}>
          <BreadcrumbItem>{crumb}</BreadcrumbItem>
          {index < breadcrumbs.length - 1 && <Separator>{" > "}</Separator>}
        </span>
      ))}
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

const Separator = styled("span")`
  margin: 0 0.25rem;
  color: ${(props) => props.theme.palette.textMuted};
`;
