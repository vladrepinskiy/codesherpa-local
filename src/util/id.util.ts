import { nanoid } from "nanoid";

const SHORT_ID_LENGTH = 8;

export const generateId = (): string => {
  return nanoid();
};

export const toShortId = (fullId: string): string => {
  return fullId.slice(0, SHORT_ID_LENGTH);
};
