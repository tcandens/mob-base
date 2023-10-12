import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface Users {
  id: string | null;
  name: string | null;
  created_at: Generated<string>;
  updated_at: Generated<string | null>;
}

export interface DB {
  users: Users;
}
