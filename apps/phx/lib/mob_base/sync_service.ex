defmodule MobBase.SyncService do
  @moduledoc """
  The SyncService context.
  """

  import Ecto.Query, warn: false
  alias MobBase.Repo

  alias MobBase.SyncService.Patch

  @doc """
  Returns the list of patches.

  ## Examples

      iex> list_patches()
      [%Patch{}, ...]

  """
  def list_patches do
    Repo.all(Patch)
  end

  @doc """
  Gets a single patch.

  Raises `Ecto.NoResultsError` if the Patch does not exist.

  ## Examples

      iex> get_patch!(123)
      %Patch{}

      iex> get_patch!(456)
      ** (Ecto.NoResultsError)

  """
  def get_patch!(id), do: Repo.get!(Patch, id)

  @doc """
  Creates a patch.

  ## Examples

      iex> create_patch(%{field: value})
      {:ok, %Patch{}}

      iex> create_patch(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_patch(attrs \\ %{}) do
    %Patch{}
    |> Patch.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a patch.

  ## Examples

      iex> update_patch(patch, %{field: new_value})
      {:ok, %Patch{}}

      iex> update_patch(patch, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_patch(%Patch{} = patch, attrs) do
    patch
    |> Patch.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a patch.

  ## Examples

      iex> delete_patch(patch)
      {:ok, %Patch{}}

      iex> delete_patch(patch)
      {:error, %Ecto.Changeset{}}

  """
  def delete_patch(%Patch{} = patch) do
    Repo.delete(patch)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking patch changes.

  ## Examples

      iex> change_patch(patch)
      %Ecto.Changeset{data: %Patch{}}

  """
  def change_patch(%Patch{} = patch, attrs \\ %{}) do
    Patch.changeset(patch, attrs)
  end

  alias MobBase.SyncService.Checkpoint

  @doc """
  Returns the list of checkpoints.

  ## Examples

      iex> list_checkpoints()
      [%Checkpoint{}, ...]

  """
  def list_checkpoints do
    Repo.all(Checkpoint)
  end

  @doc """
  Gets a single checkpoint.

  Raises `Ecto.NoResultsError` if the Checkpoint does not exist.

  ## Examples

      iex> get_checkpoint!(123)
      %Checkpoint{}

      iex> get_checkpoint!(456)
      ** (Ecto.NoResultsError)

  """
  def get_checkpoint!(id), do: Repo.get!(Checkpoint, id)

  @doc """
  Creates a checkpoint.

  ## Examples

      iex> create_checkpoint(%{field: value})
      {:ok, %Checkpoint{}}

      iex> create_checkpoint(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_checkpoint(attrs \\ %{}) do
    %Checkpoint{}
    |> Checkpoint.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a checkpoint.

  ## Examples

      iex> update_checkpoint(checkpoint, %{field: new_value})
      {:ok, %Checkpoint{}}

      iex> update_checkpoint(checkpoint, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_checkpoint(%Checkpoint{} = checkpoint, attrs) do
    checkpoint
    |> Checkpoint.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a checkpoint.

  ## Examples

      iex> delete_checkpoint(checkpoint)
      {:ok, %Checkpoint{}}

      iex> delete_checkpoint(checkpoint)
      {:error, %Ecto.Changeset{}}

  """
  def delete_checkpoint(%Checkpoint{} = checkpoint) do
    Repo.delete(checkpoint)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking checkpoint changes.

  ## Examples

      iex> change_checkpoint(checkpoint)
      %Ecto.Changeset{data: %Checkpoint{}}

  """
  def change_checkpoint(%Checkpoint{} = checkpoint, attrs \\ %{}) do
    Checkpoint.changeset(checkpoint, attrs)
  end
end
