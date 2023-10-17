defmodule MobBase.Repo.Migrations.CreateCheckpoints do
  use Ecto.Migration

  def change do
    create table(:checkpoints) do
      add :hash, :string, null: false
      add :user_id, references(:users, on_delete: :delete_all)
      add :patch_id, references(:patches, on_delete: :delete_all)
      add :previous_id, references(:checkpoints, on_delete: :nothing)

      timestamps(type: :utc_datetime, updated_at: false)
    end

    create index(:checkpoints, [:user_id])
    create index(:checkpoints, [:patch_id])
    create index(:checkpoints, [:previous_id])
  end
end
