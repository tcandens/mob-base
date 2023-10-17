defmodule MobBase.SyncService.Checkpoint do
  @moduledoc """
  The Checkpoint event.
  """

  use Ecto.Schema
  import Ecto.Changeset

  schema "checkpoints" do
    field :hash, :string

    # field :patch_id, :id
    field :previous_id, :id

    # has_one :previous, MobBase.SyncService.Checkpoint
    # belongs_to :previous, MobBase.SyncService.Checkpoint

    belongs_to :user, MobBase.Accounts.User
    belongs_to :patch, MobBase.SyncService.Patch

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(checkpoint, attrs) do
    checkpoint
    |> cast(attrs, [:hash, :user_id, :patch_id, :previous_id])
    |> validate_required([:hash, :user_id, :patch_id])
  end
end
