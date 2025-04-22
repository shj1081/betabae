.PHONY: up down down-v restart dev install build clean \
        prisma-init prisma-generate prisma-migrate

# Docker commands
up:
	docker-compose -f infra-dev/docker-compose.yaml up -d

down:
	docker-compose -f infra-dev/docker-compose.yaml down

down-v:
	docker-compose -f infra-dev/docker-compose.yaml down -v

reset: down up

# NestJS backend path helper
BACKEND_PATH=backend

# NestJS commands
install:
	cd $(BACKEND_PATH) && yarn install

dev:
	cd $(BACKEND_PATH) && yarn start:dev

build:
	cd $(BACKEND_PATH) && yarn build

# Prisma commands
prisma-generate:
	cd $(BACKEND_PATH) && yarn prisma:generate

prisma-migrate:
	cd $(BACKEND_PATH) && yarn prisma:migrate


# Clean up
clean:
	docker-compose -f infra-dev/docker-compose.yaml down -v
	rm -rf $(BACKEND_PATH)/dist
	rm -rf $(BACKEND_PATH)/node_modules
	rm -rf $(BACKEND_PATH)/src/infra/prisma/migrations

# local one shot run
fast-setup:
	make up
	make install
	make prisma-migrate
	make dev

# Frontend (ui) commands
UI_PATH=ui

ui-install:
	cd $(UI_PATH) && npm install

ui-start:
	cd $(UI_PATH) && npm run start

ui-web:
	cd $(UI_PATH) && npm run web

ui-android:
	cd $(UI_PATH) && npm run android

ui-ios:
	cd $(UI_PATH) && npm run ios

ui-lint:
	cd $(UI_PATH) && npm run lint

ui-test:
	cd $(UI_PATH) && npm run test

ui-reset:
	cd $(UI_PATH) && npm run reset-project