defmodule MobBase.SyncService.Patch do
  @moduledoc """
  The Patch event.
  """

  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :string, autogenerate: false}
  schema "patches" do
    field :client_id, :string
    field :op, :string
    field :path, :string
    field :value, :string

    belongs_to :user, MobBase.Accounts.User

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(patch, attrs) do
    patch
    |> cast(attrs, [:id, :client_id, :op, :path, :value])
    |> validate_required([:id, :client_id, :op, :path, :value])
  end
end
