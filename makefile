.PHONY: dev migrate

dev:
	npm run dev -w @app/server & npm run dev -w @app/client & wait

migrate:
	npm -w @app/server run migrate
