.PHONY: dev

dev:
	npm run dev -w @app/server & npm run dev -w @app/client & wait
