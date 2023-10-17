defmodule MobBaseWeb.SyncChannel do
  @moduledoc """
  The SyncChannel context.
  """
  use MobBaseWeb, :channel

  @impl true
  def join("sync:" <> user_id, payload, socket) do
    if authorized?(payload) do
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  @impl true
  def handle_in("sync:push", _payload, socket) do
    state = %{"patches" => [], "hash" => ""}
    {:reply, {:ok, state}, socket}
  end

  @impl true
  def handle_in("sync:pull", payload, socket) do
    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end

  def handle_in("patch:out", payload, socket) do
    broadcast(socket, "patch:in", payload)
    {:noreply, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
