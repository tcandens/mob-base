import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface Programs {
  id: string | null;
  name: string | null;
  created_at: Generated<number | null>;
  updated_at: Generated<number | null>;
  tombstoned: Generated<number | null>;
}

export interface Users {
  id: string | null;
  name: string | null;
  created_at: Generated<number>;
  updated_at: Generated<number | null>;
  tombstoned: Generated<number | null>;
}

export interface DB {
  programs: Programs;
  users: Users;
}
