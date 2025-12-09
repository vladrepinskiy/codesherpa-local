import { useMemo } from "react";
import { getRepositories } from "../util/db.util";

export function useRepositories() {
  return useMemo(() => getRepositories(), []);
}
