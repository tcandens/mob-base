defmodule MobBase.SyncServiceTest do
  use MobBase.DataCase

  alias MobBase.SyncService

  describe "patches" do
    alias MobBase.SyncService.Patch

    import MobBase.SyncServiceFixtures

    @invalid_attrs %{client_id: nil, id: nil, op: nil, path: nil, value: nil}

    test "list_patches/0 returns all patches" do
      patch = patch_fixture()
      assert SyncService.list_patches() == [patch]
    end

    test "get_patch!/1 returns the patch with given id" do
      patch = patch_fixture()
      assert SyncService.get_patch!(patch.id) == patch
    end

    test "create_patch/1 with valid data creates a patch" do
      valid_attrs = %{client_id: "some client_id", id: "some id", op: "some op", path: "some path", value: "some value"}

      assert {:ok, %Patch{} = patch} = SyncService.create_patch(valid_attrs)
      assert patch.client_id == "some client_id"
      assert patch.id == "some id"
      assert patch.op == "some op"
      assert patch.path == "some path"
      assert patch.value == "some value"
    end

    test "create_patch/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = SyncService.create_patch(@invalid_attrs)
    end

    test "update_patch/2 with valid data updates the patch" do
      patch = patch_fixture()
      update_attrs = %{client_id: "some updated client_id", id: "some updated id", op: "some updated op", path: "some updated path", value: "some updated value"}

      assert {:ok, %Patch{} = patch} = SyncService.update_patch(patch, update_attrs)
      assert patch.client_id == "some updated client_id"
      assert patch.id == "some updated id"
      assert patch.op == "some updated op"
      assert patch.path == "some updated path"
      assert patch.value == "some updated value"
    end

    test "update_patch/2 with invalid data returns error changeset" do
      patch = patch_fixture()
      assert {:error, %Ecto.Changeset{}} = SyncService.update_patch(patch, @invalid_attrs)
      assert patch == SyncService.get_patch!(patch.id)
    end

    test "delete_patch/1 deletes the patch" do
      patch = patch_fixture()
      assert {:ok, %Patch{}} = SyncService.delete_patch(patch)
      assert_raise Ecto.NoResultsError, fn -> SyncService.get_patch!(patch.id) end
    end

    test "change_patch/1 returns a patch changeset" do
      patch = patch_fixture()
      assert %Ecto.Changeset{} = SyncService.change_patch(patch)
    end
  end

  describe "checkpoints" do
    alias MobBase.SyncService.Checkpoint

    import MobBase.SyncServiceFixtures

    @invalid_attrs %{hash: nil}

    test "list_checkpoints/0 returns all checkpoints" do
      checkpoint = checkpoint_fixture()
      assert SyncService.list_checkpoints() == [checkpoint]
    end

    test "get_checkpoint!/1 returns the checkpoint with given id" do
      checkpoint = checkpoint_fixture()
      assert SyncService.get_checkpoint!(checkpoint.id) == checkpoint
    end

    test "create_checkpoint/1 with valid data creates a checkpoint" do
      valid_attrs = %{hash: "some hash"}

      assert {:ok, %Checkpoint{} = checkpoint} = SyncService.create_checkpoint(valid_attrs)
      assert checkpoint.hash == "some hash"
    end

    test "create_checkpoint/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = SyncService.create_checkpoint(@invalid_attrs)
    end

    test "update_checkpoint/2 with valid data updates the checkpoint" do
      checkpoint = checkpoint_fixture()
      update_attrs = %{hash: "some updated hash"}

      assert {:ok, %Checkpoint{} = checkpoint} = SyncService.update_checkpoint(checkpoint, update_attrs)
      assert checkpoint.hash == "some updated hash"
    end

    test "update_checkpoint/2 with invalid data returns error changeset" do
      checkpoint = checkpoint_fixture()
      assert {:error, %Ecto.Changeset{}} = SyncService.update_checkpoint(checkpoint, @invalid_attrs)
      assert checkpoint == SyncService.get_checkpoint!(checkpoint.id)
    end

    test "delete_checkpoint/1 deletes the checkpoint" do
      checkpoint = checkpoint_fixture()
      assert {:ok, %Checkpoint{}} = SyncService.delete_checkpoint(checkpoint)
      assert_raise Ecto.NoResultsError, fn -> SyncService.get_checkpoint!(checkpoint.id) end
    end

    test "change_checkpoint/1 returns a checkpoint changeset" do
      checkpoint = checkpoint_fixture()
      assert %Ecto.Changeset{} = SyncService.change_checkpoint(checkpoint)
    end
  end
end
