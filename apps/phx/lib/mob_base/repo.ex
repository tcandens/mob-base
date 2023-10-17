defmodule MobBase.Repo do
  use Ecto.Repo,
    otp_app: :mob_base,
    adapter: Ecto.Adapters.SQLite3
end
