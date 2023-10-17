import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface Checkpoints {
  id: Generated<number | null>;
  user_id: string | null;
  patch_id: string | null;
  hash: string;
  created_at: Generated<number | null>;
  previous_id: string | null;
}

export interface Patches {
  id: string | null;
  user_id: string | null;
  op: string;
  path: string;
  value: string;
}

export interface Programs {
  id: string | null;
  name: string | null;
  user_id: string | null;
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
  checkpoints: Checkpoints;
  patches: Patches;
  programs: Programs;
  users: Users;
}
