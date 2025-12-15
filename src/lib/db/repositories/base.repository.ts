import { getDatabase } from "../../../util/db.instance";
import type { PGlite } from "@electric-sql/pglite";

export abstract class BaseRepository {
  protected readonly DB_BATCH_SIZE = 1000;

  protected abstract readonly tableName: string;

  protected getDatabase(): PGlite {
    return getDatabase();
  }

  abstract deleteById(id: string): Promise<void>;
}
