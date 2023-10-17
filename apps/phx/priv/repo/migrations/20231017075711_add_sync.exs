defmodule MobBase.Repo.Migrations.AddSync do
  use Ecto.Migration

  def change do

    create table("patches", primary_key: false) do
      add :id, :string, primary_key: true
      add :user_id, references(:users, on_delete: :delete_all), null: false
      add :client_id, :string
      add :op, :string, null: false
      add :path, :string, null: false
      add :value, :string, null: false
    end

    create table("checkpoints") do
      add :user_id, references(:users, on_delete: :delete_all), null: false
      add :patch_id, references(:patches, on_delete: :delete_all), null: false
      add :hash, :string, null: false
      add :previous_id, references(:checkpoints)
      timestamps(updated_at: false)
    end

  end
end
