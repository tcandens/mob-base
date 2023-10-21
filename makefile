.PHONY: dev_client dev_server dev migrate
	murmur

dev_client:
	npm -w @app/client run dev

dev_server:
	(cd apps/phx && iex -S mix phx.server)

dev:
	make dev_client & make dev_server & wait

migrate:
	(cd apps/phx && mix ecto.migrate)

murmur:
	(node --loader ts-node/esm ./packages/mob-base/src/murmur.ts) && (elixir apps/phx/lib/new_murmur.ex)

