defmodule MobBase.SyncServiceFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `MobBase.SyncService` context.
  """

  @doc """
  Generate a patch.
  """
  def patch_fixture(attrs \\ %{}) do
    {:ok, patch} =
      attrs
      |> Enum.into(%{
        client_id: "some client_id",
        id: "some id",
        op: "some op",
        path: "some path",
        value: "some value"
      })
      |> MobBase.SyncService.create_patch()

    patch
  end

  @doc """
  Generate a checkpoint.
  """
  def checkpoint_fixture(attrs \\ %{}) do
    {:ok, checkpoint} =
      attrs
      |> Enum.into(%{
        hash: "some hash"
      })
      |> MobBase.SyncService.create_checkpoint()

    checkpoint
  end
end
