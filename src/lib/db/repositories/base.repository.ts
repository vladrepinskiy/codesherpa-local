import { getDatabase } from "../../../util/db.util";
import type { PGlite } from "@electric-sql/pglite";

export abstract class BaseRepository<T> {
  protected readonly DB_BATCH_SIZE = 1000;

  protected abstract readonly tableName: string;

  protected getDatabase(): PGlite {
    return getDatabase();
  }

  abstract readById(id: string): Promise<T | null>;
  abstract deleteById(id: string): Promise<void>;
}
