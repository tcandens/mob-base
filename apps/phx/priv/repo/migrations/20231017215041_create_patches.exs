defmodule MobBase.Repo.Migrations.CreatePatches do
  use Ecto.Migration

  def change do
    create table(:patches, primary_key: false) do
      add :id, :string, primary_key: true
      add :client_id, :string, null: false
      add :op, :string, null: false
      add :path, :string, null: false
      add :value, :string
      add :user_id, references(:users, on_delete: :delete_all)
    end

    create index(:patches, [:user_id])
  end
end
